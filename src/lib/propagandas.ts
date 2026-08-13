// Propagandas do telão — cartazes institucionais que giram ao lado da linha do
// tempo (coluna à esquerda) ou por cima dela (modal). Cada cartaz é UM ARQUIVO
// em public/propagandas/: `.md` com frontmatter ou `.html`. Soltar o arquivo na
// pasta basta — a rota /api/propagandas varre a pasta e o telão acha sozinho,
// sem cadastro no banco e sem tocar em código.
//
// Este módulo é PURO de propósito (sem fs, sem React): a leitura da pasta é da
// rota e a exibição é do componente. É o que permite testar o parse no `npm test`.

export type PosicaoPropaganda = "lateral" | "modal";

export type Propaganda = {
  id: string; // nome do arquivo sem extensão
  titulo: string;
  chamada?: string; // linha curta acima do título (o "eyebrow" da peça)
  corpo: string; // HTML já pronto para o telão
  duracao: number; // segundos no ar antes de girar para o próximo
  posicao: PosicaoPropaganda;
  ordem: number;
  imagem?: string;
  link?: string;
  rotulo?: string; // texto ao lado do QR; sem ele, vale o domínio do link
  qr?: string; // URL que vira QR code (o telão não é clicável: QR é o CTA)
  acento?: string;
  galeria?: string; // pasta sob public/ cujas imagens giram dentro do cartaz
  imagens?: string[]; // preenchido pela rota ao expandir `galeria`
  ativo: boolean; // o `ativo:` do arquivo — o /admin pode sobrescrever no banco
};

const DURACAO_PADRAO = 20;
const DURACAO_MIN = 5;
const DURACAO_MAX = 300;

// Só http(s), caminho interno e mailto viram href/src. Vale mesmo o conteúdo
// sendo nosso: evita que um copiar-e-colar de `javascript:` chegue ao telão.
function urlSegura(valor: string): string | undefined {
  const u = valor.trim();
  return /^(https?:\/\/|\/|mailto:)/i.test(u) ? u : undefined;
}

function booleano(valor: string | undefined, padrao: boolean): boolean {
  if (valor === undefined) return padrao;
  const v = valor.trim().toLowerCase();
  if (["true", "1", "sim", "yes"].includes(v)) return true;
  if (["false", "0", "nao", "não", "no"].includes(v)) return false;
  return padrao;
}

function escapar(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Formatação dentro do parágrafo. Imagem antes de link: `![a](u)` contém `[a](u)`.
function inline(texto: string): string {
  return texto
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_m, alt: string, src: string) => {
      const u = urlSegura(src);
      return u ? `<img src="${u}" alt="${alt}" />` : "";
    })
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, texto: string, href: string) => {
      const u = urlSegura(href);
      return u ? `<a href="${u}">${texto}</a>` : texto;
    })
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
}

// Markdown do que um cartaz precisa — títulos, listas, ênfase, link e imagem.
// Não é um parser completo de propósito: o conteúdo é nosso e cabe num cartaz.
// Quem precisar de mais liberdade escreve o arquivo em `.html`.
export function renderMarkdown(md: string): string {
  return escapar(md.trim())
    .split(/\n\s*\n/)
    .map((bloco) => {
      const linhas = bloco
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      if (!linhas.length) return "";
      if (linhas.every((l) => /^[-*]\s+/.test(l))) {
        const itens = linhas.map((l) => `<li>${inline(l.replace(/^[-*]\s+/, ""))}</li>`);
        return `<ul>${itens.join("")}</ul>`;
      }
      const titulo = /^(#{1,4})\s+(.*)$/.exec(linhas[0]);
      if (titulo && linhas.length === 1) {
        // O h1 do arquivo vira h2 na tela: o <h1> do telão é o título da sessão.
        const nivel = Math.min(4, titulo[1].length + 1);
        return `<h${nivel}>${inline(titulo[2])}</h${nivel}>`;
      }
      // Linha simples é quebra SUAVE (vira espaço), como em markdown de verdade:
      // o cartaz mora numa coluna estreita e um <br> no meio da frase quebraria
      // o texto num ponto arbitrário. Parágrafo novo se faz com linha em branco.
      // Junta ANTES de formatar: um **negrito** que atravessa a quebra de linha
      // do arquivo não casa se cada linha for formatada isolada.
      return `<p>${inline(linhas.join(" "))}</p>`;
    })
    .join("");
}

// Frontmatter `chave: valor` entre linhas de `---`. Sem YAML de verdade (nada
// de lista ou aninhamento): um cartaz não precisa, e a dependência a mais sim.
export function parseFrontmatter(bruto: string): {
  meta: Record<string, string>;
  corpo: string;
} {
  const texto = bruto.replace(/^﻿/, "").replace(/\r\n/g, "\n");
  const bloco = /^---\n([\s\S]*?)\n---[ \t]*(?:\n|$)/.exec(texto);
  if (!bloco) return { meta: {}, corpo: texto.trim() };

  const meta: Record<string, string> = {};
  for (const linha of bloco[1].split("\n")) {
    const t = linha.trim();
    if (!t || t.startsWith("#")) continue;
    const corte = t.indexOf(":");
    if (corte < 1) continue;
    let valor = t.slice(corte + 1).trim();
    if (/^".*"$/.test(valor) || /^'.*'$/.test(valor)) valor = valor.slice(1, -1);
    meta[t.slice(0, corte).trim().toLowerCase()] = valor;
  }
  return { meta, corpo: texto.slice(bloco[0].length).trim() };
}

function dominio(url: string | undefined): string | undefined {
  return url?.replace(/^https?:\/\//i, "").replace(/^www\./i, "").split("/")[0] || undefined;
}

function numero(valor: string | undefined, padrao: number): number {
  const n = Number(valor);
  return Number.isFinite(n) && valor?.trim() ? n : padrao;
}

// `ativo: false` desliga o cartaz sem apagar o arquivo — o texto continua
// versionado para a próxima edição do evento. O parse NÃO descarta o inativo:
// devolve o cartaz com `ativo: false` e quem chama decide. É o que deixa o
// /admin listar (e religar) um cartaz que o arquivo desligou.
export function parsePropaganda(arquivo: string, bruto: string): Propaganda {
  const { meta, corpo } = parseFrontmatter(bruto);
  const id = arquivo.replace(/\.(md|html?)$/i, "");
  const link = urlSegura(meta.link ?? "");
  const ehHtml = /\.html?$/i.test(arquivo);

  // `qr:` aceita uma URL própria ou um booleano — `qr: true` gera o QR do `link:`.
  const qrBruto = (meta.qr ?? "").trim();
  const qr = qrBruto ? (urlSegura(qrBruto) ?? (booleano(qrBruto, false) ? link : undefined)) : undefined;

  const acento = (meta.acento ?? "").trim();
  const galeria = (meta.galeria ?? "").trim();

  return {
    id,
    titulo: meta.titulo || meta.title || id.replace(/[-_]/g, " "),
    chamada: meta.chamada || meta.eyebrow || undefined,
    // .html entra como está (é a válvula de escape para arte livre); .md passa
    // pelo render, que escapa o conteúdo antes de formatar.
    corpo: ehHtml ? corpo : renderMarkdown(corpo),
    duracao: Math.min(
      DURACAO_MAX,
      Math.max(DURACAO_MIN, Math.round(numero(meta.duracao, DURACAO_PADRAO))),
    ),
    posicao: meta.posicao?.trim().toLowerCase() === "modal" ? "modal" : "lateral",
    ordem: numero(meta.ordem, 999),
    imagem: urlSegura(meta.imagem ?? ""),
    link,
    // Caminho longo ao lado do QR vira ruído ilegível na projeção: por padrão
    // fica só o domínio, e `rotulo:` cobre o caso em que o endereço não descreve
    // o destino (um @ do Instagram, por exemplo).
    rotulo: meta.rotulo || dominio(link),
    qr,
    // Cor solta não entra: só hex/rgb() viram estilo inline.
    acento: /^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%]+\))$/i.test(acento) ? acento : undefined,
    // Pasta de galeria fica sob public/: sem "..", sem caminho absoluto.
    galeria: /^[a-z0-9/_-]+$/i.test(galeria) ? galeria.replace(/^\/+|\/+$/g, "") : undefined,
    ativo: booleano(meta.ativo, true),
  };
}

// O que vale no ar: o arquivo diz o padrão, o /admin tem a última palavra.
// Separado do parse porque o override mora no banco e o parse é puro.
export function propagandaNoAr(cartaz: Propaganda, override: Record<string, boolean>): boolean {
  return override[cartaz.id] ?? cartaz.ativo;
}

// `ordem` manda; empate resolve por nome de arquivo, para o giro ser estável
// entre reinícios do telão (readdir não garante ordem).
export function ordenarPropagandas(lista: Propaganda[]): Propaganda[] {
  return [...lista].sort((a, b) => a.ordem - b.ordem || a.id.localeCompare(b.id, "pt-BR"));
}
