import { NextResponse } from "next/server";
import {
  attendeeByCheckin,
  getIdentityAttendeeId,
  insertConnection,
} from "@/lib/db";

// Conectar com outra pessoa (networking): escaneia o QR do crachá dela (ou
// digita o nº do ingresso). Exige estar logado — a conexão é entre pessoas,
// não entre aparelhos. Sem chat: é troca de contato (decisão do benchmark EDEN).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const { clientId, code } = (body ?? {}) as Record<string, unknown>;

  if (typeof clientId !== "string" || !clientId) {
    return NextResponse.json({ error: "clientId requerido" }, { status: 400 });
  }
  const meuAttendee = getIdentityAttendeeId(clientId);
  if (!meuAttendee) {
    return NextResponse.json(
      { error: "entre com sua inscrição para se conectar" },
      { status: 401 },
    );
  }
  const codigo = typeof code === "string" ? code.replace(/\D/g, "") : "";
  if (!codigo) {
    return NextResponse.json({ error: "código inválido" }, { status: 400 });
  }

  const outro = attendeeByCheckin(codigo);
  if (!outro) {
    return NextResponse.json({ error: "não encontramos esse ingresso" }, { status: 404 });
  }
  if (outro.id === meuAttendee) {
    return NextResponse.json({ error: "esse é o seu próprio ingresso 🙂" }, { status: 400 });
  }

  const nova = insertConnection(clientId, outro.id);
  return NextResponse.json({
    nova,
    pessoa: { nome: outro.nome, email: outro.email },
  });
}
