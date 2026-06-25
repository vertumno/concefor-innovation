-- Seed de exemplo para desenvolvimento local (NÃO é a programação oficial).
-- Substituir pela importação da planilha oficial (ver links.md) quando ela existir.
-- Datas no fuso do evento (Vitória-ES, UTC-3); ajuste se necessário.

insert into sessions (titulo, descricao, sala, eixo, palestrante, inicio, fim) values
  ('Abertura — 20 anos construindo cenários educacionais',
   'Mesa de abertura do VIII Concefor.', 'Auditório', 'Institucional',
   'Comissão Organizadora',
   '2026-08-17T09:00:00-03:00', '2026-08-17T10:00:00-03:00'),

  ('Palestra: o futuro da EaD',
   'Tendências de educação a distância para a próxima década.', 'Auditório', 'Tecnologia',
   'Convidado(a) 1',
   '2026-08-17T10:30:00-03:00', '2026-08-17T11:30:00-03:00'),

  ('Apresentação de trabalhos — Sala A',
   'Bloco de comunicações orais.', 'Sala A', 'Pesquisa',
   'Diversos',
   '2026-08-17T14:00:00-03:00', '2026-08-17T15:30:00-03:00'),

  ('Oficina: Remotion na prática',
   'Animações programáticas para o evento.', 'Lab 1', 'Tecnologia',
   'Convidado(a) 2',
   '2026-08-18T09:00:00-03:00', '2026-08-18T11:00:00-03:00'),

  ('Mesa-redonda: transformação e educação',
   'Debate sobre os eixos do evento.', 'Auditório', 'Transformação',
   'Painelistas',
   '2026-08-18T14:00:00-03:00', '2026-08-18T15:30:00-03:00');
