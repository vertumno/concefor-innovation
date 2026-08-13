"use client";

// Modo telão (E3) — o momento "uau" do piloto. Projetado num PC ligado ao projetor.
// O miolo é a LINHA DO TEMPO da sessão (canvas): as reações se acumulam em barras
// por minuto, do início ao fim da sessão — uma cor por tipo, com a bolinha dos
// contadores servindo de legenda. Cada reação nova vira fagulhas e uma onda que
// saltam do cursor "agora". Passagem do tempo + acúmulo na mesma imagem: a
// espinha conceitual do app. Emojis sobem pela tela com a cor do avatar anônimo.
// Recebe as reações ao vivo do servidor via SSE (/api/live/[sessionId]).

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import {
  REACTIONS,
  emptyCounts,
  isReactionKind,
  type ReactionCounts,
  type ReactionKind,
} from "@/lib/reactions";
import { Propagandas } from "@/components/Propagandas";
import { getAvatar } from "@/lib/clientId";
import { getNow } from "@/lib/clock";
import { formatDiaCurto, formatHoraH } from "@/lib/sessions";
import type { Session } from "@/lib/types";

const EMOJI = Object.fromEntries(REACTIONS.map((r) => [r.kind, r.emoji])) as Record<
  ReactionKind,
  string
>;
const KIND_INDEX = Object.fromEntries(REACTIONS.map((r, i) => [r.kind, i])) as Record<
  ReactionKind,
  number
>;
const CORES = REACTIONS.map((r) => r.cor);

const MINUTO = 60_000;
const UMA_HORA = 60 * MINUTO; // sessão sem fim declarado: assume 1h (como lib/sessions)

// URL oficial do app (decisão: sempre o DNS, nunca o IP) — vira QR na sala de espera.
const APP_URL = "https://app.cefor.ifes.edu.br/";

let floatSeq = 0;
type Floater = { id: number; emoji: string; cor: string; left: number; dur: number; drift: number };

// Recorte do que o telão mostra de /api/questions (já vem ordenado por votos).
type PerguntaTelao = { id: string; texto: string; autor: string | null; votes: number };

// Acúmulo real: minuto da sessão → contagem por tipo (índices na ordem de REACTIONS).
type Buckets = Map<number, number[]>;

export function Telao({ session }: { session: Session }) {
  const [counts, setCounts] = useState<ReactionCounts>(emptyCounts);
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const [connected, setConnected] = useState(false);
  const [perguntas, setPerguntas] = useState<PerguntaTelao[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bucketsRef = useRef<Buckets>(new Map());
  const burstsRef = useRef<number[]>([]); // reações recém-chegadas à espera de fagulhas
  const heatRef = useRef(0); // atividade recente → intensidade do cursor "agora"

  const iniMs = useMemo(() => new Date(session.inicio).getTime(), [session.inicio]);
  const fimMs = useMemo(
    () => (session.fim ? new Date(session.fim).getTime() : iniMs + UMA_HORA),
    [session.fim, iniMs],
  );

  // ── Linha do tempo (canvas + requestAnimationFrame; nada re-renderiza por frame) ──
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let W = 0;
    let H = 0;
    let raf = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    // ResizeObserver, não window.resize: o canvas também muda de tamanho quando
    // a coluna de perguntas aparece/some ao lado dele.
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Oswald resolvida pelo next/font — o canvas herda de .telao.
    const fonte = getComputedStyle(canvas).fontFamily || "system-ui, sans-serif";

    type Fagulha = { x: number; y: number; vx: number; vy: number; vida: number; total: number; cor: string };
    type Anel = { x: number; r: number; alfa: number };
    const fagulhas: Fagulha[] = [];
    const aneis: Anel[] = [];

    // A altura desenhada persegue a real (lerp): a barra "cresce" quando a reação cai.
    const alturas = new Map<number, number[]>();
    let escala = 6; // teto suavizado do eixo Y (mínimo p/ 1 reação não virar arranha-céu)

    const horaCurta = (ms: number) => {
      const d = new Date(ms);
      return `${d.getHours()}h${String(d.getMinutes()).padStart(2, "0")}`;
    };

    const draw = () => {
      const agora = getNow().getTime();
      // Domínio fixo início→fim: a tela inteira É a sessão; estica se passar da hora.
      const domFim = Math.max(fimMs, agora + MINUTO);
      const domDur = domFim - iniMs;
      const baseY = H - 30;
      const topoY = H * 0.1;
      const plotH = baseY - topoY;
      const xDe = (ms: number) => ((ms - iniMs) / domDur) * W;
      const nowX = Math.max(0, Math.min(W, xDe(agora)));

      heatRef.current *= 0.97;

      // Reações desde o último frame → fagulhas + onda nascendo no "agora".
      let kIdx: number | undefined;
      while ((kIdx = burstsRef.current.shift()) !== undefined) {
        const cor = CORES[kIdx];
        for (let i = 0; i < 9; i++) {
          fagulhas.push({
            x: nowX + (Math.random() - 0.5) * 10,
            y: baseY,
            vx: (Math.random() - 0.5) * 3,
            vy: -(2.2 + Math.random() * 3.4),
            vida: 0,
            total: 55 + Math.random() * 35,
            cor,
          });
        }
        aneis.push({ x: nowX, r: 4, alfa: 0.5 });
      }
      if (fagulhas.length > 360) fagulhas.splice(0, fagulhas.length - 360);

      ctx.clearRect(0, 0, W, H);

      // ── Eixo do tempo + marcações de hora ──
      ctx.strokeStyle = "rgba(255,255,255,0.16)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, baseY);
      ctx.lineTo(W, baseY);
      ctx.stroke();

      const durMin = domDur / MINUTO;
      const passo = durMin <= 45 ? 5 : durMin <= 100 ? 15 : durMin <= 240 ? 30 : 60;
      ctx.font = `500 ${Math.max(11, Math.round(H * 0.026))}px ${fonte}`;
      ctx.textBaseline = "top";
      for (let ms = iniMs; ms <= domFim; ms += passo * MINUTO) {
        const x = xDe(ms);
        ctx.strokeStyle = "rgba(255,255,255,0.16)";
        ctx.beginPath();
        ctx.moveTo(x, baseY);
        ctx.lineTo(x, baseY + 6);
        ctx.stroke();
        ctx.fillStyle = "rgba(159,182,214,0.85)";
        ctx.textAlign = x < 30 ? "left" : x > W - 30 ? "right" : "center";
        ctx.fillText(horaCurta(ms), x, baseY + 10);
      }

      // ── Barras empilhadas: o acúmulo minuto a minuto ──
      let alvoMax = 6;
      for (const c of bucketsRef.current.values()) {
        const soma = c.reduce((s, v) => s + v, 0);
        if (soma > alvoMax) alvoMax = soma;
      }
      escala += (alvoMax - escala) * 0.08;

      const largMin = W / durMin; // largura de 1 minuto na tela
      const bw = Math.max(2, largMin - Math.min(3, largMin * 0.25));
      for (const [idx, alvo] of bucketsRef.current) {
        let disp = alturas.get(idx);
        if (!disp) {
          disp = CORES.map(() => 0);
          alturas.set(idx, disp);
        }
        const x = xDe(iniMs + idx * MINUTO) + (largMin - bw) / 2;
        let y = baseY;
        let corTopo = "";
        for (let k = 0; k < CORES.length; k++) {
          disp[k] += (alvo[k] - disp[k]) * 0.16;
          const h = (disp[k] / escala) * plotH;
          if (h < 0.4) continue;
          ctx.globalAlpha = 0.92;
          ctx.fillStyle = CORES[k];
          ctx.fillRect(x, y - h, bw, h);
          y -= h;
          corTopo = CORES[k];
        }
        ctx.globalAlpha = 1;
        if (corTopo) {
          // topo aceso da pilha: dá leitura de "chama" sem custo de glow por segmento
          ctx.fillStyle = corTopo;
          ctx.shadowColor = corTopo;
          ctx.shadowBlur = 10;
          ctx.fillRect(x, y - 2, bw, 2);
          ctx.shadowBlur = 0;
        }
      }

      // ── Cursor "agora": feixe vertical + ponto que pulsa com a atividade ──
      const heat = Math.min(1, heatRef.current);
      const feixe = ctx.createLinearGradient(0, topoY, 0, baseY);
      feixe.addColorStop(0, "rgba(0,221,202,0)");
      feixe.addColorStop(1, `rgba(0,221,202,${0.35 + heat * 0.45})`);
      ctx.strokeStyle = feixe;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(nowX, topoY);
      ctx.lineTo(nowX, baseY);
      ctx.stroke();
      ctx.fillStyle = "#00ddca";
      ctx.shadowColor = "#00ddca";
      ctx.shadowBlur = 14 + heat * 22;
      ctx.beginPath();
      ctx.arc(nowX, baseY, 4 + heat * 5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.shadowBlur = 0;

      // ── Ondas (semicírculos que se expandem do "agora") ──
      for (let i = aneis.length - 1; i >= 0; i--) {
        const a = aneis[i];
        a.r += 2.4;
        a.alfa *= 0.94;
        if (a.alfa < 0.02) {
          aneis.splice(i, 1);
          continue;
        }
        ctx.strokeStyle = `rgba(0,221,202,${a.alfa})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(a.x, baseY, a.r, Math.PI, 2 * Math.PI);
        ctx.stroke();
      }

      // ── Fagulhas (sobem do "agora" e recaem na linha do tempo) ──
      for (let i = fagulhas.length - 1; i >= 0; i--) {
        const f = fagulhas[i];
        f.vida++;
        if (f.vida >= f.total) {
          fagulhas.splice(i, 1);
          continue;
        }
        f.vy += 0.1;
        f.x += f.vx;
        f.y += f.vy;
        if (f.y > baseY) {
          f.y = baseY;
          f.vy *= -0.35; // quica de leve na linha
        }
        ctx.globalAlpha = 1 - f.vida / f.total;
        ctx.fillStyle = f.cor;
        ctx.beginPath();
        ctx.arc(f.x, f.y, 2.6, 0, 2 * Math.PI);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Sessão ainda sem reação: convite no lugar do gráfico vazio.
      if (bucketsRef.current.size === 0) {
        ctx.fillStyle = "rgba(159,182,214,0.7)";
        ctx.font = `500 ${Math.max(16, Math.round(H * 0.05))}px ${fonte}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("As reações de vocês desenham esta linha do tempo", W / 2, topoY + plotH * 0.42);
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [iniMs, fimMs]);

  // ── SSE: reações ao vivo ──
  useEffect(() => {
    const es = new EventSource(`/api/live/${encodeURIComponent(session.id)}`);
    es.addEventListener("open", () => setConnected(true));
    es.addEventListener("init", (e) => {
      try {
        const d = JSON.parse((e as MessageEvent).data) as {
          counts: ReactionCounts;
          timeline?: { minuto: string; kind: string; n: number }[];
        };
        setCounts(d.counts);
        // Reconstrói o acúmulo por minuto — verdade do servidor, re-sincronizada
        // a cada reconexão (o telão pode ser ligado no meio da sessão).
        const buckets: Buckets = new Map();
        for (const { minuto, kind, n } of d.timeline ?? []) {
          if (!isReactionKind(kind)) continue;
          const t = Date.parse(`${minuto}:00Z`); // ts é ISO UTC; o corte no minuto perde o "Z"
          if (!Number.isFinite(t)) continue;
          const idx = Math.max(0, Math.floor((t - iniMs) / MINUTO));
          const b = buckets.get(idx) ?? CORES.map(() => 0);
          b[KIND_INDEX[kind]] += n;
          buckets.set(idx, b);
        }
        bucketsRef.current = buckets;
        setConnected(true);
      } catch {
        /* ignora payload malformado */
      }
    });
    es.addEventListener("reaction", (e) => {
      try {
        const d = JSON.parse((e as MessageEvent).data) as {
          reaction: string;
          actorId: string | null;
          ts?: string;
        };
        if (isReactionKind(d.reaction)) pulse(d.reaction, d.actorId, d.ts);
      } catch {
        /* ignora */
      }
    });
    es.onerror = () => setConnected(false);
    return () => es.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.id, iniMs]);

  // ── Perguntas mais votadas (poll leve; a mesma API da tela da sessão) ──
  // O /admin pode ocultar o painel na hora (GET /api/telao, padrão: exibe).
  useEffect(() => {
    let vivo = true;
    setPerguntas([]);
    const busca = async () => {
      try {
        // no-store: telão fica dias aberto — nenhum navegador pode servir cache aqui.
        const [cfgRes, qRes] = await Promise.all([
          fetch("/api/telao", { cache: "no-store" }),
          fetch(`/api/questions?sessionId=${encodeURIComponent(session.id)}`, { cache: "no-store" }),
        ]);
        if (cfgRes.ok && ((await cfgRes.json()) as { perguntas?: boolean }).perguntas === false) {
          if (vivo) setPerguntas([]);
          return;
        }
        if (!qRes.ok) return;
        const d = (await qRes.json()) as { questions?: PerguntaTelao[] };
        if (vivo) setPerguntas((d.questions ?? []).slice(0, 3));
      } catch {
        /* rede oscilou: mantém as últimas mostradas */
      }
    };
    busca();
    // 5s: ocultar pergunta fora de tom do telão precisa valer quase na hora.
    const id = setInterval(busca, 5_000);
    return () => {
      vivo = false;
      clearInterval(id);
    };
  }, [session.id]);

  function pulse(kind: ReactionKind, actorId: string | null, ts?: string) {
    setCounts((c) => ({ ...c, [kind]: c[kind] + 1 }));
    heatRef.current = Math.min(1.3, heatRef.current + 0.3);

    // Acumula no minuto do evento (ts do servidor; fallback: agora).
    const tMs = ts ? Date.parse(ts) : NaN;
    const idx = Math.max(
      0,
      Math.floor(((Number.isFinite(tMs) ? tMs : getNow().getTime()) - iniMs) / MINUTO),
    );
    const kIdx = KIND_INDEX[kind];
    const b = bucketsRef.current.get(idx) ?? CORES.map(() => 0);
    b[kIdx]++;
    bucketsRef.current.set(idx, b);
    if (burstsRef.current.length < 40) burstsRef.current.push(kIdx);

    const cor = actorId ? getAvatar(actorId).cor : "#00ddca";
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
            <span className="telao-count-label">
              {/* bolinha-legenda: mesma cor da barra na linha do tempo */}
              <span className="telao-count-dot" style={{ background: r.cor }} aria-hidden />
              {r.label}
            </span>
          </div>
        ))}
      </div>

      <div className="telao-miolo">
        {/* Divulgação institucional à esquerda: gira sozinha, lida da pasta
            public/propagandas. Cartaz `posicao: modal` sobe por cima da tela. */}
        <Propagandas />
        <div className="telao-grafico">
          <canvas ref={canvasRef} className="telao-timeline" />
        </div>
        {perguntas.length > 0 && (
          <aside className="telao-perguntas" aria-label="Perguntas mais votadas">
            <p className="telao-perguntas-titulo">Perguntas mais votadas</p>
            <ol className="telao-perguntas-lista">
              {perguntas.map((q) => (
                <li key={q.id} className="telao-pergunta">
                  <span className="telao-pergunta-votos">▲ {q.votes}</span>
                  <span className="telao-pergunta-corpo">
                    <span className="telao-pergunta-texto">{q.texto}</span>
                    {q.autor && <span className="telao-pergunta-autor">{q.autor}</span>}
                  </span>
                </li>
              ))}
            </ol>
          </aside>
        )}
      </div>

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

// "03:12", "1:07:45", "2d 3h" — regressiva legível de longe (dias só quando falta muito).
function formatCountdown(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(s / 86400);
  if (d > 0) return `${d}d ${Math.floor((s % 86400) / 3600)}h`;
  const h = Math.floor(s / 3600);
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

// Sala de espera do telão: sem sessão no ar, projeta a PRÓXIMA com contagem
// regressiva — o telão nunca fica mudo e a passagem do tempo continua visível.
export function TelaoAguardando({ session, now }: { session: Session; now: Date }) {
  // QR de acesso ao app: a sala de espera dobra como cartaz de entrada.
  const [qr, setQr] = useState<string | null>(null);
  useEffect(() => {
    QRCode.toDataURL(APP_URL, {
      width: 640,
      margin: 2, // zona de silêncio branca — legível sobre o navy do telão
      color: { dark: "#0b1f45", light: "#ffffff" },
    })
      .then(setQr)
      .catch(() => {
        /* sem QR o telão segue útil */
      });
  }, []);

  const inicio = new Date(session.inicio);
  const mesmoDia = inicio.toDateString() === now.toDateString();
  const meta = [!mesmoDia && formatDiaCurto(session.inicio), formatHoraH(session.inicio), session.sala]
    .filter(Boolean)
    .join(" · ");
  const quem = session.speakers?.length
    ? session.speakers.map((s) => s.nome).join(" · ")
    : session.palestrante;

  return (
    <div className="telao telao-wait">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="telao-selo" src="/selo-20-anos-branco.png" alt="Selo 20 anos do Cefor" />
      <p className="telao-wait-eyebrow">A seguir</p>
      <h1 className="telao-wait-title">{session.titulo}</h1>
      <p className="telao-wait-meta">{meta}</p>
      {quem && <p className="telao-wait-quem">{quem}</p>}
      <div className="telao-wait-bloco">
        <span className="telao-wait-rotulo">Começa em</span>
        <span className="telao-wait-count">
          {formatCountdown(inicio.getTime() - now.getTime())}
        </span>
      </div>
      {qr && (
        <div className="telao-wait-qr">
          <span className="telao-wait-qr-cta">Entre no app do evento</span>
          {/* dataURL gerado no cliente — next/image não se aplica */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="telao-wait-qr-img" src={qr} alt="QR code de acesso ao app: app.cefor.ifes.edu.br" />
          <span className="telao-wait-qr-url">app.cefor.ifes.edu.br</span>
        </div>
      )}
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
