// Sessões de teste para o DIA DE VALIDAÇÃO com a comissão (30/07/2026, 9h–10h,
// podendo se estender pelo dia). Cria uma grade de sessões fictícias encadeadas
// (ids `demo-validacao-*`) que sobrevivem ao `sync:even3` (não têm prefixo
// `even3-`) e podem ser ajustadas ao vivo pelo /admin (seção Programação).
//
// Uso:
//   npm run seed:validacao                      # grade de 2026-07-30
//   node scripts/seed-validacao.mjs --data=2026-07-31   # replicar noutro dia
//   node scripts/seed-validacao.mjs --limpar    # remove todas as demo-validacao-*
//
// No servidor (Docker):
//   docker run --rm -v concefor-data:/app/data --env-file .env.local \
//     concefor-app node scripts/seed-validacao.mjs

import Database from "better-sqlite3";
import { readFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const file = process.env.DATABASE_PATH || "./data/concefor.db";
mkdirSync(dirname(file), { recursive: true });

const db = new Database(file);
db.pragma("foreign_keys = ON");
db.exec(readFileSync(join(process.cwd(), "db", "schema.sql"), "utf8"));

const args = process.argv.slice(2);

if (args.includes("--limpar")) {
  const n = db.prepare("delete from sessions where id like 'demo-validacao-%'").run().changes;
  db.close();
  console.log(`${n} sessão(ões) de validação removida(s).`);
  process.exit(0);
}

const dataArg = args.find((a) => a.startsWith("--data="))?.slice(7);
const dia = dataArg || "2026-07-30";
if (!/^\d{4}-\d{2}-\d{2}$/.test(dia)) {
  console.error(`Data inválida: '${dia}' (esperado AAAA-MM-DD).`);
  process.exit(1);
}

// Horário de Brasília fixo no dado (mesma convenção do sync/enrich): o app
// compara strings ISO com offset, então o fuso da máquina não interfere.
const em = (hhmm) => `${dia}T${hhmm}:00-03:00`;

// Grade do dia: validação às 9h e blocos de teste até o fim da tarde. O vão do
// almoço (12h–13h30) fica de propósito — mostra a contagem regressiva no Ao Vivo.
const grade = [
  ["01", "09:00", "10:00", "Validação do app — comissão do VIII Concefor",
    "Demonstração ao vivo do app com a comissão: navegação, Ao Vivo, reações no telão, perguntas e dashboard.",
    "Equipe do app"],
  ["02", "10:00", "11:00", "Teste aberto — reações ao vivo",
    "Sessão de teste: abra o Ao Vivo e reaja (👍 ❤️) para ver o telão pulsar.", null],
  ["03", "11:00", "12:00", "Teste aberto — perguntas com upvote",
    "Sessão de teste: envie perguntas e vote nas dos outros dispositivos.", null],
  ["04", "13:30", "14:30", "Teste da tarde — agenda e favoritos",
    "Sessão de teste: navegue pela agenda dos 4 dias e monte a sua programação.", null],
  ["05", "14:30", "15:30", "Teste da tarde — mosaico de conexões",
    "Sessão de teste: acenda quadradinhos no mosaico conectando com outro participante.", null],
  ["06", "15:30", "16:30", "Teste da tarde — telão e dashboard",
    "Sessão de teste: reações no telão com o /admin aberto ao lado, números ao vivo.", null],
  ["07", "16:30", "17:30", "Teste da tarde — encerramento",
    "Última janela de teste do dia.", null],
];

const upsert = db.prepare(
  `insert into sessions (id, titulo, descricao, sala, eixo, palestrante, inicio, fim)
   values (@id, @titulo, @descricao, @sala, 'Teste', @palestrante, @inicio, @fim)
   on conflict(id) do update set
     titulo = excluded.titulo, descricao = excluded.descricao, sala = excluded.sala,
     palestrante = excluded.palestrante, inicio = excluded.inicio, fim = excluded.fim`,
);

for (const [n, ini, fim, titulo, descricao, palestrante] of grade) {
  upsert.run({
    id: `demo-validacao-${n}`,
    titulo,
    descricao,
    sala: "Auditório do Cefor",
    palestrante,
    inicio: em(ini),
    fim: em(fim),
  });
}

db.close();
console.log(`${grade.length} sessões de validação gravadas para ${dia} (09:00–17:30).`);
console.log("Ajustes de horário ao vivo: /admin > Programação. Limpar depois: --limpar.");
