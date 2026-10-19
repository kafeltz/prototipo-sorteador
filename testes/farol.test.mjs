// Testes do farol. Rodam sem internet: usam rodadas reais gravadas em
// rodadas-reais.json e um fetch "de mentira" para simular o farol.
import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import '../regra-do-sorteio.js';
import '../vendor/noble-bls.js';
import '../farol.js';

const { Farol, RegraDoSorteio: R } = globalThis;
const rodadas = JSON.parse(fs.readFileSync(new URL('./rodadas-reais.json', import.meta.url), 'utf8'));
const real = rodadas[0];

const fetchOriginal = globalThis.fetch;
afterEach(() => { globalThis.fetch = fetchOriginal; });

// Um farol de mentira: cada endereço responde o que a função mandar
function simularFarol(responder) {
  const chamadas = [];
  globalThis.fetch = async (url) => {
    chamadas.push(url);
    const r = responder(url);
    if (r instanceof Error) throw r;
    return new Response(JSON.stringify(r.corpo ?? {}), { status: r.status ?? 200 });
  };
  return chamadas;
}
const corpoReal = { round: real.rodada, randomness: real.aleatoriedade, signature: real.assinatura };

test('rodadas reais: a assinatura confere e a aleatoriedade é o SHA-256 dela', async () => {
  for (const r of rodadas) {
    assert.equal(await Farol.conferirRodada(r), r.aleatoriedade);
  }
});

test('a assinatura de uma rodada não serve para outra', async () => {
  await assert.rejects(
    Farol.conferirRodada({ ...real, rodada: real.rodada + 1, aleatoriedade: undefined }),
    { motivo: 'assinatura-invalida' },
  );
});

test('número trocado, com a assinatura certa, é recusado', async () => {
  await assert.rejects(
    Farol.conferirRodada({ ...real, aleatoriedade: rodadas[1].aleatoriedade }),
    { motivo: 'assinatura-invalida' },
  );
});

test('assinatura malformada é recusada, sem quebrar', async () => {
  for (const assinatura of ['', 'xyz', 'ab'.repeat(48), real.assinatura.slice(0, -2)]) {
    await assert.rejects(Farol.conferirRodada({ rodada: real.rodada, assinatura }), { motivo: 'assinatura-invalida' });
  }
});

test('rodada do futuro: avisa sem nem perguntar ao farol', async () => {
  const chamadas = simularFarol(() => ({ corpo: corpoReal }));
  const futura = R.rodadaDoHorario(new Date(Date.now() + 60_000));
  await assert.rejects(Farol.buscarRodada(futura), { motivo: 'ainda-nao-saiu' });
  assert.equal(chamadas.length, 0);
});

test('um endereço fora do ar: tenta o próximo', async () => {
  const chamadas = simularFarol((url) => (url.startsWith(Farol.ENDERECOS[0]) ? new Error('caiu') : { corpo: corpoReal }));
  const r = await Farol.buscarRodada(real.rodada);
  assert.equal(r.aleatoriedade, real.aleatoriedade);
  assert.equal(r.endereco, Farol.ENDERECOS[1]);
  assert.equal(chamadas.length, 2);
});

test('todos fora do ar: o sorteio fica adiado', async () => {
  simularFarol(() => ({ status: 503 }));
  await assert.rejects(Farol.buscarRodada(real.rodada), { motivo: 'fora-do-ar' });
});

test('o farol diz que a rodada não existe ainda (relógio adiantado)', async () => {
  simularFarol(() => ({ status: 425 }));
  await assert.rejects(Farol.buscarRodada(real.rodada), { motivo: 'ainda-nao-saiu' });
});

test('um endereço entregando número forjado: para tudo, não tenta o próximo', async () => {
  const forjado = { ...corpoReal, randomness: 'ff'.repeat(32), signature: rodadas[1].assinatura };
  const chamadas = simularFarol(() => ({ corpo: forjado }));
  await assert.rejects(Farol.buscarRodada(real.rodada), { motivo: 'assinatura-invalida' });
  assert.equal(chamadas.length, 1);
});

test('resposta de outra rodada é ignorada', async () => {
  simularFarol((url) => (url.startsWith(Farol.ENDERECOS[0]) ? { corpo: { ...corpoReal, round: 1 } } : { corpo: corpoReal }));
  const r = await Farol.buscarRodada(real.rodada);
  assert.equal(r.endereco, Farol.ENDERECOS[1]);
});
