import { NextResponse } from "next/server";
import { sessionExists, updateSessionAdmin } from "@/lib/db";
import { isAdmin, unauthorized } from "@/lib/adminAuth";

// Ajuste de última hora da programação (R9): horário/sala de uma sessão.
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
  const { id, inicio, fim, sala } = (body ?? {}) as Record<string, unknown>;

  if (typeof id !== "string" || !sessionExists(id)) {
    return NextResponse.json({ error: "sessão desconhecida" }, { status: 400 });
  }
  const campos: { inicio?: string; fim?: string | null; sala?: string | null } = {};
  if (typeof inicio === "string" && inicio) campos.inicio = inicio;
  if (typeof fim === "string") campos.fim = fim || null;
  if (typeof sala === "string") campos.sala = sala.trim() || null;

  if (!updateSessionAdmin(id, campos)) {
    return NextResponse.json({ error: "nada para atualizar" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
