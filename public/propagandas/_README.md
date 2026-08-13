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
| `imagem` | — | Caminho de uma imagem (ex.: `/propagandas/_img/capa.png`) |
| `galeria` | — | Pasta sob `public/` cujas imagens giram dentro do cartaz |
| `acento` | dourado | Cor da borda e da chamada (hex ou `rgb()`) |
| `ativo` | `true` | `false` tira do ar sem apagar o arquivo |

## Convenções

- **`_` na frente = rascunho.** Arquivos começando com `_` (como este README)
  ficam versionados e **não** vão ao telão.
- **O telão não é clicável.** Quando houver `link:`, use `qr: true` — o QR é o
  único CTA que funciona para quem está na plateia.
- **Texto curto.** O cartaz é lido do fundo do auditório: 2 a 4 linhas.
- **`modal` interrompe.** Ele cobre a linha do tempo da sessão ao vivo; use com
  parcimônia, para chamadas de ação de intervalo.
- **Markdown suportado:** títulos, listas, `**negrito**`, `*itálico*`, links e
  imagens. Para arte mais livre, escreva o arquivo em `.html`.
