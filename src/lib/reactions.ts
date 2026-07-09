// Reações da sessão ao vivo (E2). Conjunto FECHADO — positivo e simples
// (o brainstorm pediu joinha/coração). Fonte ÚNICA para a UI, a API e a
// agregação: quem valida no servidor e quem desenha os botões olham para cá.
// Módulo isomórfico (sem dependências de node) — importável no cliente e no servidor.

export const REACTIONS = [
  { kind: "heart", emoji: "❤️", label: "Amei" },
  { kind: "clap", emoji: "👏", label: "Aplausos" },
  { kind: "like", emoji: "👍", label: "Curti" },
] as const;

export type ReactionKind = (typeof REACTIONS)[number]["kind"];

export const REACTION_KINDS: ReactionKind[] = REACTIONS.map((r) => r.kind);

export function isReactionKind(x: unknown): x is ReactionKind {
  return typeof x === "string" && (REACTION_KINDS as string[]).includes(x);
}

// Contagem agregada por tipo de reação (todas as chaves sempre presentes).
export type ReactionCounts = Record<ReactionKind, number>;

export function emptyCounts(): ReactionCounts {
  return REACTIONS.reduce((acc, r) => ({ ...acc, [r.kind]: 0 }), {} as ReactionCounts);
}
