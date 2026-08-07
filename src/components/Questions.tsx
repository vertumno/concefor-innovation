"use client";

// Perguntas com upvote (R4, spec §8): texto curto, mais votadas no topo, 1 voto
// por pessoa autenticada (toggle). A janela abre/fecha pelo /admin. Desde 05/08 as
// perguntas são IDENTIFICADAS (saem com o nome completo de quem mandou — inibe
// pergunta tosca/ofensiva) e perguntar/votar exige login; anônimo só vê.
// Atualiza por polling curto — mesma filosofia do SSE do telão (poll no SQLite).

import { useCallback, useEffect, useState } from "react";
import { useMe } from "@/lib/useMe";
import { LoginCta } from "./LoginCta";
import type { Question } from "@/lib/db";

const MAX_CHARS = 140;
const POLL_MS = 4000;

type State = { open: boolean; questions: Question[] };

export function Questions({ sessionId, live }: { sessionId: string; live: boolean }) {
  const [state, setState] = useState<State | null>(null);
  const [texto, setTexto] = useState("");
  const [sending, setSending] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const me = useMe();
  const logado = me?.logado === true;

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/questions?sessionId=${encodeURIComponent(sessionId)}`,
      );
      if (res.ok) setState((await res.json()) as State);
    } catch {
      /* rede oscilou: mantém o estado atual e tenta no próximo poll */
    }
  }, [sessionId]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, POLL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  async function enviar() {
    const t = texto.trim();
    if (!t || sending) return;
    setSending(true);
    setErro(null);
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, texto: t }),
      });
      const data = (await res.json()) as { error?: string; questions?: Question[] };
      if (!res.ok) {
        setErro(data.error ?? "não foi possível enviar");
      } else {
        setTexto("");
        if (data.questions) setState((s) => ({ open: s?.open ?? true, questions: data.questions! }));
      }
    } catch {
      setErro("sem conexão — tente de novo");
    } finally {
      setSending(false);
    }
  }

  async function votar(questionId: string) {
    try {
      const res = await fetch("/api/questions/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, questionId }),
      });
      const data = (await res.json()) as { questions?: Question[] };
      if (res.ok && data.questions) {
        setState((s) => ({ open: s?.open ?? false, questions: data.questions! }));
      }
    } catch {
      /* poll seguinte corrige */
    }
  }

  if (!state) return null;
  const { open, questions } = state;
  // Nada a mostrar: sem janela aberta e sem perguntas públicas.
  if (!open && questions.length === 0) return null;

  return (
    <section className="questions">
      <div className="section-label">Perguntas do público</div>

      {open ? (
        logado ? (
          <div className="q-composer">
            <textarea
              value={texto}
              maxLength={MAX_CHARS}
              rows={2}
              placeholder={live ? "Pergunte à mesa…" : "Deixe sua pergunta…"}
              onChange={(e) => setTexto(e.target.value)}
            />
            <div className="q-composer-foot">
              {/* Transparência: a pessoa sabe que a pergunta sai assinada. */}
              <span className="q-chars">
                {me?.nome ? "seu nome da inscrição será exibido · " : ""}
                {texto.length}/{MAX_CHARS}
              </span>
              <button type="button" onClick={enviar} disabled={sending || !texto.trim()}>
                {sending ? "Enviando…" : "Perguntar"}
              </button>
            </div>
            {erro && <p className="q-erro">{erro}</p>}
          </div>
        ) : (
          me && (
            <LoginCta>As perguntas são identificadas — entre para perguntar e votar.</LoginCta>
          )
        )
      ) : (
        <p className="q-fechada">O envio de perguntas está fechado.</p>
      )}

      {questions.length > 0 && (
        <ol className="q-list">
          {questions.map((q) => (
            <li key={q.id} className="q-item">
              <button
                type="button"
                className={`q-vote ${q.myVote ? "on" : ""}`}
                aria-pressed={q.myVote}
                aria-label={q.myVote ? "Retirar meu voto" : "Votar nesta pergunta"}
                onClick={() => votar(q.id)}
                disabled={!logado}
              >
                ▲<span className="q-vote-n">{q.votes}</span>
              </button>
              <div className="q-corpo">
                <p className="q-texto">{q.texto}</p>
                {q.autor && <span className="q-autor">{q.autor}</span>}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
