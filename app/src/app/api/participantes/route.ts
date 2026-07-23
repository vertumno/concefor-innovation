import { NextResponse } from "next/server";
import { getIdentity, getParticipantes } from "@/lib/db";

// Mapa de bolinhas da tela Pessoas. Sem PII para não-conexões: só primeiro
// nome e iniciais; contato completo apenas nas conexões do próprio client.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(req: Request) {
  const clientId = new URL(req.url).searchParams.get("clientId");
  const logado = clientId ? Boolean(getIdentity(clientId)) : false;
  const participantes = getParticipantes(logado ? clientId : null);
  return NextResponse.json({
    logado,
    total: participantes.length,
    conexoes: participantes.filter((p) => p.conectado).length,
    participantes,
  });
}
