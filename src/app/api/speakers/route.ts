import { NextResponse } from "next/server";
import { getSpeakers } from "@/lib/db";

// Palestrantes para a tela Pessoas (ver lib/speakers.ts).
export const runtime = "nodejs"; // better-sqlite3 é binário nativo: precisa do runtime Node
export const dynamic = "force-dynamic"; // dados vivos: nunca pré-renderizar/cachear no build

export function GET() {
  return NextResponse.json(getSpeakers());
}
