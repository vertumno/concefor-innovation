import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  try {
    const row = getDb().prepare("select 1 as ok").get() as { ok: number };
    if (row.ok !== 1) throw new Error("leitura inesperada");
    return NextResponse.json(
      { status: "ok", ts: new Date().toISOString() },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json({ status: "error" }, { status: 503 });
  }
}
