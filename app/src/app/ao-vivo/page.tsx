"use client";

// Ao Vivo — o slot central da barra (spec §4.0):
//   • 1 sessão no ar  → cai direto nela (tela de sessão com reações)
//   • várias no ar    → seletor simples por sala (a decisão do §8, sem teorizar)
//   • nenhuma no ar   → próxima sessão com contagem regressiva

import { useEffect, useState } from "react";
import { SessionCard } from "@/components/SessionCard";
import { SessionView } from "@/components/SessionView";
import { getFavorites, toggleFavorite } from "@/lib/favorites";
import { fetchSessions, splitNowNext, formatDiaCurto, formatHoraH } from "@/lib/sessions";
import { useEventClock } from "@/lib/clock";
import type { Session } from "@/lib/types";

// "1d 02:14:36" / "02:14:36" — contagem regressiva até a próxima sessão.
function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const hms = [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
  return d > 0 ? `${d}d ${hms}` : hms;
}

export default function AoVivoPage() {
  const [sessions, setSessions] = useState<Session[] | null>(null);
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set());
  const now = useEventClock(1000);

  useEffect(() => {
    fetchSessions().then(setSessions);
    setFavoritos(getFavorites());
  }, []);

  if (sessions === null) return <p className="page-sub">Carregando…</p>;

  const { agora, aSeguir } = splitNowNext(sessions, now);

  // Uma sessão no ar: o botão da barra é um atalho direto pra tela de reagir.
  if (agora.length === 1) {
    return <SessionView id={agora[0].id} showBack={false} />;
  }

  function onToggle(id: string) {
    setFavoritos(new Set(toggleFavorite(id)));
  }

  // Sessões simultâneas: seletor simples pela sala.
  if (agora.length > 1) {
    return (
      <>
        <h1 className="page-title">Ao vivo agora</h1>
        <p className="page-sub">Mais de uma sessão acontecendo — escolha a sua sala.</p>
        <ol className="timeline">
          {agora.map((s, i) => (
            <SessionCard
              key={s.id}
              session={s}
              now={now}
              index={i}
              favorito={favoritos.has(s.id)}
              onToggleFavorito={onToggle}
            />
          ))}
        </ol>
      </>
    );
  }

  // Nada no ar: contagem regressiva pra próxima sessão.
  const proxima = aSeguir[0];
  if (!proxima) {
    return (
      <>
        <h1 className="page-title">Ao vivo</h1>
        <div className="empty">Nenhuma sessão no ar e nada mais na programação. Até a próxima!</div>
      </>
    );
  }

  const falta = new Date(proxima.inicio).getTime() - now.getTime();
  return (
    <>
      <h1 className="page-title">Nada no ar agora</h1>
      <p className="page-sub">A próxima sessão começa em</p>
      <p className="countdown" aria-live="off">
        {formatCountdown(falta)}
      </p>
      <p className="countdown-when">
        {formatDiaCurto(proxima.inicio)} · {formatHoraH(proxima.inicio)}
      </p>
      <div className="section-label">A seguir</div>
      <ol className="timeline">
        <SessionCard
          session={proxima}
          now={now}
          index={0}
          favorito={favoritos.has(proxima.id)}
          onToggleFavorito={onToggle}
        />
      </ol>
    </>
  );
}
