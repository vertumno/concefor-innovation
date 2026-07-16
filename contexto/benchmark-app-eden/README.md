# Benchmark — app do evento EDEN 2026 (Porto)

Prints enviados pela Rutinha em 16/07/2026 (pendência antiga do plano — benchmark de
networking citado na reunião de 02/07). App da EDEN 2026 Annual Conference (Porto,
14–16/06/2026), rodando na plataforma **COMS** (aparece um "COMS bot" na lista de
participantes). ~299 participantes no app.

## O que o app deles tem (print a print)

| Print | Tela | O que mostra |
|---|---|---|
| `01` | Home | Banner do evento, título, datas, tema por extenso; avatar do usuário no topo direito |
| `02` | Home (rolando) | Local do evento com endereço + mapa embutido; seção de patrocinadores |
| `03`–`05` | Community | Canais estilo Slack: "Contact the organisers", "Free channel", "Questions for the speakers", "Sponsors", "Updates about the event"; abas Channels / Combined feed / Search / Starred; badge de não lidas |
| `06` | Participants | Lista com busca; filtros All / Organizers / Speakers / Last login / Never logged; "Active now" vs "Offline"; nome + instituição; botão de chat por pessoa |
| `07` | Messages | Conversas diretas 1:1 com outros participantes |

**Navegação:** barra inferior fixa com 5 itens — **Home · Agenda · Community · Messages ·
Participants** — item ativo vira pílula preenchida (verde) com badge de notificação.

## O que levamos para o app do Concefor (decidido em 16/07)

- **Barra de navegação inferior** (em vez do menu no topo): padrão consolidado de app de
  evento, alcançável com o polegar. **Torção nossa: o slot central vira o botão "Ao Vivo"**
  — destaque visual (círculo elevado, gold), leva direto pra sessão acontecendo agora.
  O Eden não tem esse conceito; é a nossa espinha (linha do tempo) virando interface.
- **Item ativo como pílula preenchida** com label sempre visível (bom para acessibilidade).
- **Avatar/estado de login no topo direito** — quando o login pelo crachá existir.
- **Lista de participantes com busca** (nome + instituição) — vira a base da aba "Pessoas"
  quando o networking entrar (dados via API Even3).
- **Local + mapa dentro do app** (não só link) — entra em Informações.

## O que NÃO levamos (e por quê)

- **Chat interno / mensagens diretas** — o Léo já tinha alertado em 02/07: "vai dar
  trabalho" (moderação, expectativa de resposta). Nosso networking é **troca de contato
  por QR do crachá**, presencial, sem inbox.
- **Canais de comunidade estilo Slack** — complexidade de moderação; nossa versão mínima é
  um mural de **avisos da organização** (mão única) + perguntas por sessão com upvote.
- **Filtros "last login/never logged"** — telemetria de organizador, não experiência de
  participante; nosso dashboard admin já cobre.
