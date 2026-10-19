// Testes do servidor. Sobem o servidor de verdade (wrangler dev), com um
// banco SQLite descartável numa pasta temporária, e conversam com ele por
// HTTP, como o navegador faria.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import '../regra-do-sorteio.js';

const R = globalThis.RegraDoSorteio;
const vetores = JSON.parse(fs.readFileSync(new URL('./vetores.json', import.meta.url), 'utf8'));
const SENHA = 'senha-de-teste';
const pasta = fs.mkdtempSync(path.join(os.tmpdir(), 'sorteador-'));
let servidor;
let base;

const WRANGLER = 'node_modules/.bin/wrangler';
const wrangler = (...args) => execFileSync(WRANGLER, [...args, '--persist-to', pasta], { stdio: 'pipe' });

// Uma porta livre, escolhida pelo sistema
const portaLivre = () => new Promise((ok) => {
  const s = net.createServer().listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => ok(port)); });
});

before(async () => {
  wrangler('d1', 'migrations', 'apply', 'DB', '--local');
  // Dois sorteios colocados direto no banco: um cuja rodada já saiu (vetor
  // 2, rodada real) e um que passou do prazo de 90 dias
  const sql = (id, v, apagarEm) => `INSERT INTO sorteios (id, impressao, lacre, rodada, criado_em, apagar_em) VALUES ` +
    `('${id}', '${v.impressao}', '${R.escreverLacre(R.lerLacre(v.lacre)).replace(/'/g, "''")}', ${R.lerLacre(v.lacre).rodada}, '2026-01-01T00:00:00.000Z', '${apagarEm}');`;
  const arquivo = path.join(pasta, 'dados.sql');
  fs.writeFileSync(arquivo, [sql('passado22222', vetores[1], '2999-01-01T00:00:00.000Z'), sql('vencido22222', vetores[0], '2000-01-01T00:00:00.000Z')].join('\n'));
  wrangler('d1', 'execute', 'DB', '--local', '--file', arquivo);

  const porta = await portaLivre();
  base = `http://127.0.0.1:${porta}`;
  // "detached": o wrangler vira chefe de um grupo de processos, e no fim o
  // grupo inteiro é encerrado (ele sobe outros processos por baixo)
  servidor = spawn(WRANGLER, ['dev', '--ip', '127.0.0.1', '--port', String(porta), '--persist-to', pasta,
    '--var', `SENHA_ORGANIZADOR:${SENHA}`, '--test-scheduled', '--show-interactive-dev-session=false'], { stdio: 'ignore', detached: true });
  // Espera o servidor responder (até 60 s)
  for (let i = 0; i < 120; i++) {
    try { if ((await fetch(`${base}/api/saude`)).ok) return; } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('O servidor não subiu.');
});

after(() => {
  if (servidor) process.kill(-servidor.pid, 'SIGTERM');
  fs.rmSync(pasta, { recursive: true, force: true });
});

const lacreFuturo = (titulo, segundos = 300) => R.escreverLacre({
  titulo, horario: R.formatarHorario(new Date(Date.now() + segundos * 1000)), vencedores: 1, semRepeticao: true, participantes: ['Ana', 'Bia', 'Caio'],
});
const publicar = (lacre, senha = SENHA) => fetch(`${base}/api/sorteios`, {
  method: 'POST', headers: { authorization: `Bearer ${senha}` }, body: JSON.stringify({ lacre }),
});

test('publica só os arquivos da lista de permitidos', async () => {
  for (const caminho of ['/', '/farol.js', '/regra-do-sorteio.js', '/vendor/noble-bls.js']) {
    assert.equal((await fetch(base + caminho)).status, 200, caminho);
  }
  for (const caminho of ['/package.json', '/servidor/index.js', '/wrangler.jsonc', '/.dev.vars', '/DIARIO.md', '/vendor/README.md', '/testes/vetores.json']) {
    assert.equal((await fetch(base + caminho)).status, 404, caminho);
  }
});

test('sem a senha certa, ninguém publica', async () => {
  assert.equal((await publicar(lacreFuturo('Sem senha'), '')).status, 401);
  assert.equal((await publicar(lacreFuturo('Senha errada'), 'chute')).status, 401);
});

test('publica um lacre e devolve o endereço; o mesmo lacre de novo é o mesmo sorteio', async () => {
  const lacre = lacreFuturo('Publicar');
  const r1 = await publicar(lacre);
  assert.equal(r1.status, 201);
  const s1 = await r1.json();
  assert.match(s1.id, /^[a-z2-9]{12}$/);
  assert.equal(s1.endereco, `${base}/s/${s1.id}`);

  const r2 = await publicar(lacre);
  assert.equal(r2.status, 200);
  assert.equal((await r2.json()).id, s1.id);

  const consulta = await (await fetch(`${base}/api/sorteios/${s1.id}`)).json();
  assert.equal(consulta.lacre, lacre);
  assert.equal(consulta.impressao, s1.impressao);
  assert.equal(consulta.resultado, null); // a rodada ainda não saiu
});

test('lacre de rodada que já saiu é recusado', async () => {
  const r = await publicar(vetores[0].lacre);
  assert.equal(r.status, 400);
  assert.match((await r.json()).erro, /já passou/);
});

test('lacre quebrado e corpo que não é JSON são recusados, com explicação', async () => {
  const quebrado = await publicar('SORTEIO VERIFICÁVEL (versão 1)\nTítulo: x');
  assert.equal(quebrado.status, 400);
  assert.match((await quebrado.json()).erro, /^Lacre inválido/);
  const lixo = await fetch(`${base}/api/sorteios`, { method: 'POST', headers: { authorization: `Bearer ${SENHA}` }, body: 'lixo' });
  assert.equal(lixo.status, 400);
});

test('código inexistente ou malformado: 404', async () => {
  assert.equal((await fetch(`${base}/api/sorteios/aaaaaaaaaaaa`)).status, 404);
  assert.equal((await fetch(`${base}/api/sorteios/..%2Fpackage.json`)).status, 404);
  assert.equal((await fetch(`${base}/api/sorteios/AAAA'OR'1'='1`)).status, 404);
});

test('depois da rodada, o servidor calcula o resultado com o farol (precisa de internet)', async () => {
  const s = await (await fetch(`${base}/api/sorteios/passado22222`)).json();
  assert.ok(s.resultado, JSON.stringify(s.farol));
  assert.deepEqual(s.resultado.vencedores.map((v) => v.nome), vetores[1].vencedores);
  assert.equal(s.resultado.aleatoriedade, vetores[1].aleatoriedade);
});

test('a limpeza diária apaga só o que passou de 90 dias', async () => {
  assert.equal((await fetch(`${base}/api/sorteios/vencido22222`)).status, 200);
  await fetch(`${base}/__scheduled?cron=17+4+*+*+*`);
  assert.equal((await fetch(`${base}/api/sorteios/vencido22222`)).status, 404);
  assert.equal((await fetch(`${base}/api/sorteios/passado22222`)).status, 200);
});

test('o organizador apaga antes do prazo', async () => {
  const { id } = await (await publicar(lacreFuturo('Apagar'))).json();
  const semSenha = await fetch(`${base}/api/sorteios/${id}`, { method: 'DELETE' });
  assert.equal(semSenha.status, 401);
  const comSenha = await fetch(`${base}/api/sorteios/${id}`, { method: 'DELETE', headers: { authorization: `Bearer ${SENHA}` } });
  assert.equal(comSenha.status, 204);
  assert.equal((await fetch(`${base}/api/sorteios/${id}`)).status, 404);
});

// Por último: depois dele, a senha fica bloqueada por um minuto
test('quem tenta adivinhar a senha é barrado depois de 10 tentativas por minuto', async () => {
  const status = [];
  for (let i = 0; i < 12; i++) status.push((await publicar(lacreFuturo('Força bruta'), `chute-${i}`)).status);
  assert.ok(status.includes(429), status.join(' '));
});
