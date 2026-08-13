// Layout de nuvem de palavras para o telão, portado do algoritmo do
// amueller/word_cloud (Python/PIL) para o browser.
//
// O QUE FAZ A NUVEM PARECER UMA NUVEM
//
// A primeira versão daqui usava retângulo (bounding box) como ocupação, e por
// isso saía esparsa: em volta de cada palavra sobrava a área morta entre o
// retângulo e o desenho real das letras, e nada podia entrar ali.
//
// O word_cloud não faz isso. A ocupação dele é o BITMAP DOS PIXELS do texto já
// desenhado (`img_array = np.asarray(img_grey) > 0`), e a busca de posição roda
// sobre uma IMAGEM INTEGRAL (summed-area table) desse bitmap: uma posição serve
// quando a soma da região é zero, isto é, quando não há um pixel de tinta ali.
// É o que permite a palavra pequena se encaixar no vão interno de uma grande —
// dentro do "o", entre o "k" e o "n" — que é o visual das nuvens clássicas.
//
// O resto do algoritmo, também do word_cloud:
//   - percorre as palavras da mais citada para a menos;
//   - o corpo decresce ao longo dessa fila, modulado pela razão entre a
//     frequência da palavra e a da anterior (`relative_scaling`);
//   - se não couber, ENCOLHE a fonte (`font_step`) e tenta de novo, até
//     `min_font_size`; abaixo disso, a palavra fica de fora.
// É o encolhe-até-caber que produz a gradação mesmo quando dezenas de palavras
// têm frequência 1 — o caso de toda enquete de plateia.
//
// A busca de posição é a única licença em relação ao original: o word_cloud
// sorteia entre todas as posições livres, e aqui ela caminha em espiral a partir
// do centro (como o Wordle). Numa tela de projeção a palavra mais dita precisa
// cair no meio, não num canto qualquer.
//
// Módulo PURO: quem chama injeta o `rasterizar` (no browser, um canvas). É o que
// permite testar o layout no `npm test`, sem DOM.

export type PalavraNuvem = { word: string; count: number };

/** Máscara de tinta de um texto: 1 = pixel desenhado. */
export type Rasterizacao = {
  largura: number;
  altura: number;
  mascara: Uint8Array; // largura * altura
};

export type Rasterizador = (texto: string, fontePx: number, vertical: boolean) => Rasterizacao;

export type PalavraPosicionada = PalavraNuvem & {
  x: number; // canto superior esquerdo da caixa, em px dentro da área
  y: number;
  // Dimensões da CAIXA NA TELA, já com a rotação aplicada: numa palavra vertical
  // `largura` é a altura do texto. Guardar as medidas do texto cru aqui obrigaria
  // cada leitor a inverter por conta própria — e um esqueceu, o que deixou
  // palavras giradas sobrepostas até o teste de colisão pegar.
  largura: number;
  altura: number;
  fonte: number;
  vertical: boolean;
  cor: string;
};

export type OpcoesNuvem = {
  largura: number;
  altura: number;
  rasterizar: Rasterizador;
  fonteMax?: number;
  fonteMin?: number;
  /** 0 = tamanho só pelo posto na fila; 1 = só pela frequência. */
  escalaRelativa?: number;
  /** Fração das palavras que fica na horizontal (as demais giram 90°). */
  preferirHorizontal?: number;
  /** Teto de palavras na tela. Nuvem de telão é para bater o olho, não para ler. */
  maxPalavras?: number;
};

// Peso da fonte da nuvem. Precisa ser o MESMO no canvas que rasteriza e no que
// a tela desenha: medir com um peso e desenhar com outro devolve máscara de
// tamanho errado, e o resultado é palavra sobreposta. Por isso os dois saem
// daqui, e não de um valor repetido no CSS.
export const PESO_FONTE_NUVEM = 700;

// Tracking óptico. Espaçamento em `em` escala junto com o corpo, mas isso não
// basta: em corpo grande as letras precisam de proporcionalmente MENOS espaço
// para o conjunto virar bloco, e em corpo pequeno de mais, senão fecham e a
// palavra some. Daí o valor depender do tamanho em vez de ser um só.
const APERTO_MIN = -0.005; // nas palavras da borda, quase nada
const APERTO_MAX = -0.07; // no miolo, bem fechado
const CORPO_SOLTO = 14;
const CORPO_APERTADO = 220;

export function espacoLetrasNuvem(fontePx: number): string {
  const t = Math.min(1, Math.max(0, (fontePx - CORPO_SOLTO) / (CORPO_APERTADO - CORPO_SOLTO)));
  return `${(APERTO_MIN + t * (APERTO_MAX - APERTO_MIN)).toFixed(4)}em`;
}

// O bitmap de ocupação roda numa resolução menor que a tela. Cada célula vira 3
// px reais: dá encaixe justo sem que a imagem integral (recalculada a cada
// palavra) pese no telão, que fica horas na mesma aba.
export const ESCALA_MASCARA = 3;

const PASSO_FONTE = 2; // de quanto em quanto a fonte encolhe quando não cabe
const VOLTAS = 40; // até onde a espiral vai antes de desistir da palavra
// Respiro entre palavras, em células (~3px cada). Serve contra o embolado e
// também como folga para a diferença entre a máscara do canvas e o desenho do
// browser, que nunca casam ao pixel.
const MARGEM = 3;

// Curva da escala. Acima de 1 a fonte despenca depois das primeiras colocadas:
// é o que dá "poucas grandes, muitas pequenas" das nuvens de referência. Com 1
// (queda linear) a nuvem sai com tudo em corpo parecido e nenhuma palavra se
// destaca — foi o que aconteceu quando o tamanho vinha só do encolhe-até-caber.
const CURVA = 2.4;

// Tons claros sobre o navy do telão, todos de brilho parecido DE PROPÓSITO: a
// hierarquia da nuvem tem que vir do tamanho. Uma cor mais viva que as outras
// daria destaque a uma palavra dita uma vez só — foi a queixa da primeira versão.
const PALETA = ["#e9f1ff", "#7ff8ee", "#ffd75e", "#b2d235", "#9fc4ff"];

// Hash estável (FNV-1a) → 0..1. Serve para decidir cor e orientação sem
// Math.random: a mesma palavra tem sempre a mesma cara, e o telão repolla de 3
// em 3 segundos — com sorteio, a nuvem inteira mudaria de cor a cada resposta.
function hash01(texto: string): number {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

// Imagem integral (summed-area table) do bitmap de ocupação: com ela, saber se
// uma região inteira está livre custa 4 leituras, em vez de varrer a região.
// É o `IntegralOccupancyMap` do word_cloud.
function imagemIntegral(bitmap: Uint8Array, largura: number, altura: number): Int32Array {
  const passo = largura + 1;
  const ii = new Int32Array(passo * (altura + 1));
  for (let y = 0; y < altura; y++) {
    let linha = 0;
    for (let x = 0; x < largura; x++) {
      linha += bitmap[y * largura + x];
      ii[(y + 1) * passo + (x + 1)] = ii[y * passo + (x + 1)] + linha;
    }
  }
  return ii;
}

function regiaoLivre(
  ii: Int32Array,
  largura: number,
  x: number,
  y: number,
  w: number,
  h: number,
): boolean {
  const passo = largura + 1;
  const soma =
    ii[(y + h) * passo + (x + w)] -
    ii[y * passo + (x + w)] -
    ii[(y + h) * passo + x] +
    ii[y * passo + x];
  return soma === 0;
}

// Carimba a tinta da palavra no bitmap global. A ocupação passa a ser o desenho,
// não o retângulo — é daqui que vem o encaixe justo.
function carimbar(
  bitmap: Uint8Array,
  largura: number,
  mascara: Uint8Array,
  mw: number,
  mh: number,
  x: number,
  y: number,
): void {
  for (let yy = 0; yy < mh; yy++) {
    const destino = (y + yy) * largura;
    const origem = yy * mw;
    for (let xx = 0; xx < mw; xx++) {
      if (mascara[origem + xx]) bitmap[destino + x + xx] = 1;
    }
  }
}

export function layoutNuvem(palavras: PalavraNuvem[], opcoes: OpcoesNuvem): PalavraPosicionada[] {
  const {
    largura,
    altura,
    rasterizar,
    // Teto proporcional à área: a palavra mais dita ocupa uma fatia da tela, não
    // um número de pixels que ficaria minúsculo no projetor e gigante no laptop.
    // Teto alto: é a distância entre ele e o piso que dá a variação por
    // frequência. Nas nuvens de referência a palavra dominante é ~9x a menor.
    fonteMax = Math.max(28, Math.min(altura * 0.42, largura * 0.2)),
    // Piso baixo: as palavras da borda são para dar massa à nuvem, não para
    // serem lidas de longe. Quem tem que ler à distância é o miolo, e é a
    // distância entre este piso e o teto que faz o miolo saltar.
    fonteMin = Math.max(11, altura * 0.017),
    // Peso maior para a frequência que para o posto na fila: quem foi repetido
    // tem que aparecer maior de verdade, não só um degrau acima do vizinho.
    escalaRelativa = 0.65,
    preferirHorizontal = 0.82,
    // Nuvem cheia, como as de referência: a cauda de palavras pequenas é o que
    // dá textura e faz o miolo parecer grande. Quem não couber fica de fora.
    maxPalavras = 70,
  } = opcoes;

  if (!palavras.length || largura <= 0 || altura <= 0) return [];

  // Tudo daqui para baixo trabalha na resolução do bitmap; só o retorno volta
  // para px de tela.
  const bw = Math.max(1, Math.floor(largura / ESCALA_MASCARA));
  const bh = Math.max(1, Math.floor(altura / ESCALA_MASCARA));
  const bitmap = new Uint8Array(bw * bh);
  let ii = imagemIntegral(bitmap, bw, bh);

  const cx = bw / 2;
  const cy = bh / 2;
  // A espiral é achatada na proporção da área: numa tela widescreen ela precisa
  // caminhar mais para os lados que para cima, senão a nuvem sai como coluna.
  const achatamento = bw / bh;
  const raioMax = Math.hypot(bw, bh) / 2;

  const ordenadas = [...palavras]
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word, "pt-BR"))
    .slice(0, maxPalavras);

  const postas: PalavraPosicionada[] = [];
  const maiorContagem = ordenadas[0]?.count ?? 1;
  const ultimo = Math.max(1, ordenadas.length - 1);

  for (let i = 0; i < ordenadas.length; i++) {
    const { word, count } = ordenadas[i];

    // Tamanho-alvo por FREQUÊNCIA e POSTO na fila, na proporção de
    // `escalaRelativa` (o `relative_scaling` do word_cloud). O posto é o que
    // salva o caso real da enquete: quando quase toda palavra aparece uma vez, a
    // frequência sozinha não distingue nada e a nuvem sai plana.
    const porFrequencia = count / maiorContagem;
    const porPosto = 1 - i / ultimo;
    const combinado = escalaRelativa * porFrequencia + (1 - escalaRelativa) * porPosto;
    let fonte = fonteMin + (fonteMax - fonteMin) * Math.pow(combinado, CURVA);

    const vertical = hash01(`${word}#girar`) > preferirHorizontal;
    let tentativa = fonte;
    let posta: PalavraPosicionada | null = null;

    // Encolhe até caber. É este laço que dá a gradação das nuvens clássicas.
    while (tentativa >= fonteMin && !posta) {
      const r = rasterizar(word, tentativa, vertical);
      const mw = r.largura;
      const mh = r.altura;

      if (mw > 0 && mh > 0 && mw + MARGEM * 2 <= bw && mh + MARGEM * 2 <= bh) {
        for (let t = 0; t < VOLTAS * Math.PI * 2; t += Math.max(0.05, 0.9 / (1 + t * 0.5))) {
          const raio = (t / (VOLTAS * Math.PI * 2)) * raioMax;
          const x = Math.round(cx + raio * achatamento * Math.cos(t) - mw / 2);
          const y = Math.round(cy + raio * Math.sin(t) - mh / 2);
          if (x < MARGEM || y < MARGEM || x + mw + MARGEM > bw || y + mh + MARGEM > bh) continue;

          // Testa a região com a margem inclusa: é o respiro entre palavras.
          if (regiaoLivre(ii, bw, x - MARGEM, y - MARGEM, mw + MARGEM * 2, mh + MARGEM * 2)) {
            carimbar(bitmap, bw, r.mascara, mw, mh, x, y);
            ii = imagemIntegral(bitmap, bw, bh);
            posta = {
              word,
              count,
              x: x * ESCALA_MASCARA,
              y: y * ESCALA_MASCARA,
              largura: mw * ESCALA_MASCARA,
              altura: mh * ESCALA_MASCARA,
              fonte: tentativa,
              vertical,
              cor: PALETA[Math.floor(hash01(word) * PALETA.length) % PALETA.length],
            };
            break;
          }
        }
      }
      if (!posta) tentativa -= PASSO_FONTE;
    }

    // Sem espaço nem no corpo mínimo: a palavra fica de fora, como no word_cloud.
    // Melhor uma nuvem com menos palavras do que uma com palavras sobrepostas.
    if (posta) postas.push(posta);
  }

  return postas;
}
