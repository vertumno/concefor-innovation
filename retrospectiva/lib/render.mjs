// A página. Recebe o consolidado do build e devolve um HTML autocontido.
//
// DESIGN — as decisões e por quê
//
// Marca: os tokens saem de app/src/app/tokens.css (navy Concefor, ciano, gold,
// gradiente do selo 20 anos) e das duas famílias do app, Oswald e Inter. O
// ground é mais fundo que o do app de propósito: o app era operado numa sala
// escura, isto aqui é memória, e o fundo mais profundo dá o silêncio que uma
// retrospectiva pede. As falas do palco usam uma terceira face, Newsreader em
// itálico — a voz humana não devia sair na mesma tipografia dos números.
//
// Gráficos: a faixa de cada sessão mostra INTENSIDADE por minuto, numa cor só.
// Empilhar as cinco reações numa barra de três pixels seria ilegível e o que
// interessa ali é quando a sala esquentou. A composição por tipo aparece uma
// vez por sessão, em barras com rótulo, emoji e número — onde as cinco cores
// têm espaço e nenhuma identidade depende só da cor. Essas cinco foram
// validadas em OKLCH para daltonismo sobre o navy do gráfico (o pior par
// vizinho fica em ΔE 11,9 deutan); as cores vivas da marca ficam para a
// interface, que é onde elas mandam.
//
// Tema: escuro por escolha, não por omissão — é a identidade do evento e do
// telão. Toda cor é declarada explicitamente para a página não pegar emprestado
// o fundo de quem a hospeda, e o @media print devolve tudo ao branco para o uso
// institucional.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { REACOES } from "./banco.mjs";

const AQUI = dirname(fileURLToPath(import.meta.url));

// A nuvem de palavras roda no browser (precisa de canvas para medir a tinta de
// cada palavra), então o algoritmo vai embutido na página.
const NUVEM_JS = readFileSync(join(AQUI, "wordcloud-browser.js"), "utf8");

// --------------------------------------------------------------- utilidades

const esc = (t) =>
  String(t ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const plural = (n, um, muitos) => `${n.toLocaleString("pt-BR")} ${n === 1 ? um : muitos}`;

// Cores das séries: validadas com scripts/validate_palette.js da skill dataviz
// (modo escuro, superfície #0D2149). Mexer aqui pede revalidar.
const COR_REACAO = {
  massa: "#BF8A00",
  amei: "#00A7A7",
  identifico: "#8968D4",
  usar: "#3CA146",
  explodiu: "#C62685",
};

const emojiDe = (kind) => REACOES.find((r) => r.kind === kind)?.emoji ?? "";
const labelDe = (kind) => REACOES.find((r) => r.kind === kind)?.label ?? kind;
const labelRelatorioDe = (kind) => REACOES.find((r) => r.kind === kind)?.labelRelatorio ?? kind;

const idDaSessao = (s) => `s-${s.id.replace(/[^a-zA-Z0-9]/g, "")}`;

// Ícones inline: a página é autocontida e o CSP do visualizador barra host
// externo, então nada de biblioteca de ícones. `currentColor` deixa cada um
// herdar a cor de onde estiver.
const ICONE_YOUTUBE = `<svg class="ic" viewBox="0 0 24 17" width="17" height="12" aria-hidden="true" focusable="false"><path fill="currentColor" d="M23.5 2.7A3 3 0 0 0 21.4.6C19.6 0 12 0 12 0S4.4 0 2.6.6A3 3 0 0 0 .5 2.7 31 31 0 0 0 0 8.5a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.8.6 9.4.6 9.4.6s7.6 0 9.4-.6a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-5.8 31 31 0 0 0-.5-5.8Z"/><path fill="#0A1A3C" d="M9.6 12.1 15.9 8.5 9.6 4.9v7.2Z"/></svg>`;
const ICONE_DOC = `<svg class="ic" viewBox="0 0 16 20" width="13" height="16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M9.5 0H2.5A2.5 2.5 0 0 0 0 2.5v15A2.5 2.5 0 0 0 2.5 20h11a2.5 2.5 0 0 0 2.5-2.5V6.5L9.5 0Zm0 2.2 4.3 4.3H10a.5.5 0 0 1-.5-.5V2.2ZM3.5 10h9v1.4h-9V10Zm0 3.4h9v1.4h-9v-1.4Zm0-6.8h4v1.4h-4V6.6Z"/></svg>`;

// ------------------------------------------------------------------- peças

/** Faixa de intensidade: uma barra por minuto da sessão, do início ao fim. */
function faixaDeMinutos(sessao, maxGlobal) {
  if (!sessao.serie.length) return "";

  const porHora = new Map(sessao.serie.map((m) => [m.hora, m]));
  const [h0, m0] = sessao.horaInicio.split(":").map(Number);
  const fim = sessao.horaFim ?? sessao.serie.at(-1).hora;
  const [h1, m1] = fim.split(":").map(Number);
  const inicioMin = h0 * 60 + m0;
  const totalMin = Math.max(1, h1 * 60 + m1 - inicioMin);

  // Dourado marca o minuto que ganhou fala, ligando o gráfico aos cartões
  // abaixo — não o simples volume de reações.
  const citados = new Set(sessao.minutosCitados ?? []);
  const barras = [];
  for (let i = 0; i <= totalMin; i += 1) {
    const min = inicioMin + i;
    const hora = `${String(Math.floor(min / 60) % 24).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
    const dados = porHora.get(hora);
    const n = dados?.n ?? 0;
    const altura = n ? Math.max(6, Math.round((n / maxGlobal) * 100)) : 0;
    const ehPico = citados.has(hora);
    const detalhe = dados
      ? Object.entries(dados.porTipo)
          .sort((a, b) => b[1] - a[1])
          .map(([k, v]) => `${emojiDe(k)} ${v}`)
          .join("  ")
      : "";
    barras.push(
      `<i class="barra${ehPico ? " barra-pico" : ""}${n ? "" : " barra-vazia"}" style="--h:${altura}%"` +
        (n ? ` data-hora="${hora}" data-n="${n}" data-detalhe="${esc(detalhe)}" tabindex="0"` : ` aria-hidden="true"`) +
        `></i>`
    );
  }

  return `
      <div class="faixa" role="img" aria-label="Reações por minuto durante a sessão, das ${sessao.horaInicio} às ${fim}. Pico de ${Math.max(...sessao.serie.map((m) => m.n))} reações num minuto.">
        ${barras.join("")}
      </div>
      <div class="faixa-eixo"><span>${sessao.horaInicio}</span><span>${fim}</span></div>`;
}

/** Composição por tipo de reação — barras rotuladas, uma por reação. */
function composicao(sessao) {
  const totais = new Map();
  for (const m of sessao.serie) {
    for (const [k, v] of Object.entries(m.porTipo)) totais.set(k, (totais.get(k) ?? 0) + v);
  }
  if (!totais.size) return "";
  const max = Math.max(...totais.values());
  const linhas = REACOES.filter((r) => totais.get(r.kind)).map((r) => {
    const n = totais.get(r.kind);
    return `
          <div class="comp-linha">
            <span class="comp-rot"><b aria-hidden="true">${r.emoji}</b> ${esc(r.label)}</span>
            <span class="comp-barra"><i style="--w:${Math.round((n / max) * 100)}%;--c:${COR_REACAO[r.kind]}"></i></span>
            <span class="comp-n">${n}</span>
          </div>`;
  });
  return `<div class="comp">${linhas.join("")}</div>`;
}

/** Um momento de pico, com a fala que o provocou quando existe. */
function momento(pico) {
  const cit = pico.citacao;
  const corpo = `<blockquote class="fala">${esc(cit.texto)}</blockquote>
             ${cit.quem || cit.nota ? `<figcaption class="fala-quem">${cit.quem ? `<b>${esc(cit.quem)}</b>` : ""}${cit.quem && cit.nota ? " · " : ""}${cit.nota ? esc(cit.nota) : ""}</figcaption>` : ""}`;

  const mistura = Object.entries(pico.porTipo)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `<span class="mini-reacao" title="${esc(labelDe(k))}"><b aria-hidden="true">${emojiDe(k)}</b>${v}</span>`)
    .join("");

  // O link abre a gravação NO SEGUNDO do pico: é a diferença entre a hora em
  // que a sala reagiu e a hora em que a transmissão começou.
  const verVideo = pico.video
    ? `<a class="ver-video" href="${esc(pico.video.url)}" target="_blank" rel="noopener">
                 ${ICONE_YOUTUBE} ${pico.video.aproximado ? "Abrir a gravação" : "Ver este minuto no vídeo"}
               </a>`
    : "";

  // Nem toda fala boa caiu num minuto reagido — quando não houve reação, o
  // cartão mostra só a hora, em vez de estampar um zero.
  const contagem = pico.n
    ? `<span class="momento-n">${pico.n} <small>reações<br>na sequência</small></span>`
    : "";

  return `
        <figure class="momento">
          <div class="momento-marca">
            <span class="momento-hora">${esc(pico.hora)}</span>
            ${contagem}
          </div>
          <div class="momento-corpo">
            ${corpo}
            <div class="momento-rodape">
              <div class="momento-mistura">${mistura}</div>
              ${verVideo}
            </div>
          </div>
        </figure>`;
}

function perguntas(sessao) {
  if (!sessao.perguntas.length) return "";
  const ordenadas = [...sessao.perguntas].sort((a, b) => b.votos - a.votos || a.hora.localeCompare(b.hora));
  const cartao = (q) => {
    const r = q.resposta;
    // A resposta veio depois, e o link aponta para o instante em que o palco a
    // deu — não para a hora em que a pergunta foi enviada.
    const bloco = r
      ? `
            <div class="resposta">
              <p class="resposta-rot">Resposta no palco${r.hora ? ` · ${esc(r.hora)}` : ""}</p>
              <p class="resposta-texto">${esc(r.texto)}</p>
              ${
                r.citacao
                  ? `<blockquote class="resposta-citacao">${esc(r.citacao)}${r.citacaoDe ? `<cite>${esc(r.citacaoDe)}</cite>` : ""}</blockquote>`
                  : ""
              }
              <p class="resposta-rodape">
                ${r.quem ? `<span class="resposta-quem">${esc(r.quem)}</span>` : "<span></span>"}
                ${r.video ? `<a class="ver-video" href="${esc(r.video.url)}" target="_blank" rel="noopener">${ICONE_YOUTUBE} Ouvir a resposta</a>` : ""}
              </p>
            </div>`
      : "";

    return `
          <li class="pergunta${r ? " pergunta-respondida" : ""}">
            <div class="pergunta-topo">
              <span class="pergunta-hora">${esc(q.hora)}</span>
              ${q.votos ? `<span class="pergunta-votos" title="votos de outros participantes">▲ ${q.votos}</span>` : ""}
            </div>
            <p class="pergunta-texto">${esc(q.texto)}</p>
            ${q.autor ? `<p class="pergunta-autor">${esc(q.autor)}</p>` : ""}
            ${bloco}
          </li>`;
  };

  // As respondidas puxam a leitura; as que ficaram na fila vão para o fim, num
  // bloco recolhido. Elas não somem — o tempo ter acabado com a fila cheia é
  // parte do que aconteceu — mas também não competem com o que teve resposta.
  const comResposta = ordenadas.filter((q) => q.resposta);
  const semResposta = ordenadas.filter((q) => !q.resposta);

  const naFila = semResposta.length
    ? `
          <details class="perguntas-fila">
            <summary>${plural(semResposta.length, "pergunta ficou na fila", "perguntas ficaram na fila")} — o tempo acabou antes</summary>
            <ol class="perguntas perguntas-secundarias">${semResposta.map(cartao).join("")}</ol>
          </details>`
    : "";

  return `
        <section class="bloco">
          <h4 class="bloco-titulo">
            ${plural(sessao.perguntas.length, "pergunta do público", "perguntas do público")}${comResposta.length ? ` · ${comResposta.length} com resposta no palco` : ""}
          </h4>
          ${comResposta.length ? `<ol class="perguntas">${comResposta.map(cartao).join("")}</ol>` : ""}
          ${naFila}
        </section>`;
}

/**
 * Enquete: a nuvem que a plateia viu no telão, redesenhada aqui.
 *
 * O HTML sai com a lista de respostas dentro de um <details> e a nuvem é
 * montada por cima, no browser. Assim o dado existe sem depender de JS ou de
 * canvas — e quem quiser o número exato abre a lista.
 */
function enquetes(sessao) {
  if (!sessao.enquetes.length) return "";
  const blocos = sessao.enquetes.map((e) => {
    const palavrasNuvem = e.nuvem.map((p) => ({ word: p.palavra, count: p.n }));
    const listadas = e.respostas
      .map(
        (p) => `
                <li><span>${esc(p.palavra)}</span>${p.n > 1 ? `<b>${p.n}×</b>` : ""}</li>`
      )
      .join("");

    return `
          <figure class="enquete">
            <figcaption>
              <p class="enquete-pergunta">“${esc(e.pergunta)}”</p>
              <p class="enquete-meta">${esc(e.hora)} · ${plural(e.totalRespostas, "resposta", "respostas")}</p>
            </figcaption>
            <div class="nuvem" data-palavras="${esc(JSON.stringify(palavrasNuvem))}" role="img"
                 aria-label="Nuvem de palavras da enquete. Mais citadas: ${esc(e.nuvem.slice(0, 5).map((p) => p.palavra).join(", "))}.">
            </div>
            <details class="enquete-lista">
              <summary>Ver as ${e.respostas.length} respostas distintas</summary>
              <ul>${listadas}</ul>
            </details>
          </figure>`;
  });
  return `
        <section class="bloco">
          <h4 class="bloco-titulo">${sessao.enquetes.length === 1 ? "Enquete no telão" : "Enquetes no telão"}</h4>
          ${blocos.join("")}
        </section>`;
}

function fotos(sessao) {
  if (!sessao.fotos.length) return "";
  const itens = sessao.fotos.map(
    (f) => `
            <figure class="foto">
              <img src="fotos/${esc(f.arquivo)}" alt="Registro da sessão ${esc(sessao.titulo)}${f.hora ? ` às ${esc(f.hora)}` : ""}" loading="lazy">
              ${f.hora ? `<figcaption>${esc(f.hora)}</figcaption>` : ""}
            </figure>`
  );
  return `
        <section class="bloco">
          <h4 class="bloco-titulo">${plural(sessao.fotos.length, "foto", "fotos")}</h4>
          <div class="fotos">${itens.join("")}</div>
        </section>`;
}

/**
 * O que sobrou registrado da sessão além dos números: a gravação e o documento.
 * Quando a transmissão só entrou no ar depois do começo (o caso da palestra do
 * Tessarolo, que abriu 14h45 e passou a ser transmitida 15h10), o link diz isso
 * em vez de prometer um trecho que não existe.
 */
function registros(sessao) {
  const itens = [];

  if (sessao.video) {
    itens.push(
      `<a class="registro registro-video" href="${esc(sessao.video.url)}" target="_blank" rel="noopener">
                ${ICONE_YOUTUBE}
                <span>Assistir<small>${sessao.video.aproximado ? `o bloco inteiro · ${esc(sessao.video.duracao)}` : `no ponto da sessão · ${esc(sessao.video.duracao)}`}</small></span>
              </a>`
    );
  }
  if (sessao.documento) {
    const tamanho = sessao.documento.bytes ? ` · ${Math.round(sessao.documento.bytes / 1024)} KB` : "";
    itens.push(
      `<a class="registro registro-doc" href="${esc(sessao.documento.arquivo)}" target="_blank" rel="noopener">
                ${ICONE_DOC}
                <span>Relatoria da sessão<small>PDF${tamanho}</small></span>
              </a>`
    );
  }
  return itens.length ? `<div class="registros">${itens.join("")}</div>` : "";
}

function palestrantes(sessao) {
  if (!sessao.palestrantes.length) return "";
  const itens = sessao.palestrantes.map(
    (p) => `
            <li class="palestrante">
              <p class="palestrante-nome">${esc([p.titulo, p.nome].filter(Boolean).join(" "))}</p>
              ${p.instituicao ? `<p class="palestrante-inst">${esc(p.instituicao)}</p>` : ""}
              ${p.bio ? `<p class="palestrante-bio">${esc(p.bio)}</p>` : ""}
            </li>`
  );
  return `<ul class="palestrantes">${itens.join("")}</ul>`;
}

function sessaoHTML(sessao, maxGlobal) {
  // Uma sessão discreta é a que o público mal registrou: credenciamento,
  // intervalo, evento paralelo fechado. Ela continua na linha do tempo, porque
  // aconteceu e a hora dela importa, mas não ganha faixa nem gráfico — três
  // reações não formam uma curva, e desenhar uma daria a elas um peso falso.
  const discreta =
    sessao.totalReacoes < 30 &&
    !sessao.perguntas.length &&
    !sessao.enquetes.length &&
    !sessao.fotos.length;

  const numeros = [
    sessao.totalReacoes ? plural(sessao.totalReacoes, "reação", "reações") : null,
    sessao.perguntas.length ? plural(sessao.perguntas.length, "pergunta", "perguntas") : null,
    sessao.fotos.length ? plural(sessao.fotos.length, "foto", "fotos") : null,
  ].filter(Boolean);

  return `
      <article class="sessao${discreta ? " sessao-discreta" : ""}" id="${idDaSessao(sessao)}">
        <div class="sessao-hora">
          <time>${esc(sessao.horaInicio)}</time>
          ${sessao.horaFim ? `<span class="sessao-ate">${esc(sessao.horaFim)}</span>` : ""}
        </div>
        <div class="sessao-corpo">
          <header class="sessao-cab">
            ${sessao.prefixo || sessao.eixo ? `<p class="sessao-eixo">${esc(sessao.prefixo ?? sessao.eixo)}</p>` : ""}
            <h3 class="sessao-titulo">${esc(sessao.titulo)}</h3>
            ${sessao.pessoa ? `<p class="sessao-pessoa">${esc(sessao.pessoa)}</p>` : ""}
            <p class="sessao-meta">
              ${sessao.sala ? `<span>${esc(sessao.sala)}</span>` : ""}
              ${numeros.map((n) => `<span>${n}</span>`).join("")}
            </p>
            ${registros(sessao)}
          </header>
          ${sessao.descricao && !discreta ? `<p class="sessao-desc">${esc(sessao.descricao)}</p>` : ""}
          ${palestrantes(sessao)}
          ${!discreta && sessao.serie.length ? faixaDeMinutos(sessao, maxGlobal) : ""}
          ${sessao.momentos.length ? `<div class="momentos">${sessao.momentos.map((m) => momento(m)).join("")}</div>` : ""}
          ${!discreta && sessao.serie.length ? composicao(sessao) : ""}
          ${enquetes(sessao)}
          ${perguntas(sessao)}
          ${fotos(sessao)}
        </div>
      </article>`;
}

function diaHTML(dia, maxGlobal, semFotosNoEvento) {
  const resumo = [
    dia.reacoes ? plural(dia.reacoes, "reação", "reações") : null,
    dia.perguntas ? plural(dia.perguntas, "pergunta", "perguntas") : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return `
    <section class="dia" id="dia-${dia.data}">
      <header class="dia-cab">
        <p class="dia-ordem">Dia ${dia.ordem} de 4</p>
        <h2 class="dia-titulo"><span class="dia-num">${dia.numero}</span> <span>${esc(dia.diaSemana)}</span></h2>
        <p class="dia-resumo">${resumo || "sem registros no app"}</p>
      </header>
      ${dia.sessoes.map((s) => sessaoHTML(s, maxGlobal)).join("")}
      ${
        semFotosNoEvento
          ? `<div class="slot-fotos">
            <p><b>As fotos deste dia entram aqui.</b> Solte os arquivos em <code>retrospectiva/fotos/</code> e rode o build de novo: cada foto vai para o minuto em que foi tirada, lido do EXIF, e a sessão que estava rolando naquela hora a adota.</p>
          </div>`
          : ""
      }
    </section>`;
}

function prologo(marcos) {
  const itens = marcos.marcos.map(
    (m) => `
        <li class="marco${m.destaque ? " marco-destaque" : ""}${m.eOEvento ? " marco-evento" : ""}">
          <p class="marco-ano">${esc(m.ano)}</p>
          <h3 class="marco-titulo">${esc(m.titulo)}</h3>
          <p class="marco-desc">${esc(m.descricao)}</p>
        </li>`
  );
  const direcao = marcos.direcao
    .map((d) => `<li><b>${esc(d.periodo)}</b> ${esc(d.nome)}</li>`)
    .join("");

  return `
    <section class="prologo" id="prologo">
      <div class="secao-cab">
        <p class="eyebrow">Antes do congresso</p>
        <h2 class="secao-titulo">Vinte anos até aqui</h2>
        <p class="secao-sub">O VIII Concefor é o capítulo mais recente de uma linha do tempo que começa numa portaria de 2004 e passa por uma salinha emprestada no campus Serra.</p>
      </div>
      <div class="slider" data-slider>
        <div class="marcos-caixa">
          <ol class="marcos" data-trilho>${itens.join("")}</ol>
        </div>
        <div class="slider-controles">
          <p class="slider-posicao" data-posicao>1 de ${marcos.marcos.length}</p>
          <div class="slider-botoes">
            <button type="button" class="slider-btn" data-ir="-1" aria-label="Marcos anteriores">‹</button>
            <button type="button" class="slider-btn" data-ir="1" aria-label="Próximos marcos">›</button>
          </div>
        </div>
      </div>
      <aside class="direcao">
        <h3>Quem dirigiu o Cefor</h3>
        <ul>${direcao}</ul>
        <p class="direcao-nota">O Cefor foi dirigido por mulheres em toda a sua história. Duas delas — Vanessa Battestin e Mariella Berger — subiram ao palco deste congresso.</p>
      </aside>
    </section>`;
}

/**
 * Minimapa: o pulso de cada dia em 24 colunas.
 *
 * Uma coluna por minuto daria 531 traços de um pixel numa barra de navegação —
 * ruído, não forma. Cada coluna aqui é um bloco de meia hora, e a altura é o
 * minuto mais quente do bloco (não a soma: o que interessa no relance é onde a
 * sala explodiu, e somar achataria o pico dentro da média da meia hora).
 */
function minimapa(dias, maxGlobal) {
  const BLOCOS = 24;
  const colunas = dias.map((dia) => {
    const minutos = dia.sessoes.flatMap((s) => s.serie);
    if (!minutos.length) {
      return `<a class="mm-dia" href="#dia-${dia.data}" aria-label="Ir para o dia ${dia.numero}, sem registros"><span class="mm-vazio"></span><span class="mm-rot">${dia.numero}</span></a>`;
    }
    const emMinutos = (h) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3, 5));
    const de = Math.min(...minutos.map((m) => emMinutos(m.hora)));
    const ate = Math.max(...minutos.map((m) => emMinutos(m.hora)));
    const largura = Math.max(1, ate - de);

    const picos = new Array(BLOCOS).fill(0);
    for (const m of minutos) {
      const i = Math.min(BLOCOS - 1, Math.floor(((emMinutos(m.hora) - de) / largura) * BLOCOS));
      picos[i] = Math.max(picos[i], m.n);
    }
    const traços = picos
      .map((n) => `<i style="--h:${n ? Math.max(10, Math.round((n / maxGlobal) * 100)) : 3}%" aria-hidden="true"></i>`)
      .join("");
    return `<a class="mm-dia" href="#dia-${dia.data}" aria-label="Ir para o dia ${dia.numero}, ${plural(dia.reacoes, "reação", "reações")}"><span class="mm-barras">${traços}</span><span class="mm-rot">${dia.numero}</span></a>`;
  });
  return `<nav class="minimapa" aria-label="Atividade ao longo do evento">${colunas.join("")}</nav>`;
}

function epilogo(dados) {
  const t = dados.totais;
  const maxTipo = Math.max(...dados.reacoesPorTipo.map((r) => r.n));
  const tipos = dados.reacoesPorTipo.map(
    (r) => `
          <div class="comp-linha">
            <span class="comp-rot">
              <span class="comp-rot-nome"><b aria-hidden="true">${r.emoji}</b> ${esc(r.label)}</span>
              <small>${esc(r.labelRelatorio)}</small>
            </span>
            <span class="comp-barra"><i style="--w:${Math.round((r.n / maxTipo) * 100)}%;--c:${COR_REACAO[r.kind]}"></i></span>
            <span class="comp-n">${r.n.toLocaleString("pt-BR")}</span>
          </div>`
  );

  const tiles = [
    [t.reacoes, "reações"],
    [t.dispositivos, "aparelhos reagindo"],
    [t.entraramComInscricao, "entraram com a inscrição"],
    [t.inscritosConfirmados, "inscritos confirmados"],
    [t.perguntas, "perguntas ao palco"],
    [t.votosEmPerguntas, "votos em perguntas"],
    [t.respostasEnquete, "respostas de enquete"],
    [t.conexoes, "conexões entre pessoas"],
  ]
    .map(
      ([n, rot]) =>
        `<div class="tile"><span class="tile-n">${n.toLocaleString("pt-BR")}</span><span class="tile-rot">${rot}</span></div>`
    )
    .join("");

  const p = dados.procedencia;
  return `
    <section class="epilogo" id="numeros">
      <div class="secao-cab">
        <p class="eyebrow">O que ficou registrado</p>
        <h2 class="secao-titulo">Os números do congresso</h2>
        <p class="secao-sub">Nada aqui foi digitado à mão. Cada número saiu da linha do tempo do app — o mesmo registro que alimentava o telão enquanto o evento acontecia.</p>
      </div>

      <div class="tiles">${tiles}</div>

      <div class="bloco bloco-largo">
        <h3 class="bloco-titulo">Como o público reagiu</h3>
        <div class="comp comp-grande">${tipos.join("")}</div>
        <p class="nota">A escala sobe em intensidade: de “que massa” até “explodiu a mente”. O nome à direita de cada linha é como a reação aparece no relatório institucional.</p>
      </div>

      <div class="procedencia">
        <h3>De onde vêm estes dados</h3>
        <ul>
          <li><b>Linha do tempo do app</b> — ${plural(t.reacoes + t.perguntas + t.votosEmPerguntas + t.respostasEnquete, "registro com hora", "registros com hora")}, da cópia do banco de 25/08/2026.</li>
          ${
            p.transcricoes
              ? `<li><b>Fala do palco</b> — ${plural(p.transcricoes.linhas, "trecho transcrito", "trechos transcritos")} de ${plural(p.transcricoes.arquivos, "sessão gravada", "sessões gravadas")}, usados só para descobrir o que se dizia nos minutos de pico. ${p.citacoesAprovadas ? `${plural(p.citacoesAprovadas, "frase passou", "frases passaram")} pela curadoria e aparece nesta página.` : ""}</li>`
              : ""
          }
          ${
            p.videos?.total
              ? `<li><b>Gravações</b> — ${plural(p.videos.total, "transmissão do canal do Cefor", "transmissões do canal do Cefor")} no YouTube, em <a href="${esc(p.videos.playlist)}" target="_blank" rel="noopener">playlist própria</a>. Como cada live guarda a hora em que começou, os links desta página abrem no instante exato de cada momento.</li>`
              : ""
          }
          ${
            p.documentos?.total
              ? `<li><b>Relatorias</b> — ${plural(p.documentos.total, "peça montada", "peças montadas")} a partir das transcrições: cada uma resume a sessão, apresenta quem falou e guarda as passagens que valem citação, com a hora de cada uma.</li>`
              : ""
          }
          <li><b>Vinte anos do Cefor</b> — marcos extraídos do Livro Cefor 20 Anos.</li>
          ${
            p.fotos.total
              ? `<li><b>Fotos</b> — ${plural(p.fotos.total, "imagem da cobertura", "imagens da cobertura")}, ancoradas pelo horário do EXIF.</li>`
              : `<li><b>Fotos</b> — a cobertura da CGTE ainda não entrou; os espaços estão reservados.</li>`
          }
        </ul>
        <p class="nota">Nomes completos, e-mails e documentos dos participantes não saem do servidor: as perguntas aparecem com o primeiro nome de quem enviou, e as conexões, só como contagem.</p>
      </div>
    </section>`;
}

// -------------------------------------------------------------------- CSS --

const CSS = `
:root {
  color-scheme: dark;

  /* Marca — de app/src/app/tokens.css */
  --navy-900: #0A1A3C;
  --navy-800: #102A5C;
  --navy-700: #122E5E;
  --poco: #0D2149;
  --ink: #F4F8FF;
  --ink-dim: #9FB6D6;
  --ink-mute: #7089B0;
  --line: rgba(159, 182, 214, 0.18);
  --line-forte: rgba(159, 182, 214, 0.34);
  --cyan: #00C9C9;
  --cyan-300: #00DDCA;
  --gold: #F5B82E;
  --gold-deep: #E09A10;
  --selo: linear-gradient(45deg, #FF66CC 0%, #3399CC 86%, #3C9035 99%);

  --font-title: Oswald, "Arial Narrow", system-ui, sans-serif;
  --font-text: Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --font-fala: Newsreader, Georgia, "Times New Roman", serif;

  --coluna: 60rem;
  --regua: 5.5rem;
  --gap-regua: 1.5rem;
  --radius: 12px;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--navy-900);
  color: var(--ink);
  font-family: var(--font-text);
  font-size: 1rem;
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4 {
  font-family: var(--font-title);
  font-weight: 500;
  letter-spacing: 0.01em;
  text-wrap: balance;
  margin: 0;
}

a { color: var(--cyan-300); }
:focus-visible { outline: 2px solid var(--cyan-300); outline-offset: 3px; border-radius: 4px; }

.eyebrow {
  font-family: var(--font-title);
  font-size: 0.75rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--cyan);
  margin: 0 0 0.4rem;
}

/* ---------------------------------------------------------------- topo -- */

.capa {
  position: relative;
  padding: clamp(3rem, 9vw, 6.5rem) 1.5rem clamp(2.5rem, 5vw, 4rem);
  background:
    radial-gradient(125% 60% at 50% -10%, rgba(0, 201, 201, 0.16), transparent 62%),
    linear-gradient(180deg, var(--navy-800) 0%, var(--navy-900) 100%);
  border-bottom: 1px solid var(--line);
  overflow: hidden;
}
.capa::before {
  content: "";
  position: absolute;
  inset: 0 0 auto;
  height: 3px;
  background: var(--selo);
}
.capa-int { max-width: var(--coluna); margin: 0 auto; }
.capa-marcas {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.6rem;
}
.capa-marcas .marca-selo { height: 3.4rem; width: auto; }
/* A marca do Concefor é colorida e o manual restringe essa versão a fundo
   branco — daí o cartão. Sem ele, o PNG entrega um retângulo branco solto
   sobre o navy, que lê como falha de recorte. */
.capa-marcas .marca-concefor {
  height: 2.4rem;
  width: auto;
  background: #FFFFFF;
  border-radius: 8px;
  padding: 0.3rem 0.45rem;
  box-sizing: content-box;
}
.capa-selo {
  font-family: var(--font-title);
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--gold);
  padding-left: 1rem;
  border-left: 1px solid var(--line-forte);
}
.capa h1 {
  font-size: clamp(2.4rem, 7vw, 4.4rem);
  line-height: 1.02;
  letter-spacing: -0.005em;
  margin: 0 0 1rem;
}
.capa h1 small {
  display: block;
  font-size: 0.32em;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ink-dim);
  margin-bottom: 0.7rem;
  font-weight: 400;
}
.capa-tema {
  font-size: clamp(1rem, 2.2vw, 1.2rem);
  color: var(--ink-dim);
  max-width: 46ch;
  margin: 0 0 2rem;
}
.capa-quando {
  font-family: var(--font-title);
  letter-spacing: 0.06em;
  color: var(--ink);
  border-left: 3px solid var(--gold);
  padding-left: 0.85rem;
  margin: 0 0 2.5rem;
}
.capa-quando span { display: block; color: var(--ink-dim); font-size: 0.9rem; letter-spacing: 0.02em; }

.capa-destaques { display: flex; flex-wrap: wrap; gap: 2.5rem; }
.capa-destaque span:first-child {
  display: block;
  font-family: var(--font-title);
  font-size: clamp(2rem, 5vw, 2.9rem);
  line-height: 1;
  color: var(--gold);
  font-variant-numeric: tabular-nums;
}
.capa-destaque span:last-child { font-size: 0.85rem; color: var(--ink-dim); }

/* ------------------------------------------------------------ navegação -- */

.barra {
  position: sticky;
  top: 0;
  z-index: 20;
  background: rgba(10, 26, 60, 0.93);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--line);
}
.barra-int {
  max-width: var(--coluna);
  margin: 0 auto;
  padding: 0.5rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}
/* A marca da barra repete a topbar do app: selo branco + a palavra. */
.barra-marca {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
  white-space: nowrap;
}
.barra-marca .marca-selo { height: 1.9rem; width: auto; }
.barra-word {
  font-family: var(--font-title);
  font-size: 0.85rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ink-dim);
}
.barra-word strong { color: var(--ink); font-weight: 500; }
.minimapa { display: flex; gap: 0.5rem; flex: 1; justify-content: flex-end; }
.mm-dia {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  text-decoration: none;
  padding: 0.3rem 0.45rem;
  border-radius: 8px;
  transition: background 0.15s ease;
}
.mm-dia:hover, .mm-dia:focus-visible { background: rgba(0, 201, 201, 0.12); }
.mm-dia[aria-current="true"] .mm-rot { color: var(--gold); }
.mm-dia[aria-current="true"] .mm-barras i { background: var(--gold); }
.mm-barras { display: flex; align-items: flex-end; gap: 1px; height: 22px; }
.mm-barras i { width: 2px; height: var(--h); background: var(--cyan); opacity: 0.75; border-radius: 1px; }
.mm-vazio { display: block; height: 22px; width: 18px; border-bottom: 1px dashed var(--line-forte); }
.mm-rot {
  font-family: var(--font-title);
  font-size: 0.75rem;
  color: var(--ink-dim);
  font-variant-numeric: tabular-nums;
}

/* -------------------------------------------------------------- seções -- */

main { max-width: var(--coluna); margin: 0 auto; padding: 0 1.5rem 6rem; }

.secao-cab { padding: clamp(3rem, 7vw, 5rem) 0 2rem; max-width: 52ch; }
.secao-titulo { font-size: clamp(1.8rem, 4vw, 2.6rem); line-height: 1.1; margin-bottom: 0.6rem; }
.secao-sub { color: var(--ink-dim); margin: 0; }

/* Prólogo — os 20 anos como cards num slider.
   O esmaecido à direita mostra que a história continua além da borda; os botões
   fazem o trabalho que a barra de rolagem fazia, com alvo grande o bastante
   para dedo e para teclado. A rolagem nativa continua valendo (toque, trackpad,
   setas) — os botões são um caminho a mais, não o único. */
.slider { position: relative; }
.marcos-caixa { position: relative; }
.marcos-caixa::after {
  content: "";
  position: absolute;
  top: 0; bottom: 0; right: 0;
  width: 4rem;
  pointer-events: none;
  background: linear-gradient(90deg, transparent, var(--navy-900));
  opacity: 1;
  transition: opacity 0.2s ease;
}
.slider[data-fim="true"] .marcos-caixa::after { opacity: 0; }

.slider-controles {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 0.9rem;
}
.slider-posicao {
  font-size: 0.775rem;
  color: var(--ink-mute);
  margin: 0;
  font-variant-numeric: tabular-nums;
}
.slider-botoes { display: flex; gap: 0.4rem; }
.slider-btn {
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 50%;
  border: 1px solid var(--line-forte);
  background: var(--navy-700);
  color: var(--ink);
  font-size: 1.3rem;
  line-height: 1;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, opacity 0.15s ease;
}
.slider-btn:hover:not(:disabled) { background: var(--surface-hover, #1D4D86); border-color: var(--cyan); }
.slider-btn:disabled { opacity: 0.3; cursor: default; }

.marcos {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(15rem, 16rem);
  gap: 1px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  background: var(--line);
  border-block: 1px solid var(--line);
  scrollbar-width: none;
}
.marcos::-webkit-scrollbar { display: none; }
.marco {
  scroll-snap-align: start;
  background: var(--navy-900);
  padding: 1.4rem 1.2rem 1.6rem;
  position: relative;
}
.marco::before {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: var(--line-forte);
}
.marco-destaque::before { background: var(--cyan); }
.marco-evento::before { background: var(--selo); }
.marco-ano {
  font-family: var(--font-title);
  font-size: 1.6rem;
  color: var(--ink-mute);
  margin: 0 0 0.3rem;
  font-variant-numeric: tabular-nums;
}
.marco-destaque .marco-ano { color: var(--cyan); }
.marco-evento .marco-ano { color: var(--gold); }
.marco-titulo { font-size: 1.05rem; margin-bottom: 0.4rem; }
.marco-desc { font-size: 0.875rem; color: var(--ink-dim); margin: 0; }

.direcao {
  margin-top: 2rem;
  padding: 1.4rem 1.5rem;
  background: var(--navy-700);
  border-radius: var(--radius);
  border: 1px solid var(--line);
}
.direcao h3 { font-size: 1rem; margin-bottom: 0.8rem; }
.direcao ul { list-style: none; margin: 0 0 0.9rem; padding: 0; display: grid; gap: 0.35rem; }
.direcao li { font-size: 0.9rem; color: var(--ink-dim); }
.direcao li b { color: var(--ink); font-variant-numeric: tabular-nums; margin-right: 0.5rem; font-weight: 600; }
.direcao-nota { font-size: 0.875rem; color: var(--ink-dim); margin: 0; font-style: italic; }

/* ----------------------------------------------------------------- dia -- */

.dia { padding-top: clamp(3rem, 7vw, 5rem); }
/* A barra de navegação é fixa: âncoras precisam parar abaixo dela. */
.dia, .sessao, .prologo, .epilogo { scroll-margin-top: 4.5rem; }
/* Não é sticky: o minimapa lá em cima já diz em que dia o leitor está, e um
   cabeçalho fixo por cima da coluna de leitura atravessava o texto. */
.dia-cab {
  padding: 1rem 0 1.4rem;
  margin-bottom: 0.5rem;
  border-top: 1px solid var(--line);
  padding-top: 1.6rem;
}
.dia-ordem {
  font-family: var(--font-title);
  font-size: 0.7rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ink-mute);
  margin: 0 0 0.2rem;
}
.dia-titulo { display: flex; align-items: baseline; gap: 0.7rem; font-size: 1.5rem; }
.dia-num {
  font-size: 2.6rem;
  color: var(--gold);
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.dia-resumo { color: var(--ink-dim); font-size: 0.9rem; margin: 0.1rem 0 0; }

/* -------------------------------------------------------------- sessão -- */

/* A régua vive no VÃO entre a coluna da hora e a do conteúdo — daí o
   --regua mais metade do gap. Ancorada em "--regua menos gap" ela caía dentro
   da própria coluna da hora e o ponto ficava por cima do número. */
.sessao {
  display: grid;
  grid-template-columns: var(--regua) 1fr;
  gap: 0 var(--gap-regua);
  position: relative;
  padding-bottom: 2.5rem;
}
.sessao::before {
  content: "";
  position: absolute;
  left: calc(var(--regua) + var(--gap-regua) / 2);
  top: 0.55rem;
  bottom: 0;
  width: 1px;
  background: var(--line);
}
.sessao::after {
  content: "";
  position: absolute;
  left: calc(var(--regua) + var(--gap-regua) / 2 - 3px);
  top: 0.5rem;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--cyan);
  box-shadow: 0 0 0 4px var(--navy-900);
}
.sessao-discreta::after {
  background: var(--ink-mute);
  width: 5px;
  height: 5px;
  left: calc(var(--regua) + var(--gap-regua) / 2 - 2px);
}

.sessao-hora {
  text-align: right;
  font-family: var(--font-title);
  font-variant-numeric: tabular-nums;
  padding-top: 0.05rem;
}
.sessao-hora time { font-size: 1.1rem; color: var(--ink); display: block; }
.sessao-ate { font-size: 0.8rem; color: var(--ink-mute); }

.sessao-corpo { min-width: 0; padding-bottom: 0.5rem; }
.sessao-eixo {
  font-family: var(--font-title);
  font-size: 0.7rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--cyan);
  margin: 0.15rem 0 0.25rem;
}
.sessao-titulo { font-size: 1.35rem; line-height: 1.2; }
.sessao-discreta .sessao-titulo { font-size: 1.05rem; color: var(--ink-dim); }
.sessao-pessoa { font-size: 0.95rem; color: var(--gold); margin: 0.25rem 0 0; }
.sessao-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  font-size: 0.8rem;
  color: var(--ink-mute);
  margin: 0.5rem 0 0;
}
.sessao-desc { color: var(--ink-dim); font-size: 0.925rem; margin: 0.9rem 0 0; max-width: 62ch; }

.palestrantes { list-style: none; margin: 1.2rem 0 0; padding: 0; display: grid; gap: 0.9rem; }
.palestrante { border-left: 2px solid var(--line-forte); padding-left: 0.9rem; }
.palestrante-nome { margin: 0; font-weight: 600; font-size: 0.95rem; }
.palestrante-inst { margin: 0; font-size: 0.8rem; color: var(--cyan); }
.palestrante-bio { margin: 0.3rem 0 0; font-size: 0.875rem; color: var(--ink-dim); max-width: 60ch; }

/* --------------------------------------------------- faixa de intensidade */

.faixa {
  display: flex;
  align-items: flex-end;
  gap: 1px;
  height: 68px;
  margin: 1.5rem 0 0;
  padding: 0.5rem 0.6rem 0;
  background: var(--poco);
  border-radius: var(--radius) var(--radius) 0 0;
  overflow: hidden;
}
.faixa .barra {
  flex: 1 1 0;
  min-width: 2px;
  height: var(--h);
  background: var(--cyan);
  border-radius: 2px 2px 0 0;
  opacity: 0.8;
  transition: opacity 0.12s ease;
}
.faixa .barra-vazia { background: var(--line); height: 2px; opacity: 0.5; }
.faixa .barra-pico { background: var(--gold); opacity: 1; }
.faixa .barra:hover, .faixa .barra:focus-visible { opacity: 1; background: var(--cyan-300); }
.faixa .barra-pico:hover, .faixa .barra-pico:focus-visible { background: var(--gold); }
.faixa-eixo {
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  color: var(--ink-mute);
  font-variant-numeric: tabular-nums;
  background: var(--poco);
  padding: 0.25rem 0.7rem 0.4rem;
  border-radius: 0 0 var(--radius) var(--radius);
  margin-bottom: 1.2rem;
}

/* ------------------------------------------------------------- momentos -- */

.momentos { display: grid; gap: 0.9rem; margin: 1.2rem 0 0; }
.momento {
  display: grid;
  grid-template-columns: 5.5rem 1fr;
  gap: 1.1rem;
  margin: 0;
  padding: 1.1rem 1.2rem;
  background: var(--navy-700);
  border: 1px solid var(--line);
  border-left: 3px solid var(--gold);
  border-radius: var(--radius);
}
.momento-vazio { border-left-color: var(--line-forte); }
.momento-marca { text-align: right; }
.momento-hora {
  display: block;
  font-family: var(--font-title);
  font-size: 1.05rem;
  color: var(--gold);
  font-variant-numeric: tabular-nums;
}
.momento-n {
  display: block;
  font-family: var(--font-title);
  font-size: 1.5rem;
  line-height: 1.05;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}
.momento-n small {
  display: block;
  font-family: var(--font-text);
  font-size: 0.65rem;
  line-height: 1.25;
  color: var(--ink-mute);
  letter-spacing: 0.02em;
}
.momento-corpo { min-width: 0; }
.fala {
  font-family: var(--font-fala);
  font-style: italic;
  font-size: 1.075rem;
  line-height: 1.5;
  color: var(--ink);
  margin: 0;
  max-width: 58ch;
}
.fala::before { content: "“"; color: var(--gold); }
.fala::after { content: "”"; color: var(--gold); }
.fala-quem { font-size: 0.8rem; color: var(--ink-dim); margin: 0.6rem 0 0; }
.fala-quem b { color: var(--cyan); font-weight: 600; }
.fala-pendente { font-size: 0.875rem; color: var(--ink-mute); margin: 0; font-style: italic; }
.momento-mistura { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 0.7rem; }
.mini-reacao {
  font-size: 0.75rem;
  color: var(--ink-dim);
  font-variant-numeric: tabular-nums;
}
.mini-reacao b { font-style: normal; margin-right: 0.2rem; }

/* ---------------------------------------------------------- composição -- */

.comp { display: grid; gap: 0.35rem; margin: 1.2rem 0 0; }
.comp-linha {
  display: grid;
  grid-template-columns: minmax(8rem, 11rem) 1fr 3rem;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.85rem;
}
.comp-rot { color: var(--ink-dim); display: flex; align-items: baseline; gap: 0.4rem; }
.comp-rot b { font-weight: 400; }
.comp-rot small { display: block; font-size: 0.7rem; color: var(--ink-mute); }
.comp-barra { background: var(--poco); border-radius: 4px; height: 12px; overflow: hidden; }
.comp-barra i { display: block; height: 100%; width: var(--w); background: var(--c); border-radius: 0 4px 4px 0; }
.comp-n { text-align: right; font-variant-numeric: tabular-nums; color: var(--ink); }
.comp-grande .comp-linha { grid-template-columns: minmax(10rem, 14rem) 1fr 4rem; font-size: 0.95rem; }
.comp-grande .comp-barra { height: 18px; }
.comp-grande .comp-rot { flex-direction: column; gap: 0; align-items: flex-start; }
.comp-rot-nome { color: var(--ink); white-space: nowrap; }

/* ----------------------------------------------------------- perguntas -- */

.bloco { margin: 1.6rem 0 0; }
.bloco-titulo {
  font-size: 0.75rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-mute);
  margin-bottom: 0.7rem;
}
.perguntas { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.7rem; }
.pergunta {
  background: var(--navy-700);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 0.85rem 1rem;
}
.pergunta-topo { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
.pergunta-hora { font-family: var(--font-title); font-size: 0.8rem; color: var(--ink-mute); font-variant-numeric: tabular-nums; }
.pergunta-votos {
  font-size: 0.75rem;
  color: var(--gold);
  font-variant-numeric: tabular-nums;
  border: 1px solid rgba(245, 184, 46, 0.35);
  border-radius: 999px;
  padding: 0.05rem 0.5rem;
}
.pergunta-texto { margin: 0.35rem 0 0; font-size: 0.95rem; max-width: 62ch; }
.pergunta-autor { margin: 0.35rem 0 0; font-size: 0.8rem; color: var(--cyan); }
.pergunta-respondida { border-left: 3px solid var(--cyan); }

/* As que ficaram na fila: presentes, mas em segundo plano. */
.perguntas-fila { margin-top: 0.9rem; }
.perguntas-fila summary {
  font-size: 0.8rem;
  color: var(--ink-mute);
  cursor: pointer;
  padding: 0.3rem 0;
}
.perguntas-fila summary:hover { color: var(--cyan-300); }
.perguntas-fila[open] summary { margin-bottom: 0.6rem; }
.perguntas-secundarias .pergunta { background: transparent; border-style: dashed; }
.perguntas-secundarias .pergunta-texto { font-size: 0.875rem; color: var(--ink-dim); }

/* Ícones inline alinhados ao texto que acompanham. */
.ic { vertical-align: -0.12em; flex: none; }

/* A resposta do palco, encostada na pergunta que a provocou. */
.resposta {
  margin-top: 0.9rem;
  padding-top: 0.85rem;
  border-top: 1px solid var(--line);
}
.resposta-rot {
  font-family: var(--font-title);
  font-size: 0.68rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--cyan);
  margin: 0 0 0.4rem;
  font-variant-numeric: tabular-nums;
}
.resposta-texto { margin: 0; font-size: 0.9rem; color: var(--ink-dim); max-width: 64ch; }
.resposta-citacao {
  font-family: var(--font-fala);
  font-style: italic;
  font-size: 0.975rem;
  color: var(--ink);
  margin: 0.7rem 0 0;
  padding-left: 0.9rem;
  border-left: 2px solid var(--gold);
  max-width: 58ch;
}
.resposta-citacao cite {
  display: block;
  font-family: var(--font-text);
  font-style: normal;
  font-size: 0.75rem;
  color: var(--ink-mute);
  margin-top: 0.35rem;
}
.resposta-rodape {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin: 0.7rem 0 0;
}
.resposta-quem { font-size: 0.8rem; color: var(--ink); font-weight: 600; }

/* ------------------------------------------------------------- enquete -- */

.enquete {
  background: var(--navy-700);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 1rem 1.1rem;
  margin: 0 0 0.7rem;
}
.enquete figcaption { margin-bottom: 0.9rem; }
.enquete-pergunta { font-family: var(--font-fala); font-style: italic; font-size: 1rem; margin: 0; }
.enquete-meta { font-size: 0.75rem; color: var(--ink-mute); margin: 0.2rem 0 0; font-variant-numeric: tabular-nums; }

/* A nuvem é montada pelo JS dentro desta área; a altura precisa existir ANTES,
   porque o algoritmo posiciona as palavras a partir do espaço disponível. */
.nuvem {
  position: relative;
  width: 100%;
  height: clamp(260px, 42vw, 380px);
  background: var(--poco);
  border-radius: var(--radius);
  overflow: hidden;
  font-family: var(--font-title);
}
.nuvem-palavra {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  white-space: nowrap;
  user-select: none;
}
/* Enquanto o JS não desenhou, a área não fica um buraco vazio. */
.nuvem:not([data-pronta])::after {
  content: "montando a nuvem…";
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-text);
  font-size: 0.8rem;
  color: var(--ink-mute);
}
.enquete-lista { margin-top: 0.8rem; }
.enquete-lista summary {
  font-size: 0.8rem;
  color: var(--cyan-300);
  cursor: pointer;
  padding: 0.2rem 0;
}
.enquete-lista ul {
  list-style: none;
  margin: 0.6rem 0 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));
  gap: 0.2rem 1rem;
}
.enquete-lista li {
  font-size: 0.825rem;
  color: var(--ink-dim);
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  border-bottom: 1px solid var(--line);
  padding: 0.15rem 0;
}
.enquete-lista li b { color: var(--gold); font-variant-numeric: tabular-nums; font-weight: 500; }

/* ------------------------------------------------- gravação e documento -- */

.registros { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.8rem; }
.registro {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.8rem 0.4rem 0.6rem;
  border: 1px solid var(--line-forte);
  border-radius: var(--radius-pill, 999px);
  background: var(--navy-700);
  color: var(--ink);
  text-decoration: none;
  font-size: 0.825rem;
  transition: border-color 0.15s ease, background 0.15s ease;
}
.registro:hover { border-color: var(--cyan); background: #1D4D86; }
.registro small { display: block; font-size: 0.7rem; color: var(--ink-mute); }
.registro-doc .ic { color: var(--cyan-300); }
.registro-video .ic { color: #FF3D3D; }

.momento-rodape {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 0.7rem;
}
.ver-video {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.775rem;
  color: var(--cyan-300);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  white-space: nowrap;
}
.ver-video:hover { border-bottom-color: var(--cyan-300); }
.ver-video .ic { color: #FF3D3D; }

/* --------------------------------------------------------------- fotos -- */

.fotos { display: grid; grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr)); gap: 0.6rem; }
.foto { margin: 0; }
.foto img { width: 100%; height: 100%; object-fit: cover; border-radius: var(--radius); display: block; aspect-ratio: 4 / 3; }
.foto figcaption { font-size: 0.7rem; color: var(--ink-mute); margin-top: 0.25rem; font-variant-numeric: tabular-nums; }

.slot-fotos {
  margin: 1rem 0 0 calc(var(--regua) + 1.5rem);
  padding: 1rem 1.2rem;
  border: 1px dashed var(--line-forte);
  border-radius: var(--radius);
  background: rgba(18, 46, 94, 0.4);
}
.slot-fotos p { margin: 0; font-size: 0.875rem; color: var(--ink-dim); max-width: 68ch; }
.slot-fotos b { color: var(--ink); }
code {
  font-family: ui-monospace, "Cascadia Code", Consolas, monospace;
  font-size: 0.875em;
  background: var(--poco);
  padding: 0.1em 0.4em;
  border-radius: 4px;
  color: var(--cyan-300);
}

/* ------------------------------------------------------------- epílogo -- */

/* Quatro colunas para os oito números fecharem duas linhas exatas — com
   auto-fit sobrava um vão claro no fim da grade. */
.tiles {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: var(--line);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  overflow: hidden;
}
@media (max-width: 820px) { .tiles { grid-template-columns: repeat(2, 1fr); } }
.tile { background: var(--navy-700); padding: 1.1rem 1.2rem; }
.tile-n {
  display: block;
  font-family: var(--font-title);
  font-size: 1.9rem;
  line-height: 1.1;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}
.tile-rot { font-size: 0.775rem; color: var(--ink-dim); }
.bloco-largo { margin-top: 2.5rem; }
.bloco-largo .bloco-titulo { font-size: 1.1rem; letter-spacing: 0.01em; text-transform: none; color: var(--ink); font-family: var(--font-title); }
.nota { font-size: 0.825rem; color: var(--ink-mute); margin: 1rem 0 0; max-width: 68ch; }

.procedencia {
  margin-top: 2.5rem;
  padding: 1.4rem 1.5rem;
  background: var(--navy-700);
  border: 1px solid var(--line);
  border-radius: var(--radius);
}
.procedencia h3 { font-size: 1rem; margin-bottom: 0.8rem; }
.procedencia ul { margin: 0; padding-left: 1.1rem; display: grid; gap: 0.45rem; }
.procedencia li { font-size: 0.875rem; color: var(--ink-dim); }
.procedencia li b { color: var(--ink); font-weight: 600; }

.rodape {
  max-width: var(--coluna);
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
  border-top: 1px solid var(--line);
  font-size: 0.8rem;
  color: var(--ink-mute);
}
.rodape p { margin: 0 0 0.9rem; max-width: 72ch; }
.rodape p:last-child { margin-bottom: 0; }
.rodape-ia { color: var(--ink-dim); }
.rodape-ia b { color: var(--ink); font-weight: 600; }

/* ------------------------------------------------------------- tooltip -- */

#dica {
  position: fixed;
  z-index: 50;
  pointer-events: none;
  background: var(--navy-800);
  border: 1px solid var(--line-forte);
  border-radius: 8px;
  padding: 0.45rem 0.7rem;
  font-size: 0.8rem;
  line-height: 1.4;
  box-shadow: 0 8px 26px rgba(0, 0, 0, 0.45);
  opacity: 0;
  transition: opacity 0.12s ease;
  white-space: nowrap;
}
#dica[data-visivel="true"] { opacity: 1; }
#dica b { color: var(--gold); font-variant-numeric: tabular-nums; }
#dica span { color: var(--ink-dim); display: block; font-size: 0.75rem; }

/* -------------------------------------------------------------- telas -- */

@media (max-width: 640px) {
  :root { --regua: 3.2rem; --gap-regua: 1rem; }
  .momento { grid-template-columns: 1fr; gap: 0.5rem; }
  .momento-marca { text-align: left; display: flex; align-items: baseline; gap: 0.7rem; }
  .momento-n { font-size: 1.1rem; }
  .momento-n small { display: inline; font-size: 0.7rem; }
  .comp-linha, .palavra { grid-template-columns: minmax(6rem, 8rem) 1fr 2.5rem; font-size: 0.8rem; }
  .slot-fotos { margin-left: 0; }
  .capa-destaques { gap: 1.5rem; }
}

@media (prefers-reduced-motion: reduce) {
  * { transition-duration: 0.01ms !important; scroll-behavior: auto !important; }
}

@media print {
  :root {
    --navy-900: #FFFFFF; --navy-800: #FFFFFF; --navy-700: #FFFFFF; --poco: #EEF2F8;
    --ink: #0A1A3C; --ink-dim: #3A4E70; --ink-mute: #5C7091;
    --line: #C9D4E4; --line-forte: #A8B8CE; --cyan: #0E7A8A; --cyan-300: #0E7A8A; --gold: #A2700A;
  }
  body { background: #FFFFFF; color: #0A1A3C; }
  .barra, .slot-fotos, #dica { display: none; }
  .capa { background: #FFFFFF; }
  .dia-cab { position: static; background: none; }
  .sessao, .momento, .pergunta, .enquete { break-inside: avoid; }
  .marcos { grid-auto-flow: row; grid-auto-columns: auto; overflow: visible; }
}
`;

// --------------------------------------------------------------- script --

const JS = `
// Dica flutuante nas barras da faixa e destaque do dia na barra de cima.
(function () {
  var dica = document.getElementById("dica");

  function mostrar(alvo) {
    if (!alvo.dataset.n) return;
    dica.innerHTML = "<b>" + alvo.dataset.n + " reações</b> às " + alvo.dataset.hora +
      (alvo.dataset.detalhe ? "<span>" + alvo.dataset.detalhe + "</span>" : "");
    dica.dataset.visivel = "true";
    var r = alvo.getBoundingClientRect();
    var d = dica.getBoundingClientRect();
    var x = Math.min(Math.max(8, r.left + r.width / 2 - d.width / 2), window.innerWidth - d.width - 8);
    var y = r.top - d.height - 8;
    dica.style.left = x + "px";
    dica.style.top = (y < 8 ? r.bottom + 8 : y) + "px";
  }
  function esconder() { dica.dataset.visivel = "false"; }

  document.addEventListener("pointerover", function (e) {
    var alvo = e.target.closest(".barra");
    if (alvo) mostrar(alvo); else esconder();
  });
  document.addEventListener("focusin", function (e) {
    var alvo = e.target.closest(".barra");
    if (alvo) mostrar(alvo); else esconder();
  });
  document.addEventListener("pointerleave", esconder);
  window.addEventListener("scroll", esconder, { passive: true });

  // Slider dos 20 anos: os botões andam de um card por vez e o contador diz
  // onde se está. A rolagem nativa continua funcionando (toque, trackpad,
  // setas) — daí ouvir o evento de scroll para manter os controles em dia.
  [].forEach.call(document.querySelectorAll("[data-slider]"), function (slider) {
    var trilho = slider.querySelector("[data-trilho]");
    var posicao = slider.querySelector("[data-posicao]");
    var botoes = slider.querySelectorAll("[data-ir]");
    var cards = trilho.children;
    if (!cards.length) return;

    function larguraCard() {
      return cards[0].getBoundingClientRect().width + 1; // +1 do gap
    }
    function indiceAtual() {
      return Math.round(trilho.scrollLeft / larguraCard());
    }
    function atualizar() {
      var i = indiceAtual();
      var fim = trilho.scrollLeft + trilho.clientWidth >= trilho.scrollWidth - 4;
      var cabem = Math.max(1, Math.round(trilho.clientWidth / larguraCard()));
      var ultimo = i + cabem;
      posicao.textContent =
        cabem >= cards.length
          ? cards.length + " marcos"
          : (i + 1) + "–" + Math.min(ultimo, cards.length) + " de " + cards.length;
      slider.setAttribute("data-fim", fim ? "true" : "false");
      botoes[0].disabled = trilho.scrollLeft <= 2;
      botoes[1].disabled = fim;
    }

    [].forEach.call(botoes, function (b) {
      b.addEventListener("click", function () {
        var passo = Number(b.getAttribute("data-ir")) * larguraCard();
        trilho.scrollBy({ left: passo, behavior: "smooth" });
      });
    });

    var t = null;
    trilho.addEventListener("scroll", function () {
      clearTimeout(t);
      t = setTimeout(atualizar, 80);
    }, { passive: true });
    window.addEventListener("resize", atualizar);
    atualizar();
  });

  // Dia visível → destaque no minimapa.
  var dias = [].slice.call(document.querySelectorAll(".dia"));
  var links = {};
  [].forEach.call(document.querySelectorAll(".mm-dia"), function (a) {
    links[a.getAttribute("href").slice(1)] = a;
  });
  if ("IntersectionObserver" in window && dias.length) {
    var visiveis = {};
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) { visiveis[en.target.id] = en.isIntersecting ? en.intersectionRatio : 0; });
      var melhor = null, nota = 0;
      Object.keys(visiveis).forEach(function (id) { if (visiveis[id] > nota) { nota = visiveis[id]; melhor = id; } });
      Object.keys(links).forEach(function (id) {
        if (id === melhor) links[id].setAttribute("aria-current", "true");
        else links[id].removeAttribute("aria-current");
      });
    }, { threshold: [0, 0.1, 0.5, 1], rootMargin: "-15% 0px -60% 0px" });
    dias.forEach(function (d) { obs.observe(d); });
  }
})();
`;

// -------------------------------------------------------------- página --

export function renderizar(dados, marca = {}) {
  const maxGlobal = Math.max(
    1,
    ...dados.dias.flatMap((d) => d.sessoes.flatMap((s) => s.serie.map((m) => m.n)))
  );
  // As duas marcas, como na topbar do app: o selo 20 anos em versão branca
  // (o manual manda monocromática sobre fundo colorido) ao lado do Concefor.
  const selo = marca.selo
    ? `<img class="marca-selo" src="${marca.selo.uri}" alt="Selo 20 anos do Cefor" width="${marca.selo.largura}" height="${marca.selo.altura}">`
    : "";
  const logoConcefor = marca.concefor
    ? `<img class="marca-concefor" src="${marca.concefor.uri}" alt="" width="${marca.concefor.largura}" height="${marca.concefor.altura}">`
    : "";
  const semFotos = dados.procedencia.fotos.total === 0;
  const t = dados.totais;

  const destaques = [
    [t.reacoes.toLocaleString("pt-BR"), "reações no telão"],
    [t.dispositivos, "aparelhos na mão do público"],
    [t.perguntas, "perguntas levadas ao palco"],
    [t.conexoes, "conexões entre pessoas"],
  ]
    .map(
      ([n, rot]) =>
        `<div class="capa-destaque"><span>${n}</span><span>${rot}</span></div>`
    )
    .join("");

  return `<title>Retrospectiva do VIII Concefor</title>
<meta name="description" content="A linha do tempo do VIII Concefor: quatro dias, ${t.reacoes.toLocaleString("pt-BR")} reações com hora marcada e o que se dizia no palco em cada pico.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600&family=Inter:wght@400;500;600&family=Newsreader:ital,opsz,wght@1,6..72,400;1,6..72,500&display=swap">
<style>${CSS}</style>

<header class="capa">
  <div class="capa-int">
    <div class="capa-marcas">
      ${selo}
      ${logoConcefor}
      <span class="capa-selo">Cefor · 20 anos</span>
    </div>
    <h1><small>Retrospectiva</small>${esc(dados.evento.nome)}</h1>
    <p class="capa-tema">${esc(dados.evento.tema)}</p>
    <p class="capa-quando">${esc(dados.evento.periodo)}<span>${esc(dados.evento.local)}</span></p>
    <div class="capa-destaques">${destaques}</div>
  </div>
</header>

<div class="barra">
  <div class="barra-int">
    <a class="barra-marca" href="#prologo" aria-label="VIII Concefor — início">
      ${selo}
      <span class="barra-word">VIII <strong>Concefor</strong></span>
    </a>
    ${minimapa(dados.dias, maxGlobal)}
  </div>
</div>

<main>
  ${prologo(dados.marcos)}

  <div class="secao-cab">
    <p class="eyebrow">17 a 20 de agosto de 2026</p>
    <h2 class="secao-titulo">Quatro dias, minuto a minuto</h2>
    <p class="secao-sub">Cada barra é um minuto de congresso, e a altura é quanta gente reagiu naquele minuto. As douradas são os minutos que ficaram registrados com a fala do palco, logo abaixo. Passe o cursor para ver o detalhe.</p>
  </div>

  ${dados.dias.map((d) => diaHTML(d, maxGlobal, semFotos)).join("")}

  ${epilogo(dados)}
</main>

<footer class="rodape">
  <p class="rodape-ia">
    <b>Feito com auxílio de inteligência artificial.</b>
    As transcrições das falas foram geradas por reconhecimento automático de voz e revisadas;
    as relatorias, os resumos das respostas e esta página foram produzidos com Claude Opus 5,
    a partir dos registros do evento, e passam por curadoria humana antes de valer como
    documento. Os números vêm direto da linha do tempo do app, sem intermediação.
  </p>
  <p>
    Gerado por <code>retrospectiva/build.mjs</code> em ${new Date(dados.geradoEm).toLocaleString("pt-BR", { dateStyle: "long", timeStyle: "short" })}.
  </p>
</footer>

<div id="dica" role="status" aria-live="polite"></div>
<script>${JS}</script>
<script>${NUVEM_JS}</script>`;
}
