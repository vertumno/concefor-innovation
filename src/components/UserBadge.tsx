"use client";

// Avatar/inicial do participante no topo direito (padrão EDEN, spec §4.0).
// Deslogado: link "Entrar". Logado: inicial em círculo (cor estável derivada
// do nome). Clica → /entrar (lá dá pra ver quem é e sair).

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { corDe } from "@/components/Speakers";
import { getClientId } from "@/lib/clientId";

type Me = { logado: boolean; nome?: string };

export function UserBadge() {
  const [me, setMe] = useState<Me>({ logado: false });

  const refresh = useCallback(() => {
    fetch(`/api/me?clientId=${encodeURIComponent(getClientId())}`)
      .then((r) => r.json())
      .then(setMe)
      .catch(() => {});
  }, []);

  useEffect(() => {
    refresh();
    // O /entrar dispara este evento após login/logout (o layout não remonta).
    window.addEventListener("concefor:auth", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("concefor:auth", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [refresh]);

  if (!me.logado || !me.nome) {
    return (
      <Link href="/entrar" className="user-badge-login">
        Entrar
      </Link>
    );
  }

  return (
    <Link
      href="/entrar"
      className="user-badge"
      aria-label={`Conectado como ${me.nome} — perfil`}
      style={{ background: corDe(me.nome) }}
    >
      {me.nome[0].toUpperCase()}
    </Link>
  );
}
