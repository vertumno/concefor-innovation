// Nuvem de palavras da retrospectiva.
//
// Portado do app do evento — `app/src/lib/wordcloud.ts` (layout) e
// `app/src/components/PollCloud.tsx` (rasterização em canvas), que por sua vez
// vieram do amueller/word_cloud. É a MESMA nuvem que a plateia viu no telão
// enquanto respondia; reimplementar diferente daria outra imagem para o mesmo
// dado. Aqui virou JS de browser sem framework, porque a página é estática.
//
// O QUE FAZ A NUVEM PARECER UMA NUVEM
// A ocupação não é o retângulo de cada palavra, é o BITMAP DOS PIXELS do texto
// desenhado. A busca de posição roda sobre uma imagem integral desse bitmap:
// uma posição serve quando a soma da região é zero, isto é, quando não há tinta
// ali. É o que deixa a palavra pequena encaixar no vão interno de uma grande.
//
// O corpo decresce da mais citada para a menos, e quando não cabe a palavra
// ENCOLHE e tenta de novo até um piso. É o encolhe-até-caber que produz a
// gradação mesmo quando dezenas de palavras foram ditas uma vez só — o caso de
// toda enquete de plateia.

(function () {
  "use strict";

  var PESO_FONTE = 700;
  var ESCALA_MASCARA = 3; // o bitmap roda em resolução menor que a tela
  var PASSO_FONTE = 2;
  var VOLTAS = 40;
  var MARGEM = 3; // respiro entre palavras, em células
  var CURVA = 2.4; // acima de 1: poucas grandes, muitas pequenas
  var ALTURA_CAIXA = 1.2;

  // Tracking óptico: em corpo grande as letras precisam de proporcionalmente
  // menos espaço para o conjunto virar bloco; em corpo pequeno, de mais.
  var APERTO_MIN = -0.005;
  var APERTO_MAX = -0.07;
  var CORPO_SOLTO = 14;
  var CORPO_APERTADO = 220;

  // Tons claros sobre o navy, todos de brilho parecido DE PROPÓSITO: a
  // hierarquia da nuvem vem do TAMANHO. Uma cor mais viva que as outras daria
  // destaque a uma palavra dita uma vez só.
  var PALETA = ["#E9F1FF", "#7FF8EE", "#FFD75E", "#B2D235", "#9FC4FF"];

  function espacoLetras(fontePx) {
    var t = Math.min(1, Math.max(0, (fontePx - CORPO_SOLTO) / (CORPO_APERTADO - CORPO_SOLTO)));
    return (APERTO_MIN + t * (APERTO_MAX - APERTO_MIN)).toFixed(4) + "em";
  }

  // Hash estável (FNV-1a) → 0..1: a mesma palavra tem sempre a mesma cor e a
  // mesma orientação, sem Math.random.
  function hash01(texto) {
    var h = 2166136261;
    for (var i = 0; i < texto.length; i++) {
      h ^= texto.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0) / 4294967295;
  }

  function imagemIntegral(bitmap, largura, altura) {
    var passo = largura + 1;
    var ii = new Int32Array(passo * (altura + 1));
    for (var y = 0; y < altura; y++) {
      var linha = 0;
      for (var x = 0; x < largura; x++) {
        linha += bitmap[y * largura + x];
        ii[(y + 1) * passo + (x + 1)] = ii[y * passo + (x + 1)] + linha;
      }
    }
    return ii;
  }

  function regiaoLivre(ii, largura, x, y, w, h) {
    var passo = largura + 1;
    return (
      ii[(y + h) * passo + (x + w)] - ii[y * passo + (x + w)] - ii[(y + h) * passo + x] + ii[y * passo + x] === 0
    );
  }

  function carimbar(bitmap, largura, mascara, mw, mh, x, y) {
    for (var yy = 0; yy < mh; yy++) {
      var destino = (y + yy) * largura;
      var origem = yy * mw;
      for (var xx = 0; xx < mw; xx++) {
        if (mascara[origem + xx]) bitmap[destino + x + xx] = 1;
      }
    }
  }

  var exibir = function (p) {
    return p.toLocaleUpperCase("pt-BR");
  };
  var VAZIA = { largura: 0, altura: 0, mascara: new Uint8Array(0) };

  // Desenha a palavra fora da tela e devolve quais células têm tinta.
  function criarRasterizador(fontFamily) {
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d", { willReadFrequently: true });
    var cache = {};

    return function (palavra, fontePx, vertical) {
      if (!ctx) return VAZIA;
      var texto = exibir(palavra);
      var chave = texto + "|" + Math.round(fontePx) + "|" + (vertical ? "v" : "h");
      if (cache[chave]) return cache[chave];

      var estilo = function () {
        ctx.font = PESO_FONTE + " " + fontePx + "px " + fontFamily;
        // O MESMO aperto que o span vai receber: medir com um tracking e
        // desenhar com outro deixa a máscara errada e as palavras se sobrepõem.
        ctx.letterSpacing = espacoLetras(fontePx);
        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = "#fff";
      };

      estilo();
      var w = Math.ceil(ctx.measureText(texto).width);
      var h = Math.ceil(fontePx * ALTURA_CAIXA);
      if (w <= 0 || h <= 0) return VAZIA;

      canvas.width = w;
      canvas.height = h;
      estilo(); // redimensionar o canvas zera o contexto
      ctx.fillText(texto, 0, h / 2 + fontePx * 0.36);

      var pixels = ctx.getImageData(0, 0, w, h).data;
      var mw = Math.max(1, Math.ceil(w / ESCALA_MASCARA));
      var mh = Math.max(1, Math.ceil(h / ESCALA_MASCARA));
      var mascara = new Uint8Array(mw * mh);
      for (var y = 0; y < h; y++) {
        var my = (y / ESCALA_MASCARA) | 0;
        for (var x = 0; x < w; x++) {
          // Corte no alfa: a borda suavizada do glifo não conta como tinta.
          if (pixels[(y * w + x) * 4 + 3] > 48) mascara[my * mw + ((x / ESCALA_MASCARA) | 0)] = 1;
        }
      }

      var saida = { largura: mw, altura: mh, mascara: mascara };
      if (vertical) {
        var girada = new Uint8Array(mw * mh);
        for (var gy = 0; gy < mh; gy++) {
          for (var gx = 0; gx < mw; gx++) {
            if (mascara[gy * mw + gx]) girada[(mw - 1 - gx) * mh + gy] = 1;
          }
        }
        saida = { largura: mh, altura: mw, mascara: girada };
      }

      cache[chave] = saida;
      return saida;
    };
  }

  function layoutNuvem(palavras, opcoes) {
    var largura = opcoes.largura;
    var altura = opcoes.altura;
    var rasterizar = opcoes.rasterizar;
    var fonteMax = opcoes.fonteMax || Math.max(24, Math.min(altura * 0.42, largura * 0.2));
    var fonteMin = opcoes.fonteMin || Math.max(10, altura * 0.017);
    var escalaRelativa = opcoes.escalaRelativa != null ? opcoes.escalaRelativa : 0.65;
    var preferirHorizontal = opcoes.preferirHorizontal != null ? opcoes.preferirHorizontal : 0.82;
    var maxPalavras = opcoes.maxPalavras || 70;

    if (!palavras.length || largura <= 0 || altura <= 0) return [];

    var bw = Math.max(1, Math.floor(largura / ESCALA_MASCARA));
    var bh = Math.max(1, Math.floor(altura / ESCALA_MASCARA));
    var bitmap = new Uint8Array(bw * bh);
    var ii = imagemIntegral(bitmap, bw, bh);

    var cx = bw / 2;
    var cy = bh / 2;
    var achatamento = bw / bh; // espiral achatada: numa área larga ela anda mais para os lados
    var raioMax = Math.hypot(bw, bh) / 2;

    var ordenadas = palavras
      .slice()
      .sort(function (a, b) {
        return b.count - a.count || a.word.localeCompare(b.word, "pt-BR");
      })
      .slice(0, maxPalavras);

    var postas = [];
    var maiorContagem = ordenadas.length ? ordenadas[0].count : 1;
    var ultimo = Math.max(1, ordenadas.length - 1);

    for (var i = 0; i < ordenadas.length; i++) {
      var word = ordenadas[i].word;
      var count = ordenadas[i].count;

      // Tamanho por FREQUÊNCIA e por POSTO na fila. O posto salva o caso real da
      // enquete: quando quase toda palavra aparece uma vez, a frequência sozinha
      // não distingue nada e a nuvem sai plana.
      var combinado =
        escalaRelativa * (count / maiorContagem) + (1 - escalaRelativa) * (1 - i / ultimo);
      var vertical = hash01(word + "#girar") > preferirHorizontal;
      var tentativa = fonteMin + (fonteMax - fonteMin) * Math.pow(combinado, CURVA);
      var posta = null;

      while (tentativa >= fonteMin && !posta) {
        var r = rasterizar(word, tentativa, vertical);
        var mw = r.largura;
        var mh = r.altura;

        if (mw > 0 && mh > 0 && mw + MARGEM * 2 <= bw && mh + MARGEM * 2 <= bh) {
          for (var t = 0; t < VOLTAS * Math.PI * 2; t += Math.max(0.05, 0.9 / (1 + t * 0.5))) {
            var raio = (t / (VOLTAS * Math.PI * 2)) * raioMax;
            var x = Math.round(cx + raio * achatamento * Math.cos(t) - mw / 2);
            var y = Math.round(cy + raio * Math.sin(t) - mh / 2);
            if (x < MARGEM || y < MARGEM || x + mw + MARGEM > bw || y + mh + MARGEM > bh) continue;

            if (regiaoLivre(ii, bw, x - MARGEM, y - MARGEM, mw + MARGEM * 2, mh + MARGEM * 2)) {
              carimbar(bitmap, bw, r.mascara, mw, mh, x, y);
              ii = imagemIntegral(bitmap, bw, bh);
              posta = {
                word: word,
                count: count,
                x: x * ESCALA_MASCARA,
                y: y * ESCALA_MASCARA,
                largura: mw * ESCALA_MASCARA,
                altura: mh * ESCALA_MASCARA,
                fonte: tentativa,
                vertical: vertical,
                cor: PALETA[Math.floor(hash01(word) * PALETA.length) % PALETA.length],
              };
              break;
            }
          }
        }
        if (!posta) tentativa -= PASSO_FONTE;
      }

      // Sem espaço nem no corpo mínimo, a palavra fica de fora: melhor uma nuvem
      // com menos palavras do que uma com palavras sobrepostas.
      if (posta) postas.push(posta);
    }

    return postas;
  }

  function desenhar(area) {
    var palavras;
    try {
      palavras = JSON.parse(area.getAttribute("data-palavras"));
    } catch (e) {
      return;
    }
    if (!palavras || !palavras.length) return;

    var largura = area.clientWidth;
    var altura = area.clientHeight;
    if (!largura || !altura) return;

    var fontFamily = getComputedStyle(area).fontFamily || "sans-serif";
    var postas = layoutNuvem(palavras, {
      largura: largura,
      altura: altura,
      rasterizar: criarRasterizador(fontFamily),
    });

    area.textContent = "";
    for (var i = 0; i < postas.length; i++) {
      var p = postas[i];
      var caixa = document.createElement("span");
      caixa.className = "nuvem-palavra";
      caixa.title = p.count + (p.count > 1 ? " menções" : " menção");
      caixa.style.left = p.x + "px";
      caixa.style.top = p.y + "px";
      caixa.style.width = p.largura + "px";
      caixa.style.height = p.altura + "px";
      caixa.style.fontSize = p.fonte + "px";
      caixa.style.fontWeight = PESO_FONTE;
      caixa.style.letterSpacing = espacoLetras(p.fonte);
      caixa.style.color = p.cor;

      var texto = document.createElement("span");
      texto.textContent = exibir(p.word);
      if (p.vertical) texto.style.transform = "rotate(-90deg)";
      caixa.appendChild(texto);
      area.appendChild(caixa);
    }
    area.setAttribute("data-pronta", "true");
  }

  function iniciar() {
    var areas = document.querySelectorAll(".nuvem");
    if (!areas.length) return;

    // As fontes vêm do Google Fonts. Enquanto não carregam, o canvas mediria com
    // a fonte de fallback e o DOM desenharia com a definitiva — métricas
    // diferentes, palavras sobrepostas. Por isso espera document.fonts.ready.
    var desenharTodas = function () {
      for (var i = 0; i < areas.length; i++) desenhar(areas[i]);
    };

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(desenharTodas);
    } else {
      desenharTodas();
    }

    // Redesenha quando a área muda de tamanho: o layout depende do espaço livre.
    if (window.ResizeObserver) {
      var timer = null;
      var ro = new ResizeObserver(function () {
        clearTimeout(timer);
        timer = setTimeout(desenharTodas, 200);
      });
      for (var j = 0; j < areas.length; j++) ro.observe(areas[j]);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
