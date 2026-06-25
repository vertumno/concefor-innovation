// Tipos do modelo de dados (ver spec/app-v1.md §3 e app/supabase/schema.sql).

export type Session = {
  id: string;
  titulo: string;
  descricao: string | null;
  sala: string | null;
  eixo: string | null;
  palestrante: string | null;
  inicio: string; // ISO timestamptz
  fim: string | null;
};

export type ReactionKind = "heart" | "clap" | "like" | "down";

// Todo registro da linha do tempo. No v1 só usamos tipo='reaction'.
export type TimelineEvent = {
  id: string;
  tipo: string; // 'reaction' | 'checkin' | ... (extensível na fase 2)
  session_id: string | null;
  ts: string;
  payload: Record<string, unknown>;
  client_id: string | null;
};
