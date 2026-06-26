# CONCEFOR Innovation

Cérebro do projeto de inovação do **VIII CONCEFOR** (17–20 de agosto de 2026, Cefor/IFES,
Vitória-ES). Tema: *"Tecnologia, Transformação e Educação a Distância: 20 anos construindo
novos cenários educacionais"*.

Este repo é a **fonte única de verdade** do projeto: contexto, decisões, spec e código do app.
Surgiu de uma dor concreta do brainstorm de 13/05/2026 — *"tem que ter algum lugar que é o
cérebro"*, porque as coisas estavam espalhadas em Kanboard, Drive e máquinas. Aqui é esse lugar.

## O que estamos construindo

Um app (PWA) para **causar no evento com simplicidade** — coisas bem simples e muito efetivas.
Conceito-espinha: a **linha do tempo / passagem do tempo** (alusão aos 20 anos). Tudo que
acontece no evento é um registro *com timestamp* e se conecta. App, telão e relatório final
caem do mesmo modelo de dados.

**Escopo v1 (travado):**
1. Programação viva + "o que é agora / o que vem" (navegação por linha do tempo)
2. Reações ao vivo no telão (joinha/coração durante as palestras)
3. Dashboard/relatório final (requisito fixo)

Tudo o mais do brainstorm está catalogado como **fase 2** — ver `contexto/brainstorm/sintese-ideias.md`.

## Folder Map

```
concefor-innovation/
├── CLAUDE.md                 (você está aqui)
├── README.md                 (porta de entrada curta)
├── decisoes.md               (log datado de decisões)
├── links.md                  (onde está cada coisa: Drive, Kanboard, GitHub, site)
├── contexto/
│   ├── evento.md             (o VIII Concefor: tema, datas, eixos, formato)
│   ├── identidade-selo.md    (selo 20 anos, animações Remotion)
│   ├── livro/                (Livro Cefor 20 anos — fonte de conteúdo)
│   └── brainstorm/           (transcrição original + síntese curada das ideias)
├── design-system/            (identidade visual: Concefor base + selo 20 anos acento)
│   ├── concefor/             (tokens.css/json, preview.html, README)
│   └── selo-20-anos/         (idem + manual oficial em assets/)
├── spec/
│   └── app-v1.md             (especificação do app)
└── app/                      (código do PWA — Next.js + Supabase)
```

## Como navegar

| Quero... | Vá para |
|---|---|
| Entender o evento | `contexto/evento.md` |
| Ver o que vamos construir | `spec/app-v1.md` |
| Ver cores, tipografia e tokens da identidade | `design-system/` |
| Entender por que cortamos uma ideia | `contexto/brainstorm/sintese-ideias.md` |
| Saber onde está um arquivo/recurso | `links.md` |
| Ver decisões e seus porquês | `decisoes.md` |
| Usar conteúdo do livro 20 anos | `contexto/livro/livro-completo.md` |

## Princípios

- **Simples que causa** > complexo que impressiona. Cada feature precisa justificar a complexidade.
- **Timestamp em tudo.** Se tem hora, entra na linha do tempo e se conecta.
- **Sem custo descontrolado.** IA externa com hard-cap; preferir a IA local do Cefor onde der.
- **O cérebro sabe onde está cada coisa.** Se um recurso mora fora do repo, registre em `links.md`.
