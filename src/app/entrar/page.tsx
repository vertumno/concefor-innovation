"use client";

// Login pelo crachá (R7): nº do ingresso + 4 primeiros dígitos do CPF ou o
// e-mail da inscrição, com consentimento (LGPD). Navegar segue sem login; quem entra
// ganha identidade (avatar no topo; reações/perguntas associadas no relatório
// interno). Texto do termo a validar com a organização antes do lançamento.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { getClientId } from "@/lib/clientId";

type Me = {
  logado: boolean;
  nome?: string;
  checkinCode?: string | null;
  telefone?: string | null;
  instagram?: string | null;
  shareEmail?: boolean;
  shareTelefone?: boolean;
  shareInstagram?: boolean;
};

export default function EntrarPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [codigo, setCodigo] = useState("");
  const [segundoFator, setSegundoFator] = useState("");
  const [consent, setConsent] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [qr, setQr] = useState<string | null>(null);
  // Contato para conexões (preenchido pela própria pessoa, opcional).
  const [telefone, setTelefone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [shareEmail, setShareEmail] = useState(false);
  const [shareTelefone, setShareTelefone] = useState(false);
  const [shareInstagram, setShareInstagram] = useState(false);
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);
  const [perfilMsg, setPerfilMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((m: Me) => {
        setMe(m);
        setTelefone(m.telefone ?? "");
        setInstagram(m.instagram ?? "");
        setShareEmail(Boolean(m.shareEmail));
        setShareTelefone(Boolean(m.shareTelefone));
        setShareInstagram(Boolean(m.shareInstagram));
      })
      .catch(() => setMe({ logado: false }));
  }, []);

  async function salvarPerfil(e: React.FormEvent) {
    e.preventDefault();
    if (salvandoPerfil) return;
    setSalvandoPerfil(true);
    setPerfilMsg(null);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telefone,
          instagram,
          shareEmail,
          shareTelefone,
          shareInstagram,
        }),
      });
      const data = (await res.json()) as {
        telefone?: string | null;
        instagram?: string | null;
        shareEmail?: boolean;
        shareTelefone?: boolean;
        shareInstagram?: boolean;
        error?: string;
      };
      if (!res.ok) {
        setPerfilMsg(data.error ?? "não foi possível salvar");
      } else {
        setTelefone(data.telefone ?? "");
        setInstagram(data.instagram ?? "");
        setShareEmail(Boolean(data.shareEmail));
        setShareTelefone(Boolean(data.shareTelefone));
        setShareInstagram(Boolean(data.shareInstagram));
        setPerfilMsg(
          data.shareEmail || data.shareTelefone || data.shareInstagram
            ? "Preferências salvas — suas conexões veem somente os campos autorizados."
            : "Preferências salvas — nenhum contato está sendo compartilhado.",
        );
      }
    } catch {
      setPerfilMsg("sem conexão — tente de novo");
    } finally {
      setSalvandoPerfil(false);
    }
  }

  // "Meu QR": o nº do ingresso como QR — quem escanear se conecta com você.
  useEffect(() => {
    if (me?.logado && me.checkinCode) {
      QRCode.toDataURL(me.checkinCode, {
        width: 220,
        margin: 1,
        color: { dark: "#102a5c", light: "#ffffff" },
      })
        .then(setQr)
        .catch(() => {});
    } else {
      setQr(null);
    }
  }, [me]);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setErro(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkinCode: codigo,
          segundoFator,
          clientId: getClientId(),
          consent,
        }),
      });
      const data = (await res.json()) as { nome?: string; error?: string };
      if (!res.ok) {
        setErro(data.error ?? "não foi possível entrar");
      } else {
        window.dispatchEvent(new Event("concefor:auth"));
        router.push("/");
      }
    } catch {
      setErro("sem conexão — tente de novo");
    } finally {
      setSending(false);
    }
  }

  async function sair() {
    await fetch("/api/me", { method: "DELETE" });
    window.dispatchEvent(new Event("concefor:auth"));
    setMe({ logado: false });
  }

  if (me === null) return <p className="page-sub">Carregando…</p>;

  if (me.logado) {
    return (
      <>
        <h1 className="page-title">Você está conectado</h1>
        <p className="page-sub">
          Olá, <strong>{me.nome}</strong>! Suas interações contam para o relatório do evento.
        </p>

        {qr && (
          <section className="login-sec">
            <div className="section-label">Meu QR</div>
            {/* eslint-disable-next-line @next/next/no-img-element -- data URL gerada localmente */}
            <img src={qr} alt={`QR do seu ingresso (${me.checkinCode})`} className="myqr-img" />
            <p className="login-nota">
              Nº do ingresso: <strong>{me.checkinCode}</strong>. Quando alguém escanear este
              código em Pessoas → Conectar, vocês dois ficam conectados no evento.
            </p>
          </section>
        )}

        <section className="login-sec">
          <div className="section-label">Meu contato para conexões</div>
          <p className="login-nota">
            Você escolhe, campo por campo, o que deseja compartilhar quando trocar contato.
            Nada fica visível sem o seu aceite abaixo.
          </p>
          <form onSubmit={salvarPerfil} className="login-form">
            <label className="profile-share">
              <input
                type="checkbox"
                checked={shareEmail}
                onChange={(e) => setShareEmail(e.target.checked)}
              />
              <span>Desejo compartilhar meu e-mail da inscrição ao trocar contato.</span>
            </label>
            <label className="login-label">
              Telefone / WhatsApp
              <input
                inputMode="tel"
                autoComplete="tel"
                placeholder="Ex.: 27 99999-9999"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
              />
            </label>
            <label className="profile-share">
              <input
                type="checkbox"
                checked={shareTelefone}
                disabled={!telefone.trim()}
                onChange={(e) => setShareTelefone(e.target.checked)}
              />
              <span>Desejo compartilhar este WhatsApp ao trocar contato.</span>
            </label>
            <label className="login-label">
              Instagram
              <input
                autoComplete="off"
                placeholder="@seu.usuario"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
              />
            </label>
            <label className="profile-share">
              <input
                type="checkbox"
                checked={shareInstagram}
                disabled={!instagram.trim()}
                onChange={(e) => setShareInstagram(e.target.checked)}
              />
              <span>Desejo compartilhar este Instagram ao trocar contato.</span>
            </label>
            {perfilMsg && <p className="login-msg">{perfilMsg}</p>}
            <button type="submit" className="login-btn" disabled={salvandoPerfil}>
              {salvandoPerfil ? "Salvando…" : "Salvar contato"}
            </button>
          </form>
        </section>

        <button type="button" className="admin-btn login-sair" onClick={sair}>
          Sair (desconectar este aparelho)
        </button>
      </>
    );
  }

  return (
    <>
      <h1 className="page-title">Entrar</h1>
      <p className="page-sub">Identifique-se com os dados da sua inscrição no evento.</p>

      <form onSubmit={entrar} className="login-form">
        <label className="login-label">
          Nº do ingresso (8 dígitos)
          <input
            inputMode="numeric"
            autoComplete="off"
            placeholder="Ex.: 12345678"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
          />
          <small>Está no seu crachá e no e-mail de confirmação da inscrição (Even3).</small>
        </label>

        <label className="login-label">
          4 primeiros dígitos do CPF ou o e-mail da inscrição
          <input
            autoComplete="off"
            placeholder="Ex.: 1234 ou voce@email.com"
            value={segundoFator}
            onChange={(e) => setSegundoFator(e.target.value)}
          />
          <small>
            Nem todo cadastro do Even3 tem CPF — nesses casos, use o e-mail com que você se
            inscreveu.
          </small>
        </label>

        <label className="login-consent">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />
          <span>
            Aceito que minhas reações, votos e perguntas sejam associados à minha inscrição para
            o relatório interno do evento. Minhas perguntas aparecem com meu nome completo no app
            e no telão. Meus dados ficam no servidor do Cefor; os campos de contato só são
            compartilhados quando eu autorizar cada um no perfil.
          </span>
        </label>

        {erro && <p className="q-erro">{erro}</p>}

        <button type="submit" className="login-btn" disabled={sending || !consent}>
          {sending ? "Entrando…" : "Entrar"}
        </button>
        <p className="login-skip">
          Prefere não se identificar? Você continua usando a programação, os favoritos e as
          informações do evento normalmente. Reagir, perguntar, votar e trocar contatos dependem
          da identificação pelo ingresso.
        </p>
      </form>
    </>
  );
}
