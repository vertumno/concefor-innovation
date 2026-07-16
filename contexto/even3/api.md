# API do Even3 — o que temos e como usar

Explorada e validada em **16/07/2026** com a chave real do VIII Concefor (funcionou).
Docs oficiais: <https://docs.even3.com.br/> (versões markdown: acrescente `.md` à URL;
índice em `/llms.txt`).

**Política atual: somente LEITURA.** Escrita (check-in/credenciamento) fica para decisão
futura — os endpoints estão mapeados na seção "Escrita" abaixo, mas não usamos.

## Autenticação e base

- **Base:** `https://www.even3.com.br/api/v1/`
- **Header:** `Authorization-Token: <chave>` em toda requisição. Respostas JSON: `{ data: [...], count: n }`.
- **A chave é do organizador do evento** (evento → Configurações → Integrações). Dá acesso
  a PII dos inscritos (nome, e-mail, CPF) — trate como segredo.
- **Onde a chave vive:** `app/.env.local` (`EVEN3_API_TOKEN`) — **gitignored**, nunca
  commitar. Placeholder documentado em `app/.env.example`.

## Endpoints de leitura (validados em 16/07/2026)

| Recurso | Endpoint | O que retorna |
|---|---|---|
| Evento | `GET /event` | Título, datas (17/08 18:00 → 20/08 18:00), inscrição até 12/08, cidade/venue, lat/long, ingressos por categoria com contagem |
| Inscritos | `GET /attendees/` | Lista completa (**288 registros em 16/07**); `/:id` para um só |
| Programação | `GET /session/getschedule` | Programação agrupada por dia (**4 dias já cadastrados**), sessões com horário, local, descrição, palestrantes |
| Atividade | `GET /session/:id` | Uma atividade (título, descrição, local, horários, palestrantes, capacidade) |
| Palestrante | `GET /speaker/:id` | Nome, foto, minibio, redes sociais |

### Campos do inscrito (`attendees`) — visto na resposta real

```
id_attendees      346465            (id interno Even3)
id_event          735693            (id do VIII Concefor)
checkin_code      71369979          ← o nº do ingresso de 8 dígitos — MESMO código do QR do crachá
name / badge_name / email / document (CPF) / gender / photo
confirmed         bool
registration_category / registration_date / registration_hour (vieram vazios em alguns registros)
```

**Achados que resolvem pendências antigas** (ver `README.md` desta pasta):

1. **`checkin_code` = nº do ingresso do crachá.** O QR do crachá codifica exatamente esse
   campo — o login pelo crachá casa direto com a API, sem export manual.
2. **Não existe data de nascimento no cadastro.** A reunião de 02/07 tendia a usá-la como
   segundo fator do login — não dá. Os candidatos reais são **CPF (`document`)** — completo
   ou parcial — ou e-mail.
3. **Lista viva, não estática:** a API reflete inscrições de última hora (a preocupação da
   reunião de 16/07 com export estático não existe mais).
4. **A programação oficial já está no Even3** (4 dias) — dá para importar por API em vez de
   esperar planilha (pendência de `links.md` / etapa E6 do plano antigo).

### Peculiaridade observada

`getschedule` retornou sessões **duplicadas** dentro do mesmo dia (mesmo `id_session`
repetido, com `all_dates` também duplicado) — deduplicar por `id_session` na importação.

## Escrita (mapeada, NÃO usada por ora)

Para um eventual credenciamento pelo app, existem:

- `POST /checkin/attendees` — check-in do participante no evento.
- `POST /checkin/sessions` — check-in do participante em uma atividade.

Ambos recebem arrays e respondem `"OK"`. Decisão de usar (ou não) fica para depois do v1.

## Outros grupos de endpoints (não relevantes por ora)

Pagamentos, Submissão, Empresas, Página do evento, Certificados — ver docs oficiais.

## Como o app consome (padrão decidido)

O app **não** chama o Even3 do cliente. Um **sync no servidor** (script/rota admin) puxa
programação, palestrantes e inscritos para o SQLite local; o app serve tudo do banco
próprio. Motivos: a chave não pode vazar pro navegador, o evento não pode depender da
internet (LAN sobrevive a queda — ver `decisoes.md` 2026-07-06) e a API é rate-limitada
por bom senso (sync periódico, não uma chamada por usuário).
