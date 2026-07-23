import { NextResponse } from "next/server";
import { isAdmin, unauthorized } from "@/lib/adminAuth";
// Mesma lógica do `npm run sync:even3` — fonte única (ver scripts/sync-even3.mjs).
import { runSync } from "../../../../../scripts/sync-even3.mjs";

// Botão "re-sincronizar Even3" do /admin (R3). O Next carrega .env.local no
// servidor, então EVEN3_API_TOKEN está em process.env aqui.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!isAdmin(req)) return unauthorized();
  try {
    const r = await runSync({ token: process.env.EVEN3_API_TOKEN });
    return NextResponse.json(r);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
