import { NextResponse } from "next/server";
import { deleteIdentity, getDb, getIdentity } from "@/lib/db";

// Identidade do dispositivo (R7). GET devolve o primeiro nome + o próprio
// checkin_code (para o "meu QR" — é o dado da própria pessoa, no aparelho
// dela); DELETE é o "sair" — apaga a associação no servidor.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(req: Request) {
  const clientId = new URL(req.url).searchParams.get("clientId");
  if (!clientId) return NextResponse.json({ logado: false });
  const id = getIdentity(clientId);
  if (!id) return NextResponse.json({ logado: false });
  const row = getDb()
    .prepare(
      `select a.checkin_code as code from identities i
         join attendees a on a.id = i.attendee_id
        where i.client_id = ?`,
    )
    .get(clientId) as { code: string } | undefined;
  return NextResponse.json({
    logado: true,
    nome: id.nome.split(/\s+/)[0],
    checkinCode: row?.code ?? null,
  });
}

export async function DELETE(req: Request) {
  const clientId = new URL(req.url).searchParams.get("clientId");
  if (clientId) deleteIdentity(clientId);
  return NextResponse.json({ logado: false });
}
