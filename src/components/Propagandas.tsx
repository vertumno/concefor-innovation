"use client";

// Cartazes do telão — divulgação institucional que gira sozinha ao lado da linha
// do tempo (`posicao: lateral`) ou por cima dela (`posicao: modal`). Cada cartaz
// é um arquivo em public/propagandas/; quem escreve não abre código. O tempo no
// ar é o `duracao:` do próprio arquivo, então cada peça controla o seu ritmo.
//
// O telão não é clicável: quando o cartaz tem `link:`, o CTA é o QR code.

import { useEffect, useState, type CSSProperties } from "react";
import QRCode from "qrcode";
import type { Propaganda } from "@/lib/propagandas";

// O telão fica ligado o dia inteiro: reler a pasta de tempos em tempos deixa
// entrar cartaz publicado no meio do evento sem ninguém tocar no projetor.
const RECARGA_MS = 5 * 60_000;
const GALERIA_MS = 6_000; // troca de foto dentro de um cartaz de galeria

// Entre um cartaz e o outro o telão fica limpo. A divulgação vira visita, não
// moradora: quem olha volta a ver só a informação do evento, e o cartaz seguinte
// reconquista a atenção em vez de virar paisagem.
const PAUSA_MS = 10_000;
const SAIDA_MS = 500; // tem que casar com a animação propagandaSaiEsquerda

// `espera` = telão entre sessões (sala de espera). Ali a divulgação aparece
// sempre: a tela está ociosa e é justamente o momento dela. No `ao-vivo` quem
// manda é o botão do /admin, porque aí o cartaz divide espaço com a palestra.
export function Propagandas({ contexto = "ao-vivo" }: { contexto?: "ao-vivo" | "espera" }) {
  const [lista, setLista] = useState<Propaganda[]>([]);
  const [indice, setIndice] = useState(0);
  const [foto, setFoto] = useState(0);
  const [qr, setQr] = useState<string | null>(null);
  const [ligado, setLigado] = useState(true);
  const [fase, setFase] = useState<"no-ar" | "saindo" | "pausa">("no-ar");

  useEffect(() => {
    if (contexto !== "ao-vivo") {
      setLigado(true);
      return;
    }
    let vivo = true;
    const buscar = async () => {
      try {
        const res = await fetch("/api/telao", { cache: "no-store" });
        if (!res.ok) return;
        const cfg = (await res.json()) as { propagandas?: boolean };
        if (vivo) setLigado(cfg.propagandas !== false);
      } catch {
        /* rede oscilou: mantém o estado atual */
      }
    };
    buscar();
    // 5s, como o painel de perguntas: tirar do ar no meio de uma fala precisa
    // valer quase na hora para quem apertou o botão.
    const id = setInterval(buscar, 5_000);
    return () => {
      vivo = false;
      clearInterval(id);
    };
  }, [contexto]);

  useEffect(() => {
    let vivo = true;
    const buscar = async () => {
      try {
        const res = await fetch("/api/propagandas", { cache: "no-store" });
        if (!res.ok) return;
        const dados = (await res.json()) as { propagandas?: Propaganda[] };
        if (vivo) setLista(dados.propagandas ?? []);
      } catch {
        /* rede oscilou: segue com os cartazes que já estão na mão */
      }
    };
    buscar();
    const id = setInterval(buscar, RECARGA_MS);
    return () => {
      vivo = false;
      clearInterval(id);
    };
  }, []);

  // Índice cresce livre e o resto é feito na leitura: assim um cartaz removido
  // da pasta no meio do giro não deixa o telão apontando para o vazio.
  const atual = lista.length ? lista[indice % lista.length] : null;

  // Ciclo de cada cartaz: no ar pelo `duracao` → sai deslizando → tela limpa por
  // PAUSA_MS → entra o próximo. Três fases em vez de um timer só porque a saída
  // precisa terminar na tela antes de o elemento sumir do DOM.
  useEffect(() => {
    if (!atual || fase !== "no-ar") return;
    const t = setTimeout(() => setFase("saindo"), atual.duracao * 1000);
    return () => clearTimeout(t);
  }, [atual, fase, indice]);

  useEffect(() => {
    if (fase !== "saindo") return;
    const t = setTimeout(() => setFase("pausa"), SAIDA_MS);
    return () => clearTimeout(t);
  }, [fase]);

  useEffect(() => {
    if (fase !== "pausa") return;
    const t = setTimeout(() => {
      setIndice((n) => n + 1);
      setFase("no-ar");
    }, PAUSA_MS);
    return () => clearTimeout(t);
  }, [fase]);

  const alvoQr = atual?.qr;
  useEffect(() => {
    if (!alvoQr) {
      setQr(null);
      return;
    }
    let vivo = true;
    QRCode.toDataURL(alvoQr, {
      // Bem acima do tamanho de tela (~200px): a lib escala o módulo por
      // arredondamento, e em resolução baixa os quadradinhos saem com larguras
      // diferentes — é o que dava o aspecto pixelado na projeção.
      width: 800,
      margin: 1, // zona de silêncio branca em volta do código
      color: { dark: "#102a5c", light: "#ffffff" },
    })
      .then((url) => vivo && setQr(url))
      .catch(() => vivo && setQr(null));
    return () => {
      vivo = false;
    };
  }, [alvoQr]);

  const quantasFotos = atual?.imagens?.length ?? 0;
  useEffect(() => {
    setFoto(0);
    if (quantasFotos < 2) return;
    const id = setInterval(() => setFoto((f) => f + 1), GALERIA_MS);
    return () => clearInterval(id);
  }, [atual?.id, quantasFotos]);

  // Na pausa some do DOM de verdade: o telão fica com a informação do evento e
  // mais nada, que é o ponto de existir a pausa.
  if (!atual || !ligado || fase === "pausa") return null;

  const capa = quantasFotos ? atual.imagens?.[foto % quantasFotos] : atual.imagem;
  const rotulo = atual.rotulo;

  const cartao = (
    <article
      // key no id: trocar de cartaz remonta o bloco e replaya a entrada + a barra de tempo.
      key={atual.id}
      className={`propaganda${fase === "saindo" ? " propaganda--saindo" : ""}`}
      style={atual.acento ? ({ "--propaganda-acento": atual.acento } as CSSProperties) : undefined}
    >
      {capa && (
        // dataURL/arquivo da pasta pública, dimensão desconhecida — next/image não se aplica
        // eslint-disable-next-line @next/next/no-img-element
        <img className="propaganda-capa" src={capa} alt="" key={capa} />
      )}
      {atual.chamada && <p className="propaganda-chamada">{atual.chamada}</p>}
      <h2 className="propaganda-titulo">{atual.titulo}</h2>
      {/* HTML vindo dos arquivos do repo (nossos, versionados); o .md ainda passa
          por escape antes de virar marcação — ver renderMarkdown. */}
      <div className="propaganda-corpo" dangerouslySetInnerHTML={{ __html: atual.corpo }} />
      {qr && (
        <div className="propaganda-qr">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt={`QR code de acesso: ${rotulo ?? atual.titulo}`} />
          {rotulo && <span>{rotulo}</span>}
        </div>
      )}
      {lista.length > 1 && (
        <span
          className="propaganda-tempo"
          style={{ animationDuration: `${atual.duracao}s` }}
          aria-hidden
        />
      )}
    </article>
  );

  if (atual.posicao === "modal") {
    return <div className="propaganda-modal">{cartao}</div>;
  }
  return (
    <aside className="telao-propaganda" aria-label="Divulgação">
      {cartao}
    </aside>
  );
}
