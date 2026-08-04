"use client";

// Conectar com alguém: aponta a câmera pro QR do crachá ou digita o nº do
// ingresso. A leitura tenta primeiro o BarcodeDetector do navegador (nativo,
// mais leve) e, quando ele não existe — Safari/iOS e vários Androids, o que
// derrubou a câmera no teste de 30/07 —, cai no jsQR sobre um canvas.
// A câmera exige HTTPS fora do localhost; sem ela, o caminho digitado sempre
// funciona.

import { useCallback, useEffect, useRef, useState } from "react";
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
  const [avisoCamera, setAvisoCamera] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const parou = useRef(false);
  const enviando = useRef(false);
  // `conectar` precisa ser estável: ela entra nas dependências do efeito da
  // câmera, e qualquer troca de identidade reiniciaria a filmagem no meio da
  // leitura. Por isso o onDone do pai (uma arrow nova a cada render) fica aqui.
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  });

  const conectar = useCallback(async (code: string) => {
    if (enviando.current) return;
    enviando.current = true;
    setSending(true);
    setErro(null);
    try {
      const res = await fetch("/api/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: getClientId(), code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro((data as { error?: string }).error ?? "não deu certo");
        parou.current = false; // deu erro: volta a ler, sem precisar reabrir
      } else {
        onDoneRef.current(data as Resultado);
      }
    } catch {
      setErro("sem conexão — tente de novo");
      parou.current = false;
    } finally {
      enviando.current = false;
      setSending(false);
    }
  }, []);

  // Scanner: liga a câmera e procura QR ~3x por segundo.
  useEffect(() => {
    if (modo !== "scan") return;
    if (!navigator.mediaDevices?.getUserMedia) {
      setAvisoCamera(
        window.isSecureContext
          ? "Este navegador não abre a câmera aqui — digite o número."
          : "A câmera só funciona no endereço https do app — digite o número.",
      );
      setModo("manual");
      return;
    }
    parou.current = false;
    let stream: MediaStream | null = null;
    let timer: ReturnType<typeof setInterval> | null = null;

    const achou = (raw: string | undefined) => {
      const digitos = raw?.replace(/\D/g, "");
      if (!digitos || digitos.length < 6) return;
      parou.current = true; // pausa a leitura enquanto o POST vai e volta
      conectar(digitos);
    };

    // Fallback do BarcodeDetector: desenha o frame num canvas e decodifica em
    // JS. Carregado sob demanda — são ~40 kB que só o Safari e afins baixam.
    let jsQR: typeof import("jsqr").default | null = null;
    const lerComJsQR = (video: HTMLVideoElement) => {
      if (!jsQR) return;
      const w = video.videoWidth;
      const h = video.videoHeight;
      if (!w || !h) return;
      const canvas = (canvasRef.current ??= document.createElement("canvas"));
      // Meia resolução: o QR do crachá continua legível e o celular não engasga.
      canvas.width = Math.round(w / 2);
      canvas.height = Math.round(h / 2);
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
      achou(jsQR(img.data, img.width, img.height, { inversionAttempts: "dontInvert" })?.data);
    };

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (parou.current || !videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        const Detector = (globalThis as { BarcodeDetector?: BarcodeDetectorCtor })
          .BarcodeDetector;
        const detector = Detector ? new Detector({ formats: ["qr_code"] }) : null;
        if (!detector) jsQR = (await import("jsqr")).default;
        if (parou.current) return;

        timer = setInterval(async () => {
          const video = videoRef.current;
          if (!video || parou.current) return;
          try {
            if (detector) achou((await detector.detect(video))[0]?.rawValue);
            else lerComJsQR(video);
          } catch {
            /* frame ruim: tenta no próximo */
          }
        }, 350);
      } catch (e) {
        // Permissão negada, câmera ocupada ou contexto inseguro.
        const nome = (e as { name?: string })?.name;
        setAvisoCamera(
          nome === "NotAllowedError"
            ? "Você recusou o acesso à câmera (dá pra liberar nos ajustes do navegador). Digite o número por enquanto."
            : "Não consegui abrir a câmera — digite o número do ingresso.",
        );
        setModo("manual");
      }
    })();

    return () => {
      parou.current = true;
      if (timer) clearInterval(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [modo, conectar]);

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
          {avisoCamera && <p className="page-sub">{avisoCamera}</p>}
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
            O número está no crachá ou no &quot;meu QR&quot; do app da outra pessoa (perfil, no
            topo).{" "}
            {avisoCamera && (
              <button
                type="button"
                className="connect-link"
                onClick={() => {
                  setAvisoCamera(null);
                  setModo("scan");
                }}
              >
                Tentar a câmera de novo
              </button>
            )}
          </p>
        </>
      )}

      {erro && <p className="q-erro">{erro}</p>}
    </div>
  );
}
