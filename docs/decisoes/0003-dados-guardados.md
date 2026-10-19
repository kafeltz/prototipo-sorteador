# 0003. Que dados o servidor guarda, e por quanto tempo

**Data:** 19/10/2026 · **Situação:** aceita

## Contexto

O lacre tem os **nomes das pessoas** que participam do sorteio. No navegador,
eles ficam com quem sorteia; no servidor, passam a ser guardados pelo projeto,
e entra em jogo a LGPD (Lei Geral de Proteção de Dados). A issue #3 pedia
respostas antes do código: o que guardar, quem grava, quem lê, por quanto
tempo e como apagar.

## Decisão

| Pergunta | Resposta |
|---|---|
| O que fica guardado | O texto do lacre (título, horário, regras e nomes), a impressão digital, a rodada, as datas e, depois do horário, o resultado. Nada mais: nenhum e-mail, nenhum IP, nenhum cookie. |
| Quem grava | Só o organizador, com uma senha guardada como segredo no servidor (nunca no código nem no repositório). |
| Quem lê | Qualquer pessoa com o endereço do sorteio. **A lista é pública de propósito**: sem ela, ninguém consegue conferir. O sorteador avisa isso antes de publicar. |
| Por quanto tempo | **90 dias depois do horário do sorteio.** Uma tarefa diária apaga o que passou do prazo. |
| Como apagar antes | O organizador apaga pelo próprio endereço da API, com a senha. Pedido de um participante chega ao organizador. |

## Consequências

- O organizador precisa avisar os participantes de que os nomes vão aparecer
  numa página pública por 90 dias. Num sorteio de live, em que os nomes
  aparecem na tela de qualquer jeito, isso é natural; em outros casos, vale
  usar só o primeiro nome ou um apelido.
- Os códigos dos sorteios são aleatórios e longos o bastante para ninguém
  "adivinhar" os outros. Não existe lista pública de sorteios.
- Depois de 90 dias, o endereço deixa de funcionar, mas o sorteio continua
  conferível por quem guardou o lacre: o conferidor não depende do servidor.

## O que ficou de fora

- Contas de usuário e vários organizadores: com um organizador só, uma senha
  basta.
- Um pedido de remoção feito pelo próprio participante, sem passar pelo
  organizador.
