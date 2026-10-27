# Retrospectiva — a linha do tempo visual do VIII Concefor

Uma página HTML só, navegável, que remonta os quatro dias do congresso a partir
do que o público registrou no app: **cada barra é um minuto, e a altura é quanta
gente reagiu naquele minuto**. Nos picos, quando existe gravação, aparece a frase
que estava sendo dita no palco.

É o fecho do conceito-espinha do projeto — *tudo é um registro com timestamp e se
conecta*. O app, o telão e esta página saem do mesmo modelo de dados; aqui os
20 anos do Cefor entram como prólogo e o congresso vira o capítulo mais recente
da mesma linha do tempo.

```
node retrospectiva/build.mjs          # gera dados/ e dist/index.html
node retrospectiva/build.mjs --dados  # só os dados, sem a página
```

Abra `dist/index.html` no navegador. Não precisa de servidor nem de `npm install`
— o build usa só o que vem no Node 22+ (`node:sqlite`, `node:zlib`).

## De onde vem cada coisa

| Insumo | Onde o build procura | Sem ele |
|---|---|---|
| **Banco do evento** | `app/db-concefor/concefor.db`, ou o `app/db-concefor-*.tar.gz` mais recente (extraído sozinho para `.cache/`) | não roda |
| **Fala do palco** | `../transcricoes-concefor`, `$CONCEFOR_TRANSCRICOES` ou `c:/dev/transcritor-local/output` | a página sai sem citações |
| **Citações curadas** | `curadoria/citacoes.json` | os picos aparecem sem frase |
| **Respostas do palco** | `curadoria/respostas-*.json` | as perguntas aparecem sem resposta |
| **Gravações** | `dados/videos.json` | some o "Assistir" e o "ver este minuto" |
| **Documentos** | `../transcricoes-concefor/documentos`, `$CONCEFOR_DOCUMENTOS` | some o link do PDF |
| **Fotos** | `fotos/` (qualquer subpasta) | espaços reservados na página |
| **Os 20 anos** | `dados/marcos-20-anos.json` | — |

Para apontar outros caminhos:

```
node retrospectiva/build.mjs --db=CAMINHO --transcricoes=CAMINHO --documentos=CAMINHO
```

## As gravações abrem no minuto certo

Duas perguntas diferentes, duas fontes diferentes — e confundir as duas foi o
primeiro erro desta parte:

- **"De quem é este vídeo?"** → a lista `sessoes` de `dados/videos.json`,
  escrita à mão. **Nunca o horário.** O congresso tinha sessões simultâneas em
  salas diferentes, e deduzir pelo relógio deu à Mostra de Produtos, que rodava
  no Auditório do 4º piso, o vídeo da mesa-redonda que acontecia no Pátio no
  mesmo intervalo. Só quem organizou sabe quem estava sendo filmado.
- **"Em que ponto dele?"** → o horário, subtraído da hora REAL em que a live
  começou (o `release_timestamp`, lido com `yt-dlp`). Daí sai o `&t=NNNNs`.

**Achou um vídeo no lugar errado? É a lista `sessoes` que se corrige.**

Isso resolve o caso que mais incomodava: as sete lives não seguem a divisão da
programação. A noite de abertura inteira — Momento Musical, Abertura, palestra
da Vanessa, Lançamentos e o começo da Celebração — está num vídeo só, de 2h36.

Duas ressalvas ficam registradas no próprio JSON: uma posição da playlist está
privada ou removida (linkar daria erro, então ficou de fora), e a transmissão da
palestra do Tessarolo só entrou no ar 25 minutos depois do início da sessão —
nesse caso o link vai para o começo do vídeo e diz "o bloco inteiro", em vez de
prometer um trecho que não existe.

### Se o link cair fora do ponto

O link já abre 20 segundos antes do minuto marcado, porque a reação vem depois
da fala e quem clica quer ouvir o que a provocou. Se ainda assim a gravação
estiver deslocada — o relógio da transmissão e o da gravação local podem
divergir —, meça a diferença numa fala conhecida e ponha `ajusteSegundos` naquele
vídeo em `dados/videos.json`. Vale para todos os links daquela gravação:

```json
{ "id": "okyYHQ1sM1k", "ajusteSegundos": -35 }
```

Negativo puxa para trás, positivo empurra para a frente.

Para reler os metadados da playlist quando ela mudar:

```
python -m yt_dlp --skip-download --print "%(id)s|%(release_timestamp)s|%(duration)s|%(title)s" \
  "https://www.youtube.com/playlist?list=PLHKM4BxClqXU"
```

## A nuvem de palavras é a mesma do telão

`lib/wordcloud-browser.js` é o algoritmo do app portado para a página
(`app/src/lib/wordcloud.ts` + `PollCloud.tsx`, que vieram do amueller/word_cloud).
A ocupação é o bitmap dos pixels do texto, não o retângulo — é o que deixa
palavra pequena encaixar no vão de uma grande. Reimplementar diferente daria
outra imagem para o mesmo dado.

Ela roda no browser porque precisa de canvas para medir a tinta de cada palavra.
A lista de respostas fica num `<details>` embaixo, então o dado existe mesmo sem
JavaScript — e quem quiser o número exato abre a lista.

## As fotos entram assim

**Os arquivos precisam estar no disco** — não basta um link do Drive. O que
ancora cada foto no minuto certo é o `DateTimeOriginal` do EXIF, e esse dado só
existe dentro do arquivo: uma URL não o entrega. Além disso, o visualizador de
artefatos bloqueia imagem de host externo, então foto linkada de fora não
apareceria no preview.

Então: baixe a pasta do Drive, solte em `fotos/` (subpastas à vontade) e rode o
build. Cada foto vai para o minuto em que foi tirada e a sessão que estava
acontecendo naquele minuto a adota. Sem EXIF — foto que passou por WhatsApp
perde —, valem duas saídas: um nome de pasta igual ao da sessão, ou dia e hora no
nome do arquivo (`19-08 14h32 mesa.jpg`).

A pasta é ignorada pelo git: as fotos são pesadas e o dono delas é a CGTE. Elas
continuam no Drive e só passam por aqui para o build encaixá-las.

## As relatorias em PDF

São as peças montadas a partir das transcrições — resumo, quem falou, citações
com hora. O build copia para `dist/documentos/` só o que achar no disco e o link
sai relativo, o que funciona ao abrir `dist/index.html` localmente e no deploy,
mas **não num preview publicado**, onde não há como subir os arquivos junto.

Para o link funcionar em qualquer lugar, hospede o PDF e declare a `url` no item
correspondente de `dados/documentos.json` — ela tem precedência sobre o arquivo
local:

```json
{
  "arquivo": "06-mesa-desafios-ead.pdf",
  "url": "https://drive.google.com/uc?export=download&id=ID_DO_ARQUIVO",
  "titulo": "...",
  "sessoes": ["..."]
}
```

No Drive, o `ID_DO_ARQUIVO` é o trecho do link de compartilhamento entre `/d/` e
`/view`, e o arquivo precisa estar como **qualquer pessoa com o link**. Vale
lembrar que isso torna as relatorias públicas para quem tiver o endereço.

## Onde publicar

**É uma página estática, e só isso.** Depois do build, `dist/` contém um
`index.html` (~300 KB, com CSS, JavaScript e as logos embutidos) e a pasta
`documentos/` com os PDFs — cerca de 4,7 MB no total. Não há servidor, banco,
Node nem processo rodando: qualquer lugar que sirva arquivos serve a página.
Copiar a pasta é o deploy inteiro.

As três saídas, na ordem em que fazem sentido:

1. **Site oficial do evento** — https://concefor.cefor.ifes.edu.br/ é o endereço
   natural: a retrospectiva é o fecho do congresso e pertence ao mesmo lugar que
   a programação. Subir `dist/` numa subpasta (`/retrospectiva/`) e linkar no
   menu. A página é autocontida e não encosta no tema do site. Depende de quem
   administra a hospedagem.
2. **Junto do app** — copiar `dist/` para `app/public/retrospectiva/`; o Next.js
   serve arquivos de `public/` sem configuração nenhuma, e sai em
   `app.cefor.ifes.edu.br/retrospectiva`. É a via mais rápida, porque o caminho
   de deploy já é conhecido (`git subtree split --prefix=app`, ver `links.md`).
   Só vale lembrar que o app é do evento e pode ser desligado um dia — a
   retrospectiva é para durar mais que ele.
3. **Qualquer hospedagem estática** (GitHub Pages e afins) — funciona e não
   depende de ninguém, mas fica fora do domínio institucional, e os PDFs
   passariam a viver num repositório público.

Em 1 e 3 os links relativos dos PDFs funcionam sozinhos, porque a pasta
`documentos/` viaja junto. Se por algum motivo só o HTML for publicado, use o
campo `url` de `dados/documentos.json` para apontar os PDFs para onde eles
estiverem.

## O que vira "momento" na página

**A curadoria manda, não o pico.** Cada fala escolhida em `curadoria/citacoes*.json`
vira um cartão na linha do tempo, posicionado no minuto em que foi dita; a faixa
de reações marca esse minuto em dourado, ligando o gráfico ao cartão.

A regra era outra no começo — pegue os três minutos mais reagidos de cada sessão
e mostre a fala de cada um — e não funcionou por dois motivos: pico alto não é o
mesmo que frase memorável (o Momento Musical estourou de reações durante a
música, sem nada dito), e o pico sem frase virava um cartão que só anunciava que
faltava frase. O pico continua importando para o gráfico e para descobrir onde
procurar, mas quem decide o que a página conta é quem leu a transcrição.

Uma consequência prática: **uma fala boa num minuto morno entra do mesmo jeito**.
Basta o `sessaoId` e a `hora` — não precisa haver reação naquele minuto.

## A curadoria das citações — leia antes de publicar

O texto que sai do Whisper é **cru**. Ele transcreve o microfone aberto (conversa
de bastidor, passagem de som, achados e perdidos com nome de gente) e inventa
frase em trecho de silêncio — no dia 19 ele produziu um "acesse www.opusdei.pt"
que ninguém disse. Por isso o fluxo tem duas etapas:

1. O build escreve **dois** arquivos, os dois fora do git:
   - `curadoria/citacoes-candidatas.md` — para **ler**: as falas em volta de cada
     pico, com hora e as suspeitas marcadas com ⚠️;
   - `curadoria/citacoes-sugeridas.json` — para **agir**: só os picos que ainda
     não têm frase (exatamente os que a página mostra como *"a frase ainda espera
     curadoria"*), cada um já no formato final, pronto para colar.
2. Alguém lê, escolhe a frase, corrige a pontuação e move o bloco para um
   arquivo de curadoria, trocando `"aprovada": false` por `"rascunho"`.
   **Só o que está lá aparece na página.**

O build lê **todos** os arquivos `curadoria/citacoes*.json` — `citacoes.json` e um
por dia (`citacoes-dia17.json` e afins) —, menos o de sugestões, que é rascunho
de máquina. Revisar por dia é mais fácil que rolar uma lista de cinquenta; se
duas curadorias escolherem o mesmo minuto, fica a primeira.

O `citacoes.json` de hoje traz uma primeira curadoria feita por máquina, marcada
`"aprovada": "rascunho"` — ela ainda precisa do olho de quem estava na sala. Os
campos `conferir` apontam o que está em dúvida (grafia de nome, quem falou, e um
trecho onde a transcrição trocou "IA" por "EaD" do começo ao fim). Para tirar uma
citação da página, ponha `"aprovada": false`.

O mesmo vale para `curadoria/respostas-*.json`, que traz o que o palco respondeu
a cada pergunta do público: resumo, quem respondeu e a hora em que a resposta
começou — é dessa hora que sai o link "ouvir a resposta". Uma pergunta sem
resposta encontrada fica com `"encontrada": false` e simplesmente não ganha o
bloco, o que é mais honesto que preencher.

**Um alerta que vale para todo o material do dia 19:** a transcrição trocou "IA"
por "EaD" de forma sistemática nas falas do Mariano Pimentel e do Mauro Oliveira
("se você entrega para a EaD pensar por você"). Quem for curar precisa corrigir —
e vale investigar o glossário do transcritor, porque a troca é do pipeline, não
do palestrante.

## LGPD — o que esta página não mostra

O repo é público e a página vai para a web, então nada de PII sai do servidor:

- **Nomes completos, e-mail, CPF**: nunca. `lib/banco.mjs` é o único ponto que
  fala com as tabelas de inscritos e só devolve contagem.
- **Perguntas**: aparecem com o **primeiro nome** de quem enviou. Elas eram
  identificadas no telão (decisão de 05/08), mas nome completo indexável na web é
  outra coisa. Perguntas que a moderação escondeu não entram.
- **Conexões**: só o total. Quem se conectou com quem não sai daqui.
- **Transcrição crua e cópia do banco**: `.gitignore`.

## Os arquivos

```
retrospectiva/
├── build.mjs              orquestra tudo (é por aqui que se começa a ler)
├── lib/
│   ├── banco.mjs          lê o SQLite e agrega — a fronteira da PII
│   ├── transcricoes.mjs   indexa a fala por minuto e cruza com os picos
│   ├── videos.mjs         hora da sessão − hora da live = ponto do vídeo
│   ├── tempo.mjs          normaliza os três relógios do projeto para -03:00
│   ├── fotos.mjs          EXIF → minuto → sessão
│   ├── destar.mjs         abre o .tar.gz do backup sem depender do tar do sistema
│   ├── wordcloud-browser.js  a nuvem do telão, portada para a página
│   └── render.mjs         a página (design, gráficos, CSS)
├── curadoria/
│   ├── citacoes.json          as falas dos picos que podem ser publicadas
│   └── respostas-*.json       o que o palco respondeu a cada pergunta
├── dados/
│   ├── marcos-20-anos.json    os 20 anos, extraídos do livro
│   ├── videos.json            as lives e a hora real em que começaram
│   ├── documentos.json        que PDF cobre que sessão
│   ├── marca.json             as duas logos, reduzidas para embutir
│   └── retrospectiva.json     consolidado gerado, sem PII
└── dist/
    ├── index.html             a página gerada
    └── documentos/            os PDFs copiados, para a pasta ser autossuficiente
```

Dois detalhes que custaram tempo e é bom não redescobrir:

- **Os três relógios.** As sessões vêm com offset (`-03:00`), os eventos da
  timeline vêm em UTC (`Z`) e a transcrição vem em hora de relógio. Um pico às
  22:23 é a fala das 19:23. Tudo passa por `lib/tempo.mjs`.
- **Gravação não bate com sessão.** Os arquivos seguem o roteiro planejado; a
  programação real derrapou. O arquivo da palestra da Vanessa começa às 19:00 e
  contém o fim da Abertura, porque a palestra só começou 19:35. Por isso o
  cruzamento é por minuto absoluto, não por arquivo.

## O que ainda falta

- [ ] Curadoria humana das citações (`conferir` em `curadoria/citacoes.json`)
- [ ] Conferir as respostas do palco (`curadoria/respostas-*.json`)
- [ ] Fotos da cobertura da CGTE
- [ ] Dia 20 quase não foi gravado — a premiação tem picos sem frase e sem vídeo
- [ ] Publicar: copiar `dist/` para o site do evento (ver "Onde publicar", acima)

Ao gerar um documento novo em PDF com Chrome headless, use
`--virtual-time-budget=20000`: sem isso o Chrome imprime antes de as fontes do
Google chegarem e o PDF sai em Arial, menor e sem a identidade — um erro que
passa despercebido porque o arquivo é gerado do mesmo jeito.
