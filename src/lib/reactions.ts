// Reações da sessão ao vivo (E2/E3). Conjunto FECHADO — emoji + rótulo em texto
// (o rótulo aparece na UI e no telão, para não depender de decodificar o emoji).
// Fonte ÚNICA para a UI, a API e a agregação: quem valida no servidor e quem
// desenha os botões olham para cá. Módulo isomórfico (sem dependências de node).

export const REACTIONS = [
  { kind: "adorei", emoji: "❤️", label: "Adorei" },
  { kind: "parabens", emoji: "👏", label: "Parabéns" },
  { kind: "uau", emoji: "🤩", label: "Uau!" },
  { kind: "nossa", emoji: "😮", label: "Nossa!" },
  { kind: "triste", emoji: "😢", label: "Que triste" },
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
