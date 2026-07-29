"use client";

// /projecao — tela de acesso para o telão/projetor: QR + endereço do app.
// O QR aponta pro endereço em que a página foi aberta (IP hoje, DNS depois),
// então não há nada para configurar. Fora da navegação, como /telao e /admin.
import { useEffect, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";

export default function Projecao() {
  const [qr, setQr] = useState<string | null>(null);
  const [host, setHost] = useState("");

  useEffect(() => {
    setHost(window.location.host);
    QRCode.toDataURL(window.location.origin + "/", {
      width: 960,
      margin: 2,
      color: { dark: "#0b1f45", light: "#ffffff" },
    }).then(setQr);
  }, []);

  return (
    <div className="telao projecao">
      <div className="projecao-top">
        <Image
          className="telao-selo"
          src="/selo-20-anos-branco.png"
          alt="Selo 20 anos do Cefor"
          width={2938}
          height={2149}
          priority
        />
        <span className="projecao-word">
          VIII <strong>Concefor</strong>
        </span>
      </div>
      <p className="projecao-cta">Aponte a câmera e entre no app do evento</p>
      {qr && (
        <div className="projecao-card">
          {/* dataURL gerado no cliente — next/image não se aplica */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="projecao-qr" src={qr} alt={`QR code de acesso: ${host}`} />
        </div>
      )}
      <p className="projecao-url">{host}</p>
      <p className="projecao-foot">17–20 de agosto de 2026 · Cefor/Ifes · 20 anos</p>
    </div>
  );
}
