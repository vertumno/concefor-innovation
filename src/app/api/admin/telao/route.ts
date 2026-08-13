import { NextResponse } from "next/server";
import {
  setTelaoPerguntas,
  setTelaoPropagandas,
  telaoPerguntasVisiveis,
  telaoPropagandasNoAoVivo,
} from "@/lib/db";
import { isAdmin, unauthorized } from "@/lib/adminAuth";

// Config do telão: painel de perguntas e propagandas durante sessão ao vivo.
// Vira registro tipo='telao_config' na linha do tempo — estado = último evento.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/admin/telao { perguntas?: boolean, propagandas?: boolean }
//   → { perguntas, propagandas }
export async function POST(req: Request) {
  if (!isAdmin(req)) return unauthorized();
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const { perguntas, propagandas } = (body ?? {}) as Record<string, unknown>;

  // Um POST por botão, mas os dois campos são opcionais: quem manda só um não
  // mexe no outro (era o jeito de apagar o estado alheio sem perceber).
  if (typeof perguntas !== "boolean" && typeof propagandas !== "boolean") {
    return NextResponse.json(
      { error: "informe 'perguntas' e/ou 'propagandas' (boolean)" },
      { status: 400 },
    );
  }
  if (typeof perguntas === "boolean") setTelaoPerguntas(perguntas);
  if (typeof propagandas === "boolean") setTelaoPropagandas(propagandas);

  return NextResponse.json({
    perguntas: telaoPerguntasVisiveis(),
    propagandas: telaoPropagandasNoAoVivo(),
  });
}
