// Tipos do modelo de dados (ver spec/app-v1.md §3 e app/db/schema.sql).

export type Session = {
  id: string;
  titulo: string;
  descricao: string | null;
  sala: string | null;
  eixo: string | null;
  palestrante: string | null; // resumo textual (fallback); detalhe vem de speakers
  speakerIds?: string[]; // ids dos palestrantes estruturados (ver Speaker)
  speakers?: Speaker[]; // palestrantes já resolvidos (a API e o demo embutem)
  inicio: string; // ISO-8601 com offset
  fim: string | null;
};

// Palestrante como entidade estruturada (não só texto). bio/foto ficam prontos
// para preencher — não inventamos dados de pessoas reais.
export type Speaker = {
  id: string;
  nome: string;
  titulo: string | null; // "Profa. Dra.", "Prof. Dr.", "Dra." …
  instituicao: string | null;
  bio: string | null;
  foto: string | null; // URL da foto, quando houver
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
