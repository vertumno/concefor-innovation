import { NextResponse } from "next/server";
import { setPerfil } from "@/lib/db";
import { participantSession } from "@/lib/authSession";

// Contato que o próprio participante preenche (telefone, Instagram) —
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
  const { telefonePais, telefone, instagram, shareEmail, shareTelefone, shareInstagram } =
    (body ?? {}) as Record<string, unknown>;

  const sessao = participantSession(req);
  if (!sessao) {
    return NextResponse.json({ error: "entre com sua inscrição primeiro" }, { status: 401 });
  }

  const pais = typeof telefonePais === "string" ? telefonePais.replace(/\D/g, "") : "55";
  const tel = typeof telefone === "string" ? telefone.replace(/\D/g, "") : "";
  if (tel && (pais.length < 1 || pais.length > 3)) {
    return NextResponse.json(
      { field: "telefone", error: "código do país inválido — use de 1 a 3 dígitos" },
      { status: 400 },
    );
  }
  const totalDigits = pais.length + tel.length;
  if (tel && (totalDigits < 7 || totalDigits > 15)) {
    return NextResponse.json(
      { field: "telefone", error: "telefone inválido — confira o código do país e o número" },
      { status: 400 },
    );
  }
  if (tel && pais === "55" && !/^\d{10,11}$/.test(tel)) {
    return NextResponse.json(
      { field: "telefone", error: "no Brasil, informe DDD + número (ex.: 27 99999-9999)" },
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
    return NextResponse.json(
      { field: "instagram", error: "usuário do Instagram inválido" },
      { status: 400 },
    );
  }

  const perfil = {
    telefonePais: pais || "55",
    telefone: tel || null,
    instagram: insta.toLowerCase() || null,
    shareEmail: shareEmail === true,
    shareTelefone: shareTelefone === true,
    shareInstagram: shareInstagram === true,
  };
  setPerfil(sessao.attendeeId, perfil);
  return NextResponse.json(perfil);
}
