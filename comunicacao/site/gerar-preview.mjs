/**
 * Gera preview-programacao-2026.html a partir de programacao-2026-wordpress.html.
 *
 * O arquivo do WordPress é a fonte única: o preview só embrulha o mesmo conteúdo
 * numa casca que imita o tema do site. Rode depois de qualquer edição:
 *
 *   node comunicacao/site/gerar-preview.mjs
 */
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const origem = join(aqui, 'programacao-2026-wordpress.html');
const destino = join(aqui, 'preview-programacao-2026.html');

const bruto = await readFile(origem, 'utf8');

// Tira os comentários de bloco do Gutenberg (<!-- wp:... --> e <!-- /wp:... -->),
// que só existem para o editor e não aparecem no site publicado.
const conteudo = bruto
  .split('\n')
  .filter((linha) => !/^\s*<!--\s*\/?wp:/.test(linha))
  .join('\n')
  .replace(/\n{3,}/g, '\n\n')
  .trim();

const casca = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Preview - Programacao VIII Concefor</title>
<style>
  /* Pre-visualizacao para aprovacao. Reproduz o tema Catch Base do site.
     GERADO por gerar-preview.mjs - nao editar a mao.

     IMPORTANTE: o tema do site define html{font-size:10px} e corpo de texto
     em 15px. Isso e reproduzido aqui de proposito - sem isso o preview mente
     sobre o tamanho do texto e qualquer "rem" no estilo da pagina aparece
     60% maior no preview do que no site de verdade. */
  html{font-size:10px;}
  *{box-sizing:border-box;}
  body{margin:0;padding:0 0 48px;background:#f2f2f2;font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;font-size:15px;line-height:1.5;color:#333;-webkit-font-smoothing:antialiased;}
  .aviso{padding:10px 16px;font-size:13px;text-align:center;letter-spacing:.02em;color:#fff;background:#0e2240;}
  .site{max-width:1060px;margin:24px auto;background:#fff;border:1px solid #e4e4e4;}
  .masthead{display:flex;align-items:center;gap:14px;padding:22px 35px;}
  .logo-fake{width:52px;height:46px;flex:none;border-radius:4px;background:linear-gradient(135deg,#7ab51d 0 33%,transparent 33%),linear-gradient(45deg,#d6004b 0 33%,transparent 33%),#0ab4c4;}
  .site-title{margin:0;font-size:30px;font-weight:400;color:#333;}
  .site-desc{margin:3px 0 0;font-size:12px;font-style:italic;color:#777;}
  .nav{padding:0 35px;border-top:1px solid #eee;border-bottom:1px solid #eee;}
  .nav ul{display:flex;flex-wrap:wrap;gap:26px;margin:0;padding:0;list-style:none;}
  .nav li{padding:14px 0;font-size:13px;color:#666;}
  .nav li.ativo{color:#0e8fa8;}
  .entry-container{padding:32px 35px 42px;}
  .entry-title{margin:0 0 22px;font-size:32px;font-weight:400;color:#333;}
  /* 780px e a largura real da area de conteudo do site em tela de 1280px */
  .entry-content{max-width:780px;}
  .entry-content p{margin:0 0 16px;}
  .entry-content figure{margin:0;}
  .rodape-preview{max-width:1060px;margin:0 auto;padding:16px 35px;font-size:12px;color:#999;text-align:center;}
  @media screen and (max-width:640px){.masthead,.nav,.entry-container{padding-left:18px;padding-right:18px;}}
</style>
</head>
<body>
<div class="aviso">Pre-visualizacao para aprovacao &middot; nao e o site publicado &middot; reduza a janela para conferir o layout de celular</div>
<div class="site">
  <header class="masthead">
    <div class="logo-fake"></div>
    <div>
      <p class="site-title">Concefor</p>
      <p class="site-desc">VIII Congresso Regional de Forma&ccedil;&atilde;o e Educa&ccedil;&atilde;o a Dist&acirc;ncia &middot; 17 a 20 de agosto de 2026</p>
    </div>
  </header>
  <nav class="nav">
    <ul>
      <li>O Evento</li><li class="ativo">Programa&ccedil;&atilde;o</li><li>Inscri&ccedil;&otilde;es</li>
      <li>Submiss&otilde;es</li><li>Guia do Participante</li><li>Apresenta&ccedil;&atilde;o de Trabalhos</li><li>Contato</li>
    </ul>
  </nav>
  <div class="entry-container">
    <h1 class="entry-title">Programa&ccedil;&atilde;o</h1>
    <div class="entry-content">
${conteudo}
    </div>
  </div>
</div>
<p class="rodape-preview">CGTE &middot; Cefor/Ifes &middot; proposta de p&aacute;gina de programa&ccedil;&atilde;o do VIII Concefor</p>
</body>
</html>
`;

await writeFile(destino, casca, 'utf8');
console.log('preview-programacao-2026.html gerado a partir de programacao-2026-wordpress.html');
