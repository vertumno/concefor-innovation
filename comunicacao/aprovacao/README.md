# Aprovação · páginas online para revisar artes e materiais

Área de **páginas HTML servidas via GitHub Pages** para o cliente/coordenação revisar e aprovar
peças de divulgação **sem precisar do repositório**. É só abrir o link no celular ou no navegador.

## URL pública (após o Pages estar ativo)

- **Central de aprovações:** https://vertumno.github.io/concefor-innovation/comunicacao/aprovacao/
- **Cards de palestrantes:** https://vertumno.github.io/concefor-innovation/comunicacao/aprovacao/cards-palestrantes.html

## O que tem aqui

| Arquivo | O que é |
|---|---|
| `index.html` | Central: lista as páginas de aprovação disponíveis |
| `cards-palestrantes.html` | Prévia estilo Instagram (card + legenda) dos 7 cards individuais da Onda 1 |

As páginas **referenciam as artes onde elas já moram** (ex.: os PNGs em
`../producao/02-pre-evento/palestrantes/cards/`). Nada é duplicado. Se um card for
reexportado com o mesmo nome de arquivo, a página passa a mostrar a versão nova sozinha.

## Como o aprovador usa

Abre a página → vê cada peça como vai ao ar → marca **Aprovar** ou **Pedir ajuste** (com
observação) → toca em **Copiar parecer** e cola a resposta no WhatsApp/e-mail. As marcações
ficam salvas só no navegador de quem revisa (localStorage). Nada volta pro repo automaticamente.

## Como publicar (habilitar o GitHub Pages, uma vez só)

1. No GitHub: **Settings → Pages**.
2. Em **Build and deployment → Source**, escolher **Deploy from a branch**.
3. Branch **`main`**, pasta **`/ (root)`** → **Save**.
4. Aguardar ~1 min. O site sai em `https://vertumno.github.io/concefor-innovation/`.

O arquivo `.nojekyll` na raiz do repositório garante que o Pages sirva os arquivos como estão
(inclusive as pastas `_marca/`, usadas pelo avatar). Não remover.

> ⚠️ O repositório é **público**, então o site também é. Não colocar aqui nada que não possa
> ser visto por qualquer pessoa com o link.

## Adicionar uma nova página de aprovação

1. Criar `nome-da-peca.html` nesta pasta (pode copiar `cards-palestrantes.html` de base).
2. Referenciar as artes por caminho relativo a partir daqui (`../producao/...`).
3. Adicionar um card de link em `index.html`.
4. Commit + push. O Pages atualiza sozinho em ~1 min.
