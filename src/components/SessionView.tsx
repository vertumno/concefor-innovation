"use client";

// Tela de uma sessão (timestamp-herói, palestrantes, progresso, reações).
// Extraída de /sessao/[id] para ser reutilizada pelo "Ao Vivo" (spec §4.0):
// lá ela é renderizada direto, sem link de voltar (a barra já é a navegação).

import { useEffect, useState } from "react";
import Link from "next/link";
import { getFavorites, toggleFavorite } from "@/lib/favorites";
import {
  fetchSessions,
  sessionStatus,
  sessionProgress,
  minutesUntilStart,
  humanizeDelta,
} from "@/lib/sessions";
import { useEventClock } from "@/lib/clock";
import { TimeStamp } from "@/components/TimeStamp";
import { Speakers } from "@/components/Speakers";
import { Reactions } from "@/components/Reactions";
import { Questions } from "@/components/Questions";
import type { Session } from "@/lib/types";

function faseLabel(pct: number): string {
  if (pct < 15) return "Começou agora";
  if (pct < 70) return "Em andamento";
  if (pct < 90) return "Na reta final";
  return "Terminando";
}

export function SessionView({ id, showBack = true }: { id: string; showBack?: boolean }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [favorito, setFavorito] = useState(false);
  const now = useEventClock(1000);

  useEffect(() => {
    fetchSessions().then((all) => setSession(all.find((s) => s.id === id) ?? null));
    setFavorito(getFavorites().has(id));
  }, [id]);

  if (session === undefined) return <p className="page-sub">Carregando…</p>;
  if (session === null) {
    return (
      <div className="empty">
        Sessão não encontrada. <Link href="/agenda">Voltar à agenda</Link>
      </div>
    );
  }

  const status = sessionStatus(session, now);
  const pct = Math.round(sessionProgress(session, now) * 100);
  const minFim = session.fim
    ? Math.round((new Date(session.fim).getTime() - now.getTime()) / 60000)
    : null;
  const speakers = session.speakers ?? [];

  return (
    <div className="sessao-enter">
      <div className="sessao-head">
        {showBack ? (
          <Link href="/agenda" className="back-link">
            ← Agenda
          </Link>
        ) : (
          <span />
        )}
        <button
          type="button"
          className={`fav-star ${favorito ? "on" : ""}`}
          aria-pressed={favorito}
          aria-label={favorito ? "Remover da minha programação" : "Adicionar à minha programação"}
          onClick={() => {
            toggleFavorite(id);
            setFavorito(getFavorites().has(id));
          }}
        >
          <span className="fav-star-icon" aria-hidden>
            {favorito ? "★" : "☆"}
          </span>
          <span className="fav-star-label">{favorito ? "salvo" : "salvar"}</span>
        </button>
      </div>

      <TimeStamp inicio={session.inicio} fim={session.fim} status={status} variant="hero" />

      <h1 className="page-title">{session.titulo}</h1>
      <div className="card-meta" style={{ marginBottom: 12 }}>
        {session.sala && <span>{session.sala}</span>}
        {session.eixo && <span className="chip">{session.eixo}</span>}
      </div>

      {speakers.length > 0 ? (
        <Speakers speakers={speakers} />
      ) : session.palestrante ? (
        <p className="card-sub" style={{ marginBottom: 14 }}>
          {session.palestrante}
        </p>
      ) : null}

      {status === "live" && (
        <div className="live-progress">
          <div
            className="tl-progress big"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Andamento da sessão"
          >
            <span style={{ width: `${pct}%` }} />
          </div>
          <span className="live-progress-label">
            {faseLabel(pct)}
            {minFim !== null && minFim > 0 ? ` · termina ${humanizeDelta(minFim)}` : ""}
          </span>
        </div>
      )}
      {status === "future" && (
        <p className="meta-when meta-when-big">
          Começa {humanizeDelta(minutesUntilStart(session, now))}
        </p>
      )}

      {session.descricao && <p className="sessao-desc">{session.descricao}</p>}

      {/* Reações ao vivo (feature 4.2 / E2): botões só quando a sessão está no ar. */}
      <Reactions sessionId={session.id} live={status === "live"} />

      {/* Perguntas com upvote (R4): aparece quando a janela está aberta no /admin
          (ou quando já existem perguntas públicas). */}
      <Questions sessionId={session.id} live={status === "live"} />
    </div>
  );
}
