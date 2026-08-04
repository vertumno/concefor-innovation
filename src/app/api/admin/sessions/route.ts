import { NextResponse } from "next/server";
import {
  deleteSessaoTeste,
  insertBlocoTeste,
  sessionExists,
  updateSessionAdmin,
} from "@/lib/db";
import { isAdmin, unauthorized } from "@/lib/adminAuth";

// Programação pelo admin:
//   POST { id, inicio?, fim?, sala? }            → ajuste de última hora (R9)
//   POST { action: "bloco-teste", titulo?, descricao?, minutos?, sala? } → bloco ao vivo agora
//   POST { action: "apagar", id }                → apaga bloco de teste
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TITULO_PADRAO = "Teste do app — reaja e pergunte";
const MINUTOS_PADRAO = 60;
const MINUTOS_MAX = 480;

export async function POST(req: Request) {
  if (!isAdmin(req)) return unauthorized();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const { id, inicio, fim, sala, action, titulo, descricao, minutos } = (body ?? {}) as Record<
    string,
    unknown
  >;

  if (action === "bloco-teste") {
    const t = typeof titulo === "string" && titulo.trim() ? titulo.trim() : TITULO_PADRAO;
    const m = Number(minutos);
    const dur = Number.isFinite(m) && m > 0 ? Math.min(Math.round(m), MINUTOS_MAX) : MINUTOS_PADRAO;
    const local = typeof sala === "string" && sala.trim() ? sala.trim() : null;
    // Descrição vazia cai no texto padrão (ver DESCRICAO_PADRAO_TESTE no db).
    const desc = typeof descricao === "string" ? descricao.trim().slice(0, 400) : "";
    return NextResponse.json({
      ok: true,
      ...insertBlocoTeste({
        titulo: t.slice(0, 120),
        minutos: dur,
        sala: local,
        descricao: desc || null,
      }),
    });
  }

  if (action === "apagar") {
    if (typeof id !== "string" || !deleteSessaoTeste(id)) {
      return NextResponse.json(
        { error: "só dá para apagar blocos de teste criados aqui" },
        { status: 400 },
      );
    }
    return NextResponse.json({ ok: true });
  }

  if (typeof id !== "string" || !sessionExists(id)) {
    return NextResponse.json({ error: "sessão desconhecida" }, { status: 400 });
  }
  const campos: { inicio?: string; fim?: string | null; sala?: string | null } = {};
  if (typeof inicio === "string" && inicio) campos.inicio = inicio;
  if (typeof fim === "string") campos.fim = fim || null;
  if (typeof sala === "string") campos.sala = sala.trim() || null;

  if (!updateSessionAdmin(id, campos)) {
    return NextResponse.json({ error: "nada para atualizar" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
