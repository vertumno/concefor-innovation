# Decisões

Log datado das decisões do projeto, com o porquê. Mais recente no topo.

---

## 2026-06-25 — Escopo do app v1: 3 coisas, nada mais

**Decisão:** o v1 do app entrega exatamente três coisas:
1. **Programação viva + "agora/depois"** (navegação por linha do tempo)
2. **Reações ao vivo no telão** (joinha/coração durante palestras)
3. **Dashboard / relatório final** (requisito fixo)

Todo o resto do brainstorm (perguntas com upvote, anotação colaborativa→PDF, networking por QR,
gamificação, AR/Easter eggs, instagramável, animações em tempo real, tangíveis) vai para **fase 2**.

**Por quê:** o objetivo é "causar com simplicidade" em ~7,5 semanas. As três features caem do
mesmo modelo de dados (tudo com timestamp), então o custo marginal de tê-las juntas é baixo e o
risco de não entregar é o que mais importa controlar. Ver `contexto/brainstorm/sintese-ideias.md`.

---

## 2026-06-25 — Monorepo: o app mora dentro do cérebro

**Decisão:** o código do app fica em `app/` dentro de `concefor-innovation` (não em repo separado).

**Por quê:** resolve a dor central do projeto — "tem que ter algum lugar que é o cérebro". Um
repo só: contexto + spec + decisões + código, histórico único, fácil de achar. Para não complicar
o deploy, o `app/` é **auto-contido e deploy-agnóstico** (Next.js `output: standalone` +
Dockerfile): roda no Vercel (Root Directory = `app/`) **ou** em servidor próprio do Cefor.

---

## 2026-06-25 — Stack: PWA Next.js + Supabase

**Decisão:** PWA (Next.js + `next-pwa`), Supabase (Postgres + Realtime), deploy Vercel ou
self-host. Sem app store — instalável via "adicionar à tela inicial".

**Por quê:** alinhado ao caminho já catalogado `web-app-vercel-supabase`. Supabase Realtime
resolve nativamente as reações ao vivo. PWA evita fricção de loja e funciona em qualquer celular.

---

## 2026-06-25 — Premissa: IA local no Cefor

**Decisão:** assumir que haverá uma **IA local rodando no Cefor** durante o evento, disponível
como recurso (endpoint interno).

**Por quê:** não é necessária no v1, mas destrava features de fase 2 (transcrição em tempo real,
resumo automático de palestras, filtro de perguntas por palavrão/má-intenção) **sem custo por
token** de API externa. Alinha com a regra de hard-cap/anti-loop em bots — preferir IA local onde
der, e qualquer uso de IA externa entra com teto.
