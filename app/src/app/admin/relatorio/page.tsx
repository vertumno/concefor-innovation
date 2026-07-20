"use client";

// Relatório do evento (R9, spec §5) — lido direto da linha do tempo, sem
// trabalho manual. Exportável: botão Imprimir/PDF (o @media print de
// globals.css deixa a página branca e esconde a navegação).

import { useEffect, useState } from "react";
import Link from "next/link";
import { REACTIONS } from "@/lib/reactions";
import type { Report } from "@/lib/db";

const TOKEN_KEY = "concefor:admin_token";

function fmtMinuto(tsMin: string): string {
  // "2026-08-18T12:34" (UTC) → data/hora local do leitor.
  return new Date(`${tsMin}:00Z`).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function RelatorioPage() {
  const [report, setReport] = useState<Report | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY) ?? "";
    fetch("/api/admin/report", { headers: { "x-admin-token": token } })
      .then(async (r) => {
        if (r.status === 401) throw new Error("Entre primeiro no /admin com o token.");
        setReport((await r.json()) as Report);
      })
      .catch((e: Error) => setErro(e.message));
  }, []);

  if (erro) {
    return (
      <>
        <h1 className="page-title">Relatório</h1>
        <p className="page-sub">
          {erro} <Link href="/admin">Ir para o admin</Link>
        </p>
      </>
    );
  }
  if (!report) return <p className="page-sub">Gerando relatório…</p>;

  const emojiDe = (kind: string) => REACTIONS.find((r) => r.kind === kind)?.emoji ?? kind;
  const labelDe = (kind: string) => REACTIONS.find((r) => r.kind === kind)?.label ?? kind;
  const t = report.totais;
  const maxReacoes = Math.max(1, ...report.ranking.map((r) => r.reacoes));

  return (
    <div className="report">
      <div className="report-head no-print">
        <Link href="/admin" className="back-link">
          ← Admin
        </Link>
        <button type="button" className="admin-btn" onClick={() => window.print()}>
          Imprimir / salvar PDF
        </button>
      </div>

      <h1 className="page-title">VIII Concefor — relatório do app</h1>
      <p className="page-sub">
        Gerado em {new Date(report.geradoEm).toLocaleString("pt-BR")} a partir da linha do
        tempo do evento.
      </p>

      <div className="section-label">Números gerais</div>
      <div className="admin-tiles report-tiles">
        <div className="admin-tile"><span className="admin-n">{t.inscritos}</span><span className="admin-l">inscritos</span></div>
        <div className="admin-tile"><span className="admin-n">{t.logados}</span><span className="admin-l">entraram com inscrição</span></div>
        <div className="admin-tile"><span className="admin-n">{t.dispositivos}</span><span className="admin-l">dispositivos participantes</span></div>
        <div className="admin-tile"><span className="admin-n">{t.reacoes}</span><span className="admin-l">reações</span></div>
        <div className="admin-tile"><span className="admin-n">{t.perguntas}</span><span className="admin-l">perguntas</span></div>
        <div className="admin-tile"><span className="admin-n">{t.votosEmPerguntas}</span><span className="admin-l">votos em perguntas</span></div>
        <div className="admin-tile"><span className="admin-n">{t.conexoes}</span><span className="admin-l">conexões entre pessoas</span></div>
      </div>

      <div className="section-label">Reações por tipo</div>
      {report.reacoesPorTipo.length === 0 ? (
        <div className="empty">Nenhuma reação registrada.</div>
      ) : (
        <table className="admin-table">
          <tbody>
            {report.reacoesPorTipo.map((r) => (
              <tr key={r.kind}>
                <td>
                  {emojiDe(r.kind)} {labelDe(r.kind)}
                </td>
                <td className="admin-td-n">{r.n}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="section-label">Ranking de sessões por engajamento</div>
      {report.ranking.length === 0 ? (
        <div className="empty">Nenhuma sessão com atividade registrada.</div>
      ) : (
        <ol className="report-ranking">
          {report.ranking.map((r) => (
            <li key={`${r.titulo}-${r.inicio}`} className="report-rank-item">
              <div className="report-rank-text">
                <strong>{r.titulo}</strong>
                <span className="admin-session-meta">
                  {new Date(r.inicio).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  {r.sala ? ` · ${r.sala}` : ""} · {r.reacoes} reações · {r.perguntas} perguntas
                </span>
              </div>
              <div className="report-rank-bar">
                <span style={{ width: `${Math.round((r.reacoes / maxReacoes) * 100)}%` }} />
              </div>
            </li>
          ))}
        </ol>
      )}

      <div className="section-label">Momentos mais quentes (reações por minuto)</div>
      {report.picos.length === 0 ? (
        <div className="empty">Sem picos ainda.</div>
      ) : (
        <table className="admin-table">
          <tbody>
            {report.picos.map((p, i) => (
              <tr key={`${p.ts}-${i}`}>
                <td>
                  {fmtMinuto(p.ts)} — {p.titulo}
                </td>
                <td className="admin-td-n">{p.n}/min</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p className="page-sub" style={{ marginTop: 20 }}>
        Estes números são o destaque escolhido pelo próprio público — cada reação, pergunta e
        conexão é um registro com hora na linha do tempo dos 20 anos do Cefor.
      </p>
    </div>
  );
}
