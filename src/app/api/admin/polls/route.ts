import { NextResponse } from "next/server";
import { isAdmin, unauthorized } from "@/lib/adminAuth";
import {
  closePoll,
  createPoll,
  getAdminPoll,
  getPollById,
  sessionExists,
  setPollMode,
  setPollResponseStatus,
} from "@/lib/db";
import {
  normalizeStopwords,
  POLL_QUESTION_MAX,
  type PollMode,
  type PollResponseStatus,
} from "@/lib/polls";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(req: Request) {
  if (!isAdmin(req)) return unauthorized();
  return NextResponse.json({ poll: getAdminPoll() });
}

export async function POST(req: Request) {
  if (!isAdmin(req)) return unauthorized();
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const { action, pollId, responseId, sessionId, question, stopwords, mode } = (body ?? {}) as Record<
    string,
    unknown
  >;

  if (action === "create") {
    const q = typeof question === "string" ? question.trim() : "";
    if (!q || q.length > POLL_QUESTION_MAX) {
      return NextResponse.json(
        { error: `pergunta precisa ter entre 1 e ${POLL_QUESTION_MAX} caracteres` },
        { status: 400 },
      );
    }
    if (typeof sessionId !== "string" || !sessionExists(sessionId)) {
      return NextResponse.json({ error: "escolha uma sessão válida" }, { status: 400 });
    }
    return NextResponse.json({
      poll: createPoll({ sessionId, question: q, stopwords: normalizeStopwords(stopwords) }),
    });
  }

  if (typeof pollId !== "string" || !getPollById(pollId, true)) {
    return NextResponse.json({ error: "enquete desconhecida" }, { status: 400 });
  }
  if (action === "close") {
    closePoll(pollId);
  } else if (action === "mode") {
    if (mode !== "cloud" && mode !== "list") {
      return NextResponse.json({ error: "modo inválido" }, { status: 400 });
    }
    setPollMode(pollId, mode as PollMode);
  } else if (action === "approve" || action === "hide" || action === "pending") {
    if (typeof responseId !== "string") {
      return NextResponse.json({ error: "resposta desconhecida" }, { status: 400 });
    }
    const status: PollResponseStatus =
      action === "approve" ? "approved" : action === "hide" ? "hidden" : "pending";
    if (!setPollResponseStatus(pollId, responseId, status)) {
      return NextResponse.json({ error: "resposta desconhecida" }, { status: 400 });
    }
  } else {
    return NextResponse.json({ error: "ação inválida" }, { status: 400 });
  }
  return NextResponse.json({ poll: getPollById(pollId, true) });
}
