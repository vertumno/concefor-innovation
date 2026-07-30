// Sync automático do Even3 embutido no serviço (30/07): o servidor puxa
// programação + inscritos sozinho a cada SYNC_INTERVAL_MIN minutos (default 10;
// 0 desliga). Inscrição nova passa a aparecer no app sem ninguém clicar em
// nada — o botão do /admin continua existindo para forçar na hora.
// Hook padrão do Next: register() roda uma vez quando o servidor sobe.

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const min = Number(process.env.SYNC_INTERVAL_MIN ?? "10");
  if (!min || min < 0) return; // desligado explicitamente
  if (!process.env.EVEN3_API_TOKEN) {
    console.log("[sync-even3] sem EVEN3_API_TOKEN — sync automático desligado");
    return;
  }

  const { runSync } = await import("../scripts/sync-even3.mjs");
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

  setInterval(tick, min * 60_000);
  void tick(); // primeira rodada já no boot: servidor sobe com dados frescos
  console.log(`[sync-even3] sync automático ligado (a cada ${min} min)`);
}
