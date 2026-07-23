-- Enriquecimento local por cima do sync Even3 (R2). Aplicado ao final de cada
-- `npm run sync:even3` (e idempotente — insert or ignore / update com guarda).
--
-- O Even3 é a fonte da verdade da ESPINHA (dias, horários, títulos). Mas o
-- cadastro de lá está sem venue/tags/speakers (visto em 20/07). Aqui entra o
-- que sabemos da programação oficial (site + títulos/descrições do próprio
-- Even3): salas e palestrantes estruturados. Quando o Even3 passar a mandar
-- esses campos, ele vence (o sync sobrescreve venue/speakers não-nulos).
--
-- Chaveado pelo id_session do Even3 (prefixo dos nossos ids), então sobrevive
-- a mudança de horário. Sem inventar dados: só o que está publicado.

-- Palestrantes citados nos títulos/descrições do próprio Even3.
insert or ignore into speakers (id, nome, titulo, instituicao, bio, foto) values
  ('vanessa-battestin', 'Vanessa Battestin', 'Dra.', null, null, null),
  ('felipe-tessarolo', 'Felipe Maciel Tessarolo', 'Dr.', 'The Open University – UK', null, null),
  ('mariano-pimentel', 'Mariano Pimentel', 'Dr.', null, null, null);

-- Vínculos sessão ↔ palestrante (1412335 palestra Vanessa · 1412345 palestra
-- internacional Tessarolo · 1412342 mesa dia 2, "Palestrantes confirmados:
-- Felipe Tessarolo" na descrição · 1412354 palestra Mariano).
insert or ignore into session_speakers (session_id, speaker_id)
  select id, 'vanessa-battestin' from sessions where id like 'even3-1412335-%';
insert or ignore into session_speakers (session_id, speaker_id)
  select id, 'felipe-tessarolo' from sessions where id like 'even3-1412345-%';
insert or ignore into session_speakers (session_id, speaker_id)
  select id, 'felipe-tessarolo' from sessions where id like 'even3-1412342-%';
insert or ignore into session_speakers (session_id, speaker_id)
  select id, 'mariano-pimentel' from sessions where id like 'even3-1412354-%';

-- Resumo textual do palestrante (fallback dos cards) onde o sync deixou nulo.
update sessions set palestrante = 'Dra. Vanessa Battestin'
 where id like 'even3-1412335-%' and palestrante is null;
update sessions set palestrante = 'Felipe Maciel Tessarolo (The Open University, UK)'
 where id like 'even3-1412345-%' and palestrante is null;
update sessions set palestrante = 'Dr. Mariano Pimentel'
 where id like 'even3-1412354-%' and palestrante is null;

-- Salas: programação oficial do site coloca solenidades/palestras/mesas no
-- Auditório; o Even3 ainda não manda venue. Só preenche onde está nulo.
update sessions set sala = 'Auditório'
 where sala is null and (
       id like 'even3-1412334-%'   -- abertura (dia 1)
    or id like 'even3-1412335-%'   -- palestra Vanessa (dia 1)
    or id like 'even3-1412342-%'   -- mesa-redonda (dia 2)
    or id like 'even3-1412345-%'   -- palestra internacional (dia 2)
    or id like 'even3-1412350-%'   -- mesa-redonda (dia 3)
    or id like 'even3-1412354-%'   -- palestra Mariano (dia 3)
    or id like 'even3-1412365-%'); -- premiação (dia 4)
