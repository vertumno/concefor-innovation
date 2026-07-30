// Reações da sessão ao vivo (E2/E3). Conjunto FECHADO — ícone + rótulo em texto
// (o rótulo aparece na UI e no telão, para não depender de decodificar o emoji).
// Fonte ÚNICA para a UI, a API e a agregação: quem valida no servidor e quem
// desenha os botões olham para cá. Módulo isomórfico (sem dependências de node).
//
// A ORDEM é a da tela e sobe em intensidade: gostei → me tocou → é sobre mim →
// vou agir → mudou tudo. `labelRelatorio` é o nome institucional: o relatório
// fica arquivado e a gíria envelhece. Fundamentação: decisoes.md (2026-07-30).
//
// "amei" usa o CARACTERE ♥ (U+2665) + seletor de texto (U+FE0E), não o emoji
// ❤️ — assim ele herda a cor do CSS (ciano da marca; teal escuro na impressão).

export const REACTIONS = [
  { kind: "massa", emoji: "👏", label: "Que massa", labelRelatorio: "Satisfação" },
  { kind: "amei", emoji: "\u2665\uFE0E", label: "Amei", labelRelatorio: "Afeto" },
  { kind: "identifico", emoji: "🙋", label: "Me identifico", labelRelatorio: "Relevância" },
  { kind: "usar", emoji: "✅", label: "Vou usar", labelRelatorio: "Intenção de aplicação" },
  { kind: "explodiu", emoji: "🤯", label: "Explodiu a mente", labelRelatorio: "Aprendizagem" },
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
