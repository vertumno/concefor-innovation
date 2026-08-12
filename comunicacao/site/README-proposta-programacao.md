# Proposta · Página de Programação do VIII Concefor (WordPress)

> Criada em 10/08/2026. Reorganiza a programação oficial de 2026 no formato de tabela
> que o site já usou na edição de 2024 (horário · atividade · local), com a identidade
> visual do VIII Concefor.
>
> **Atualizada em 12/08/2026:** a página deixou de ser um bloco de HTML único e passou a
> usar **blocos nativos do WordPress**, para poder ser editada no editor visual. Publicada
> no mesmo dia, sem o bloco de abertura (intro, navegação por dia, legenda dos ícones e
> aviso da transmissão), e com o tamanho de texto corrigido.

## Armadilha do tema: 1rem = 10px

O tema do site (Catch Base) define `html { font-size: 10px }`. Ou seja, **`1rem` vale 10px
e não os 16px de costume**, enquanto o corpo de texto do site é 15px. A primeira publicação
saiu com a tabela em 9,5px, ilegível, porque o estilo usava `rem`.

Por isso o CSS desta página **não usa `rem`**: tamanho de texto em `em` (que acompanha os
15px do site) e espaçamento em px. Se for mexer no estilo, siga a mesma regra. O
[gerar-preview.mjs](gerar-preview.mjs) reproduz o `html{font-size:10px}` de propósito, para
o preview não voltar a mentir sobre o tamanho do texto.

## Arquivos

| Arquivo | O que é | Onde vai |
|---|---|---|
| [programacao-2026-wordpress.html](programacao-2026-wordpress.html) | **A página em blocos do WordPress** | Colar na página `/programacao/` |
| [preview-programacao-2026.html](preview-programacao-2026.html) | Pré-visualização para aprovação (abre no navegador) | Não vai para o site |
| [gerar-preview.mjs](gerar-preview.mjs) | Regera o preview a partir do arquivo acima | Não vai para o site |
| [`_refs/`](_refs/) | Capturas do preview em desktop e celular, para mandar por e-mail ou WhatsApp | Não vai para o site |
| [`_backup/`](_backup/) | O conteúdo que estava na página antes da troca, copiado do Editor de código | Rede de segurança |

> **Para desfazer a publicação:** cole de volta o conteúdo de
> [`_backup/2026-08-12_programacao-conteudo-original.html`](_backup/2026-08-12_programacao-conteudo-original.html)
> no Editor de código. É o texto exato que estava no ar em 12/08/2026, antes desta proposta.

## Como publicar

**Um passo só. Não precisa mexer em Aparência > Personalizar > CSS adicional.** Todo o
estilo viaja dentro da própria página, num bloco de HTML no final.

1. Abra a página **Programação** (ID 13927) no painel.
2. Clique nos três pontinhos no canto superior direito e escolha **Editor de código**
   (atalho `Ctrl + Shift + Alt + M`).
3. Apague o conteúdo que está lá e cole **todo** o conteúdo de
   [programacao-2026-wordpress.html](programacao-2026-wordpress.html), inclusive as linhas
   que começam com `<!-- wp:`.
4. Volte para o **Editor visual**. Você deve ver títulos, parágrafos e tabelas normais,
   e um bloco **HTML personalizado** no finalzinho da página (é o estilo).
5. Troque os dois links marcados (veja a seção abaixo) e publique.

> ⚠️ Se algum bloco aparecer com o aviso **"este bloco contém conteúdo inesperado ou
> inválido"**, clique em **Tentar recuperação do bloco**. Isso acontece quando a versão do
> WordPress do site grava a tabela de um jeito um pouco diferente, e a recuperação resolve
> sem perder conteúdo.

Depois de publicar, confira no celular. A tabela vira um cartão por atividade abaixo de 640px.

## Como editar depois (no editor visual)

Esta é a razão de a página ter sido convertida para blocos. No editor visual:

- **Texto, títulos e links:** clique e digite, como em qualquer página.
- **Programação:** cada dia é uma **tabela**. Clique numa célula e edite. Para acrescentar
  uma atividade, use a barra da tabela: **Editar tabela > Inserir linha depois**.
- **Botões (PDF e transmissão):** são parágrafos com um link dentro. Selecione o texto e use
  o botão de link (`Ctrl + K`) para trocar o endereço.
- **Ícones:** são emojis digitados no próprio texto da coluna de horário. Copie e cole de
  outra linha, ou use o seletor de emoji do sistema (`Windows + .`).

### Três regras para o visual não quebrar

1. **A tabela tem sempre três colunas, nesta ordem: horário · atividade · local.** O estilo
   vem da posição da coluna, não de marcações escondidas. Não inverta nem exclua colunas.
2. **Sub-item é uma linha com a coluna de horário vazia.** É assim que os quatro lançamentos
   de segunda e os eventos paralelos de quinta ganham o recuo e o fio azul à esquerda. Para
   criar um novo sub-item, insira uma linha e deixe a primeira célula em branco.
3. **Não apague o bloco HTML do final.** É ele que carrega todo o estilo da página.

Se precisar mexer no visual, é lá que estão as cores, os tamanhos e o layout de celular. As
classes começam todas com `cfp-` e não afetam nenhuma outra página do site.

### Mantendo o preview em dia

O preview é gerado a partir do arquivo do WordPress, para os dois nunca saírem de sincronia.
Depois de editar `programacao-2026-wordpress.html`, rode:

```bash
node comunicacao/site/gerar-preview.mjs
```

## Pendências antes de publicar

| Marcador no arquivo | O que fazer |
|---|---|
| `#TROCAR-LINK-PDF` | URL do PDF da programação completa. Se não houver PDF nesta edição, apague o parágrafo e o botão. |
| `#TROCAR-LINK-YOUTUBE` | URL da transmissão ou da playlist do canal do Cefor. Sem ela, apague o parágrafo e o botão. |
| `Local: a divulgar` (5 linhas) | Locais das **sessões técnicas** (18/08 tarde, 19/08 manhã e tarde), da **Mostra de Produtos** (18/08, 2 blocos) e dos **eventos UAB/UnAC/NTE** (17/08). São as mesmas pendências registradas em [`contexto/01-programacao.md`](../contexto/01-programacao.md), aguardando a Viviane desde 28/07. |

## Decisões tomadas nesta proposta

**O que veio da programação oficial sem alteração:** dias, horários, títulos das palestras e
mesas, nomes dos palestrantes e a lista dos quatro lançamentos. A fonte é
[html-programaco-2026-oficial.md](html-programaco-2026-oficial.md).

**Links preservados e corrigidos.** Os links de *Sessões técnicas*, *Mostra de Produtos* e
*Eventos paralelos* continuam na página, como pedido. Só que na página atual os links da
Mostra e de duas sessões técnicas estão quebrados: o `href` é o texto
`http://Trabalhos Aprovados para Apresentação no VIII Concefor`, não uma URL. Todos foram
apontados para `/apresentacao-de-trabalhos/`, que é a página certa e já existe no menu.
Se a intenção era linkar outro destino, é só trocar nos cinco pontos.

**Eventos paralelos detalhados.** A página oficial só diz "Momento I" e "Momento II" com um
link. A proposta abre os seis eventos em sub-linhas, com nome e sala, no mesmo padrão visual
que o site usou em 2024. Os dados vêm de [`contexto/07-eventos-paralelos.md`](../contexto/07-eventos-paralelos.md),
atualizado em 29/07 a partir do documento oficial da Coordenação. Quem lê a programação
descobre onde precisa estar sem sair da página, e o link para a página de eventos paralelos
continua ali para quem quiser a descrição completa e o formulário de inscrição.

**Locais.** Os 15 itens confirmados no Pátio entraram como *Pátio (térreo)*. Os andares das
salas (Auditório 4º, Salas 1 e 2 no 1º, Sala 4 no 2º, Laboratório de Informática no 4º) vêm
da programação de 2024, que roda no mesmo prédio. Vale conferir com a Coordenação antes de
publicar.

**Horários padronizados.** A fonte oficial mistura `13h30min`, `8h` e `13:30`. Tudo virou
`13h30`, `08h00`. Os blocos com duração definida mostram o intervalo (`09h00 às 12h00`).

**Ícones.** Mesma lógica de 2024, com uma legenda no topo que a página antiga não tinha:
🎤 palestras e mesas · 📑 sessões técnicas e mostras · 🔀 eventos paralelos · 🎶 momentos
culturais · ☕ coffee-break · 🏆 premiação · 🎉 celebração e encerramento · 🚀 lançamentos.
A bolinha 🔴 marca o que vai ao vivo, exatamente como na edição anterior.

**Estilos autocontidos.** Todo o CSS mora dentro da página, com o prefixo `cfp-`, e não
vaza para o resto do site nem depende de nada no Personalizar. As páginas das edições
anteriores, que usam as classes `.tg` do CSS adicional, seguem intactas.

**Blocos nativos em vez de HTML puro (12/08).** A primeira versão era um bloco de HTML só,
bonito mas editável apenas por quem lê código. Agora cada elemento é um bloco do WordPress.
O preço disso é que blocos nativos não aceitam marcação em linha ou célula de tabela: o
estilo passou a depender da posição da coluna e da primeira célula vazia (daí as três regras
acima). O `<span>` vermelho que envolvia o 🔴 saiu, porque o emoji já é vermelho sozinho.

**Abertura removida (12/08).** A proposta original abria com um parágrafo de introdução,
quatro botões de navegação por dia, a legenda dos ícones e o aviso da transmissão. Tudo isso
saiu na publicação, por decisão do Elton: a página entra direto na programação. O CSS desses
quatro elementos foi retirado junto, para não deixar estilo órfão no arquivo.

Duas consequências que valem acompanhar:
- Os **emojis da coluna de horário ficaram sem legenda**. São razoavelmente autoexplicativos
  (🎤 palestra, 📑 sessão técnica, ☕ coffee-break), mas ninguém mais diz o que significam.
- O **🔴 continua sem explicação no topo**; quem chega pelo começo só descobre o que ele quer
  dizer no parágrafo da transmissão, lá no fim da página.

## O que mudou em relação à página de 2024

1. **Layout de celular**: cada atividade vira um cartão em vez de uma tabela espremida com
   rolagem horizontal.
2. **Cores do VIII Concefor** (navy `#173b79` e teal `#0e8fa8`, de
   [`design-system/concefor/tokens.css`](../../design-system/concefor/tokens.css)) nos
   títulos de dia, botões e links, no lugar do azul-petróleo genérico.
3. **Eventos paralelos abertos** com nome e sala, em vez de só "Momento I" e "Momento II".
4. **Fecho com valor para quem lê**: links para palestrantes, cronograma e inscrição.
