# Sorteador do Auditório

Projeto **didático**: cada passo relevante vira um "Ato" no `DIARIO.md`
(resumido, nunca a conversa crua). Código legível para iniciantes, comentários
em pt-BR, sem framework e sem build. No ar em https://sorteador.kafeltz.com.br.

## Comandos

- `npm ci && npm test`: todos os testes (Node 22 + Python 3). O teste do
  servidor sobe um `wrangler dev` de verdade e um teste busca o farol drand
  (precisa de internet).
- `npm run dev`: servidor local; precisa de `.dev.vars` com `SENHA_ORGANIZADOR=...`.
- Publicar à mão, **nesta ordem**: `npx wrangler d1 migrations apply DB --remote`
  → conferir com `npx wrangler d1 migrations list DB --remote` (nada pendente)
  → `npx wrangler deploy` → `node testes/fumaca.mjs https://sorteador.kafeltz.com.br`.
  O `.github/workflows/publicar.yml` faz o mesmo, mas só com os segredos da
  Cloudflare no GitHub (issue #9).

## Onde está o quê

- `regra-do-sorteio.js`: a **única** cópia da regra (sem viés, lacre,
  impressão digital, semente). Usada por `index.html`, `conferir.html`,
  `sorteio.html`, `conferir.mjs` e `servidor/index.js`. Script comum que pendura
  `globalThis.RegraDoSorteio` (módulos não abrem via `file://`).
- `farol.js`: busca e confere as rodadas do drand quicknet.
- `servidor/index.js` + `servidor/migracoes/`: Worker com D1 (SQLite).
- `vendor/`: bibliotecas copiadas, com receita e hash em `vendor/README.md`.
- `COMO-FUNCIONA.md` (regras com diagramas), `COMO-USAR.md` (guia),
  `docs/decisoes/` (registros de decisão), `APRESENTACAO.md` (roteiro de fala).

## Regras que já custaram caro

- **Mudou a conta do sorteio, mudou a versão do lacre** (`versão 1` no
  cabeçalho), senão lacres antigos deixam de conferir. Os vetores em
  `testes/vetores.json` são conferidos também por `testes/segunda-implementacao.py`.
- **`.assetsignore` é lista de PERMITIDOS** (`/*` e depois `!/arquivo`): todo
  arquivo novo que deva ser publicado precisa entrar nele, ou dá 404 em produção.
- **Dado de fora** (nomes, título, respostas do servidor) entra na página só
  por `textContent`/`.value`, nunca `innerHTML`.
- **A página da testemunha nunca confia no servidor**: calcula a impressão
  digital e o resultado no aparelho.
- **O servidor devolve caminhos (`/s/<código>`), não endereços completos**: com o
  domínio configurado, o `wrangler dev` se apresenta com o nome de produção.
- **Diagrama do `COMO-FUNCIONA.md` muda no mesmo commit da regra.**
- Testes de navegador (puppeteer) não ficam no repositório: são refeitos no
  scratchpad da sessão quando necessários.

## Convenções

- Um item por commit, conferido antes do próximo; um PR por bloco de trabalho,
  com CI verde antes do merge.
- Issues começam por `## TL;DR` em linguagem de gente.
- Texto de fala (`APRESENTACAO.md`) e trechos do diário são do mantenedor:
  rascunhar e pedir revisão antes do commit.
