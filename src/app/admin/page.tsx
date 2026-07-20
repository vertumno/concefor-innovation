"use client";

// Dashboard admin mínimo (R3, spec §5) — fora da navegação, protegido por
// ADMIN_TOKEN. Entra com /admin?token=... (fica no localStorage) ou digitando.
// Números ao vivo + re-sync Even3 + moderação das perguntas (R4).

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchSessions, splitNowNext, formatHora } from "@/lib/sessions";
import { useEventClock } from "@/lib/clock";
import type { AdminStats, Question } from "@/lib/db";
import type { Session } from "@/lib/types";

const TOKEN_KEY = "concefor:admin_token";
const POLL_MS = 5000;

type QState = { open: boolean; questions: Question[] };

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [tokenInput, setTokenInput] = useState("");
  const [authFail, setAuthFail] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [qBySession, setQBySession] = useState<Record<string, QState>>({});
  const now = useEventClock(30000);

  // Token: ?token= na URL → localStorage → estado.
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("token");
    if (fromUrl) {
      localStorage.setItem(TOKEN_KEY, fromUrl);
      window.history.replaceState(null, "", "/admin"); // tira o segredo da URL
    }
    setToken(localStorage.getItem(TOKEN_KEY));
    fetchSessions().then(setSessions);
  }, []);

  const headers = useMemo(() => ({ "x-admin-token": token ?? "" }), [token]);
  const aoVivo = splitNowNext(sessions, now).agora;

  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/admin/stats", { headers });
      if (res.status === 401) {
        setAuthFail(true);
        setStats(null);
        return;
      }
      setAuthFail(false);
      setStats((await res.json()) as AdminStats);
    } catch {
      /* mantém o último estado */
    }
  }, [token, headers]);

  const refreshQuestions = useCallback(async () => {
    if (!token) return;
    for (const s of aoVivo) {
      try {
        const res = await fetch(`/api/questions?sessionId=${encodeURIComponent(s.id)}`, { headers });
        if (res.ok) {
          const data = (await res.json()) as QState;
          setQBySession((prev) => ({ ...prev, [s.id]: data }));
        }
      } catch {
        /* próximo poll corrige */
      }
    }
  }, [token, headers, aoVivo]);

  useEffect(() => {
    refresh();
    refreshQuestions();
    const id = setInterval(() => {
      refresh();
      refreshQuestions();
    }, POLL_MS);
    return () => clearInterval(id);
  }, [refresh, refreshQuestions]);

  async function resync() {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const res = await fetch("/api/admin/sync", { method: "POST", headers });
      const data = await res.json();
      setSyncMsg(
        res.ok
          ? `Sync ok: ${data.sincronizadas} sessões, ${data.removidasStale} removidas · dias ${data.dias?.join(", ")}`
          : `Falhou: ${data.error}`,
      );
      fetchSessions().then(setSessions);
    } catch {
      setSyncMsg("Falhou: sem conexão com o servidor");
    } finally {
      setSyncing(false);
    }
  }

  async function moderar(body: Record<string, string>) {
    await fetch("/api/admin/questions", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    refreshQuestions();
  }

  function salvarToken() {
    localStorage.setItem(TOKEN_KEY, tokenInput.trim());
    setToken(tokenInput.trim());
    setAuthFail(false);
  }

  if (token === null || authFail || !token) {
    return (
      <>
        <h1 className="page-title">Admin</h1>
        <p className="page-sub">
          {authFail ? "Token inválido — confira e tente de novo." : "Área da organização."}
        </p>
        <div className="filter-row">
          <input
            type="password"
            placeholder="Token de admin…"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && salvarToken()}
          />
          <button type="button" className="admin-btn" onClick={salvarToken}>
            Entrar
          </button>
        </div>
      </>
    );
  }

  const maxMinuto = Math.max(1, ...(stats?.reacoesPorMinuto ?? []).map((m) => m.n));

  return (
    <>
      <h1 className="page-title">Admin</h1>
      <p className="page-sub">Números ao vivo do VIII Concefor — atualiza a cada 5 s.</p>

      <div className="admin-tiles">
        <div className="admin-tile">
          <span className="admin-n">{stats?.ativosUltimaHora ?? "…"}</span>
          <span className="admin-l">dispositivos ativos (1 h)</span>
        </div>
        <div className="admin-tile">
          <span className="admin-n">{stats?.totalReacoes ?? "…"}</span>
          <span className="admin-l">reações no total</span>
        </div>
        <div className="admin-tile">
          <span className="admin-n">{stats?.totalPerguntas ?? "…"}</span>
          <span className="admin-l">perguntas no total</span>
        </div>
      </div>

      <div className="section-label">Reações por minuto (última hora)</div>
      {stats && stats.reacoesPorMinuto.length > 0 ? (
        <div className="admin-spark" role="img" aria-label="Reações por minuto">
          {stats.reacoesPorMinuto.map((m, i) => (
            <div
              key={`${m.minuto}-${i}`}
              className="admin-bar"
              style={{ height: `${Math.round((m.n / maxMinuto) * 100)}%` }}
              title={`${m.minuto} UTC — ${m.n}`}
            />
          ))}
        </div>
      ) : (
        <div className="empty">Sem reações na última hora.</div>
      )}

      <div className="section-label">Reações por sessão</div>
      {stats && stats.reacoesPorSessao.length > 0 ? (
        <table className="admin-table">
          <tbody>
            {stats.reacoesPorSessao.map((r) => (
              <tr key={r.sessionId ?? "null"}>
                <td>{r.titulo}</td>
                <td className="admin-td-n">{r.n}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="empty">Nenhuma reação registrada ainda.</div>
      )}

      <div className="section-label">Perguntas — sessões ao vivo</div>
      {aoVivo.length === 0 && <div className="empty">Nenhuma sessão no ar agora.</div>}
      {aoVivo.map((s) => {
        const q = qBySession[s.id];
        return (
          <div key={s.id} className="admin-session">
            <div className="admin-session-head">
              <strong>{s.titulo}</strong>
              <span className="admin-session-meta">
                {formatHora(s.inicio)}
                {s.sala ? ` · ${s.sala}` : ""}
              </span>
              <button
                type="button"
                className="admin-btn"
                onClick={() => moderar({ sessionId: s.id, action: q?.open ? "close" : "open" })}
              >
                {q?.open ? "Fechar perguntas" : "Abrir perguntas"}
              </button>
            </div>
            {q && q.questions.length > 0 && (
              <ol className="q-list">
                {q.questions.map((p) => (
                  <li key={p.id} className={`q-item ${p.hidden ? "q-hidden" : ""}`}>
                    <span className="q-vote q-vote-static">▲ {p.votes}</span>
                    <p className="q-texto">{p.texto}</p>
                    <button
                      type="button"
                      className="admin-btn admin-btn-sm"
                      onClick={() => moderar({ questionId: p.id, action: p.hidden ? "unhide" : "hide" })}
                    >
                      {p.hidden ? "Reexibir" : "Ocultar"}
                    </button>
                  </li>
                ))}
              </ol>
            )}
          </div>
        );
      })}

      <div className="section-label">Even3</div>
      <button type="button" className="admin-btn" onClick={resync} disabled={syncing}>
        {syncing ? "Sincronizando…" : "Re-sincronizar programação do Even3"}
      </button>
      {syncMsg && <p className="page-sub" style={{ marginTop: 8 }}>{syncMsg}</p>}
    </>
  );
}
