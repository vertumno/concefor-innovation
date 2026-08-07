import { NextResponse } from "next/server";
import { getParticipantes } from "@/lib/db";
import { participantSession } from "@/lib/authSession";

// Mapa de bolinhas da tela Pessoas. Sem PII para não-conexões: só primeiro
// nome e iniciais; contato completo apenas nas conexões de quem está logado
// (por pessoa, não por aparelho — ver insertConnection).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(req: Request) {
  const sessao = participantSession(req);
  const meuAttendee = sessao?.attendeeId ?? null;
  const logado = meuAttendee !== null;
  const participantes = getParticipantes(meuAttendee);
  return NextResponse.json({
    logado,
    total: participantes.length,
    conexoes: participantes.filter((p) => p.conectado).length,
    participantes,
  });
}
