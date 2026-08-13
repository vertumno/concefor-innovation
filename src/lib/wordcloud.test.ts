import assert from "node:assert/strict";
import { test } from "node:test";
import {
  layoutNuvem,
  espacoLetrasNuvem,
  ESCALA_MASCARA,
  type Rasterizador,
  type PalavraPosicionada,
} from "./wordcloud";

// O layout da nuvem é puro (o rasterizador entra por parâmetro), então dá para
// testar sem browser. É onde um defeito passaria despercebido: palavra
// sobreposta ou fora da tela só apareceria na projeção, na frente da plateia.

// Rasterizador denso: a palavra inteira é tinta. Serve para o pior caso de
// ocupação — nada encaixa dentro de nada.
const solido: Rasterizador = (texto, fontePx, vertical) => {
  const w = Math.max(1, Math.ceil((texto.length * fontePx * 0.5) / ESCALA_MASCARA));
  const h = Math.max(1, Math.ceil(fontePx / ESCALA_MASCARA));
  const largura = vertical ? h : w;
  const altura = vertical ? w : h;
  return { largura, altura, mascara: new Uint8Array(largura * altura).fill(1) };
};

const AREA = { largura: 1600, altura: 800, rasterizar: solido };

function seSobrepoem(a: PalavraPosicionada, b: PalavraPosicionada): boolean {
  return (
    a.x < b.x + b.largura &&
    b.x < a.x + a.largura &&
    a.y < b.y + b.altura &&
    b.y < a.y + a.altura
  );
}

const nPalavras = (n: number, count = 1) =>
  Array.from({ length: n }, (_, i) => ({ word: `palavra${i}`, count }));

test("nuvem não sobrepõe palavras nem sai da área", () => {
  const postas = layoutNuvem(
    [
      { word: "privacidade", count: 4 },
      { word: "aprendizagem", count: 3 },
      { word: "acesso", count: 2 },
      ...nPalavras(30),
    ],
    AREA,
  );

  assert.ok(postas.length > 10, "deveria posicionar a maior parte das palavras");
  for (const p of postas) {
    assert.ok(p.x >= 0 && p.y >= 0, `${p.word} saiu pela borda superior/esquerda`);
    assert.ok(p.x + p.largura <= AREA.largura, `${p.word} passou da direita`);
    assert.ok(p.y + p.altura <= AREA.altura, `${p.word} passou de baixo`);
  }
  // Com máscara sólida, nenhuma caixa pode encostar em outra.
  for (let i = 0; i < postas.length; i++) {
    for (let j = i + 1; j < postas.length; j++) {
      assert.ok(
        !seSobrepoem(postas[i], postas[j]),
        `"${postas[i].word}" e "${postas[j].word}" se sobrepõem`,
      );
    }
  }
});

test("ocupação é a tinta, não o retângulo — palavra encaixa no vão da outra", () => {
  // É o ponto do IntegralOccupancyMap do word_cloud, e o que faltava na versão
  // por bounding box. Aqui a primeira palavra é um "anel": tinta na borda e um
  // buraco no meio. Uma palavra pequena TEM que poder entrar nesse buraco.
  const comBuraco: Rasterizador = (texto, fontePx) => {
    if (texto !== "anel") return solido(texto, fontePx, false);
    const lado = 60;
    const mascara = new Uint8Array(lado * lado).fill(1);
    for (let y = 10; y < lado - 10; y++) {
      for (let x = 10; x < lado - 10; x++) mascara[y * lado + x] = 0;
    }
    return { largura: lado, altura: lado, mascara };
  };

  // Área pouco maior que o anel: sobrando espaço em volta, a pequena acharia
  // lugar do lado de fora e o teste não provaria nada. Apertando, o buraco é o
  // ÚNICO lugar onde ela cabe — e por bounding box não caberia em lugar nenhum.
  // Folga suficiente para o anel caber COM a margem de respiro em volta, e nada
  // além disso: sobrando espaço, a pequena iria para fora e o teste não provaria
  // nada. A espiral parte do centro, então o buraco é o primeiro lugar testado.
  const lado = 60 * ESCALA_MASCARA;
  const postas = layoutNuvem(
    [
      { word: "anel", count: 9 },
      { word: "eu", count: 1 },
    ],
    { largura: lado + 40, altura: lado + 40, rasterizar: comBuraco, fonteMin: 6 },
  );

  const anel = postas.find((p) => p.word === "anel");
  const dentro = postas.find((p) => p.word === "eu");
  assert.ok(anel, "o anel deveria caber");
  assert.ok(dentro, "a pequena tinha que entrar no buraco do anel");
  assert.ok(
    seSobrepoem(anel, dentro),
    "a pequena deveria ocupar o buraco da grande — as CAIXAS se cruzam, a tinta não",
  );
});

test("a mais citada fica maior que a menos citada e perto do centro", () => {
  const postas = layoutNuvem(
    [{ word: "privacidade", count: 6 }, { word: "acesso", count: 3 }, ...nPalavras(20)],
    AREA,
  );
  const top = postas.find((p) => p.word === "privacidade");
  const cauda = postas.filter((p) => p.count === 1);
  assert.ok(top, "a palavra mais citada tem que caber");
  assert.ok(
    cauda.every((p) => p.fonte < top.fonte),
    "nenhuma palavra de contagem 1 pode ser maior que a mais citada",
  );
  // A primeira da fila entra no centro: é a espiral começando do meio.
  assert.ok(Math.abs(top.x + top.largura / 2 - AREA.largura / 2) < AREA.largura * 0.25);
  assert.ok(Math.abs(top.y + top.altura / 2 - AREA.altura / 2) < AREA.altura * 0.25);
});

test("contagens todas iguais ainda geram gradação — é o encolhe-até-caber", () => {
  // O caso que quebrou as duas primeiras tentativas: sem repetição nenhuma,
  // qualquer escala baseada só em `count` devolve tudo do mesmo tamanho. Aqui a
  // variação vem do espaço que sobra, como no word_cloud do amueller.
  const postas = layoutNuvem(nPalavras(45), AREA);
  const fontes = postas.map((p) => p.fonte);
  assert.ok(new Set(fontes.map(Math.round)).size > 1, "a nuvem não pode sair plana");
  assert.ok(
    Math.max(...fontes) / Math.min(...fontes) > 1.5,
    "a diferença entre a maior e a menor precisa ser visível de longe",
  );
});

test("mesma entrada devolve o mesmo layout — o telão repolla a cada 3s", () => {
  const entrada = [{ word: "privacidade", count: 3 }, ...nPalavras(15)];
  assert.deepEqual(
    layoutNuvem(entrada, AREA),
    layoutNuvem(entrada, AREA),
    "layout instável faria a nuvem dançar entre um poll e outro",
  );
});

test("nuvem cheia respeita o teto de palavras e o piso de corpo", () => {
  // A cauda de palavras pequenas dá massa à nuvem e faz o miolo saltar, mas tem
  // limite: abaixo do piso a palavra vira sujeira, e acima do teto a tela é só
  // ruído. Quem não couber em nenhum dos dois fica de fora.
  const postas = layoutNuvem(nPalavras(200), AREA);
  assert.ok(postas.length <= 70, `posicionou ${postas.length}, deveria limitar a 70`);
  const piso = Math.max(11, AREA.altura * 0.017);
  for (const p of postas) {
    assert.ok(p.fonte >= piso - 0.01, `"${p.word}" saiu com ${p.fonte}px, abaixo do piso`);
  }
});

test("tracking aperta conforme o corpo cresce", () => {
  // O canvas mede com este valor e a tela desenha com ele: se a função mudasse
  // só de um lado, voltariam as palavras sobrepostas.
  const em = (px: number) => Number(espacoLetrasNuvem(px).replace("em", ""));
  assert.ok(em(240) < em(80), "corpo grande tem que fechar mais que corpo médio");
  assert.ok(em(80) < em(14), "corpo médio tem que fechar mais que corpo pequeno");
  // Fora da faixa o valor satura, em vez de disparar para qualquer número.
  assert.equal(espacoLetrasNuvem(9), espacoLetrasNuvem(14));
  assert.equal(espacoLetrasNuvem(400), espacoLetrasNuvem(220));
});

test("respiro entre palavras sobrevive a máscara imprecisa", () => {
  // O canvas do browser e o desenho final nunca casam ao pixel. A margem tem que
  // absorver essa diferença: aqui a máscara mente 2px a menos em cada lado e
  // ainda assim nada pode encostar.
  const encolhida: Rasterizador = (texto, fontePx, vertical) => {
    const cheio = solido(texto, fontePx, vertical);
    return {
      largura: Math.max(1, cheio.largura - 1),
      altura: Math.max(1, cheio.altura - 1),
      mascara: new Uint8Array(
        Math.max(1, cheio.largura - 1) * Math.max(1, cheio.altura - 1),
      ).fill(1),
    };
  };
  const postas = layoutNuvem(
    [{ word: "destaque", count: 5 }, ...nPalavras(24)],
    { ...AREA, rasterizar: encolhida },
  );
  for (let i = 0; i < postas.length; i++) {
    for (let j = i + 1; j < postas.length; j++) {
      const a = postas[i];
      const b = postas[j];
      const folgaX = Math.max(a.x - (b.x + b.largura), b.x - (a.x + a.largura));
      const folgaY = Math.max(a.y - (b.y + b.altura), b.y - (a.y + a.altura));
      assert.ok(
        folgaX >= 0 || folgaY >= 0,
        `"${a.word}" e "${b.word}" ficaram sem respiro entre si`,
      );
    }
  }
});

test("área sem tamanho ou lista vazia não quebra o telão", () => {
  assert.deepEqual(layoutNuvem([], AREA), []);
  assert.deepEqual(layoutNuvem(nPalavras(5), { ...AREA, largura: 0 }), []);
  assert.deepEqual(layoutNuvem(nPalavras(5), { ...AREA, altura: 0 }), []);
});

test("palavra que não cabe de jeito nenhum fica de fora, sem sobrepor", () => {
  // Área minúscula: o algoritmo tem que desistir de palavras, não empilhá-las.
  const postas = layoutNuvem(nPalavras(40), { largura: 200, altura: 120, rasterizar: solido });
  assert.ok(postas.length < 40, "numa área apertada nem toda palavra cabe");
  for (const p of postas) {
    assert.ok(p.x + p.largura <= 200 && p.y + p.altura <= 120, `${p.word} vazou da área`);
  }
  for (let i = 0; i < postas.length; i++) {
    for (let j = i + 1; j < postas.length; j++) {
      assert.ok(!seSobrepoem(postas[i], postas[j]), "sobreposição na área apertada");
    }
  }
});
