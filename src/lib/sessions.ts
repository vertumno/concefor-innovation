import { DEMO_MODE, getDemoSessions } from "./demoData";
import { getNow } from "./clock";
import type { Session } from "./types";

const UMA_HORA = 60 * 60 * 1000;

export async function fetchSessions(): Promise<Session[]> {
  // Modo demonstração: dados fictícios, sem backend (ver demoData.ts).
  if (DEMO_MODE) return getDemoSessions();
  // Dados reais: backend próprio (SQLite via /api/sessions — ver lib/db.ts).
  try {
    const res = await fetch("/api/sessions");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as Session[];
  } catch (err) {
    // Não silenciamos: a tela mostra estado vazio, mas o erro fica visível no console.
    console.error("Erro ao carregar sessões:", err);
    return [];
  }
}

function fimDe(s: Session): number {
  const ini = new Date(s.inicio).getTime();
  return s.fim ? new Date(s.fim).getTime() : ini + UMA_HORA;
}

// "Agora" (em andamento) e "A seguir" (próximas), a partir do instante atual.
export function splitNowNext(sessions: Session[], now = getNow()) {
  const t = now.getTime();
  const agora = sessions.filter((s) => new Date(s.inicio).getTime() <= t && t < fimDe(s));
  const aSeguir = sessions.filter((s) => new Date(s.inicio).getTime() > t).slice(0, 6);
  return { agora, aSeguir };
}

export type SessionStatus = "past" | "live" | "future";

// Estado da sessão em relação ao instante atual (espinha da linha do tempo).
export function sessionStatus(s: Session, now = getNow()): SessionStatus {
  const t = now.getTime();
  const ini = new Date(s.inicio).getTime();
  if (t >= fimDe(s)) return "past";
  if (t >= ini) return "live";
  return "future";
}

// Fração decorrida de uma sessão em andamento (0..1) — alimenta a barra de tempo.
export function sessionProgress(s: Session, now = getNow()): number {
  const ini = new Date(s.inicio).getTime();
  const fim = fimDe(s);
  const t = now.getTime();
  if (t <= ini) return 0;
  if (t >= fim) return 1;
  return (t - ini) / (fim - ini);
}

// Minutos até o início (negativo se já começou).
export function minutesUntilStart(s: Session, now = getNow()): number {
  return Math.round((new Date(s.inicio).getTime() - now.getTime()) / 60000);
}

// "agora", "em 5 min", "em 2 h 10", "em 28 d 2 h" — rótulo curto de tempo relativo.
// Acima de 24h mostra dias+horas ("674 h" não diz nada — feedback de 20/07).
export function humanizeDelta(min: number): string {
  if (min === 0) return "agora";
  const abs = Math.abs(min);
  let label: string;
  if (abs < 60) label = `${abs} min`;
  else if (abs < 24 * 60) {
    const h = Math.floor(abs / 60);
    const m = abs % 60;
    label = m ? `${h} h ${m}` : `${h} h`;
  } else {
    const d = Math.floor(abs / (24 * 60));
    const h = Math.floor((abs % (24 * 60)) / 60);
    label = h ? `${d} d ${h} h` : `${d} d`;
  }
  return min > 0 ? `em ${label}` : `há ${label}`;
}

// Banner "não perca": próxima sessão favoritada dentro da janela (default 90 min).
export function proximaFavorita(
  sessions: Session[],
  favoritos: Set<string>,
  janelaMin = 90,
  now = getNow(),
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

// "19h00" — hora no estilo brasileiro, herói do timestamp visual.
export function formatHoraH(iso: string): string {
  const d = new Date(iso);
  return `${d.getHours()}h${String(d.getMinutes()).padStart(2, "0")}`;
}

// "19h00–20h00" (ou só o início se não houver fim).
export function formatRange(inicio: string, fim: string | null): string {
  return fim ? `${formatHoraH(inicio)}–${formatHoraH(fim)}` : formatHoraH(inicio);
}

export function formatDia(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
  });
}

// "SEG · 17 AGO" — etiqueta curta de dia (eyebrow do nó temporal).
export function formatDiaCurto(iso: string): string {
  const d = new Date(iso);
  const wd = d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "").toUpperCase();
  const mon = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "").toUpperCase();
  return `${wd} · ${d.getDate()} ${mon}`;
}
