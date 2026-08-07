import { NextResponse } from "next/server";
import {
  getQuestions,
  insertQuestion,
  questionsWindowOpen,
  sessionExists,
} from "@/lib/db";
import { isAdmin } from "@/lib/adminAuth";
import { participantSession } from "@/lib/authSession";

// Perguntas com upvote (R4). IDENTIFICADAS (decisão de 05/08): só logado envia
// e a pergunta sai com o nome completo de quem mandou — inibe pergunta tosca ou
// ofensiva. Texto curto; janela controlada pelo admin; tudo em timeline_events.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_CHARS = 140;
const THROTTLE_MS = 30000; // 1 pergunta a cada 30s por dispositivo (era 15s; 05/08)
type ThrottleGlobal = { questionLast?: Map<string, number> };
const g = globalThis as unknown as ThrottleGlobal;

// GET /api/questions?sessionId= → { open, questions }
// Com token de admin: inclui as ocultas (moderação).
export function GET(req: Request) {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("sessionId");
  if (!sessionId || !sessionExists(sessionId)) {
    return NextResponse.json({ error: "sessão desconhecida" }, { status: 400 });
  }
  const admin = isAdmin(req);
  const sessao = participantSession(req);
  return NextResponse.json({
    open: questionsWindowOpen(sessionId),
    questions: getQuestions(sessionId, sessao?.attendeeId ?? null, admin),
  });
}

// POST /api/questions { sessionId, texto } → cria pergunta.
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const { sessionId, texto } = (body ?? {}) as Record<string, unknown>;

  if (typeof sessionId !== "string" || !sessionExists(sessionId)) {
    return NextResponse.json({ error: "sessão desconhecida" }, { status: 400 });
  }
  if (!questionsWindowOpen(sessionId)) {
    return NextResponse.json({ error: "janela de perguntas fechada" }, { status: 403 });
  }
  const t = typeof texto === "string" ? texto.trim() : "";
  if (!t || t.length > MAX_CHARS) {
    return NextResponse.json(
      { error: `pergunta precisa ter entre 1 e ${MAX_CHARS} caracteres` },
      { status: 400 },
    );
  }

  // Pergunta é identificada: exige login e fotografa o nome completo no envio.
  const sessao = participantSession(req);
  if (!sessao) {
    return NextResponse.json({ error: "entre com seu ingresso para perguntar" }, { status: 401 });
  }
  const cid = sessao.clientId;

  const last = (g.questionLast ??= new Map()).get(cid) ?? 0;
  const now = Date.now();
  if (now - last < THROTTLE_MS) {
    return NextResponse.json({ error: "calma — uma pergunta a cada 30s" }, { status: 429 });
  }
  g.questionLast.set(cid, now);

  const id = insertQuestion(sessionId, t, cid, sessao.attendeeId, sessao.nome);
  return NextResponse.json({
    id,
    questions: getQuestions(sessionId, sessao.attendeeId, false),
  });
}
