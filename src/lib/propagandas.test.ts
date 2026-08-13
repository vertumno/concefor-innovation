import assert from "node:assert/strict";
import { test } from "node:test";
import { ordenarPropagandas, parsePropaganda, propagandaNoAr, renderMarkdown } from "./propagandas";

// O parse dos cartazes do telão é puro: nada de banco, nada de fs. Estes testes
// seguram o contrato do frontmatter, que é a interface de quem escreve um cartaz
// sem abrir código — um erro aqui só apareceria no telão, na frente da plateia.

test("cartaz sem frontmatter herda o nome do arquivo e os padrões", () => {
  const p = parsePropaganda("livro-do-nte.md", "Lançamento no dia 17.");
  assert.ok(p);
  assert.equal(p.id, "livro-do-nte");
  assert.equal(p.titulo, "livro do nte");
  assert.equal(p.duracao, 20);
  assert.equal(p.posicao, "lateral");
  assert.equal(p.corpo, "<p>Lançamento no dia 17.</p>");
});

test("frontmatter define o cartaz e a duração é contida na faixa segura", () => {
  const base = (duracao: string) =>
    parsePropaganda(
      "x.md",
      `---\ntitulo: Vitrine de MOOCs\nchamada: Cursos abertos\nposicao: modal\nordem: 2\nduracao: ${duracao}\n---\n\nCorpo.`,
    );

  const p = base("45");
  assert.ok(p);
  assert.equal(p.titulo, "Vitrine de MOOCs");
  assert.equal(p.chamada, "Cursos abertos");
  assert.equal(p.posicao, "modal");
  assert.equal(p.ordem, 2);
  assert.equal(p.duracao, 45);

  // Um zero digitado sem querer congelaria o giro; um valor enorme prenderia o telão.
  assert.equal(base("0")?.duracao, 5);
  assert.equal(base("99999")?.duracao, 300);
  assert.equal(base("abc")?.duracao, 20);
});

test("ativo: false tira o cartaz do ar sem apagar o arquivo", () => {
  // O parse não descarta o inativo: marca e devolve, senão o /admin não tem
  // como listar (e religar) um cartaz que o arquivo desligou.
  assert.equal(parsePropaganda("x.md", "---\nativo: false\n---\nCorpo.").ativo, false);
  assert.equal(parsePropaganda("x.md", "---\nativo: true\n---\nCorpo.").ativo, true);
  assert.equal(parsePropaganda("x.md", "Sem frontmatter.").ativo, true);
});

test("o liga/desliga do admin tem a última palavra sobre o ativo: do arquivo", () => {
  const doArquivo = parsePropaganda("x.md", "---\nativo: false\n---\nCorpo.");
  assert.equal(propagandaNoAr(doArquivo, {}), false); // sem override, vale o arquivo
  assert.equal(propagandaNoAr(doArquivo, { x: true }), true); // admin religou
  assert.equal(propagandaNoAr(doArquivo, { outro: true }), false); // override é por id

  const ligado = parsePropaganda("y.md", "---\nativo: true\n---\nCorpo.");
  assert.equal(propagandaNoAr(ligado, { y: false }), false); // admin tirou do ar
});

test("qr: true aproveita o link; uma URL em qr: tem prioridade sobre ele", () => {
  const doLink = parsePropaganda(
    "x.md",
    "---\nlink: https://mooc.cefor.ifes.edu.br/\nqr: true\n---\nCorpo.",
  );
  assert.equal(doLink?.qr, "https://mooc.cefor.ifes.edu.br/");

  const proprio = parsePropaganda(
    "x.md",
    "---\nlink: https://cefor.ifes.edu.br/\nqr: https://app.cefor.ifes.edu.br/\n---\nCorpo.",
  );
  assert.equal(proprio?.qr, "https://app.cefor.ifes.edu.br/");

  assert.equal(parsePropaganda("x.md", "---\nlink: https://a.b/\n---\nCorpo.")?.qr, undefined);
});

test("o rótulo do QR é o domínio, não o caminho inteiro do link", () => {
  // Um caminho longo projetado ao lado do QR quebra em várias linhas e ninguém
  // digita: o QR carrega a URL completa, o texto só precisa dizer de onde é.
  const livro = parsePropaganda(
    "x.md",
    "---\nlink: https://cefor.ifes.edu.br/index.php/publicacoes/2-uncategorised/17710-livro20anos\n---\nx",
  );
  assert.equal(livro?.rotulo, "cefor.ifes.edu.br");

  const insta = parsePropaganda(
    "x.md",
    "---\nlink: https://www.instagram.com/ifescefor/\nrotulo: \"@ifescefor\"\n---\nx",
  );
  assert.equal(insta?.rotulo, "@ifescefor");
});

test("markdown do cartaz escapa HTML e formata título, lista, ênfase e link", () => {
  const html = renderMarkdown(
    ["## Base de Conhecimentos", "", "- **130 artigos**", "- Trilhas de *Moodle*", "", "[Acesse](https://conhecimento.cefor.ifes.edu.br/)"].join("\n"),
  );
  assert.equal(
    html,
    "<h3>Base de Conhecimentos</h3>" +
      "<ul><li><strong>130 artigos</strong></li><li>Trilhas de <em>Moodle</em></li></ul>" +
      '<p><a href="https://conhecimento.cefor.ifes.edu.br/">Acesse</a></p>',
  );
  assert.equal(renderMarkdown("<script>alert(1)</script>"), "<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>");
  // Quebra de linha do arquivo é só conforto de quem escreve: no cartaz estreito
  // ela não pode virar quebra de verdade no meio da frase.
  assert.equal(renderMarkdown("uma frase\nque continua"), "<p>uma frase que continua</p>");
  // Negrito que atravessa a quebra de linha do arquivo: apareceu com os ** crus
  // no telão porque cada linha era formatada isolada antes de juntar.
  assert.equal(
    renderMarkdown("trilhas sobre **Moodle e IA na\neducação**."),
    "<p>trilhas sobre <strong>Moodle e IA na educação</strong>.</p>",
  );
});

test("link com esquema perigoso não vira href e o texto sobrevive", () => {
  assert.equal(renderMarkdown("[clique](javascript:alert)"), "<p>clique</p>");
  // Parênteses aninhados deixam uma sobra visível no texto — feio, mas inofensivo:
  // o que não pode acontecer é o esquema virar href, e isso vale em qualquer forma.
  assert.doesNotMatch(renderMarkdown("[clique](javascript:alert(1))"), /href|javascript:/);
  assert.equal(parsePropaganda("x.md", "---\nlink: javascript:alert(1)\n---\nCorpo.")?.link, undefined);
});

test("arquivo .html entra como está — é a válvula de escape para arte livre", () => {
  const p = parsePropaganda("x.html", "---\ntitulo: Livre\n---\n<div class='arte'>oi</div>");
  assert.equal(p?.corpo, "<div class='arte'>oi</div>");
});

test("ordem manda no giro e o empate resolve por nome, não pela pasta", () => {
  const cartaz = (id: string, ordem: number) => ({ ...parsePropaganda(`${id}.md`, `---\nordem: ${ordem}\n---\nx`)! });
  const giro = ordenarPropagandas([cartaz("zebra", 1), cartaz("abelha", 9), cartaz("agulha", 1)]);
  assert.deepEqual(giro.map((p) => p.id), ["agulha", "zebra", "abelha"]);
});

test("galeria aceita só pasta relativa dentro de public", () => {
  assert.equal(parsePropaganda("x.md", "---\ngaleria: fotos-evento\n---\nx")?.galeria, "fotos-evento");
  assert.equal(parsePropaganda("x.md", "---\ngaleria: ../../etc\n---\nx")?.galeria, undefined);
});
