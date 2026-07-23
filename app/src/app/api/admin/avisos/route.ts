import { NextResponse } from "next/server";
import { getAvisos, insertAviso, setAvisoHidden } from "@/lib/db";
import { isAdmin, unauthorized } from "@/lib/adminAuth";

// Publicação e moderação dos avisos do Início (admin):
//   GET                                → lista com ocultos
//   POST { texto }                     → publica
//   POST { avisoId, action: hide|unhide } → oculta/reexibe
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_CHARS = 280;

export function GET(req: Request) {
  if (!isAdmin(req)) return unauthorized();
  return NextResponse.json(getAvisos(true));
}

export async function POST(req: Request) {
  if (!isAdmin(req)) return unauthorized();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const { texto, avisoId, action } = (body ?? {}) as Record<string, unknown>;

  if (action === "hide" || action === "unhide") {
    if (typeof avisoId !== "string" || !setAvisoHidden(avisoId, action === "hide")) {
      return NextResponse.json({ error: "aviso desconhecido" }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  }

  const t = typeof texto === "string" ? texto.trim() : "";
  if (!t || t.length > MAX_CHARS) {
    return NextResponse.json(
      { error: `aviso precisa ter entre 1 e ${MAX_CHARS} caracteres` },
      { status: 400 },
    );
  }
  const id = insertAviso(t);
  return NextResponse.json({ id, avisos: getAvisos(true) });
}
