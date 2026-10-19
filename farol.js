/* =====================================================================
   FAROL
   Busca uma rodada do farol drand e confere se ela é autêntica. Precisa do
   regra-do-sorteio.js (para saber o horário de cada rodada) e do
   vendor/noble-bls.js (a matemática da assinatura), carregados antes.

   Não confiamos em quem entrega o número: nem no servidor do drand, nem no
   nosso. Cada rodada vem com uma assinatura que só a League of Entropy
   consegue produzir, e a conferência acontece aqui, em quem está olhando.
   ===================================================================== */
(() => {
  'use strict';

  const { FAROL, horarioDaRodada } = globalThis.RegraDoSorteio;

  // Vários endereços do mesmo farol: se um estiver fora do ar, tenta o
  // próximo. Como a assinatura é conferida, não importa qual respondeu.
  const ENDERECOS = [
    'https://api.drand.sh',
    'https://api2.drand.sh',
    'https://api3.drand.sh',
    'https://drand.cloudflare.com',
  ];

  // Etiqueta do esquema de assinatura do quicknet (padrão RFC 9380)
  const DST = 'BLS_SIG_BLS12381G1_XMD:SHA-256_SSWU_RO_NUL_';

  class ErroDoFarol extends Error {
    // motivo: 'ainda-nao-saiu', 'fora-do-ar' ou 'assinatura-invalida'
    constructor(motivo, mensagem) {
      super(mensagem);
      this.motivo = motivo;
    }
  }

  const deHex = (texto) => {
    if (!/^([0-9a-f]{2})+$/i.test(texto)) throw new ErroDoFarol('assinatura-invalida', 'A rodada veio com dados que não são hexadecimais.');
    return Uint8Array.from(texto.match(/../g), (b) => parseInt(b, 16));
  };
  const hex = (bytes) => Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');

  // Confere uma rodada: a assinatura tem que ser da League of Entropy para
  // ESTE número de rodada, e a aleatoriedade é o SHA-256 da assinatura.
  // Devolve a aleatoriedade conferida; se algo não bater, lança erro.
  async function conferirRodada({ rodada, assinatura, aleatoriedade }) {
    // A mensagem assinada é o SHA-256 do número da rodada em 8 bytes
    const numero = new Uint8Array(8);
    new DataView(numero.buffer).setBigUint64(0, BigInt(rodada));
    const mensagem = new Uint8Array(await crypto.subtle.digest('SHA-256', numero));

    let valida = false;
    try {
      valida = globalThis.NobleBls.conferirAssinaturaCurta(deHex(assinatura), mensagem, deHex(FAROL.chavePublica), DST);
    } catch {
      valida = false; // assinatura malformada também é inválida
    }
    if (!valida) {
      throw new ErroDoFarol('assinatura-invalida', `A assinatura da rodada ${rodada} não confere. Esse número não veio do farol.`);
    }

    const calculada = hex(new Uint8Array(await crypto.subtle.digest('SHA-256', deHex(assinatura))));
    if (aleatoriedade !== undefined && aleatoriedade !== calculada) {
      throw new ErroDoFarol('assinatura-invalida', `O número da rodada ${rodada} não corresponde à assinatura dela.`);
    }
    return calculada;
  }

  // Busca a rodada nos endereços do farol, um de cada vez, e confere.
  // Devolve { rodada, aleatoriedade, assinatura, endereco }.
  async function buscarRodada(rodada, { tempoLimiteMs = 5000 } = {}) {
    const publicadaEm = horarioDaRodada(rodada);
    // Folga de 2 s para o relógio deste computador estar um pouco adiantado
    if (Date.now() < publicadaEm.getTime() - 2000) {
      throw new ErroDoFarol('ainda-nao-saiu', `A rodada ${rodada} só sai em ${publicadaEm.toLocaleString('pt-BR')}.`);
    }

    let naoSaiu = false;
    for (const endereco of ENDERECOS) {
      let resposta;
      try {
        resposta = await fetch(`${endereco}/${FAROL.cadeia}/public/${rodada}`, {
          signal: AbortSignal.timeout(tempoLimiteMs),
        });
      } catch {
        continue; // fora do ar ou lento demais: tenta o próximo
      }
      if (resposta.status === 404 || resposta.status === 425) { naoSaiu = true; continue; }
      if (!resposta.ok) continue;

      const dados = await resposta.json();
      if (dados.round !== rodada) continue; // respondeu outra rodada: não serve
      // Se a assinatura não conferir, o erro sobe: um endereço do farol
      // entregando número falso é grave demais para "tentar o próximo"
      const aleatoriedade = await conferirRodada({ rodada, assinatura: dados.signature, aleatoriedade: dados.randomness });
      return { rodada, aleatoriedade, assinatura: dados.signature, endereco };
    }

    if (naoSaiu) throw new ErroDoFarol('ainda-nao-saiu', `A rodada ${rodada} ainda não foi publicada. Tente de novo em alguns segundos.`);
    throw new ErroDoFarol('fora-do-ar', 'Nenhum endereço do farol respondeu. Confira a internet; o sorteio fica adiado até o farol voltar.');
  }

  globalThis.Farol = { ENDERECOS, ErroDoFarol, conferirRodada, buscarRodada };
})();
