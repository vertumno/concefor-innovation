"use client";

// Pessoas — v1: palestrantes (bio/foto quando houver; spec §4.0).
// Com o login (R7), esta tela ganha participantes, "meu QR" e contatos salvos.

import { useEffect, useState } from "react";
import { corDe, iniciais } from "@/components/Speakers";
import { fetchSpeakers } from "@/lib/speakers";
import type { Speaker } from "@/lib/types";

export default function PessoasPage() {
  const [speakers, setSpeakers] = useState<Speaker[] | null>(null);

  useEffect(() => {
    fetchSpeakers().then(setSpeakers);
  }, []);

  if (speakers === null) return <p className="page-sub">Carregando…</p>;

  return (
    <>
      <h1 className="page-title">Pessoas</h1>
      <p className="page-sub">Quem faz o VIII Concefor acontecer.</p>

      <div className="section-label">Palestrantes</div>
      {speakers.length === 0 ? (
        <div className="empty">
          Os palestrantes entram aqui em breve — junto com a programação oficial.
        </div>
      ) : (
        <ul className="people">
          {speakers.map((p) => (
            <li key={p.id} className="person">
              {p.foto ? (
                // eslint-disable-next-line @next/next/no-img-element -- foto externa (Even3), domínio ainda não fixado
                <img className="person-foto" src={p.foto} alt="" />
              ) : (
                <span className="speaker-avatar" style={{ background: corDe(p.nome) }} aria-hidden>
                  {iniciais(p.nome)}
                </span>
              )}
              <div className="person-text">
                <span className="speaker-name">
                  {p.titulo ? `${p.titulo} ` : ""}
                  {p.nome}
                </span>
                {p.instituicao && <span className="speaker-inst">{p.instituicao}</span>}
                {p.bio && <p className="person-bio">{p.bio}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
