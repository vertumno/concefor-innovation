// Tempo do VIII Concefor — tudo vira "minuto local de Vitória" (UTC-3).
//
// São três relógios diferentes na origem dos dados, e essa é a maior fonte de
// erro do cruzamento:
//   sessions.inicio      ISO com offset explícito  "2026-08-17T19:35:00-03:00"
//   timeline_events.ts   ISO em UTC                "2026-08-17T22:23:41.099Z"
//   transcrições          hora de relógio, sem data completa  "[17/08 19:23:41]"
// Um pico às 22:23 em UTC é a fala das 19:23 na transcrição. Sem normalizar,
// o cruzamento erra por 3 horas e ninguém percebe — os dois números existem.

export const OFFSET_MIN = -180; // -03:00, fixo: o evento inteiro foi em Vitória-ES.
export const ANO = 2026;

/** Instante (Date) → "AAAA-MM-DDTHH:MM" no relógio local do evento. */
export function paraMinutoLocal(instante) {
  const deslocado = new Date(instante.getTime() + OFFSET_MIN * 60_000);
  return deslocado.toISOString().slice(0, 16);
}

/** Qualquer carimbo ISO do banco (UTC ou com offset) → minuto local. */
export function isoParaMinutoLocal(iso) {
  return paraMinutoLocal(new Date(iso));
}

/** "[17/08 19:23:41]" → minuto local "2026-08-17T19:23" (a transcrição já é hora local). */
export function relogioParaMinutoLocal(dia, mes, hora, minuto) {
  const p = (n) => String(n).padStart(2, "0");
  return `${ANO}-${p(mes)}-${p(dia)}T${p(hora)}:${p(minuto)}`;
}

/** "2026-08-17T19:35" → "19:35" */
export const hhmm = (minutoLocal) => minutoLocal.slice(11, 16);

/** "2026-08-17T19:35" → "2026-08-17" */
export const dia = (minutoLocal) => minutoLocal.slice(0, 10);

/** Minuto local → número de minutos desde a meia-noite daquele dia. */
export function minutosDoDia(minutoLocal) {
  return Number(minutoLocal.slice(11, 13)) * 60 + Number(minutoLocal.slice(14, 16));
}

/** Soma minutos a um minuto local, atravessando a virada da hora. */
export function somarMinutos(minutoLocal, delta) {
  const base = new Date(`${minutoLocal}:00Z`);
  return new Date(base.getTime() + delta * 60_000).toISOString().slice(0, 16);
}

const DIAS_SEMANA = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

/** "2026-08-17" → { diaSemana: "segunda-feira", extenso: "17 de agosto", numero: "17" } */
export function rotularDia(dataISO) {
  const d = new Date(`${dataISO}T12:00:00Z`);
  return {
    diaSemana: DIAS_SEMANA[d.getUTCDay()],
    extenso: `${d.getUTCDate()} de ${MESES[d.getUTCMonth()]}`,
    numero: String(d.getUTCDate()),
  };
}
