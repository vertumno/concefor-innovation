import { NextResponse } from "next/server";
import { getIdentityAttendeeId, setPerfil } from "@/lib/db";

// Contato que o próprio participante preenche (telefone/WhatsApp, Instagram) —
// voluntário, mostrado apenas às conexões dele. Campo vazio = apagar o dado.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const { clientId, telefone, instagram } = (body ?? {}) as Record<string, unknown>;

  if (typeof clientId !== "string" || !clientId) {
    return NextResponse.json({ error: "clientId requerido" }, { status: 400 });
  }
  const attendeeId = getIdentityAttendeeId(clientId);
  if (!attendeeId) {
    return NextResponse.json({ error: "entre com sua inscrição primeiro" }, { status: 401 });
  }

  const tel = typeof telefone === "string" ? telefone.replace(/\D/g, "") : "";
  if (tel && (tel.length < 10 || tel.length > 13)) {
    return NextResponse.json(
      { error: "telefone inválido — use DDD + número (ex.: 27 99999-9999)" },
      { status: 400 },
    );
  }
  const insta =
    typeof instagram === "string"
      ? instagram
          .trim()
          .replace(/^@/, "")
          .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
          .replace(/\/.*$/, "")
      : "";
  if (insta && !/^[a-zA-Z0-9._]{1,30}$/.test(insta)) {
    return NextResponse.json({ error: "usuário do Instagram inválido" }, { status: 400 });
  }

  const perfil = { telefone: tel || null, instagram: insta.toLowerCase() || null };
  setPerfil(attendeeId, perfil);
  return NextResponse.json(perfil);
}
