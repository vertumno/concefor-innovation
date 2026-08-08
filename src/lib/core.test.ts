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
let contactModule: typeof import("./contato");
let pollApiModule: typeof import("../app/api/polls/route");
let connectApiModule: typeof import("../app/api/connect/route");
let db: Database.Database;

before(async () => {
  dbModule = await import("./db");
  authModule = await import("./authSession");
  pollModule = await import("./polls");
  contactModule = await import("./contato");
  pollApiModule = await import("../app/api/polls/route");
  connectApiModule = await import("../app/api/connect/route");
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

test("perfil novo inicia com compartilhamento marcado por campo", () => {
  assert.deepEqual(dbModule.getPerfil(1), {
    telefonePais: "55",
    telefone: null,
    instagram: null,
    shareEmail: true,
    shareTelefone: true,
    shareInstagram: true,
  });
});

test("novo login recupera conexão antiga e respeita a escolha por campo", () => {
  assert.deepEqual(dbModule.attendeeByCheckin("10000002"), {
    id: 2,
    nome: "Bruno Teste",
  });
  dbModule.setPerfil(2, {
    telefonePais: "55",
    telefone: "27999999999",
    instagram: "bruno.teste",
    shareEmail: false,
    shareTelefone: true,
    shareInstagram: false,
  });
  // Formato anterior a 04/08: havia destino e aparelho, mas não a pessoa de origem.
  db.prepare(
    `insert into timeline_events (id, tipo, session_id, ts, payload, client_id)
     values ('legacy-connection', 'connection', null, ?, ?, ?)`,
  ).run(
    new Date().toISOString(),
    JSON.stringify({ attendeeId: 2 }),
    "client-connect-legacy",
  );
  dbModule.upsertIdentity("client-connect-legacy", 1, "Ana Teste");

  const primeiro = dbModule.getParticipantes(1).find((p) => p.id === 2);
  assert.equal(primeiro?.conectado, true);
  assert.equal(primeiro?.email, undefined);
  assert.equal(primeiro?.telefone, "5527999999999");
  assert.equal(primeiro?.instagram, undefined);
  assert.equal(dbModule.getParticipantes(2).find((p) => p.id === 1)?.conectado, true);

  dbModule.setPerfil(2, {
    telefonePais: "55",
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

  assert.equal(dbModule.deleteConnection(1, 2), true);
  assert.equal(dbModule.getParticipantes(1).find((p) => p.id === 2)?.conectado, false);
  assert.equal(dbModule.getParticipantes(2).find((p) => p.id === 1)?.conectado, false);
  assert.equal(
    (db.prepare("select count(*) as n from timeline_events where tipo = 'connection'").get() as { n: number }).n,
    0,
  );
});

test("desfazer conexão nova remove os dois sentidos", () => {
  assert.equal(dbModule.insertConnection(1, 2, "client-connect-new"), true);
  assert.equal(dbModule.getParticipantes(1).find((p) => p.id === 2)?.conectado, true);
  assert.equal(dbModule.getParticipantes(2).find((p) => p.id === 1)?.conectado, true);

  assert.equal(dbModule.deleteConnection(1, 2), true);
  assert.equal(dbModule.getParticipantes(1).find((p) => p.id === 2)?.conectado, false);
  assert.equal(dbModule.getParticipantes(2).find((p) => p.id === 1)?.conectado, false);
});

test("API desfaz conexão com ID negativo reservado para QA", async () => {
  db.prepare(
    `insert into attendees
       (id, checkin_code, nome, email, documento, confirmado, updated_at)
     values (?, ?, ?, ?, ?, 1, ?)`,
  ).run(-99, "99999999", "QA NEGATIVO", "qa-negativo@example.org", "99990000000", new Date().toISOString());
  assert.equal(dbModule.insertConnection(1, -99, "client-connect-negative"), true);

  const participant = authModule.createParticipantSession({
    attendeeId: 1,
    clientId: "client-delete-negative",
    nome: "Ana Teste",
  });
  const cookie = authModule.sessionCookie(participant.token).split(";")[0];
  const response = await connectApiModule.DELETE(
    new Request("http://localhost/api/connect", {
      method: "DELETE",
      headers: { cookie, "content-type": "application/json" },
      body: JSON.stringify({ attendeeId: -99 }),
    }),
  );

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(dbModule.getParticipantes(1).find((p) => p.id === -99)?.conectado, false);
});

test("telefone usa E.164 e formata o padrão brasileiro sem presumir WhatsApp", () => {
  assert.equal(contactModule.telefoneE164("55 27 99999-8888"), "+5527999998888");
  assert.equal(contactModule.telefoneFormatado("5527999998888"), "+55 (27) 99999-8888");
  assert.equal(contactModule.telefoneFormatado("351912345678"), "+351912345678");
  assert.equal(contactModule.whatsappLink("+55 (27) 99999-8888"), "https://wa.me/5527999998888");
  assert.equal(contactModule.whatsappLink("inválido"), null);
});

test("enquete aplica cooldown, modera e preserva resultado após encerrar", async () => {
  const poll = dbModule.createPoll({
    sessionId: "sessao-1",
    question: "O que não pode faltar?",
    stopwords: pollModule.normalizeStopwords("a, o, de"),
  });
  const participant = authModule.createParticipantSession({
    attendeeId: 1,
    clientId: "client-poll-0001",
    nome: "Ana Teste",
  });
  const cookie = authModule.sessionCookie(participant.token).split(";")[0];
  const first = await pollApiModule.POST(
    new Request("http://localhost/api/polls", {
      method: "POST",
      headers: { cookie, "content-type": "application/json" },
      body: JSON.stringify({
        pollId: poll.id,
        texto: "Educação pública e educação educação inclusiva!",
      }),
    }),
  );
  assert.equal(first.status, 200);
  assert.equal((await first.json()).cooldownSeconds, 5);

  const immediate = await pollApiModule.POST(
    new Request("http://localhost/api/polls", {
      method: "POST",
      headers: { cookie, "content-type": "application/json" },
      body: JSON.stringify({ pollId: poll.id, texto: "Outra resposta" }),
    }),
  );
  const throttled = await immediate.json();
  assert.equal(immediate.status, 429);
  assert.match(immediate.headers.get("retry-after") ?? "", /^[1-5]$/);
  assert.ok(throttled.retryAfterMs > 0 && throttled.retryAfterMs <= 5000);

  const participantView = await pollApiModule.GET(
    new Request(`http://localhost/api/polls?sessionId=${poll.sessionId}`, {
      headers: { cookie },
    }),
  );
  const participantPoll = (await participantView.json()).poll;
  assert.equal(participantPoll.responses.length, 0);
  assert.equal(participantPoll.myResponses, 1);

  const responseId = dbModule.getAdminPoll()!.responses[0].id;

  assert.equal(dbModule.getProjectionPoll()?.responses.length, 1);
  assert.equal(dbModule.getAdminPoll()?.responses[0]?.autor, "Ana Teste");
  assert.equal(dbModule.getProjectionPoll()?.responses[0].autor, undefined);
  assert.equal(dbModule.setPollResponseStatus(poll.id, responseId, "hidden"), true);
  assert.equal(dbModule.getProjectionPoll()?.responses.length, 0);
  assert.equal(dbModule.setPollResponseStatus(poll.id, responseId, "approved"), true);
  const projection = dbModule.getProjectionPoll();
  assert.equal(projection?.responses.length, 1);
  assert.equal(projection?.responses[0].autor, undefined);

  const frequencies = pollModule.wordFrequencies(projection?.responses ?? [], ["e"]);
  assert.deepEqual(frequencies.slice(0, 2), [
    { word: "educação", count: 1 },
    { word: "inclusiva", count: 1 },
  ]);

  assert.deepEqual(
    pollModule.wordFrequencies(
      [
        { texto: "Educação educação EDUCAÇÃO" },
        { texto: "educação inclusiva" },
      ],
      [],
    ).slice(0, 2),
    [
      { word: "educação", count: 2 },
      { word: "inclusiva", count: 1 },
    ],
  );
  assert.equal(pollModule.POLL_COOLDOWN_SECONDS, 5);

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
