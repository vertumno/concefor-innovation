"use client";

// /telao — escolhe automaticamente a sessão no ar e projeta a linha do tempo de
// reações. Sem sessão ao vivo, vira sala de espera: a próxima sessão + contagem
// regressiva. Para fixar uma sessão específica, use /telao/[sessionId].
import { useEffect, useState } from "react";
import { fetchSessions, sessionStatus } from "@/lib/sessions";
import { useEventClock } from "@/lib/clock";
import { Telao, TelaoAguardando, TelaoEmpty } from "@/components/Telao";
import type { Session } from "@/lib/types";

export default function TelaoIndex() {
  const [sessions, setSessions] = useState<Session[] | null>(null);
  const now = useEventClock(1000); // 1s: mantém a contagem regressiva viva

  // Recarrega a programação a cada minuto: o telão fica ligado por horas e
  // precisa enxergar blocos criados na hora pelo /admin sem ninguém tocar nele.
  useEffect(() => {
    fetchSessions().then(setSessions);
    const id = setInterval(() => fetchSessions().then(setSessions), 60_000);
    return () => clearInterval(id);
  }, []);

  if (sessions === null) return <TelaoEmpty msg="Carregando…" />;
  const live = sessions.find((s) => sessionStatus(s, now) === "live");
  if (live) return <Telao session={live} />;
  // Sessões chegam ordenadas por início: a primeira "future" é a próxima.
  const proxima = sessions.find((s) => sessionStatus(s, now) === "future");
  if (proxima) return <TelaoAguardando session={proxima} now={now} />;
  return (
    <TelaoEmpty
      msg={sessions.length ? "Programação encerrada — obrigado por participar!" : "Nenhuma sessão no ar agora."}
    />
  );
}
