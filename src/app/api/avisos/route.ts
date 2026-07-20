import { NextResponse } from "next/server";
import { getAvisos } from "@/lib/db";

// Avisos da organização para o Início (mão única). Público: só os visíveis.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(getAvisos(false));
}
