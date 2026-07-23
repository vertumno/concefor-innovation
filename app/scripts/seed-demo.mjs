// Semeia uma DEMONSTRAÇÃO ancorada no relógio REAL (agora): a programação oficial
// do VIII Concefor posicionada em torno do instante atual — uma sessão acabou de
// terminar, UMA está no ar agora, e as próximas vêm em seguida. Assim, com o app
// em modo real (npm run dev), vários celulares na rede + o telão concordam no
// tempo (nada de relógio simulado dessincronizando entre dispositivos).
//
// Limpa as reações anteriores (a demo começa do zero). Repetível: rode de novo
// para "reancorar" no novo agora. Uso: npm run seed:demo. Depois: npm run dev.
// Para voltar à programação oficial de agosto: npm run seed.

import Database from "better-sqlite3";
import { readFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const file = process.env.DATABASE_PATH || "./data/concefor.db";
mkdirSync(dirname(file), { recursive: true });

const db = new Database(file);
db.pragma("foreign_keys = ON");
db.exec(readFileSync(join(process.cwd(), "db", "schema.sql"), "utf8"));

const now = Date.now();
const at = (min) => new Date(now + min * 60000).toISOString();

// Zera conteúdo e reações — demo limpa.
db.exec("delete from session_speakers; delete from timeline_events; delete from speakers; delete from sessions;");

const speakers = [
  ["vanessa-battestin", "Vanessa Battestin", "Profa. Dra.", null],
  ["marcia-oliveira", "Márcia Oliveira", "Dra.", null],
  ["jaqueline-sanz", "Jaqueline Sanz", "Dra.", null],
  ["mariella-berger", "Mariella Berger", "Dra.", null],
  ["felipe-tessarolo", "Felipe Maciel Tessarolo", null, "The Open University, UK"],
  ["mariano-pimentel", "Mariano Pimentel", "Prof. Dr.", null],
];
const insSpk = db.prepare("insert into speakers (id, nome, titulo, instituicao) values (?, ?, ?, ?)");
for (const s of speakers) insSpk.run(...s);

// [id, título, descrição, sala, eixo, palestrante (texto), início(min), fim(min)]
const sessions = [
  ["palestra-vanessa", "20 anos de EaD e o Cefor", "Palestra de abertura sobre as duas décadas do Cefor.", "Auditório", "Palestra", "Profa. Dra. Vanessa Battestin", -90, -25],
  ["mesa-tecnologia-delas", "Mesa-redonda: Tecnologia Delas", "Protagonismo feminino em tecnologia e educação.", "Auditório", "Mesa-redonda", "Dra. Márcia Oliveira · Dra. Jaqueline Sanz · Dra. Mariella Berger", -15, 90],
  ["palestra-tessarolo", "Palestra internacional: Tecnologia, Transformação e EaD — 20 anos", "Conferência internacional do evento.", "Auditório", "Palestra", "Felipe Maciel Tessarolo (The Open University, UK)", 90, 180],
  ["palestra-mariano", "Autoria com IA generativa: desafios para a EaD", "Palestra sobre autoria e IA generativa na educação a distância.", "Auditório", "Palestra", "Prof. Dr. Mariano Pimentel", 190, 280],
  ["encerramento", "Coffee-break e Momento Cultural", "Encerramento do evento.", "Auditório", "Cultural", null, 280, 340],
];
const insSes = db.prepare(
  "insert into sessions (id, titulo, descricao, sala, eixo, palestrante, inicio, fim) values (?, ?, ?, ?, ?, ?, ?, ?)",
);
for (const [id, tit, desc, sala, eixo, pal, ini, fim] of sessions) {
  insSes.run(id, tit, desc, sala, eixo, pal, at(ini), at(fim));
}

const links = [
  ["palestra-vanessa", "vanessa-battestin"],
  ["mesa-tecnologia-delas", "marcia-oliveira"],
  ["mesa-tecnologia-delas", "jaqueline-sanz"],
  ["mesa-tecnologia-delas", "mariella-berger"],
  ["palestra-tessarolo", "felipe-tessarolo"],
  ["palestra-mariano", "mariano-pimentel"],
];
const insLink = db.prepare("insert into session_speakers (session_id, speaker_id) values (?, ?)");
for (const l of links) insLink.run(...l);

db.close();

console.log(`Demo ancorada no relógio real em ${file}: ${sessions.length} sessões, reações zeradas.`);
console.log(`AO VIVO agora: "Mesa-redonda: Tecnologia Delas" (fica no ar por ~90 min).`);
console.log(`Rode 'npm run dev' →  app: http://localhost:3000   |   telão: http://localhost:3000/telao`);
