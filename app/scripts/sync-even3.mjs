// Sync Even3 → SQLite local (R2 — somente LEITURA).
// Uso: `npm run sync:even3`. Idempotente: rodar 2× seguidas não duplica nada.
//
// Puxa a programação oficial de GET /session/getschedule (que já embute os
// palestrantes com foto/minibio) e faz upsert em sessions/speakers/
// session_speakers. O app nunca chama o Even3 do navegador — a chave vive em
// .env.local (EVEN3_API_TOKEN, gitignored). Ver contexto/even3/api.md.
//
// Convenção de ids (o que torna o sync idempotente SEM mudar o schema):
//   sessão  → even3-<id_session>-<YYYYMMDD>-<HHMM>  (uma linha por ocorrência)
//   speaker → even3-sp-<id_speaker>
// Linhas locais extras (ex.: sessão fictícia de teste, seed) não usam o
// prefixo "even3-" e por isso SOBREVIVEM ao sync. Sessões que sumiram do
// Even3 (prefixadas e ausentes do payload) são removidas — programação que
// muda em cima da hora não deixa fantasma.
//
// Node puro + better-sqlite3 (padrão dos seeds). Exporta runSync() para a
// futura rota admin de re-sync (R3) reusar a mesma lógica.

import Database from "better-sqlite3";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const API_BASE = "https://www.even3.com.br/api/v1";

// .env.local não é carregado automaticamente em scripts Node — parse simples.
function loadEnvLocal(root) {
  const file = join(root, ".env.local");
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

async function fetchJson(path, token) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Authorization-Token": token },
  });
  if (!res.ok) {
    throw new Error(`Even3 GET ${path} → HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  return res.json();
}

// "01/01/2020" ou "2020-01-01T00:00:00..." → "2020-01-01" (só a data).
function isoDate(session) {
  const utc = session.date_UTC || "";
  if (/^\d{4}-\d{2}-\d{2}/.test(utc)) return utc.slice(0, 10);
  const br = (session.date || "").match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (br) return `${br[3]}-${br[2]}-${br[1]}`;
  return null;
}

// Data + "HH:MM" → ISO-8601 no fuso do evento (Vitória-ES, UTC-3).
function isoDateTime(date, hhmm) {
  if (!date || !/^\d{2}:\d{2}/.test(hhmm || "")) return null;
  return `${date}T${hhmm.slice(0, 5)}:00-03:00`;
}

// "Dia 1 - Abertura do VIII Concefor" → "Abertura do VIII Concefor".
// O prefixo é redundante: a linha do tempo já agrupa por dia.
function cleanTitle(title) {
  return (title || "").replace(/^dia\s*\d+\s*[-–—]\s*/i, "").trim();
}

// Eixo: primeira tag quando houver; senão heurística pelo título (o cadastro
// real do Concefor veio com tags vazias — visto em 20/07, data/even3-getschedule.json).
function eixoDe(session, titulo) {
  const t = (session.tags || "").split(",")[0]?.trim();
  if (t) return t;
  const x = titulo.toLowerCase();
  if (x.includes("palestra")) return "Palestra";
  if (x.includes("mesa-redonda") || x.includes("mesa redonda")) return "Mesa-redonda";
  if (x.includes("mostra")) return "Mostra";
  if (x.includes("sessões técnicas") || x.includes("sessoes tecnicas")) return "Sessões técnicas";
  if (x.includes("eventos paralelos") || x.includes("fórum") || x.includes("forum")) return "Evento paralelo";
  if (x.includes("abertura") || x.includes("premiação")) return "Solenidade";
  if (x.includes("credenciamento") || x.includes("coffee") || x.includes("almoço")) return "Intervalo";
  return null;
}

export async function runSync({ dbPath, token, dumpRaw = true } = {}) {
  const root = process.cwd();
  if (!token) throw new Error("EVEN3_API_TOKEN ausente (esperado em app/.env.local).");

  const schedule = await fetchJson("/session/getschedule", token);
  const days = schedule.data ?? [];

  // Dump da resposta crua (data/ é gitignored) — depurar mapeamento sem re-chamar a API.
  if (dumpRaw) {
    const dumpFile = join(root, "data", "even3-getschedule.json");
    mkdirSync(dirname(dumpFile), { recursive: true });
    writeFileSync(dumpFile, JSON.stringify(schedule, null, 2));
  }

  const file = dbPath || process.env.DATABASE_PATH || "./data/concefor.db";
  mkdirSync(dirname(file), { recursive: true });
  const db = new Database(file);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(readFileSync(join(root, "db", "schema.sql"), "utf8"));

  const upsertSession = db.prepare(`
    insert into sessions (id, titulo, descricao, sala, eixo, palestrante, inicio, fim)
    values (@id, @titulo, @descricao, @sala, @eixo, @palestrante, @inicio, @fim)
    on conflict(id) do update set
      titulo = excluded.titulo,
      -- Even3 vence quando fala; quando vem vazio, o enriquecimento local
      -- (db/enrich.sql, edições do admin) sobrevive ao re-sync.
      descricao = coalesce(excluded.descricao, sessions.descricao),
      sala = coalesce(excluded.sala, sessions.sala),
      eixo = coalesce(excluded.eixo, sessions.eixo),
      palestrante = coalesce(excluded.palestrante, sessions.palestrante),
      inicio = excluded.inicio, fim = excluded.fim
  `);
  const upsertSpeaker = db.prepare(`
    insert into speakers (id, nome, titulo, instituicao, bio, foto)
    values (@id, @nome, null, null, @bio, @foto)
    on conflict(id) do update set
      nome = excluded.nome, bio = excluded.bio, foto = excluded.foto
  `);
  const linkSpeaker = db.prepare(
    "insert or ignore into session_speakers (session_id, speaker_id) values (?, ?)",
  );
  const clearLinks = db.prepare("delete from session_speakers where session_id = ?");

  const sessionIds = new Set();
  const speakerIds = new Set();
  let duplicadas = 0;

  const apply = db.transaction(() => {
    for (const day of days) {
      for (const s of day.sessions ?? []) {
        const date = isoDate(s);
        const inicio = isoDateTime(date, s.start_time);
        if (!inicio) {
          console.warn(`  ! sessão ${s.id_session} ("${s.title}") sem data/hora — pulada`);
          continue;
        }
        const id = `even3-${s.id_session}-${date.replaceAll("-", "")}-${s.start_time.replace(":", "")}`;
        // getschedule repete sessões dentro do mesmo dia (visto em 16/07 e
        // confirmado em 20/07, até 4×) — a mesma ocorrência vira o mesmo id.
        if (sessionIds.has(id)) {
          duplicadas++;
          continue;
        }
        sessionIds.add(id);

        const titulo = cleanTitle(s.title);
        const speakers = s.speakers ?? [];
        upsertSession.run({
          id,
          titulo,
          descricao: (s.description || "").trim() || null,
          sala: s.venue || null,
          eixo: eixoDe(s, titulo),
          palestrante: speakers.map((p) => p.name).join(" · ") || null,
          inicio,
          fim: isoDateTime(date, s.end_time),
        });

        // Só refaz os vínculos quando o Even3 realmente manda palestrantes —
        // senão os vínculos do enriquecimento local (db/enrich.sql) sobrevivem.
        if (speakers.length > 0) {
          clearLinks.run(id);
          for (const p of speakers) {
            const spId = `even3-sp-${p.id_speaker}`;
            speakerIds.add(spId);
            upsertSpeaker.run({ id: spId, nome: p.name, bio: p.resume || null, foto: p.photo || null });
            linkSpeaker.run(id, spId);
          }
        }
      }
    }

    // Remove o que sumiu do Even3 (só linhas prefixadas — as locais sobrevivem).
    const staleSessions = db
      .prepare("select id from sessions where id like 'even3-%'")
      .all()
      .filter((r) => !sessionIds.has(r.id));
    for (const { id } of staleSessions) db.prepare("delete from sessions where id = ?").run(id);

    const staleSpeakers = db
      .prepare("select id from speakers where id like 'even3-sp-%'")
      .all()
      .filter((r) => !speakerIds.has(r.id));
    for (const { id } of staleSpeakers) db.prepare("delete from speakers where id = ?").run(id);

    return { staleSessions: staleSessions.length, staleSpeakers: staleSpeakers.length };
  });

  const { staleSessions, staleSpeakers } = apply();

  // Enriquecimento local por cima do sync (salas, palestrantes estruturados)
  // enquanto o cadastro do Even3 não traz venue/tags/speakers — ver db/enrich.sql.
  const enrichFile = join(root, "db", "enrich.sql");
  if (existsSync(enrichFile)) db.exec(readFileSync(enrichFile, "utf8"));

  const dias = new Set(
    db.prepare("select substr(inicio, 1, 10) as d from sessions where id like 'even3-%'").all().map((r) => r.d),
  );
  const total = db.prepare("select count(*) as n from sessions").get().n;
  db.close();

  return {
    dias: [...dias].sort(),
    sincronizadas: sessionIds.size,
    duplicadasIgnoradas: duplicadas,
    palestrantes: speakerIds.size,
    removidasStale: staleSessions,
    palestrantesRemovidos: staleSpeakers,
    totalNoBanco: total,
  };
}

// Execução direta: `npm run sync:even3`.
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replaceAll("\\", "/").split("/").pop())) {
  loadEnvLocal(process.cwd());
  runSync({ token: process.env.EVEN3_API_TOKEN })
    .then((r) => {
      console.log(
        `Sync Even3 ok: ${r.sincronizadas} sessões (${r.duplicadasIgnoradas} duplicatas ignoradas), ` +
          `${r.palestrantes} palestrantes, ${r.removidasStale} sessões stale removidas.`,
      );
      console.log(`Dias no banco: ${r.dias.join(", ")} · total de sessões (com locais): ${r.totalNoBanco}`);
    })
    .catch((err) => {
      console.error(`Sync falhou: ${err.message}`);
      process.exit(1);
    });
}
