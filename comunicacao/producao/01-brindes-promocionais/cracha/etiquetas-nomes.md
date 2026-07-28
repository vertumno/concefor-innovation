# Etiquetas com os nomes dos participantes — frente nova (aberta em 27/07/2026)

> **Por que existe:** a gráfica confirmou em 22/07 que **os 400 crachás vêm em branco**
> (impressão gráfica não personaliza unidade a unidade — ver
> [`_especificacoes/email-grafica-envio-artes.md`](../_especificacoes/email-grafica-envio-artes.md)).
> O nome de cada participante é responsabilidade nossa, aqui no Cefor.
>
> **Decisão de 27/07: o nome vai em etiqueta adesiva colada no crachá**, não impresso direto
> sobre o papel fotográfico fosco 240 g. Isso mata o maior risco do plano anterior — a dúvida
> se a impressora do Cefor aguenta 400 passagens dessa gramatura.

## 🔴 Decisão pendente (reaberta em 28/07)

**Duas perguntas ainda sem resposta, e uma depende da outra:**

1. **Quais etiquetas comprar?** → depende de medir a área livre do crachá e achar um gabarito A4
   que exista à venda.
2. **Como será a impressão dos nomes?** → em que impressora, quem opera, quando roda, e se o
   arquivo sai do Canva ou de um gerador que lê o banco do Even3.

**Por que não pode esperar:** os 400 crachás chegam **até 07/08** e o evento abre em **17/08**.
Entre uma coisa e outra é preciso comprar (prazo de entrega da papelaria), imprimir uma folha de
teste, colar numa amostra e só então rodar as 400 — e ainda sobra a reimpressão de quem se
inscrever depois de 15/08. **Sugestão de data-limite para decidir: 04/08**, para o teste caber na
semana da entrega. `[confirmar a data com o Marquito/Andreia]`

## As três tarefas

| # | Tarefa | Depende de | Estado |
|---|---|---|---|
| 1 | **Medir a área livre do nome** no crachá impresso (é o dado que define tudo) | — | ⬜ |
| 2 | **Encontrar o formato/gabarito** que casa com essa área e existe à venda | tarefa 1 | ⬜ |
| 3 | **Comprar as etiquetas** (≥ 500, tipo certo para a impressora do Cefor) | tarefa 2 | ⬜ |
| 4 | **Gerar os arquivos de impressão** a partir da lista de inscritos do Even3 | tarefa 3 | ⬜ |
| 5 | **Testar numa amostra** antes de rodar as 400 | tarefas 3 e 4 | ⬜ |

> A ordem importa: comprar antes de medir é o jeito mais fácil de comprar a etiqueta errada.

## 1 · Compra

- **Quantidade:** 400 nomes + margem de erro de impressão e de inscrições de última hora.
  Comprar folhas suficientes para **pelo menos 500** etiquetas.
- **Tipo:** etiqueta adesiva branca em folha A4, para impressora comum (jato de tinta ou laser —
  conferir qual é a do Cefor **antes** de comprar; folha de laser em jato de tinta borra).
- **Onde:** papelaria local ou compra institucional. `[definir quem compra e por qual via]`

## 2 · Formato

O crachá é **10 × 14 cm**. A etiqueta precisa:

- caber na **área limpa reservada ao nome** na arte do crachá (ver as variantes em
  [`3x/`](3x/)) — hoje essa área ainda não foi medida e delimitada formalmente;
- ser larga o bastante para nomes longos sem quebrar em corpo minúsculo;
- vir num **gabarito de folha A4 que exista de fato à venda** (é o gabarito que define o
  arquivo de impressão, não o contrário).

**Ordem certa de resolver:** medir a área livre do crachá impresso → procurar o gabarito de
etiqueta comercial mais próximo → só então comprar → só então gerar o arquivo.

> ⚠️ **Testar antes de rodar as 400.** Imprimir uma folha, colar numa amostra de crachá e
> conferir alinhamento, legibilidade e se o adesivo gruda no papel fotográfico fosco.

## 3 · Arquivos de impressão

- **Fonte dos nomes:** lista de inscritos do Even3 — a mesma que o sync do app já puxa
  (`app/scripts/sync-even3.mjs`, tabela `attendees`). Não é preciso digitar nada à mão.
- **Saída:** PDF paginado no gabarito da etiqueta comprada, pronto para imprimir.
- **O modelo do Canva** (https://canva.link/vx6e7xpwox32wyy) muda de função de novo: antes gerava
  o crachá inteiro, depois a camada de sobreimpressão, **agora gera a folha de etiquetas** — ou
  é substituído por geração programática a partir do banco, que é mais barato para 400 nomes e
  para as reimpressões de última hora.
- **Reimpressão de última hora:** quem se inscrever depois do lote principal precisa de etiqueta
  na hora. O gerador tem que rodar de novo com uma lista parcial. `[definir quem opera no evento]`

## Efeitos bons desta mudança

- Some o risco do papel fotográfico 240 g na impressora de escritório.
- Errou um nome? Reimprime uma etiqueta, não perde o crachá.
- Podemos imprimir nomes **até a véspera**, inclusive de quem se inscrever depois de 15/08.

## Ainda em aberto

- **Rateio das 400 unidades** entre as 4 variantes de crachá (normal, palestrante, QR, inscrição)
  — continua sem definição e afeta quantas etiquetas de cada tipo precisamos.
- **Quem imprime e cola as 400**, e quando. `[definir]`
