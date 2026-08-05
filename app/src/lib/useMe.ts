"use client";

// Identidade do aparelho para a UI (R7): { logado, nome (primeiro) } via /api/me.
// null = ainda carregando — componentes tratam como "não sei" (sem CTA piscando).
// Fonte única para os componentes que gateiam interação por login (decisão de
// 05/08: reagir/perguntar/votar só logado; anônimo vê o que é público).

import { useEffect, useState } from "react";
import { getClientId } from "./clientId";

export type Me = { logado: boolean; nome?: string };

export function useMe(): Me | null {
  const [me, setMe] = useState<Me | null>(null);
  useEffect(() => {
    fetch(`/api/me?clientId=${encodeURIComponent(getClientId())}`)
      .then((r) => r.json())
      .then((d: { logado?: boolean; nome?: string }) =>
        setMe({ logado: Boolean(d.logado), nome: d.nome }),
      )
      .catch(() => setMe({ logado: false }));
  }, []);
  return me;
}
