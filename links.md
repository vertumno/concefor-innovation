# Onde está cada coisa

O cérebro não precisa guardar tudo dentro de si, mas precisa **saber onde tudo está**. Registre
aqui todo recurso que mora fora deste repo. (Preencher os `<placeholder>`.)

## Repositório

- **GitHub:** https://github.com/vertumno/concefor-innovation — **monorepo/fonte de verdade** (app + contexto + comunicação)
- **GitLab IFES (app):** https://gitlab.ifes.edu.br/cefor/concefor-app — **espelho só do `app/`** (código do PWA, com histórico), para a CGTI/Sérgio deployar. Fonte segue sendo o monorepo; atualizar o espelho pelo procedimento em `decisoes.md` (2026-07-23)
- **Ex-repo `concefor2026`** (central de comunicação): https://github.com/vertumno/concefor2026 — **incorporado aqui em `comunicacao/` (16/07/2026)**; arquivar no GitHub para não virar fonte concorrente

## Comunicação (CGTE)

- **📋 Doc de solicitações da Márcia (coordenadora do Concefor)** — onde ela pede atualizações
  do site e novas peças; **consultar sempre**: https://docs.google.com/document/d/1un58VaMY0wwIVaxfcf9Ssb3tBKuKz_Nj/edit?usp=sharing&ouid=102948503336580466969&rtpof=true&sd=true
- **🎨 Artes do Concefor (pasta no Canva):** https://canva.link/wdnsx8ggf61x2hs
  *(pasta registrada anteriormente: https://www.canva.com/folder/FAHDrZ44PIM — confirmar se é a mesma)*
- **🖌️ Matrizes do Illustrator (Drive da CGTE):** https://drive.google.com/drive/folders/1fuoepIyukqXTw035JtTj-MSbnpw7veJn?usp=drive_link
- **📤 Arquivos editáveis e públicos (compartilhar com a comissão):** https://drive.google.com/drive/folders/1-CH92C467aI7C_dj6fE4O5XBI8A_qShv
- **Central de comunicação (neste repo):** `comunicacao/` — board, calendário, palestrantes, peças

## Evento

- **Site oficial:** https://concefor.cefor.ifes.edu.br/
- **Cefor/IFES:** <link institucional>
- **Plataforma de inscrição — Even3** (API p/ login pelo crachá, pós-piloto): `<link do evento no Even3>` — confirmar acesso/credenciais da API; o que já sabemos está em `contexto/even3/README.md`

## Identidade visual

- **Design system (neste repo):** `design-system/` — Concefor (base) + selo 20 anos (acento)
- **Manual de Identidade Visual do selo (PDF oficial):** https://publicacoes.ifes.edu.br/cef/Manual_do_Selo_20_anos_Cefor.pdf — cópia em `design-system/selo-20-anos/assets/manual-identidade-visual.pdf`
- **Arquivos do selo (PNG, Drive oficial):** https://drive.google.com/drive/folders/1Nsf8LJoEd5Cm3QV7aCATp4fD0vkSeFne — baixar vetor/PNG para `design-system/selo-20-anos/assets/`
- **Gerador de assinatura de e-mail (Cefor):** https://publicacoes.ifes.edu.br/cef/gerador_assinatura.html
- **Notícia oficial do selo:** https://cefor.ifes.edu.br/index.php/noticias/246-noticias/17658-cefor-apresenta-selo-comemorativo-dos-20-anos-e-disponibiliza-manual-de-identidade-visual-para-download

## Drive

- **Pasta-raiz do Concefor no Drive:** `<link>`
- **Selo 20 anos (assets):** `<link>`
- **Programação oficial (planilha/doc):** `<link>`

## Kanboard (CGTE)

Cards relacionados ao Concefor no Kanboard da CGTE (registrados em 16/07/2026 — estão
desorganizados por lá, mas podem ser necessários):

| Card | Título | Link |
|---|---|---|
| #7809 | VIII Concefor (2026) — card geral | https://board.cefor.ifes.edu.br/?controller=TaskViewController&action=show&task_id=7809 |
| #7824 | Criar NotebookLM para o Concefor | https://board.cefor.ifes.edu.br/?controller=TaskViewController&action=show&task_id=7824 |
| #7829 | Artes para o Concefor | https://board.cefor.ifes.edu.br/?controller=TaskViewController&action=show&task_id=7829 |
| #7831 | Inovações para o VIII Concefor — definição de caminhos | https://board.cefor.ifes.edu.br/?controller=TaskViewController&action=show&task_id=7831 |
| #7848 | Oficina de IA no Concefor — Elton e Marquito | https://board.cefor.ifes.edu.br/?controller=TaskViewController&action=show&task_id=7848 |

Busca geral por "CONCEFOR" no Kanboard: https://board.cefor.ifes.edu.br/?controller=SearchController&action=index&search=CONCEFOR

## Tracks paralelos

- **Animações Remotion (selo 20 anos):** `<repo/pasta>`
- **Livro Cefor 20 anos (workspace de escrita, cap. 5):** `C:\dev\claude\livro-cefor-capitulo5`

## Infra

- **IA local do Cefor (endpoint):** `<host:porta>` — a confirmar
- **Banco de dados:** SQLite local (arquivo no servidor, dentro do deploy) — sem serviço externo.
  Supabase saiu do v1 (ver `decisoes.md` 2026-07-06); se voltar, registrar a URL aqui.
- **Deploy (servidor Cefor, Docker):** `<url>` — a definir (Vercel não serve mais: SQLite + SSE
  pedem processo sempre-ligado)
