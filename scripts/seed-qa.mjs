// Massa local, fictícia e removível para testar login, networking e enquetes
// sem usar credenciais de participantes reais.

import Database from "better-sqlite3";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

const limpar = process.argv.includes("--limpar");
if (process.env.NODE_ENV === "production" && !process.argv.includes("--force")) {
  console.error("seed:qa é local; em produção ele exige --force de propósito.");
  process.exit(1);
}

const file = process.env.DATABASE_PATH || "./data/concefor.db";
mkdirSync(dirname(file), { recursive: true });
const db = new Database(file);
db.pragma("foreign_keys = ON");
db.exec(readFileSync(join(process.cwd(), "db", "schema.sql"), "utf8"));

const sessionId = "demo-qa-local";
const people = [
  [-990001, "99199001", "Ana Teste Local", "ana@concefor.test", "11110000000"],
  [-990002, "99199002", "Bruno Teste Local", "bruno@concefor.test", "22220000000"],
  [-990003, "99199003", "Carla Teste Local", "carla@concefor.test", "33330000000"],
];
const ids = people.map(([id]) => id);

const removeQa = db.transaction(() => {
  db.prepare("delete from timeline_events where session_id = ?").run(sessionId);
  for (const id of ids) {
    db.prepare(
      `delete from timeline_events
        where tipo = 'connection'
          and (json_extract(payload, '$.de') = ?
            or json_extract(payload, '$.attendeeId') = ?)`,
    ).run(id, id);
  }
  db.prepare("delete from sessions where id = ?").run(sessionId);
  for (const id of ids) db.prepare("delete from attendees where id = ?").run(id);
});

if (limpar) {
  removeQa();
  db.close();
  console.log("Massa de QA local removida.");
  process.exit(0);
}

// Reexecutar o seed é uma atualização NÃO DESTRUTIVA: logins, perfis,
// conexões e interações já feitos com as contas fictícias permanecem.
for (const [id, code] of people) {
  const codeOwner = db
    .prepare("select id from attendees where checkin_code = ? and id <> ?")
    .get(code, id);
  const idOwner = db
    .prepare("select checkin_code from attendees where id = ? and checkin_code <> ?")
    .get(id, code);
  if (codeOwner || idOwner) {
    db.close();
    throw new Error("Um identificador reservado do QA já pertence a outro cadastro.");
  }
}

const insertPerson = db.prepare(
  `insert into attendees
     (id, checkin_code, nome, badge_name, email, documento, categoria, confirmado, updated_at)
   values (?, ?, ?, ?, ?, ?, 'Teste local', 1, ?)
   on conflict(id) do update set
     checkin_code = excluded.checkin_code,
     nome = excluded.nome,
     badge_name = excluded.badge_name,
     email = excluded.email,
     documento = excluded.documento,
     categoria = excluded.categoria,
     confirmado = excluded.confirmado,
     updated_at = excluded.updated_at`,
);
const now = new Date().toISOString();
for (const [id, code, name, email, document] of people) {
  insertPerson.run(id, code, name, name, email, document, now);
}

db.prepare(
  `insert into sessions (id, titulo, descricao, sala, eixo, inicio, fim)
   values (?, ?, ?, ?, 'Teste', ?, ?)
   on conflict(id) do update set
     titulo = excluded.titulo,
     descricao = excluded.descricao,
     sala = excluded.sala,
     eixo = excluded.eixo,
     inicio = excluded.inicio,
     fim = excluded.fim`,
).run(
  sessionId,
  "Teste local — Enquetes e networking",
  "Sessão fictícia e removível para validar o app antes do lançamento.",
  "Sala de QA",
  new Date(Date.now() - 2 * 60_000).toISOString(),
  new Date(Date.now() + 120 * 60_000).toISOString(),
);

db.close();
console.log("QA local pronto em http://localhost:3000/ao-vivo");
console.log("Ana: 99199001 + ana@concefor.test (ou CPF4 1111)");
console.log("Bruno: 99199002 + bruno@concefor.test (ou CPF4 2222)");
console.log("Carla: 99199003 + carla@concefor.test (ou CPF4 3333)");
console.log("Reexecutar este seed preserva logins, perfis, conexões e interações.");
console.log("Limpar depois: npm run seed:qa -- --limpar");
