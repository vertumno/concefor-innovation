import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import type Database from "better-sqlite3";

// O módulo de banco é singleton. Este arquivo inteiro usa uma base descartável,
// criada antes do import dinâmico, para nunca tocar nos dados locais do evento.
const tempDir = mkdtempSync(join(tmpdir(), "concefor-core-test-"));
process.env.DATABASE_PATH = join(tempDir, "test.db");

let dbModule: typeof import("./db");
let authModule: typeof import("./authSession");
let pollModule: typeof import("./polls");
let db: Database.Database;

before(async () => {
  dbModule = await import("./db");
  authModule = await import("./authSession");
  pollModule = await import("./polls");
  db = dbModule.getDb();

  db.prepare(
    `insert into sessions (id, titulo, inicio, fim)
     values ('sessao-1', 'Mesa de teste', '2026-08-17T19:00:00-03:00',
             '2026-08-17T20:00:00-03:00')`,
  ).run();
  db.prepare(
    `insert into attendees
       (id, checkin_code, nome, email, documento, confirmado, updated_at)
     values (?, ?, ?, ?, ?, 1, ?)`,
  ).run(1, "10000001", "ANA TESTE", "ana@example.org", "12345678900", new Date().toISOString());
  db.prepare(
    `insert into attendees
       (id, checkin_code, nome, email, documento, confirmado, updated_at)
     values (?, ?, ?, ?, ?, 1, ?)`,
  ).run(2, "10000002", "BRUNO TESTE", "bruno@example.org", "98765432100", new Date().toISOString());
});

after(() => {
  db.close();
  delete (globalThis as { conceforDb?: unknown }).conceforDb;
  rmSync(tempDir, { recursive: true, force: true });
});

test("token de participante é opaco, persistido só como hash e revogável", () => {
  const created = authModule.createParticipantSession({
    attendeeId: 1,
    clientId: "client-auth-0001",
    nome: "Ana Teste",
  });
  const stored = db.prepare("select token_hash from auth_sessions").get() as { token_hash: string };
  assert.notEqual(stored.token_hash, created.token);
  assert.match(stored.token_hash, /^[a-f0-9]{64}$/);

  const cookie = authModule.sessionCookie(created.token).split(";")[0];
  const request = new Request("http://localhost/api/me", { headers: { cookie } });
  assert.equal(authModule.participantSession(request)?.attendeeId, 1);
  assert.equal(authModule.revokeParticipantSession(request)?.attendeeId, 1);
  assert.equal(authModule.participantSession(request), null);
});

test("identidade pública do telão não revela o clientId", () => {
  const actor = authModule.publicActorId("client-visual-0001");
  assert.equal(actor, authModule.publicActorId("client-visual-0001"));
  assert.notEqual(actor, "client-visual-0001");
  assert.match(actor ?? "", /^[a-f0-9]{20}$/);
});

test("contato conectado respeita opt-in independente por campo", () => {
  assert.deepEqual(dbModule.attendeeByCheckin("10000002"), {
    id: 2,
    nome: "Bruno Teste",
  });
  dbModule.setPerfil(2, {
    telefone: "27999999999",
    instagram: "bruno.teste",
    shareEmail: false,
    shareTelefone: true,
    shareInstagram: false,
  });
  dbModule.insertConnection(1, 2, "client-connect-0001");

  const primeiro = dbModule.getParticipantes(1).find((p) => p.id === 2);
  assert.equal(primeiro?.conectado, true);
  assert.equal(primeiro?.email, undefined);
  assert.equal(primeiro?.telefone, "27999999999");
  assert.equal(primeiro?.instagram, undefined);

  dbModule.setPerfil(2, {
    telefone: "27999999999",
    instagram: "bruno.teste",
    shareEmail: true,
    shareTelefone: false,
    shareInstagram: true,
  });
  const atualizado = dbModule.getParticipantes(1).find((p) => p.id === 2);
  assert.equal(atualizado?.email, "bruno@example.org");
  assert.equal(atualizado?.telefone, undefined);
  assert.equal(atualizado?.instagram, "bruno.teste");
});

test("enquete modera respostas e preserva resultado após encerrar", () => {
  const poll = dbModule.createPoll({
    sessionId: "sessao-1",
    question: "O que não pode faltar?",
    stopwords: pollModule.normalizeStopwords("a, o, de"),
  });
  const responseId = dbModule.insertPollResponse({
    pollId: poll.id,
    sessionId: poll.sessionId,
    texto: "Educação pública e educação inclusiva!",
    attendeeId: 1,
    autor: "Ana Teste",
    clientId: "client-poll-0001",
  });

  assert.equal(dbModule.getProjectionPoll()?.responses.length, 0);
  assert.equal(dbModule.getAdminPoll()?.responses[0]?.autor, "Ana Teste");
  assert.equal(dbModule.setPollResponseStatus(poll.id, responseId, "approved"), true);
  const projection = dbModule.getProjectionPoll();
  assert.equal(projection?.responses.length, 1);
  assert.equal(projection?.responses[0].autor, undefined);

  const frequencies = pollModule.wordFrequencies(projection?.responses ?? [], ["e"]);
  assert.deepEqual(frequencies.slice(0, 2), [
    { word: "educação", count: 2 },
    { word: "inclusiva", count: 1 },
  ]);

  assert.equal(dbModule.closePoll(poll.id), true);
  assert.equal(dbModule.getActivePoll("sessao-1"), null);
  assert.equal(dbModule.getProjectionPoll()?.status, "closed");
  assert.equal(dbModule.getProjectionPoll()?.responses.length, 1);
});

test("relatório conta pessoas distintas, não aparelhos", () => {
  dbModule.upsertIdentity("client-report-0001", 1, "Ana Teste");
  dbModule.upsertIdentity("client-report-0002", 1, "Ana Teste");
  assert.equal(dbModule.getReport().totais.logados, 1);
  assert.equal(dbModule.getAdminStats().totalLogados, 1);
});
