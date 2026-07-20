"use client";

// Exibição de palestrantes estruturados. Avatar de iniciais (cor derivada do
// nome, dentro da paleta) + nome/título + instituição quando houver. Quando
// chegarem bio/foto (campos já no modelo Speaker), dá pra enriquecer aqui.

import type { Speaker } from "@/lib/types";

export function iniciais(nome: string): string {
  const p = nome.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase();
}

export function corDe(nome: string): string {
  let h = 0;
  for (let i = 0; i < nome.length; i++) h = (h * 31 + nome.charCodeAt(i)) | 0;
  const paleta = ["#1e5a8c", "#0e8fa8", "#2a6fb0", "#3c7e8c", "#4a6fa5", "#2c8c9c"];
  return paleta[Math.abs(h) % paleta.length];
}

export function Speakers({ speakers }: { speakers: Speaker[] }) {
  if (!speakers.length) return null;
  return (
    <ul className="speakers">
      {speakers.map((s) => (
        <li key={s.id} className="speaker">
          <span className="speaker-avatar" style={{ background: corDe(s.nome) }} aria-hidden>
            {iniciais(s.nome)}
          </span>
          <span className="speaker-text">
            <span className="speaker-name">
              {s.titulo ? `${s.titulo} ` : ""}
              {s.nome}
            </span>
            {s.instituicao && <span className="speaker-inst">{s.instituicao}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}
