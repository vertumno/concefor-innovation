# Propagandas do telão

Cada arquivo desta pasta é **um cartaz** que gira no telão, à esquerda da linha do
tempo de reações (`posicao: lateral`) ou por cima dela (`posicao: modal`).

Publicar um cartaz é **soltar um arquivo aqui e dar deploy**. Não há cadastro no
banco, nem código a mexer. O telão relê esta pasta a cada 5 minutos, então um
cartaz publicado no meio do evento entra sozinho, sem tocar no PC do projetor.

## Como escrever

Arquivo `.md` (markdown) ou `.html`, com frontmatter entre linhas de `---`:

```markdown
---
titulo: Vitrine de MOOCs
chamada: Cursos abertos do Ifes
duracao: 24
posicao: lateral
ordem: 30
link: https://mooc.cefor.ifes.edu.br/
qr: true
---

Cursos **gratuitos, on-line e com certificado**.

- Trilhas por área
- Planejador de Licença para Capacitação
```

## Campos

| Campo | Padrão | Para que serve |
|---|---|---|
| `titulo` | nome do arquivo | Título grande do cartaz |
| `chamada` | — | Linha curta acima do título |
| `duracao` | `20` | Segundos no ar (mínimo 5, máximo 300) |
| `posicao` | `lateral` | `lateral` (coluna) ou `modal` (cobre a tela) |
| `ordem` | `999` | Ordem no giro; empate resolve por nome do arquivo |
| `link` | — | Endereço do produto |
| `qr` | — | `true` gera o QR do `link:`; ou uma URL própria |
| `rotulo` | domínio do `link` | Texto ao lado do QR (ex.: `"@ifescefor"`) |
| `imagem` | — | Caminho de uma imagem (ex.: `/propagandas/_img/capa.png`) |
| `galeria` | — | Pasta sob `public/` cujas imagens giram dentro do cartaz |
| `acento` | dourado | Cor da borda e da chamada (hex ou `rgb()`) |
| `ativo` | `true` | `false` tira do ar sem apagar o arquivo |

## Imagens

Ficam em [`_img/`](_img/) e entram pelo campo `imagem:`, com caminho a partir da
raiz pública — `imagem: /propagandas/_img/mooc-cursos.webp`.

As artes dos banners impressos são feitas para lona (dezenas de MB, formato em
pé) e **não** servem direto: gere uma versão leve antes, na horizontal, com o
lado maior em torno de 900 px em `.webp`. As duas do MOOC que já estão aqui têm
37 KB cada. Prefira o **recorte do produto** (a tela do sistema, a capa do
livro) ao banner inteiro — o cartaz é uma coluna estreita, e o banner completo
vira um borrão com texto ilegível.

## Convenções

- **`_` na frente = rascunho.** Arquivos e pastas começando com `_` (como este
  README e a `_img/`) ficam versionados e **não** viram cartaz.
- **O telão não é clicável.** Quando houver `link:`, use `qr: true` — o QR é o
  único CTA que funciona para quem está na plateia.
- **Texto curto.** O cartaz é lido do fundo do auditório: 2 a 4 linhas.
- **`modal` interrompe.** Ele cobre a linha do tempo da sessão ao vivo; use com
  parcimônia, para chamadas de ação de intervalo.
- **Markdown suportado:** títulos, listas, `**negrito**`, `*itálico*`, links e
  imagens. Para arte mais livre, escreva o arquivo em `.html`.
