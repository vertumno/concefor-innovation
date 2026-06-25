"use client";

import Link from "next/link";
import type { Session } from "@/lib/types";
import { formatHora } from "@/lib/sessions";

export function SessionCard({
  session,
  favorito,
  onToggleFavorito,
}: {
  session: Session;
  favorito: boolean;
  onToggleFavorito: (id: string) => void;
}) {
  return (
    <article className="card">
      <div className="card-body">
        <div className="card-meta">
          <span>{formatHora(session.inicio)}</span>
          {session.sala && <span>· {session.sala}</span>}
          {session.eixo && <span className="chip">{session.eixo}</span>}
        </div>
        <h3 className="card-title">
          <Link href={`/sessao/${session.id}`}>{session.titulo}</Link>
        </h3>
        {session.palestrante && <p className="card-sub">{session.palestrante}</p>}
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
    </article>
  );
}
