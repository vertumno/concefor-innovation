import { NextResponse } from "next/server";
import { sessionExists, setQuestionHidden, setQuestionsWindow } from "@/lib/db";
import { isAdmin, unauthorized } from "@/lib/adminAuth";

// Controles de moderação das perguntas (R4, via /admin):
//   { sessionId, action: "open" | "close" }            → janela de perguntas
//   { questionId, action: "hide" | "unhide" }          → oculta/reexibe
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!isAdmin(req)) return unauthorized();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const { sessionId, questionId, action } = (body ?? {}) as Record<string, unknown>;

  if (action === "open" || action === "close") {
    if (typeof sessionId !== "string" || !sessionExists(sessionId)) {
      return NextResponse.json({ error: "sessão desconhecida" }, { status: 400 });
    }
    setQuestionsWindow(sessionId, action === "open");
    return NextResponse.json({ ok: true, open: action === "open" });
  }

  if (action === "hide" || action === "unhide") {
    if (typeof questionId !== "string" || !setQuestionHidden(questionId, action === "hide")) {
      return NextResponse.json({ error: "pergunta desconhecida" }, { status: 400 });
    }
    return NextResponse.json({ ok: true, hidden: action === "hide" });
  }

  return NextResponse.json({ error: "action inválida" }, { status: 400 });
}
