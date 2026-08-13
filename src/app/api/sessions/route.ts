import { NextResponse } from "next/server";
import { getSessions } from "@/lib/db";

// Backend próprio (SQLite) — a UI consome isto fora do modo demo (ver lib/sessions.ts).
export const runtime = "nodejs"; // better-sqlite3 é binário nativo: precisa do runtime Node
export const dynamic = "force-dynamic"; // dados vivos: nunca pré-renderizar/cachear no build

export function GET() {
  // force-dynamic só impede o cache do build; quem repete a chamada por horas é
  // o navegador do telão. O cabeçalho é o que garante que ele não guarde nada.
  return NextResponse.json(getSessions(), { headers: { "cache-control": "no-store" } });
}
