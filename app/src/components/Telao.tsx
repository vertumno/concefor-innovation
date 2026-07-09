"use client";

// Modo telão (E3) — o momento "uau" do piloto. Projetado num PC ligado ao projetor.
// Uma linha de "batimento cardíaco" (canvas) pulsa a cada reação; contadores por
// tipo; emojis sobem pela tela com a cor do avatar anônimo de cada dispositivo.
// Recebe as reações ao vivo do servidor via SSE (/api/live/[sessionId]).

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import {
  REACTIONS,
  emptyCounts,
  isReactionKind,
  type ReactionCounts,
  type ReactionKind,
} from "@/lib/reactions";
import { getAvatar } from "@/lib/clientId";
import type { Session } from "@/lib/types";

const EMOJI = Object.fromEntries(REACTIONS.map((r) => [r.kind, r.emoji])) as Record<
  ReactionKind,
  string
>;

const CYAN: [number, number, number] = [0, 221, 202];
const RED: [number, number, number] = [214, 0, 75];
const mix = (a: number[], b: number[], t: number) =>
  a.map((v, i) => Math.round(v + (b[i] - v) * t));

let floatSeq = 0;
type Floater = { id: number; emoji: string; cor: string; left: number; dur: number; drift: number };

export function Telao({ session }: { session: Session }) {
  const [counts, setCounts] = useState<ReactionCounts>(emptyCounts);
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const [connected, setConnected] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const levelRef = useRef(0); // altura instantânea do batimento (decai a cada frame)
  const heatRef = useRef(0); // "calor" recente → cor da linha (cyan calmo → vermelho no pico)

  // ── Batimento cardíaco (canvas + requestAnimationFrame; nada re-renderiza por frame) ──
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const N = 260;
    const STEP_MS = 55; // tempo por amostra: controla a velocidade da rolagem (maior = mais calmo)
    const buf = new Array(N).fill(0);
    let W = 0;
    let H = 0;
    let raf = 0;
    let acc = 0;
    let last = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // Um "passo" da simulação: decai o batimento e empurra uma amostra.
    const step = () => {
      levelRef.current *= 0.8;
      heatRef.current *= 0.9;
      buf.push(Math.min(1, levelRef.current + (Math.random() - 0.5) * 0.04 + 0.03));
      buf.shift();
    };

    const draw = (t: number) => {
      acc += t - last;
      last = t;
      let n = 0;
      while (acc >= STEP_MS && n < 6) {
        step();
        acc -= STEP_MS;
        n++;
      }

      ctx.clearRect(0, 0, W, H);
      const mid = H * 0.5;
      const amp = H * 0.4;
      const col = mix(CYAN, RED, Math.min(1, heatRef.current));
      ctx.lineJoin = "round";
      ctx.lineWidth = 3;
      ctx.strokeStyle = `rgb(${col[0]},${col[1]},${col[2]})`;
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = 18;
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        const x = (i / (N - 1)) * W;
        const y = mid - buf[i] * amp;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // ── SSE: reações ao vivo ──
  useEffect(() => {
    const es = new EventSource(`/api/live/${encodeURIComponent(session.id)}`);
    es.addEventListener("open", () => setConnected(true));
    es.addEventListener("init", (e) => {
      try {
        setCounts(JSON.parse((e as MessageEvent).data).counts);
        setConnected(true);
      } catch {
        /* ignora payload malformado */
      }
    });
    es.addEventListener("reaction", (e) => {
      try {
        const d = JSON.parse((e as MessageEvent).data) as { reaction: string; clientId: string | null };
        if (isReactionKind(d.reaction)) pulse(d.reaction, d.clientId);
      } catch {
        /* ignora */
      }
    });
    es.onerror = () => setConnected(false);
    return () => es.close();
  }, [session.id]);

  function pulse(kind: ReactionKind, clientId: string | null) {
    setCounts((c) => ({ ...c, [kind]: c[kind] + 1 }));
    levelRef.current = 1;
    heatRef.current = Math.min(1.2, heatRef.current + 0.34);

    const cor = clientId ? getAvatar(clientId).cor : "#00ddca";
    const id = ++floatSeq;
    const f: Floater = {
      id,
      emoji: EMOJI[kind],
      cor,
      left: 6 + Math.random() * 88,
      dur: 2.4 + Math.random() * 1.2,
      drift: Math.round((Math.random() - 0.5) * 80),
    };
    // Capa a quantidade simultânea para não pesar a projeção.
    setFloaters((prev) => (prev.length > 34 ? prev.slice(-34) : prev).concat(f));
    setTimeout(() => setFloaters((prev) => prev.filter((x) => x.id !== id)), f.dur * 1000 + 120);
  }

  const total = REACTIONS.reduce((s, r) => s + counts[r.kind], 0);

  return (
    <div className="telao">
      <div className="telao-top">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="telao-selo" src="/selo-20-anos-branco.png" alt="Selo 20 anos do Cefor" />
        <span className="telao-live">
          <span className="telao-live-dot" />
          AO VIVO
        </span>
      </div>

      <h1 className="telao-title">{session.titulo}</h1>

      <div className="telao-counts">
        {REACTIONS.map((r) => (
          <div className="telao-count" key={r.kind}>
            <span className="telao-emoji" aria-hidden>
              {r.emoji}
            </span>
            {/* key = valor: remonta e replaya o "pop" a cada incremento */}
            <span key={counts[r.kind]} className="telao-n">
              {counts[r.kind]}
            </span>
            <span className="telao-count-label">{r.label}</span>
          </div>
        ))}
      </div>

      <canvas ref={canvasRef} className="telao-ecg" />

      <div className="telao-floaters" aria-hidden>
        {floaters.map((f) => (
          <span
            key={f.id}
            className="telao-floater"
            style={
              {
                left: `${f.left}%`,
                animationDuration: `${f.dur}s`,
                filter: `drop-shadow(0 0 12px ${f.cor})`,
                "--drift": `${f.drift}px`,
              } as CSSProperties
            }
          >
            {f.emoji}
          </span>
        ))}
      </div>

      <div className="telao-foot">
        <span className="telao-total">{total} reações</span>
        {!connected && <span className="telao-off">reconectando…</span>}
      </div>
    </div>
  );
}

// Estado vazio do telão (carregando / sem sessão no ar / não encontrada).
export function TelaoEmpty({ msg }: { msg: string }) {
  return (
    <div className="telao telao--empty">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="telao-selo" src="/selo-20-anos-branco.png" alt="Selo 20 anos do Cefor" />
      <p className="telao-empty-msg">{msg}</p>
      <Link href="/" className="telao-empty-link">
        ← Início
      </Link>
    </div>
  );
}
