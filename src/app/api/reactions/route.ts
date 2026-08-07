import { NextResponse } from "next/server";
import { getReactionCounts, insertReaction, sessionExists } from "@/lib/db";
import { isReactionKind } from "@/lib/reactions";
import { participantSession } from "@/lib/authSession";

export const runtime = "nodejs"; // better-sqlite3 é binário nativo
export const dynamic = "force-dynamic"; // dados vivos

// Anti-flood: no máx 1 reação a cada 5s por dispositivo (era 1s; esticado em
// 05/08 junto com a exigência de login). Estado em memória do processo —
// best-effort, suficiente para conter martelada de toque.
const THROTTLE_MS = 5000;
type ThrottleGlobal = { reactionLast?: Map<string, number> };
const g = globalThis as unknown as ThrottleGlobal;
function lastByClient(): Map<string, number> {
  return (g.reactionLast ??= new Map());
}

// GET /api/reactions?sessionId=... → contagem agregada (carga inicial + polling).
export function GET(req: Request) {
  const sessionId = new URL(req.url).searchParams.get("sessionId");
  if (!sessionId) return NextResponse.json({ error: "sessionId requerido" }, { status: 400 });
  return NextResponse.json({ counts: getReactionCounts(sessionId) });
}

// POST /api/reactions { sessionId, reaction } → grava na linha do tempo.
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const { sessionId, reaction } = (body ?? {}) as Record<string, unknown>;

  if (!isReactionKind(reaction)) {
    return NextResponse.json({ error: "reação inválida" }, { status: 400 });
  }
  if (typeof sessionId !== "string" || !sessionExists(sessionId)) {
    return NextResponse.json({ error: "sessão desconhecida" }, { status: 400 });
  }

  // Só participa quem entrou com o ingresso (decisão de 05/08 — inibe abuso).
  // Anônimo continua VENDO a contagem (GET); enviar é que exige identidade.
  const sessao = participantSession(req);
  if (!sessao) {
    return NextResponse.json({ error: "entre com seu ingresso para reagir" }, { status: 401 });
  }
  const cid = sessao.clientId;

  const now = Date.now();
  const last = lastByClient().get(cid) ?? 0;
  if (now - last < THROTTLE_MS) {
    // Engolida pelo throttle: devolve a contagem atual para a UI não regredir.
    return NextResponse.json(
      { throttled: true, counts: getReactionCounts(sessionId) },
      { status: 429 },
    );
  }
  lastByClient().set(cid, now);

  insertReaction(sessionId, reaction, cid, sessao.attendeeId);
  return NextResponse.json({ counts: getReactionCounts(sessionId) });
}
