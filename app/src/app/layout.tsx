import type { Metadata, Viewport } from "next";
import { Oswald, Inter } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { DemoBar } from "@/components/DemoBar";
import "./tokens.css";
import "./globals.css";

// Identidade Concefor: títulos em Oswald (display), corpo em Inter.
// As variáveis viram tokens --font-title / --font-text em tokens.css.
const oswald = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-oswald",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VIII Concefor",
  description: "Programação, reações ao vivo e a sua linha do tempo do VIII Concefor.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Concefor" },
};

export const viewport: Viewport = {
  themeColor: "#102A5C",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${oswald.variable} ${inter.variable}`}>
      <body>
        <div className="app-shell">
          <header className="topbar">
            <Link href="/" className="brand" aria-label="VIII Concefor — início">
              {/* Selo 20 anos (acento). Versão branca: manual manda mono sobre fundo colorido. */}
              <Image
                className="brand-selo"
                src="/selo-20-anos-branco.png"
                alt="Selo 20 anos do Cefor"
                width={2938}
                height={2149}
                priority
              />
              <span className="brand-word">
                VIII <strong>Concefor</strong>
              </span>
            </Link>
            {/* R1: a navegação desceu pra barra inferior (BottomNav, spec §4.0).
                Quando o login existir (R7), o avatar do participante entra aqui. */}
          </header>
          <DemoBar />
          <main className="content">{children}</main>
          {/* O Telão responde em /telao (projetor) e o /admin por token — ambos
              fora da navegação (spec §4.0); o telão cobre a barra (z-index). */}
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
