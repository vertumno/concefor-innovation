// Cruzamento pico de reações × fala no palco.
//
// A ideia da retrospectiva inteira mora aqui: quando 82 pessoas reagem no mesmo
// minuto, alguma coisa foi dita. Recuperar essa frase é o que transforma um
// gráfico em memória.
//
// POR QUE UM ÍNDICE GLOBAL, E NÃO ARQUIVO→SESSÃO
// Os arquivos de gravação seguem o roteiro planejado; a programação real
// derrapou. O arquivo "03-palestra-vanessa-battestin" começa às 19:00 e contém
// o fim da Abertura, porque a palestra só começou 19:35. Casar arquivo com
// sessão erraria a atribuição. Como toda linha traz data e hora absolutas,
// indexamos tudo por minuto e perguntamos "o que se dizia às 20:39?" —
// a mesma pergunta que a linha do tempo faz.
//
// O TEXTO É CRU E NÃO PODE IR AO AR SEM LEITURA HUMANA
// O Whisper transcreve o microfone aberto (conversa de bastidor, passagem de
// som, achados e perdidos com nome de pessoa) e alucina em trechos de silêncio
// — no dia 19 ele inventou um "acesse www.opusdei.pt". Por isso este módulo
// produz CANDIDATAS, que ficam fora do git, e a página só usa o que passou
// pela curadoria em curadoria/citacoes.json.

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { relogioParaMinutoLocal, somarMinutos, hhmm } from "./tempo.mjs";

const LINHA = /^\[(\d{2})\/(\d{2}) (\d{2}):(\d{2}):(\d{2})\]\s*(.+)$/;

// Alucinação clássica de modelo de transcrição em trecho sem fala: ele preenche
// o silêncio com bordão de vídeo do YouTube. Nenhuma dessas frases foi dita no
// palco do Concefor.
const ALUCINACAO = [
  /\bwww\.|https?:\/\//i,
  /\.(com|com\.br|pt|net|org)\b/i,
  /acompanhe-?nos\b/i,
  /\b(se )?inscrev[ae](-se)?\b.*\bcanal\b/i,
  /\binscreva-se\b/i,
  /ative o sininho/i,
  /legendas? (pela|feitas)/i,
  /amara\.org/i,
  /obrigad[oa] por (assistir|ver)/i,
  /\bcurta (e|o) (compartilhe|v[ií]deo)/i,
  /^m[úu]sica[.!]?$/i,
  /^(aplausos|risos)[.!]?$/i,
];

// Fora do palco: recado de produção, achado e perdido, teste de som. Pode
// carregar dado pessoal de quem nem sabia que o microfone estava ligado.
const BASTIDOR = [
  /achados? e perdidos?/i,
  /utilidade p[úu]blica/i,
  /\bcart[ãa]o d[ao]\b/i,
  /\bCPF\b/i,
  /al[ôo],? som/i,
  /\btem breu\b/i,
  /passagem de som/i,
  /\bmicrofone\b.*\btest/i,
];

// Sequência longa de dígitos: documento, cartão, telefone. Nunca numa citação.
const DIGITOS_DEMAIS = /\d[\d.\-\s]{7,}/;

const suspeita = (texto) =>
  ALUCINACAO.some((r) => r.test(texto)) ||
  BASTIDOR.some((r) => r.test(texto)) ||
  DIGITOS_DEMAIS.test(texto);

/**
 * Lê todos os *.completo.timestamped.txt de uma pasta e devolve um índice
 * minuto local → [{ hora, texto, arquivo }], com as linhas em ordem.
 */
export function indexarFala(pasta) {
  const porMinuto = new Map();
  let linhasLidas = 0;
  const arquivos = readdirSync(pasta).filter((f) => f.endsWith(".completo.timestamped.txt"));

  for (const arquivo of arquivos) {
    const conteudo = readFileSync(join(pasta, arquivo), "utf8");
    for (const linha of conteudo.split(/\r?\n/)) {
      const m = LINHA.exec(linha.trim());
      if (!m) continue;
      const [, dia, mes, hora, minuto, segundo, texto] = m;
      const chave = relogioParaMinutoLocal(+dia, +mes, +hora, +minuto);
      if (!porMinuto.has(chave)) porMinuto.set(chave, []);
      porMinuto.get(chave).push({
        hora: `${hora}:${minuto}:${segundo}`,
        texto: texto.trim(),
        arquivo,
      });
      linhasLidas += 1;
    }
  }

  const minutos = [...porMinuto.keys()].sort();
  return {
    porMinuto,
    linhasLidas,
    arquivos,
    cobertura: minutos.length ? { de: minutos[0], ate: minutos.at(-1) } : null,
    cobre: (minuto) => porMinuto.has(minuto),
  };
}

/**
 * Encontra os picos de uma sessão: minutos cujo volume de reações se destaca.
 * Exige um mínimo absoluto (`minimo`) para não chamar de "pico" 3 reações numa
 * sessão morna, e devolve no máximo `quantos`, afastados entre si por
 * `distancia` minutos — picos colados são o mesmo momento contado duas vezes.
 */
export function acharPicos(serie, { quantos = 3, minimo = 10, distancia = 3 } = {}) {
  const escolhidos = [];
  for (const m of [...serie].sort((a, b) => b.n - a.n || a.minuto.localeCompare(b.minuto))) {
    if (m.n < minimo) break;
    if (escolhidos.some((e) => Math.abs(diferencaEmMinutos(e.minuto, m.minuto)) < distancia)) continue;
    escolhidos.push(m);
    if (escolhidos.length === quantos) break;
  }
  return escolhidos.sort((a, b) => a.minuto.localeCompare(b.minuto));
}

function diferencaEmMinutos(a, b) {
  return (new Date(`${a}:00Z`) - new Date(`${b}:00Z`)) / 60_000;
}

/**
 * Trecho de fala em volta de um pico.
 *
 * A janela pende para TRÁS de propósito: a reação vem depois do estímulo —
 * a pessoa ouve, se emociona, pega o telefone e toca no botão. A frase que
 * provocou o pico das 20:39 foi dita entre 20:37 e 20:39.
 */
export function trechoDoPico(indice, minuto, { antes = 2, depois = 1 } = {}) {
  const linhas = [];
  for (let d = -antes; d <= depois; d += 1) {
    const chave = somarMinutos(minuto, d);
    for (const linha of indice.porMinuto.get(chave) ?? []) {
      linhas.push({ ...linha, distancia: d, suspeita: suspeita(linha.texto) });
    }
  }
  return linhas;
}

/**
 * Junta as linhas de um trecho num parágrafo legível, descartando o que for
 * bastidor/alucinação. Devolve null se não sobrar nada aproveitável.
 */
export function costurarTrecho(linhas, { maxCaracteres = 320 } = {}) {
  const limpas = linhas.filter((l) => !l.suspeita);
  if (!limpas.length) return null;
  let texto = "";
  for (const l of limpas) {
    const proximo = texto ? `${texto} ${l.texto}` : l.texto;
    if (proximo.length > maxCaracteres) break;
    texto = proximo;
  }
  return texto || limpas[0].texto.slice(0, maxCaracteres);
}

/**
 * Monta as candidatas a citação de todas as sessões — insumo da curadoria
 * humana, nunca da página final.
 */
export function levantarCandidatas(sessoes, indice) {
  const candidatas = [];
  for (const sessao of sessoes) {
    for (const pico of acharPicos(sessao.serie)) {
      const linhas = trechoDoPico(indice, pico.minuto);
      candidatas.push({
        id: `${sessao.id}@${hhmm(pico.minuto)}`,
        sessaoId: sessao.id,
        sessao: sessao.titulo,
        minuto: pico.minuto,
        hora: hhmm(pico.minuto),
        reacoes: pico.n,
        porTipo: pico.porTipo,
        temFala: linhas.length > 0,
        sugestao: costurarTrecho(linhas),
        linhas,
      });
    }
  }
  return candidatas.sort((a, b) => b.reacoes - a.reacoes);
}
