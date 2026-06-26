import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Informações — VIII Concefor",
  description: "Guia prático do evento: local, como chegar, hospedagem e alimentação.",
};

// Guia prático do evento, direto no app. Conteúdo factual + seções a preencher
// (sem inventar hotéis/restaurantes). É aqui que entram infos de hospedagem,
// alimentação e como chegar — ver app/README.md.
export default function InformacoesPage() {
  return (
    <>
      <h1 className="page-title">Informações</h1>
      <p className="page-sub">Guia prático do VIII Concefor.</p>

      <div className="section-label">O evento</div>
      <div className="notice">
        <strong>VIII Concefor</strong> — Congresso Regional de Formação e Educação a Distância.
        <br />
        17 a 20 de agosto de 2026 · Cefor/Ifes — Vitória/ES.
        <br />
        <a href="https://concefor.cefor.ifes.edu.br/" target="_blank" rel="noreferrer">
          Site oficial ↗
        </a>
      </div>

      <div className="section-label">Local e como chegar</div>
      <div className="notice">Cefor/Ifes — Vitória/ES. Endereço e mapa entram aqui em breve.</div>

      <div className="section-label">Hospedagem</div>
      <div className="notice">Sugestões de hotéis próximos entram aqui em breve.</div>

      <div className="section-label">Alimentação</div>
      <div className="notice">Opções de restaurantes e os intervalos do evento entram aqui em breve.</div>
    </>
  );
}
