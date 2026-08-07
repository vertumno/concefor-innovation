"use client";

// Cartão de uma pessoa do mosaico (tela Pessoas). Antes de conectar mostra só o
// primeiro nome; depois, o contato inteiro — cada dado com a ação natural dele
// (abrir o WhatsApp, o e-mail, o Instagram) e um botão de copiar ao lado, porque
// no meio do evento a pessoa quer levar o dado embora, não navegar.

import { useEffect, useRef, useState } from "react";
import { corDe } from "@/components/Speakers";
import {
  contatoEmTexto,
  copiarTexto,
  instagramLink,
  salvarContato,
  telefoneFormatado,
  whatsappLink,
  type Contato,
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
    try {
      const res = await fetch("/api/connect", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendeeId: pessoa.id }),
      });
      if (res.ok) onDesfeita?.();
    } catch {
      /* rede oscilou: o card continua aberto e a pessoa tenta de novo */
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
  const wa = pessoa.telefone ? whatsappLink(pessoa.telefone) : null;
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
              icone={<IconeWhatsApp />}
              rotulo="WhatsApp"
              destaque
              texto={telefoneFormatado(pessoa.telefone)}
              href={wa}
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

          <button type="button" className="desfazer-conexao" onClick={desfazer}>
            Desfazer conexão
          </button>
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
  destaque,
  copiado,
  onCopiar,
}: {
  icone: React.ReactNode;
  rotulo: string;
  texto: string;
  href: string | null;
  externo?: boolean;
  destaque?: boolean;
  copiado: boolean;
  onCopiar: () => void;
}) {
  const conteudo = (
    <>
      <span className={`contato-icone ${destaque ? "contato-icone-wa" : ""}`} aria-hidden>
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

function IconeWhatsApp() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
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
