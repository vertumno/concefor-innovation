import { getDb, getReactionCounts, sessionExists } from "@/lib/db";

// Tempo real do telão (E3) via Server-Sent Events. O mais simples que funciona:
// poll interno no SQLite a ~1s, emitindo as reações novas desde a última vista.
// Latência telão < 2s (poll 1s + rede local). Ver spec/proximos-passos.md (E3).
export const runtime = "nodejs"; // better-sqlite3 é binário nativo
export const dynamic = "force-dynamic";

const POLL_MS = 1000;
const PING_MS = 15000; // heartbeat p/ manter a conexão viva através de proxies

export async function GET(req: Request, ctx: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await ctx.params;
  if (!sessionExists(sessionId)) {
    return new Response("sessão desconhecida", { status: 404 });
  }

  const enc = new TextEncoder();
  // Só reações que chegarem DEPOIS da conexão (o snapshot inicial vai no evento 'init').
  let lastTs = new Date().toISOString();
  const novas = getDb().prepare(
    `select ts, payload, client_id from timeline_events
      where tipo = 'reaction' and session_id = ? and ts > ?
      order by ts asc`,
  );

  const stream = new ReadableStream({
    start(controller) {
      let closed = false;
      const send = (event: string, data: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(enc.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch {
          closed = true;
        }
      };

      send("init", { counts: getReactionCounts(sessionId) });

      const poll = setInterval(() => {
        try {
          for (const r of novas.all(sessionId, lastTs) as {
            ts: string;
            payload: string;
            client_id: string | null;
          }[]) {
            lastTs = r.ts;
            const reaction = (JSON.parse(r.payload) as { reaction?: string }).reaction;
            send("reaction", { reaction, clientId: r.client_id, ts: r.ts });
          }
        } catch {
          /* erro momentâneo de leitura: tenta de novo no próximo tick */
        }
      }, POLL_MS);

      const ping = setInterval(() => {
        if (!closed) {
          try {
            controller.enqueue(enc.encode(`: ping\n\n`));
          } catch {
            closed = true;
          }
        }
      }, PING_MS);

      const close = () => {
        closed = true;
        clearInterval(poll);
        clearInterval(ping);
        try {
          controller.close();
        } catch {
          /* já fechado */
        }
      };
      req.signal.addEventListener("abort", close);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
