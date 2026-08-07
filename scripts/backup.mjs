// Backup consistente do SQLite, inclusive em modo WAL. Usa a API de backup do
// próprio SQLite e só anuncia sucesso depois de validar `integrity_check`.

import Database from "better-sqlite3";
import { existsSync, mkdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const source = resolve(process.env.DATABASE_PATH || "./data/concefor.db");
if (!existsSync(source)) {
  console.error(`Banco não encontrado: ${source}`);
  process.exit(1);
}

const targetDir = resolve(process.argv[2] || join(dirname(source), "backups"));
mkdirSync(targetDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const target = join(targetDir, `concefor-${stamp}.db`);

const db = new Database(source, { readonly: true, fileMustExist: true });
try {
  await db.backup(target);
} finally {
  db.close();
}

// Abre a cópia com escrita apenas para consolidá-la em um único arquivo. Como
// o banco de origem usa WAL, manter esse modo na cópia faria a validação deixar
// pares .db-wal/.db-shm vazios no diretório de retenção.
const check = new Database(target, { fileMustExist: true });
try {
  const result = check.pragma("integrity_check", { simple: true });
  if (result !== "ok") throw new Error(`integrity_check: ${String(result)}`);
  check.pragma("wal_checkpoint(TRUNCATE)");
  check.pragma("journal_mode = DELETE");
} finally {
  check.close();
}

console.log(
  JSON.stringify({ ok: true, arquivo: target, bytes: statSync(target).size }, null, 2),
);
