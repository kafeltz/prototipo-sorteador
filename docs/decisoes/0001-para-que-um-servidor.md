# 0001. Para que um servidor

**Data:** 19/10/2026 · **Situação:** aceita · **Responde à** issue #3

## Contexto

O sorteador é um arquivo HTML. O sorteio verificável (Atos 13 a 16) também
funciona sem servidor: o lacre vai pelo Google Agenda e o conferidor roda no
navegador de quem confere. A issue #3 listava três usos possíveis para um
servidor: uma página pública de vencedores, um sorteio verificável pelo
público e um histórico compartilhado entre organizadores.

O segundo uso já foi resolvido sem servidor. Sobra a pergunta: o que ainda
falta que o navegador sozinho não faz?

## Decisão

O servidor existe para **uma coisa**: dar a cada sorteio verificável um
**endereço público**, `/s/<código>`, que qualquer pessoa abre pelo celular, por
exemplo lendo um QR code na tela da live. A página mostra o lacre, conta o
tempo até o farol e, depois, mostra e confere o resultado no navegador de quem
abriu.

Ele **não** é necessário para sortear nem para conferir. Se o servidor cair,
o sorteador e o conferidor continuam funcionando.

## Consequências

- Quem assiste não precisa receber o convite para acompanhar: basta o QR code.
  Mas só o convite recebido **antes** do horário prova que a lista não mudou;
  a página diz isso com todas as letras.
- O servidor não precisa ser confiável. A página pública confere a assinatura
  do farol e refaz a conta no navegador de quem olha, exatamente como o
  conferidor. Se o servidor mentir, a página percebe.
- Surge um custo novo: publicar, guardar dados de pessoas e proteger quem
  pode gravar. As decisões 0002 e 0003 tratam disso.

## O que ficou de fora

- **Histórico compartilhado entre organizadores**: ninguém pediu ainda.
- **E-mails enviados pelo projeto às testemunhas** (a ideia original do QR
  code com e-mail): o convite da agenda já faz esse papel, assinado pelo
  Google, sem o projeto guardar e-mail de ninguém. Fica registrado como
  evolução possível.
