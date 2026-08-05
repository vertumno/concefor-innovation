"use client";

// /telao/[sessionId] — telão fixo numa sessão (independe de qual está no ar).
// Antes de começar, mostra a sala de espera com contagem regressiva e troca
// sozinho para o modo ao vivo na hora; depois do fim, fica a linha do tempo
// acumulada da sessão.
import { use, useEffect, useState } from "react";
import { fetchSessions, sessionStatus } from "@/lib/sessions";
import { useEventClock } from "@/lib/clock";
import { Telao, TelaoAguardando, TelaoEmpty } from "@/components/Telao";
import type { Session } from "@/lib/types";

export default function TelaoSessao({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const now = useEventClock(1000); // 1s: mantém a contagem regressiva viva

  useEffect(() => {
    fetchSessions().then((all) => setSession(all.find((s) => s.id === sessionId) ?? null));
  }, [sessionId]);

  if (session === undefined) return <TelaoEmpty msg="Carregando…" />;
  if (session === null) return <TelaoEmpty msg="Sessão não encontrada." />;
  if (sessionStatus(session, now) === "future") {
    return <TelaoAguardando session={session} now={now} />;
  }
  return <Telao session={session} />;
}
