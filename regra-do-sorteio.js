/* =====================================================================
   REGRA DO SORTEIO
   Tudo o que decide quem ganha mora neste arquivo, e só aqui. Ele é usado
   pelo sorteador (index.html), pelo conferidor (conferir.html), pelo
   servidor e pelos testes. Uma regra, um arquivo: se cada lugar tivesse a
   sua cópia, um dia elas iam discordar.

   Funciona igual no navegador e no Node, só com JavaScript padrão. Tudo fica
   pendurado em globalThis.RegraDoSorteio porque um <script> comum não sabe
   "exportar", e o index.html precisa continuar abrindo com dois cliques
   (aberto direto do disco, o navegador bloqueia módulos).

   As regras estão explicadas, com diagramas, no COMO-FUNCIONA.md.
   ===================================================================== */
(() => {
  'use strict';

  /* ---------- 1. Sem viés ---------- */

  // Os geradores entregam números de 32 bits (0 a 4.294.967.295). Para virar
  // "um entre max nomes", só valem os números abaixo do maior múltiplo de max
  // que cabe nesse intervalo. O pedaço que sobra é descartado e sorteamos de
  // novo; senão os primeiros da lista teriam uma chance minúscula a mais.
  function limiteSemVies(max) {
    return Math.floor(0x100000000 / max) * max;
  }

  // Modo rápido: um inteiro de 0 até max-1 com o gerador criptográfico do
  // navegador. Justo, mas só quem sorteia vê o número nascer.
  function inteiroAleatorio(max) {
    const limite = limiteSemVies(max);
    const buffer = new Uint32Array(1);
    do {
      crypto.getRandomValues(buffer);
    } while (buffer[0] >= limite);
    return buffer[0] % max;
  }

  /* ---------- 2. SHA-256, a "impressão digital" de um texto ---------- */

  // Qualquer mudança no texto, nem que seja uma letra, muda o resultado
  // inteiro. E não dá para fazer o caminho de volta.
  async function sha256(texto) {
    const bytes = new TextEncoder().encode(texto);
    return new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
  }

  const hex = (bytes) => Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');

  /* ---------- 3. O farol: cada horário tem a sua rodada ---------- */

  // O drand "quicknet" publica uma rodada a cada 3 segundos desde o instante
  // "genese". A rodada 1 saiu na gênese, a 2 três segundos depois, e assim
  // por diante. A chave pública é o que permite conferir a assinatura de cada
  // rodada (veja farol.js).
  const FAROL = {
    nome: 'drand quicknet',
    cadeia: '52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971',
    chavePublica: '83cf0f2896adee7eb8b5f01fcad3912212c437e0073e911fb90022d3e760183c8c4b450b6a0a6c3ac6a5776a2d1064510d1fec758c921cc22b0e17e63aaf4bcb5ed66304de9cf809bd274ca73bab4af5a6e9c76a4bc09e76eae8991ef5ece45a',
    genese: 1692803367, // em segundos desde 1970 (23/08/2023)
    periodo: 3,         // segundos entre uma rodada e a próxima
  };

  // A primeira rodada publicada a partir do horário
  function rodadaDoHorario(data) {
    const segundos = data.getTime() / 1000;
    return Math.max(1, Math.ceil((segundos - FAROL.genese) / FAROL.periodo) + 1);
  }

  function horarioDaRodada(rodada) {
    return new Date((FAROL.genese + (rodada - 1) * FAROL.periodo) * 1000);
  }

  /* ---------- 4. O lacre ---------- */

  // O lacre é um texto para gente ler e para a máquina conferir. Exemplo:
  //
  //   SORTEIO VERIFICÁVEL (versão 1)
  //   Título: Live de terça
  //   Horário: 2026-10-20 20:30:00 -03:00
  //   Farol: drand quicknet, rodada 22389654
  //   Vencedores: 2
  //   Quem ganhou sai da roda: sim
  //   Participantes (3):
  //   1. Ana Souza
  //   2. Bruno Lima
  //   3. Carla Mendes
  //
  // Linhas antes do cabeçalho e depois do último participante são ignoradas,
  // então dá para colar o lacre no meio de um convite com outros recados.

  const CABECALHO = 'SORTEIO VERIFICÁVEL (versão 1)';
  const MAX_PARTICIPANTES = 10000;
  const MAX_TAMANHO_NOME = 200;

  class ErroNoLacre extends Error {}

  // Agendas e e-mails às vezes trocam espaços por "espaço que não quebra",
  // inserem caracteres invisíveis ou escrevem o acento como dois caracteres.
  // Tudo isso é limpo aqui, para que o lacre copiado de um convite continue
  // com a mesma impressão digital.
  function limparTexto(texto) {
    return String(texto)
      .normalize('NFC')
      .replace(/[​-‍﻿]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // "Ana Souza", "ana souza" e "Ána  Souza" são a mesma pessoa: sem acento,
  // sem maiúscula e com um espaço só. O sorteador usa a mesma chave para
  // avisar dos repetidos, e o lacre recusa repetidos: senão daria para
  // inflar a chance de alguém escrevendo o nome dele duas vezes.
  function chaveDoNome(nome) {
    return limparTexto(nome).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  // Data → "2026-10-20 20:30:00 -03:00", no fuso deste computador
  function formatarHorario(data) {
    const dois = (n) => String(n).padStart(2, '0');
    const deslocamento = -data.getTimezoneOffset();
    const sinal = deslocamento >= 0 ? '+' : '-';
    const abs = Math.abs(deslocamento);
    return `${data.getFullYear()}-${dois(data.getMonth() + 1)}-${dois(data.getDate())} ` +
      `${dois(data.getHours())}:${dois(data.getMinutes())}:${dois(data.getSeconds())} ` +
      `${sinal}${dois(Math.floor(abs / 60))}:${dois(abs % 60)}`;
  }

  const FORMATO_HORARIO = /^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2}) ([+-]\d{2}:\d{2})$/;

  // "2026-10-20 20:30:00 -03:00" → Data
  function lerHorario(texto) {
    const partes = FORMATO_HORARIO.exec(texto);
    const data = partes && new Date(`${partes[1]}T${partes[2]}${partes[3]}`);
    if (!data || Number.isNaN(data.getTime())) {
      throw new ErroNoLacre(`Horário inválido: "${texto}". O formato é 2026-10-20 20:30:00 -03:00.`);
    }
    // O JavaScript "conserta" datas impossíveis sem avisar (30 de fevereiro
    // vira 2 de março). Escrevendo a data de volta no mesmo fuso, a data
    // impossível não volta igual, e é recusada.
    const [, sinal, horas, minutos] = /([+-])(\d{2}):(\d{2})/.exec(partes[3]);
    const deslocamentoMin = (sinal === '-' ? -1 : 1) * (Number(horas) * 60 + Number(minutos));
    const noFuso = new Date(data.getTime() + deslocamentoMin * 60000).toISOString().slice(0, 19).replace('T', ' ');
    if (noFuso !== `${partes[1]} ${partes[2]}` || Math.abs(deslocamentoMin) > 14 * 60) {
      throw new ErroNoLacre(`Horário impossível: "${texto}".`);
    }
    return data;
  }

  // Confere os dados e devolve o lacre no formato oficial.
  // dados = { titulo, horario: "2026-10-20 20:30:00 -03:00", vencedores,
  //           semRepeticao, participantes: ["Ana Souza", ...] }
  function escreverLacre(dados) {
    const titulo = limparTexto(dados.titulo || '') || 'Sorteio';
    const horario = limparTexto(dados.horario);
    const rodada = rodadaDoHorario(lerHorario(horario));
    const participantes = dados.participantes.map(limparTexto);
    const vencedores = dados.vencedores;

    if (participantes.length === 0) throw new ErroNoLacre('A lista de participantes está vazia.');
    if (participantes.length > MAX_PARTICIPANTES) {
      throw new ErroNoLacre(`São ${participantes.length} participantes; o máximo é ${MAX_PARTICIPANTES}.`);
    }
    const vistos = new Map();
    participantes.forEach((nome, i) => {
      if (!nome) throw new ErroNoLacre(`O participante nº ${i + 1} está sem nome.`);
      if (nome.length > MAX_TAMANHO_NOME) throw new ErroNoLacre(`O nome nº ${i + 1} passa de ${MAX_TAMANHO_NOME} letras.`);
      const chave = chaveDoNome(nome);
      if (vistos.has(chave)) {
        throw new ErroNoLacre(`"${nome}" (nº ${i + 1}) repete o nº ${vistos.get(chave) + 1}. Cada pessoa entra uma vez só.`);
      }
      vistos.set(chave, i);
    });
    // Com teto: vencedores demais travariam o navegador de quem confere
    if (!Number.isInteger(vencedores) || vencedores < 1 || vencedores > MAX_PARTICIPANTES) {
      throw new ErroNoLacre(`O número de vencedores precisa ser um inteiro de 1 a ${MAX_PARTICIPANTES}.`);
    }
    if (dados.semRepeticao && vencedores > participantes.length) {
      throw new ErroNoLacre(`Não dá para tirar ${vencedores} vencedores diferentes de ${participantes.length} participantes.`);
    }

    return [
      CABECALHO,
      `Título: ${titulo}`,
      `Horário: ${horario}`,
      `Farol: ${FAROL.nome}, rodada ${rodada}`,
      `Vencedores: ${vencedores}`,
      `Quem ganhou sai da roda: ${dados.semRepeticao ? 'sim' : 'não'}`,
      `Participantes (${participantes.length}):`,
      ...participantes.map((nome, i) => `${i + 1}. ${nome}`),
    ].join('\n');
  }

  // Lê um lacre (colado de um convite, por exemplo) e devolve os dados.
  // Se algo não bater, explica o quê.
  function lerLacre(texto) {
    const linhas = String(texto).split(/\r?\n/).map(limparTexto).filter(Boolean);
    const inicio = linhas.indexOf(CABECALHO);
    if (inicio === -1) throw new ErroNoLacre(`Não encontrei a linha "${CABECALHO}". Copie o lacre inteiro.`);

    const campo = (i, rotulo) => {
      const linha = linhas[inicio + i] || '';
      if (!linha.startsWith(`${rotulo}: `)) throw new ErroNoLacre(`Esperava a linha "${rotulo}: …" e encontrei "${linha}".`);
      return linha.slice(rotulo.length + 2);
    };

    const titulo = campo(1, 'Título');
    const horario = campo(2, 'Horário');
    const farol = /^drand quicknet, rodada (\d+)$/.exec(campo(3, 'Farol'));
    const vencedores = /^\d+$/.test(campo(4, 'Vencedores')) ? Number(campo(4, 'Vencedores')) : NaN;
    const semRepeticao = { sim: true, 'não': false }[campo(5, 'Quem ganhou sai da roda')];
    const total = /^Participantes \((\d+)\):$/.exec(linhas[inicio + 6] || '');

    if (!farol) throw new ErroNoLacre('A linha do farol precisa ser "Farol: drand quicknet, rodada N".');
    if (semRepeticao === undefined) throw new ErroNoLacre('"Quem ganhou sai da roda" precisa ser "sim" ou "não".');
    if (!total) throw new ErroNoLacre('Esperava a linha "Participantes (N):".');

    if (Number(total[1]) > MAX_PARTICIPANTES) {
      throw new ErroNoLacre(`O lacre diz ${total[1]} participantes; o máximo é ${MAX_PARTICIPANTES}.`);
    }
    const participantes = [];
    for (let i = 1; i <= Number(total[1]); i++) {
      const linha = linhas[inicio + 6 + i] || '';
      const prefixo = `${i}. `;
      if (!linha.startsWith(prefixo)) {
        throw new ErroNoLacre(`O lacre diz ${total[1]} participantes, mas a linha do nº ${i} não está lá.`);
      }
      participantes.push(linha.slice(prefixo.length));
    }

    // Depois da lista, pode vir texto livre, mas nada que pareça mais um
    // participante ou outro lacre: quem lesse o convite acharia que "4. Fulano"
    // concorre, e a conta o ignoraria.
    const depois = linhas.slice(inicio + 7 + participantes.length);
    if (depois.some((linha) => /^\d+\.\s/.test(linha))) {
      throw new ErroNoLacre(`Depois do nº ${participantes.length} vem outra linha numerada. O total de participantes está errado?`);
    }
    if (depois.includes(CABECALHO)) throw new ErroNoLacre('O texto tem dois lacres. Cole um de cada vez.');

    const dados = { titulo, horario, vencedores, semRepeticao, participantes };
    escreverLacre(dados); // confere todo o resto (vencedores, nomes, horário)

    const rodada = Number(farol[1]);
    if (rodada !== rodadaDoHorario(lerHorario(horario))) {
      throw new ErroNoLacre(`A rodada ${rodada} não corresponde ao horário ${horario}. O lacre foi alterado?`);
    }
    return { ...dados, rodada };
  }

  // A impressão digital é calculada sobre o lacre reescrito no formato
  // oficial, e não sobre o texto como chegou: espaços e linhas em branco a
  // mais não mudam nada; uma letra trocada num nome muda tudo.
  async function impressaoDigital(dados) {
    return hex(await sha256(escreverLacre(dados)));
  }

  /* ---------- 5. Do número do farol aos vencedores ---------- */

  // A semente junta o acaso do farol com a impressão digital do lacre. Tudo
  // vira texto antes do SHA-256, para qualquer linguagem conseguir repetir a
  // conta (o conferir.py faz isso em Python).
  async function semente(aleatoriedade, impressao) {
    return hex(await sha256(`${aleatoriedade}:${impressao}`));
  }

  // Uma fileira sem fim de números de 32 bits tirados da semente:
  // SHA-256("semente:0") dá os 8 primeiros, SHA-256("semente:1") os 8
  // seguintes… Quem tem a semente tira sempre a mesma fileira.
  function numerosDaSemente(sementeHex) {
    let contador = 0;
    let bloco = new Uint8Array(0);
    let posicao = 0;
    return async function proximo() {
      if (posicao === bloco.length) {
        bloco = await sha256(`${sementeHex}:${contador++}`);
        posicao = 0;
      }
      const numero = ((bloco[posicao] << 24) | (bloco[posicao + 1] << 16) |
        (bloco[posicao + 2] << 8) | bloco[posicao + 3]) >>> 0;
      posicao += 4;
      return numero;
    };
  }

  // Tira os vencedores na ordem, igualzinho à roda: cada um sai de um índice
  // entre 0 e (quantos estão na roda - 1), sem viés. Se quem ganhou sai da
  // roda, a lista encolhe e a ordem dos que ficam se mantém.
  async function sortearComSemente(sementeHex, dados) {
    const proximo = numerosDaSemente(sementeHex);
    let naRoda = [...dados.participantes];
    const resultados = [];
    for (let posicao = 1; posicao <= dados.vencedores; posicao++) {
      const limite = limiteSemVies(naRoda.length);
      let numero;
      do {
        numero = await proximo();
      } while (numero >= limite);
      const indice = numero % naRoda.length;
      resultados.push({ posicao, nome: naRoda[indice], indice, totalNaRoda: naRoda.length });
      if (dados.semRepeticao) naRoda = naRoda.filter((_, i) => i !== indice);
    }
    return resultados;
  }

  // O sorteio verificável inteiro: lacre + número do farol → vencedores.
  async function sortearLacre(dados, aleatoriedade) {
    const impressao = await impressaoDigital(dados);
    const sementeHex = await semente(aleatoriedade, impressao);
    const resultados = await sortearComSemente(sementeHex, dados);
    return { impressao, semente: sementeHex, resultados };
  }

  /* ---------- 6. O lacre dentro de um link ---------- */

  // O lacre vai depois do "#" do endereço (conferir.html#lacre=...), em
  // base64 "de URL" (sem +, / e =). A parte depois do "#" nunca sai do
  // navegador: o servidor não vê o lacre de quem só confere.
  function lacreParaLink(texto) {
    let binario = '';
    for (const byte of new TextEncoder().encode(texto)) binario += String.fromCharCode(byte);
    return btoa(binario).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function lacreDoLink(codigo) {
    const binario = atob(codigo.replace(/-/g, '+').replace(/_/g, '/'));
    return new TextDecoder().decode(Uint8Array.from(binario, (c) => c.charCodeAt(0)));
  }

  globalThis.RegraDoSorteio = {
    FAROL,
    ErroNoLacre,
    limiteSemVies,
    inteiroAleatorio,
    sha256,
    hex,
    chaveDoNome,
    rodadaDoHorario,
    horarioDaRodada,
    formatarHorario,
    lerHorario,
    escreverLacre,
    lerLacre,
    impressaoDigital,
    semente,
    numerosDaSemente,
    sortearComSemente,
    sortearLacre,
    lacreParaLink,
    lacreDoLink,
  };
})();
