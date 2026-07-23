"use client";

// Barra inferior de navegação — 5 slots com "Ao Vivo" no centro (spec §4.0).
// Padrão de app de evento (benchmark contexto/benchmark-app-eden/): tudo
// alcançável com o polegar. O slot central é a nossa torção: a linha do tempo
// virando interface — o botão pulsa discretamente quando há sessão no ar
// (prefers-reduced-motion desliga via regra global de globals.css).

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { fetchSessions, splitNowNext } from "@/lib/sessions";
import { useEventClock } from "@/lib/clock";
import type { Session } from "@/lib/types";

type Slot = "inicio" | "agenda" | "aovivo" | "pessoas" | "mais";

function activeSlot(pathname: string): Slot | null {
  if (pathname === "/") return "inicio";
  // A tela de sessão pertence à Agenda (é de lá que se navega para ela).
  if (pathname.startsWith("/agenda") || pathname.startsWith("/sessao")) return "agenda";
  if (pathname.startsWith("/ao-vivo")) return "aovivo";
  if (pathname.startsWith("/pessoas")) return "pessoas";
  if (pathname.startsWith("/mais")) return "mais";
  return null;
}

// Ícones inline (stroke = currentColor) para não depender de lib de ícones.
function IconInicio() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </svg>
  );
}
function IconAgenda() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </svg>
  );
}
function IconAoVivo() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden>
      <circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none" />
      <path d="M8.2 15.8a5.4 5.4 0 0 1 0-7.6M15.8 8.2a5.4 5.4 0 0 1 0 7.6" />
      <path d="M5.6 18.4a9 9 0 0 1 0-12.8M18.4 5.6a9 9 0 0 1 0 12.8" />
    </svg>
  );
}
function IconPessoas() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="9" cy="8.5" r="3.2" />
      <path d="M3.5 20c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5" />
      <path d="M15.5 5.6a3.2 3.2 0 0 1 0 5.8M17.8 15.3c1.6.7 2.5 2.3 2.7 4.7" />
    </svg>
  );
}
function IconMais() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden>
      <circle cx="5" cy="12" r="1.9" />
      <circle cx="12" cy="12" r="1.9" />
      <circle cx="19" cy="12" r="1.9" />
    </svg>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const active = activeSlot(pathname);
  const [sessions, setSessions] = useState<Session[]>([]);
  // Relógio lento: só precisamos saber SE há sessão no ar, não de segundos.
  const now = useEventClock(30000);

  useEffect(() => {
    fetchSessions().then(setSessions);
  }, []);

  const temLive = splitNowNext(sessions, now).agora.length > 0;

  const item = (slot: Slot, href: string, label: string, icon: React.ReactNode) => (
    <Link
      href={href}
      className={`bn-item ${active === slot ? "bn-active" : ""}`}
      aria-current={active === slot ? "page" : undefined}
    >
      <span className="bn-icon">{icon}</span>
      <span className="bn-label">{label}</span>
    </Link>
  );

  return (
    <nav className="bottom-nav" aria-label="Navegação principal">
      <div className="bn-inner">
        {item("inicio", "/", "Início", <IconInicio />)}
        {item("agenda", "/agenda", "Agenda", <IconAgenda />)}
        <Link
          href="/ao-vivo"
          className={`bn-item bn-live ${active === "aovivo" ? "bn-active" : ""} ${temLive ? "bn-live-on" : ""}`}
          aria-current={active === "aovivo" ? "page" : undefined}
          aria-label={temLive ? "Ao Vivo — há sessão acontecendo agora" : "Ao Vivo"}
        >
          <span className="bn-live-circle">
            <IconAoVivo />
          </span>
          <span className="bn-label">Ao Vivo</span>
        </Link>
        {item("pessoas", "/pessoas", "Pessoas", <IconPessoas />)}
        {item("mais", "/mais", "Mais", <IconMais />)}
      </div>
    </nav>
  );
}
