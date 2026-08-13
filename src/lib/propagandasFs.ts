// Leitura da PASTA de cartazes (public/propagandas). Vive fora de
// src/lib/propagandas.ts, que é puro de propósito para rodar no `npm test`;
// aqui é onde o disco entra. Duas rotas usam: a pública (/api/propagandas), que
// só serve o que está no ar, e a do /admin, que precisa ver todos — inclusive os
// desligados, senão não há como religar.
//
// SERVER-ONLY (usa node:fs) — não importar em componente de cliente.

import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { ordenarPropagandas, parsePropaganda, type Propaganda } from "@/lib/propagandas";

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

// Todos os cartazes da pasta, já ordenados para o giro — sem filtrar por `ativo`.
// Pasta ausente devolve lista vazia: não é erro, é um evento sem divulgação.
export async function lerCartazes(): Promise<Propaganda[]> {
  let arquivos: string[];
  try {
    arquivos = await readdir(pastaCartazes());
  } catch {
    return [];
  }

  // "_" na frente marca rascunho: fica versionado sem subir ao telão.
  const alvos = arquivos.filter((f) => EH_CARTAZ.test(f) && !f.startsWith("_"));

  const lidos = await Promise.all(
    alvos.map(async (arquivo) => {
      try {
        const cartaz = parsePropaganda(arquivo, await readFile(join(pastaCartazes(), arquivo), "utf8"));
        if (cartaz.galeria) cartaz.imagens = await listarGaleria(cartaz.galeria);
        return cartaz;
      } catch {
        return null; // um arquivo problemático não pode levar os outros junto
      }
    }),
  );

  return ordenarPropagandas(lidos.filter((c): c is Propaganda => c !== null));
}
