import { NextResponse } from "next/server";
import { getSessions } from "@/lib/db";

// Backend próprio (SQLite) — a UI consome isto fora do modo demo (ver lib/sessions.ts).
export const runtime = "nodejs"; // better-sqlite3 é binário nativo: precisa do runtime Node
export const dynamic = "force-dynamic"; // dados vivos: nunca pré-renderizar/cachear no build

export function GET() {
  return NextResponse.json(getSessions());
}
