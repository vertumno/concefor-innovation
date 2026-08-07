"use client";

import { useCallback, useEffect, useState } from "react";
import { LoginCta } from "./LoginCta";
import { useMe } from "@/lib/useMe";
import { POLL_RESPONSE_MAX, type Poll as PollType } from "@/lib/polls";

export function Poll({ sessionId }: { sessionId: string }) {
  const [poll, setPoll] = useState<PollType | null>(null);
  const [texto, setTexto] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const me = useMe();

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/polls?sessionId=${encodeURIComponent(sessionId)}`);
      if (res.ok) setPoll(((await res.json()) as { poll: PollType | null }).poll);
    } catch {
      /* mantém a enquete atual durante uma oscilação */
    }
  }, [sessionId]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 4000);
    return () => clearInterval(id);
  }, [refresh]);

  useEffect(() => {
    if (!poll) return;
    setTexto(localStorage.getItem(`concefor:poll-draft:${poll.id}`) ?? "");
  }, [poll?.id]);

  if (!poll) return null;

  async function submit() {
    const t = texto.trim();
    if (!t || sending) return;
    setSending(true);
    setMessage(null);
    try {
      const res = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pollId: poll!.id, texto: t }),
      });
      const data = (await res.json()) as { error?: string; poll?: PollType };
      if (!res.ok) {
        setMessage(data.error ?? "não foi possível enviar");
      } else {
        localStorage.removeItem(`concefor:poll-draft:${poll!.id}`);
        setTexto("");
        if (data.poll) setPoll(data.poll);
        setMessage("Resposta enviada para a moderação. Você pode responder novamente.");
      }
    } catch {
      setMessage("Sem conexão — seu texto continua aqui para tentar novamente.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="poll-card" aria-labelledby={`poll-title-${poll.id}`}>
      <div className="section-label">Enquete ao vivo</div>
      <h2 id={`poll-title-${poll.id}`} className="poll-question">
        {poll.question}
      </h2>
      {me?.logado ? (
        <div className="q-composer">
          <label className="sr-only" htmlFor={`poll-response-${poll.id}`}>
            Sua resposta para a enquete
          </label>
          <textarea
            id={`poll-response-${poll.id}`}
            rows={3}
            maxLength={POLL_RESPONSE_MAX}
            value={texto}
            placeholder="Escreva uma resposta curta…"
            onChange={(e) => {
              setTexto(e.target.value);
              localStorage.setItem(`concefor:poll-draft:${poll.id}`, e.target.value);
            }}
          />
          <div className="q-composer-foot">
            <span className="q-chars">
              {poll.myResponses ? `${poll.myResponses} enviada${poll.myResponses > 1 ? "s" : ""} · ` : ""}
              {texto.length}/{POLL_RESPONSE_MAX}
            </span>
            <button type="button" onClick={submit} disabled={sending || !texto.trim()}>
              {sending ? "Enviando…" : "Enviar"}
            </button>
          </div>
          <p className="poll-moderation-note">
            A resposta aparece sem seu nome no telão depois da aprovação da organização.
          </p>
          {message && <p className={message.startsWith("Resposta enviada") ? "login-msg" : "q-erro"}>{message}</p>}
        </div>
      ) : (
        me && <LoginCta>Entre com seu ingresso para responder à enquete.</LoginCta>
      )}
    </section>
  );
}
