import { NextResponse } from "next/server";
import { telaoPerguntasVisiveis, telaoPropagandasNoAoVivo } from "@/lib/db";

// Ajustes do telão controlados pelo /admin (escrita em /api/admin/telao).
// GET público: o telão consulta junto com o poll das perguntas.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/telao → { perguntas: boolean, propagandas: boolean }
export function GET() {
  return NextResponse.json({
    perguntas: telaoPerguntasVisiveis(),
    propagandas: telaoPropagandasNoAoVivo(),
  });
}
