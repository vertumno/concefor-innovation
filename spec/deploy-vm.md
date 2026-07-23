# Deploy — especificação da VM para a CGTI (R5)

Especificação de software da VM do app do VIII Concefor, enviada à CGTI/Cefor em
20/07/2026 (Saymon pediu as dependências; o hardware já foi passado antes:
1 vCPU/1–2 GB pré-evento · 4 vCPU/8 GB no evento). Fonte da verdade desta conversa.

## Resumo em uma linha

**Linux x86-64 + Docker + proxy reverso com HTTPS.** O app roda num único container
(Node.js 22 embutido na imagem); o banco é SQLite em arquivo (volume) — **não precisa
instalar Node, banco de dados nem runtime nenhum na VM.**

## Dependências de software

| Item | Especificação |
|---|---|
| SO | Linux x86-64 — qualquer padrão da CGTI (Ubuntu 22.04+/Debian 12) |
| Docker Engine | ≥ 24 (única dependência real; `docker compose` opcional) |
| Proxy reverso | O que a CGTI usa (nginx/Apache/Caddy) com **HTTPS** — certificado institucional ou Let's Encrypt |
| Banco de dados | **Nenhum a instalar** — SQLite embutido no app, arquivo em volume Docker |
| Outros serviços | Nenhum (sem Redis, sem fila, sem GPU, sem LDAP) |

Alternativa sem Docker (se a CGTI preferir): Node.js 22 LTS + npm; o módulo nativo
better-sqlite3 tem binário pronto para Linux x64/glibc (se precisar compilar:
`python3 make g++`). Docker é o caminho recomendado — imagem multi-stage já pronta no
repo (`app/Dockerfile`, `output: standalone`).

## Rede

- **Entrada:** 443 público (o app precisa abrir **de fora da rede do Ifes** — validação
  de 30/07 tem participantes remotos; lançamento 07/08 é para todos os inscritos).
  O container escuta em 3000 (só local, atrás do proxy).
- **Saída (egress):** HTTPS 443 para `www.even3.com.br` (sync da programação/inscritos).
- **DNS:** um subdomínio amigável (sugestão: `app.concefor.cefor.ifes.edu.br` ou
  similar). HTTPS é requisito duro: PWA instalável e câmera (QR) só funcionam em
  secure context.

### SSE (tempo real do telão) atrás do proxy

O app usa Server-Sent Events em `/api/live/*` — o proxy **não pode bufferizar** essa
rota. No nginx:

```nginx
location /api/live/ {
  proxy_pass http://127.0.0.1:3000;
  proxy_http_version 1.1;
  proxy_set_header Connection "";
  proxy_buffering off;
  proxy_cache off;
  proxy_read_timeout 3600s;
}
```

(Demais rotas: proxy_pass comum para :3000.)

## Operação

```bash
# build da imagem (a partir do repo) e execução
docker build -t concefor-app ./app
docker run -d --name concefor --restart unless-stopped \
  -p 127.0.0.1:3000:3000 \
  -v concefor-data:/app/data \
  --env-file /caminho/concefor.env \
  concefor-app

# primeira carga de dados (programação real do Even3)
docker exec concefor node scripts/sync-even3.mjs
```

- **Volume persistente:** `/app/data` (arquivo SQLite + WAL). Precisa sobreviver a
  restart/redeploy. **Backup = copiar o arquivo** (1× por dia resolve; no evento, mais).
- **Variáveis de ambiente** (arquivo `.env` fora do repo, 3 chaves):
  `DATABASE_PATH=/app/data/concefor.db` · `ADMIN_TOKEN=<segredo>` ·
  `EVEN3_API_TOKEN=<chave da API do Even3 — segredo>`
- **Logs:** stdout do container (`docker logs`).
- **Atualizações:** rebuild da imagem + `docker restart` (o volume preserva os dados).
  Podemos entregar imagem pronta (tar/registry) se a CGTI preferir não buildar.

## Plano B (registrado)

Notebook na rede local do evento rodando o mesmo container — o app funciona na LAN
mesmo com a internet fora (decisão de 06/07). Não substitui a URL pública para o
pré-evento.
