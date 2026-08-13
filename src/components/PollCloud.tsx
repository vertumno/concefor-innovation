"use client";

// Nuvem de palavras do telão. O algoritmo está em @/lib/wordcloud (puro,
// testável); aqui fica o que só existe no browser: rasterizar cada palavra num
// canvas para extrair a máscara de tinta que o layout usa como ocupação, e
// acompanhar o tamanho da área.

import { useEffect, useMemo, useRef, useState } from "react";
import {
  layoutNuvem,
  espacoLetrasNuvem,
  ESCALA_MASCARA,
  PESO_FONTE_NUVEM,
  type PalavraNuvem,
  type Rasterizacao,
  type Rasterizador,
} from "@/lib/wordcloud";

const VAZIA: Rasterizacao = { largura: 0, altura: 0, mascara: new Uint8Array(0) };

// Altura da caixa em múltiplos do corpo da fonte: cabe a linha inteira, com
// ascendentes e descendentes. Menos que isto corta letra na borda da nuvem.
const ALTURA_CAIXA = 1.2;

// A nuvem é toda em caixa alta. A transformação acontece AQUI, uma vez, e o
// mesmo texto vai para o canvas e para a tela — em vez de `text-transform` no
// CSS, que deixaria o canvas medindo a palavra em minúsculas e o browser
// desenhando em maiúsculas. Seria o mesmo descompasso de métrica que fazia as
// palavras se sobreporem.
const exibir = (palavra: string) => palavra.toLocaleUpperCase("pt-BR");

// Desenha a palavra fora da tela e devolve quais células têm tinta. É esta
// máscara — e não o retângulo do texto — que o layout usa como ocupação, o que
// deixa palavra pequena encaixar no vão de uma grande.
function criarRasterizador(fontFamily: string): Rasterizador {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  // Uma palavra é rasterizada várias vezes: o layout encolhe a fonte até caber,
  // e o telão refaz a nuvem a cada resposta. Sem cache, é getImageData demais.
  const cache = new Map<string, Rasterizacao>();

  return (palavra, fontePx, vertical) => {
    if (!ctx) return VAZIA;
    const texto = exibir(palavra); // o mesmo que a tela vai desenhar
    const chave = `${texto}|${Math.round(fontePx)}|${vertical ? "v" : "h"}`;
    const noCache = cache.get(chave);
    if (noCache) return noCache;

    const aplicarEstilo = () => {
      ctx.font = `${PESO_FONTE_NUVEM} ${fontePx}px ${fontFamily}`;
      // O MESMO aperto que o span vai receber, e ele depende do corpo: se o
      // canvas medisse com um tracking e a tela desenhasse com outro, a máscara
      // sairia larga demais (buracos) ou curta demais (sobreposição).
      ctx.letterSpacing = espacoLetrasNuvem(fontePx);
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = "#fff";
    };

    aplicarEstilo();
    const m = ctx.measureText(texto);
    // A caixa é a do TEXTO INTEIRO (largura de avanço × corpo com folga), não a
    // da tinta: é ela que o CSS vai desenhar, e reservar só a tinta cortava as
    // ascendentes e descendentes das palavras coladas na borda. A ocupação
    // continua justa porque quem é carimbado no bitmap é a máscara, que só marca
    // onde há pixel — a caixa pode invadir a caixa da vizinha, a tinta não.
    const w = Math.ceil(m.width);
    const h = Math.ceil(fontePx * ALTURA_CAIXA);
    if (w <= 0 || h <= 0) return VAZIA;

    canvas.width = w;
    canvas.height = h;
    aplicarEstilo(); // redimensionar o canvas zera o contexto
    // Baseline posicionada como o flex do CSS centraliza a linha na caixa.
    ctx.fillText(texto, 0, h / 2 + fontePx * 0.36);

    const pixels = ctx.getImageData(0, 0, w, h).data;
    const mw = Math.max(1, Math.ceil(w / ESCALA_MASCARA));
    const mh = Math.max(1, Math.ceil(h / ESCALA_MASCARA));
    const mascara = new Uint8Array(mw * mh);
    for (let y = 0; y < h; y++) {
      const my = (y / ESCALA_MASCARA) | 0;
      for (let x = 0; x < w; x++) {
        // Corte no alfa: a borda suavizada do glifo não conta como tinta, senão
        // cada palavra ocupa uns pixels a mais do que realmente desenha.
        if (pixels[(y * w + x) * 4 + 3] > 48) mascara[my * mw + ((x / ESCALA_MASCARA) | 0)] = 1;
      }
    }

    let saida: Rasterizacao = { largura: mw, altura: mh, mascara };
    if (vertical) {
      // Gira a máscara 90° à esquerda: o layout precisa da caixa como ela fica
      // NA TELA, e quem desenha girado é o CSS.
      const girada = new Uint8Array(mw * mh);
      for (let y = 0; y < mh; y++) {
        for (let x = 0; x < mw; x++) {
          if (mascara[y * mw + x]) girada[(mw - 1 - x) * mh + y] = 1;
        }
      }
      saida = { largura: mh, altura: mw, mascara: girada };
    }

    cache.set(chave, saida);
    return saida;
  };
}

export function PollCloud({ words }: { words: PalavraNuvem[] }) {
  const areaRef = useRef<HTMLDivElement | null>(null);
  const [caixa, setCaixa] = useState({ largura: 0, altura: 0 });
  const [fontFamily, setFontFamily] = useState("sans-serif");
  // A fonte do app vem por @font-face (next/font). Enquanto ela não carrega, o
  // canvas rasteriza com a fonte de FALLBACK do sistema — outras métricas — e o
  // DOM já desenha com a definitiva. O layout calculado nesse intervalo tem
  // máscaras do tamanho errado, e o resultado na tela é palavra sobreposta.
  const [fontesProntas, setFontesProntas] = useState(false);

  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    // A família real vem do CSS (var(--font-text)): rasterizar com outra fonte
    // daria máscara errada e a nuvem sairia com buracos ou com sobreposição.
    setFontFamily(getComputedStyle(el).fontFamily || "sans-serif");

    const medirArea = () => setCaixa({ largura: el.clientWidth, altura: el.clientHeight });
    medirArea();
    const ro = new ResizeObserver(medirArea);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let vivo = true;
    document.fonts.ready.then(() => vivo && setFontesProntas(true));
    return () => {
      vivo = false;
    };
  }, []);

  // `fontesProntas` na dependência de propósito: além de refazer o layout, cria
  // um rasterizador novo, jogando fora o cache de máscaras medidas no fallback.
  const rasterizar = useMemo(
    () => criarRasterizador(fontFamily),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fontFamily, fontesProntas],
  );

  // A chave da memo é o conteúdo da nuvem, não o array: o telão repolla de 3 em
  // 3 segundos e recebe uma lista nova toda vez. Sem isto, o layout seria
  // recalculado a cada resposta e as palavras dançariam na tela.
  const assinatura = words.map((w) => `${w.word}:${w.count}`).join("|");
  const postas = useMemo(
    () =>
      caixa.largura && caixa.altura
        ? layoutNuvem(words, { largura: caixa.largura, altura: caixa.altura, rasterizar })
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [assinatura, caixa.largura, caixa.altura, rasterizar],
  );

  return (
    <div className="poll-cloud" ref={areaRef} aria-label="Nuvem de palavras">
      {postas.map((p) => (
        // Caixa por fora com as medidas que o layout reservou; o texto gira
        // DENTRO dela. `rotate` não altera o fluxo, então a caixa continua
        // ocupando exatamente o retângulo que o algoritmo marcou como usado.
        <span
          key={p.word}
          className="poll-cloud-word"
          title={`${p.count} ocorrência${p.count > 1 ? "s" : ""}`}
          // Peso e tracking saem das mesmas constantes que o canvas usou para
          // rasterizar — daí virem inline e não do CSS, onde poderiam divergir.
          style={{
            left: p.x,
            top: p.y,
            width: p.largura,
            height: p.altura,
            fontSize: p.fonte,
            fontWeight: PESO_FONTE_NUVEM,
            letterSpacing: espacoLetrasNuvem(p.fonte),
            color: p.cor,
          }}
        >
          <span style={p.vertical ? { transform: "rotate(-90deg)" } : undefined}>
            {exibir(p.word)}
          </span>
        </span>
      ))}
    </div>
  );
}
