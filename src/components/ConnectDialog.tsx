"use client";

// Conectar com alguém: aponta a câmera pro QR do crachá (BarcodeDetector,
// quando o navegador suporta e há contexto seguro) ou digita o nº do ingresso.
// A câmera exige HTTPS (fora de localhost) — até o deploy do R5, o caminho
// manual funciona sempre.

import { useEffect, useRef, useState } from "react";
import { getClientId } from "@/lib/clientId";

type Resultado = { nova: boolean; pessoa: { nome: string; email: string | null } };

type BarcodeDetectorLike = {
  detect(source: CanvasImageSource): Promise<{ rawValue: string }[]>;
};
type BarcodeDetectorCtor = new (opts: { formats: string[] }) => BarcodeDetectorLike;

export function ConnectDialog({
  onDone,
  onClose,
}: {
  onDone: (r: Resultado) => void;
  onClose: () => void;
}) {
  const [modo, setModo] = useState<"scan" | "manual">("scan");
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const parou = useRef(false);

  async function conectar(code: string) {
    if (sending) return;
    setSending(true);
    setErro(null);
    try {
      const res = await fetch("/api/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: getClientId(), code }),
      });
      const data = await res.json();
      if (!res.ok) setErro((data as { error?: string }).error ?? "não deu certo");
      else onDone(data as Resultado);
    } catch {
      setErro("sem conexão — tente de novo");
    } finally {
      setSending(false);
    }
  }

  // Scanner: liga a câmera e procura QR ~3x por segundo.
  useEffect(() => {
    if (modo !== "scan") return;
    const Detector = (globalThis as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector;
    if (!Detector || !navigator.mediaDevices?.getUserMedia) {
      setModo("manual");
      return;
    }
    parou.current = false;
    let stream: MediaStream | null = null;
    let timer: ReturnType<typeof setInterval> | null = null;

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (parou.current || !videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        const detector = new Detector({ formats: ["qr_code"] });
        timer = setInterval(async () => {
          if (!videoRef.current || parou.current) return;
          try {
            const codes = await detector.detect(videoRef.current);
            const raw = codes[0]?.rawValue?.replace(/\D/g, "");
            if (raw && raw.length >= 6) {
              parou.current = true;
              if (timer) clearInterval(timer);
              conectar(raw);
            }
          } catch {
            /* frame ruim: tenta no próximo */
          }
        }, 350);
      } catch {
        // Sem permissão/HTTPS: cai pra digitação.
        setModo("manual");
      }
    })();

    return () => {
      parou.current = true;
      if (timer) clearInterval(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modo]);

  return (
    <div className="connect-dialog">
      <div className="connect-head">
        <strong>Conectar com alguém</strong>
        <button type="button" className="admin-btn admin-btn-sm" onClick={onClose}>
          Fechar
        </button>
      </div>

      {modo === "scan" ? (
        <>
          <video ref={videoRef} className="connect-video" muted playsInline />
          <p className="page-sub">
            Aponte para o QR do crachá da pessoa.{" "}
            <button type="button" className="connect-link" onClick={() => setModo("manual")}>
              Prefiro digitar o número
            </button>
          </p>
        </>
      ) : (
        <>
          <div className="filter-row">
            <input
              inputMode="numeric"
              placeholder="Nº do ingresso da pessoa (8 dígitos)"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && conectar(codigo)}
            />
            <button
              type="button"
              className="admin-btn"
              disabled={sending || !codigo.trim()}
              onClick={() => conectar(codigo)}
            >
              {sending ? "…" : "Conectar"}
            </button>
          </div>
          <p className="page-sub">
            O número está no crachá ou no "meu QR" do app da outra pessoa (perfil, no topo).
          </p>
        </>
      )}

      {erro && <p className="q-erro">{erro}</p>}
    </div>
  );
}
