// "Teste de fumaça": depois de publicar, confere em segundos se o site no ar
// está de pé e publicando só o que deve. Não faz parte do npm test, porque
// fala com o servidor de verdade.
//
//   node testes/fumaca.mjs https://sorteador.shalanga.workers.dev
const base = (process.argv[2] || '').replace(/\/$/, '');
if (!base) throw new Error('Diga o endereço: node testes/fumaca.mjs https://...');

const falhas = [];
const confere = (ok, descricao) => {
  console.log(`${ok ? 'ok   ' : 'FALHA'} ${descricao}`);
  if (!ok) falhas.push(descricao);
};

const saude = await fetch(`${base}/api/saude`);
confere(saude.ok && (await saude.json()).ok === true, 'o servidor responde /api/saude');

for (const caminho of ['/', '/conferir', '/regra-do-sorteio.js', '/farol.js', '/vendor/noble-bls.js', '/vendor/qrcode.js', '/estilo-paginas.css']) {
  confere((await fetch(base + caminho)).status === 200, `publica ${caminho}`);
}
for (const caminho of ['/package.json', '/servidor/index.js', '/wrangler.jsonc', '/.dev.vars', '/_headers', '/DIARIO.md', '/.git/config']) {
  confere((await fetch(base + caminho)).status === 404, `esconde ${caminho}`);
}

const pagina = await fetch(`${base}/`);
const csp = pagina.headers.get('content-security-policy') || '';
confere(csp.includes("frame-ancestors 'none'"), 'cabeçalho de segurança (CSP) na página');
confere((await fetch(`${base}/api/sorteios/aaaaaaaaaaaa`)).status === 404, 'sorteio inexistente dá 404');
confere((await fetch(`${base}/api/sorteios`, { method: 'POST', body: '{}' })).status === 401, 'publicar sem senha dá 401');

if (falhas.length) {
  console.error(`\n${falhas.length} falha(s).`);
  process.exit(1);
}
console.log('\nTudo certo.');
