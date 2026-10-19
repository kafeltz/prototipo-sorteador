# Roteiro do Show & Tell: Sorteador do Auditório

**20/10/2026, 20h · uns 10 minutos**

Este é o roteiro da apresentação, não um texto para ler em voz alta. Cada parte
tem um tempo sugerido, os pontos que eu quero passar e o ato do
[diário](DIARIO.md) onde está a história completa.

| # | Parte | Tempo |
|---|---|---|
| 1 | Abertura: demo rápida e o lacre | 2 min |
| 2 | Planejamento | 1 min |
| 3 | Ferramentas e arquitetura | 2,5 min |
| 4 | Desenvolvimento | 1 min |
| 5 | Desafios | 1,5 min |
| 6 | O sorteio que ninguém precisa acreditar | 1,5 min |
| 7 | Aprendizados | 1 min |

**A ideia de palco:** lacrar um sorteio verificável logo na abertura, para uns 7
minutos depois, e sorteá-lo ao vivo na parte 6. O sorteio "roda por baixo" da
apresentação inteira, e a plateia lê o QR code no começo.

---

## 1. Abertura: demo rápida e o lacre (2 min)

Começar mostrando, não explicando. O gancho é ver funcionando.

- Abrir **sorteador.kafeltz.com.br**. Primeiro a demo rápida, porque depois do
  lacre a lista fica travada (até numa segunda aba: as abas compartilham a
  memória do navegador). Trocar o tema no seletor "Visual":
  **Clássico → Estúdio (Roda a Roda) → Manhã (Bom Dia & Cia)**. Parar no
  preferido. (O seletor fica escondido no modo apresentação, por isso a troca
  vem antes.)
- Clicar em **⛶ Modo apresentação** e fazer um sorteio completo: contagem 3-2-1,
  roda girando, nome revelado, confete.
- Sair do modo apresentação com **Esc**.
- Agora o sorteio verificável, que vai correr por baixo da apresentação
  inteira:
  - em "Sorteio verificável", título (ex.: *"Show & Tell: quem ganha?"*) e
    horário **daqui a uns 7 minutos**, em minuto cheio;
  - **Lacrar a lista** → **Publicar** (com a senha) → o QR code aparece;
  - *"Leiam o QR no celular. Esse sorteio está lacrado: daqui a 7 minutos, um
    número que ainda não existe vai decidir quem ganha. Nem eu sei quem é."*
- Frase de passagem: *"Isso tudo abre até de um arquivo HTML no computador.
  Agora quero mostrar como foi feito, que é o que importa neste desafio."*

## 2. Planejamento (1 min)

- Comecei colando o desafio **inteiro** na IA, do jeito que chegou, e decidindo
  manter um diário. → [Ato 1](DIARIO.md#ato-1-o-ponto-de-partida)
- Roteiro em etapas: protótipo em HTML → código aberto no GitHub → layout com a
  comunidade → hospedagem → evoluir.
- **Os alunos saíram, e o projeto continuou comigo**: primeiro um plano grande,
  depois a IA executando sozinha por horas, com regras combinadas antes (um item
  por commit, um PR por marco, quando parar e me chamar). → [Ato 12](DIARIO.md#ato-12-o-projeto-muda-de-mãos)
- **Um modo visual bem feito em vez de vários pela metade**, e o que ficou de
  fora escrito na hora. → [Ato 2](DIARIO.md#ato-2-protótipo-em-html-puro)
- Quando o desafio ganhou data, o plano virou uma **issue** com escopo e passos,
  e a decisão do que entrava ficou comigo. → [Ato 6](DIARIO.md#ato-6-o-desafio-ganha-data-e-a-tarefa-passa-para-outra-sessão)

## 3. Ferramentas e arquitetura (2,5 min)

### As ferramentas, e por quê

| Ferramenta | Para quê |
|---|---|
| **Claude Code** | A IA que escreve, testa e explica o código, no terminal. |
| **GitHub** (e o `gh` no terminal) | Código aberto, issues como plano, PR da comunidade. |
| **Chrome sem janela** | A IA tira capturas de tela para **provar** que ficou certo. |
| **Leonardo.ai** | Gerar a foto do boneco, onde o código chegou no limite. |
| **Cloudflare** (Workers + D1) | O servidor e o banco (SQLite), sem máquina para manter. |
| **drand** | O farol público de números aleatórios que decide o sorteio verificável. |

**Por que o Claude Code:** porque já é a ferramenta que eu uso no dia a dia, e
o desafio era mostrar como eu realmente trabalho, não testar ferramenta nova.

### A arquitetura: abrindo o capô

```mermaid
flowchart LR
    A[Lista de nomes<br>colar ou CSV] --> B[Sorteio<br>crypto.getRandomValues]
    B --> C[Animação<br>roda em canvas]
    C --> D[Revelação<br>e confete]
    D --> E[Histórico<br>localStorage]
    E --> F[Imagem PNG<br>para as redes]
    T[Tema<br>variáveis CSS] -.-> C
    T -.-> D
    T -.-> F
    L[Lacre<br>lista + horário] --> FA[Farol drand<br>número assinado]
    FA --> B
    L -.-> S[Servidor opcional<br>Workers + D1<br>página com QR]
```

- **Sem framework e sem build.** O sorteador ainda abre com dois cliques e
  qualquer iniciante lê o código todo. Foi uma escolha didática, não uma
  limitação. A regra do sorteio mora num arquivo só, usado pelo navegador, pelo
  conferidor e pelo servidor.
- **Decidir primeiro, animar depois.** O vencedor é sorteado **antes** de a roda
  girar; a animação só sabe onde parar. → [Ato 2](DIARIO.md#ato-2-protótipo-em-html-puro)
- **Aleatoriedade de verdade:** `crypto.getRandomValues`, e não `Math.random`,
  sem o viés do módulo, testado com 1,7 milhão de sorteios. Curiosidade: as
  lâmpadas de lava da Cloudflare.
- **Tema = um bloco de variáveis CSS.** A roda, o confete e a imagem leem as
  mesmas variáveis. Por isso, três temas couberam num dia. → [Ato 9](DIARIO.md#ato-9-três-temas-e-o-passo-que-não-muda-nada)
- **Tudo fica no navegador:** histórico e tema no `localStorage`, imagem
  desenhada em canvas.

### As regras por baixo dos panos (os diagramas)

O código foi escrito pela IA, e eu não vou lembrar dele linha por linha. O que
eu preciso saber, e o que quero ensinar, são as **regras** que não podem ser
quebradas. Mostrar dois diagramas do [COMO-FUNCIONA.md](COMO-FUNCIONA.md):

1. **Um sorteio, do clique ao confete** (diagrama de sequência): apontar a nota
   amarela, *"o vencedor está decidido; nada daqui para baixo muda isso"*, e a
   pegadinha do `Math.random` dentro da animação, que é só enfeite.
2. **Sortear sem viés** (fluxograma): o exemplo do gerador de 0 a 9 com 3
   nomes, em que o "9" que sobra dá vantagem ao primeiro. Por isso, descartar e
   sortear de novo.

Se sobrar tempo ou alguém perguntar: o terceiro, **trocar o tema**.
- **O servidor veio por último, e pequeno.** Primeiro a pergunta "para quê?",
  escrita em registros de decisão. A surpresa: o sorteio verificável funciona
  sem servidor; ele só dá a cada sorteio um endereço com QR code. E **não
  precisa ser confiável**: a página refaz a conta no celular de quem olha. →
  [Atos 8, 17 e 18](DIARIO.md#ato-17-decisões-escritas-antes-do-servidor)

## 4. Desenvolvimento (1 min)

- **Não aceitar "está funcionando" como resposta: pedir prova.** Capturas de
  tela, medições, 1,7 milhão de sorteios. → [Ato 2](DIARIO.md#ato-2-protótipo-em-html-puro)
- **Protótipos de visual sem programação**, um arquivo por ideia, para comparar
  antes de mexer no sorteador. → [Ato 4](DIARIO.md#ato-4-definindo-o-visual-com-a-comunidade)
- **A issue como especificação e passagem de bastão** entre sessões da IA. →
  [Ato 6](DIARIO.md#ato-6-o-desafio-ganha-data-e-a-tarefa-passa-para-outra-sessão)
- **Um item por vez, como um humano**: reproduzir, corrigir, conferir, um commit
  pequeno, mostrar. Um robô faria tudo de uma vez, e ninguém conseguiria revisar.
  → [Ato 7](DIARIO.md#ato-7-aplicando-a-issue-como-um-aluno-um-item-por-vez)
- **O commit que não muda nada**, provado pixel a pixel, antes dos temas. →
  [Ato 9](DIARIO.md#ato-9-três-temas-e-o-passo-que-não-muda-nada)
- **A comunidade junto:** imagens de layout enviadas por participantes e o
  primeiro pull request. → [Atos 4 e 7](DIARIO.md#ato-4-definindo-o-visual-com-a-comunidade)

## 5. Desafios (1,5 min)

Mostrar os erros, que é o que a organização quer ver. Escolher dois ou três:

- **Imagem gerada por IA não é interface.** A montagem do quarto gamer tinha
  "Prêmio do me" e nomes embaralhados na roda. → [Ato 4](DIARIO.md#ato-4-definindo-o-visual-com-a-comunidade)
- **O boneco com cara de desenho animado.** Duas tentativas em código, e a
  solução foi trocar de ferramenta. → [Ato 5](DIARIO.md#ato-5-uma-proposta-minha-a-sala-do-jogo)
- **Luz piscando e epilepsia:** no máximo 3 piscadas por segundo. → [Ato 5](DIARIO.md#ato-5-uma-proposta-minha-a-sala-do-jogo)
- **O botão que sumia da tela**, inclusive em 1920×1080, e só a medição
  mostrou. → [Ato 7](DIARIO.md#ato-7-aplicando-a-issue-como-um-aluno-um-item-por-vez)
- **Quando o defeito era do teste, não do código**: três vezes. →
  [Atos 7, 9 e 10](DIARIO.md#ato-10-a-imagem-para-compartilhar-e-os-casos-extremos)
- **Os casos extremos:** o nome enorme espremido, vinte vencedores ilegíveis. →
  [Ato 10](DIARIO.md#ato-10-a-imagem-para-compartilhar-e-os-casos-extremos)
- **A minha ideia tinha um furo.** Testemunhas recebendo a semente *depois* do
  sorteio não provam nada: o organizador pode ter testado várias. O conserto foi
  o lacre *antes* e um acaso que ninguém controla. → [Ato 13](DIARIO.md#ato-13-o-vilão-antes-do-código)
- **Pedi a outra IA para atacar o código** e ela achou dois furos sérios, que eu
  não tinha visto: a página da testemunha confiava no servidor justamente onde
  não podia, e nomes repetidos passavam. → [Ato 20](DIARIO.md#ato-20-pensando-como-atacante)

## 6. O sorteio que ninguém precisa acreditar (1,5 min)

O horário do lacre chegou (se ainda faltar um pouco, a contagem na tela segura
o suspense).

- *"Lembram do QR? Até agora, ninguém sabia quem ia ganhar. Às 20h09, um grupo
  de organizações publicou um número aleatório, assinado, que não dá para
  prever nem trocar."* (Trocar "20h09" pelo horário real do lacre.)
- **SORTEAR!** no modo apresentação. A roda busca o número no farol, confere a
  assinatura e gira até o vencedor, que já estava decidido.
- *"Quem leu o QR: olhem o celular."* A página de cada um refez a conta sozinha
  e chegou ao mesmo nome, sem perguntar nada ao meu servidor.
- A frase: *"Antes, vocês tinham que acreditar em mim. Agora, qualquer pessoa
  confere. O lacre que vale é o convite que chegou antes; o número, ninguém
  escolhe."* → [Atos 13 a 16](DIARIO.md#ato-13-o-vilão-antes-do-código)

## 7. Aprendizados (1 min)

O que eu descobri (das lições do diário):

- Coloque o problema inteiro na mesa: a IA trabalha melhor com o contexto
  original do que com o seu resumo.
- Peça prova, não promessa.
- Quando o código chega no limite, troque de ferramenta.
- A conversa com a IA acaba; a issue fica.
- Devagar e um de cada vez: cada passo pequeno pode ser revisado por uma pessoa.
- Os defeitos moram nos extremos.
- Segurança começa perguntando quem é o vilão, antes do código.
- Peça a alguém que não escreveu o código para atacá-lo.

**O que eu faria diferente:**

- **Desenharia um fluxograma antes de sair programando.** Os diagramas do
  `COMO-FUNCIONA.md` vieram no fim, para explicar o que já existia; feitos
  antes, teriam guiado a IA desde o começo.
- Combinaria o ritmo "um item por vez" desde o primeiro dia, e não só no
  Ato 7.
- Guardaria as cores em variáveis desde o protótipo, sem precisar do passo de
  arrumação depois.
- Testaria em resolução de projetor desde o começo: o botão sumido só foi
  visto quando alguém mediu.
- Geraria a imagem do boneco antes de tentar desenhá-lo em código.

Mensagem final: *"A IA escreveu o código; o entendimento tem que ser meu. Por
isso o diário e os diagramas: eles guardam o que uma pessoa precisa saber
quando a IA não estiver olhando."*

Fechamento: *"Está tudo aberto no GitHub, com o diário, e no ar em
sorteador.kafeltz.com.br. O que ficou para depois virou issue, escrita para
qualquer pessoa pegar: por exemplo, as testemunhas por e-mail (#12)."*

---

## Números para citar

- 4 dias de trabalho (9, 10, 12 e 19/10); o sorteio verificável e o servidor
  saíram num dia só
- ~2.700 linhas no total, sem framework e sem build; 2 bibliotecas copiadas para
  dentro do projeto (assinaturas e QR code), com o hash para conferir
- 3 temas, 23 atos no diário, 40 testes automáticos
- 1,7 milhão de sorteios no teste de aleatoriedade
- 2 implementações da regra (JavaScript e Python) que chegam aos mesmos vencedores
- 1 revisão de segurança independente: 8 achados, 2 sérios, todos corrigidos

## Checklist da demonstração

- [ ] Abrir **sorteador.kafeltz.com.br** (uma aba só: demo rápida primeiro,
      lacre depois)
- [ ] Decidir a lista do sorteio verificável: os nomes de exemplo, ou os de
      quem está na chamada (se todos toparem: a lista fica pública por 90 dias)
- [ ] Ter a senha do organizador à mão (`~/.config/sorteador/senha-organizador`)
- [ ] Internet estável: sem o farol, o sorteio verificável espera (e explica)
- [ ] Um celular para ler o QR, e mostrar a página da testemunha na câmera
- [ ] Ensaiar o tempo: o horário do lacre precisa cair na parte 6, nem antes,
      nem muito depois
- [ ] Testar o som na saída de áudio da chamada
- [ ] Modo apresentação na resolução do compartilhamento de tela (ensaiado em
      1280×720 e 1920×1080, nos três temas: tudo cabe na tela)
- [ ] Escolher o tema **antes** de entrar no modo apresentação
- [ ] Deixar o diário aberto numa aba, para mostrar um ato se perguntarem
