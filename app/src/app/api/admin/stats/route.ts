import { NextResponse } from "next/server";
import { getAdminStats } from "@/lib/db";
import { isAdmin, unauthorized } from "@/lib/adminAuth";

// Números ao vivo do dashboard (R3). Protegido por ADMIN_TOKEN.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(req: Request) {
  if (!isAdmin(req)) return unauthorized();
  return NextResponse.json(getAdminStats());
}
