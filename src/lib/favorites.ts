// "Minha programação": favoritos guardados no dispositivo (v1, anônimo — ver
// decisoes.md, 25/06). Sem login, sem backend. É a linha do tempo pessoal que o
// participante leva pra casa.

const KEY = "concefor:favorites";

export function getFavorites(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY) ?? "[]") as string[]);
  } catch {
    return new Set();
  }
}

export function toggleFavorite(id: string): Set<string> {
  const favs = getFavorites();
  if (favs.has(id)) favs.delete(id);
  else favs.add(id);
  localStorage.setItem(KEY, JSON.stringify([...favs]));
  return favs;
}
