# Como usar o Sorteador do Auditório

Guia para quem vai **usar** o sorteador, não programar. Ele foi escrito a
partir do primeiro uso de verdade, feito por alguém que fingia ser aluno, e
inclui as dúvidas que apareceram no caminho.

O sorteador está no ar em **https://sorteador.kafeltz.com.br**. Ele tem dois
jeitos de sortear:

| | Sorteio rápido | Sorteio verificável |
|---|---|---|
| Para quê | Sortear agora, entre amigos | Sortear em público, sem ninguém precisar acreditar em você |
| Quem decide o vencedor | O gerador do seu navegador | Um farol público de números aleatórios (drand), num horário marcado |
| Quem consegue conferir | Ninguém, além de você | Qualquer pessoa, com o lacre |
| Precisa de | Nada | Um horário no futuro e, de preferência, um convite de agenda |

---

## 1. O sorteio rápido

1. Cole os nomes na caixa **Participantes**, um por linha ou separados por
   vírgula, ou use **Importar CSV**. Nomes repetidos aparecem num aviso.
2. Em **Regras**, escolha quantos vencedores e se quem ganha sai da roda.
3. Em **Visual**, escolha o tema **antes** de entrar no modo apresentação (no
   modo apresentação, o seletor some).
4. Clique em **SORTEAR!**. Para lives, use **⛶ Modo apresentação**; para sair,
   **Esc**.
5. Os resultados ficam no painel da direita, guardados **neste navegador**. O
   botão **Imagem** baixa um PNG para postar nas redes.

> Cada endereço tem a sua memória no navegador: o histórico de um computador não
> aparece em outro, nem num endereço diferente.

---

## 2. O sorteio verificável

### Antes de começar

- **A senha do organizador**, para publicar o endereço com QR code.
- **Um horário no futuro.** Se for usar convite de agenda, **10 minutos ou
  mais**: o convite precisa chegar às testemunhas **antes** desse horário.
- **Testemunhas:** os e-mails de quem vai receber o convite.

### O passo a passo do organizador

1. **Lacrar.** Em **Sorteio verificável**, marque *"Usar o farol público"*, dê
   um título, escolha o horário e clique em **🔒 Lacrar a lista**. A lista e as
   regras travam: dali em diante, nada que decide o resultado pode mudar.
2. **Publicar** (opcional, mas é o que gera o QR code). No diálogo que abriu,
   **desça até "Endereço público"**, digite a senha e clique em **Publicar**.
3. **Convidar.** Clique em **📅 Criar evento no Google Agenda**. O evento abre
   preenchido, com o lacre na descrição. Convide as testemunhas e salve,
   aceitando enviar o convite.
4. **Esperar.** A roda mostra *"AGUARDANDO O FAROL"* e a contagem. Até o
   horário, ninguém sabe quem vai ganhar, nem você.
5. **Sortear.** Na hora, clique em **SORTEAR!**. O sorteador busca o número no
   farol, confere a assinatura e gira até o vencedor, que já estava decidido.
6. **Encerrar.** Depois do último vencedor, **NOVO SORTEIO** destrava a lista.
   Cada lacre vale para um sorteio só.

### Lacrar não é publicar

Foi a principal dúvida do primeiro uso: dá para sortear e conferir sem
publicar, e aí o servidor nunca fica sabendo do sorteio.

| | Lacrar | Publicar |
|---|---|---|
| O que faz | Trava a lista e gera o lacre | Manda o lacre para o servidor e cria o endereço com QR code |
| Precisa de | Nada | Servidor e senha |
| Serve para | O sorteio ser conferível | A testemunha acompanhar pelo celular |

O link **Conferir** do histórico leva o lacre inteiro dentro do próprio
endereço, depois do `#`. Essa parte nunca vai para servidor nenhum.

### A folga: o convite precisa chegar antes

O sorteador aceita lacrar com 1 minuto de folga, mas a prova é o convite que
**chegou** à caixa de entrada antes do horário. Agendas e e-mails atrasam
alguns minutos com frequência. No primeiro uso, o lacre foi publicado 2 minutos
antes do sorteio, e por pouco o convite não chegaria a tempo. Use 10 minutos
ou mais quando a prova importar.

---

## 3. Para quem assiste (as testemunhas)

1. **Leia o QR code** com o celular. A página mostra o lacre, a contagem e, na
   hora, o resultado **calculado no seu aparelho**, sem confiar no servidor.
2. **Compare a impressão digital.** O convite traz o lacre; a página mostra o
   começo da impressão digital dele (ex.: `7831 916a 0568 5b16`). As duas têm
   que bater.
3. **Confira a hora em que o convite chegou.** No Gmail: abra o e-mail, clique
   nos três pontinhos e escolha **"Mostrar original"**. Tem que ser antes do
   horário do sorteio.

Se a página mostrar um **aviso vermelho**, o servidor informou algo diferente
da conta feita no seu aparelho. Vale a conta do aparelho; avise o organizador.

---

## 4. Para conferir depois, sem confiar em ninguém

1. Copie o lacre do **convite** (pode ser com o texto em volta), de
   `SORTEIO VERIFICÁVEL (versão 1)` até o último nome.
2. Abra https://sorteador.kafeltz.com.br/conferir, cole e clique em
   **Conferir**. Ou, com o código do projeto: `node conferir.mjs lacre.txt`.

Experimente trapacear, para ver por que não funciona:

- **Troque uma letra** de um nome: a impressão digital muda inteira, e não bate
  mais com a do convite.
- **Repita um nome** para dobrar a chance de alguém: o lacre é recusado.
- **Edite o evento** na agenda sem avisar os convidados: o e-mail que já chegou
  continua com o lacre original. O que vale é o e-mail, não o evento.

---

## Perguntas rápidas

- **O farol saiu do ar na hora?** Nada é sorteado: o status explica, e o botão
  funciona quando o farol voltar. O sorteio verificável nunca troca o farol pelo
  gerador do navegador em silêncio.
- **Recarreguei a página no meio.** O lacre continua lá. Se a roda já tinha
  mostrado vencedores, comece de novo pelo **SORTEAR!**: os vencedores são os
  mesmos, porque já estão decididos.
- **Dá para desfazer o lacre?** Antes do horário, sim, mas quem recebeu o
  convite vai ver que o sorteio dele não aconteceu. Depois que a roda mostrou o
  primeiro vencedor, não.
- **Os nomes ficam públicos?** Se o sorteio for publicado, sim: a página dele
  mostra a lista por 90 dias e depois é apagada. Sem a lista, ninguém consegue
  conferir. Avise os participantes, ou use só o primeiro nome.

Como tudo isso funciona por dentro está no [COMO-FUNCIONA.md](COMO-FUNCIONA.md).
