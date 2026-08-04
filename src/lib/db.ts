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
import { randomUUID } from "node:crypto";
import { dirname, join } from "node:path";
import type { Session, Speaker } from "./types";
import { emptyCounts, type ReactionCounts, type ReactionKind } from "./reactions";

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

// Migrações idempotentes de DADOS (o DDL vive no schema.sql, que já é "if not
// exists"). Rodam a cada boot e não fazem nada quando já foram aplicadas.
function migrar(db: Database.Database): void {
  // 04/08: conexões passaram a ser da PESSOA, não do aparelho (payload.de).
  // As criadas antes só têm client_id — recupera o dono pelo login daquele
  // aparelho. Conexão de aparelho que nunca logou (ou que já saiu) fica órfã:
  // não há como saber de quem era, e some do mosaico.
  db.exec(
    `update timeline_events
        set payload = json_set(payload, '$.de',
              (select i.attendee_id from identities i
                where i.client_id = timeline_events.client_id))
      where tipo = 'connection'
        and json_extract(payload, '$.de') is null
        and exists (select 1 from identities i
                     where i.client_id = timeline_events.client_id)`,
  );

  // 04/08: conexão virou bilateral. Cria o lado que falta nas antigas, para
  // ninguém ficar conectado "de um jeito só" (id em hex — só precisa ser único).
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

export function getDb(): Database.Database {
  if (!g.conceforDb) g.conceforDb = open();
  return g.conceforDb;
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
    const speakers = speakersDe.all(r.id) as Speaker[];
    return {
      ...r,
      speakerIds: speakers.map((s) => s.id),
      speakers,
    };
  });
}

// Todos os palestrantes (tela Pessoas). bio/foto podem vir nulos — a UI trata.
export function getSpeakers(): Speaker[] {
  return getDb()
    .prepare(
      `select id, nome, titulo, instituicao, bio, foto
         from speakers order by nome asc`,
    )
    .all() as Speaker[];
}

export function sessionExists(id: string): boolean {
  return Boolean(getDb().prepare("select 1 from sessions where id = ?").get(id));
}

// ─────────────────────────── Reações (E2) ───────────────────────────
// Toda reação é um registro na linha do tempo (tipo='reaction'). Anônimo:
// client_id é o id de dispositivo (ver lib/clientId.ts), sem PII.

export function insertReaction(
  sessionId: string,
  reaction: ReactionKind,
  clientId: string | null,
): void {
  getDb()
    .prepare(
      `insert into timeline_events (id, tipo, session_id, ts, payload, client_id)
       values (?, 'reaction', ?, ?, ?, ?)`,
    )
    .run(randomUUID(), sessionId, new Date().toISOString(), JSON.stringify({ reaction }), clientId);
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
      inscritos: n("select count(*) as n from attendees"),
      logados: n("select count(*) as n from identities"),
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
export function findAttendeeByLogin(
  checkinCode: string,
  segundoFator: string,
): { id: number; nome: string } | null {
  const db = getDb();
  const code = checkinCode.trim();
  const fator = segundoFator.trim();

  const row = (
    fator.includes("@")
      ? db
          .prepare(
            `select id, nome from attendees
              where checkin_code = ? and email is not null
                and lower(trim(email)) = lower(?)`,
          )
          .get(code, fator)
      : db
          .prepare(
            `select id, nome from attendees
              where checkin_code = ? and documento is not null
                and substr(documento, 1, 4) = ?`,
          )
          .get(code, fator.replace(/\D/g, ""))
  ) as { id: number; nome: string } | undefined;

  return row ? { ...row, nome: nomeBonito(row.nome) } : null;
}

export function upsertIdentity(clientId: string, attendeeId: number, nome: string): void {
  getDb()
    .prepare(
      `insert into identities (client_id, attendee_id, nome, consent_ts)
       values (?, ?, ?, ?)
       on conflict(client_id) do update set
         attendee_id = excluded.attendee_id, nome = excluded.nome,
         consent_ts = excluded.consent_ts`,
    )
    .run(clientId, attendeeId, nome, new Date().toISOString());
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

export type Perfil = { telefone: string | null; instagram: string | null };

export function getPerfil(attendeeId: number): Perfil {
  const row = getDb()
    .prepare("select telefone, instagram from attendee_profile where attendee_id = ?")
    .get(attendeeId) as Perfil | undefined;
  return row ?? { telefone: null, instagram: null };
}

export function setPerfil(attendeeId: number, p: Perfil): void {
  getDb()
    .prepare(
      `insert into attendee_profile (attendee_id, telefone, instagram, updated_at)
       values (?, ?, ?, ?)
       on conflict(attendee_id) do update set
         telefone = excluded.telefone, instagram = excluded.instagram,
         updated_at = excluded.updated_at`,
    )
    .run(attendeeId, p.telefone, p.instagram, new Date().toISOString());
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

export function attendeeByCheckin(code: string): { id: number; nome: string; email: string | null } | null {
  const row = getDb()
    .prepare("select id, nome, email from attendees where checkin_code = ?")
    .get(code.trim()) as { id: number; nome: string; email: string | null } | undefined;
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

// Todos os inscritos como bolinhas: conexões primeiro (mais recentes no topo,
// com contato completo), depois o resto em ordem alfabética (só 1º nome).
// Recebe o attendee da pessoa logada (null = anônimo, ninguém aceso).
export function getParticipantes(attendeeId: number | null): Participante[] {
  const db = getDb();
  const todos = db
    .prepare(
      `select a.id, a.nome, a.email, a.foto, a.categoria,
              p.telefone, p.instagram
         from attendees a
         left join attendee_profile p on p.attendee_id = a.id
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
            foto: t.foto ?? undefined,
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
  totalInscritos: number; // sincronizados do Even3 (R7)
  totalLogados: number; // identities criadas no login
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

  const inscritos = db.prepare("select count(*) as n from attendees").get() as { n: number };
  const logados = db.prepare("select count(*) as n from identities").get() as { n: number };

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

// ─────────────────────── Perguntas com upvote (R4) ───────────────────────
// Tudo em timeline_events, sem mudar o schema (spec §3):
//   tipo='question'         payload {"texto": "...", "hidden": true?}
//   tipo='question_vote'    payload {"questionId": "..."} (1 por client/pergunta)
//   tipo='questions_window' payload {"open": true|false} (estado = último evento)

export type Question = {
  id: string;
  texto: string;
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

export function insertQuestion(sessionId: string, texto: string, clientId: string | null): string {
  const id = randomUUID();
  getDb()
    .prepare(
      `insert into timeline_events (id, tipo, session_id, ts, payload, client_id)
       values (?, 'question', ?, ?, ?, ?)`,
    )
    .run(id, sessionId, new Date().toISOString(), JSON.stringify({ texto }), clientId);
  return id;
}

// Lista ordenada por votos (desc) e chegada (asc). `clientId` marca "meu voto";
// `includeHidden` é só para a moderação no /admin.
export function getQuestions(
  sessionId: string,
  clientId: string | null,
  includeHidden = false,
): Question[] {
  const db = getDb();
  const rows = db
    .prepare(
      `select e.id, e.ts,
              json_extract(e.payload, '$.texto') as texto,
              coalesce(json_extract(e.payload, '$.hidden'), 0) as hidden,
              (select count(*) from timeline_events v
                where v.tipo = 'question_vote'
                  and json_extract(v.payload, '$.questionId') = e.id) as votes
         from timeline_events e
        where e.tipo = 'question' and e.session_id = ?
        order by votes desc, e.ts asc`,
    )
    .all(sessionId) as (Omit<Question, "hidden" | "myVote"> & { hidden: number })[];

  const meusVotos = clientId
    ? new Set(
        (
          db
            .prepare(
              `select json_extract(payload, '$.questionId') as q from timeline_events
                where tipo = 'question_vote' and session_id = ? and client_id = ?`,
            )
            .all(sessionId, clientId) as { q: string }[]
        ).map((r) => r.q),
      )
    : new Set<string>();

  return rows
    .filter((r) => includeHidden || !r.hidden)
    .map((r) => ({ ...r, hidden: Boolean(r.hidden), myVote: meusVotos.has(r.id) }));
}

// Toggle: vota se não votou, retira o voto se já tinha (1 voto por client).
export function toggleQuestionVote(
  sessionId: string,
  questionId: string,
  clientId: string,
): { voted: boolean } {
  const db = getDb();
  const existing = db
    .prepare(
      `select id from timeline_events
        where tipo = 'question_vote' and session_id = ? and client_id = ?
          and json_extract(payload, '$.questionId') = ?`,
    )
    .get(sessionId, clientId, questionId) as { id: string } | undefined;

  if (existing) {
    db.prepare("delete from timeline_events where id = ?").run(existing.id);
    return { voted: false };
  }
  db.prepare(
    `insert into timeline_events (id, tipo, session_id, ts, payload, client_id)
     values (?, 'question_vote', ?, ?, ?, ?)`,
  ).run(randomUUID(), sessionId, new Date().toISOString(), JSON.stringify({ questionId }), clientId);
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
