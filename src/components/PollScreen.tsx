"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { type Poll, wordFrequencies } from "@/lib/polls";
import { PollCloud } from "@/components/PollCloud";

export function PollScreen() {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    QRCode.toDataURL(`${window.location.origin}/ao-vivo`, {
      width: 220,
      margin: 1,
      color: { dark: "#102a5c", light: "#ffffff" },
    })
      .then(setQr)
      .catch(() => {});
  }, []);

  useEffect(() => {
    let alive = true;
    const refresh = () =>
      fetch("/api/polls?projection=1", { cache: "no-store" })
        .then((r) => r.json())
        .then((data: { poll?: Poll | null }) => alive && setPoll(data.poll ?? null))
        .catch(() => {});
    refresh();
    const id = setInterval(refresh, 3000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const words = useMemo(
    () => (poll ? wordFrequencies(poll.responses, poll.stopwords) : []),
    [poll],
  );

  if (!poll) {
    return (
      <main className="poll-screen poll-screen--empty">
        <img src="/selo-20-anos-branco.png" alt="Selo 20 anos do Cefor" />
        <h1>Enquete ao vivo</h1>
        <p>Aguardando a organização iniciar uma pergunta.</p>
      </main>
    );
  }

  return (
    <main className="poll-screen">
      <header className="poll-screen-head">
        <img src="/selo-20-anos-branco.png" alt="Selo 20 anos do Cefor" />
        <div>
          <span>{poll.sessionTitle}</span>
          <h1>{poll.question}</h1>
        </div>
        {qr && (
          <div className="poll-screen-qr">
            <img src={qr} alt="QR de acesso ao app" />
            <span>app.cefor.ifes.edu.br</span>
          </div>
        )}
      </header>

      <section className={`poll-screen-results poll-screen-results--${poll.mode}`}>
        {poll.responses.length === 0 ? (
          <p className="poll-screen-wait">Aguardando respostas…</p>
        ) : poll.mode === "cloud" ? (
          <PollCloud words={words} />
        ) : (
          <ol className="poll-screen-list">
            {poll.responses.map((response) => (
              <li key={response.id}>{response.texto}</li>
            ))}
          </ol>
        )}
      </section>

      <footer className="poll-screen-foot">
        <span>{poll.responses.length} resposta{poll.responses.length === 1 ? "" : "s"} no telão</span>
        <span>{poll.status === "active" ? "ENQUETE ABERTA" : "RESULTADO FINAL"}</span>
      </footer>
    </main>
  );
}
