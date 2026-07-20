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
  return db;
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

// ─────────────────────── Dashboard admin (R3) ───────────────────────
// Tudo derivado de timeline_events — o dashboard é só uma leitura da linha
// do tempo (mesmo modelo que alimenta app e telão; spec §5).

export type AdminStats = {
  ativosUltimaHora: number; // client_ids únicos com evento na última hora
  totalReacoes: number;
  reacoesPorSessao: { sessionId: string | null; titulo: string; n: number }[];
  reacoesPorMinuto: { minuto: string; n: number }[]; // últimos 60 min (UTC "HH:MM")
  totalPerguntas: number;
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

  return {
    ativosUltimaHora: ativos.n,
    totalReacoes: total.n,
    reacoesPorSessao: porSessao,
    reacoesPorMinuto: porMinuto,
    totalPerguntas: perguntas.n,
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
