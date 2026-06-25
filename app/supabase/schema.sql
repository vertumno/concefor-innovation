-- Esquema do app do VIII Concefor (v1)
-- Conceito-espinha: tudo é um registro com timestamp na linha do tempo.
-- Ver spec em ../../spec/app-v1.md

-- =========================================================
-- sessions: a programação (a espinha da linha do tempo)
-- =========================================================
create table if not exists sessions (
  id          uuid primary key default gen_random_uuid(),
  titulo      text not null,
  descricao   text,
  sala        text,
  eixo        text,
  palestrante text,
  inicio      timestamptz not null,
  fim         timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists idx_sessions_inicio on sessions (inicio);
create index if not exists idx_sessions_eixo   on sessions (eixo);

-- =========================================================
-- timeline_events: todo evento da linha do tempo
-- v1 usa tipo='reaction'; fase 2 estende (pergunta, foto, anotacao, checkin...)
-- sem PII no v1 (client_id é id anônimo de dispositivo)
-- =========================================================
create table if not exists timeline_events (
  id          uuid primary key default gen_random_uuid(),
  tipo        text not null,                       -- 'reaction' | 'checkin' | ...
  session_id  uuid references sessions(id) on delete set null,
  ts          timestamptz not null default now(),
  payload     jsonb not null default '{}'::jsonb,  -- ex.: {"reaction":"heart"}
  client_id   text
);

create index if not exists idx_events_session_ts on timeline_events (session_id, ts);
create index if not exists idx_events_tipo_ts     on timeline_events (tipo, ts);

-- =========================================================
-- Realtime: publicar timeline_events para o canal do telão
-- (no Supabase: habilitar Realtime na tabela via dashboard ou abaixo)
-- =========================================================
-- alter publication supabase_realtime add table timeline_events;

-- =========================================================
-- TODO (fase 2): RLS policies, tabela de perguntas/upvotes,
-- check-in por QR do crachá, anotações colaborativas.
-- =========================================================
