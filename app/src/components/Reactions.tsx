"use client";

// Reações ao vivo da sessão (E2 + E3). Botões visíveis só enquanto a sessão está
// no ar (o pai decide via prop `live`). Cada toque: feedback tátil + emoji que
// "voa" + envio anônimo para /api/reactions. A contagem é agregada e, no polling,
// as reações que chegam DE OUTRAS pessoas também fazem o emoji voar aqui — a mesma
// energia do telão, na palma da mão. O tempo real dedicado (SSE) mora no telão (E3).

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { getClientId } from "@/lib/clientId";
import {
  REACTIONS,
  emptyCounts,
  type ReactionCounts,
  type ReactionKind,
} from "@/lib/reactions";

const EMOJI = Object.fromEntries(REACTIONS.map((r) => [r.kind, r.emoji])) as Record<
  ReactionKind,
  string
>;

let flyId = 0;
type Fly = { id: number; emoji: string; dx: number; left: number; dur: number };

export function Reactions({ sessionId, live }: { sessionId: string; live: boolean }) {
  const [counts, setCounts] = useState<ReactionCounts>(emptyCounts);
  const [flies, setFlies] = useState<Fly[]>([]);
  const countsRef = useRef<ReactionCounts>(emptyCounts()); // espelho do que a tela mostra
  const lastSentRef = useRef(0);

  function fly(emoji: string, n = 1) {
    const novos: Fly[] = [];
    for (let i = 0; i < Math.min(n, 4); i++) {
      const id = ++flyId;
      const dur = 1.4 + Math.random() * 0.5;
      novos.push({
        id,
        emoji,
        dx: Math.round((Math.random() - 0.5) * 90), // deriva horizontal ao subir
        left: 8 + Math.random() * 78, // parte de um ponto aleatório da largura
        dur,
      });
      setTimeout(() => setFlies((f) => f.filter((x) => x.id !== id)), dur * 1000 + 120);
    }
    setFlies((f) => [...f, ...novos]);
  }

  // Aplica contagem do servidor; incrementos além do que já temos = reações de
  // OUTROS → voam também. A minha própria já está no espelho (não duplica).
  const applyServer = useCallback((server: ReactionCounts) => {
    for (const r of REACTIONS) {
      const delta = server[r.kind] - countsRef.current[r.kind];
      if (delta > 0) fly(r.emoji, delta);
    }
    countsRef.current = server;
    setCounts(server);
  }, []);

  const loadCounts = useCallback(async () => {
    try {
      const res = await fetch(`/api/reactions?sessionId=${encodeURIComponent(sessionId)}`);
      if (res.ok) applyServer((await res.json()).counts);
    } catch {
      /* offline/erro momentâneo: mantém a contagem atual */
    }
  }, [sessionId, applyServer]);

  useEffect(() => {
    loadCounts();
    if (!live) return;
    const t = setInterval(loadCounts, 3000);
    return () => clearInterval(t);
  }, [loadCounts, live]);

  async function react(kind: ReactionKind) {
    fly(EMOJI[kind]); // feedback imediato em todo toque
    navigator.vibrate?.(12);

    // Debounce alinhado ao throttle do servidor (1/seg): toques extras viram
    // só animação, sem enviar — evita frustração e respeita o anti-flood.
    const now = Date.now();
    if (now - lastSentRef.current < 1000) return;
    lastSentRef.current = now;

    // Otimista: mantém o espelho em sincronia para o polling não "revoar" a minha.
    countsRef.current = { ...countsRef.current, [kind]: countsRef.current[kind] + 1 };
    setCounts((c) => ({ ...c, [kind]: c[kind] + 1 }));
    const clientId = getClientId(); // fora do try: não mascarar erro na geração do id
    try {
      const res = await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, reaction: kind, clientId }),
      });
      if (res.ok) {
        // Reconcilia com o servidor sem revoar (o espelho já contém a minha).
        const server = (await res.json()).counts as ReactionCounts;
        countsRef.current = server;
        setCounts(server);
      }
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
          <span
            key={f.id}
            className="fly"
            style={
              { left: `${f.left}%`, animationDuration: `${f.dur}s`, "--dx": `${f.dx}px` } as CSSProperties
            }
          >
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
            onClick={() => react(r.kind)}
            aria-label={r.label}
          >
            <span className="reaction-emoji" aria-hidden>
              {r.emoji}
            </span>
            <span className="reaction-label">{r.label}</span>
            <span className="reaction-n">{counts[r.kind] ?? 0}</span>
          </button>
        ))}
      </div>
      <p className="reactions-hint">Toque para reagir — vai aparecer no telão ao vivo.</p>
    </div>
  );
}
