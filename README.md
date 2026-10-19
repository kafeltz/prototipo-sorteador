# 🎲 Sorteador do Auditório

Sorteador web com clima de programa de auditório brasileiro: roda no estilo
Roda a Roda, contagem regressiva, rufar de tambor, confete e um **sorteio justo
e transparente**.

É um projeto da comunidade e também um **experimento educacional**: está sendo
construído com ajuda de IA (Claude Code), e cada passo fica registrado no
[DIARIO.md](DIARIO.md) para quem quiser aprender como esse tipo de trabalho
acontece na prática. As regras por baixo dos panos (como o sorteio decide, por
que não tem viés, como os temas funcionam) estão em diagramas no
[COMO-FUNCIONA.md](COMO-FUNCIONA.md).

## Como usar

No ar em **https://sorteador.kafeltz.com.br**. Para conferir um sorteio:
https://sorteador.kafeltz.com.br/conferir

## Como rodar no seu computador

Não precisa instalar nada. Baixe o repositório e abra o `index.html` no
navegador. Para conferir um sorteio verificável, abra o `conferir.html` (ou,
no terminal, `node conferir.mjs lacre.txt`).

Para rodar os testes: `npm install` uma vez e depois `npm test` (Node 22 e
Python 3).

### O servidor (opcional)

O servidor só dá a cada sorteio verificável um endereço público, com QR code,
para quem assiste abrir no celular. Sortear e conferir funcionam sem ele. O
porquê de cada escolha está em [`docs/decisoes/`](docs/decisoes/).

Para rodar no seu computador:

1. `npm install`
2. Crie um arquivo `.dev.vars` (ele não vai para o repositório) com a senha do
   organizador: `SENHA_ORGANIZADOR=...`. Para o computador local, qualquer
   senha serve. **No servidor publicado, use uma senha longa e aleatória**
   (por exemplo, a saída de `openssl rand -base64 24`), guardada com
   `npx wrangler secret put SENHA_ORGANIZADOR`. O limite de tentativas ajuda,
   mas quem tem muitos endereços de internet consegue contorná-lo; senha
   aleatória, não.
3. `npm run dev` e abra o endereço que aparecer (normalmente
   `http://localhost:8787`). O banco é um arquivo SQLite dentro de `.wrangler/`.

## O que já funciona

- Colar uma lista de nomes ou importar CSV, com aviso de nomes repetidos
- Número de vencedores, com ou sem repetição, duração do giro, som liga/desliga
- Contagem 3-2-1, roda girando com "tique", fanfarra e confete
- Histórico com comprovante de cada sorteio, guardado no navegador (não some ao recarregar), com botões para copiar e limpar
- Imagem de cada sorteio para compartilhar nas redes (PNG 1080×1350, nas cores do tema escolhido)
- Modo apresentação em tela cheia, para lives e encontros
- Temas visuais: Clássico, Estúdio (inspirado na Roda a Roda) e Manhã (inspirado no Bom Dia & Cia); a escolha fica guardada no navegador
- **Sorteio verificável**: a lista é lacrada e enviada às testemunhas (pelo Google Agenda, por exemplo) antes do sorteio, o acaso vem do farol público drand, e qualquer pessoa refaz a conta no conferidor
- **Página pública de cada sorteio, com QR code** (opcional, com o servidor): quem assiste abre no celular, vê o lacre, a contagem e o resultado conferido no próprio aparelho

### Publicar na Cloudflare

Cada push na `main` roda os testes e, se tudo passar, publica sozinho
(`.github/workflows/publicar.yml`): primeiro aplica as mudanças do banco,
confere que não sobrou nenhuma pendente, publica o servidor e roda um teste de
fumaça no endereço publicado (`node testes/fumaca.mjs <endereço>`).

Para isso funcionar, uma pessoa precisa criar uma chave de acesso **uma vez**:

1. No painel da Cloudflare: *My Profile → API Tokens → Create Token*, modelo
   **"Edit Cloudflare Workers"**, e acrescente a permissão **Account → D1 →
   Edit**. Restrinja à sua conta.
2. No terminal, dentro do repositório:
   `gh secret set CLOUDFLARE_API_TOKEN` (cole a chave quando pedir) e
   `gh secret set CLOUDFLARE_ACCOUNT_ID` (o ID da conta aparece em
   `npx wrangler whoami`).
3. Para conferir: na aba *Actions* do GitHub, o próximo "Publicar" deve
   terminar com "Tudo certo." no último passo.

Sem a chave, o fluxo avisa e não faz nada. Para publicar à mão:
`npx wrangler d1 migrations apply DB --remote` e depois `npx wrangler deploy`,
nessa ordem.

## Como garantimos que o sorteio é justo

1. O vencedor é decidido **antes** da roda girar; a animação só mostra o resultado.
2. Usamos `crypto.getRandomValues`, o gerador criptográfico do navegador, e não `Math.random`.
3. Corrigimos o "viés do módulo", que daria uma chance minúscula a mais para alguns nomes.
4. **No sorteio verificável, nem é preciso confiar em nós.** O número vem de um
   farol público, num horário anunciado antes, e a lista já estava lacrada com as
   testemunhas. O conferidor refaz a conta no navegador de quem desconfia.

Os detalhes estão no código (`regra-do-sorteio.js`), nos diagramas do
[COMO-FUNCIONA.md](COMO-FUNCIONA.md) e nos Atos 2 e 13 a 16 do diário.

## Quer participar?

Abra uma issue com ideias (outros modos visuais: roleta do Bom Dia & Cia,
globo de bingo…), bugs ou sugestões. Pull requests são bem-vindos.

## Licença

[MIT](LICENSE)
