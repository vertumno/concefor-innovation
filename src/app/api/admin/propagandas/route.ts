import { NextResponse } from "next/server";
import { propagandaNoAr } from "@/lib/propagandas";
import { lerCartazes } from "@/lib/propagandasFs";
import { propagandasOverride, setPropagandaAtiva } from "@/lib/db";
import { isAdmin, unauthorized } from "@/lib/adminAuth";

// Quais cartazes do telão estão no ar. Lista TODOS os arquivos da pasta,
// inclusive os desligados — um cartaz invisível para o /admin é um cartaz que
// ninguém consegue religar.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/admin/propagandas → { propagandas: [{ id, titulo, posicao, ordem,
//   duracao, noArquivo, noAr }] }. `noArquivo` é o que o .md diz; `noAr` é o
//   que vale depois do override — a tela mostra a diferença entre os dois.
export async function GET(req: Request) {
  if (!isAdmin(req)) return unauthorized();

  const override = propagandasOverride();
  const propagandas = (await lerCartazes()).map((c) => ({
    id: c.id,
    titulo: c.titulo,
    chamada: c.chamada,
    posicao: c.posicao,
    ordem: c.ordem,
    duracao: c.duracao,
    temQr: Boolean(c.qr),
    temImagem: Boolean(c.imagem) || Boolean(c.imagens?.length),
    noArquivo: c.ativo,
    noAr: propagandaNoAr(c, override),
  }));

  return NextResponse.json({ propagandas }, { headers: { "cache-control": "no-store" } });
}

// POST /api/admin/propagandas { id, ativo } → { id, ativo }
export async function POST(req: Request) {
  if (!isAdmin(req)) return unauthorized();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const { id, ativo } = (body ?? {}) as Record<string, unknown>;

  if (typeof id !== "string" || !id.trim() || typeof ativo !== "boolean") {
    return NextResponse.json({ error: "informe 'id' (string) e 'ativo' (boolean)" }, { status: 400 });
  }

  // Só aceita id de cartaz que existe na pasta: sem isso, um id errado viraria
  // um registro fantasma que nunca mais aparece na tela para ser desfeito.
  const existe = (await lerCartazes()).some((c) => c.id === id);
  if (!existe) return NextResponse.json({ error: "cartaz não encontrado" }, { status: 404 });

  setPropagandaAtiva(id, ativo);
  return NextResponse.json({ id, ativo });
}
