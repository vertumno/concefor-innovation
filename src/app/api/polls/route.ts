import { NextResponse } from "next/server";
import {
  getActivePoll,
  getPollById,
  getProjectionPoll,
  insertPollResponse,
  sessionExists,
} from "@/lib/db";
import { participantSession } from "@/lib/authSession";
import { POLL_COOLDOWN_SECONDS, POLL_RESPONSE_MAX } from "@/lib/polls";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const THROTTLE_MS = POLL_COOLDOWN_SECONDS * 1000;
type PollThrottleGlobal = { pollResponseLast?: Map<string, number> };
const g = globalThis as unknown as PollThrottleGlobal;

export function GET(req: Request) {
  const url = new URL(req.url);
  if (url.searchParams.get("projection") === "1") {
    return NextResponse.json({ poll: getProjectionPoll() });
  }
  const sessionId = url.searchParams.get("sessionId");
  if (!sessionId || !sessionExists(sessionId)) {
    return NextResponse.json({ error: "sessão desconhecida" }, { status: 400 });
  }
  const sessao = participantSession(req);
  return NextResponse.json({
    // Participante usa pergunta/status/contador próprio, não a lista inteira.
    poll: getActivePoll(sessionId, sessao?.attendeeId ?? null, false),
  });
}

export async function POST(req: Request) {
  const sessao = participantSession(req);
  if (!sessao) {
    return NextResponse.json({ error: "entre com seu ingresso para responder" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const { pollId, texto } = (body ?? {}) as Record<string, unknown>;
  const t = typeof texto === "string" ? texto.trim() : "";
  if (!t || t.length > POLL_RESPONSE_MAX) {
    return NextResponse.json(
      { error: `resposta precisa ter entre 1 e ${POLL_RESPONSE_MAX} caracteres` },
      { status: 400 },
    );
  }
  if (typeof pollId !== "string") {
    return NextResponse.json({ error: "enquete desconhecida" }, { status: 400 });
  }
  const poll = getPollById(pollId, false, sessao.attendeeId, false);
  if (!poll || poll.status !== "active") {
    return NextResponse.json({ error: "esta enquete já foi encerrada" }, { status: 409 });
  }

  const key = `${poll.id}:${sessao.attendeeId}`;
  const now = Date.now();
  const last = (g.pollResponseLast ??= new Map()).get(key) ?? 0;
  if (now - last < THROTTLE_MS) {
    const retryAfterMs = THROTTLE_MS - (now - last);
    return NextResponse.json(
      { error: `aguarde ${POLL_COOLDOWN_SECONDS} segundos entre respostas`, retryAfterMs },
      { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } },
    );
  }
  g.pollResponseLast.set(key, now);

  insertPollResponse({
    pollId: poll.id,
    sessionId: poll.sessionId,
    texto: t,
    attendeeId: sessao.attendeeId,
    autor: sessao.nome,
    clientId: sessao.clientId,
  });
  return NextResponse.json({
    ok: true,
    cooldownSeconds: POLL_COOLDOWN_SECONDS,
  });
}
