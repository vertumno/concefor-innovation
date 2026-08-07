"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  DEFAULT_STOPWORDS,
  POLL_QUESTION_MAX,
  type Poll,
  type PollResponseStatus,
} from "@/lib/polls";
import type { Session } from "@/lib/types";

export function AdminPolls({ sessions, token }: { sessions: Session[]; token: string }) {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [question, setQuestion] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [stopwords, setStopwords] = useState(DEFAULT_STOPWORDS.join(", "));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastPollJson = useRef("");
  const headers = useMemo(
    () => ({ "Content-Type": "application/json", "x-admin-token": token }),
    [token],
  );

  useEffect(() => {
    if (!sessionId && sessions.length) {
      const now = Date.now();
      const live = sessions.find(
        (s) => new Date(s.inicio).getTime() <= now && (!s.fim || new Date(s.fim).getTime() > now),
      );
      setSessionId((live ?? sessions[0]).id);
    }
  }, [sessions, sessionId]);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/polls", { headers: { "x-admin-token": token } });
      if (res.ok) {
        const next = ((await res.json()) as { poll: Poll | null }).poll;
        const serialized = JSON.stringify(next);
        if (serialized !== lastPollJson.current) {
          lastPollJson.current = serialized;
          setPoll(next);
        }
      }
    } catch {
      /* próximo poll tenta de novo */
    }
  }, [token]);

  useEffect(() => {
    refresh();
    const id = setInterval(() => {
      if (!document.hidden) refresh();
    }, 5000);
    return () => clearInterval(id);
  }, [refresh]);

  async function action(body: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/polls", {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { poll?: Poll; error?: string };
      if (!res.ok) setError(data.error ?? "não foi possível concluir");
      else {
        const next = data.poll ?? null;
        lastPollJson.current = JSON.stringify(next);
        setPoll(next);
        if (body.action === "create") setQuestion("");
      }
    } catch {
      setError("sem conexão — tente novamente");
    } finally {
      setBusy(false);
    }
  }

  const statusLabel: Record<PollResponseStatus, string> = {
    pending: "aguardando",
    approved: "no telão",
    hidden: "oculta",
  };

  return (
    <section className="admin-polls">
      <div className="section-label">Enquete aberta ao vivo</div>
      <p className="page-sub">
        Uma enquete por vez. As respostas aparecem imediatamente e a moderação oculta apenas o
        que não deve permanecer na projeção.
      </p>

      {poll && (
        <div className="admin-poll-current">
          <span className={`poll-status poll-status--${poll.status}`}>
            {poll.status === "active" ? "ativa" : "encerrada"}
          </span>
          <strong>{poll.question}</strong>
          <span className="admin-session-meta">{poll.sessionTitle}</span>
          <div className="admin-poll-actions">
            <button
              type="button"
              className={`admin-btn admin-btn-sm ${poll.mode === "cloud" ? "admin-btn-accent" : ""}`}
              onClick={() => action({ action: "mode", pollId: poll.id, mode: "cloud" })}
              disabled={busy}
            >
              Nuvem
            </button>
            <button
              type="button"
              className={`admin-btn admin-btn-sm ${poll.mode === "list" ? "admin-btn-accent" : ""}`}
              onClick={() => action({ action: "mode", pollId: poll.id, mode: "list" })}
              disabled={busy}
            >
              Lista
            </button>
            <Link href="/enquete" target="_blank" className="admin-btn admin-btn-sm">
              Abrir projeção ↗
            </Link>
            {poll.status === "active" && (
              <button
                type="button"
                className="admin-btn admin-btn-sm"
                onClick={() => confirm("Encerrar a enquete? Novas respostas serão bloqueadas.") && action({ action: "close", pollId: poll.id })}
                disabled={busy}
              >
                Encerrar
              </button>
            )}
          </div>

          <div className="admin-poll-responses">
            {poll.responses.length === 0 ? (
              <div className="empty">Nenhuma resposta recebida.</div>
            ) : (
              poll.responses.map((response) => (
                <div key={response.id} className={`admin-poll-response admin-poll-response--${response.status}`}>
                  <div>
                    <p>{response.texto}</p>
                    <small>
                      {response.autor} · {statusLabel[response.status]}
                    </small>
                  </div>
                  <div className="admin-poll-response-actions">
                    {response.status !== "approved" && (
                      <button
                        type="button"
                        className="admin-btn admin-btn-sm admin-btn-accent"
                        onClick={() => action({ action: "approve", pollId: poll.id, responseId: response.id })}
                        disabled={busy}
                      >
                        {response.status === "hidden" ? "Reexibir" : "Aprovar"}
                      </button>
                    )}
                    {response.status !== "hidden" && (
                      <button
                        type="button"
                        className="admin-btn admin-btn-sm"
                        onClick={() => action({ action: "hide", pollId: poll.id, responseId: response.id })}
                        disabled={busy}
                      >
                        Ocultar
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div className="admin-bloco-teste">
        <label className="admin-campo">
          Sessão
          <select value={sessionId} onChange={(e) => setSessionId(e.target.value)}>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.titulo}
              </option>
            ))}
          </select>
        </label>
        <label className="admin-campo">
          Pergunta aberta
          <textarea
            rows={3}
            maxLength={POLL_QUESTION_MAX}
            value={question}
            placeholder="Ex.: O que a educação não pode perder nos próximos 20 anos?"
            onChange={(e) => setQuestion(e.target.value)}
          />
          <small>{question.length}/{POLL_QUESTION_MAX}</small>
        </label>
        <details className="admin-poll-stopwords">
          <summary>Palavras ignoradas na nuvem</summary>
          <textarea
            rows={3}
            value={stopwords}
            onChange={(e) => setStopwords(e.target.value)}
            aria-label="Palavras ignoradas, separadas por vírgula"
          />
        </details>
        <button
          type="button"
          className="admin-btn admin-btn-accent"
          disabled={busy || !question.trim() || !sessionId}
          onClick={() => action({ action: "create", sessionId, question, stopwords })}
        >
          {poll?.status === "active" ? "Encerrar a atual e iniciar esta" : "Iniciar enquete"}
        </button>
      </div>
      {error && <p className="q-erro">{error}</p>}
    </section>
  );
}
