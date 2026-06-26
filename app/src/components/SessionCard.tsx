"use client";

import Link from "next/link";
import type { Session } from "@/lib/types";
import {
  sessionStatus,
  sessionProgress,
  minutesUntilStart,
  humanizeDelta,
} from "@/lib/sessions";
import { TimeStamp } from "./TimeStamp";

// Item da linha do tempo: nó temporal (à esquerda, na espinha) + conteúdo da sessão.
// `now` vem do relógio do evento (parent), pra status e contagem atualizarem juntos.
export function SessionCard({
  session,
  favorito,
  onToggleFavorito,
  now,
  index = 0,
}: {
  session: Session;
  favorito: boolean;
  onToggleFavorito: (id: string) => void;
  now: Date;
  index?: number;
}) {
  const status = sessionStatus(session, now);

  return (
    <li
      className="tl-item"
      data-status={status}
      style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
    >
      <TimeStamp inicio={session.inicio} fim={session.fim} status={status} variant="rail" />

      <div className="tl-body">
        <div className="card-meta">
          {status === "live" && (
            <span className="live-tag">
              <span className="live-dot" aria-hidden />
              AO VIVO
            </span>
          )}
          {session.sala && <span>{session.sala}</span>}
          {session.eixo && <span className="chip">{session.eixo}</span>}
          {status === "future" && (
            <span className="meta-when">{humanizeDelta(minutesUntilStart(session, now))}</span>
          )}
        </div>

        <h3 className="card-title">
          <Link href={`/sessao/${session.id}`}>{session.titulo}</Link>
        </h3>
        {session.palestrante && <p className="card-sub">{session.palestrante}</p>}

        {status === "live" && (
          <div
            className="tl-progress"
            role="progressbar"
            aria-valuenow={Math.round(sessionProgress(session, now) * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Tempo decorrido da sessão"
          >
            <span style={{ width: `${Math.round(sessionProgress(session, now) * 100)}%` }} />
          </div>
        )}
      </div>

      <button
        type="button"
        className={`star ${favorito ? "star-on" : ""}`}
        aria-pressed={favorito}
        aria-label={favorito ? "Remover dos favoritos" : "Adicionar à minha programação"}
        onClick={() => onToggleFavorito(session.id)}
      >
        {favorito ? "★" : "☆"}
      </button>
    </li>
  );
}
