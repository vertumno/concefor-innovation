// Interface ÚNICA de acesso a dados do app (v1: SQLite local via better-sqlite3).
//
// REGRA DE OURO: o resto do app nunca importa o driver direto — só este módulo.
// É o que mantém barata uma futura volta ao Postgres: troca-se a implementação aqui
// e a superfície (getSessions, …) fica igual. Ver spec/proximos-passos.md (E1).
//
// SERVER-ONLY: usa `fs` e binário nativo (better-sqlite3). Não pode ser importado
// por código de cliente ("use client"). A UI fala com o banco via /api/* (lib/sessions.ts).

import Database from "better-sqlite3";
import { readFileSync } from "node:fs";
import { mkdirSync } from "node:fs";
import { createHash, randomUUID } from "node:crypto";
import { dirname, join } from "node:path";
import type { Session, Speaker } from "./types";
import { emptyCounts, type ReactionCounts, type ReactionKind } from "./reactions";
import type {
  Poll,
  PollMode,
  PollResponse,
  PollResponseStatus,
} from "./polls";

const DEFAULT_PATH = "./data/concefor.db";

// Singleton: em dev o hot-reload reimporta o módulo; guardamos a conexão no
// globalThis para não abrir um punhado de handles no mesmo arquivo.
type DbGlobal = { conceforDb?: Database.Database };
const g = globalThis as unknown as DbGlobal;

function open(): Database.Database {
  const file = process.env.DATABASE_PATH || DEFAULT_PATH;
  mkdirSync(dirname(file), { recursive: true }); // better-sqlite3 cria o arquivo, não a pasta
  const db = new Database(file);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  // Schema idempotente (create table if not exists): seguro aplicar a cada boot.
  db.exec(readFileSync(join(process.cwd(), "db", "schema.sql"), "utf8"));
  migrar(db);
  return db;
}

// Recupera conexões do formato antigo, que guardava apenas o aparelho de
// origem. Além do boot, roda após cada login: a associação aparelho→pessoa
// pode ter sido recriada depois que a migração inicial já havia passado.
function repairLegacyConnections(db: Database.Database, attendeeId?: number): void {
  const attendeeFilter = attendeeId === undefined
    ? ""
    : `and exists (select 1 from identities owner
                    where owner.client_id = timeline_events.client_id
                      and owner.attendee_id = ?)`;
  db.prepare(
    `update timeline_events
        set payload = json_set(payload, '$.de',
              (select i.attendee_id from identities i
                where i.client_id = timeline_events.client_id))
      where tipo = 'connection'
        and json_extract(payload, '$.de') is null
        and exists (select 1 from identities i
                     where i.client_id = timeline_events.client_id)
        ${attendeeFilter}`,
  ).run(...(attendeeId === undefined ? [] : [attendeeId]));

  db.exec(
    `insert into timeline_events (id, tipo, session_id, ts, payload, client_id)
     select lower(hex(randomblob(16))), 'connection', null, e.ts,
            json_object('attendeeId', json_extract(e.payload, '$.de'),
                        'de',         json_extract(e.payload, '$.attendeeId'),
                        'recebida',   json('true')),
            null
       from timeline_events e
      where e.tipo = 'connection'
        and json_extract(e.payload, '$.de') is not null
        and not exists (
              select 1 from timeline_events x
               where x.tipo = 'connection'
                 and json_extract(x.payload, '$.de')         = json_extract(e.payload, '$.attendeeId')
                   and json_extract(x.payload, '$.attendeeId') = json_extract(e.payload, '$.de'))`,
  );
}

// Migrações idempotentes de DADOS (o DDL vive no schema.sql, que já é "if not
// exists"). Rodam a cada boot e não fazem nada quando já foram aplicadas.
function migrar(db: Database.Database): void {
  // 07/08: compartilhamento ganhou controles independentes por campo. Bancos já
  // existentes precisam receber as colunas; o schema cobre bases novas.
  const profileCols = new Set(
    (db.prepare("pragma table_info(attendee_profile)").all() as { name: string }[]).map(
      (c) => c.name,
    ),
  );
  const profileDefs: Record<string, string> = {
    telefone_pais: "text not null default '55'",
    share_email: "integer not null default 1",
    share_telefone: "integer not null default 1",
    share_instagram: "integer not null default 1",
  };
  for (const [col, definition] of Object.entries(profileDefs)) {
    if (!profileCols.has(col)) {
      db.exec(`alter table attendee_profile add column ${col} ${definition}`);
    }
  }

  repairLegacyConnections(db);
}

export function getDb(): Database.Database {
  if (!g.conceforDb) g.conceforDb = open();
  return g.conceforDb;
}

// Regra do app (decisão de 04/08): só inscrito CONFIRMADO no Even3 participa —
// entra, aparece no mapa de Pessoas e pode ser conectado. Quem só se inscreveu
// (confirmação pendente) não é público do evento e ficaria como bolinha morta
// no mosaico. `confirmado` vem do sync (a.confirmed do Even3) e pode ser NULL
// em linhas antigas — daí o coalesce.
const confirmadoSql = (col = "confirmado") => `coalesce(${col}, 0) = 1`;

// ─────────────────────── Fotos via proxy com cache ───────────────────────
// As fotos vêm do CDN do Even3 e as <img> apontavam direto pra lá: lento na
// rede do evento e sem cache. Toda foto servida pela API vira /api/foto?h=<sha1
// da URL> — o proxy baixa uma vez, guarda em disco e serve local (ver a rota).
// Content-addressed de propósito: (1) foto trocada no Even3 = URL nova = hash
// novo, sem cache velho; (2) o hash é impossível de enumerar, então quem não
// recebeu a foto pela API (ex.: attendee não conectado) não a acessa por id.

export function fotoProxy(url: string | null): string | null {
  if (!url || !/^https?:\/\//i.test(url)) return url; // demo/local: segue direto
  return `/api/foto?h=${createHash("sha1").update(url).digest("hex")}`;
}

// hash → URL real, para a rota /api/foto. Recarrega o mapa quando não acha
// (o re-sync do Even3 pode ter trocado as URLs no meio do caminho).
type FotoMapGlobal = { conceforFotoMap?: Map<string, string> };
const gFoto = globalThis as unknown as FotoMapGlobal;

export function fotoUrlByHash(h: string): string | null {
  const build = (): Map<string, string> => {
    const m = new Map<string, string>();
    const db = getDb();
    const rows = [
      ...(db.prepare("select foto from attendees where foto is not null").all() as { foto: string }[]),
      ...(db.prepare("select foto from speakers where foto is not null").all() as { foto: string }[]),
    ];
    for (const { foto } of rows) {
      if (/^https?:\/\//i.test(foto)) m.set(createHash("sha1").update(foto).digest("hex"), foto);
    }
    gFoto.conceforFotoMap = m;
    return m;
  };
  let m = gFoto.conceforFotoMap ?? build();
  if (!m.has(h)) m = build();
  return m.get(h) ?? null;
}

// ─────────────────────────── Sessões ───────────────────────────

type SessionRow = {
  id: string;
  titulo: string;
  descricao: string | null;
  sala: string | null;
  eixo: string | null;
  palestrante: string | null;
  inicio: string;
  fim: string | null;
};

// Programação completa, ordenada pela linha do tempo, com palestrantes embutidos.
export function getSessions(): Session[] {
  const db = getDb();
  const rows = db
    .prepare(`select id, titulo, descricao, sala, eixo, palestrante, inicio, fim
              from sessions order by inicio asc`)
    .all() as SessionRow[];

  const speakersDe = db.prepare(
    `select sp.id, sp.nome, sp.titulo, sp.instituicao, sp.bio, sp.foto
       from speakers sp
       join session_speakers ss on ss.speaker_id = sp.id
      where ss.session_id = ?
      order by sp.nome asc`,
  );

  return rows.map((r) => {
    const speakers = (speakersDe.all(r.id) as Speaker[]).map((s) => ({
      ...s,
      foto: fotoProxy(s.foto),
    }));
    return {
      ...r,
      speakerIds: speakers.map((s) => s.id),
      speakers,
    };
  });
}

// Todos os palestrantes (tela Pessoas). bio/foto podem vir nulos — a UI trata.
export function getSpeakers(): Speaker[] {
  return (
    getDb()
      .prepare(
        `select id, nome, titulo, instituicao, bio, foto
           from speakers order by nome asc`,
      )
      .all() as Speaker[]
  ).map((s) => ({ ...s, foto: fotoProxy(s.foto) }));
}

export function sessionExists(id: string): boolean {
  return Boolean(getDb().prepare("select 1 from sessions where id = ?").get(id));
}

// ─────────────────────────── Reações (E2) ───────────────────────────
// Toda reação é um registro na linha do tempo (tipo='reaction'). attendeeId
// associa a interação à inscrição; client_id preserva a identidade visual do
// aparelho e nunca funciona como credencial.

export function insertReaction(
  sessionId: string,
  reaction: ReactionKind,
  clientId: string | null,
  attendeeId: number | null,
): void {
  getDb()
    .prepare(
      `insert into timeline_events (id, tipo, session_id, ts, payload, client_id)
       values (?, 'reaction', ?, ?, ?, ?)`,
    )
    .run(
      randomUUID(),
      sessionId,
      new Date().toISOString(),
      JSON.stringify({ reaction, ...(attendeeId ? { attendeeId } : {}) }),
      clientId,
    );
}

// Acúmulo por minuto e tipo — o telão desenha a linha do tempo da sessão com
// isso (leitura pura). `minuto` é o ts UTC cortado no minuto ("2026-08-18T12:31");
// o cliente devolve o "Z" ao interpretar.
export function getReactionTimeline(
  sessionId: string,
): { minuto: string; kind: string; n: number }[] {
  return getDb()
    .prepare(
      `select substr(ts, 1, 16) as minuto,
              json_extract(payload, '$.reaction') as kind, count(*) as n
         from timeline_events
        where tipo = 'reaction' and session_id = ?
        group by minuto, kind
        order by minuto asc`,
    )
    .all(sessionId) as { minuto: string; kind: string; n: number }[];
}

// Contagem agregada por tipo, para a própria tela da sessão.
export function getReactionCounts(sessionId: string): ReactionCounts {
  const rows = getDb()
    .prepare(
      `select json_extract(payload, '$.reaction') as k, count(*) as n
         from timeline_events
        where tipo = 'reaction' and session_id = ?
        group by k`,
    )
    .all(sessionId) as { k: string; n: number }[];
  const counts = emptyCounts();
  for (const { k, n } of rows) if (k in counts) counts[k as ReactionKind] = n;
  return counts;
}

// ─────────────────────── Admin da programação (R9) ───────────────────────
// Ajustes de última hora (atraso, troca de sala). ATENÇÃO: em sessões vindas
// do Even3, o próximo re-sync sobrescreve horários (Even3 é a espinha) — o
// caminho bom é corrigir lá e re-sincronizar; isto é o curativo imediato.

export function updateSessionAdmin(
  id: string,
  campos: { inicio?: string; fim?: string | null; sala?: string | null },
): boolean {
  const sets: string[] = [];
  const vals: unknown[] = [];
  if (campos.inicio !== undefined) {
    sets.push("inicio = ?");
    vals.push(campos.inicio);
  }
  if (campos.fim !== undefined) {
    sets.push("fim = ?");
    vals.push(campos.fim);
  }
  if (campos.sala !== undefined) {
    sets.push("sala = ?");
    vals.push(campos.sala);
  }
  if (!sets.length) return false;
  const r = getDb()
    .prepare(`update sessions set ${sets.join(", ")} where id = ?`)
    .run(...vals, id);
  return r.changes > 0;
}

// ─── Bloco ao vivo criado do próprio /admin (teste ou ação) ───
// Para experimentar com gente na sala sem depender de rodar script no servidor
// (era `seed:validacao` por docker run) e, desde 04/08, também para abrir uma
// ação ao vivo fora da programação do Even3 (enquete/dinâmica de última hora) —
// daí a descrição ser editável. Nasce JÁ no ar, então o Ao Vivo cai direto na
// tela de reagir. Prefixo `demo-` = descartável: sobrevive ao re-sync do Even3
// (que só mexe nos `even3-`) e pode ser apagado por aqui.
const PREFIXO_TESTE = "demo-";
const DESCRICAO_PADRAO_TESTE =
  "Bloco criado pelo /admin para experimentar o app com o público presente.";

// ISO com o fuso de Brasília fixo, como o sync e os seeds. O container pode
// estar em UTC; sem isso, um bloco criado à noite cairia no dia seguinte da
// agenda.
function agoraEmBrasilia(deslocamentoMin = 0): string {
  const t = Date.now() + deslocamentoMin * 60_000 - 3 * 60 * 60_000;
  return `${new Date(t).toISOString().slice(0, 19)}-03:00`;
}

export function insertBlocoTeste({
  titulo,
  minutos,
  sala = null,
  descricao = null,
}: {
  titulo: string;
  minutos: number;
  sala?: string | null;
  descricao?: string | null;
}): { id: string; inicio: string; fim: string } {
  const id = `${PREFIXO_TESTE}teste-${Date.now().toString(36)}`;
  // Começa um minuto atrás para já contar como "no ar" no primeiro carregamento.
  const inicio = agoraEmBrasilia(-1);
  const fim = agoraEmBrasilia(minutos);
  getDb()
    .prepare(
      `insert into sessions (id, titulo, descricao, sala, eixo, palestrante, inicio, fim)
       values (?, ?, ?, ?, 'Teste', null, ?, ?)`,
    )
    .run(id, titulo, descricao || DESCRICAO_PADRAO_TESTE, sala, inicio, fim);
  return { id, inicio, fim };
}

// Só apaga o que foi criado para teste — sessão do Even3 nunca some por aqui.
// Leva junto as reações e perguntas do bloco: são de brincadeira e, sem isso,
// entrariam no relatório final como "(sessão removida)".
export function deleteSessaoTeste(id: string): boolean {
  if (!id.startsWith(PREFIXO_TESTE)) return false;
  const db = getDb();
  return db.transaction(() => {
    db.prepare("delete from timeline_events where session_id = ?").run(id);
    return db.prepare("delete from sessions where id = ?").run(id).changes > 0;
  })();
}

export function isSessaoTeste(id: string): boolean {
  return id.startsWith(PREFIXO_TESTE);
}

// ─────────────────────── Relatório pós-evento (R9) ───────────────────────
// Tudo derivado de timeline_events + sessions — "sem trabalho manual: é só
// ler a tabela" (spec §5). A página /admin/relatorio imprime/exporta em PDF.

export type Report = {
  geradoEm: string;
  totais: {
    inscritos: number;
    logados: number;
    dispositivos: number;
    reacoes: number;
    perguntas: number;
    votosEmPerguntas: number;
    conexoes: number;
  };
  reacoesPorTipo: { kind: string; n: number }[];
  ranking: {
    titulo: string;
    inicio: string;
    sala: string | null;
    reacoes: number;
    perguntas: number;
  }[];
  picos: { ts: string; titulo: string; n: number }[]; // top momentos (reações/min)
};

export function getReport(): Report {
  const db = getDb();
  const n = (sql: string) => (db.prepare(sql).get() as { n: number }).n;

  const reacoesPorTipo = db
    .prepare(
      `select json_extract(payload, '$.reaction') as kind, count(*) as n
         from timeline_events where tipo = 'reaction' group by kind order by n desc`,
    )
    .all() as Report["reacoesPorTipo"];

  const ranking = db
    .prepare(
      `select s.titulo, s.inicio, s.sala,
              sum(case when e.tipo = 'reaction' then 1 else 0 end) as reacoes,
              sum(case when e.tipo = 'question' then 1 else 0 end) as perguntas
         from sessions s
         join timeline_events e on e.session_id = s.id
        group by s.id
        order by reacoes desc, perguntas desc`,
    )
    .all() as Report["ranking"];

  const picos = db
    .prepare(
      `select substr(e.ts, 1, 16) as ts, coalesce(s.titulo, '(sessão removida)') as titulo,
              count(*) as n
         from timeline_events e
         left join sessions s on s.id = e.session_id
        where e.tipo = 'reaction'
        group by substr(e.ts, 1, 16), e.session_id
        order by n desc
        limit 5`,
    )
    .all() as Report["picos"];

  return {
    geradoEm: new Date().toISOString(),
    totais: {
      // Inscritos = confirmados: é o público que o app atende (ver confirmadoSql).
      inscritos: n(`select count(*) as n from attendees where ${confirmadoSql()}`),
      logados: n("select count(distinct attendee_id) as n from identities"),
      dispositivos: n(
        "select count(distinct client_id) as n from timeline_events where client_id is not null",
      ),
      reacoes: n("select count(*) as n from timeline_events where tipo = 'reaction'"),
      perguntas: n("select count(*) as n from timeline_events where tipo = 'question'"),
      votosEmPerguntas: n(
        "select count(*) as n from timeline_events where tipo = 'question_vote'",
      ),
      // Conta o par, não os dois lados: desde 04/08 conectar grava ida e volta.
      conexoes: n(
        `select count(*) as n from timeline_events
          where tipo = 'connection' and json_extract(payload, '$.recebida') is null`,
      ),
    },
    reacoesPorTipo,
    ranking,
    picos,
  };
}

// ─────────────────────── Login / identidade (R7) ───────────────────────
// Associação client_id ↔ inscrito, criada no login com consentimento (LGPD).
// PII nunca sai do servidor: as rotas públicas só devolvem o primeiro nome.

// nº do ingresso + segundo fator: 4 primeiros dígitos do CPF (decisão de 20/07)
// OU o e-mail da inscrição, no mesmo campo (decisão de 29–30/07 — a premissa
// "todo inscrito tem CPF no cadastro" caiu em 29/07).
//
// Devolve o inscrito mesmo quando NÃO confirmado (04/08: só confirmado entra —
// ver confirmadoSql) para a rota de login poder dizer o motivo em vez de um
// genérico "não encontramos".
export function findAttendeeByLogin(
  checkinCode: string,
  segundoFator: string,
): { id: number; nome: string; confirmado: boolean } | null {
  const db = getDb();
  const code = checkinCode.trim();
  const fator = segundoFator.trim();

  const row = (
    fator.includes("@")
      ? db
          .prepare(
            `select id, nome, coalesce(confirmado, 0) as confirmado from attendees
              where checkin_code = ? and email is not null
                and lower(trim(email)) = lower(?)`,
          )
          .get(code, fator)
      : db
          .prepare(
            `select id, nome, coalesce(confirmado, 0) as confirmado from attendees
              where checkin_code = ? and documento is not null
                and substr(documento, 1, 4) = ?`,
          )
          .get(code, fator.replace(/\D/g, ""))
  ) as { id: number; nome: string; confirmado: number } | undefined;

  return row
    ? { id: row.id, nome: nomeBonito(row.nome), confirmado: Boolean(row.confirmado) }
    : null;
}

export function upsertIdentity(clientId: string, attendeeId: number, nome: string): void {
  const db = getDb();
  db.transaction(() => {
    db.prepare(
      `insert into identities (client_id, attendee_id, nome, consent_ts)
       values (?, ?, ?, ?)
       on conflict(client_id) do update set
         attendee_id = excluded.attendee_id, nome = excluded.nome,
         consent_ts = excluded.consent_ts`,
    )
    .run(clientId, attendeeId, nome, new Date().toISOString());
    repairLegacyConnections(db, attendeeId);
  })();
}

export function getIdentity(clientId: string): { nome: string } | null {
  const row = getDb()
    .prepare("select nome from identities where client_id = ?")
    .get(clientId) as { nome: string } | undefined;
  return row ?? null;
}

export function deleteIdentity(clientId: string): void {
  getDb().prepare("delete from identities where client_id = ?").run(clientId);
}

// ─────────────────────── Sessão autenticada segura ───────────────────────

export type AuthSession = {
  attendeeId: number;
  clientId: string;
  nome: string;
  expiresAt: string;
};

export function insertAuthSession(args: {
  tokenHash: string;
  attendeeId: number;
  clientId: string;
  nome: string;
  expiresAt: string;
}): void {
  const now = new Date().toISOString();
  const db = getDb();
  db.prepare("delete from auth_sessions where expires_at <= ?").run(now);
  db.prepare(
    `insert into auth_sessions
       (token_hash, attendee_id, client_id, nome, created_at, expires_at, last_seen_at)
     values (?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    args.tokenHash,
    args.attendeeId,
    args.clientId,
    args.nome,
    now,
    args.expiresAt,
    now,
  );
}

export function getAuthSession(tokenHash: string): AuthSession | null {
  const now = new Date().toISOString();
  const db = getDb();
  const row = db
    .prepare(
      `select attendee_id as attendeeId, client_id as clientId, nome,
              expires_at as expiresAt
         from auth_sessions
        where token_hash = ? and expires_at > ?`,
    )
    .get(tokenHash, now) as AuthSession | undefined;
  if (!row) return null;
  db.prepare("update auth_sessions set last_seen_at = ? where token_hash = ?").run(now, tokenHash);
  return row;
}

export function deleteAuthSession(tokenHash: string): AuthSession | null {
  const sessao = getAuthSession(tokenHash);
  getDb().prepare("delete from auth_sessions where token_hash = ?").run(tokenHash);
  return sessao;
}

// ─────────────────────── Conexões / networking (Pessoas) ───────────────────────
// "Mapa de bolinhas" (ideia de 20/07): cada inscrito é uma bolinha; escanear o
// QR (ou digitar o nº do ingresso) do outro cria a conexão e acende a bolinha.
// Conexão = tipo='connection' na linha do tempo, payload
// {"de": meuAttendeeId, "attendeeId": doOutro} — a conexão segue a PESSOA, e
// por isso sobrevive a trocar de aparelho, reinstalar o PWA ou limpar o
// navegador. Contato completo só aparece DEPOIS de conectar.

export type Participante = {
  id: number;
  iniciais: string;
  nome: string; // primeiro nome (público no app — as bolinhas)
  nomeCompleto?: string; // só para conexões
  email?: string; // só para conexões
  foto?: string; // só para conexões (foto da inscrição Even3)
  categoria?: string; // só para conexões (etiqueta curta)
  telefone?: string; // só para conexões (preenchido pela própria pessoa)
  instagram?: string; // idem
  conectado: boolean;
};

// As categorias oficiais do Even3 são frases longas — no app viram etiqueta.
export function categoriaCurta(categoria: string | null): string | null {
  if (!categoria) return null;
  const c = categoria.trim();
  if (/^servidores do cefor/i.test(c)) return "Equipe Cefor/NTEs";
  if (/^estudantes?$/i.test(c)) return "Estudante";
  if (/^profissionais da educa/i.test(c)) return "Profissional da Educação";
  if (/^coordenadores de polo/i.test(c)) return "Coordenação UAB/UnAC";
  if (/^público em geral$/i.test(c)) return "Público em geral";
  return c.split(/[,:]/)[0].slice(0, 40);
}

// ─── Perfil preenchido pelo próprio participante (contato para conexões) ───

export type Perfil = {
  telefonePais: string;
  telefone: string | null;
  instagram: string | null;
  shareEmail: boolean;
  shareTelefone: boolean;
  shareInstagram: boolean;
};

export function getPerfil(attendeeId: number): Perfil {
  const row = getDb()
    .prepare(
      `select telefone_pais as telefonePais, telefone, instagram,
              share_email as shareEmail,
              share_telefone as shareTelefone,
              share_instagram as shareInstagram
         from attendee_profile where attendee_id = ?`,
    )
    .get(attendeeId) as
    | {
        telefonePais: string;
        telefone: string | null;
        instagram: string | null;
        shareEmail: number;
        shareTelefone: number;
        shareInstagram: number;
      }
    | undefined;
  return row
    ? {
        telefonePais: row.telefonePais || "55",
        telefone: row.telefone,
        instagram: row.instagram,
        shareEmail: Boolean(row.shareEmail),
        shareTelefone: Boolean(row.shareTelefone),
        shareInstagram: Boolean(row.shareInstagram),
      }
    : {
        telefonePais: "55",
        telefone: null,
        instagram: null,
        shareEmail: true,
        shareTelefone: true,
        shareInstagram: true,
      };
}

export function setPerfil(attendeeId: number, p: Perfil): void {
  getDb()
    .prepare(
      `insert into attendee_profile
         (attendee_id, telefone_pais, telefone, instagram, share_email, share_telefone,
          share_instagram, updated_at)
       values (?, ?, ?, ?, ?, ?, ?, ?)
       on conflict(attendee_id) do update set
          telefone_pais = excluded.telefone_pais,
          telefone = excluded.telefone, instagram = excluded.instagram,
          share_email = excluded.share_email,
          share_telefone = excluded.share_telefone,
          share_instagram = excluded.share_instagram,
          updated_at = excluded.updated_at`,
    )
    .run(
      attendeeId,
      p.telefonePais,
      p.telefone,
      p.instagram,
      p.shareEmail ? 1 : 0,
      p.shareTelefone ? 1 : 0,
      p.shareInstagram ? 1 : 0,
      new Date().toISOString(),
    );
}

function iniciaisDe(nome: string): string {
  const p = nome.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase();
}

// "ANTONIO DA SILVA" → "Antonio da Silva" (cadastros do Even3 vêm em caixa
// alta). Só mexe quando o nome está TODO maiúsculo — não "corrige" quem
// escreveu do próprio jeito.
const MINUSCULAS = new Set(["da", "de", "do", "das", "dos", "e"]);
export function nomeBonito(nome: string): string {
  const t = nome.trim();
  if (t !== t.toUpperCase()) return t;
  return t
    .toLowerCase()
    .split(/\s+/)
    .map((w, i) =>
      i > 0 && MINUSCULAS.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1),
    )
    .join(" ");
}

export function attendeeByCheckin(code: string): { id: number; nome: string } | null {
  const row = getDb()
    .prepare(
      `select id, nome from attendees
        where checkin_code = ? and ${confirmadoSql()}`,
    )
    .get(code.trim()) as { id: number; nome: string } | undefined;
  return row ? { ...row, nome: nomeBonito(row.nome) } : null;
}

// true se criou; false se já existia (idempotente).
//
// A conexão é da PESSOA (`payload.de`), não do aparelho: `client_id` fica só
// como rastro de onde foi feita. Amarrar ao dispositivo (como era até 04/08)
// perdia o mosaico quando o localStorage sumia — e no iOS o PWA instalado tem
// storage próprio, separado do Safari, então bastava abrir pelo ícone.
//
// E é BILATERAL (decisão de 04/08): quem escaneia e quem teve o crachá
// escaneado ficam conectados. As duas pessoas estavam frente a frente e
// trocaram contato de fato — só uma delas ter feito o gesto é detalhe de
// interface. O lado que não escaneou fica marcado com `recebida: true`, para o
// relatório saber quem puxou a conversa.
export function insertConnection(
  deAttendeeId: number,
  paraAttendeeId: number,
  clientId: string,
): boolean {
  const db = getDb();
  const existe = db.prepare(
    `select 1 from timeline_events
      where tipo = 'connection'
        and json_extract(payload, '$.de') = ?
        and json_extract(payload, '$.attendeeId') = ?`,
  );
  const inserir = db.prepare(
    `insert into timeline_events (id, tipo, session_id, ts, payload, client_id)
     values (?, 'connection', null, ?, ?, ?)`,
  );
  const ts = new Date().toISOString();

  const criar = (de: number, para: number, recebida: boolean): boolean => {
    if (existe.get(de, para)) return false;
    inserir.run(
      randomUUID(),
      ts,
      JSON.stringify({ attendeeId: para, de, ...(recebida ? { recebida: true } : {}) }),
      // O aparelho é de quem escaneou; do outro lado não há aparelho envolvido.
      recebida ? null : clientId,
    );
    return true;
  };

  return db.transaction(() => {
    const nova = criar(deAttendeeId, paraAttendeeId, false);
    criar(paraAttendeeId, deAttendeeId, true); // volta: idempotente por si só
    return nova;
  })();
}

// Desfaz a conexão NOS DOIS SENTIDOS (decisão de 05/08): a conexão é o par de
// pessoas, não o gesto — espelho do conectar bilateral. Some do mosaico dos dois.
export function deleteConnection(a: number, b: number): boolean {
  const r = getDb()
    .prepare(
      `delete from timeline_events
        where tipo = 'connection'
          and (
            (json_extract(payload, '$.de') = ? and json_extract(payload, '$.attendeeId') = ?)
            or (json_extract(payload, '$.de') = ? and json_extract(payload, '$.attendeeId') = ?)
            -- Formato anterior: a origem estava apenas em client_id. Apagamos
            -- todas as identidades conhecidas dos dois participantes para a
            -- migração de login não reconstruir uma conexão já desfeita.
            or (json_extract(payload, '$.de') is null
                and json_extract(payload, '$.attendeeId') = ?
                and client_id in (select client_id from identities where attendee_id = ?))
            or (json_extract(payload, '$.de') is null
                and json_extract(payload, '$.attendeeId') = ?
                and client_id in (select client_id from identities where attendee_id = ?))
          )`,
    )
    .run(a, b, b, a, b, a, a, b);
  return r.changes > 0;
}

// Os inscritos CONFIRMADOS como bolinhas: conexões primeiro (mais recentes no
// topo, com contato completo), depois o resto em ordem alfabética (só 1º nome).
// Recebe o attendee da pessoa logada (null = anônimo, ninguém aceso).
export function getParticipantes(attendeeId: number | null): Participante[] {
  const db = getDb();
  const todos = db
    .prepare(
      `select a.id, a.nome,
              case when coalesce(p.share_email, 0) = 1 then a.email end as email,
              a.foto, a.categoria,
              case when coalesce(p.share_telefone, 0) = 1 and p.telefone is not null
                   then coalesce(p.telefone_pais, '55') || p.telefone end as telefone,
              case when coalesce(p.share_instagram, 0) = 1 then p.instagram end as instagram
         from attendees a
         left join attendee_profile p on p.attendee_id = a.id
        where ${confirmadoSql("a.confirmado")}
        order by a.nome asc`,
    )
    .all() as {
    id: number;
    nome: string;
    email: string | null;
    foto: string | null;
    categoria: string | null;
    telefone: string | null;
    instagram: string | null;
  }[];

  const ordem = new Map<number, number>(); // attendeeId → posição (0 = mais recente)
  if (attendeeId) {
    const rows = db
      .prepare(
        `select json_extract(payload, '$.attendeeId') as a from timeline_events
          where tipo = 'connection' and json_extract(payload, '$.de') = ?
          order by ts desc`,
      )
      .all(attendeeId) as { a: number }[];
    rows.forEach((r, i) => {
      if (!ordem.has(r.a)) ordem.set(r.a, i);
    });
  }

  const mk = (t: (typeof todos)[number]): Participante => {
    const conectado = ordem.has(t.id);
    const nome = nomeBonito(t.nome);
    return {
      id: t.id,
      iniciais: iniciaisDe(nome),
      nome: nome.split(/\s+/)[0],
      ...(conectado
        ? {
            nomeCompleto: nome,
            email: t.email ?? undefined,
            foto: fotoProxy(t.foto) ?? undefined,
            categoria: categoriaCurta(t.categoria) ?? undefined,
            telefone: t.telefone ?? undefined,
            instagram: t.instagram ?? undefined,
          }
        : {}),
      conectado,
    };
  };

  const conectados = todos
    .filter((t) => ordem.has(t.id))
    .sort((a, b) => ordem.get(a.id)! - ordem.get(b.id)!)
    .map(mk);
  const resto = todos.filter((t) => !ordem.has(t.id)).map(mk);
  return [...conectados, ...resto];
}

export function getIdentityAttendeeId(clientId: string): number | null {
  const row = getDb()
    .prepare("select attendee_id from identities where client_id = ?")
    .get(clientId) as { attendee_id: number } | undefined;
  return row?.attendee_id ?? null;
}

// ─────────────────────── Avisos da organização (Início) ───────────────────────
// Mão única, sem chat (spec §8/R10 — antecipado em 20/07 para diferenciar o
// Início). Como tudo: registro na linha do tempo (tipo='aviso').

export type Aviso = { id: string; texto: string; ts: string; hidden: boolean };

export function insertAviso(texto: string): string {
  const id = randomUUID();
  getDb()
    .prepare(
      `insert into timeline_events (id, tipo, session_id, ts, payload, client_id)
       values (?, 'aviso', null, ?, ?, null)`,
    )
    .run(id, new Date().toISOString(), JSON.stringify({ texto }));
  return id;
}

export function getAvisos(includeHidden = false): Aviso[] {
  const rows = getDb()
    .prepare(
      `select id, ts, json_extract(payload, '$.texto') as texto,
              coalesce(json_extract(payload, '$.hidden'), 0) as hidden
         from timeline_events
        where tipo = 'aviso'
        order by ts desc
        limit 20`,
    )
    .all() as { id: string; ts: string; texto: string; hidden: number }[];
  return rows
    .filter((r) => includeHidden || !r.hidden)
    .map((r) => ({ ...r, hidden: Boolean(r.hidden) }));
}

export function setAvisoHidden(avisoId: string, hidden: boolean): boolean {
  const r = getDb()
    .prepare(
      `update timeline_events set payload = json_set(payload, '$.hidden', ?)
        where id = ? and tipo = 'aviso'`,
    )
    .run(hidden ? 1 : 0, avisoId);
  return r.changes > 0;
}

// Ocultar tira do app mas guarda o registro; apagar some de vez — pedido de
// 30/07, para o aviso escrito errado não ficar pendurado na lista do admin.
export function deleteAviso(avisoId: string): boolean {
  const r = getDb()
    .prepare("delete from timeline_events where id = ? and tipo = 'aviso'")
    .run(avisoId);
  return r.changes > 0;
}

// ─────────────────────── Dashboard admin (R3) ───────────────────────
// Tudo derivado de timeline_events — o dashboard é só uma leitura da linha
// do tempo (mesmo modelo que alimenta app e telão; spec §5).

export type AdminStats = {
  ativosUltimaHora: number; // client_ids únicos com evento na última hora
  totalReacoes: number;
  reacoesPorSessao: { sessionId: string | null; titulo: string; n: number }[];
  reacoesPorMinuto: { minuto: string; n: number }[]; // últimos 60 min (UTC "HH:MM")
  totalPerguntas: number;
  totalInscritos: number; // confirmados no Even3 — o público do app (R7)
  totalLogados: number; // pessoas distintas que já entraram
  sessoesComJanelaAberta: string[]; // inclusive as que já terminaram (órfãs)
};

export function getAdminStats(): AdminStats {
  const db = getDb();
  const umaHoraAtras = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const ativos = db
    .prepare(
      `select count(distinct client_id) as n from timeline_events
        where ts >= ? and client_id is not null`,
    )
    .get(umaHoraAtras) as { n: number };

  const total = db
    .prepare("select count(*) as n from timeline_events where tipo = 'reaction'")
    .get() as { n: number };

  const porSessao = db
    .prepare(
      `select e.session_id as sessionId, coalesce(s.titulo, '(sessão removida)') as titulo,
              count(*) as n
         from timeline_events e
         left join sessions s on s.id = e.session_id
        where e.tipo = 'reaction'
        group by e.session_id
        order by n desc
        limit 15`,
    )
    .all() as AdminStats["reacoesPorSessao"];

  // Reações por minuto (últimos 60 min) — os picos de engajamento.
  const porMinuto = db
    .prepare(
      `select substr(ts, 12, 5) as minuto, count(*) as n
         from timeline_events
        where tipo = 'reaction' and ts >= ?
        group by substr(ts, 1, 16)
        order by ts asc`,
    )
    .all(umaHoraAtras) as AdminStats["reacoesPorMinuto"];

  const perguntas = db
    .prepare("select count(*) as n from timeline_events where tipo = 'question'")
    .get() as { n: number };

  const inscritos = db
    .prepare(`select count(*) as n from attendees where ${confirmadoSql()}`)
    .get() as { n: number };
  const logados = db
    .prepare("select count(distinct attendee_id) as n from identities")
    .get() as { n: number };

  // Janela de perguntas que ficou aberta — inclusive de sessão já encerrada.
  // Sem isso o admin só enxergava as sessões ao vivo e não tinha como fechar
  // depois que a palestra acabava (achado do teste de 30/07).
  const janelas = db
    .prepare(
      `select session_id from timeline_events e
        where tipo = 'questions_window'
          and ts = (select max(ts) from timeline_events x
                     where x.tipo = 'questions_window' and x.session_id = e.session_id)
          and json_extract(payload, '$.open') = 1`,
    )
    .all() as { session_id: string | null }[];

  return {
    ativosUltimaHora: ativos.n,
    totalReacoes: total.n,
    reacoesPorSessao: porSessao,
    reacoesPorMinuto: porMinuto,
    totalPerguntas: perguntas.n,
    totalInscritos: inscritos.n,
    totalLogados: logados.n,
    sessoesComJanelaAberta: janelas.map((j) => j.session_id).filter((s): s is string => Boolean(s)),
  };
}

// ─────────────────────── Config do telão ───────────────────────
// Mesmo padrão de questions_window: estado = último evento (tipo='telao_config'),
// sem mudar o schema. Dois ajustes que o /admin liga e desliga na hora: o painel
// "Perguntas mais votadas" e as propagandas durante uma sessão AO VIVO.

type ChaveTelao = "perguntas" | "propagandas";

// Lê o último evento QUE MENCIONA a chave, não o último evento em geral: com
// dois ajustes convivendo, desligar as propagandas gravaria um payload sem
// `perguntas` e a leitura seguinte apagaria o estado do outro botão.
function telaoFlag(chave: ChaveTelao, padrao: boolean): boolean {
  const row = getDb()
    .prepare(
      `select json_extract(payload, '$.${chave}') as v from timeline_events
        where tipo = 'telao_config' and json_extract(payload, '$.${chave}') is not null
        order by ts desc limit 1`,
    )
    .get() as { v: number | null } | undefined;
  return row ? Boolean(row.v) : padrao;
}

function setTelaoFlag(chave: ChaveTelao, valor: boolean): void {
  getDb()
    .prepare(
      `insert into timeline_events (id, tipo, session_id, ts, payload, client_id)
       values (?, 'telao_config', null, ?, ?, null)`,
    )
    .run(randomUUID(), new Date().toISOString(), JSON.stringify({ [chave]: valor }));
}

export function telaoPerguntasVisiveis(): boolean {
  return telaoFlag("perguntas", true); // padrão: exibe
}

export function setTelaoPerguntas(visiveis: boolean): void {
  setTelaoFlag("perguntas", visiveis);
}

// Só vale para sessão ao vivo. Entre as sessões o telão está ocioso e a
// divulgação aparece de qualquer jeito — é justamente o momento dela.
export function telaoPropagandasNoAoVivo(): boolean {
  return telaoFlag("propagandas", true);
}

export function setTelaoPropagandas(ligado: boolean): void {
  setTelaoFlag("propagandas", ligado);
}

// ─────────────────────── Perguntas com upvote (R4) ───────────────────────
// Tudo em timeline_events, sem mudar o schema (spec §3):
//   tipo='question'         payload {"texto": "...", "autor": "Nome", "hidden": true?}
//   tipo='question_vote'    payload {"questionId": "..."} (1 por client/pergunta)
//   tipo='questions_window' payload {"open": true|false} (estado = último evento)
//
// `autor` é FOTOGRAFADO no envio (decisão de 05/08: pergunta identificada inibe
// abuso) — não se resolve pelo client_id na leitura, porque o aparelho pode
// trocar de dono ou sair, e o nome da pergunta não pode mudar retroativamente.
// Perguntas de antes da decisão não têm autor (null) e a UI trata.

export type Question = {
  id: string;
  texto: string;
  autor: string | null;
  ts: string;
  votes: number;
  hidden: boolean;
  myVote?: boolean;
};

export function questionsWindowOpen(sessionId: string): boolean {
  const row = getDb()
    .prepare(
      `select json_extract(payload, '$.open') as open from timeline_events
        where tipo = 'questions_window' and session_id = ?
        order by ts desc limit 1`,
    )
    .get(sessionId) as { open: number | null } | undefined;
  return row ? Boolean(row.open) : false; // default: fechada (admin abre)
}

export function setQuestionsWindow(sessionId: string, open: boolean): void {
  getDb()
    .prepare(
      `insert into timeline_events (id, tipo, session_id, ts, payload, client_id)
       values (?, 'questions_window', ?, ?, ?, null)`,
    )
    .run(randomUUID(), sessionId, new Date().toISOString(), JSON.stringify({ open }));
}

export function insertQuestion(
  sessionId: string,
  texto: string,
  clientId: string | null,
  attendeeId: number,
  autor: string,
): string {
  const id = randomUUID();
  getDb()
    .prepare(
      `insert into timeline_events (id, tipo, session_id, ts, payload, client_id)
       values (?, 'question', ?, ?, ?, ?)`,
    )
    .run(
      id,
      sessionId,
      new Date().toISOString(),
      JSON.stringify({ texto, autor, attendeeId }),
      clientId,
    );
  return id;
}

// Lista ordenada por votos (desc) e chegada (asc). `attendeeId` marca "meu voto";
// `includeHidden` é só para a moderação no /admin.
export function getQuestions(
  sessionId: string,
  attendeeId: number | null,
  includeHidden = false,
): Question[] {
  const db = getDb();
  const rows = db
    .prepare(
      `select e.id, e.ts,
              json_extract(e.payload, '$.texto') as texto,
              json_extract(e.payload, '$.autor') as autor,
              coalesce(json_extract(e.payload, '$.hidden'), 0) as hidden,
              (select count(*) from timeline_events v
                where v.tipo = 'question_vote'
                  and json_extract(v.payload, '$.questionId') = e.id) as votes
         from timeline_events e
        where e.tipo = 'question' and e.session_id = ?
        order by votes desc, e.ts asc`,
    )
    .all(sessionId) as (Omit<Question, "hidden" | "myVote"> & { hidden: number })[];

  const meusVotos = attendeeId
    ? new Set(
        (
          db
            .prepare(
              `select json_extract(payload, '$.questionId') as q from timeline_events
                where tipo = 'question_vote' and session_id = ?
                  and json_extract(payload, '$.attendeeId') = ?`,
            )
            .all(sessionId, attendeeId) as { q: string }[]
        ).map((r) => r.q),
      )
    : new Set<string>();

  return rows
    .filter((r) => includeHidden || !r.hidden)
    .map((r) => ({ ...r, hidden: Boolean(r.hidden), myVote: meusVotos.has(r.id) }));
}

// Toggle: vota se não votou, retira o voto se já tinha (1 voto por pessoa).
export function toggleQuestionVote(
  sessionId: string,
  questionId: string,
  clientId: string,
  attendeeId: number,
): { voted: boolean } {
  const db = getDb();
  const existing = db
    .prepare(
      `select id from timeline_events
        where tipo = 'question_vote' and session_id = ?
          and json_extract(payload, '$.attendeeId') = ?
          and json_extract(payload, '$.questionId') = ?`,
    )
    .get(sessionId, attendeeId, questionId) as { id: string } | undefined;

  if (existing) {
    db.prepare("delete from timeline_events where id = ?").run(existing.id);
    return { voted: false };
  }
  db.prepare(
    `insert into timeline_events (id, tipo, session_id, ts, payload, client_id)
     values (?, 'question_vote', ?, ?, ?, ?)`,
  ).run(
    randomUUID(),
    sessionId,
    new Date().toISOString(),
    JSON.stringify({ questionId, attendeeId }),
    clientId,
  );
  return { voted: true };
}

export function questionExists(sessionId: string, questionId: string): boolean {
  return Boolean(
    getDb()
      .prepare("select 1 from timeline_events where id = ? and tipo = 'question' and session_id = ?")
      .get(questionId, sessionId),
  );
}

// Moderação mínima: oculta/reexibe (o registro fica na linha do tempo).
export function setQuestionHidden(questionId: string, hidden: boolean): boolean {
  const r = getDb()
    .prepare(
      `update timeline_events
          set payload = json_set(payload, '$.hidden', ?)
        where id = ? and tipo = 'question'`,
    )
    .run(hidden ? 1 : 0, questionId);
  return r.changes > 0;
}

// ─────────────────────── Enquete aberta ao vivo ───────────────────────
// A enquete e suas respostas continuam na linha do tempo:
//   tipo='poll'          payload {question,status,mode,stopwords}
//   tipo='poll_response' payload {pollId,texto,attendeeId,autor,status}
// Uma enquete ativa por vez no MVP. Resposta nasce `approved` e entra direto
// na projeção; a moderação atua por exceção, ocultando o que for inadequado.

type PollPayload = {
  question: string;
  status: "active" | "closed";
  mode: PollMode;
  stopwords: string[];
};

function pollFromRow(
  row: {
    id: string;
    sessionId: string;
    sessionTitle: string;
    ts: string;
    payload: string;
  },
  includeAll: boolean,
  attendeeId: number | null,
  loadResponses = true,
): Poll {
  const payload = JSON.parse(row.payload) as PollPayload;
  const responseRows = loadResponses
    ? getDb()
        .prepare(
          `select id, ts,
                  json_extract(payload, '$.texto') as texto,
                  json_extract(payload, '$.autor') as autor,
                  coalesce(json_extract(payload, '$.status'), 'pending') as status,
                  json_extract(payload, '$.attendeeId') as attendeeId
             from timeline_events
            where tipo = 'poll_response'
              and json_extract(payload, '$.pollId') = ?
            order by ts desc`,
        )
        .all(row.id) as (PollResponse & { attendeeId: number | null })[]
    : [];
  const publicResponses = responseRows.filter((r) => includeAll || r.status === "approved");
  return {
    id: row.id,
    sessionId: row.sessionId,
    sessionTitle: row.sessionTitle,
    question: payload.question,
    status: payload.status,
    mode: payload.mode,
    stopwords: Array.isArray(payload.stopwords) ? payload.stopwords : [],
    ts: row.ts,
    responses: publicResponses.map(({ attendeeId: _attendeeId, autor, ...r }) =>
      includeAll ? { ...r, autor } : r,
    ),
    ...(attendeeId
      ? {
          myResponses: loadResponses
            ? responseRows.filter((r) => r.attendeeId === attendeeId).length
            : (getDb().prepare(
                `select count(*) as n from timeline_events
                  where tipo = 'poll_response'
                    and json_extract(payload, '$.pollId') = ?
                    and json_extract(payload, '$.attendeeId') = ?`,
              ).get(row.id, attendeeId) as { n: number }).n,
        }
      : {}),
  };
}

function pollRow(where: string, ...params: unknown[]) {
  return getDb()
    .prepare(
      `select e.id, e.session_id as sessionId, s.titulo as sessionTitle,
              e.ts, e.payload
         from timeline_events e
         join sessions s on s.id = e.session_id
        where e.tipo = 'poll' and ${where}
        order by e.ts desc limit 1`,
    )
    .get(...params) as
    | { id: string; sessionId: string; sessionTitle: string; ts: string; payload: string }
    | undefined;
}

export function getActivePoll(
  sessionId: string,
  attendeeId: number | null = null,
  loadResponses = true,
): Poll | null {
  const row = pollRow(
    `e.session_id = ? and json_extract(e.payload, '$.status') = 'active'`,
    sessionId,
  );
  return row ? pollFromRow(row, false, attendeeId, loadResponses) : null;
}

export function getPollById(
  pollId: string,
  includeAll = false,
  attendeeId: number | null = null,
  loadResponses = true,
): Poll | null {
  const row = pollRow("e.id = ?", pollId);
  return row ? pollFromRow(row, includeAll, attendeeId, loadResponses) : null;
}

export function getAdminPoll(): Poll | null {
  const row =
    pollRow(`json_extract(e.payload, '$.status') = 'active'`) ?? pollRow("1 = 1");
  return row ? pollFromRow(row, true, null) : null;
}

export function getProjectionPoll(): Poll | null {
  const row =
    pollRow(`json_extract(e.payload, '$.status') = 'active'`) ?? pollRow("1 = 1");
  return row ? pollFromRow(row, false, null) : null;
}

export function createPoll(args: {
  sessionId: string;
  question: string;
  stopwords: string[];
}): Poll {
  const db = getDb();
  const id = randomUUID();
  db.transaction(() => {
    db.prepare(
      `update timeline_events
          set payload = json_set(payload, '$.status', 'closed')
        where tipo = 'poll' and json_extract(payload, '$.status') = 'active'`,
    ).run();
    db.prepare(
      `insert into timeline_events (id, tipo, session_id, ts, payload, client_id)
       values (?, 'poll', ?, ?, ?, null)`,
    ).run(
      id,
      args.sessionId,
      new Date().toISOString(),
      JSON.stringify({
        question: args.question,
        status: "active",
        mode: "cloud",
        stopwords: args.stopwords,
      }),
    );
  })();
  return getPollById(id, true)!;
}

export function setPollMode(pollId: string, mode: PollMode): boolean {
  const r = getDb()
    .prepare(
      `update timeline_events set payload = json_set(payload, '$.mode', ?)
        where id = ? and tipo = 'poll'`,
    )
    .run(mode, pollId);
  return r.changes > 0;
}

export function closePoll(pollId: string): boolean {
  const r = getDb()
    .prepare(
      `update timeline_events set payload = json_set(payload, '$.status', 'closed')
        where id = ? and tipo = 'poll'`,
    )
    .run(pollId);
  return r.changes > 0;
}

export function insertPollResponse(args: {
  pollId: string;
  sessionId: string;
  texto: string;
  attendeeId: number;
  autor: string;
  clientId: string;
}): string {
  const id = randomUUID();
  getDb()
    .prepare(
      `insert into timeline_events (id, tipo, session_id, ts, payload, client_id)
       values (?, 'poll_response', ?, ?, ?, ?)`,
    )
    .run(
      id,
      args.sessionId,
      new Date().toISOString(),
      JSON.stringify({
        pollId: args.pollId,
        texto: args.texto,
        attendeeId: args.attendeeId,
        autor: args.autor,
        status: "approved",
      }),
      args.clientId,
    );
  return id;
}

export function setPollResponseStatus(
  pollId: string,
  responseId: string,
  status: PollResponseStatus,
): boolean {
  const r = getDb()
    .prepare(
      `update timeline_events set payload = json_set(payload, '$.status', ?)
        where id = ? and tipo = 'poll_response'
          and json_extract(payload, '$.pollId') = ?`,
    )
    .run(status, responseId, pollId);
  return r.changes > 0;
}
