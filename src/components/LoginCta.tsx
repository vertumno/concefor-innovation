"use client";

// CTA de login das interações: anônimo vê o conteúdo, mas reagir/perguntar/
// votar exige entrar com o ingresso (decisão de 05/08). Nasceu de feedback:
// links soltos herdavam a cor padrão de <a> (roxo de visitado) e sumiam no navy.
import Link from "next/link";
import type { ReactNode } from "react";

export function LoginCta({ children }: { children: ReactNode }) {
  return (
    <p className="login-cta">
      <span>{children}</span>
      <Link href="/entrar" className="login-cta-btn">
        Entrar
      </Link>
    </p>
  );
}
