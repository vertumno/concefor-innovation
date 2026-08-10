# Auditoria de tipografia — proposta v5

## Premissa de leitura

O arquivo final tem **1080 px de largura**. No feed de um celular em que a arte aparece com cerca de
**360 px**, cada medida é exibida a aproximadamente **1/3 do tamanho original**.

| Bloco | Tamanho no PNG | Equivalente a 360 px | Critério adotado |
|---|---:|---:|---|
| Títulos dos eventos | 62–76 px | 20,7–25,3 px | Nenhum título principal abaixo de 20 px de tela |
| Descrição | 40 px | 13,3 px | Corpo curto, sem peso leve |
| Informação de data e coordenação | 36 px | 12 px | Linhas empilhadas em largura total para evitar compressão |
| Rótulos “Quando/Coordenação” | 30 px | 10 px | Caixa alta, peso 900 e alto contraste |
| Tipo de evento | 30 px | 10 px | Etiqueta curta em caixa alta e peso 900 |
| URL do rodapé | 40 px | 13,3 px | CTA principal do rodapé |
| Título da capa | 132 px | 44 px | Leitura imediata no primeiro slide |
| Subtítulo da capa | 38 px | 12,7 px | Duas linhas no máximo |

## Ajustes estruturais

- Data e coordenação deixaram de disputar duas colunas estreitas: agora aparecem em linhas de largura total.
- O menor título passou de 55 px para 62 px; os demais chegam a 76 px conforme o comprimento.
- Descrição, metadados e URL foram ampliados, mantendo Montserrat sem pesos leves.
- O pipeline exporta uma pasta `preview-celular-360px/` para conferência na escala real de leitura.
