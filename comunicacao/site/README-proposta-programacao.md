# Proposta · Página de Programação do VIII Concefor (WordPress)

> Criada em 10/08/2026. Reorganiza a programação oficial de 2026 no formato de tabela
> que o site já usou na edição de 2024 (horário · atividade · local), com a identidade
> visual do VIII Concefor.

## Arquivos

| Arquivo | O que é | Onde vai |
|---|---|---|
| [programacao-2026-wordpress.html](programacao-2026-wordpress.html) | **A página inteira em um só bloco**: estilos e conteúdo juntos | Colar na página `/programacao/` |
| [preview-programacao-2026.html](preview-programacao-2026.html) | Pré-visualização para aprovação (abre no navegador) | Não vai para o site |
| [`_refs/`](_refs/) | Capturas do preview em desktop e celular, para mandar por e-mail ou WhatsApp | Não vai para o site |

## Como publicar

**Um passo só. Não precisa mexer em Aparência > Personalizar > CSS adicional.** Todo o
estilo viaja dentro do próprio bloco, então a página funciona sozinha.

1. Abra a página **Programação** (ID 13927) no painel.
2. Clique nos três pontinhos no canto superior direito e escolha **Editor de código**
   (atalho `Ctrl + Shift + Alt + M`).
3. Apague o conteúdo que está lá e cole **todo** o conteúdo de
   [programacao-2026-wordpress.html](programacao-2026-wordpress.html), inclusive as
   primeiras e últimas linhas `<!-- wp:html -->` e `<!-- /wp:html -->`.
4. Volte para o **Editor visual**. Deve aparecer um bloco **HTML personalizado**. Clique em
   **Visualizar** dentro do bloco para conferir o resultado.
5. Troque os dois links marcados (veja a seção abaixo) e publique.

> ⚠️ **Se o código aparecer como texto numa caixa cinza**, o WordPress criou um bloco de
> *Código* em vez de *HTML personalizado*. Apague esse bloco, adicione um bloco
> **HTML personalizado** (digite `/html` e dê Enter) e cole o conteúdo dentro dele.

Depois de publicar, confira no celular. A tabela vira um cartão por atividade abaixo de 640px.

## Pendências antes de publicar

| Marcador no arquivo | O que fazer |
|---|---|
| `#TROCAR-LINK-PDF` | URL do PDF da programação completa. Se não houver PDF nesta edição, apague o parágrafo e o botão. |
| `#TROCAR-LINK-YOUTUBE` | URL da transmissão ou da playlist do canal do Cefor. Sem ela, apague o parágrafo e o botão. |
| `Local: a divulgar` (5 linhas) | Locais das **sessões técnicas** (18/08 tarde, 19/08 manhã e tarde), da **Mostra de Produtos** (18/08, 2 blocos) e dos **eventos UAB/UnAC/NTE** (17/08). São as mesmas pendências registradas em [`contexto/01-programacao.md`](../contexto/01-programacao.md), aguardando a Viviane desde 28/07. |

## Como editar depois

O conteúdo é HTML comum e está indentado justamente para ser legível por quem não programa.
Cada atividade é um bloco de três linhas:

```html
<tr>
  <td class="cfp-hora">🎤 14h30</td>
  <td class="cfp-ativ">Título da atividade</td>
  <td class="cfp-local">Local: Pátio (térreo)</td>
</tr>
```

Para preencher um local pendente, troque o texto de `cfp-local`. Para acrescentar uma
atividade, copie um `<tr>` inteiro e edite. As linhas com `class="cfp-sub"` são os
sub-itens (os quatro lançamentos de segunda e os eventos paralelos de quinta): elas entram
recuadas e com um fio à esquerda, presas ao bloco de cima.

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

**Estilos autocontidos.** Todo o CSS mora dentro do bloco, escopado no prefixo `.cfp-`, e não
vaza para o resto do site nem depende de nada no Personalizar. As páginas das edições
anteriores, que usam as classes `.tg` do CSS adicional, seguem intactas.

## O que mudou em relação à página de 2024

1. **Navegação por dia** em quatro botões no topo. A página é longa e, no celular, chegar em
   quinta-feira exigia muita rolagem.
2. **Legenda dos ícones** logo no início, em vez de deixar o leitor deduzir.
3. **Layout de celular**: cada atividade vira um cartão em vez de uma tabela espremida com
   rolagem horizontal.
4. **Cores do VIII Concefor** (navy `#173b79` e teal `#0e8fa8`, de
   [`design-system/concefor/tokens.css`](../../design-system/concefor/tokens.css)) nos
   títulos de dia, botões e links, no lugar do azul-petróleo genérico.
5. **Fecho com valor para quem lê**: links para palestrantes, cronograma e inscrição.
