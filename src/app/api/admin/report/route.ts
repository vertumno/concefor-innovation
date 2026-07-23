import { NextResponse } from "next/server";
import { getReport } from "@/lib/db";
import { isAdmin, unauthorized } from "@/lib/adminAuth";

// Relatório pós-evento (R9) — dados para /admin/relatorio (imprimível).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(req: Request) {
  if (!isAdmin(req)) return unauthorized();
  return NextResponse.json(getReport());
}
