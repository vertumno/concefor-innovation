# Even3 — plataforma de inscrição do VIII Concefor

O que sabemos sobre o Even3 para a integração de identidade (login pelo crachá — pós-piloto,
antes do evento; ver `decisoes.md` 2026-07-06).

## O crachá

Exemplo real em `cracha-exemplo.jpg` (crachá do Marquito, gerado pelo Even3):

- **QR code** codifica o **nº do ingresso** (8 dígitos — ex.: `73299366`), impresso logo
  abaixo do QR. Há também um código de barras com o mesmo dado.
- Impressos: nome completo, evento, local, datas, **categoria de inscrição**
  ("Servidores do Cefor, Membros dos NTEs do Ifes e terceirizados do Cefor").
- Datas no crachá: **17/08/2026 18:00 → 20/08/2026 18:00** (o evento começa na noite do dia 17).

## Cadastro (campos vistos na tela de inscrição em 02/07)

Nome, e-mail (com confirmação), nacionalidade, documento (CPF). Pendências (estado em
16/07/2026 — detalhes em [`api.md`](api.md)):

- [x] ~~Confirmar campos exportáveis da lista de inscritos~~ → **API validada em 16/07**:
  nome, e-mail, CPF, gênero, foto, categoria, `checkin_code` (= nº do ingresso do crachá).
  **Não há data de nascimento no cadastro.**
- [x] ~~Confirmar acesso/credenciais da API~~ → chave obtida (Configurações → Integrações),
  vive em `app/.env.local` (gitignored). Uso somente-leitura por ora.
- [ ] Definir o segundo fator do login — data de nascimento **caiu** (campo não existe);
  restam **CPF parcial** (ex.: 4 primeiros dígitos) ou e-mail. Decidir com Elton.
- [ ] Verificar se dá para enviar mensagem aos inscritos pelo Even3 (divulgar o app antes
  do evento — o plano de 16/07 é e-mail no lançamento de 07/08)

## Fricção conhecida

Fora do crachá físico, achar o próprio nº do ingresso no site do Even3 é difícil (os dois
penaram na reunião de 02/07). O login digitado só funciona bem **durante** o evento, com o
crachá na mão; antes do evento, melhor pensar em outro caminho (link mágico por e-mail?).
