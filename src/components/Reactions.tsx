"use client";

// Reações ao vivo da sessão (E2). Botões visíveis só enquanto a sessão está no ar
// (o pai decide via prop `live`). Cada toque: feedback tátil + emoji que "voa" +
// envio anônimo para /api/reactions. Contagem agregada, com polling leve (o tempo
// real de verdade — SSE + telão — chega na E3). Ver spec/proximos-passos.md.

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { getClientId } from "@/lib/clientId";
import { REACTIONS, emptyCounts, type ReactionCounts, type ReactionKind } from "@/lib/reactions";

let flyId = 0;
type Fly = { id: number; emoji: string; dx: number };

export function Reactions({ sessionId, live }: { sessionId: string; live: boolean }) {
  const [counts, setCounts] = useState<ReactionCounts>(emptyCounts);
  const [flies, setFlies] = useState<Fly[]>([]);
  const lastSentRef = useRef(0);

  const loadCounts = useCallback(async () => {
    try {
      const res = await fetch(`/api/reactions?sessionId=${encodeURIComponent(sessionId)}`);
      if (res.ok) setCounts((await res.json()).counts);
    } catch {
      /* offline/erro momentâneo: mantém a contagem atual */
    }
  }, [sessionId]);

  useEffect(() => {
    loadCounts();
    if (!live) return;
    const t = setInterval(loadCounts, 3000);
    return () => clearInterval(t);
  }, [loadCounts, live]);

  function fly(emoji: string) {
    const id = ++flyId;
    const dx = Math.round((Math.random() - 0.5) * 44);
    setFlies((f) => [...f, { id, emoji, dx }]);
    setTimeout(() => setFlies((f) => f.filter((x) => x.id !== id)), 900);
  }

  async function react(kind: ReactionKind, emoji: string) {
    fly(emoji); // feedback imediato em todo toque
    navigator.vibrate?.(12);

    // Debounce alinhado ao throttle do servidor (1/seg): toques extras viram
    // só animação, sem enviar — evita frustração e respeita o anti-flood.
    const now = Date.now();
    if (now - lastSentRef.current < 1000) return;
    lastSentRef.current = now;

    setCounts((c) => ({ ...c, [kind]: c[kind] + 1 })); // otimista
    try {
      const res = await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, reaction: kind, clientId: getClientId() }),
      });
      if (res.ok) setCounts((await res.json()).counts); // reconcilia com o servidor
    } catch {
      /* mantém o otimista; o próximo polling corrige */
    }
  }

  if (!live) {
    return (
      <div className="notice" style={{ marginTop: 18 }}>
        As reações abrem quando a sessão está <strong>no ar</strong>.
      </div>
    );
  }

  return (
    <div className="reactions">
      <div className="reactions-flies" aria-hidden>
        {flies.map((f) => (
          <span key={f.id} className="fly" style={{ "--dx": `${f.dx}px` } as CSSProperties}>
            {f.emoji}
          </span>
        ))}
      </div>
      <div className="reaction-btns">
        {REACTIONS.map((r) => (
          <button
            key={r.kind}
            type="button"
            className="reaction-btn"
            onClick={() => react(r.kind, r.emoji)}
            aria-label={r.label}
          >
            <span className="reaction-emoji" aria-hidden>
              {r.emoji}
            </span>
            <span className="reaction-n">{counts[r.kind] ?? 0}</span>
          </button>
        ))}
      </div>
      <p className="reactions-hint">Toque para reagir — vai aparecer no telão ao vivo.</p>
    </div>
  );
}
