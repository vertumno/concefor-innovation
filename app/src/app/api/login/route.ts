import { NextResponse } from "next/server";
import { findAttendeeByLogin, upsertIdentity } from "@/lib/db";

// Login pelo crachá (R7): nº do ingresso (checkin_code, 8 dígitos) + 4 primeiros
// dígitos do CPF (decisão de 20/07). Exige consentimento explícito (LGPD).
// Associa o client_id (dispositivo) ao inscrito; PII não volta na resposta —
// só o primeiro nome, para o avatar.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Anti força-bruta: 5 tentativas por minuto por dispositivo.
const WINDOW_MS = 60_000;
const MAX_TRIES = 5;
type ThrottleGlobal = { loginTries?: Map<string, number[]> };
const g = globalThis as unknown as ThrottleGlobal;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const { checkinCode, cpf4, clientId, consent } = (body ?? {}) as Record<string, unknown>;

  if (consent !== true) {
    return NextResponse.json({ error: "é preciso aceitar o termo para entrar" }, { status: 400 });
  }
  if (typeof clientId !== "string" || !clientId) {
    return NextResponse.json({ error: "clientId requerido" }, { status: 400 });
  }
  const code = typeof checkinCode === "string" ? checkinCode.replace(/\D/g, "") : "";
  const cpf = typeof cpf4 === "string" ? cpf4.replace(/\D/g, "") : "";
  if (!code || cpf.length !== 4) {
    return NextResponse.json(
      { error: "informe o nº do ingresso e os 4 primeiros dígitos do CPF" },
      { status: 400 },
    );
  }

  const tries = (g.loginTries ??= new Map());
  const now = Date.now();
  const recent = (tries.get(clientId) ?? []).filter((t: number) => now - t < WINDOW_MS);
  if (recent.length >= MAX_TRIES) {
    return NextResponse.json(
      { error: "muitas tentativas — aguarde um minuto" },
      { status: 429 },
    );
  }
  recent.push(now);
  tries.set(clientId, recent);

  const attendee = findAttendeeByLogin(code, cpf);
  if (!attendee) {
    return NextResponse.json(
      { error: "não encontramos essa combinação de ingresso e CPF" },
      { status: 401 },
    );
  }

  upsertIdentity(clientId, attendee.id, attendee.nome);
  return NextResponse.json({ nome: attendee.nome.split(/\s+/)[0] });
}
