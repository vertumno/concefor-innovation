"use client";

// /telao — escolhe automaticamente a sessão que está no ar agora e projeta o
// batimento. Para fixar uma sessão específica, use /telao/[sessionId].
import { useEffect, useState } from "react";
import { fetchSessions, sessionStatus } from "@/lib/sessions";
import { useEventClock } from "@/lib/clock";
import { Telao, TelaoEmpty } from "@/components/Telao";
import type { Session } from "@/lib/types";

export default function TelaoIndex() {
  const [sessions, setSessions] = useState<Session[] | null>(null);
  const now = useEventClock(5000);

  useEffect(() => {
    fetchSessions().then(setSessions);
  }, []);

  if (sessions === null) return <TelaoEmpty msg="Carregando…" />;
  const live = sessions.find((s) => sessionStatus(s, now) === "live");
  if (!live) return <TelaoEmpty msg="Nenhuma sessão no ar agora." />;
  return <Telao session={live} />;
}
