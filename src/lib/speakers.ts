import { DEMO_MODE, getDemoSpeakers } from "./demoData";
import type { Speaker } from "./types";

// Palestrantes para a tela Pessoas — mesmo padrão de fetchSessions (lib/sessions.ts).
export async function fetchSpeakers(): Promise<Speaker[]> {
  if (DEMO_MODE) return getDemoSpeakers();
  try {
    const res = await fetch("/api/speakers");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as Speaker[];
  } catch (err) {
    console.error("Erro ao carregar palestrantes:", err);
    return [];
  }
}
