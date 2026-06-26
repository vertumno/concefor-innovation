"use client";

import { useEffect, useMemo, useState } from "react";
import { SessionCard } from "@/components/SessionCard";
import { getFavorites, toggleFavorite } from "@/lib/favorites";
import { fetchSessions, formatDia } from "@/lib/sessions";
import { useEventClock } from "@/lib/clock";
import type { Session } from "@/lib/types";

export default function TimelinePage() {
  const [sessions, setSessions] = useState<Session[] | null>(null);
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set());
  const [eixo, setEixo] = useState("");
  const [busca, setBusca] = useState("");
  const [soFavoritos, setSoFavoritos] = useState(false);
  const now = useEventClock(1000);

  useEffect(() => {
    fetchSessions().then(setSessions);
    setFavoritos(getFavorites());
  }, []);

  function onToggle(id: string) {
    setFavoritos(new Set(toggleFavorite(id)));
  }

  const eixos = useMemo(
    () => [...new Set((sessions ?? []).map((s) => s.eixo).filter(Boolean) as string[])],
    [sessions],
  );

  const filtradas = useMemo(() => {
    let r = sessions ?? [];
    if (eixo) r = r.filter((s) => s.eixo === eixo);
    if (soFavoritos) r = r.filter((s) => favoritos.has(s.id));
    if (busca.trim()) {
      const q = busca.toLowerCase();
      r = r.filter(
        (s) =>
          s.titulo.toLowerCase().includes(q) ||
          (s.palestrante ?? "").toLowerCase().includes(q),
      );
    }
    return r;
  }, [sessions, eixo, busca, soFavoritos, favoritos]);

  // Agrupa por dia para desenhar a linha do tempo (espinha da programação).
  const porDia = useMemo(() => {
    const grupos = new Map<string, Session[]>();
    for (const s of filtradas) {
      const dia = formatDia(s.inicio);
      if (!grupos.has(dia)) grupos.set(dia, []);
      grupos.get(dia)!.push(s);
    }
    return [...grupos.entries()];
  }, [filtradas]);

  if (sessions === null) {
    return <p className="page-sub">Carregando…</p>;
  }

  return (
    <>
      <h1 className="page-title">Programação</h1>
      <p className="page-sub">A linha do tempo do evento. Favorite pra montar a sua.</p>

      <div className="filter-row">
        <input
          placeholder="Buscar título ou palestrante…"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <select value={eixo} onChange={(e) => setEixo(e.target.value)}>
          <option value="">Todos os eixos</option>
          {eixos.map((x) => (
            <option key={x} value={x}>
              {x}
            </option>
          ))}
        </select>
      </div>

      <label className="page-sub" style={{ display: "block", marginBottom: 12 }}>
        <input
          type="checkbox"
          checked={soFavoritos}
          onChange={(e) => setSoFavoritos(e.target.checked)}
        />{" "}
        Só a minha programação (favoritos)
      </label>

      {filtradas.length === 0 && (
        <div className="empty">
          Nenhuma sessão para os filtros atuais. Rode <code>npm run dev:demo</code> para a
          programação de demonstração, ou configure o Supabase.
        </div>
      )}

      {porDia.map(([dia, lista]) => (
        <section key={dia}>
          <h2 className="day-head">{dia}</h2>
          <ol className="timeline">
            {lista.map((s, i) => (
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
        </section>
      ))}
    </>
  );
}
