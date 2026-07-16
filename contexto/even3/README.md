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

Nome, e-mail (com confirmação), nacionalidade, documento (CPF). **Não confirmado** se data
de nascimento é coletada — a reunião de 02/07 tendeu a usar data de nascimento como segundo
fator do login, mas isso **depende de o campo existir no cadastro**. Pendências:

- [ ] Confirmar campos exportáveis da lista de inscritos (API ou export manual do organizador)
- [ ] Definir o segundo fator do login (data de nascimento, CPF parcial, ou e-mail)
- [ ] Confirmar acesso/credenciais da API do Even3 (ver `../../links.md`)
- [ ] Verificar se dá para enviar mensagem aos inscritos pelo Even3 (divulgar o app antes do evento)

## Fricção conhecida

Fora do crachá físico, achar o próprio nº do ingresso no site do Even3 é difícil (os dois
penaram na reunião de 02/07). O login digitado só funciona bem **durante** o evento, com o
crachá na mão; antes do evento, melhor pensar em outro caminho (link mágico por e-mail?).
