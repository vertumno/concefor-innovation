import { NextResponse } from "next/server";
import { setTelaoPerguntas, telaoPerguntasVisiveis } from "@/lib/db";
import { isAdmin, unauthorized } from "@/lib/adminAuth";

// Config do telão (por ora: mostrar/ocultar o painel de perguntas).
// Vira registro tipo='telao_config' na linha do tempo — estado = último evento.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/admin/telao { perguntas: boolean } → { perguntas }
export async function POST(req: Request) {
  if (!isAdmin(req)) return unauthorized();
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const { perguntas } = (body ?? {}) as Record<string, unknown>;
  if (typeof perguntas !== "boolean") {
    return NextResponse.json({ error: "campo 'perguntas' (boolean) obrigatório" }, { status: 400 });
  }
  setTelaoPerguntas(perguntas);
  return NextResponse.json({ perguntas: telaoPerguntasVisiveis() });
}
