"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SessionCard } from "@/components/SessionCard";
import { getFavorites, toggleFavorite } from "@/lib/favorites";
import {
  fetchSessions,
  splitNowNext,
  proximaFavorita,
  formatHora,
} from "@/lib/sessions";
import type { Session } from "@/lib/types";

export default function Home() {
  const [sessions, setSessions] = useState<Session[] | null>(null);
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set());

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

  const { agora, aSeguir } = splitNowNext(sessions);
  const naoPerca = proximaFavorita(sessions, favoritos);

  return (
    <>
      <h1 className="page-title">Agora no Concefor</h1>
      <p className="page-sub">O que está rolando e o que vem a seguir.</p>

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
          Nenhuma sessão carregada ainda. Configure o Supabase (<code>.env.local</code>) e
          rode <code>supabase/seed.sql</code> para ver a programação.
        </div>
      )}

      <div className="section-label">Agora</div>
      {agora.length > 0 ? (
        agora.map((s) => (
          <SessionCard
            key={s.id}
            session={s}
            favorito={favoritos.has(s.id)}
            onToggleFavorito={onToggle}
          />
        ))
      ) : (
        <div className="empty">Nenhuma sessão em andamento neste instante.</div>
      )}

      <div className="section-label">A seguir</div>
      {aSeguir.length > 0 ? (
        aSeguir.map((s) => (
          <SessionCard
            key={s.id}
            session={s}
            favorito={favoritos.has(s.id)}
            onToggleFavorito={onToggle}
          />
        ))
      ) : (
        <div className="empty">Sem próximas sessões.</div>
      )}

      <p className="page-sub" style={{ marginTop: 24 }}>
        <Link href="/timeline">Ver a programação completa →</Link>
      </p>
    </>
  );
}
