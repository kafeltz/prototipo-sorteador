// Só o pedaço da @noble/curves que o sorteador usa: conferir uma assinatura
// BLS "curta" (no grupo G1), o esquema do farol drand quicknet.
import { bls12_381 } from '@noble/curves/bls12-381.js';
const curta = bls12_381.shortSignatures;
globalThis.NobleBls = {
  conferirAssinaturaCurta(assinatura, mensagem, chavePublica, dst) {
    return curta.verify(assinatura, curta.hash(mensagem, dst), chavePublica);
  },
};
