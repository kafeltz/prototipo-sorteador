// Testes da regra do sorteio. Rodar: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import '../regra-do-sorteio.js';

const R = globalThis.RegraDoSorteio;
const vetores = JSON.parse(fs.readFileSync(new URL('./vetores.json', import.meta.url), 'utf8'));

const LACRE = vetores[1].lacre;

test('o limite descarta o pedaço que sobra (viés do módulo)', () => {
  assert.equal(R.limiteSemVies(1), 2 ** 32);
  assert.equal(R.limiteSemVies(3), 4294967295);       // sobra 1
  assert.equal(R.limiteSemVies(17), 4294967295);      // sobra 1
  assert.equal(R.limiteSemVies(1000), 4294967000);    // sobram 296
  assert.equal(R.limiteSemVies(2 ** 31 + 1), 2 ** 31 + 1); // quase metade é descartada
});

test('modo rápido: cada nome sai com a mesma chance', () => {
  // O mesmo teste do Ato 2: 1,7 milhão de sorteios entre 17 nomes. O desvio
  // padrão esperado é ~307; aceitamos até ~5 desvios para o teste não falhar
  // por puro azar.
  const contagem = new Array(17).fill(0);
  for (let i = 0; i < 1_700_000; i++) contagem[R.inteiroAleatorio(17)]++;
  for (const vezes of contagem) assert.ok(vezes > 98_500 && vezes < 101_500, `saiu ${vezes} vezes`);
});

test('cada horário tem a sua rodada, e cada rodada o seu horário', () => {
  assert.equal(R.rodadaDoHorario(new Date(R.FAROL.genese * 1000)), 1);
  for (const rodada of [1, 2, 33205709]) {
    const horario = R.horarioDaRodada(rodada);
    assert.equal(R.rodadaDoHorario(horario), rodada);
    // um segundo depois, a rodada já é a seguinte (ainda não publicada)
    assert.equal(R.rodadaDoHorario(new Date(horario.getTime() + 1000)), rodada + 1);
  }
});

test('o horário é lido com o fuso escrito no lacre, não o do computador', () => {
  const a = R.lerHorario('2026-10-20 20:30:00 -03:00');
  const b = R.lerHorario('2026-10-20 23:30:00 +00:00');
  assert.equal(a.getTime(), b.getTime());
  assert.throws(() => R.lerHorario('20/10/2026 20:30'), R.ErroNoLacre);
});

test('o lacre lido e reescrito volta idêntico', () => {
  assert.equal(R.escreverLacre(R.lerLacre(LACRE)), LACRE);
});

test('vetores de teste: lacre + número do farol → sempre os mesmos vencedores', async () => {
  for (const v of vetores) {
    const r = await R.sortearLacre(R.lerLacre(v.lacre), v.aleatoriedade);
    assert.equal(r.impressao, v.impressao, v.descricao);
    assert.equal(r.semente, v.semente, v.descricao);
    assert.deepEqual(r.resultados.map((x) => x.nome), v.vencedores, v.descricao);
  }
});

test('a segunda implementação, em Python, chega aos mesmos vencedores', () => {
  const saida = execFileSync('python3', ['-I', 'testes/segunda-implementacao.py', 'testes/vetores.json'], { encoding: 'utf8' });
  assert.doesNotMatch(saida, /FALHA/);
});

test('uma letra trocada num nome muda a impressão digital', async () => {
  const original = await R.impressaoDigital(R.lerLacre(LACRE));
  const trocado = await R.impressaoDigital(R.lerLacre(LACRE.replace('Bruno Lima', 'Bruno Lina')));
  assert.notEqual(original, trocado);
});

test('quem ganhou sai da roda: ninguém ganha duas vezes', async () => {
  const dados = { ...R.lerLacre(LACRE), vencedores: 17 };
  const resultados = await R.sortearComSemente('a'.repeat(64), dados);
  assert.equal(new Set(resultados.map((r) => r.nome)).size, 17);
  // e a roda encolhe um nome por vez
  assert.deepEqual(resultados.map((r) => r.totalNaRoda), [17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]);
});

test('o índice aponta para o nome certo na roda daquele momento', async () => {
  const dados = R.lerLacre(LACRE);
  let naRoda = [...dados.participantes];
  for (const r of await R.sortearComSemente('b'.repeat(64), dados)) {
    assert.equal(naRoda[r.indice], r.nome);
    naRoda = naRoda.filter((_, i) => i !== r.indice);
  }
});

test('lacres adulterados ou incompletos são recusados, com explicação', () => {
  const casos = {
    'sem cabeçalho': LACRE.replace('SORTEIO VERIFICÁVEL (versão 1)', 'SORTEIO'),
    'faltando um nome': LACRE.replace(/\n17\. .*$/, ''),
    'rodada que não bate com o horário': LACRE.replace(/rodada (\d+)/, (_, n) => `rodada ${Number(n) + 1}`),
    'mais vencedores que nomes': LACRE.replace('Vencedores: 3', 'Vencedores: 18'),
    'vencedores zero': LACRE.replace('Vencedores: 3', 'Vencedores: 0'),
    'sim/não inválido': LACRE.replace('sai da roda: sim', 'sai da roda: talvez'),
    // Achados da revisão de segurança (Ato 20)
    'nome repetido igualzinho': LACRE.replace('2. Bruno Lima', '2. Ana Souza'),
    'nome repetido com outra grafia': LACRE.replace('2. Bruno Lima', '2. ána  SOUZA'),
    'participante a mais depois da lista': `${LACRE}\n18. Amigo do Organizador`,
    'dois lacres no mesmo texto': `${LACRE}\n\n${LACRE}`,
    'vencedores sem teto (pode repetir)': LACRE.replace('Vencedores: 3', 'Vencedores: 9007199254740991').replace('sai da roda: sim', 'sai da roda: não'),
    'total de participantes gigante': LACRE.replace('Participantes (17):', 'Participantes (99999999999):'),
    'data impossível': LACRE.replace(/Horário: \d{4}-\d{2}-\d{2}/, 'Horário: 2030-02-30'),
  };
  for (const [caso, texto] of Object.entries(casos)) {
    assert.throws(() => R.lerLacre(texto), R.ErroNoLacre, caso);
  }
});

test('escrever o lacre confere os dados', () => {
  const base = { titulo: 'X', horario: '2026-10-20 20:30:00 -03:00', vencedores: 1, semRepeticao: true, participantes: ['Ana'] };
  assert.doesNotThrow(() => R.escreverLacre(base));
  assert.throws(() => R.escreverLacre({ ...base, participantes: [] }), R.ErroNoLacre);
  assert.throws(() => R.escreverLacre({ ...base, participantes: ['Ana', '  '] }), R.ErroNoLacre);
  assert.throws(() => R.escreverLacre({ ...base, participantes: ['x'.repeat(201)] }), R.ErroNoLacre);
  assert.throws(() => R.escreverLacre({ ...base, vencedores: 1.5 }), R.ErroNoLacre);
  // título vazio vira "Sorteio"
  assert.match(R.escreverLacre({ ...base, titulo: '' }), /^Título: Sorteio$/m);
});

test('o lacre vai e volta de um link sem perder acento nem símbolo', () => {
  for (const v of vetores) {
    const codigo = R.lacreParaLink(v.lacre);
    assert.match(codigo, /^[A-Za-z0-9_-]+$/); // nada que precise escapar num endereço
    assert.equal(R.lacreDoLink(codigo), v.lacre);
  }
});

test('texto livre depois do lacre continua permitido', () => {
  assert.doesNotThrow(() => R.lerLacre(`${LACRE}\n\nPara conferir: https://exemplo/conferir.html\nAbraços!`));
});

test('a chave do nome junta grafias da mesma pessoa', () => {
  assert.equal(R.chaveDoNome('Ana Souza'), R.chaveDoNome('  ána\u00a0 SOUZA '));
  assert.notEqual(R.chaveDoNome('Ana Souza'), R.chaveDoNome('Ana Sousa'));
});
