"use client";

// Faixa de demonstração + RELÓGIO DO EVENTO correndo. Reforça o conceito de
// "tempo passando": em modo demo, o relógio simulado avança em tempo real e a
// faixa deixa claro que o horário é simulado (não é a programação ao vivo real).

import { useEffect, useState } from "react";
import { useEventClock, SIMULATED_CLOCK } from "@/lib/clock";

export function DemoBar() {
  const now = useEventClock(1000);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!SIMULATED_CLOCK) return null;

  return (
    <div className="demo-bar" role="status">
      {mounted && (
        <span className="demo-clock" suppressHydrationWarning>
          <span className="demo-clock-dot" aria-hidden />
          {now.toLocaleTimeString("pt-BR")}
        </span>
      )}
      <span className="demo-bar-text">demonstração · horário simulado do evento</span>
    </div>
  );
}
