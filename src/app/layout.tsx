import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "VIII Concefor",
  description: "Programação, reações ao vivo e a sua linha do tempo do VIII Concefor.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Concefor" },
};

export const viewport: Viewport = {
  themeColor: "#13123A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="app-shell">
          <header className="topbar">
            <Link href="/" className="brand">
              VIII <strong>Concefor</strong>
            </Link>
            <nav className="topnav">
              <Link href="/timeline">Programação</Link>
              <Link href="/telao">Telão</Link>
            </nav>
          </header>
          <main className="content">{children}</main>
        </div>
      </body>
    </html>
  );
}
