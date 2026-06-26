// Modo demonstração: programação OFICIAL do VIII Concefor (17–20/08/2026),
// extraída de https://concefor.cefor.ifes.edu.br/programacao/.
// Datas são REAIS do evento. Como o evento é futuro, o "agora" do app é
// simulado por um relógio de demonstração (ver clock.ts) para a demo ficar viva.
//
// Opt-in por flag: liga só com NEXT_PUBLIC_DEMO=1. Atalho: `npm run dev:demo`.
// Ver app/.env.example e app/README.md.

import type { Session, Speaker } from "./types";

export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO === "1";

// Palestrantes estruturados. Só dados FACTUAIS da programação oficial
// (nome, título, e instituição onde consta). bio/foto a preencher — sem invenção.
const SPEAKERS: Speaker[] = [
  { id: "vanessa-battestin", nome: "Vanessa Battestin", titulo: "Profa. Dra.", instituicao: null, bio: null, foto: null },
  { id: "marcia-oliveira", nome: "Márcia Oliveira", titulo: "Dra.", instituicao: null, bio: null, foto: null },
  { id: "jaqueline-sanz", nome: "Jaqueline Sanz", titulo: "Dra.", instituicao: null, bio: null, foto: null },
  { id: "mariella-berger", nome: "Mariella Berger", titulo: "Dra.", instituicao: null, bio: null, foto: null },
  { id: "felipe-tessarolo", nome: "Felipe Maciel Tessarolo", titulo: "Prof. Dr.", instituicao: "The Open University – UK", bio: null, foto: null },
  { id: "mariano-pimentel", nome: "Mariano Pimentel", titulo: "Prof. Dr.", instituicao: null, bio: null, foto: null },
];

export function getDemoSpeakers(): Speaker[] {
  return SPEAKERS;
}
export function getSpeakerById(id: string): Speaker | undefined {
  return SPEAKERS.find((s) => s.id === id);
}

// Âncora do relógio de demonstração: 18/08 09:30 (mesa "Tecnologia Delas" no ar).
// O relógio corre 1:1 a partir daqui (ver clock.ts).
export const DEMO_ANCHOR = { year: 2026, month: 8, day: 18, hour: 9, minute: 30 };

type Raw = Omit<Session, "inicio" | "fim"> & { d: number; ini: string; fim: string };

// d = dia do mês (ago/2026). ini/fim em HH:MM (horário local -03).
const PROGRAMA: Raw[] = [
  // ───────── Segunda 17/08 ─────────
  { id: "credenciamento", d: 17, ini: "13:30", fim: "14:30", titulo: "Credenciamento", descricao: "Retirada de crachás e materiais.", sala: null, eixo: "Intervalo", palestrante: null },
  { id: "paralelos-abertura", d: 17, ini: "14:30", fim: "17:30", titulo: "Eventos UAB / UnAC / NTE", descricao: "Atividades dos programas parceiros.", sala: null, eixo: "Evento paralelo", palestrante: null },
  { id: "momento-musical", d: 17, ini: "18:00", fim: "18:30", titulo: "Momento Musical", descricao: null, sala: "Auditório", eixo: "Cultural", palestrante: null },
  { id: "abertura", d: 17, ini: "18:30", fim: "19:00", titulo: "Abertura oficial", descricao: "Cerimônia de abertura do VIII Concefor.", sala: "Auditório", eixo: "Solenidade", palestrante: null },
  { id: "palestra-vanessa", d: 17, ini: "19:00", fim: "20:00", titulo: "20 anos de EaD e o Cefor", descricao: "Palestra de abertura sobre as duas décadas do Cefor.", sala: "Auditório", eixo: "Palestra", palestrante: "Profa. Dra. Vanessa Battestin", speakerIds: ["vanessa-battestin"] },
  { id: "celebracao", d: 17, ini: "20:00", fim: "21:00", titulo: "Celebração dos 20 anos do Cefor", descricao: "Comemoração do aniversário de 20 anos.", sala: "Auditório", eixo: "Solenidade", palestrante: null },

  // ───────── Terça 18/08 ─────────
  { id: "mostra-1", d: 18, ini: "08:00", fim: "09:30", titulo: "Mostra de Produtos e Produções Técnicas", descricao: "Exposição de produtos e produções técnicas.", sala: null, eixo: "Mostra", palestrante: null },
  { id: "mesa-tecnologia-delas", d: 18, ini: "09:30", fim: "11:30", titulo: "Mesa-redonda: Tecnologia Delas", descricao: "Protagonismo feminino em tecnologia e educação.", sala: "Auditório", eixo: "Mesa-redonda", palestrante: "Dra. Márcia Oliveira · Dra. Jaqueline Sanz · Dra. Mariella Berger", speakerIds: ["marcia-oliveira", "jaqueline-sanz", "mariella-berger"] },
  { id: "mostra-2", d: 18, ini: "11:30", fim: "13:00", titulo: "Mostra de Produtos e Produções Técnicas", descricao: "Continuação da mostra.", sala: null, eixo: "Mostra", palestrante: null },
  { id: "sessoes-18t", d: 18, ini: "13:30", fim: "14:30", titulo: "Sessões técnicas — apresentação de artigos", descricao: "Comunicações orais de artigos completos.", sala: null, eixo: "Sessões técnicas", palestrante: null },
  { id: "palestra-tessarolo", d: 18, ini: "14:30", fim: "16:00", titulo: "Palestra internacional: Tecnologia, Transformação e EaD — 20 anos", descricao: "Conferência internacional do evento.", sala: "Auditório", eixo: "Palestra", palestrante: "Prof. Dr. Felipe Maciel Tessarolo (The Open University – UK)", speakerIds: ["felipe-tessarolo"] },
  { id: "coffee-18", d: 18, ini: "16:00", fim: "16:30", titulo: "Coffee-break", descricao: null, sala: null, eixo: "Intervalo", palestrante: null },

  // ───────── Quarta 19/08 ─────────
  { id: "sessoes-19m", d: 19, ini: "08:00", fim: "09:00", titulo: "Sessões técnicas — apresentação de artigos", descricao: "Comunicações orais de artigos completos.", sala: null, eixo: "Sessões técnicas", palestrante: null },
  { id: "momento-cultural", d: 19, ini: "09:00", fim: "09:30", titulo: "Momento Cultural", descricao: null, sala: "Auditório", eixo: "Cultural", palestrante: null },
  { id: "mesa-desafios", d: 19, ini: "09:30", fim: "11:30", titulo: "Mesa-redonda: Desafios da EaD para os próximos 20 anos", descricao: "Debate com convidados locais.", sala: "Auditório", eixo: "Mesa-redonda", palestrante: "Convidados locais" },
  { id: "sessoes-19t", d: 19, ini: "13:30", fim: "14:30", titulo: "Sessões técnicas — apresentação de artigos", descricao: "Comunicações orais de artigos completos.", sala: null, eixo: "Sessões técnicas", palestrante: null },
  { id: "palestra-mariano", d: 19, ini: "14:30", fim: "16:00", titulo: "Desafios da EaD e as ondas de IA", descricao: "Palestra sobre inteligência artificial na educação a distância.", sala: "Auditório", eixo: "Palestra", palestrante: "Prof. Dr. Mariano Pimentel", speakerIds: ["mariano-pimentel"] },
  { id: "coffee-19", d: 19, ini: "16:00", fim: "16:30", titulo: "Coffee-break", descricao: null, sala: null, eixo: "Intervalo", palestrante: null },

  // ───────── Quinta 20/08 ─────────
  { id: "paralelos-1", d: 20, ini: "09:00", fim: "12:00", titulo: "Momento I — Eventos paralelos", descricao: "Programação dos eventos paralelos (a divulgar).", sala: null, eixo: "Evento paralelo", palestrante: null },
  { id: "almoco", d: 20, ini: "12:00", fim: "13:30", titulo: "Almoço", descricao: null, sala: null, eixo: "Intervalo", palestrante: null },
  { id: "paralelos-2", d: 20, ini: "13:30", fim: "16:00", titulo: "Momento II — Eventos paralelos", descricao: "Programação dos eventos paralelos (a divulgar).", sala: null, eixo: "Evento paralelo", palestrante: null },
  { id: "premiacao", d: 20, ini: "16:00", fim: "16:30", titulo: "Premiação dos Melhores Trabalhos", descricao: "Reconhecimento dos trabalhos destaque do VIII Concefor.", sala: "Auditório", eixo: "Solenidade", palestrante: null },
  { id: "encerramento", d: 20, ini: "16:30", fim: "17:30", titulo: "Coffee-break e Momento Cultural", descricao: "Encerramento do evento.", sala: "Auditório", eixo: "Cultural", palestrante: null },
];

function iso(day: number, hhmm: string): string {
  const [h, m] = hhmm.split(":");
  // Horário do evento em Vitória-ES (UTC-3).
  return `2026-08-${String(day).padStart(2, "0")}T${h}:${m}:00-03:00`;
}

export function getDemoSessions(): Session[] {
  return PROGRAMA.map(({ d, ini, fim, ...s }) => ({
    ...s,
    inicio: iso(d, ini),
    fim: iso(d, fim),
  }));
}
