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
