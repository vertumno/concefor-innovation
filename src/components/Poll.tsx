"use client";

import { useCallback, useEffect, useState } from "react";
import { LoginCta } from "./LoginCta";
import { useMe } from "@/lib/useMe";
import {
  POLL_COOLDOWN_SECONDS,
  POLL_RESPONSE_MAX,
  type Poll as PollType,
} from "@/lib/polls";

export function Poll({ sessionId }: { sessionId: string }) {
  const [poll, setPoll] = useState<PollType | null>(null);
  const [texto, setTexto] = useState("");
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
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
    // A projeção continua em 3s; o participante só precisa descobrir abertura/
    // encerramento e não deve baixar metadados 50 vezes/s em uma sala de 200.
    const id = setInterval(refresh, 8000);
    return () => clearInterval(id);
  }, [refresh]);

  useEffect(() => {
    if (!poll) return;
    setTexto(localStorage.getItem(`concefor:poll-draft:${poll.id}`) ?? "");
  }, [poll?.id]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  if (!poll) return null;

  async function submit() {
    const t = texto.trim();
    if (!t || sending || cooldown > 0) return;
    setSending(true);
    setMessage(null);
    try {
      const res = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pollId: poll!.id, texto: t }),
      });
      const data = (await res.json()) as {
        error?: string;
        retryAfterMs?: number;
        cooldownSeconds?: number;
      };
      if (!res.ok) {
        setMessage(data.error ?? "não foi possível enviar");
        if (res.status === 429) {
          setCooldown(
            Math.max(1, Math.ceil((data.retryAfterMs ?? POLL_COOLDOWN_SECONDS * 1000) / 1000)),
          );
        }
      } else {
        localStorage.removeItem(`concefor:poll-draft:${poll!.id}`);
        setTexto("");
        setPoll((current) => current
          ? { ...current, myResponses: (current.myResponses ?? 0) + 1 }
          : current);
        setCooldown(data.cooldownSeconds ?? POLL_COOLDOWN_SECONDS);
        setMessage("Resposta publicada no telão.");
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
            // Duas linhas: com 30 caracteres, três deixavam o campo com um vazio
            // que convidava a escrever mais do que cabe.
            rows={2}
            maxLength={POLL_RESPONSE_MAX}
            value={texto}
            placeholder="Uma palavra ou duas…"
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
            <button type="button" onClick={submit} disabled={sending || cooldown > 0 || !texto.trim()}>
              {sending ? "Enviando…" : cooldown > 0 ? `Aguarde ${cooldown}s` : "Enviar"}
            </button>
          </div>
          <p className="poll-moderation-note">
            As palavras da sua resposta aparecem no telão e podem ser ocultadas pela
            organização, que recebe sua identificação.
          </p>
          {message && <p className={message.startsWith("Resposta publicada") ? "login-msg" : "q-erro"}>{message}</p>}
        </div>
      ) : (
        me && <LoginCta>Entre com seu ingresso para responder à enquete.</LoginCta>
      )}
    </section>
  );
}
