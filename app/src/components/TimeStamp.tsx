"use client";

// Timestamp visual — a marca temporal do app. Tudo que tem hora usa isto.
// Conceito: cada momento é um NÓ na linha do tempo (alusão à rede de pontos do
// selo 20 anos). A hora é o herói; o estado (passado/agora/futuro) muda o nó.
//
// Variantes:
//   rail  — coluna [hora + nó] que compõe a espinha da timeline (ver SessionCard)
//   hero  — bloco grande, destacado (ver página da sessão)

import type { SessionStatus } from "@/lib/sessions";
import { formatHoraH, formatRange, formatDiaCurto } from "@/lib/sessions";

const ESTADO: Record<SessionStatus, string> = {
  past: "encerrada",
  live: "ao vivo",
  future: "em breve",
};

export function TimeStamp({
  inicio,
  fim,
  status,
  variant = "rail",
}: {
  inicio: string;
  fim: string | null;
  status: SessionStatus;
  variant?: "rail" | "hero";
}) {
  if (variant === "hero") {
    return (
      <div className="ts-hero" data-status={status}>
        <span className="ts-dot" aria-hidden />
        <div className="ts-hero-text">
          <span className="ts-day">{formatDiaCurto(inicio)}</span>
          <span className="ts-range">{formatRange(inicio, fim)}</span>
          <span className="ts-state">{ESTADO[status]}</span>
        </div>
      </div>
    );
  }

  // rail — dois elementos posicionados pelo grid do .tl-item
  return (
    <>
      <time className="tl-time" dateTime={inicio}>
        {formatHoraH(inicio)}
      </time>
      <span className="tl-rail" aria-hidden>
        <span className="tl-node" />
      </span>
    </>
  );
}
