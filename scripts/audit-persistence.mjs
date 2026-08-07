// Auditoria somente leitura do SQLite antes/depois de deploys. Não exibe PII:
// informa integridade e quantos logins/conexões podem ser preservados ou reparados.

import Database from "better-sqlite3";

const file = process.env.DATABASE_PATH || "./data/concefor.db";
const db = new Database(file, { readonly: true, fileMustExist: true });

const n = (sql, ...params) => db.prepare(sql).get(...params).n;
const hasTable = (name) =>
  Boolean(db.prepare("select 1 from sqlite_master where type = 'table' and name = ?").get(name));

const integrity = db.pragma("integrity_check").map((row) => row.integrity_check);
const connectionWhere = "tipo = 'connection'";
const result = {
  integrity,
  attendees: n("select count(*) as n from attendees"),
  identities: hasTable("identities") ? n("select count(*) as n from identities") : 0,
  authSessions: hasTable("auth_sessions") ? n("select count(*) as n from auth_sessions") : 0,
  connections: {
    total: n(`select count(*) as n from timeline_events where ${connectionWhere}`),
    personLinked: n(
      `select count(*) as n from timeline_events
        where ${connectionWhere} and json_extract(payload, '$.de') is not null`,
    ),
    legacyRecoverable: n(
      `select count(*) as n from timeline_events e
        where e.tipo = 'connection' and json_extract(e.payload, '$.de') is null
          and exists (select 1 from identities i where i.client_id = e.client_id)`,
    ),
    legacyOrphan: n(
      `select count(*) as n from timeline_events e
        where e.tipo = 'connection' and json_extract(e.payload, '$.de') is null
          and not exists (select 1 from identities i where i.client_id = e.client_id)`,
    ),
  },
};

db.close();
console.log(JSON.stringify(result, null, 2));
if (integrity.some((value) => value !== "ok")) process.exitCode = 1;
