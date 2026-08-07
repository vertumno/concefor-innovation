import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mais — VIII Concefor",
  description: "Guia prático do evento: local, alimentação, 20 anos, certificados e contato.",
};

// "Mais" — guia curto. O site oficial continua sendo a fonte viva das listas;
// o app oferece os atalhos úteis sem duplicar páginas inteiras que podem mudar.
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
      <div className="notice info-card">
        <strong>Cefor/Ifes</strong>
        <span>Rua Barão de Mauá, 30 · Jucutuquara · Vitória/ES · 29040-860</span>
        <div className="info-actions">
          <a
            href="https://www.google.com/maps/search/?api=1&query=Rua+Bar%C3%A3o+de+Mau%C3%A1%2C+30%2C+Jucutuquara%2C+Vit%C3%B3ria%2C+ES"
            target="_blank"
            rel="noreferrer"
          >
            Abrir no mapa ↗
          </a>
          <a
            href="https://concefor.cefor.ifes.edu.br/servicos/"
            target="_blank"
            rel="noreferrer"
          >
            Transporte e acesso ↗
          </a>
        </div>
      </div>

      <div className="section-label">Alimentação e hospedagem</div>
      <div className="notice info-card">
        <span>
          Consulte as listas do site oficial e confirme horário e disponibilidade diretamente
          com o estabelecimento.
        </span>
        <div className="info-actions">
          <a
            href="https://concefor.cefor.ifes.edu.br/opcoes-de-restaurantes/"
            target="_blank"
            rel="noreferrer"
          >
            Restaurantes ↗
          </a>
          <a
            href="https://concefor.cefor.ifes.edu.br/opcoes-de-hospedagens/"
            target="_blank"
            rel="noreferrer"
          >
            Hospedagens ↗
          </a>
        </div>
        <small className="info-alert">
          Atenção: o restaurante Francischetto, ainda citado no site, está fechado.
        </small>
      </div>

      <div className="section-label">20 anos do Cefor</div>
      <div className="notice">
        Em 2026 o Cefor completa <strong>20 anos</strong> — o tema do congresso celebra essas duas
        décadas construindo novos cenários educacionais.
        <br />
        <a
          href="https://www.vitoria.es.gov.br/turista/"
          target="_blank"
          rel="noreferrer"
        >
          Guia turístico oficial de Vitória ↗
        </a>
      </div>

      <div className="section-label">Certificados</div>
      <div className="notice">
        Os certificados serão emitidos pela plataforma de inscrição (Even3), conforme os registros
        de presença. A organização avisará quando a emissão estiver disponível.
      </div>

      {/* "Fale com a organização" removido em 20/07 (decisão do Marquito) —
          volta se a organização definir um canal. */}
    </>
  );
}
