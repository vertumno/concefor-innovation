// Lado Node do instrumentation (30/07): sync automático do Even3.
// Este arquivo só é importado no runtime nodejs (ver instrumentation.ts) —
// por isso pode puxar o script com better-sqlite3 (nativo) sem quebrar o
// compile edge do webpack.
import { runSync } from "../scripts/sync-even3.mjs";

// Ligado por padrão EM PRODUÇÃO a cada 10 min (decisão de 05/08). Era desligado
// desde 30/07 ("o re-sync do /admin cobre a necessidade"), mas em 04/08 o campo
// `confirmado` do Even3 virou controle de acesso: quem confirma no credenciamento
// só entra no app depois de um sync. Depender de alguém lembrar de apertar o
// botão no meio do evento é frágil demais para isso.
// Em dev fica desligado (não mexer no banco local sem pedir) e
// SYNC_INTERVAL_MIN sobrepõe os dois — `SYNC_INTERVAL_MIN=0` desliga.
//
// O teste é "não é development" e não "é production" de propósito: se o
// ambiente do container subir sem NODE_ENV, o certo é o sync LIGAR — ficar
// desligado em silêncio no evento é o que a decisão de 05/08 quer evitar.
const PADRAO_MIN = process.env.NODE_ENV === "development" ? 0 : 10;
const min = Number(process.env.SYNC_INTERVAL_MIN ?? PADRAO_MIN);
let rodando = false;

const tick = async () => {
  if (rodando) return; // nunca sobrepor duas execuções
  rodando = true;
  try {
    const r = await runSync({ token: process.env.EVEN3_API_TOKEN });
    console.log(
      `[sync-even3] auto: ${r.sincronizadas} sessões, ${r.inscritos} inscritos` +
        (r.removidasStale ? `, ${r.removidasStale} stale removidas` : ""),
    );
  } catch (err) {
    // Falha de rede/API não pode derrubar o app — só registra e tenta de novo.
    console.warn(`[sync-even3] auto falhou: ${(err as Error).message}`);
  } finally {
    rodando = false;
  }
};

if (!min || min < 0) {
  console.log(
    `[sync-even3] sync automático desligado (SYNC_INTERVAL_MIN=${process.env.SYNC_INTERVAL_MIN ?? "não definido"}; padrão fora de dev: ${PADRAO_MIN} min)`,
  );
} else if (!process.env.EVEN3_API_TOKEN) {
  console.log("[sync-even3] sem EVEN3_API_TOKEN — sync automático desligado");
} else {
  setInterval(tick, min * 60_000);
  void tick(); // primeira rodada já no boot: servidor sobe com dados frescos
  console.log(`[sync-even3] sync automático ligado (a cada ${min} min)`);
}

export {};
