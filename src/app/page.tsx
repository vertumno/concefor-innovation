"use client";

// Início — a CASA do evento (redesenho de 20/07: Início, Agenda e Ao Vivo
// estavam repetidos). Aqui: saudação, avisos da organização, "não perca",
// o que está no ar (atalho pro Ao Vivo) e só um gostinho do que vem — a
// programação completa mora na Agenda.

import { useEffect, useState } from "react";
import Link from "next/link";
import { SessionCard } from "@/components/SessionCard";
import { getFavorites, toggleFavorite } from "@/lib/favorites";
import { fetchSessions, splitNowNext, proximaFavorita, formatHora } from "@/lib/sessions";
import { useEventClock } from "@/lib/clock";
import { getClientId } from "@/lib/clientId";
import type { Session } from "@/lib/types";
import type { Aviso } from "@/lib/db";

export default function Home() {
  const [sessions, setSessions] = useState<Session[] | null>(null);
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set());
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [nome, setNome] = useState<string | null>(null);
  const now = useEventClock(1000);

  useEffect(() => {
    fetchSessions().then(setSessions);
    setFavoritos(getFavorites());
    fetch("/api/avisos")
      .then((r) => r.json())
      .then(setAvisos)
      .catch(() => {});
    fetch(`/api/me?clientId=${encodeURIComponent(getClientId())}`)
      .then((r) => r.json())
      .then((me: { logado: boolean; nome?: string }) => setNome(me.logado ? (me.nome ?? null) : null))
      .catch(() => {});
  }, []);

  function onToggle(id: string) {
    setFavoritos(new Set(toggleFavorite(id)));
  }

  if (sessions === null) {
    return <p className="page-sub">Carregando…</p>;
  }

  const { agora, aSeguir } = splitNowNext(sessions, now);
  const naoPerca = proximaFavorita(sessions, favoritos, 90, now);
  const proximas = aSeguir.slice(0, 3);

  return (
    <>
      <h1 className="page-title">{nome ? `Olá, ${nome}!` : "Agora no Concefor"}</h1>
      <p className="page-sub">
        {nome ? "Que bom ter você na linha do tempo do evento." : "A linha do tempo do evento, ao vivo."}
      </p>

      {avisos.length > 0 && (
        <>
          <div className="section-label">Avisos da organização</div>
          <ul className="avisos">
            {avisos.map((a) => (
              <li key={a.id} className="aviso">
                {a.texto}
              </li>
            ))}
          </ul>
        </>
      )}

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
          Nenhuma sessão carregada ainda. Rode <code>npm run sync:even3</code> e{" "}
          <code>npm run dev</code>, ou <code>npm run dev:demo</code> para a demonstração.
        </div>
      )}

      {agora.length > 0 && (
        <>
          <div className="section-label">Acontecendo agora</div>
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
          <Link href="/ao-vivo" className="home-cta">
            Entrar no Ao Vivo e reagir →
          </Link>
        </>
      )}

      <div className="section-label">A seguir</div>
      {proximas.length > 0 ? (
        <ol className="timeline">
          {proximas.map((s, i) => (
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
        sessions.length > 0 && <div className="empty">Sem próximas sessões.</div>
      )}

      <p className="page-sub" style={{ marginTop: 18 }}>
        <Link href="/agenda">Ver a programação completa na Agenda →</Link>
      </p>
    </>
  );
}
