-- Seed do app do VIII Concefor (17–20/08/2026) — programação OFICIAL extraída de
-- https://concefor.cefor.ifes.edu.br/programacao/. Datas REAIS do evento (fuso -03).
-- Só dados FACTUAIS de palestrantes (nome/título/instituição onde consta); bio/foto
-- ficam null até chegar material — sem invenção. Substituir pela importação da
-- planilha quando ela existir (ver ../../links.md e spec/proximos-passos.md E6).
-- Aplicado por `npm run seed` (scripts/seed.mjs limpa as tabelas antes).

-- ───────── Palestrantes ─────────
insert into speakers (id, nome, titulo, instituicao) values
  ('vanessa-battestin', 'Vanessa Battestin',       'Profa. Dra.', null),
  ('marcia-oliveira',   'Márcia Oliveira',          'Dra.',        null),
  ('jaqueline-sanz',    'Jaqueline Sanz',           'Dra.',        null),
  ('mariella-berger',   'Mariella Berger',          'Dra.',        null),
  ('felipe-tessarolo',  'Felipe Maciel Tessarolo',  'Prof. Dr.',   'The Open University – UK'),
  ('mariano-pimentel',  'Mariano Pimentel',         'Prof. Dr.',   null);

-- ───────── Programação ─────────
insert into sessions (id, titulo, descricao, sala, eixo, palestrante, inicio, fim) values
  -- Segunda 17/08
  ('credenciamento', 'Credenciamento', 'Retirada de crachás e materiais.', null, 'Intervalo', null,
   '2026-08-17T13:30:00-03:00', '2026-08-17T14:30:00-03:00'),
  ('paralelos-abertura', 'Eventos UAB / UnAC / NTE', 'Atividades dos programas parceiros.', null, 'Evento paralelo', null,
   '2026-08-17T14:30:00-03:00', '2026-08-17T17:30:00-03:00'),
  ('momento-musical', 'Momento Musical', null, 'Auditório', 'Cultural', null,
   '2026-08-17T18:00:00-03:00', '2026-08-17T18:30:00-03:00'),
  ('abertura', 'Abertura oficial', 'Cerimônia de abertura do VIII Concefor.', 'Auditório', 'Solenidade', null,
   '2026-08-17T18:30:00-03:00', '2026-08-17T19:00:00-03:00'),
  ('palestra-vanessa', '20 anos de EaD e o Cefor', 'Palestra de abertura sobre as duas décadas do Cefor.', 'Auditório', 'Palestra', 'Profa. Dra. Vanessa Battestin',
   '2026-08-17T19:00:00-03:00', '2026-08-17T20:00:00-03:00'),
  ('celebracao', 'Celebração dos 20 anos do Cefor', 'Comemoração do aniversário de 20 anos.', 'Auditório', 'Solenidade', null,
   '2026-08-17T20:00:00-03:00', '2026-08-17T21:00:00-03:00'),

  -- Terça 18/08
  ('mostra-1', 'Mostra de Produtos e Produções Técnicas', 'Exposição de produtos e produções técnicas.', null, 'Mostra', null,
   '2026-08-18T08:00:00-03:00', '2026-08-18T09:30:00-03:00'),
  ('mesa-tecnologia-delas', 'Mesa-redonda: Tecnologia Delas', 'Protagonismo feminino em tecnologia e educação.', 'Auditório', 'Mesa-redonda', 'Dra. Márcia Oliveira · Dra. Jaqueline Sanz · Dra. Mariella Berger',
   '2026-08-18T09:30:00-03:00', '2026-08-18T11:30:00-03:00'),
  ('mostra-2', 'Mostra de Produtos e Produções Técnicas', 'Continuação da mostra.', null, 'Mostra', null,
   '2026-08-18T11:30:00-03:00', '2026-08-18T13:00:00-03:00'),
  ('sessoes-18t', 'Sessões técnicas — apresentação de artigos', 'Comunicações orais de artigos completos.', null, 'Sessões técnicas', null,
   '2026-08-18T13:30:00-03:00', '2026-08-18T14:30:00-03:00'),
  ('palestra-tessarolo', 'Palestra internacional: Tecnologia, Transformação e EaD — 20 anos', 'Conferência internacional do evento.', 'Auditório', 'Palestra', 'Felipe Maciel Tessarolo (The Open University, UK)',
   '2026-08-18T14:30:00-03:00', '2026-08-18T16:00:00-03:00'),
  ('coffee-18', 'Coffee-break', null, null, 'Intervalo', null,
   '2026-08-18T16:00:00-03:00', '2026-08-18T16:30:00-03:00'),

  -- Quarta 19/08
  ('sessoes-19m', 'Sessões técnicas — apresentação de artigos', 'Comunicações orais de artigos completos.', null, 'Sessões técnicas', null,
   '2026-08-19T08:00:00-03:00', '2026-08-19T09:00:00-03:00'),
  ('momento-cultural', 'Momento Cultural', null, 'Auditório', 'Cultural', null,
   '2026-08-19T09:00:00-03:00', '2026-08-19T09:30:00-03:00'),
  ('mesa-desafios', 'Mesa-redonda: Desafios da EaD para os próximos 20 anos', 'Debate com convidados locais.', 'Auditório', 'Mesa-redonda', 'Convidados locais',
   '2026-08-19T09:30:00-03:00', '2026-08-19T11:30:00-03:00'),
  ('sessoes-19t', 'Sessões técnicas — apresentação de artigos', 'Comunicações orais de artigos completos.', null, 'Sessões técnicas', null,
   '2026-08-19T13:30:00-03:00', '2026-08-19T14:30:00-03:00'),
  ('palestra-mariano', 'Desafios da EaD e as ondas de IA', 'Palestra sobre inteligência artificial na educação a distância.', 'Auditório', 'Palestra', 'Prof. Dr. Mariano Pimentel',
   '2026-08-19T14:30:00-03:00', '2026-08-19T16:00:00-03:00'),
  ('coffee-19', 'Coffee-break', null, null, 'Intervalo', null,
   '2026-08-19T16:00:00-03:00', '2026-08-19T16:30:00-03:00'),

  -- Quinta 20/08
  ('paralelos-1', 'Momento I — Eventos paralelos', 'Programação dos eventos paralelos (a divulgar).', null, 'Evento paralelo', null,
   '2026-08-20T09:00:00-03:00', '2026-08-20T12:00:00-03:00'),
  ('almoco', 'Almoço', null, null, 'Intervalo', null,
   '2026-08-20T12:00:00-03:00', '2026-08-20T13:30:00-03:00'),
  ('paralelos-2', 'Momento II — Eventos paralelos', 'Programação dos eventos paralelos (a divulgar).', null, 'Evento paralelo', null,
   '2026-08-20T13:30:00-03:00', '2026-08-20T16:00:00-03:00'),
  ('premiacao', 'Premiação dos Melhores Trabalhos', 'Reconhecimento dos trabalhos destaque do VIII Concefor.', 'Auditório', 'Solenidade', null,
   '2026-08-20T16:00:00-03:00', '2026-08-20T16:30:00-03:00'),
  ('encerramento', 'Coffee-break e Momento Cultural', 'Encerramento do evento.', 'Auditório', 'Cultural', null,
   '2026-08-20T16:30:00-03:00', '2026-08-20T17:30:00-03:00');

-- ───────── Vínculos sessão ↔ palestrante ─────────
insert into session_speakers (session_id, speaker_id) values
  ('palestra-vanessa',       'vanessa-battestin'),
  ('mesa-tecnologia-delas',  'marcia-oliveira'),
  ('mesa-tecnologia-delas',  'jaqueline-sanz'),
  ('mesa-tecnologia-delas',  'mariella-berger'),
  ('palestra-tessarolo',     'felipe-tessarolo'),
  ('palestra-mariano',       'mariano-pimentel');
