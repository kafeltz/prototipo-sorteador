/* =====================================================================
   SERVIDOR DO SORTEADOR
   Dá a cada sorteio verificável um endereço público (/s/<código>). Não é
   preciso confiar nele: a página do sorteio refaz a conta no navegador de
   quem olha. O porquê de cada escolha está em docs/decisoes/.

   Rotas:
     GET    /api/saude             o servidor está de pé?
     POST   /api/sorteios          publica um lacre        (organizador)
     GET    /api/sorteios/<código> o lacre e, depois do horário, o resultado
     DELETE /api/sorteios/<código> apaga antes do prazo    (organizador)
     GET    /s/<código>            a página pública do sorteio
   O resto são os arquivos estáticos da lista do .assetsignore.
   ===================================================================== */

// A mesma regra e o mesmo farol do navegador, sem cópia
import '../regra-do-sorteio.js';
import '../vendor/noble-bls.js';
import '../farol.js';

const { RegraDoSorteio: R, Farol } = globalThis;

const DIAS_GUARDADO = 90;
const FOLGA_MINIMA_MS = 30 * 1000;    // lacre de rodada que já saiu (ou quase) é recusado
const TAMANHO_MAXIMO = 1024 * 1024;   // 1 MB de lacre basta para milhares de nomes
const ALFABETO = 'abcdefghijkmnpqrstuvwxyz23456789'; // sem l, o, 0 e 1, que se confundem
const TAMANHO_CODIGO = 12;            // 32^12: ninguém adivinha o código de outro sorteio
const CODIGO = /^[a-z2-9]{12}$/;
const INTERVALO_TENTATIVAS_MS = 30 * 1000; // entre duas tentativas de calcular o resultado

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    try {
      return await rotear(request, env, url, ctx);
    } catch (erro) {
      if (erro instanceof ErroHttp) return json({ erro: erro.message }, erro.status);
      console.error(erro);
      return json({ erro: 'Erro inesperado no servidor.' }, 500);
    }
  },

  // A limpeza diária (wrangler.jsonc, "triggers")
  async scheduled(_evento, env) {
    const { meta } = await env.DB.prepare('DELETE FROM sorteios WHERE apagar_em < ?')
      .bind(new Date().toISOString()).run();
    console.log(`Limpeza: ${meta.changes} sorteio(s) apagado(s) por prazo.`);
  },
};

async function rotear(request, env, url, ctx) {
  const { pathname } = url;
  const metodo = request.method;

  if (pathname === '/api/saude' && metodo === 'GET') return json({ ok: true });
  if (pathname === '/api/sorteios' && metodo === 'POST') return publicar(request, env);

  const api = /^\/api\/sorteios\/([^/]+)$/.exec(pathname);
  if (api && CODIGO.test(api[1])) {
    if (metodo === 'GET') return consultar(env, api[1], ctx);
    if (metodo === 'DELETE') return apagar(request, env, api[1]);
  }

  // A página do sorteio é sempre a mesma; ela lê o código do endereço
  const pagina = /^\/s\/([^/]+)$/.exec(pathname);
  if (pagina && CODIGO.test(pagina[1]) && metodo === 'GET') {
    return env.ASSETS.fetch(new Request(new URL('/sorteio', url), request));
  }

  throw new ErroHttp(404, 'Endereço não encontrado.');
}

/* ---------- As rotas ---------- */

async function publicar(request, env) {
  await exigirOrganizador(request, env);

  const corpo = await lerJson(request);
  if (typeof corpo.lacre !== 'string') throw new ErroHttp(400, 'Mande o lacre em { "lacre": "..." }.');

  let dados;
  try {
    dados = R.lerLacre(corpo.lacre);
  } catch (erro) {
    if (erro instanceof R.ErroNoLacre) throw new ErroHttp(400, `Lacre inválido: ${erro.message}`);
    throw erro;
  }

  // Com a rodada já publicada, quem publica poderia conhecer o resultado
  // antes. O servidor recusa, assim como o sorteador recusa lacrar.
  const sai = R.horarioDaRodada(dados.rodada);
  if (sai.getTime() - Date.now() < FOLGA_MINIMA_MS) {
    throw new ErroHttp(400, 'O horário deste lacre já passou, ou falta menos de 30 segundos: o número do farol poderia já ser conhecido.');
  }

  const lacre = R.escreverLacre(dados);
  const impressao = await R.impressaoDigital(dados);

  // O mesmo lacre publicado duas vezes é o mesmo sorteio
  const existente = await env.DB.prepare('SELECT id FROM sorteios WHERE impressao = ?').bind(impressao).first();
  if (existente) return json(resumo(existente.id, impressao, dados), 200);

  const id = novoCodigo();
  const apagarEm = new Date(sai.getTime() + DIAS_GUARDADO * 24 * 60 * 60 * 1000);
  await env.DB.prepare(
    'INSERT INTO sorteios (id, impressao, lacre, rodada, criado_em, apagar_em) VALUES (?, ?, ?, ?, ?, ?)',
  ).bind(id, impressao, lacre, dados.rodada, new Date().toISOString(), apagarEm.toISOString()).run();

  return json(resumo(id, impressao, dados), 201);
}

async function consultar(env, id, ctx) {
  const linha = await env.DB.prepare('SELECT * FROM sorteios WHERE id = ?').bind(id).first();
  if (!linha) throw new ErroHttp(404, 'Sorteio não encontrado. Ele pode ter passado do prazo de 90 dias.');

  const dados = R.lerLacre(linha.lacre);
  const resposta = {
    id,
    lacre: linha.lacre,
    impressao: linha.impressao,
    rodada: linha.rodada,
    horario: dados.horario,
    rodadaSaiEm: R.horarioDaRodada(linha.rodada).toISOString(),
    criadoEm: linha.criado_em,
    apagarEm: linha.apagar_em,
    resultado: linha.resultado ? JSON.parse(linha.resultado) : null,
  };

  // A rodada saiu e o resultado ainda não foi guardado: calcula DEPOIS de
  // responder (waitUntil). Assim o lacre chega sempre, na hora, mesmo que o
  // farol esteja fora do ar ou a conta demore. O resultado do servidor é só
  // uma conveniência: a página do sorteio refaz a conta por conta própria.
  if (!resposta.resultado && Date.now() >= R.horarioDaRodada(linha.rodada).getTime()) {
    ctx.waitUntil(calcularResultado(env, id, dados));
  }
  return json(resposta);
}

async function calcularResultado(env, id, dados) {
  // A trava: só segue quem conseguir marcar a tentativa no banco. Com mil
  // pessoas abrindo a página no mesmo segundo, uma calcula e as outras não.
  const agora = new Date();
  const { meta } = await env.DB.prepare(
    'UPDATE sorteios SET tentativa_em = ? WHERE id = ? AND resultado IS NULL AND (tentativa_em IS NULL OR tentativa_em < ?)',
  ).bind(agora.toISOString(), id, new Date(agora.getTime() - INTERVALO_TENTATIVAS_MS).toISOString()).run();
  if (meta.changes === 0) return;

  try {
    const rodada = await Farol.buscarRodada(dados.rodada);
    const conta = await R.sortearLacre(dados, rodada.aleatoriedade);
    const resultado = {
      aleatoriedade: rodada.aleatoriedade,
      assinatura: rodada.assinatura,
      semente: conta.semente,
      vencedores: conta.resultados,
    };
    await env.DB.prepare('UPDATE sorteios SET resultado = ? WHERE id = ? AND resultado IS NULL')
      .bind(JSON.stringify(resultado), id).run();
  } catch (erro) {
    console.error(`Sorteio ${id}: não deu para calcular o resultado agora.`, erro.message);
  }
}

async function apagar(request, env, id) {
  await exigirOrganizador(request, env);
  const { meta } = await env.DB.prepare('DELETE FROM sorteios WHERE id = ?').bind(id).run();
  if (meta.changes === 0) throw new ErroHttp(404, 'Sorteio não encontrado.');
  return new Response(null, { status: 204 });
}

/* ---------- Peças ---------- */

class ErroHttp extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

function json(dados, status = 200) {
  return new Response(JSON.stringify(dados), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
    },
  });
}

function resumo(id, impressao, dados) {
  // Só o caminho: atrás de domínios e do servidor de desenvolvimento, o
  // servidor nem sempre sabe o próprio nome. Quem monta o endereço completo
  // é a página, que sabe onde ela está aberta.
  return { id, caminho: `/s/${id}`, impressao, rodada: dados.rodada };
}

function novoCodigo() {
  let codigo = '';
  for (let i = 0; i < TAMANHO_CODIGO; i++) codigo += ALFABETO[R.inteiroAleatorio(ALFABETO.length)];
  return codigo;
}

async function lerJson(request) {
  // Recusa antes de ler, quando o tamanho vem anunciado; e confere de novo
  // depois, porque o anúncio pode faltar
  if (Number(request.headers.get('content-length') || 0) > TAMANHO_MAXIMO) throw new ErroHttp(413, 'Lacre grande demais.');
  const texto = await request.text();
  if (texto.length > TAMANHO_MAXIMO) throw new ErroHttp(413, 'Lacre grande demais.');
  try {
    const dados = JSON.parse(texto);
    if (dados && typeof dados === 'object') return dados;
  } catch {
    // cai no erro abaixo
  }
  throw new ErroHttp(400, 'O corpo precisa ser um JSON.');
}

// Só o organizador grava ou apaga. A senha fica num segredo do Worker
// (wrangler secret put SENHA_ORGANIZADOR), nunca no código.
async function exigirOrganizador(request, env) {
  if (!env.SENHA_ORGANIZADOR) throw new ErroHttp(503, 'O servidor está sem a senha do organizador configurada.');

  // Contra quem tenta adivinhar a senha: 10 tentativas por minuto por IP
  const ip = request.headers.get('cf-connecting-ip') || 'desconhecido';
  const { success } = await env.LIMITE_SENHA.limit({ key: ip });
  if (!success) throw new ErroHttp(429, 'Tentativas demais. Espere um minuto.');

  // Compara os SHA-256 das duas senhas em tempo constante: assim o tempo da
  // resposta não revela quantas letras do começo estavam certas
  const enviada = (request.headers.get('authorization') || '').replace(/^Bearer /, '');
  const [a, b] = await Promise.all([R.sha256(enviada), R.sha256(env.SENHA_ORGANIZADOR)]);
  if (!crypto.subtle.timingSafeEqual(a, b)) throw new ErroHttp(401, 'Senha do organizador incorreta.');
}
