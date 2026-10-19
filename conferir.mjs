#!/usr/bin/env node
// Confere um sorteio verificável pelo terminal, sem navegador.
//
//   node conferir.mjs lacre.txt     (o lacre salvo num arquivo)
//   node conferir.mjs < lacre.txt   (ou colado na entrada)
//
// Usa a mesma regra do sorteador e confere a assinatura do farol aqui, neste
// computador. Não pergunta nada ao servidor do projeto.
import fs from 'node:fs';
import './regra-do-sorteio.js';
import './vendor/noble-bls.js';
import './farol.js';

const { RegraDoSorteio: R, Farol } = globalThis;

const arquivo = process.argv[2];
const texto = fs.readFileSync(arquivo ?? 0, 'utf8');

try {
  const dados = R.lerLacre(texto);
  const impressao = await R.impressaoDigital(dados);
  const horario = R.lerHorario(dados.horario);

  console.log(`Lacre: "${dados.titulo}", ${dados.participantes.length} participantes, ${dados.vencedores} vencedor(es)`);
  console.log(`Impressão digital: ${impressao}`);
  console.log(`Atenção: este lacre só prova algo se chegou até você ANTES de ${horario.toLocaleString('pt-BR')}.`);
  console.log(`Farol: ${R.FAROL.nome}, rodada ${dados.rodada}`);

  const rodada = await Farol.buscarRodada(dados.rodada);
  console.log(`  assinatura conferida ✓ (de ${rodada.endereco})`);
  console.log(`  número: ${rodada.aleatoriedade}`);

  const { semente, resultados } = await R.sortearLacre(dados, rodada.aleatoriedade);
  console.log(`Semente: ${semente}`);
  console.log('Vencedores:');
  for (const r of resultados) {
    console.log(`  ${r.posicao}º ${r.nome}  (nº ${r.indice + 1} de ${r.totalNaRoda} na roda)`);
  }
} catch (erro) {
  if (erro instanceof R.ErroNoLacre) console.error(`Lacre inválido: ${erro.message}`);
  else if (erro instanceof Farol.ErroDoFarol) console.error(`Farol: ${erro.message}`);
  else throw erro;
  process.exitCode = erro.motivo === 'ainda-nao-saiu' ? 2 : 1;
}
