import { NextResponse } from "next/server";
import { getIdentityAttendeeId, getParticipantes } from "@/lib/db";

// Mapa de bolinhas da tela Pessoas. Sem PII para não-conexões: só primeiro
// nome e iniciais; contato completo apenas nas conexões de quem está logado
// (por pessoa, não por aparelho — ver insertConnection).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(req: Request) {
  const clientId = new URL(req.url).searchParams.get("clientId");
  const meuAttendee = clientId ? getIdentityAttendeeId(clientId) : null;
  const logado = meuAttendee !== null;
  const participantes = getParticipantes(meuAttendee);
  return NextResponse.json({
    logado,
    total: participantes.length,
    conexoes: participantes.filter((p) => p.conectado).length,
    participantes,
  });
}
