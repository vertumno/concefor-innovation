export const POLL_RESPONSE_MAX = 150;
export const POLL_QUESTION_MAX = 180;
export const POLL_COOLDOWN_SECONDS = 5;

export const DEFAULT_STOPWORDS = [
  "a",
  "ao",
  "aos",
  "as",
  "com",
  "como",
  "da",
  "das",
  "de",
  "do",
  "dos",
  "e",
  "é",
  "em",
  "essa",
  "esse",
  "esta",
  "este",
  "eu",
  "foi",
  "mais",
  "mas",
  "na",
  "nas",
  "no",
  "nos",
  "o",
  "os",
  "ou",
  "para",
  "por",
  "que",
  "se",
  "sem",
  "um",
  "uma",
];

export type PollMode = "cloud" | "list";
export type PollStatus = "active" | "closed";
export type PollResponseStatus = "pending" | "approved" | "hidden";

export type PollResponse = {
  id: string;
  texto: string;
  autor?: string;
  ts: string;
  status: PollResponseStatus;
};

export type Poll = {
  id: string;
  sessionId: string;
  sessionTitle: string;
  question: string;
  status: PollStatus;
  mode: PollMode;
  stopwords: string[];
  ts: string;
  responses: PollResponse[];
  myResponses?: number;
};

export function normalizeStopwords(value: unknown): string[] {
  const input = Array.isArray(value)
    ? value.filter((x): x is string => typeof x === "string").join(",")
    : typeof value === "string"
      ? value
      : "";
  const words = input
    .toLocaleLowerCase("pt-BR")
    .split(/[\s,;]+/u)
    .map((w) => w.trim())
    .filter(Boolean);
  return [...new Set(words.length ? words : DEFAULT_STOPWORDS)];
}

export function wordFrequencies(
  responses: Pick<PollResponse, "texto">[],
  stopwords: string[],
): { word: string; count: number }[] {
  const ignored = new Set(normalizeStopwords(stopwords));
  const counts = new Map<string, number>();
  for (const response of responses) {
    // Uma palavra conta no máximo uma vez por resposta. Participantes diferentes
    // continuam somando frequência, mas repetir a mesma palavra no mesmo texto
    // não infla artificialmente a nuvem.
    const words = new Set(
      response.texto
        .normalize("NFC")
        .toLocaleLowerCase("pt-BR")
        .replace(/[^\p{L}\p{N}\s-]/gu, " ")
        .split(/[\s-]+/u)
        .filter((word) => word.length > 1 && !ignored.has(word)),
    );
    for (const word of words) counts.set(word, (counts.get(word) ?? 0) + 1);
  }
  return [...counts]
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word, "pt-BR"))
    .slice(0, 60);
}

// O tamanho e a posição de cada palavra na nuvem ficam em @/lib/wordcloud: o
// resultado depende do espaço livre na tela, não só da contagem daqui.
