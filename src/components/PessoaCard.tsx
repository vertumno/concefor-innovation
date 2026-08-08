"use client";

// Cartão de uma pessoa do mosaico (tela Pessoas). Antes de conectar mostra só o
// primeiro nome; depois, o contato inteiro — cada dado com a ação natural dele
// (ligar, abrir o e-mail ou o Instagram) e um botão de copiar ao lado, porque
// no meio do evento a pessoa quer levar o dado embora, não navegar.

import { useEffect, useRef, useState } from "react";
import { corDe } from "@/components/Speakers";
import {
  contatoEmTexto,
  copiarTexto,
  instagramLink,
  salvarContato,
  telefoneFormatado,
  type Contato,
  whatsappLink,
} from "@/lib/contato";
import type { Participante } from "@/lib/db";

export function PessoaCard({
  pessoa,
  onFechar,
  onDesfeita,
}: {
  pessoa: Participante;
  onFechar: () => void;
  onDesfeita?: () => void;
}) {
  // Qual campo acabou de ser copiado (mostra o "copiado ✓" naquela linha).
  const [copiado, setCopiado] = useState<string | null>(null);
  const [falhou, setFalhou] = useState(false);
  const [desfazendo, setDesfazendo] = useState(false);
  const [erroDesfazer, setErroDesfazer] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  async function copiar(campo: string, texto: string) {
    const ok = await copiarTexto(texto);
    setFalhou(!ok);
    setCopiado(ok ? campo : null);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setCopiado(null);
      setFalhou(false);
    }, 2000);
  }

  // Desfazer remove a conexão PARA OS DOIS (decisão de 05/08) — daí o confirm.
  async function desfazer() {
    if (!confirm(`Desfazer a conexão com ${pessoa.nomeCompleto ?? pessoa.nome}? Ela some para vocês dois.`)) {
      return;
    }
    setDesfazendo(true);
    setErroDesfazer(null);
    try {
      const res = await fetch("/api/connect", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendeeId: pessoa.id }),
      });
      const data = await res.json().catch(() => null) as { ok?: boolean; error?: string } | null;
      if (!res.ok || data?.ok !== true) {
        setErroDesfazer(data?.error ?? "Não foi possível desfazer. Tente novamente.");
        return;
      }
      onDesfeita?.();
    } catch {
      setErroDesfazer("Sem conexão com o servidor — tente novamente.");
    } finally {
      setDesfazendo(false);
    }
  }

  const nome = pessoa.conectado ? (pessoa.nomeCompleto ?? pessoa.nome) : pessoa.nome;
  const contato: Contato = {
    nome,
    email: pessoa.email,
    telefone: pessoa.telefone,
    instagram: pessoa.instagram,
    categoria: pessoa.categoria,
  };
  const whatsapp = pessoa.telefone ? whatsappLink(pessoa.telefone) : null;
  const temContato = Boolean(pessoa.email || pessoa.telefone || pessoa.instagram);

  return (
    <div className="person-pop">
      <div className="person-pop-head">
        {pessoa.conectado && pessoa.foto ? (
          // eslint-disable-next-line @next/next/no-img-element -- foto externa (Even3)
          <img className="person-foto-sm" src={pessoa.foto} alt="" />
        ) : (
          <span
            className="speaker-avatar"
            style={{ background: pessoa.conectado ? corDe(nome) : "var(--surface-2)" }}
            aria-hidden
          >
            {pessoa.iniciais}
          </span>
        )}
        <div className="person-text">
          <span className="speaker-name">{nome}</span>
          {pessoa.conectado && pessoa.categoria && (
            <span className="person-chip">{pessoa.categoria}</span>
          )}
          {!pessoa.conectado && (
            <span className="speaker-inst">Conecte-se com essa pessoa para ver o contato.</span>
          )}
        </div>
        <button type="button" className="admin-btn admin-btn-sm" onClick={onFechar}>
          Fechar
        </button>
      </div>

      {pessoa.conectado && (
        <div className="contato-lista">
          {pessoa.email && (
            <LinhaContato
              icone={<IconeEmail />}
              rotulo="e-mail"
              texto={pessoa.email}
              href={`mailto:${pessoa.email}`}
              copiado={copiado === "email"}
              onCopiar={() => copiar("email", pessoa.email!)}
            />
          )}
          {pessoa.telefone && (
            <LinhaContato
              icone={<IconeTelefone />}
              rotulo="telefone"
              texto={telefoneFormatado(pessoa.telefone)}
              href={whatsapp}
              externo
              copiado={copiado === "telefone"}
              onCopiar={() => copiar("telefone", telefoneFormatado(pessoa.telefone!))}
            />
          )}
          {pessoa.instagram && (
            <LinhaContato
              icone={<IconeInstagram />}
              rotulo="Instagram"
              texto={`@${pessoa.instagram}`}
              href={instagramLink(pessoa.instagram)}
              externo
              copiado={copiado === "instagram"}
              onCopiar={() => copiar("instagram", `@${pessoa.instagram}`)}
            />
          )}
          {!temContato && (
            <p className="page-sub" style={{ margin: 0 }}>
              Essa pessoa não está compartilhando campos de contato no app.
            </p>
          )}

          <div className="contato-acoes">
            <button
              type="button"
              className="admin-btn admin-btn-sm"
              onClick={() => salvarContato(contato)}
            >
              Salvar nos contatos
            </button>
            <button
              type="button"
              className="admin-btn admin-btn-sm"
              onClick={() => copiar("tudo", contatoEmTexto(contato))}
            >
              {copiado === "tudo" ? "Copiado ✓" : "Copiar tudo"}
            </button>
          </div>
          {falhou && (
            <p className="q-erro" style={{ margin: 0 }}>
              Não consegui copiar por aqui — toque e segure o texto para copiar à mão.
            </p>
          )}

          <div className="connection-danger-zone">
            <button
              type="button"
              className="desfazer-conexao"
              onClick={desfazer}
              disabled={desfazendo}
            >
              {desfazendo ? "Desfazendo…" : "Desfazer conexão"}
            </button>
            {erroDesfazer && <p className="q-erro">{erroDesfazer}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function LinhaContato({
  icone,
  rotulo,
  texto,
  href,
  externo,
  copiado,
  onCopiar,
}: {
  icone: React.ReactNode;
  rotulo: string;
  texto: string;
  href: string | null;
  externo?: boolean;
  copiado: boolean;
  onCopiar: () => void;
}) {
  const conteudo = (
    <>
      <span className="contato-icone" aria-hidden>
        {icone}
      </span>
      <span className="contato-valor">{texto}</span>
    </>
  );

  return (
    <div className="contato-linha">
      {href ? (
        <a
          className="contato-alvo"
          href={href}
          aria-label={`${rotulo}: ${texto}`}
          {...(externo ? { target: "_blank", rel: "noreferrer" } : {})}
        >
          {conteudo}
        </a>
      ) : (
        <span className="contato-alvo">{conteudo}</span>
      )}
      <button
        type="button"
        className="contato-copiar"
        onClick={onCopiar}
        aria-label={`Copiar ${rotulo}`}
      >
        {copiado ? (
          <>
            <IconeCheck /> <span>copiado</span>
          </>
        ) : (
          <>
            <IconeCopiar /> <span>copiar</span>
          </>
        )}
      </button>
    </div>
  );
}

/* Ícones inline (nada de CDN: o app precisa abrir sem internet no evento). */

function IconeTelefone() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function IconeInstagram() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden>
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.06 1.17-.25 1.8-.42 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.59-.01-4.86-.07c-1.17-.06-1.82-.26-2.24-.42-.57-.22-.96-.48-1.38-.9-.42-.42-.69-.82-.9-1.38-.16-.42-.36-1.06-.42-2.23-.04-1.26-.06-1.65-.06-4.84s.02-3.59.06-4.86c.06-1.17.26-1.81.42-2.23.21-.57.48-.96.9-1.38.42-.42.81-.69 1.38-.9.42-.17 1.05-.36 2.22-.42 1.28-.05 1.65-.06 4.86-.06zM12 0C8.74 0 8.33.01 7.05.07c-1.28.06-2.15.26-2.91.56-.79.31-1.46.72-2.13 1.38C1.35 2.68.94 3.35.63 4.14c-.3.76-.5 1.63-.56 2.91C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.28.26 2.15.56 2.91.31.79.72 1.46 1.38 2.13.67.67 1.34 1.08 2.13 1.38.76.3 1.63.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.28-.06 2.15-.26 2.91-.56.79-.31 1.46-.72 2.13-1.38.67-.67 1.08-1.34 1.38-2.13.3-.76.5-1.63.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.28-.26-2.15-.56-2.91-.31-.79-.72-1.46-1.38-2.13-.67-.67-1.34-1.08-2.13-1.38-.76-.3-1.63-.5-2.91-.56C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm7.85-10.41a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z" />
    </svg>
  );
}

function IconeEmail() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="2.5" y="5" width="19" height="14" rx="2" />
      <path d="m3 6.5 9 6.5 9-6.5" />
    </svg>
  );
}

function IconeCopiar() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h8" />
    </svg>
  );
}

function IconeCheck() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <path d="m4 12.5 5 5L20 6" />
    </svg>
  );
}
