import { NextResponse } from "next/server";
import { deleteIdentity, getIdentity } from "@/lib/db";

// Identidade do dispositivo (R7). GET devolve só o primeiro nome (sem PII);
// DELETE é o "sair" — apaga a associação no servidor.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(req: Request) {
  const clientId = new URL(req.url).searchParams.get("clientId");
  if (!clientId) return NextResponse.json({ logado: false });
  const id = getIdentity(clientId);
  return NextResponse.json(
    id ? { logado: true, nome: id.nome.split(/\s+/)[0] } : { logado: false },
  );
}

export async function DELETE(req: Request) {
  const clientId = new URL(req.url).searchParams.get("clientId");
  if (clientId) deleteIdentity(clientId);
  return NextResponse.json({ logado: false });
}
