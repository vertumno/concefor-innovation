import { fotoUrlByHash } from "@/lib/db";
import { mkdirSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

// GET /api/foto?h=<sha1 da URL> — proxy com cache em disco das fotos (Even3).
// Primeira vez: baixa do CDN e guarda em data/fotocache; depois serve local.
// A chave é o hash da própria URL (content-addressed — ver fotoProxy em lib/db):
// foto trocada = URL nova = hash novo, então o cache nunca fica velho e pode ser
// imutável para o navegador. Não é proxy aberto: o hash só resolve para URLs
// que estão no banco (attendees/speakers), e não dá para enumerar hashes.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DIR = join(dirname(process.env.DATABASE_PATH || "./data/concefor.db"), "fotocache");
const FETCH_TIMEOUT_MS = 8000;

export async function GET(req: Request) {
  const h = new URL(req.url).searchParams.get("h") ?? "";
  if (!/^[0-9a-f]{40}$/.test(h)) return new Response("hash inválido", { status: 400 });
  const url = fotoUrlByHash(h);
  if (!url) return new Response("foto desconhecida", { status: 404 });

  // O conteúdo de um hash nunca muda — o navegador pode guardar de vez.
  const headers = (tipo: string) => ({
    "Content-Type": tipo,
    "Cache-Control": "public, max-age=86400, immutable",
  });

  const arq = join(DIR, h);
  try {
    const [buf, tipo] = await Promise.all([readFile(arq), readFile(`${arq}.ct`, "utf8")]);
    return new Response(new Uint8Array(buf), { headers: headers(tipo) });
  } catch {
    /* ainda não está no cache: baixa abaixo */
  }

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const tipo = res.headers.get("content-type") ?? "image/jpeg";
    const buf = Buffer.from(await res.arrayBuffer());
    mkdirSync(DIR, { recursive: true });
    // Grava sem bloquear a resposta; se falhar, a próxima visita tenta de novo.
    void Promise.all([writeFile(arq, buf), writeFile(`${arq}.ct`, tipo, "utf8")]).catch(() => {});
    return new Response(new Uint8Array(buf), { headers: headers(tipo) });
  } catch {
    // CDN fora do ar ou lento: manda o navegador buscar direto, como era antes.
    return Response.redirect(url, 302);
  }
}
