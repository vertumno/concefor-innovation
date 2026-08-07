import { NextResponse } from "next/server";
import {
  attendeeByCheckin,
  deleteConnection,
  insertConnection,
} from "@/lib/db";
import { participantSession } from "@/lib/authSession";

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
  const { code } = (body ?? {}) as Record<string, unknown>;
  const sessao = participantSession(req);
  if (!sessao) {
    return NextResponse.json(
      { error: "entre com sua inscrição para se conectar" },
      { status: 401 },
    );
  }
  const codigo = typeof code === "string" ? code.replace(/\D/g, "") : "";
  if (!codigo) {
    return NextResponse.json({ error: "código inválido" }, { status: 400 });
  }

  // Só conecta com inscrito confirmado (filtro dentro de attendeeByCheckin) —
  // por isso o erro cita a confirmação: é a causa provável de não achar.
  const outro = attendeeByCheckin(codigo);
  if (!outro) {
    return NextResponse.json(
      { error: "não encontramos esse ingresso — a inscrição precisa estar confirmada" },
      { status: 404 },
    );
  }
  if (outro.id === sessao.attendeeId) {
    return NextResponse.json({ error: "esse é o seu próprio ingresso 🙂" }, { status: 400 });
  }

  const nova = insertConnection(sessao.attendeeId, outro.id, sessao.clientId);
  return NextResponse.json({
    nova,
    pessoa: { nome: outro.nome },
  });
}

// DELETE /api/connect { attendeeId } — desfaz a conexão nos DOIS
// sentidos (decisão de 05/08): espelho do conectar bilateral. Só a própria
// pessoa logada desfaz as suas; some do mosaico dos dois lados.
export async function DELETE(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const { attendeeId } = (body ?? {}) as Record<string, unknown>;
  const sessao = participantSession(req);
  if (!sessao) {
    return NextResponse.json({ error: "entre com sua inscrição" }, { status: 401 });
  }
  const outro = Number(attendeeId);
  if (!Number.isInteger(outro) || outro <= 0 || outro === sessao.attendeeId) {
    return NextResponse.json({ error: "attendeeId inválido" }, { status: 400 });
  }

  const ok = deleteConnection(sessao.attendeeId, outro);
  return NextResponse.json({ ok });
}
