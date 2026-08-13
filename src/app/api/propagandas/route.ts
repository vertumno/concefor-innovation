import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { ordenarPropagandas, parsePropaganda, type Propaganda } from "@/lib/propagandas";

// GET /api/propagandas → os cartazes do telão, já ordenados para o giro.
// A fonte é a PASTA public/propagandas, não o banco: publicar um cartaz é
// soltar um .md lá e dar deploy. O telão repete esta chamada de tempos em
// tempos, então cartaz novo entra sem ninguém tocar no PC do projetor.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const pastaPublic = () => join(process.cwd(), "public");
const pastaCartazes = () => join(pastaPublic(), "propagandas");

const EH_CARTAZ = /\.(md|html?)$/i;
const EH_IMAGEM = /\.(png|jpe?g|webp|avif|gif|svg)$/i;

// `galeria: propagandas/fotos` vira a lista de imagens daquela pasta. É o que
// permite um cartaz de fotos do evento: joga as fotos na pasta e ele gira.
async function listarGaleria(pasta: string): Promise<string[]> {
  try {
    const arquivos = await readdir(join(pastaPublic(), pasta));
    return arquivos
      .filter((f) => EH_IMAGEM.test(f))
      .sort((a, b) => a.localeCompare(b, "pt-BR"))
      .map((f) => `/${pasta}/${f}`);
  } catch {
    return [];
  }
}

export async function GET() {
  const semCache = { headers: { "cache-control": "no-store" } };

  let arquivos: string[];
  try {
    arquivos = await readdir(pastaCartazes());
  } catch {
    return NextResponse.json({ propagandas: [] }, semCache); // sem pasta, sem cartaz: não é erro
  }

  // "_" na frente marca rascunho: fica versionado sem subir ao telão.
  const alvos = arquivos.filter((f) => EH_CARTAZ.test(f) && !f.startsWith("_"));

  const lidos = await Promise.all(
    alvos.map(async (arquivo) => {
      try {
        const cartaz = parsePropaganda(arquivo, await readFile(join(pastaCartazes(), arquivo), "utf8"));
        if (cartaz?.galeria) cartaz.imagens = await listarGaleria(cartaz.galeria);
        return cartaz;
      } catch {
        return null; // um arquivo problemático não pode levar os outros junto
      }
    }),
  );

  const propagandas = ordenarPropagandas(lidos.filter((c): c is Propaganda => c !== null));
  return NextResponse.json({ propagandas }, semCache);
}
