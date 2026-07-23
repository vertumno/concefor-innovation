"use client";

// Login pelo crachá (R7): nº do ingresso + 4 primeiros dígitos do CPF, com
// consentimento explícito (LGPD). Navegar segue aberto sem login; quem entra
// ganha identidade (avatar no topo; reações/perguntas associadas no relatório
// interno). Texto do termo a validar com a organização antes do lançamento.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { getClientId } from "@/lib/clientId";

type Me = { logado: boolean; nome?: string; checkinCode?: string | null };

export default function EntrarPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [codigo, setCodigo] = useState("");
  const [cpf4, setCpf4] = useState("");
  const [consent, setConsent] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/me?clientId=${encodeURIComponent(getClientId())}`)
      .then((r) => r.json())
      .then(setMe)
      .catch(() => setMe({ logado: false }));
  }, []);

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
          cpf4,
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
    await fetch(`/api/me?clientId=${encodeURIComponent(getClientId())}`, { method: "DELETE" });
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
          <div className="myqr">
            <div className="section-label">Meu QR</div>
            {/* eslint-disable-next-line @next/next/no-img-element -- data URL gerada localmente */}
            <img src={qr} alt={`QR do seu ingresso (${me.checkinCode})`} className="myqr-img" />
            <p className="page-sub">
              Nº do ingresso: <strong>{me.checkinCode}</strong>. Quem escanear este código em{" "}
              Pessoas → Conectar vira uma conexão sua no evento.
            </p>
          </div>
        )}

        <button type="button" className="admin-btn" onClick={sair}>
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
          4 primeiros dígitos do seu CPF
          <input
            inputMode="numeric"
            autoComplete="off"
            type="password"
            maxLength={4}
            placeholder="••••"
            value={cpf4}
            onChange={(e) => setCpf4(e.target.value)}
          />
        </label>

        <label className="login-consent">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />
          <span>
            Aceito que minhas interações no app (reações e perguntas) sejam associadas à minha
            inscrição para fins do relatório interno do evento. Nada é publicado com meu nome no
            app ou no telão. Os dados da inscrição ficam no servidor do Cefor e posso me
            desconectar quando quiser.
          </span>
        </label>

        {erro && <p className="q-erro">{erro}</p>}

        <button type="submit" className="login-btn" disabled={sending || !consent}>
          {sending ? "Entrando…" : "Entrar"}
        </button>
        <p className="login-skip">
          Prefere não se identificar? Você continua usando a programação, os favoritos e as
          informações do evento normalmente — mas as interações mais ricas, como se conectar
          com outros participantes, dependem de identificação.
        </p>
      </form>
    </>
  );
}
