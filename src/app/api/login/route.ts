import { NextResponse } from "next/server";
import { findAttendeeByLogin, upsertIdentity } from "@/lib/db";
import { createParticipantSession, sessionCookie } from "@/lib/authSession";

// Login pelo crachá (R7): nº do ingresso (checkin_code, 8 dígitos) + segundo
// fator — 4 primeiros dígitos do CPF (20/07) OU o e-mail da inscrição (29/07),
// no mesmo campo. Exige consentimento explícito (LGPD).
// Associa o client_id (dispositivo) ao inscrito; PII não volta na resposta —
// só o primeiro nome, para o avatar.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Anti força-bruta: 5 tentativas por minuto por IP + ingresso. clientId é
// controlado pelo navegador e, portanto, nunca pode ser a chave de segurança.
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
  // `cpf4` é o nome antigo do campo: um app já aberto (ou em cache do PWA)
  // continua mandando por ele.
  const { checkinCode, segundoFator, cpf4, clientId, consent } = (body ?? {}) as Record<
    string,
    unknown
  >;

  if (consent !== true) {
    return NextResponse.json({ error: "é preciso aceitar o termo para entrar" }, { status: 400 });
  }
  if (typeof clientId !== "string" || !/^[a-zA-Z0-9_-]{8,100}$/.test(clientId)) {
    return NextResponse.json({ error: "clientId requerido" }, { status: 400 });
  }
  const code = typeof checkinCode === "string" ? checkinCode.replace(/\D/g, "") : "";
  const bruto = typeof segundoFator === "string" ? segundoFator : cpf4;
  const fator = (typeof bruto === "string" ? bruto : "").trim().slice(0, 254);
  const fatorValido = fator.includes("@")
    ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fator)
    : fator.replace(/\D/g, "").length === 4;
  if (!code || !fatorValido) {
    return NextResponse.json(
      {
        error:
          "informe o nº do ingresso e os 4 primeiros dígitos do CPF (ou o e-mail da inscrição)",
      },
      { status: 400 },
    );
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "ip-desconhecido";
  const throttleKey = `${ip}:${code}`;
  const tries = (g.loginTries ??= new Map());
  const now = Date.now();
  const recent = (tries.get(throttleKey) ?? []).filter((t: number) => now - t < WINDOW_MS);
  if (recent.length >= MAX_TRIES) {
    return NextResponse.json(
      { error: "muitas tentativas — aguarde um minuto" },
      { status: 429 },
    );
  }
  recent.push(now);
  tries.set(throttleKey, recent);

  const attendee = findAttendeeByLogin(code, fator);
  if (!attendee) {
    return NextResponse.json(
      {
        error: fator.includes("@")
          ? "não encontramos essa combinação de ingresso e e-mail"
          : "não encontramos essa combinação de ingresso e CPF",
      },
      { status: 401 },
    );
  }
  // Só inscrito confirmado entra (decisão de 04/08). O erro é específico de
  // propósito: a pessoa achou o próprio cadastro, o que falta é a confirmação —
  // mandar "não encontramos" faria ela tentar de novo à toa.
  if (!attendee.confirmado) {
    return NextResponse.json(
      {
        error:
          "sua inscrição ainda não está confirmada no Even3 — procure a organização no credenciamento",
      },
      { status: 403 },
    );
  }

  upsertIdentity(clientId, attendee.id, attendee.nome);
  const sessao = createParticipantSession({
    attendeeId: attendee.id,
    clientId,
    nome: attendee.nome,
  });
  const response = NextResponse.json({ nome: attendee.nome.split(/\s+/)[0] });
  response.headers.append("Set-Cookie", sessionCookie(sessao.token));
  return response;
}
