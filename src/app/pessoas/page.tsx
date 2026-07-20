"use client";

// Pessoas — palestrantes (bio/foto quando houver) + o MAPA DE BOLINHAS dos
// participantes (ideia de 20/07): cada inscrito é uma bolinha apagada; conectar
// (QR do crachá ou nº do ingresso) acende a bolinha. Contato completo só das
// suas conexões — as mais recentes primeiro. Alusão ao mosaico do selo 20 anos.

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { corDe, iniciais } from "@/components/Speakers";
import { ConnectDialog } from "@/components/ConnectDialog";
import { fetchSpeakers } from "@/lib/speakers";
import { getClientId } from "@/lib/clientId";
import type { Participante } from "@/lib/db";
import type { Speaker } from "@/lib/types";

type Mapa = {
  logado: boolean;
  total: number;
  conexoes: number;
  participantes: Participante[];
};

export default function PessoasPage() {
  const [speakers, setSpeakers] = useState<Speaker[] | null>(null);
  const [mapa, setMapa] = useState<Mapa | null>(null);
  const [conectando, setConectando] = useState(false);
  const [selecionado, setSelecionado] = useState<Participante | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const refreshMapa = useCallback(() => {
    fetch(`/api/participantes?clientId=${encodeURIComponent(getClientId())}`)
      .then((r) => r.json())
      .then(setMapa)
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchSpeakers().then(setSpeakers);
    refreshMapa();
  }, [refreshMapa]);

  if (speakers === null) return <p className="page-sub">Carregando…</p>;

  return (
    <>
      <h1 className="page-title">Pessoas</h1>
      <p className="page-sub">Quem faz o VIII Concefor acontecer.</p>

      <div className="section-label">Participantes</div>
      {mapa === null ? (
        <p className="page-sub">Carregando…</p>
      ) : (
        <>
          <p className="page-sub" style={{ marginBottom: 10 }}>
            {mapa.total} pessoas no evento
            {mapa.logado ? ` · você se conectou com ${mapa.conexoes}` : ""}. Cada quadradinho
            é alguém — conecte-se e acenda o seu mosaico.
          </p>

          {mapa.logado ? (
            <button type="button" className="home-cta" onClick={() => setConectando(true)}>
              ＋ Conectar (QR do crachá ou nº do ingresso)
            </button>
          ) : (
            <div className="notice" style={{ marginBottom: 12 }}>
              <Link href="/entrar">Entre com sua inscrição</Link> para se conectar com as
              pessoas e montar o seu mapa.
            </div>
          )}

          {conectando && (
            <ConnectDialog
              onClose={() => setConectando(false)}
              onDone={(r) => {
                setConectando(false);
                setAviso(
                  r.nova
                    ? `Você se conectou com ${r.pessoa.nome}!`
                    : `Você já estava conectado com ${r.pessoa.nome}.`,
                );
                refreshMapa();
              }}
            />
          )}

          {aviso && <div className="connect-ok">{aviso}</div>}

          {selecionado && (
            <div className="person-pop">
              <span
                className="speaker-avatar"
                style={{ background: selecionado.conectado ? corDe(selecionado.nomeCompleto ?? selecionado.nome) : "var(--surface-2)" }}
                aria-hidden
              >
                {selecionado.iniciais}
              </span>
              <div className="person-text">
                <span className="speaker-name">
                  {selecionado.conectado ? selecionado.nomeCompleto : selecionado.nome}
                </span>
                {selecionado.conectado ? (
                  selecionado.email && (
                    <a className="speaker-inst" href={`mailto:${selecionado.email}`}>
                      {selecionado.email}
                    </a>
                  )
                ) : (
                  <span className="speaker-inst">
                    Conecte-se com essa pessoa para ver o contato.
                  </span>
                )}
              </div>
              <button
                type="button"
                className="admin-btn admin-btn-sm"
                onClick={() => setSelecionado(null)}
              >
                Fechar
              </button>
            </div>
          )}

          <div className="dots" role="list" aria-label="Mapa de participantes">
            {mapa.participantes.map((p) => (
              <button
                key={p.id}
                type="button"
                role="listitem"
                className={`dot ${p.conectado ? "dot-on" : ""}`}
                style={p.conectado ? { background: corDe(p.nomeCompleto ?? p.nome) } : undefined}
                aria-label={p.conectado ? `${p.nomeCompleto} (conexão)` : p.nome}
                onClick={() => setSelecionado(p)}
              >
                {p.iniciais}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="section-label">Palestrantes</div>
      {speakers.length === 0 ? (
        <div className="empty">
          Os palestrantes entram aqui em breve — junto com a programação oficial.
        </div>
      ) : (
        <ul className="people">
          {speakers.map((p) => (
            <li key={p.id} className="person">
              {p.foto ? (
                // eslint-disable-next-line @next/next/no-img-element -- foto externa (Even3), domínio ainda não fixado
                <img className="person-foto" src={p.foto} alt="" />
              ) : (
                <span className="speaker-avatar" style={{ background: corDe(p.nome) }} aria-hidden>
                  {iniciais(p.nome)}
                </span>
              )}
              <div className="person-text">
                <span className="speaker-name">
                  {p.titulo ? `${p.titulo} ` : ""}
                  {p.nome}
                </span>
                {p.instituicao && <span className="speaker-inst">{p.instituicao}</span>}
                {p.bio && <p className="person-bio">{p.bio}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
