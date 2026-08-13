# Fotos do evento (galeria do telão)

As imagens desta pasta giram dentro do cartaz [`fotos-do-evento.md`](../fotos-do-evento.md)
(campo `galeria: propagandas/fotos`).

- Formatos aceitos: `.png`, `.jpg`, `.jpeg`, `.webp`, `.avif`, `.gif`, `.svg`
- A ordem é a alfabética do nome do arquivo — use um prefixo (`01-`, `02-`…) ou
  o horário (`1708-2015-abertura.jpg`) para controlar a sequência
- Deixe as fotos **na horizontal** e com o lado maior em torno de 1600 px: o
  cartaz é uma coluna estreita no telão, e arquivo grande demais só pesa
- Arquivos começando com `_` (como este README) são ignorados

A pasta é lida a cada 5 minutos pelo telão, então foto nova entra sem reiniciar
nada — mas, como `public/` faz parte da imagem Docker, hoje **entrar aqui exige
deploy**. Trazer as fotos do Drive ou do Instagram automaticamente durante o
evento é o passo seguinte, e depende de os serviços do Ifes estarem no ar.
