// Extração de .tar.gz em Node puro.
//
// Por que não chamar o `tar` do sistema: no Git Bash do Windows, o tar do MSYS
// lê "C:\caminho" como se "C:" fosse uma máquina remota e falha com
// "Cannot connect to C: resolve failed". Ficaria dependendo de qual tar está no
// PATH da máquina de quem roda. O formato tar é uma sequência de blocos de 512
// bytes — mais simples ler aqui do que administrar essa diferença.

import { gunzipSync } from "node:zlib";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, normalize } from "node:path";

const BLOCO = 512;
const texto = (buf, ini, tam) => buf.toString("utf8", ini, ini + tam).replace(/\0.*$/s, "").trim();

/** Extrai o .tar.gz em `destino`. Devolve a lista de arquivos escritos. */
export function extrair(arquivoTarGz, destino) {
  const tar = gunzipSync(readFileSync(arquivoTarGz));
  const escritos = [];

  for (let p = 0; p + BLOCO <= tar.length; ) {
    const nome = texto(tar, p, 100);
    if (!nome) {
      p += BLOCO; // bloco de preenchimento; o fim são dois deles
      continue;
    }
    const tamanho = parseInt(texto(tar, p + 124, 12) || "0", 8);
    const tipo = String.fromCharCode(tar[p + 156]);
    const prefixo = texto(tar, p + 345, 155);
    const caminhoRelativo = prefixo ? `${prefixo}/${nome}` : nome;

    // Nunca deixar um caminho do arquivo escapar da pasta de destino.
    const seguro = normalize(caminhoRelativo).replace(/^(\.\.[/\\])+/, "");
    const alvo = join(destino, seguro);

    const inicioDados = p + BLOCO;
    if (tipo === "5") {
      mkdirSync(alvo, { recursive: true });
    } else if (tipo === "0" || tipo === "\0" || tipo === "") {
      mkdirSync(dirname(alvo), { recursive: true });
      writeFileSync(alvo, tar.subarray(inicioDados, inicioDados + tamanho));
      escritos.push(alvo);
    }
    // Os dados ocupam um número inteiro de blocos.
    p = inicioDados + Math.ceil(tamanho / BLOCO) * BLOCO;
  }

  return escritos;
}
