// Cria/atualiza uma sessão "ao vivo AGORA" no relógio real, para testar reações
// (E2) e, depois, o telão (E3) sem depender do modo demo. O evento é ago/2026:
// no relógio real nada está no ar, então este script abre uma janela em torno do
// instante atual. Uso: `npm run seed:live`, depois abra /sessao/teste-ao-vivo.

import Database from "better-sqlite3";
import { readFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const file = process.env.DATABASE_PATH || "./data/concefor.db";
mkdirSync(dirname(file), { recursive: true });

const db = new Database(file);
db.pragma("foreign_keys = ON");
db.exec(readFileSync(join(process.cwd(), "db", "schema.sql"), "utf8"));

const now = Date.now();
// Fuso de Brasília, como o sync do Even3 e o db.ts (agoraEmBrasilia) gravam.
// Não é cosmético: o /admin lê o HH:MM direto da string ao abrir a edição de
// horário, então uma sessão gravada em UTC ("…Z") aparece 3h adiantada no campo
// em relação ao que a própria tela mostra — e salvar move a sessão sem querer.
const iso = (ms) => `${new Date(ms - 3 * 60 * 60_000).toISOString().slice(0, 19)}-03:00`;
const id = "teste-ao-vivo";
const inicio = iso(now - 10 * 60 * 1000); // começou há 10 min
const fim = iso(now + 50 * 60 * 1000); // termina em 50 min

db.prepare(
  `insert into sessions (id, titulo, descricao, sala, eixo, palestrante, inicio, fim)
   values (?, ?, ?, ?, ?, ?, ?, ?)
   on conflict(id) do update set inicio = excluded.inicio, fim = excluded.fim`,
).run(
  id,
  "Sessão de teste (ao vivo agora)",
  "Sessão criada por scripts/seed-live.mjs para testar reações e telão no relógio real.",
  "Sala de teste",
  "Teste",
  null,
  inicio,
  fim,
);

db.close();
console.log(`Sessão '${id}' no ar agora (${inicio} → ${fim}).`);
console.log(`Rode 'npm run dev' e abra http://localhost:3000/sessao/${id}`);
