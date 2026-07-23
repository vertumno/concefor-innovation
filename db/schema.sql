-- Esquema SQLite do app do VIII Concefor (v1) — portado de supabase/schema.sql.
-- Conceito-espinha: tudo é um registro com timestamp na linha do tempo.
-- Diferenças do Postgres: uuid -> text (id gerado no app), timestamptz -> text
-- ISO-8601, jsonb -> text (JSON serializado). Idempotente: aplicado na init de lib/db.ts.
-- Ver spec em ../../spec/app-v1.md

-- =========================================================
-- sessions: a programação (a espinha da linha do tempo)
-- =========================================================
create table if not exists sessions (
  id          text primary key,
  titulo      text not null,
  descricao   text,
  sala        text,
  eixo        text,
  palestrante text,
  inicio      text not null,   -- ISO-8601 com offset (ex.: 2026-08-17T19:00:00-03:00)
  fim         text,            -- idem, ou null
  created_at  text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

create index if not exists idx_sessions_inicio on sessions (inicio);
create index if not exists idx_sessions_eixo   on sessions (eixo);

-- =========================================================
-- speakers: palestrantes como entidade estruturada
-- (não só texto). bio/foto a preencher quando houver.
-- =========================================================
create table if not exists speakers (
  id          text primary key,
  nome        text not null,
  titulo      text,                 -- "Profa. Dra.", "Prof. Dr.", "Dra." …
  instituicao text,
  bio         text,
  foto        text,                 -- URL da foto
  created_at  text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- relação N:N: uma mesa-redonda tem vários palestrantes; um palestrante
-- pode estar em várias sessões.
create table if not exists session_speakers (
  session_id text references sessions(id) on delete cascade,
  speaker_id text references speakers(id) on delete cascade,
  primary key (session_id, speaker_id)
);

-- =========================================================
-- attendees: inscritos sincronizados do Even3 (R7 — login).
-- PII (nome, e-mail, CPF) fica SÓ no servidor; nenhuma rota pública expõe.
-- documento é normalizado para dígitos no sync (CPF vem "000.000.000-00").
-- =========================================================
create table if not exists attendees (
  id           integer primary key,   -- id_attendees do Even3
  checkin_code text not null,         -- nº do ingresso (QR do crachá Even3)
  nome         text not null,
  badge_name   text,
  email        text,
  documento    text,                  -- CPF, só dígitos
  categoria    text,
  foto         text,
  confirmado   integer,
  updated_at   text
);

create index if not exists idx_attendees_checkin on attendees (checkin_code);

-- =========================================================
-- identities: associação client_id (dispositivo) ↔ inscrito, criada no login
-- com consentimento (LGPD). Apagar a linha = "sair".
-- =========================================================
create table if not exists identities (
  client_id   text primary key,
  attendee_id integer not null references attendees(id) on delete cascade,
  nome        text not null,          -- desnormalizado p/ exibir sem join
  consent_ts  text not null           -- quando aceitou o termo
);

-- =========================================================
-- timeline_events: todo evento da linha do tempo
-- v1 usa tipo='reaction'; fase 2 estende (pergunta, foto, anotacao, checkin...)
-- sem PII no v1 (client_id é id anônimo de dispositivo)
-- =========================================================
create table if not exists timeline_events (
  id          text primary key,
  tipo        text not null,                       -- 'reaction' | 'checkin' | ...
  session_id  text references sessions(id) on delete set null,
  ts          text not null,                       -- ISO-8601 (gerado no app)
  payload     text not null default '{}',          -- JSON serializado, ex.: {"reaction":"heart"}
  client_id   text
);

create index if not exists idx_events_session_ts on timeline_events (session_id, ts);
create index if not exists idx_events_tipo_ts     on timeline_events (tipo, ts);
