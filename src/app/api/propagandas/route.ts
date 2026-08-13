import { NextResponse } from "next/server";
import { propagandaNoAr } from "@/lib/propagandas";
import { lerCartazes } from "@/lib/propagandasFs";
import { propagandasOverride } from "@/lib/db";

// GET /api/propagandas → os cartazes do telão, já ordenados para o giro.
// A fonte é a PASTA public/propagandas, não o banco: publicar um cartaz é
// soltar um .md lá e dar deploy. O telão repete esta chamada de tempos em
// tempos, então cartaz novo entra sem ninguém tocar no PC do projetor.
//
// O banco entra só para dizer quem está no ar: o `ativo:` do arquivo é o padrão
// e o /admin sobrescreve — durante o evento não dá para subir imagem nova a cada
// cartaz que entra ou sai.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const semCache = { headers: { "cache-control": "no-store" } };
  const override = propagandasOverride();
  const propagandas = (await lerCartazes()).filter((c) => propagandaNoAr(c, override));
  return NextResponse.json({ propagandas }, semCache);
}
