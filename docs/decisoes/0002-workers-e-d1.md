# 0002. Cloudflare Workers com D1 (SQLite)

**Data:** 19/10/2026 · **Situação:** aceita

## Contexto

O servidor da decisão 0001 é pequeno: guarda um texto por sorteio, devolve
esse texto e, depois do horário, o resultado. Desde o Ato 1, o roteiro previa
hospedar o projeto na Cloudflare. A preferência é por algo **ultra pequeno**,
que uma pessoa iniciante consiga ler inteiro.

## Decisão

- **Cloudflare Workers** para o código do servidor: um arquivo JavaScript que
  roda perto de quem acessa, sem máquina para manter. O mesmo Worker publica
  os arquivos estáticos (`index.html`, `conferir.html`…).
- **D1** para o banco: é **SQLite**, gerenciado pela Cloudflare. O SQL é o de
  sempre, e no desenvolvimento local (`wrangler dev`) ele roda sobre um arquivo
  SQLite de verdade, na pasta `.wrangler/`.
- **A mesma regra do navegador.** O servidor importa o `regra-do-sorteio.js` e
  o `farol.js`, sem cópia.

## Consequências

- Uma tabela, um arquivo de servidor, uma migração SQL. Cabe numa tela.
- Fica preso à Cloudflare para publicar. O código, porém, é JavaScript padrão
  (`fetch`, `crypto.subtle`), e o banco é SQLite comum: mudar de casa é
  reescrever umas dezenas de linhas, não o projeto.
- O plano gratuito cobre com folga o uso de um sorteio de comunidade.

## Alternativas consideradas

- **Uma máquina virtual com Node e um arquivo SQLite.** Ainda mais simples de
  explicar, mas alguém precisa manter a máquina: atualizações, backup,
  certificado HTTPS, reinício quando cai.
- **Durable Objects** (um "objeto" com estado para cada sorteio, com alarmes e
  conexão ao vivo). Elegante, mas o servidor não precisa estar acordado na
  hora do sorteio: o resultado é uma consequência do farol, e quem abre a
  página depois calcula. Seria complexidade sem motivo.
