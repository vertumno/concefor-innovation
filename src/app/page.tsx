"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SessionCard } from "@/components/SessionCard";
import { getFavorites, toggleFavorite } from "@/lib/favorites";
import { fetchSessions, splitNowNext, proximaFavorita, formatHora } from "@/lib/sessions";
import { useEventClock } from "@/lib/clock";
import type { Session } from "@/lib/types";

export default function Home() {
  const [sessions, setSessions] = useState<Session[] | null>(null);
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set());
  const now = useEventClock(1000);

  useEffect(() => {
    fetchSessions().then(setSessions);
    setFavoritos(getFavorites());
  }, []);

  function onToggle(id: string) {
    setFavoritos(new Set(toggleFavorite(id)));
  }

  if (sessions === null) {
    return <p className="page-sub">Carregando…</p>;
  }

  const { agora, aSeguir } = splitNowNext(sessions, now);
  const naoPerca = proximaFavorita(sessions, favoritos, 90, now);

  return (
    <>
      <h1 className="page-title">Agora no Concefor</h1>
      <p className="page-sub">A linha do tempo do evento, ao vivo.</p>

      {naoPerca && (
        <Link href={`/sessao/${naoPerca.id}`} className="banner">
          Não perca: {naoPerca.titulo}
          <small>
            Sua sessão favoritada começa às {formatHora(naoPerca.inicio)}
            {naoPerca.sala ? ` · ${naoPerca.sala}` : ""}
          </small>
        </Link>
      )}

      {sessions.length === 0 && (
        <div className="empty">
          Nenhuma sessão carregada ainda. Rode <code>npm run seed</code> e <code>npm run dev</code>{" "}
          para a programação real, ou <code>npm run dev:demo</code> para a de demonstração.
        </div>
      )}

      <div className="section-label">Acontecendo agora</div>
      {agora.length > 0 ? (
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
      ) : (
        <div className="empty">Nenhuma sessão em andamento neste instante.</div>
      )}

      <div className="section-label">A seguir</div>
      {aSeguir.length > 0 ? (
        <ol className="timeline">
          {aSeguir.map((s, i) => (
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
      ) : (
        <div className="empty">Sem próximas sessões.</div>
      )}

      <p className="page-sub" style={{ marginTop: 24 }}>
        <Link href="/agenda">Ver a programação completa →</Link>
      </p>
    </>
  );
}
