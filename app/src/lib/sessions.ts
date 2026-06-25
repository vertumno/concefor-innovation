import { supabase } from "./supabaseClient";
import type { Session } from "./types";

const UMA_HORA = 60 * 60 * 1000;

export async function fetchSessions(): Promise<Session[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .order("inicio", { ascending: true });
  if (error) {
    // Não silenciamos: a tela mostra estado vazio, mas o erro fica visível no console.
    console.error("Erro ao carregar sessões:", error.message);
    return [];
  }
  return (data ?? []) as Session[];
}

function fimDe(s: Session): number {
  const ini = new Date(s.inicio).getTime();
  return s.fim ? new Date(s.fim).getTime() : ini + UMA_HORA;
}

// "Agora" (em andamento) e "A seguir" (próximas), a partir do instante atual.
export function splitNowNext(sessions: Session[], now = new Date()) {
  const t = now.getTime();
  const agora = sessions.filter((s) => new Date(s.inicio).getTime() <= t && t < fimDe(s));
  const aSeguir = sessions.filter((s) => new Date(s.inicio).getTime() > t).slice(0, 6);
  return { agora, aSeguir };
}

// Banner "não perca": próxima sessão favoritada dentro da janela (default 90 min).
export function proximaFavorita(
  sessions: Session[],
  favoritos: Set<string>,
  janelaMin = 90,
  now = new Date(),
): Session | null {
  const t = now.getTime();
  const limite = t + janelaMin * 60 * 1000;
  const candidatas = sessions
    .filter((s) => favoritos.has(s.id))
    .filter((s) => {
      const ini = new Date(s.inicio).getTime();
      return ini > t && ini <= limite;
    })
    .sort((a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime());
  return candidatas[0] ?? null;
}

export function formatHora(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function formatDia(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
  });
}
