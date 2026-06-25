"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { getFavorites, toggleFavorite } from "@/lib/favorites";
import { fetchSessions, formatDia, formatHora } from "@/lib/sessions";
import type { Session } from "@/lib/types";

export default function SessaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [favorito, setFavorito] = useState(false);

  useEffect(() => {
    fetchSessions().then((all) => setSession(all.find((s) => s.id === id) ?? null));
    setFavorito(getFavorites().has(id));
  }, [id]);

  if (session === undefined) return <p className="page-sub">Carregando…</p>;
  if (session === null) {
    return (
      <div className="empty">
        Sessão não encontrada. <Link href="/timeline">Voltar à programação</Link>
      </div>
    );
  }

  return (
    <>
      <p className="page-sub">
        {formatDia(session.inicio)} · {formatHora(session.inicio)}
        {session.fim ? `–${formatHora(session.fim)}` : ""}
      </p>
      <h1 className="page-title">{session.titulo}</h1>
      <div className="card-meta" style={{ marginBottom: 14 }}>
        {session.sala && <span>{session.sala}</span>}
        {session.eixo && <span className="chip">{session.eixo}</span>}
      </div>
      {session.palestrante && <p className="card-sub">{session.palestrante}</p>}
      {session.descricao && <p>{session.descricao}</p>}

      <button
        type="button"
        className={`star ${favorito ? "star-on" : ""}`}
        style={{ padding: "10px 0" }}
        onClick={() => {
          toggleFavorite(id);
          setFavorito(getFavorites().has(id));
        }}
      >
        {favorito ? "★ Na minha programação" : "☆ Adicionar à minha programação"}
      </button>

      {/* Reações ao vivo (feature 4.2) chegam na semana 3 — ver spec/app-v1.md §4.2. */}
      <div className="notice" style={{ marginTop: 18 }}>
        <strong>Em breve:</strong> reações ao vivo nesta sessão (semana 3 do cronograma).
      </div>
    </>
  );
}
