// Popula o SQLite local com a programação oficial (db/seed.sql).
// Uso: `npm run seed`. Idempotente — limpa as tabelas de conteúdo antes de inserir.
// Preserva timeline_events (reações), que são dados vivos, não seed.
//
// Não depende do Next nem de TypeScript: Node puro + better-sqlite3, para rodar
// no terminal e no build/deploy. Aplica o mesmo db/schema.sql que lib/db.ts.

import Database from "better-sqlite3";
import { readFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const file = process.env.DATABASE_PATH || "./data/concefor.db";
mkdirSync(dirname(file), { recursive: true });

const db = new Database(file);
db.pragma("foreign_keys = ON");

const root = process.cwd();
db.exec(readFileSync(join(root, "db", "schema.sql"), "utf8"));

// Limpa só o conteúdo semeável; timeline_events fica de fora (reações reais).
db.exec("delete from session_speakers; delete from speakers; delete from sessions;");
db.exec(readFileSync(join(root, "db", "seed.sql"), "utf8"));

const n = db.prepare("select count(*) as n from sessions").get().n;
const s = db.prepare("select count(*) as n from speakers").get().n;
db.close();

console.log(`Seed aplicado em ${file}: ${n} sessões, ${s} palestrantes.`);
