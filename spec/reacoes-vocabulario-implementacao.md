# Plano de implementação — vocabulário novo das reações

> **Para quem vai executar.** Autocontido: conjunto final, código exato, commits e
> verificação. Branch: **`feat/reacoes-vocabulario`** (já criado, alinhado ao `main`).
>
> **Escopo:** trocar rótulos, ícones e ordem das reações. Só isso.
> **Fora de escopo:** testes, CI, scripts novos, mecânica de reação, SSE, layout do telão,
> perguntas, `next-pwa`.

---

## 1. Por quê

As cinco reações atuais (`❤️ Adorei · 👏 Parabéns · 🤩 Uau! · 😮 Nossa! · 😢 Que triste`)
nasceram junto com o telão (commit `73a19cd`) sem decisão registrada — eram o menu do
Facebook menos o "haha" e o "grr". Três diziam a mesma coisa, "Que triste" era ambíguo ao
vivo, e nenhuma media o que interessa a um evento de educação.

Entram frases em primeira pessoa, ordenadas por intensidade, com um nome institucional
paralelo para o relatório. Fundamentação completa: Passo 5 (texto pronto para `decisoes.md`).

---

## 2. O conjunto definitivo

A ordem do array é a ordem da tela, e sobe em intensidade: *gostei → me tocou → é sobre
mim → vou agir → mudou tudo*.

| # | `kind` | Ícone | `label` (app e telão) | `labelRelatorio` |
|---|---|---|---|---|
| 1 | `massa` | 👏 | Que massa | Satisfação |
| 2 | `amei` | ♥ ciano | Amei | Afeto |
| 3 | `identifico` | 🙋 | Me identifico | Relevância |
| 4 | `usar` | ✅ | Vou usar | Intenção de aplicação |
| 5 | `explodiu` | 🤯 | Explodiu a mente | Aprendizagem |

**O coração não é emoji.** É o caractere `♥` (U+2665) seguido do seletor de apresentação
textual (U+FE0E). Sendo texto, ele **herda a cor do CSS** — fica no ciano da marca e, na
impressão, vira teal escuro sozinho, porque o `@media print` de `globals.css` já redefine
esse token.

---

## 3. Alterações no código — 4 arquivos

### 3.1 `app/src/lib/reactions.ts`

Substituir **apenas** o comentário do topo e o array. O resto do arquivo (`ReactionKind`,
`REACTION_KINDS`, `isReactionKind`, `ReactionCounts`, `emptyCounts`) fica intacto.

```ts
// Reações da sessão ao vivo (E2/E3). Conjunto FECHADO — ícone + rótulo em texto
// (o rótulo aparece na UI e no telão, para não depender de decodificar o emoji).
// Fonte ÚNICA para a UI, a API e a agregação: quem valida no servidor e quem
// desenha os botões olham para cá. Módulo isomórfico (sem dependências de node).
//
// A ORDEM é a da tela e sobe em intensidade: gostei → me tocou → é sobre mim →
// vou agir → mudou tudo. `labelRelatorio` é o nome institucional: o relatório
// fica arquivado e a gíria envelhece. Fundamentação: decisoes.md (2026-07-30).
//
// "amei" usa o CARACTERE ♥ (U+2665) + seletor de texto (U+FE0E), não o emoji
// ❤️ — assim ele herda a cor do CSS (ciano da marca; teal escuro na impressão).

export const REACTIONS = [
  { kind: "massa", emoji: "👏", label: "Que massa", labelRelatorio: "Satisfação" },
  { kind: "amei", emoji: "\u2665\uFE0E", label: "Amei", labelRelatorio: "Afeto" },
  { kind: "identifico", emoji: "🙋", label: "Me identifico", labelRelatorio: "Relevância" },
  { kind: "usar", emoji: "✅", label: "Vou usar", labelRelatorio: "Intenção de aplicação" },
  { kind: "explodiu", emoji: "🤯", label: "Explodiu a mente", labelRelatorio: "Aprendizagem" },
] as const;
```

⚠️ Escrever o coração com os **escapes ASCII** exatamente como acima (`"♥︎"`). O
seletor de texto é um caractere invisível e não sobrevive a copiar e colar; sem ele, várias
plataformas trocam o ♥ por ❤️ emoji e a cor do CSS deixa de valer.

Conferir depois de salvar:

```bash
cd app
node --experimental-strip-types -e "import('./src/lib/reactions.ts').then(m=>{const a=m.REACTIONS.find(r=>r.kind==='amei');console.log([...a.emoji].map(c=>c.codePointAt(0).toString(16)))})"
# esperado: [ '2665', 'fe0e' ]
```

### 3.2 `app/src/app/admin/relatorio/page.tsx` — uma linha

Linha 51: o relatório passa a mostrar o nome institucional em vez da gíria.

```ts
const labelDe = (kind: string) =>
  REACTIONS.find((r) => r.kind === kind)?.labelRelatorio ?? kind;
```

O fallback `?? kind` é proposital: registro com código antigo aparece cru, sem quebrar.

### 3.3 `app/src/app/tokens.css` — um token

"Me identifico" tem uma palavra de 10 letras e não cabe a 12px no botão de ~54px. Adicionar
junto dos outros tamanhos (linha ~76):

```css
  --text-2xs: 0.6875rem; /* 11px — rótulo dos botões de reação (frases curtas) */
```

### 3.4 `app/src/app/globals.css` — duas mudanças

⚠️ O cabeçalho do arquivo proíbe cor e medida literais: **consumir tokens**.

**a)** `.reaction-label` (linha ~810): `font-size: var(--text-xs)` → `var(--text-2xs)`.

**b)** Bloco novo, logo depois de `.reaction-label`:

```css
/* "Amei" não é emoji: é o caractere ♥ (texto), e por isso obedece a `color`.
   Os emojis vizinhos ignoram essa propriedade — têm cor própria —, então a
   regra pode valer para todos os ícones sem efeito colateral. No @media print
   o token --cyan-300 já vira teal escuro: a variante de impressão sai de graça. */
.reaction-emoji,
.fly,
.telao-emoji,
.telao-floater {
  color: var(--cyan-300);
}
```

**Nenhuma alteração em `Reactions.tsx` nem em `Telao.tsx`.**

---

## 4. Dados já gravados

As reações vivem em `timeline_events` como `{"reaction":"uau"}`. Com os códigos novos, os
registros antigos somem da contagem por tipo mas continuam no total geral, e o relatório os
lista com o código cru. **Tudo que existe é reação de teste** — nada é dado real do evento.

Quando quiser limpar (opcional, não faz parte da entrega):

```bash
cd app
node -e "const D=require('better-sqlite3');const db=new D(process.env.DATABASE_PATH||'./data/concefor.db');console.log(db.prepare(\"delete from timeline_events where tipo='reaction' and json_extract(payload,'\$.reaction') in ('adorei','parabens','uau','nossa','triste')\").run().changes+' removidas')"
```

---

## 5. Fundamentação para `decisoes.md`

Inserir **no topo**, logo depois do `---` do cabeçalho, antes da entrada de 2026-07-29:

````markdown
## 2026-07-30 — Vocabulário novo das reações: da emoção genérica para o que a pessoa faz com aquilo

**Decisão (Elton, 29–30/07):** as cinco reações da sessão ao vivo trocam de vocabulário.
Sai o conjunto de afeto genérico, entra um conjunto de **frases em primeira pessoa**, na
ordem em que aparecem na tela:

| # | Ícone | App e telão | Relatório | Kirkpatrick |
|---|---|---|---|---|
| 1 | 👏 | Que massa | Satisfação | N1 |
| 2 | ♥ ciano | Amei | Afeto | N1 |
| 3 | 🙋 | Me identifico | Relevância | N1 |
| 4 | ✅ | Vou usar | Intenção de aplicação | N2→N3 |
| 5 | 🤯 | Explodiu a mente | Aprendizagem | N2 |

Substitui `❤️ Adorei · 👏 Parabéns · 🤩 Uau! · 😮 Nossa! · 😢 Que triste`.

**De onde vinha o conjunto antigo:** nasceu junto com o telão (commit `73a19cd`), sem
nenhuma decisão registrada — era o menu de reações do Facebook menos o "haha" e o "grr".
Herança de rede social, não escolha para uma palestra.

**Os quatro problemas que ele tinha:**

1. **Três botões diziam a mesma coisa.** Adorei, Parabéns e Uau! são todos aprovação. A
   pessoa gastava o único momento de atenção que tem escolhendo entre sinônimos, e o telão
   somava tudo num batimento só: custo de decisão alto, informação nova zero.
2. **"Que triste" era órfão e arriscado.** Único fora do eixo e ambíguo (triste com o
   conteúdo? com a palestra? emocionado?). Ao vivo, com o palestrante olhando o telão, um
   contador de tristeza subindo é convite ao mal-entendido.
3. **Nada capturava o que interessa a um evento de educação:** "isso eu uso segunda-feira",
   "não sabia disso", "é exatamente a minha realidade".
4. **O dado não virava frase de relatório.** "43 corações" não diz nada à Direção; "9
   pessoas declararam que vão levar isso para a prática" é indicador de impacto — e o
   relatório final é requisito fixo do v1.

**A régua da ordem: intensidade crescente.** A barra sobe da esquerda para a direita —
*gostei → me tocou → é sobre mim → vou agir → mudou tudo* — com "Explodiu a mente" como
clímax. No telão isso vira gráfico: uma palestra com 40/36/15/3/1 e outra com 40/38/31/22/9
contam histórias opostas na mesma barra, sem ninguém precisar explicar.

**A amarração com Kirkpatrick** (níveis de avaliação de ações formativas) dá ao relatório
uma linguagem que a Direção e a PRPPG reconhecem: N1 reação (satisfação, afeto,
relevância), N2 aprendizagem (mudou o modelo mental), N2→N3 intenção de aplicação — o
melhor preditor disponível de transferência para o trabalho. O app não mede o N3 real
(comportamento semanas depois) nem o N4 (resultados institucionais); mede o preditor **no
instante em que a fala acontece**, que é mais do que um formulário enviado dias depois
consegue. Pela régua estrita do modelo, "Vou usar" é mais profundo que "Explodiu a mente" —
a ordem da tela é de intensidade sentida, não de nível formativo; os níveis valem por
reação, no relatório.

**Princípios usados para escolher cada termo:**

- **Uma reação = uma intenção distinta.** Se dois botões podem ser clicados pelo mesmo
  motivo, um deles é ruído.
- **Verbo da pessoa, não adjetivo do conteúdo.** "Vou usar" é compromisso mensurável;
  "Uau" é reflexo. Rótulo-ação produz dado mais honesto: a pessoa só clica se for verdade.
  Foi o que descartou "Útil na prática" (adjetivo sobre o conteúdo, cheiro de formulário).
- **O ícone carrega o objeto, o texto carrega o verbo.** 🤯 já mostra a cabeça explodindo.
- **Cada reação vira uma linha do relatório.** Se não gera frase útil, não merece um botão.

**A régua de espaço (por que os rótulos são curtos):** o botão é um grid de 5 colunas; num
celular de 360px sobram **~54px úteis por botão** — no máximo duas linhas curtas. Foi essa
régua, e não o gosto, que derrubou "Minha cabeça explodiu" e "Falou por mim", e que levou o
corpo do rótulo de 12px para 11px por causa de "identifico" (10 letras).

**Alternativas testadas e por que caíram:**

- **"Tá pago" → "Que massa":** a primeira era gíria de nicho e, pior, ambígua dentro de um
  app que tem ingresso e inscrição (podia ser lida como *pagamento confirmado*).
- **"Falou por mim" → "Me identifico":** três palavras não cabiam; o sentido sobrevive.
- **"Caiu a ficha":** três palavras deixariam a coluna mais alta que as vizinhas.
- **"Tô chocado":** flexiona gênero — o app tem regra de **linguagem neutra** (README do
  app, decisão de 20/07). Serve de filtro geral: nada com "-ado/-ada".
- **"Para a vida":** era o degrau mais alto (transformação pessoal, além do N3), mas saiu
  para abrir espaço ao "Amei" — o eixo afetivo pesa mais num evento de 20 anos, com
  homenagens e momento cultural. O relatório perde o indicador de transformação e ganha o
  de afeto; a barra ganha um terceiro clique barato, e clique barato é o que faz o
  batimento do telão pulsar.
- **"Quero entender melhor" (dúvida):** cortada por decisão do Elton. O conjunto fica
  **todo positivo** — escolha consciente: protege o clima da sala e o palestrante, e joga a
  avaliação crítica para o formulário oficial do Even3.

**Por que o "Amei" não é emoji.** O app é navy (`--surface: #173f73`) e o telão é um
gradiente azul-escuro: medindo o contraste, ❤️ dá ≈2,5:1 e 💙 ≈3,2:1 sobre o botão — azul
sobre azul não tem contraste nem de brilho nem de matiz. A saída foi usar o **caractere ♥
(U+2665 + seletor de texto)**, que não é emoji e por isso **herda a cor do CSS**: fica
`--cyan-300` (#00ddca, a cor da marca e da linha do batimento) no app e no telão, ≈6,1:1 e
≈9,4:1, e vira automaticamente o teal escuro `#0e8fa8` na impressão, porque o `@media
print` já redefine esse token. Resolve contraste, identidade e risco de renderização de uma
vez — 🩵 (coração azul-claro) foi descartado por ser Unicode 15 (2023), que não existe em
celular Android antigo nem em Windows desatualizado.

**Três rótulos para o mesmo dado.** O rótulo curto serve app e telão (`Vou usar` /
`VOU USAR`); o institucional serve o relatório (`Intenção de aplicação`). Motivo: gíria
envelhece e o app dura quatro dias — o relatório fica arquivado.

**Impacto nos dados já gravados:** as reações vivem em `timeline_events` como
`{"reaction":"uau"}`. Com os códigos novos elas ficam órfãs — somem da contagem por tipo
mas continuam no total geral, e o relatório as lista com o código cru. Como tudo que existe
é **reação de teste**, elas podem ser apagadas com um `delete` simples (ver
`spec/reacoes-vocabulario-implementacao.md`), sem código de compatibilidade. Depois de
17/08 isso seria migração; agora é grátis.
````

---

## 6. Commits

No branch `feat/reacoes-vocabulario`, mensagens em conventional commits terminando com a
linha de co-autoria usada no repo.

| # | Arquivos | Mensagem |
|---|---|---|
| 1 | `reactions.ts`, `relatorio/page.tsx`, `tokens.css`, `globals.css` | `feat(reacoes): vocabulário novo — frases em 1ª pessoa, ordem por intensidade` |
| 2 | `decisoes.md` | `docs(reacoes): fundamentação da troca de vocabulário` |

---

## 7. Verificação

```bash
cd app
npx tsc --noEmit   # o projeto não tem script typecheck
npm run build
npm run dev -- -H 0.0.0.0 -p 3000
```

Com `npm run seed:demo` rodado, há uma sessão ao vivo para testar.

| O quê | Onde | Critério |
|---|---|---|
| Botões | celular, na sessão ao vivo | cinco caixas da mesma altura; "Me identifico" e "Explodiu a mente" em duas linhas, sem hifenizar |
| Coração | idem | o ♥ aparece **ciano**, não vermelho — no botão e no emoji que voa ao tocar |
| Telão | `/telao` em 1920×1080 e 1366×768 | os cinco rótulos numa linha só; ♥ ciano legível sobre o gradiente |
| Tempo real | celular + telão juntos | reagir no celular pulsa o batimento em <2s |
| Relatório | `/admin/relatorio` → Imprimir | nomes institucionais na tabela; em preto e branco, nada depende do ícone |

Se o ♥ ficar oticamente menor que os emojis vizinhos, é o único ajuste a fazer no olho:
acrescentar `font-size: 1.15em` ao bloco de cor (valor entre `1.1em` e `1.3em`).

---

## 8. Rollback

```bash
git revert <sha-do-commit-1>
```

Nada é destrutivo: o `delete` do Passo 4 é opcional e separado.

---

## 9. Depois do merge

1. **Espelho GitLab** (procedimento em `decisoes.md`, 2026-07-23) — é o que o Sérgio puxa
   para o servidor. ⚠️ O remote `gitlab` e a branch `gitlab-app` **não existem na máquina do
   Elton**: esse passo é do Marquito, ou precisa ser configurado antes.
2. **Servidor da CGTI (Sérgio):** `git pull` + rebuild do container.
3. Subir **fora do horário de uma sessão**: um celular com a página aberta desde antes
   envia o código antigo e recebe 400. O service worker ainda não está ligado, então basta
   escolher a hora.
