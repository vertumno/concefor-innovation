// Leitura do banco do evento → estruturas agregadas, já sem PII.
//
// REGRA DESTE ARQUIVO: nada que saia daqui pode conter nome completo, e-mail,
// CPF, attendeeId ou client_id. O repo é público e a página vai para a web.
// Perguntas guardam só o PRIMEIRO NOME de quem enviou (elas eram identificadas
// no telão — decisão de 05/08 — mas nome completo indexável na web é outra
// coisa). O resto é agregado: contagem, minuto, tipo.

import { DatabaseSync } from "node:sqlite";
import { isoParaMinutoLocal, hhmm } from "./tempo.mjs";

// Ordem e rótulos do vocabulário de reações (spec/reacoes-vocabulario-implementacao.md).
// Sobe em intensidade: gostei → me tocou → é sobre mim → vou agir → mudou tudo.
export const REACOES = [
  { kind: "massa", emoji: "👏", label: "Que massa", labelRelatorio: "Satisfação" },
  { kind: "amei", emoji: "♥", label: "Amei", labelRelatorio: "Afeto" },
  { kind: "identifico", emoji: "🙋", label: "Me identifico", labelRelatorio: "Relevância" },
  { kind: "usar", emoji: "✅", label: "Vou usar", labelRelatorio: "Intenção de aplicação" },
  { kind: "explodiu", emoji: "🤯", label: "Explodiu a mente", labelRelatorio: "Aprendizagem" },
];

const primeiroNome = (nome) => (nome ?? "").trim().split(/\s+/)[0] ?? "";

/**
 * Frequência de palavras de uma enquete — a mesma contagem que rodou no telão
 * durante o evento (portada de app/src/lib/polls.ts, `wordFrequencies`).
 *
 * A regra que importa: uma palavra conta no máximo UMA vez por resposta. Duas
 * pessoas dizendo "evasão" sobem a palavra; uma pessoa que escreveu "evasão,
 * evasão e evasão" não infla a nuvem sozinha.
 */
export function frequenciaDePalavras(textos, stopwordsBrutas) {
  const bruto = Array.isArray(stopwordsBrutas)
    ? stopwordsBrutas.join(",")
    : typeof stopwordsBrutas === "string"
      ? stopwordsBrutas
      : "";
  let lista = bruto;
  if (bruto.trim().startsWith("[")) {
    try {
      lista = JSON.parse(bruto).join(",");
    } catch {
      lista = bruto;
    }
  }
  const ignorar = new Set(
    lista
      .toLocaleLowerCase("pt-BR")
      .split(/[\s,;]+/u)
      .map((p) => p.trim())
      .filter(Boolean)
  );

  const contagem = new Map();
  for (const texto of textos) {
    const palavras = new Set(
      String(texto)
        .normalize("NFC")
        .toLocaleLowerCase("pt-BR")
        .replace(/[^\p{L}\p{N}\s-]/gu, " ")
        .split(/[\s-]+/u)
        .filter((p) => p.length > 1 && !ignorar.has(p))
    );
    for (const p of palavras) contagem.set(p, (contagem.get(p) ?? 0) + 1);
  }

  return [...contagem]
    .map(([palavra, n]) => ({ palavra, n }))
    .sort((a, b) => b.n - a.n || a.palavra.localeCompare(b.palavra, "pt-BR"))
    .slice(0, 60);
}

/**
 * Títulos vindos do Even3 são longos e repetem o tema do evento inteiro:
 *   Palestra "Tecnologia, Transformação e EaD: 20 anos..." - Dr. Felipe Tessarolo
 * Vira { titulo: 'Tecnologia, Transformação e EaD: 20 anos...', prefixo: 'Palestra',
 *        pessoa: 'Dr. Felipe Tessarolo' } para o cartão respirar.
 */
export function destrincharTitulo(bruto) {
  const limpo = bruto.replace(/\s+/g, " ").trim();
  const comAspas = limpo.match(/^(.*?)["“](.+?)["”]\s*[-–—]?\s*(.*)$/);
  if (comAspas) {
    const [, antes, dentro, depois] = comAspas;
    return {
      titulo: dentro.trim(),
      prefixo: antes.replace(/[:\-–—\s]+$/, "").trim() || null,
      pessoa: depois.replace(/^[\s\-–—()]+|[()]+$/g, "").trim() || null,
    };
  }
  const comTraco = limpo.match(/^(.+?)\s+[-–—]\s+((?:Dr|Dra|Prof)[a-zç.]*\s+.+)$/i);
  if (comTraco) return { titulo: comTraco[1].trim(), prefixo: null, pessoa: comTraco[2].trim() };
  return { titulo: limpo, prefixo: null, pessoa: null };
}

export function abrirBanco(caminho) {
  return new DatabaseSync(caminho, { readOnly: true });
}

export function lerEvento(db, { ajustesPalestrantes = {} } = {}) {
  const linhas = (sql, ...args) => db.prepare(sql).all(...args);
  const unico = (sql, ...args) => db.prepare(sql).get(...args);

  // --- palestrantes -------------------------------------------------------
  // A ficha do Even3 vem como foi preenchida na inscrição; as correções
  // conferidas depois entram por dados/palestrantes-ajustes.json.
  const speakers = new Map(
    linhas(`select id, nome, titulo, instituicao, bio from speakers`).map((s) => {
      const ajuste = ajustesPalestrantes[s.id] ?? {};
      const { _nota, ...campos } = ajuste;
      return [s.id, { ...s, ...campos }];
    })
  );
  const porSessao = new Map();
  for (const v of linhas(`select session_id, speaker_id from session_speakers`)) {
    const s = speakers.get(v.speaker_id);
    if (!s) continue;
    if (!porSessao.has(v.session_id)) porSessao.set(v.session_id, []);
    porSessao.get(v.session_id).push({
      nome: s.nome,
      titulo: s.titulo,
      instituicao: s.instituicao,
      bio: s.bio,
    });
  }

  // --- reações por minuto e por tipo --------------------------------------
  // Guardamos a série por minuto: é ela que vira a faixa de calor do cartão e
  // o minimapa do evento inteiro.
  const reacoes = new Map(); // sessionId -> Map(minutoLocal -> {kind: n})
  const totaisPorTipo = new Map();
  for (const r of linhas(
    `select session_id, ts, json_extract(payload,'$.reaction') kind
     from timeline_events where tipo='reaction' order by ts`
  )) {
    const minuto = isoParaMinutoLocal(r.ts);
    if (!reacoes.has(r.session_id)) reacoes.set(r.session_id, new Map());
    const serie = reacoes.get(r.session_id);
    if (!serie.has(minuto)) serie.set(minuto, {});
    const balde = serie.get(minuto);
    balde[r.kind] = (balde[r.kind] ?? 0) + 1;
    totaisPorTipo.set(r.kind, (totaisPorTipo.get(r.kind) ?? 0) + 1);
  }

  // --- perguntas do público (com votos) -----------------------------------
  // A chave do voto no payload é 'questionId' (camelCase), não 'question_id'.
  const perguntas = new Map(); // sessionId -> [...]
  for (const q of linhas(
    `select e.id, e.session_id, e.ts,
            json_extract(e.payload,'$.texto')  texto,
            json_extract(e.payload,'$.autor')  autor,
            json_extract(e.payload,'$.hidden') hidden,
            (select count(*) from timeline_events v
              where v.tipo='question_vote'
                and json_extract(v.payload,'$.questionId') = e.id) votos
     from timeline_events e
     where e.tipo='question' order by e.ts`
  )) {
    if (q.hidden) continue; // moderada fora do telão: fica fora da retrospectiva também
    if (!perguntas.has(q.session_id)) perguntas.set(q.session_id, []);
    perguntas.get(q.session_id).push({
      hora: hhmm(isoParaMinutoLocal(q.ts)),
      texto: q.texto,
      autor: primeiroNome(q.autor),
      votos: q.votos,
    });
  }

  // --- enquetes (nuvem de palavras) ---------------------------------------
  const respostas = linhas(
    `select json_extract(payload,'$.pollId') pollId,
            json_extract(payload,'$.texto')  texto,
            json_extract(payload,'$.status') status
     from timeline_events where tipo='poll_response'`
  );
  const enquetes = new Map(); // sessionId -> [...]
  for (const p of linhas(
    `select id, session_id, ts,
            json_extract(payload,'$.question')  pergunta,
            json_extract(payload,'$.stopwords') stopwords
     from timeline_events where tipo='poll' order by ts`
  )) {
    // Agrupa por forma normalizada, mas exibe a grafia mais frequente
    // ("Acessibilidade" e "acessibilidade" são a mesma palavra do público).
    const contagem = new Map();
    for (const r of respostas) {
      if (r.pollId !== p.id || r.status !== "approved") continue;
      const chave = r.texto.trim().toLowerCase().replace(/\s+/g, " ");
      if (!chave) continue;
      if (!contagem.has(chave)) contagem.set(chave, { grafias: new Map(), n: 0 });
      const item = contagem.get(chave);
      item.n += 1;
      const g = r.texto.trim().replace(/\s+/g, " ");
      item.grafias.set(g, (item.grafias.get(g) ?? 0) + 1);
    }
    const respostasInteiras = [...contagem.values()]
      .map(({ grafias, n }) => ({
        palavra: [...grafias.entries()].sort((a, b) => b[1] - a[1])[0][0],
        n,
      }))
      .sort((a, b) => b.n - a.n || a.palavra.localeCompare(b.palavra, "pt-BR"));

    const textos = respostas.filter((r) => r.pollId === p.id && r.status === "approved").map((r) => r.texto);

    if (!enquetes.has(p.session_id)) enquetes.set(p.session_id, []);
    enquetes.get(p.session_id).push({
      hora: hhmm(isoParaMinutoLocal(p.ts)),
      pergunta: p.pergunta,
      // Duas leituras da mesma enquete: a nuvem conta PALAVRAS (é o que o
      // público viu no telão), a lista conta RESPOSTAS inteiras ("acesso ao
      // conhecimento" é uma resposta só). A nuvem manda na tela; a lista
      // continua ali para quem quiser conferir o número.
      nuvem: frequenciaDePalavras(textos, p.stopwords),
      respostas: respostasInteiras,
      totalRespostas: respostasInteiras.reduce((s, w) => s + w.n, 0),
    });
  }

  // --- sessões ------------------------------------------------------------
  const sessoes = linhas(
    `select id, titulo, descricao, sala, eixo, palestrante, inicio, fim from sessions order by inicio`
  ).map((s) => {
    const serie = [...(reacoes.get(s.id) ?? new Map()).entries()]
      .map(([minuto, porTipo]) => ({
        minuto,
        porTipo,
        n: Object.values(porTipo).reduce((a, b) => a + b, 0),
      }))
      .sort((a, b) => a.minuto.localeCompare(b.minuto));
    return {
      id: s.id,
      ...destrincharTitulo(s.titulo),
      tituloOriginal: s.titulo,
      descricao: s.descricao,
      sala: s.sala,
      eixo: s.eixo,
      palestranteTexto: s.palestrante,
      palestrantes: porSessao.get(s.id) ?? [],
      inicio: isoParaMinutoLocal(s.inicio),
      fim: s.fim ? isoParaMinutoLocal(s.fim) : null,
      serie,
      totalReacoes: serie.reduce((a, m) => a + m.n, 0),
      perguntas: perguntas.get(s.id) ?? [],
      enquetes: enquetes.get(s.id) ?? [],
    };
  });

  // --- números do evento ---------------------------------------------------
  // Conexões geram dois registros por par (um de cada lado): 170/2 = 85 pares.
  const conexoesEventos = unico(
    `select count(*) n from timeline_events where tipo='connection'`
  ).n;

  const totais = {
    inscritosConfirmados: unico(`select count(*) n from attendees where confirmado=1`).n,
    inscritosTotal: unico(`select count(*) n from attendees`).n,
    entraramComInscricao: unico(`select count(*) n from identities`).n,
    dispositivos: unico(
      `select count(distinct client_id) n from timeline_events where client_id is not null`
    ).n,
    reacoes: [...totaisPorTipo.values()].reduce((a, b) => a + b, 0),
    perguntas: [...perguntas.values()].reduce((a, l) => a + l.length, 0),
    votosEmPerguntas: unico(`select count(*) n from timeline_events where tipo='question_vote'`).n,
    respostasEnquete: unico(`select count(*) n from timeline_events where tipo='poll_response'`).n,
    conexoes: Math.floor(conexoesEventos / 2),
    perfisPreenchidos: unico(`select count(*) n from attendee_profile`).n,
    minutosComReacao: new Set(sessoes.flatMap((s) => s.serie.map((m) => m.minuto))).size,
  };

  const reacoesPorTipo = REACOES.map((r) => ({ ...r, n: totaisPorTipo.get(r.kind) ?? 0 }));

  return { sessoes, totais, reacoesPorTipo };
}
