"use client";

// Relógio de demonstração. O VIII Concefor é em ago/2026 (futuro), mas a demo
// precisa parecer VIVA — com sessão acontecendo agora e o tempo passando.
//
// Em modo demo, o "agora" é ancorado em 18/08 09:30 (mesa "Tecnologia Delas" no ar)
// e corre 1:1 a partir do carregamento da página: 1 segundo real = 1 segundo de
// evento. Assim a barra de progresso avança, o "agora" muda de sessão e tudo flui.
// Fora do modo demo, é o relógio real do dispositivo.

import { useEffect, useState } from "react";
import { DEMO_MODE } from "./demoData";

// 18/08/2026 09:30 em Vitória-ES (UTC-3) = 12:30 UTC. Absoluto: independe do fuso da máquina.
const ANCHOR_MS = Date.UTC(2026, 7, 18, 12, 30, 0);

export const SIMULATED_CLOCK = DEMO_MODE;

let startReal: number | null = null;

export function getNow(): Date {
  if (!DEMO_MODE) return new Date();
  if (startReal === null) startReal = Date.now();
  return new Date(ANCHOR_MS + (Date.now() - startReal));
}

// Hook que re-renderiza periodicamente para as animações de "tempo passando".
export function useEventClock(intervalMs = 1000): Date {
  const [now, setNow] = useState<Date>(() => getNow());
  useEffect(() => {
    setNow(getNow());
    const id = setInterval(() => setNow(getNow()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
