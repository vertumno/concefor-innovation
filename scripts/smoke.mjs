// Smoke test da compilação de produção. Sobe o Next em porta efêmera e com um
// SQLite descartável, valida saúde e fronteiras de autenticação, e encerra.

import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { once } from "node:events";

const delay = (ms) => new Promise((done) => setTimeout(done, ms));

async function freePort() {
  const probe = createServer();
  probe.listen(0, "127.0.0.1");
  await once(probe, "listening");
  const address = probe.address();
  const port = typeof address === "object" && address ? address.port : 3107;
  probe.close();
  await once(probe, "close");
  return port;
}

const tempDir = mkdtempSync(join(tmpdir(), "concefor-smoke-"));
const port = await freePort();
const base = `http://127.0.0.1:${port}`;
const output = [];
const child = spawn(
  process.execPath,
  [resolve("node_modules/next/dist/bin/next"), "start", "-p", String(port)],
  {
    cwd: process.cwd(),
    env: {
      ...process.env,
      DATABASE_PATH: join(tempDir, "smoke.db"),
      SYNC_INTERVAL_MIN: "0",
      NODE_ENV: "production",
    },
    stdio: ["ignore", "pipe", "pipe"],
  },
);
child.stdout.on("data", (chunk) => output.push(String(chunk)));
child.stderr.on("data", (chunk) => output.push(String(chunk)));

try {
  let health;
  const deadline = Date.now() + 25_000;
  while (Date.now() < deadline) {
    try {
      health = await fetch(`${base}/api/health`);
      if (health.ok) break;
    } catch {
      // servidor ainda iniciando
    }
    await delay(400);
  }
  if (!health?.ok) throw new Error("servidor não ficou saudável em 25 segundos");

  const sessions = await fetch(`${base}/api/sessions`);
  const projection = await fetch(`${base}/api/polls?projection=1`);
  const profile = await fetch(`${base}/api/profile`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  });
  const admin = await fetch(`${base}/api/admin/polls`);
  const statuses = {
    health: health.status,
    sessions: sessions.status,
    polls: projection.status,
    profileSemSessao: profile.status,
    adminSemToken: admin.status,
  };
  if (
    statuses.health !== 200 ||
    statuses.sessions !== 200 ||
    statuses.polls !== 200 ||
    statuses.profileSemSessao !== 401 ||
    statuses.adminSemToken !== 401
  ) {
    throw new Error(`status inesperado: ${JSON.stringify(statuses)}`);
  }
  console.log(JSON.stringify({ ok: true, ...statuses }, null, 2));
} catch (error) {
  console.error(output.join("").slice(-5000));
  throw error;
} finally {
  if (child.exitCode === null) {
    child.kill();
    await Promise.race([once(child, "exit"), delay(3000)]);
    if (child.exitCode === null) child.kill("SIGKILL");
  }
  rmSync(tempDir, { recursive: true, force: true });
}
