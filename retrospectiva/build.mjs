#!/usr/bin/env node
// Retrospectiva do VIII Concefor — pipeline de dados + página.
//
//   node retrospectiva/build.mjs              gera dados e HTML
//   node retrospectiva/build.mjs --dados      só os dados (sem HTML)
//   node retrospectiva/build.mjs --db=CAMINHO usa outro banco
//
// Entradas (todas opcionais menos o banco):
//   banco do evento .......... app/db-concefor/concefor.db ou o .tar.gz de backup
//   transcrições ............. repo PRIVADO transcricoes-concefor (fala do palco)
//   fotos .................... retrospectiva/fotos/ (a cobertura da CGTE)
//   citações curadas ......... retrospectiva/curadoria/citacoes.json
//
// Saídas:
//   dados/retrospectiva.json ............... consolidado, sem PII — vai pro git
//   curadoria/citacoes-candidatas.md ....... rascunho pra curadoria — FORA do git
//   dist/index.html ........................ a página
//
// Rodar sem transcrições e sem fotos funciona: a página sai com os números e
// os espaços reservados. Cada insumo que chega enriquece a mesma página.

import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { abrirBanco, lerEvento } from "./lib/banco.mjs";
import { extrair } from "./lib/destar.mjs";
import { prepararVideos, pontoNoVideo } from "./lib/videos.mjs";
import { indexarFala, levantarCandidatas, acharPicos } from "./lib/transcricoes.mjs";
import { levantarFotos } from "./lib/fotos.mjs";
import { hhmm, dia as diaDe, rotularDia, minutosDoDia, somarMinutos } from "./lib/tempo.mjs";

const AQUI = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(AQUI, "..");
const args = process.argv.slice(2);
const opcao = (nome) => args.find((a) => a.startsWith(`--${nome}=`))?.split("=").slice(1).join("=");
const tem = (nome) => args.includes(`--${nome}`);

const aviso = (...m) => console.log("  ·", ...m);
const secao = (t) => console.log(`\n${t}`);

// ---------------------------------------------------------------- banco ----
function acharBanco() {
  const explicito = opcao("db") ?? process.env.CONCEFOR_DB;
  if (explicito) {
    if (!existsSync(explicito)) throw new Error(`Banco não encontrado: ${explicito}`);
    return explicito;
  }
  const candidatos = [
    join(REPO, "app", "db-concefor", "concefor.db"),
    join(AQUI, ".cache", "db-concefor", "concefor.db"),
  ];
  for (const c of candidatos) if (existsSync(c)) return c;

  // Nenhum banco solto: extrai o backup mais recente do app.
  const backups = readdirSync(join(REPO, "app"))
    .filter((f) => /^db-concefor-.*\.tar\.gz$/.test(f))
    .sort();
  if (!backups.length) {
    throw new Error(
      "Não achei o banco. Passe --db=CAMINHO ou deixe um db-concefor-*.tar.gz em app/."
    );
  }
  const backup = join(REPO, "app", backups.at(-1));
  const destino = join(AQUI, ".cache");
  mkdirSync(destino, { recursive: true });
  aviso(`extraindo ${backups.at(-1)}`);
  extrair(backup, destino);
  const extraido = join(destino, "db-concefor", "concefor.db");
  if (!existsSync(extraido)) throw new Error(`O backup não trouxe concefor.db: ${backup}`);
  return extraido;
}

// --------------------------------------------------------- transcrições ----
function acharTranscricoes() {
  const candidatos = [
    opcao("transcricoes"),
    process.env.CONCEFOR_TRANSCRICOES,
    join(REPO, "..", "transcricoes-concefor"),
    join(AQUI, ".cache", "transcricoes-concefor"),
    "c:/dev/transcritor-local/output",
  ].filter(Boolean);
  for (const c of candidatos) {
    if (!existsSync(c)) continue;
    const temArquivo = readdirSync(c).some((f) => f.endsWith(".completo.timestamped.txt"));
    if (temArquivo) return c;
  }
  return null;
}

// ------------------------------------------------------------ documentos ---
// Os PDFs vivem no repo privado das transcrições. O build copia para dist/ só
// os que existirem, e a página linka relativo — assim a pasta publicada é
// autossuficiente e nenhum link aponta para um arquivo que não foi gerado.
function acharDocumentos() {
  const candidatos = [
    opcao("documentos"),
    process.env.CONCEFOR_DOCUMENTOS,
    join(REPO, "..", "transcricoes-concefor", "documentos"),
    "c:/dev/transcricoes-concefor/documentos",
  ].filter(Boolean);
  return candidatos.find((c) => existsSync(c)) ?? null;
}

function ligarDocumentos(pasta) {
  const catalogo = JSON.parse(readFileSync(join(AQUI, "dados", "documentos.json"), "utf8"));
  const porSessao = new Map();
  const copiar = [];
  let ausentes = 0;

  let externos = 0;
  for (const doc of catalogo.documentos) {
    const local = pasta && existsSync(join(pasta, doc.arquivo));
    // Um `url` declarado manda: é o que faz o link funcionar fora desta pasta
    // (num preview publicado, por exemplo), servindo o PDF do Drive.
    if (!local && !doc.url) {
      ausentes += 1;
      continue;
    }
    if (local && !doc.url) copiar.push(doc.arquivo);
    if (doc.url) externos += 1;

    for (const sessaoId of doc.sessoes) {
      porSessao.set(sessaoId, {
        titulo: doc.titulo,
        arquivo: doc.url ?? `documentos/${doc.arquivo}`,
        externo: Boolean(doc.url),
        bytes: local ? statSync(join(pasta, doc.arquivo)).size : null,
      });
    }
  }
  return { porSessao, copiar, ausentes, externos, pasta };
}

// ------------------------------------------------------------ curadoria ----
/**
 * As falas publicáveis, de todos os arquivos de curadoria.
 *
 * São vários arquivos (um geral e um por dia) porque revisar dia a dia é mais
 * fácil que rolar uma lista de cinquenta. O arquivo de SUGESTÕES fica de fora:
 * ele é rascunho de máquina, e o que entra na página é só o que passou por
 * gente.
 *
 * Devolve as citações agrupadas por sessão, em ordem de hora — é essa lista que
 * vira os momentos narrados da página.
 */
function lerCitacoesCuradas() {
  const pasta = join(AQUI, "curadoria");
  if (!existsSync(pasta)) return { porSessao: new Map(), total: 0, aprovadas: 0, arquivos: 0 };

  const arquivos = readdirSync(pasta).filter(
    (f) => /^citacoes(-.*)?\.json$/.test(f) && f !== "citacoes-sugeridas.json"
  );

  const porSessao = new Map();
  let total = 0;
  let aprovadas = 0;
  for (const arquivo of arquivos) {
    const dados = JSON.parse(readFileSync(join(pasta, arquivo), "utf8"));
    for (const c of dados.citacoes ?? []) {
      total += 1;
      if (c.aprovada === false || !c.texto || !c.sessaoId || !c.hora) continue;
      if (!porSessao.has(c.sessaoId)) porSessao.set(c.sessaoId, []);
      porSessao.get(c.sessaoId).push(c);
      aprovadas += 1;
    }
  }

  // Duas curadorias podem ter escolhido o mesmo minuto; fica a primeira.
  for (const [id, lista] of porSessao) {
    const vistas = new Set();
    porSessao.set(
      id,
      lista
        .filter((c) => (vistas.has(c.hora) ? false : vistas.add(c.hora)))
        .sort((a, b) => a.hora.localeCompare(b.hora))
    );
  }

  return { porSessao, total, aprovadas, arquivos: arquivos.length };
}

/**
 * Respostas do palco às perguntas do público, uma por arquivo de sessão
 * (curadoria/respostas-*.json). A chave é sessão + hora de ENVIO da pergunta;
 * `lidaEm` é a hora em que a resposta começou no palco, e é dela que sai o
 * link para o minuto certo da gravação.
 */
const chaveDeTexto = (t) =>
  String(t ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

function lerRespostas() {
  const pasta = join(AQUI, "curadoria");
  if (!existsSync(pasta)) return { porHora: new Map(), total: 0 };
  // Chave é sessão + hora, mas o VALOR é uma lista: duas perguntas chegaram
  // às 15:59 e duas às 16:00 na palestra do Mariano. O campo `pergunta`
  // desempata; sem ele, sobra a ordem do arquivo.
  const porHora = new Map();
  let total = 0;
  for (const arquivo of readdirSync(pasta).filter((f) => /^respostas-.*\.json$/.test(f))) {
    const dados = JSON.parse(readFileSync(join(pasta, arquivo), "utf8"));
    for (const r of dados.respostas ?? []) {
      if (r.aprovada === false || r.encontrada === false || !r.resposta) continue;
      const chave = `${dados.sessaoId}@${r.perguntaHora}`;
      if (!porHora.has(chave)) porHora.set(chave, []);
      porHora.get(chave).push(r);
      total += 1;
    }
  }
  return { porHora, total };
}

/** A resposta daquela pergunta, desempatando por trecho quando a hora repete. */
function casarResposta(respostas, sessaoId, pergunta, usadas) {
  const candidatas = respostas.porHora.get(`${sessaoId}@${pergunta.hora}`) ?? [];
  const livres = candidatas.filter((c) => !usadas.has(c));
  if (!livres.length) return null;
  if (livres.length === 1) return livres[0];

  const texto = chaveDeTexto(pergunta.texto);
  return livres.find((c) => c.pergunta && texto.includes(chaveDeTexto(c.pergunta))) ?? livres[0];
}

function escreverCandidatas(candidatas, indice) {
  const destino = join(AQUI, "curadoria");
  mkdirSync(destino, { recursive: true });
  const linhas = [
    "# Citações candidatas — RASCUNHO DE MÁQUINA, NÃO PUBLICAR ASSIM",
    "",
    "Gerado por `retrospectiva/build.mjs`. **Este arquivo fica fora do git** e o texto",
    "abaixo é transcrição CRUA: pode conter alucinação do modelo, conversa de bastidor",
    "captada por microfone aberto e nome de quem não estava no palco.",
    "",
    "Como usar: leia cada bloco, escolha a frase que de fato marcou o momento, e leve o",
    "texto revisado para `curadoria/citacoes.json`. Só o que estiver lá entra na página.",
    "",
    `Fonte da fala: \`${indice?.cobertura ? `${indice.arquivos.length} arquivos, ${indice.cobertura.de} → ${indice.cobertura.ate}` : "sem transcrições"}\``,
    "",
    "---",
    "",
  ];

  for (const c of candidatas) {
    linhas.push(`## ${c.hora} · ${c.sessao} — ${c.reacoes} reações no minuto`);
    linhas.push("");
    linhas.push(`\`id: ${c.id}\``);
    linhas.push("");
    if (!c.temFala) {
      linhas.push("> _Sem transcrição para este minuto._");
      linhas.push("");
      continue;
    }
    for (const l of c.linhas) {
      const marca = l.suspeita ? " ⚠️" : "";
      const quando = l.distancia === 0 ? "▶" : l.distancia < 0 ? `${l.distancia}min` : `+${l.distancia}min`;
      linhas.push(`- \`${l.hora}\` ${quando}${marca} ${l.texto}`);
    }
    linhas.push("");
    if (c.sugestao) {
      linhas.push(`**Sugestão automática:** ${c.sugestao}`);
      linhas.push("");
    }
  }

  const caminho = join(destino, "citacoes-candidatas.md");
  writeFileSync(caminho, linhas.join("\n"), "utf8");
  return caminho;
}

/**
 * O que ainda falta curar, já no formato de `citacoes.json`.
 *
 * O .md ao lado serve para LER o contexto (as falas em volta do pico, com as
 * suspeitas marcadas); este arquivo serve para AGIR: cada bloco já vem pronto
 * para revisar e colar em citacoes.json. Sem ele, a página dizia "a frase ainda
 * espera curadoria" sem dizer onde ficava a frase.
 */
function escreverSugestoes(candidatas, citacoes, sessoes) {
  const titulos = new Map(sessoes.map((s) => [s.id, s.titulo]));
  const jaCurados = new Set(
    [...citacoes.porSessao].flatMap(([id, lista]) => lista.map((c) => `${id}@${c.hora}`))
  );
  const pendentes = candidatas.filter(
    (c) => c.temFala && c.sugestao && !jaCurados.has(`${c.sessaoId}@${c.hora}`)
  );

  const saida = {
    _leia:
      "Picos que têm gravação e ainda não têm frase publicada — são estes que aparecem na página como \"a frase ainda espera curadoria\". Cada item já está no formato de citacoes.json.",
    _comoUsar:
      "Abra curadoria/citacoes-candidatas.md no mesmo pico para ver a fala em volta com as horas, escolha a frase, corrija a pontuação, troque \"aprovada\" para \"rascunho\" e mova o bloco para o array `citacoes` de citacoes.json. O que ficar aqui não vai para a página.",
    _atencao:
      "O campo `texto` abaixo é RASCUNHO DE MÁQUINA colado da transcrição crua: costuma começar no meio de uma frase e pode conter erro de reconhecimento. Nunca publique sem ler.",
    _geradoEm: new Date().toISOString(),
    citacoes: pendentes.map((c) => ({
      sessaoId: c.sessaoId,
      hora: c.hora,
      _sessao: titulos.get(c.sessaoId) ?? c.sessao,
      _reacoesNoMinuto: c.reacoes,
      texto: c.sugestao,
      quem: null,
      aprovada: false,
    })),
  };

  const caminho = join(AQUI, "curadoria", "citacoes-sugeridas.json");
  writeFileSync(caminho, JSON.stringify(saida, null, 2) + "\n", "utf8");
  return { caminho, total: pendentes.length };
}

// ------------------------------------------------------------- montagem ----
function montar({ evento, indice, citacoes, fotos, marcos, videos, documentos, respostas }) {
  const { sessoes, totais, reacoesPorTipo } = evento;

  const sessoesRicas = sessoes.map((s) => {
    // Os MOMENTOS da página saem das citações curadas, não dos picos.
    //
    // A regra era outra no começo: pegue os três minutos mais reagidos e mostre
    // a fala de cada um. Só que pico alto não é o mesmo que frase memorável — o
    // Momento Musical estourou de reações durante a música, sem nada dito, e a
    // melhor fala da noite sobre os 20 anos aconteceu num minuto morno. Além
    // disso, momento sem frase virava um cartão que só dizia que faltava frase.
    //
    // Então quem manda é a curadoria: cada fala escolhida vira um momento, no
    // minuto em que foi dita. O pico continua no gráfico (a faixa marca os
    // minutos citados) e continua alimentando as sugestões de curadoria.
    const minutosComReacao = new Map(s.serie.map((m) => [m.minuto, m]));
    const momentos = (citacoes.porSessao.get(s.id) ?? []).map((c) => {
      const minuto = `${diaDe(s.inicio)}T${c.hora}`;

      // A conta cobre o minuto da fala e os dois seguintes. Ancorar só no
      // minuto exato subestima: a pessoa ouve, se emociona, pega o telefone e
      // toca — a repercussão de uma frase dita às 10:02 aparece às 10:03. Foi o
      // que aconteceu com a fala da Mariella sobre ser a única mulher da turma:
      // 1 reação no minuto dela, 31 no seguinte.
      let n = 0;
      const porTipo = {};
      for (let d = 0; d <= 2; d += 1) {
        const balde = minutosComReacao.get(somarMinutos(minuto, d));
        if (!balde) continue;
        n += balde.n;
        for (const [k, v] of Object.entries(balde.porTipo)) porTipo[k] = (porTipo[k] ?? 0) + v;
      }

      return {
        hora: c.hora,
        minuto,
        n,
        porTipo,
        citacao: { texto: c.texto, quem: c.quem ?? null, nota: c.nota ?? null },
        video: pontoNoVideo(videos, s.id, minuto),
      };
    });

    const fotosDaSessao = fotos.porSessao.get(s.id) ?? [];
    const { serie, tituloOriginal, palestranteTexto, ...resto } = s;
    const video = pontoNoVideo(videos, s.id, s.inicio);

    // A pergunta ganha a resposta que o palco deu, e um link para o instante em
    // que ela foi respondida — que não é a hora em que foi enviada.
    const usadas = new Set();
    const perguntasComResposta = s.perguntas.map((q) => {
      const r = casarResposta(respostas, s.id, q, usadas);
      if (!r) return q;
      usadas.add(r);
      const minutoResposta = r.lidaEm ? `${diaDe(s.inicio)}T${r.lidaEm}` : null;
      const videoResposta = minutoResposta ? pontoNoVideo(videos, s.id, minutoResposta) : null;
      return {
        ...q,
        resposta: {
          texto: r.resposta,
          quem: r.quem ?? null,
          citacao: r.citacao ?? null,
          // Numa mesa a resposta é de várias pessoas, mas a frase citada é de
          // uma só: assinar a citação com a lista inteira atribuiria errado.
          citacaoDe: r.citacaoDe ?? null,
          hora: r.lidaEm ?? null,
          video: videoResposta,
        },
      };
    });

    return {
      ...resto,
      perguntas: perguntasComResposta,
      duracaoMin: s.fim ? minutosDoDia(s.fim) - minutosDoDia(s.inicio) : null,
      horaInicio: hhmm(s.inicio),
      horaFim: s.fim ? hhmm(s.fim) : null,
      momentos,
      // Minutos que ganharam fala: é o que a faixa destaca em dourado, ligando
      // o gráfico aos cartões logo abaixo.
      minutosCitados: momentos.map((m) => m.hora),
      fotos: fotosDaSessao,
      serie: serie.map((m) => ({ hora: hhmm(m.minuto), n: m.n, porTipo: m.porTipo })),
      temFalaGravada: serie.some((m) => indice?.cobre(m.minuto)),
      video,
      documento: documentos.get(s.id) ?? null,
    };
  });

  // Agrupamento por dia, com o destaque de cada dia calculado dos próprios dados.
  const porDia = new Map();
  for (const s of sessoesRicas) {
    const d = diaDe(s.inicio);
    if (!porDia.has(d)) porDia.set(d, []);
    porDia.get(d).push(s);
  }

  const dias = [...porDia.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([data, lista], i) => {
      const reacoes = lista.reduce((a, s) => a + s.totalReacoes, 0);
      const destaque = [...lista].sort((a, b) => b.totalReacoes - a.totalReacoes)[0];
      return {
        data,
        ordem: i + 1,
        ...rotularDia(data),
        sessoes: lista,
        reacoes,
        perguntas: lista.reduce((a, s) => a + s.perguntas.length, 0),
        fotos: lista.reduce((a, s) => a + s.fotos.length, 0),
        destaque: destaque?.totalReacoes ? { titulo: destaque.titulo, reacoes: destaque.totalReacoes } : null,
      };
    });

  return {
    geradoEm: new Date().toISOString(),
    evento: {
      nome: "VIII Concefor",
      tema: "Tecnologia, Transformação e Educação a Distância: 20 anos construindo novos cenários educacionais",
      periodo: "17 a 20 de agosto de 2026",
      local: "Cefor/Ifes — Vitória, ES",
    },
    totais,
    reacoesPorTipo,
    marcos,
    dias,
    procedencia: {
      banco: "linha do tempo do app (timeline_events), cópia de 25/08/2026",
      transcricoes: indice
        ? { arquivos: indice.arquivos.length, linhas: indice.linhasLidas, cobertura: indice.cobertura }
        : null,
      citacoesAprovadas: citacoes.aprovadas,
      fotos: { total: fotos.total, semDono: fotos.semDono.length, pastaExiste: fotos.pastaExiste },
      videos: {
        total: videos.length,
        sessoesComVideo: sessoesRicas.filter((s) => s.video).length,
        playlist: "https://www.youtube.com/playlist?list=PLHKM4BxClqXU",
      },
      documentos: {
        total: new Set([...documentos.values()].map((d) => d.arquivo)).size,
        sessoesComDocumento: sessoesRicas.filter((s) => s.documento).length,
      },
    },
  };
}

// ----------------------------------------------------------------- main ----
console.log("Retrospectiva do VIII Concefor");

secao("1. Banco");
const caminhoBanco = acharBanco();
aviso(caminhoBanco.replace(REPO, "."));
const db = abrirBanco(caminhoBanco);
const ajustes = JSON.parse(readFileSync(join(AQUI, "dados", "palestrantes-ajustes.json"), "utf8"));
const evento = lerEvento(db, { ajustesPalestrantes: ajustes.ajustes ?? {} });
aviso(`${evento.sessoes.length} sessões · ${evento.totais.reacoes} reações · ${evento.totais.perguntas} perguntas`);

secao("2. Transcrições");
const pastaTranscricoes = acharTranscricoes();
let indice = null;
if (pastaTranscricoes) {
  indice = indexarFala(pastaTranscricoes);
  aviso(`${indice.arquivos.length} arquivos, ${indice.linhasLidas} falas`);
  aviso(`cobrem ${indice.cobertura.de.replace("T", " ")} → ${indice.cobertura.ate.replace("T", " ")}`);
} else {
  aviso("nenhuma encontrada — a página sai sem citações (veja o README)");
}

secao("3. Curadoria");
const citacoes = lerCitacoesCuradas();
aviso(`${citacoes.aprovadas} citações aprovadas de ${citacoes.total} no arquivo`);
const respostas = lerRespostas();
aviso(`${respostas.total} respostas do palco às perguntas do público`);
if (indice) {
  const candidatas = levantarCandidatas(evento.sessoes, indice);
  const caminho = escreverCandidatas(candidatas, indice);
  aviso(`${candidatas.length} candidatas → ${caminho.replace(REPO, ".")}`);
  const sugestoes = escreverSugestoes(candidatas, citacoes, evento.sessoes);
  if (sugestoes.total) {
    aviso(`${sugestoes.total} picos ainda sem frase → ${sugestoes.caminho.replace(REPO, ".")}`);
  }
}

secao("4. Gravações e documentos");
const videos = prepararVideos(JSON.parse(readFileSync(join(AQUI, "dados", "videos.json"), "utf8")));
aviso(`${videos.length} gravações do YouTube`);
const pastaDocs = acharDocumentos();
const documentos = ligarDocumentos(pastaDocs);
aviso(
  documentos.copiar.length
    ? `${documentos.copiar.length} documentos em PDF${documentos.ausentes ? ` (${documentos.ausentes} ainda não gerados)` : ""}`
    : "nenhum PDF encontrado — a página sai sem os documentos"
);

secao("5. Fotos");
const fotos = levantarFotos(join(AQUI, "fotos"), evento.sessoes);
if (!fotos.pastaExiste) aviso("pasta retrospectiva/fotos/ ainda não existe — espaço reservado na página");
else aviso(`${fotos.total} arquivos · ${fotos.semDono.length} sem sessão definida`);

secao("6. Montagem");
const marcos = JSON.parse(readFileSync(join(AQUI, "dados", "marcos-20-anos.json"), "utf8"));
const marca = JSON.parse(readFileSync(join(AQUI, "dados", "marca.json"), "utf8"));
const dados = montar({
  evento,
  indice,
  citacoes,
  fotos,
  marcos,
  videos,
  documentos: documentos.porSessao,
  respostas,
});
mkdirSync(join(AQUI, "dados"), { recursive: true });
const jsonSaida = join(AQUI, "dados", "retrospectiva.json");
writeFileSync(jsonSaida, JSON.stringify(dados, null, 1), "utf8");
aviso(`${jsonSaida.replace(REPO, ".")} (${(JSON.stringify(dados).length / 1024).toFixed(0)} KB)`);

if (!tem("dados")) {
  secao("7. Página");
  const { renderizar } = await import("./lib/render.mjs");
  mkdirSync(join(AQUI, "dist"), { recursive: true });
  const html = renderizar(dados, marca);
  const htmlSaida = join(AQUI, "dist", "index.html");
  writeFileSync(htmlSaida, html, "utf8");
  aviso(`${htmlSaida.replace(REPO, ".")} (${(html.length / 1024).toFixed(0)} KB)`);

  if (documentos.copiar.length) {
    const destino = join(AQUI, "dist", "documentos");
    mkdirSync(destino, { recursive: true });
    for (const arquivo of documentos.copiar) {
      copyFileSync(join(documentos.pasta, arquivo), join(destino, arquivo));
    }
    aviso(`${documentos.copiar.length} PDFs copiados para dist/documentos/`);
  }
}

console.log("\nPronto.");
