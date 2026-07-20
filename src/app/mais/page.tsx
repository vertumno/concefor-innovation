import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mais — VIII Concefor",
  description: "Guia prático do evento: local, alimentação, 20 anos, certificados e contato.",
};

// "Mais" — absorve a antiga /informacoes (R1; spec §4.0). Conteúdo factual +
// seções a preencher (sem inventar hotéis/restaurantes/contatos). /informacoes
// redireciona pra cá (next.config.mjs).
export default function MaisPage() {
  return (
    <>
      <h1 className="page-title">Mais</h1>
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

      <div className="section-label">Alimentação e arredores</div>
      <div className="notice">
        Opções de alimentação, intervalos do evento e o que fazer ao redor entram aqui em breve.
      </div>

      <div className="section-label">20 anos do Cefor</div>
      <div className="notice">
        Em 2026 o Cefor completa <strong>20 anos</strong> — o tema do congresso celebra essas duas
        décadas construindo novos cenários educacionais. Mais sobre essa história entra aqui em
        breve.
      </div>

      <div className="section-label">Certificados</div>
      <div className="notice">
        Os certificados são emitidos pela plataforma de inscrição (Even3). O link direto entra aqui
        em breve.
      </div>

      {/* "Fale com a organização" removido em 20/07 (decisão do Marquito) —
          volta se a organização definir um canal. */}
    </>
  );
}
