import { NextResponse } from "next/server";
import { deleteIdentity, getDb, getPerfil } from "@/lib/db";
import {
  clearSessionCookie,
  participantSession,
  revokeParticipantSession,
} from "@/lib/authSession";

// Identidade do dispositivo (R7). GET devolve o primeiro nome + o próprio
// checkin_code (para o "meu QR" — é o dado da própria pessoa, no aparelho
// dela); DELETE é o "sair" — apaga a associação no servidor.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(req: Request) {
  const sessao = participantSession(req);
  if (!sessao) return NextResponse.json({ logado: false });
  const row = getDb()
    .prepare(
      `select checkin_code as code, email from attendees where id = ?`,
    )
    .get(sessao.attendeeId) as { code: string; email: string | null } | undefined;
  const perfil = getPerfil(sessao.attendeeId);
  return NextResponse.json({
    logado: true,
    nome: sessao.nome.split(/\s+/)[0],
    checkinCode: row?.code ?? null,
    email: row?.email ?? null,
    ...perfil,
  });
}

export async function DELETE(req: Request) {
  const sessao = revokeParticipantSession(req);
  if (sessao) deleteIdentity(sessao.clientId);
  const response = NextResponse.json({ logado: false });
  response.headers.append("Set-Cookie", clearSessionCookie());
  return response;
}
