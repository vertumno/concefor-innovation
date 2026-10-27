// Fotos da cobertura → posição na linha do tempo.
//
// COMO ENCAIXAR AS FOTOS (é só isso)
//   1. jogue os arquivos em retrospectiva/fotos/ (subpastas à vontade)
//   2. rode `node retrospectiva/build.mjs`
//
// Cada foto entra no minuto em que foi TIRADA, lido do EXIF (DateTimeOriginal),
// e a sessão que estava rolando naquele minuto a adota. Sem EXIF — foto de
// WhatsApp costuma vir sem —, o nome da pasta serve de pista: uma pasta
// chamada como a sessão (ou com o horário no nome) resolve.
//
// O EXIF é lido à mão porque a alternativa era uma dependência para ler doze
// bytes de um cabeçalho. O relógio da câmera é hora local; nenhuma conversão.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative, sep } from "node:path";

const EXTENSOES = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
const EXIF_DATA = /^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})$/;
const HORA_NO_NOME = /(?:^|[^\d])([01]?\d|2[0-3])[h:_-]([0-5]\d)(?:[^\d]|$)/;
const DIA_NO_NOME = /(?:^|[^\d])(1[789]|20)[-_.]?0?8(?:[^\d]|$)/;

/**
 * Lê DateTimeOriginal (0x9003) de um JPEG. Devolve "AAAA-MM-DDTHH:MM" ou null.
 * Percorre os marcadores até achar o APP1/Exif e lê só a IFD0 e a SubIFD.
 */
export function dataDaFoto(caminho) {
  let buf;
  try {
    buf = readFileSync(caminho);
  } catch {
    return null;
  }
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null; // não é JPEG

  let p = 2;
  while (p + 4 <= buf.length) {
    if (buf[p] !== 0xff) break;
    const marcador = buf[p + 1];
    if (marcador === 0xda || marcador === 0xd9) break; // começou a imagem
    const tamanho = buf.readUInt16BE(p + 2);
    if (marcador === 0xe1 && buf.toString("ascii", p + 4, p + 10) === "Exif\0\0") {
      const achado = lerTiff(buf, p + 10);
      if (achado) return achado;
    }
    p += 2 + tamanho;
  }
  return null;
}

function lerTiff(buf, base) {
  if (base + 8 > buf.length) return null;
  const ordem = buf.toString("ascii", base, base + 2);
  const le = ordem === "II";
  if (!le && ordem !== "MM") return null;
  const u16 = (o) => (le ? buf.readUInt16LE(o) : buf.readUInt16BE(o));
  const u32 = (o) => (le ? buf.readUInt32LE(o) : buf.readUInt32BE(o));
  if (u16(base + 2) !== 42) return null;

  const lerIfd = (deslocamento, profundidade = 0) => {
    const inicio = base + deslocamento;
    if (profundidade > 2 || inicio + 2 > buf.length) return null;
    const n = u16(inicio);
    for (let i = 0; i < n; i += 1) {
      const campo = inicio + 2 + i * 12;
      if (campo + 12 > buf.length) return null;
      const tag = u16(campo);
      const valor = u32(campo + 8);
      if (tag === 0x9003 || tag === 0x0132) {
        // DateTimeOriginal, ou DateTime da IFD0 como reserva
        const texto = buf.toString("ascii", base + valor, base + valor + 19);
        const m = EXIF_DATA.exec(texto);
        if (m) return `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}`;
      }
      if (tag === 0x8769) {
        // ponteiro para a SubIFD, onde mora o DateTimeOriginal
        const achado = lerIfd(valor, profundidade + 1);
        if (achado) return achado;
      }
    }
    return null;
  };

  return lerIfd(u32(base + 4));
}

/** Lê o que o nome do arquivo/pasta deixa escapar: "…19-08 14h32…" */
function pistaDoNome(caminhoRelativo) {
  const hora = HORA_NO_NOME.exec(caminhoRelativo);
  const dia = DIA_NO_NOME.exec(caminhoRelativo);
  if (!hora || !dia) return null;
  return `2026-08-${dia[1]}T${hora[1].padStart(2, "0")}:${hora[2]}`;
}

function listarArquivos(raiz) {
  const achados = [];
  const andar = (dir) => {
    for (const item of readdirSync(dir, { withFileTypes: true })) {
      if (item.name.startsWith(".")) continue;
      const caminho = join(dir, item.name);
      if (item.isDirectory()) andar(caminho);
      else if (EXTENSOES.has(extname(item.name).toLowerCase())) achados.push(caminho);
    }
  };
  andar(raiz);
  return achados.sort();
}

const normalizar = (t) =>
  t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-");

/**
 * Varre a pasta de fotos e casa cada arquivo com uma sessão.
 * Devolve { porSessao: Map(sessaoId -> [fotos]), semDono: [], total }.
 */
export function levantarFotos(pastaFotos, sessoes) {
  if (!existsSync(pastaFotos)) return { porSessao: new Map(), semDono: [], total: 0, pastaExiste: false };

  const porSessao = new Map();
  const semDono = [];
  const arquivos = listarArquivos(pastaFotos);

  // Índice de nome de pasta → sessão, para as fotos sem EXIF.
  const porNome = new Map();
  for (const s of sessoes) porNome.set(normalizar(s.titulo), s);

  for (const caminho of arquivos) {
    const rel = relative(pastaFotos, caminho).split(sep).join("/");
    const minuto = dataDaFoto(caminho) ?? pistaDoNome(rel);
    const pastas = rel.split("/").slice(0, -1).map(normalizar);

    let dona = null;
    if (minuto) dona = sessoes.find((s) => minuto >= s.inicio && (!s.fim || minuto <= s.fim)) ?? null;
    if (!dona) dona = pastas.map((p) => porNome.get(p)).find(Boolean) ?? null;
    // Última tentativa: pasta que contenha o título da sessão por dentro.
    if (!dona && pastas.length) {
      dona = sessoes.find((s) => pastas.some((p) => p.includes(normalizar(s.titulo).slice(0, 18)))) ?? null;
    }

    const foto = {
      arquivo: rel,
      minuto: minuto ?? null,
      hora: minuto ? minuto.slice(11, 16) : null,
      bytes: statSync(caminho).size,
      origemDaHora: dataDaFoto(caminho) ? "exif" : minuto ? "nome" : null,
    };

    if (dona) {
      if (!porSessao.has(dona.id)) porSessao.set(dona.id, []);
      porSessao.get(dona.id).push(foto);
    } else {
      semDono.push(foto);
    }
  }

  for (const lista of porSessao.values()) {
    lista.sort((a, b) => (a.minuto ?? "").localeCompare(b.minuto ?? "") || a.arquivo.localeCompare(b.arquivo));
  }

  return { porSessao, semDono, total: arquivos.length, pastaExiste: true };
}
