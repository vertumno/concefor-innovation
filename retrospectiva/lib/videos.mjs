// Gravações do YouTube → o segundo exato de cada sessão e de cada pico.
//
// O canal transmitiu sete lives, e elas não seguem a divisão da programação: a
// noite de abertura inteira — Momento Musical, Abertura, palestra da Vanessa,
// Lançamentos e o começo da Celebração — está num vídeo só, de 2h36. Linkar o
// vídeo cru obrigaria quem lê a caçar o trecho.
//
// DUAS PERGUNTAS DIFERENTES, DUAS FONTES DIFERENTES
//
//   "De quem é este vídeo?"  → a lista `sessoes` de dados/videos.json, escrita
//                              à mão. NUNCA o horário.
//   "Em que ponto dele?"     → o horário, subtraído da hora real em que a live
//                              começou (`release_timestamp`).
//
// Deduzir a primeira do horário parece funcionar e não funciona: o congresso
// tinha sessões simultâneas em salas diferentes, e a Mostra de Produtos, que
// rodava no Auditório do 4º piso, acabou recebendo o vídeo da mesa-redonda que
// acontecia no Pátio no mesmo intervalo. Só quem organizou o evento sabe quem
// estava sendo filmado; o relógio não sabe.

const SEGUNDO = 1000;

// Diferença a partir da qual a gravação deixa de cobrir o começo da sessão.
// Abaixo disso é só o atraso normal entre apertar "transmitir" e o evento
// começar — dizer "gravação do bloco" por 16 segundos confundiria à toa.
const TOLERANCIA_MIN = 5;

// A reação vem depois do estímulo, e quem clica no link quer ouvir a frase que
// a provocou: o vídeo abre alguns segundos antes do minuto marcado.
const RECUO_SEGUNDOS = 20;

/** "2026-08-17T18:15" (minuto local) → Date. */
const doMinuto = (minutoLocal) => new Date(`${minutoLocal}:00-03:00`);

/**
 * Prepara os vídeos, indexando as sessões que cada um cobre.
 * `ajusteSegundos` (opcional, por vídeo) desloca todos os links daquela
 * gravação — serve para corrigir descompasso entre o relógio da transmissão e
 * o da gravação local, quando alguém conferir e descobrir o desvio.
 */
export function prepararVideos(dados) {
  return (dados?.videos ?? []).map((v) => {
    const inicio = new Date(v.inicio);
    return {
      id: v.id,
      titulo: v.titulo,
      nota: v.nota ?? null,
      duracaoSegundos: v.duracaoSegundos,
      sessoes: new Set(v.sessoes ?? []),
      ajusteSegundos: v.ajusteSegundos ?? 0,
      inicio,
      fim: new Date(inicio.getTime() + v.duracaoSegundos * SEGUNDO),
    };
  });
}

// O `t` vai SEMPRE, inclusive quando é zero. Sem parâmetro de tempo o YouTube
// retoma de onde aquela pessoa parou da última vez — e quem tivesse aberto o
// vídeo antes num ponto adiantado voltava lá, não ao começo da sessão. Com o
// parâmetro explícito, o link manda.
const url = (id, segundos) =>
  `https://www.youtube.com/watch?v=${id}&t=${Math.max(0, Math.floor(segundos))}s`;

/** O vídeo declarado para uma sessão, ou null. */
export function videoDaSessao(videos, sessaoId) {
  return videos.find((v) => v.sessoes.has(sessaoId)) ?? null;
}

/**
 * Link para um instante dentro da gravação daquela sessão.
 *
 * Devolve `aproximado: true` quando o instante pedido é anterior ao começo da
 * transmissão — aconteceu com a palestra do Tessarolo, que abriu 14h45 e só
 * passou a ser transmitida 15h10. Nesse caso o link vai para o início do vídeo,
 * porque é o mais cedo que a gravação chega: prometer um trecho que não existe
 * seria pior do que dizer que ele não existe.
 */
export function pontoNoVideo(videos, sessaoId, minutoLocal) {
  const v = videoDaSessao(videos, sessaoId);
  if (!v || !minutoLocal) return null;

  const t = doMinuto(minutoLocal);
  const atrasoMin = (v.inicio - t) / 60_000;
  const aproximado = atrasoMin > TOLERANCIA_MIN;
  const bruto = (t - v.inicio) / SEGUNDO + v.ajusteSegundos - RECUO_SEGUNDOS;
  const offset = aproximado ? 0 : Math.max(0, Math.round(bruto));

  return {
    id: v.id,
    titulo: v.titulo,
    nota: v.nota,
    offset,
    url: url(v.id, offset),
    aproximado,
    duracao: duracaoLegivel(v.duracaoSegundos),
  };
}

/** Duração legível: 9385 → "2h36". */
export function duracaoLegivel(segundos) {
  const h = Math.floor(segundos / 3600);
  const m = Math.round((segundos % 3600) / 60);
  return h ? `${h}h${String(m).padStart(2, "0")}` : `${m} min`;
}
