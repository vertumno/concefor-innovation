import { NextResponse } from "next/server";
import { getQuestions, questionExists, sessionExists, toggleQuestionVote } from "@/lib/db";
import { participantSession } from "@/lib/authSession";

// Upvote de pergunta (R4): 1 voto por pessoa por pergunta — segundo
// toque retira o voto (toggle). Como toda interação (decisão de 05/08),
// votar exige estar logado; anônimo só vê.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const { sessionId, questionId } = (body ?? {}) as Record<string, unknown>;

  if (typeof sessionId !== "string" || !sessionExists(sessionId)) {
    return NextResponse.json({ error: "sessão desconhecida" }, { status: 400 });
  }
  if (typeof questionId !== "string" || !questionExists(sessionId, questionId)) {
    return NextResponse.json({ error: "pergunta desconhecida" }, { status: 400 });
  }
  const sessao = participantSession(req);
  if (!sessao) {
    return NextResponse.json({ error: "entre com seu ingresso para votar" }, { status: 401 });
  }

  const { voted } = toggleQuestionVote(
    sessionId,
    questionId,
    sessao.clientId,
    sessao.attendeeId,
  );
  return NextResponse.json({
    voted,
    questions: getQuestions(sessionId, sessao.attendeeId, false),
  });
}
