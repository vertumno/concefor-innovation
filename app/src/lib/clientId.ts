// Identidade anônima e persistente do dispositivo (sem PII — ver decisoes.md, 25/06).
// A partir só do id deriva-se um "avatar" estável (animal + cor), no estilo dos
// anônimos consistentes do Google Docs. Identifica sem saber quem é a pessoa.

const KEY = "concefor:client_id";

const ANIMAIS = [
  "raposa", "coruja", "tatu", "onça", "arara", "lobo",
  "tucano", "capivara", "jaguar", "sabiá", "lontra", "bemtevi",
];
const CORES = [
  "#E4572E", "#F3A712", "#3C91E6", "#2A9D8F", "#9B5DE5",
  "#F15BB5", "#00BBF9", "#06D6A0", "#FF8C42", "#7B61FF",
];

export function getClientId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function getAvatar(id: string): { animal: string; cor: string } {
  const h = hash(id);
  return { animal: ANIMAIS[h % ANIMAIS.length], cor: CORES[h % CORES.length] };
}
