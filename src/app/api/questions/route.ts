import { NextResponse } from "next/server";
import {
  getQuestions,
  insertQuestion,
  questionsWindowOpen,
  sessionExists,
} from "@/lib/db";
import { isAdmin } from "@/lib/adminAuth";

// Perguntas com upvote (R4). Anônimas no app (autor oculto); texto curto;
// janela controlada pelo admin. Tudo vira registro em timeline_events.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_CHARS = 140;
const THROTTLE_MS = 15000; // 1 pergunta a cada 15s por dispositivo
type ThrottleGlobal = { questionLast?: Map<string, number> };
const g = globalThis as unknown as ThrottleGlobal;

// GET /api/questions?sessionId=&clientId= → { open, questions }
// Com token de admin: inclui as ocultas (moderação).
export function GET(req: Request) {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("sessionId");
  const clientId = url.searchParams.get("clientId");
  if (!sessionId || !sessionExists(sessionId)) {
    return NextResponse.json({ error: "sessão desconhecida" }, { status: 400 });
  }
  const admin = isAdmin(req);
  return NextResponse.json({
    open: questionsWindowOpen(sessionId),
    questions: getQuestions(sessionId, clientId, admin),
  });
}

// POST /api/questions { sessionId, texto, clientId } → cria pergunta.
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const { sessionId, texto, clientId } = (body ?? {}) as Record<string, unknown>;

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

  const cid = typeof clientId === "string" && clientId ? clientId : "anon";
  const last = (g.questionLast ??= new Map()).get(cid) ?? 0;
  const now = Date.now();
  if (now - last < THROTTLE_MS) {
    return NextResponse.json({ error: "calma — uma pergunta a cada 15s" }, { status: 429 });
  }
  g.questionLast.set(cid, now);

  const id = insertQuestion(sessionId, t, cid === "anon" ? null : cid);
  return NextResponse.json({ id, questions: getQuestions(sessionId, cid, false) });
}
