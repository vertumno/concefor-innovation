// Lado Node do instrumentation (30/07): sync automático do Even3.
// Este arquivo só é importado no runtime nodejs (ver instrumentation.ts) —
// por isso pode puxar o script com better-sqlite3 (nativo) sem quebrar o
// compile edge do webpack.
import { runSync } from "../scripts/sync-even3.mjs";

// Desligado por padrão (decisão de 30/07: o re-sync do /admin cobre a
// necessidade); ligar definindo SYNC_INTERVAL_MIN (minutos) no .env.local.
const min = Number(process.env.SYNC_INTERVAL_MIN ?? "0");
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
  console.log("[sync-even3] sync automático desligado (defina SYNC_INTERVAL_MIN para ligar)");
} else if (!process.env.EVEN3_API_TOKEN) {
  console.log("[sync-even3] sem EVEN3_API_TOKEN — sync automático desligado");
} else {
  setInterval(tick, min * 60_000);
  void tick(); // primeira rodada já no boot: servidor sobe com dados frescos
  console.log(`[sync-even3] sync automático ligado (a cada ${min} min)`);
}

export {};
