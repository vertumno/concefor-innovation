"use client";

// /telao/[sessionId] — telão fixo numa sessão (independe de qual está no ar).
import { use, useEffect, useState } from "react";
import { fetchSessions } from "@/lib/sessions";
import { Telao, TelaoEmpty } from "@/components/Telao";
import type { Session } from "@/lib/types";

export default function TelaoSessao({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    fetchSessions().then((all) => setSession(all.find((s) => s.id === sessionId) ?? null));
  }, [sessionId]);

  if (session === undefined) return <TelaoEmpty msg="Carregando…" />;
  if (session === null) return <TelaoEmpty msg="Sessão não encontrada." />;
  return <Telao session={session} />;
}
