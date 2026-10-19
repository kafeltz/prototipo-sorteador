# Diário de bordo: Sorteador do Auditório

Registro dos principais passos na construção de um sorteador web **com ajuda de
IA** (Claude Code), escrito para devs que estão começando e querem ver como esse
trabalho acontece na prática.

Não é a transcrição das conversas com a IA, que são longas e bagunçadas. Cada
ato resume **o que eu pedi, o que foi decidido, por quê e o que aprendi**.

---

## Ato 1: O ponto de partida

**Data:** 09/10/2026

### O desafio

Alguém da comunidade propôs construir junto um sorteador **web, fácil de usar e
com clima de programa de auditório brasileiro**:

- vários modos visuais (roda da Roda a Roda, roleta do Bom Dia & Cia, globo de bingo…);
- nomes colados, importados de CSV ou digitados, com detecção de duplicados;
- tudo configurável: número de vencedores, com/sem repetição, duração, sons;
- **sorteio confiável e transparente**, ou seja, *como garantir aleatoriedade de verdade?*;
- suspense, contagem regressiva, confete e opção de silenciar;
- histórico, exportação e imagem para compartilhar;
- modo apresentação para lives e encontros.

Veio junto uma curiosidade: a Cloudflare usa uma
[parede de lâmpadas de lava](https://www.cloudflare.com/pt-br/learning/ssl/lava-lamp-encryption/)
como uma das fontes de aleatoriedade da criptografia dela.

### O que eu fiz

Abri uma pasta vazia, iniciei o Claude Code e colei o desafio. Decidi:

1. **Manter este diário**, em versão resumida, porque a conversa crua com a IA
   não serve de material didático.
2. **Roteiro previsto:** protótipo em HTML puro → repositório no meu GitHub
   pessoal → hospedagem na Cloudflare → evoluir dali.

### Lição

> Comece colocando o problema inteiro na mesa, do jeito que ele chegou. A IA
> trabalha melhor com o contexto original do que com o seu resumo dele.

---

## Ato 2: Protótipo em HTML puro

**Data:** 09/10/2026

### O que eu pedi

"A primeira coisa é uma página HTML pura para mostrar como ficaria."

### O que foi decidido

- **Um único arquivo `index.html`**, sem framework, sem `npm install`, sem
  build. Abre com dois cliques e qualquer pessoa consegue ler o código todo.
- **Funcional, não só bonito.** Só uma imagem de sorteador não mostra o que
  importa: o suspense e o sorteio justo. O protótipo sorteia de verdade.
- **Um modo visual só** (a roda), feito bem, em vez de vários feitos pela metade.

### O que entrou

| Pedido do desafio | No protótipo |
|---|---|
| Nomes sem complicação | Colar lista, importar CSV, aviso de duplicados ("Ana Souza" = "ana souza") |
| Tudo configurável | Nº de vencedores, quem ganhou sai da roda, duração do giro, som liga/desliga |
| Suspense e comemoração | Contagem 3-2-1 com rufar de tambor, tique da roda passando nos pinos, fanfarra e confete |
| Sorteio transparente | Explicação na própria página + "comprovante" de cada resultado |
| Resultados | Histórico da sessão e botão para copiar |
| Modo apresentação | Tela cheia, esconde o painel de edição, roda maior |

Os sons são **sintetizados na hora** (Web Audio API), então não há nenhum
arquivo de áudio no projeto.

### O que ficou de fora (por enquanto)

Outros modos visuais, histórico que sobrevive ao recarregar a página, imagem
para Instagram e exportação em arquivo.

### A parte mais importante: aleatoriedade

Três ideias que valem para qualquer sorteio feito por software:

1. **Decida primeiro, anime depois.** O vencedor é escolhido *antes* da roda
   girar. A animação recebe o resultado pronto e só calcula onde parar. Se a
   física da animação decidisse o vencedor, o resultado dependeria da
   velocidade do computador.
2. **`Math.random()` não serve para isso.** Ele é previsível e não foi feito
   para segurança. O navegador oferece `crypto.getRandomValues()`, um gerador
   criptográfico alimentado por fontes de entropia do sistema operacional, a
   mesma ideia das lâmpadas de lava da Cloudflare.
3. **Cuidado com o viés do módulo.** O gerador devolve números de 0 a
   4.294.967.295. Fazer `numero % 17` parece justo, mas como 4.294.967.296 não
   é divisível por 17, alguns nomes ganham uma chance minúscula a mais. A
   correção é descartar os números do "pedaço que sobra" e sortear de novo.

### Como conferi

Não aceitei "está funcionando" como resposta. Pedi para a IA **provar**:

- tirou capturas de tela da página (computador e celular) com o Chrome em modo
  headless e corrigiu o que ficou feio (nomes cortados na roda);
- simulou um sorteio completo e conferiu que a roda parou exatamente no
  vencedor registrado no comprovante;
- rodou a função de sorteio **1,7 milhão de vezes** com 17 nomes: cada nome
  saiu entre 99.309 e 100.559 vezes, para 100.000 esperadas, uma variação
  normal de acaso.

### Lição

> Protótipo bom é o que responde perguntas. Em um dia dá para ver o visual,
> sentir o suspense e entender o problema de aleatoriedade antes de escolher
> qualquer framework.

### Como ver

Baixe o `index.html` e abra no navegador.

---

## Ato 3: Código aberto no GitHub

**Data:** 09/10/2026

### O que eu pedi

"Crie um repositório público no meu GitHub pessoal: mais pessoas verão e
participarão."

### O que foi feito

- Repositório público criado direto do terminal com o GitHub CLI (`gh`), que
  já estava logado na minha conta pessoal.
- Antes de publicar, a IA adicionou o mínimo que um projeto aberto precisa:
  - **README.md:** a porta de entrada, com o que é o projeto, como rodar e
    como participar;
  - **LICENSE (MIT):** sem uma licença, o código fica visível mas ninguém tem
    permissão legal de reaproveitar ou contribuir. A MIT é a mais simples e
    permissiva.

### Lição

> Deixar o repositório público não basta para ele ser aberto à comunidade.
> README e licença são o que permite alguém de fora entender o projeto e
> poder contribuir.

---

## Ato 4: Definindo o visual com a comunidade

**Data:** 10/10/2026

### O ponto de partida

Participantes mandaram imagens com a cara que gostariam para o sorteador:

- uma **montagem pronta** de um tema "quarto gamer neon", com painel de
  participantes, roda saindo de um presente, prêmio do dia e botão;
- um **logo**: um presente neon com um direcional de videogame;
- uma **foto do quarto** sem nada por cima, mas capturada de um vídeo do
  YouTube, com o título e os controles do player na imagem.

As originais ficam guardadas em `inspiracoes/layout-02/`, com um README
explicando o que cada uma virou. Elas não são usadas pelo layout; servem
para mostrar de onde ele partiu.

### O que eu pedi

Aproveitar as imagens para decidir o layout, e fazer isso com **HTMLs
separados, sem programação nenhuma**, um por ideia (`layout-02.html`,
`layout-03.html`…). Assim dá para comparar visuais lado a lado antes de mexer no
sorteador de verdade.

### Por que a montagem não pode ser usada como está

Ela é uma **foto de um layout**, não um layout. Texto, painéis, brilho e roda
estão colados numa imagem só: não dá para trocar um nome, aumentar a tela nem
ler com leitor de tela. E, por ter sido gerada por IA, tem os defeitos típicos:
nomes embaralhados na roda, "Prêmio do me" em vez de "Prêmio do dia".

O trabalho é **extrair** dela o que é imagem de verdade e **refazer em código**
o que é interface.

### O que foi extraído

| Da referência | Virou |
|---|---|
| Foto do quarto | Fundo da página, recortado para tirar os controles do YouTube; o CSS escurece e desfoca |
| Logo do presente | PNG com fundo transparente, recortado pelo contorno branco do adesivo (o "balde de tinta" do editor de imagem, feito por script) |
| Mesa gamer do painel de prêmio | Imagem do prêmio, só para ilustrar |
| Cores do neon | Medidas por script na própria montagem: ciano (~55% do neon), coral (~22%) e um azul-petróleo quase preto de fundo |

O resto foi **refeito em CSS**: o brilho neon é `box-shadow` e `text-shadow`
empilhados, os painéis de vidro são `backdrop-filter: blur()`, e a roda é um
`conic-gradient` com os nomes girados um a um.

### Sem JavaScript, mas com clique

O botão "Iniciar Sorteio" é um link para `#revelacao`. O seletor CSS `:target`
mostra a tela do vencedor quando o endereço termina em `#revelacao`, e o
"Voltar" é um link para `#`. Com isso o protótipo tem duas telas e um clique sem
uma linha de código.

### Como conferi

Capturas de tela no tamanho de computador, de celular e da tela do vencedor.
Elas mostraram dois problemas, que foram corrigidos: nomes compridos sumindo
atrás do miolo da roda, e a roda de trás aparecendo através da tela do
vencedor.

### Pendências

- **Direitos autorais.** O layout pode sofrer problemas com direitos autorais, estamos cientes disso.
- **Escolher.** Este é só o layout 02. A ideia é juntar outras propostas e
  decidir com a comunidade.

### Lição

> Imagem gerada por IA é ótima para conversar sobre o visual e péssima para
> virar interface. Use como referência: extraia o que é imagem (fundo, logo,
> cores) e refaça o resto em HTML e CSS.

---

## Ato 5: Uma proposta minha, a sala do jogo

**Data:** 10/10/2026

### O que eu pedi

Um layout macabro inspirado no filme *Jogos Mortais*, mas **sem nada
nojento**: só um cenário escuro com uma TV mostrando a gravação daquele boneco
famoso.

### O que foi decidido

- O sorteio vira **o jogo**. A TV é o centro da tela, e é ela que revela o
  vencedor: *"Olá, gamerlilia. Você venceu o jogo."*
- O resto conta a história com objetos: os participantes num **dossiê** de
  papel, o prêmio escrito na etiqueta de uma **fita cassete**, um
  **cronômetro** vermelho e o botão **COMEÇAR O JOGO**.
- **A lâmpada falha só de vez em quando.** Luz piscando forte pode causar
  crise em quem tem epilepsia fotossensível. A regra é no máximo 3 piscadas
  por segundo, e nenhuma animação para quem pede menos movimento no sistema.

### A primeira tentativa: o boneco desenhado em código

Como não havia imagem de referência, o boneco foi desenhado à mão em SVG
(desenho vetorial escrito dentro do próprio HTML). Primeiro saiu com cara de
desenho animado: cores chapadas e contorno. A segunda versão ganhou luz,
sombra, brilho de porcelana e efeito de fita VHS, e melhorou muito, mas
continuava sendo ilustração. Esse é o limite de um desenho feito em código.

### A solução: eu mesmo gerei a imagem com IA

Pedi à IA um **prompt** para o Leonardo.ai, um gerador de imagens, e gerei a
foto do boneco. O prompt e o prompt negativo estão em
[`inspiracoes/README.md`](inspiracoes/README.md). Três escolhas fizeram
diferença:

- **Descrever, não nomear.** Nada de nome do filme ou do personagem, só as
  características (porcelana, espirais nas bochechas, queixo articulado).
- **Pensar no encaixe antes de gerar.** Proporção 4:3, igual à tela da TV, e
  fundo preto liso. Assim a foto entra direto, sem recorte difícil.
- **Não pedir o que o código já faz.** Nada de TV, linhas de tela ou texto na
  imagem. O efeito de fita VHS gasta (desfoque, cor lavada, vermelho e ciano
  borrados para os lados) é CSS, por cima da foto.

### Como conferi

Capturas no computador e no celular, na tela principal e na do vencedor.
Ajustes que elas mostraram: a legenda cobrindo a boca do boneco no celular, o
boneco por cima do texto na tela do vencedor, e a bochecha dele quase
encostando no "Olá,".

### Direitos autorais

O layout pode sofrer problemas com direitos autorais, estamos cientes disso.

### Lição

> Quando o código chega no limite, troque de ferramenta: a IA de texto escreve
> o pedido, a IA de imagem gera a foto, e o código cuida do resto. E pense no
> encaixe antes de gerar: proporção, fundo e o que o código já faz.

---

## Ato 6: O desafio ganha data, e a tarefa passa para outra sessão

**Data:** 12/10/2026

### O que aconteceu

A organização da comunidade transformou a ideia num desafio formal, com
apresentação no **Show & Tell de 20/10, às 20h**. O recado é claro: o objetivo
não é só entregar um projeto funcionando, e sim **mostrar o processo**, em cinco
temas: planejamento, ferramentas, desenvolvimento, desafios e aprendizados.

### O que eu pedi

Aproveitar todo o contexto da conversa para criar uma **issue** no GitHub, de
modo que outra sessão de IA (ou outra pessoa) possa continuar o trabalho sem
precisar desta conversa.

### O que foi decidido

- **Uma issue para preparar a apresentação**, e não para "terminar o
  sorteador". Ela compara o que a organização sugeriu com o que já existe
  (✅ pronto, ⚠️ parcial, ❌ faltando) e lista passos numerados: mapear o diário
  nos cinco temas, **me levar a decisão de escopo antes de implementar**,
  escrever o roteiro da apresentação e ensaiar numa resolução de projetor.
- **O começo é para gente ler.** A issue abre com um resumo em português
  corrido (o que falta, o risco e o tamanho do trabalho), sem caminhos de
  arquivo nem jargão. O detalhe técnico vai para o fim.
- **O que eu decido fica comigo.** A issue diz o que é tarefa de quem executa
  e o que é decisão minha: escopo, texto do diário e a apresentação em si.
- **Cuidado com o que é público.** A mensagem da organização tinha nome e ID
  de Discord de outras pessoas; isso não foi para a issue.

### Lição

> A conversa com a IA não é o lugar para guardar trabalho pendente: ela acaba.
> Uma issue bem escrita é a passagem de bastão. O teste é simples: dá para
> entregar a issue a outra pessoa, ou a outra sessão, sem explicar nada de
> boca?

---

## Ato 7: Aplicando a issue como um aluno, um item por vez

**Data:** 12/10/2026

### O que eu pedi

Fiz de conta que era um aluno que pegou a issue do Show & Tell para resolver.
A issue mandava primeiro mapear o diário nos cinco temas da apresentação e me
trazer a decisão de escopo antes de implementar. Aprovei tudo, mas com uma
condição: **uma coisa de cada vez, como um humano faria**. Um robô resolveria
tudo de uma vez, rápido, e ninguém conseguiria acompanhar nem revisar.

### O ritmo

Para cada item: ver o defeito acontecer, entender a causa, corrigir, conferir,
fazer um commit pequeno e me mostrar. Só depois do meu ok, o próximo.

### Item (a): o botão SORTEAR no modo apresentação

O modo apresentação, que um participante já tinha centralizado no
[PR #1](https://github.com/kafeltz/prototipo-sorteador/pull/1), ainda tinha um
defeito: o botão SORTEAR ficava abaixo da borda da tela.

- **Medir antes de corrigir mostrou um problema maior.** A issue falava de
  1280×720, mas o botão sumia também em 1366×768 e até em 1920×1080.
- **A causa:** a conta do tamanho da roda descontava da altura da tela só o
  letreiro, e esquecia o botão e a linha de status embaixo dela.
- **A correção:** letreiro mais baixo na tela cheia e uma conta que desconta
  também o espaço do botão. Medido de novo nas três resoluções.

### Item (b): o histórico que não some

O histórico ficava só na memória da página: recarregou, sumiu. Agora fica
guardado no próprio navegador (`localStorage`), sem servidor nenhum, e ganhou
um botão "Limpar", que pede confirmação.

O primeiro teste disse que nada tinha sido guardado. Em vez de "consertar" o
código às cegas, a IA investigou e descobriu que o defeito estava **no teste**:
o Chrome sem janela, usado para testar, não roda a animação da roda, então o
sorteio nunca terminava. Trocada a animação por um relógio comum só no teste,
ficou provado que o código estava certo. Depois vieram os casos que ninguém
lembra de testar: o botão "Limpar" e um dado estragado no navegador, que não
pode quebrar a página.

### Lição

> Devagar e um de cada vez não é perda de tempo: cada item pequeno pode ser
> visto, testado e revisado por uma pessoa. E antes de corrigir, confira se é o
> código ou o teste que está errado.

---

## Ato 8: O servidor fica para a comunidade

**Data:** 12/10/2026

### O que aconteceu

Com o histórico guardado no navegador, apareceu a pergunta seguinte: não está
na hora de ter um servidor (um "backend") para guardar os dados do projeto?

### O que foi decidido

- **Primeiro o "para quê", depois o "com quê".** O navegador já guarda o
  histórico de quem sorteia. Um servidor só se justifica para o que o
  navegador sozinho não faz: uma página pública de vencedores, um sorteio que
  o público consiga conferir, ou um histórico compartilhado entre
  organizadores. Se nada disso for preciso, o servidor é complexidade sem
  motivo.
- **Não é para antes do Show & Tell.** O prazo é curto, e um servidor muda a
  natureza do projeto: hoje basta abrir um arquivo.
- **Vira tarefa aberta à comunidade**, na
  [issue #3](https://github.com/kafeltz/prototipo-sorteador/issues/3), com a
  tecnologia em aberto: comparar abordagens diferentes é parte do desafio. A
  decisão final continua comigo.
- **Os nomes das pessoas são dados pessoais.** No navegador, eles ficam com
  quem sorteia; num servidor, passam a ser guardados pelo projeto, e entra em
  jogo a LGPD. Quem pegar a tarefa precisa responder quem vê, por quanto tempo
  fica guardado e como apagar, antes de escrever código.

### Lição

> Nem toda ideia boa precisa ser feita agora, nem por você. Escrever a pergunta
> certa numa issue pública transforma uma pendência num convite.

---

## Ato 9: Três temas, e o passo que não muda nada

**Data:** 12/10/2026

### O que eu pedi

A organizadora do desafio sugeriu roletas inspiradas na **Roda a Roda** e no
**Bom Dia & Companhia**. Quis as duas, como opção num seletor, sem perder o
visual que já existia.

### O passo que não muda nada

As cores estavam espalhadas pelo código: parte no CSS, parte escrita direto no
JavaScript que desenha a roda e o confete. Antes de qualquer tema, a IA fez um
commit só para **juntar todas as cores num único bloco de variáveis CSS**, que
o JavaScript passou a ler.

A regra desse commit era não mudar nada na tela, e isso foi **provado**:
capturas antes e depois em cinco situações (computador, celular, modo
apresentação, roda vazia e tela do vencedor), comparadas pixel a pixel.
Idênticas.

Dois cuidados que fizeram a prova valer:

- **Rodar o "antes" duas vezes.** A primeira referência variava sozinha,
  porque o histórico mostra a hora do sorteio. Se o teste não repete o próprio
  resultado, não serve para comparar nada. A hora passou a ser travada no
  teste, assim como o sorteio.
- **"Diferente" nem sempre é defeito.** O confete deu diferente. Investigando,
  a diferença eram as lâmpadas do letreiro, que piscam e foram fotografadas em
  outro momento. Fora delas, idêntico.

### Os temas

Com as cores num lugar só, cada tema virou **um bloco de variáveis**:

- **Estúdio**, inspirado na Roda a Roda: estúdio azul-escuro, roda de cores
  fortes, aro prateado com lâmpadas amarelas e botão magenta.
- **Manhã**, inspirado no Bom Dia & Cia: céu azul, título de desenho animado,
  cores primárias, aro vermelho de circo e botão verde.

O visual original virou o tema **Clássico**, e a cada passo foi conferido que
ele continuava idêntico. A escolha fica guardada no navegador.

As capturas pegaram dois defeitos que ninguém teria visto lendo o código: os
pinos brancos sumiam no aro prateado, e a fonte do tema Manhã escrevia
"SORTeADOR", porque o "e" minúsculo dela tem outro desenho.

### Direitos autorais

Os temas são inspirados em programas de TV reais. Podem sofrer problemas com
direitos autorais, estamos cientes disso.

### Lição

> Antes de construir em cima, arrume o terreno, num commit separado que não
> muda nada e que você consegue provar que não mudou. É o commit mais chato de
> fazer e o mais fácil de revisar, e foi ele que fez cada tema novo caber num
> bloco só.

---

## Ato 10: A imagem para compartilhar, e os casos extremos

**Data:** 12/10/2026

### O que eu pedi

O último item de código da issue: uma imagem dos vencedores para postar nas
redes, uma das sugestões da organização.

### O que foi feito

Cada sorteio do histórico ganhou um botão **"Imagem"**, que baixa um PNG no
formato retrato do Instagram (1080×1350) com o título, a data, os vencedores e
o comprovante de cada um. A imagem é desenhada no próprio navegador, sem
servidor, e segue o tema escolhido. Isso só foi barato porque as cores já
estavam todas em variáveis, desde o Ato 9.

### Como conferi

Em vez de testar só o caso comum, a IA gerou a imagem nos **extremos**: um
vencedor só, um nome enorme ("Maria Aparecida dos Santos Albuquerque
Ferreira") e vinte vencedores. Cada extremo mostrou um defeito diferente:

- com um vencedor, o nome ficava solto no meio de um espaço vazio;
- o nome enorme saía **espremido**, porque o canvas achata o texto que não
  cabe. Agora a letra diminui primeiro, como já acontecia na roda;
- com vinte, os comprovantes ficavam ilegíveis. Agora a imagem mostra até dez
  nomes e "+ N vencedores".

O botão de download foi testado com um sorteio de verdade. O teste travou duas
vezes, e nas duas a falha era do teste, não do código. Registrar cada etapa
mostrou exatamente onde ele parava.

### Lição

> O caso comum quase sempre funciona. Os defeitos moram nos extremos: zero,
> um, muitos e o texto enorme. Teste esses primeiro.

---

## Ato 11: O que o humano precisa entender

**Data:** 12/10/2026

### O que eu pedi

Com o código pronto, a IA rascunhou o roteiro da apresentação. Pedi que ele
tivesse **fluxogramas e diagramas de sequência** explicando os processos. O
motivo: o código foi feito pela IA, e quem não escreveu não vai lembrar dele. O
que uma pessoa precisa aprender são as **regrinhas por baixo dos panos**.

### O que foi feito

Um arquivo novo, [`COMO-FUNCIONA.md`](COMO-FUNCIONA.md), com três diagramas:
um sorteio do clique ao confete, o sorteio sem viés e a troca de tema. Depois
de cada um vem **a regra** que ele ensina e em que funções ela está no código.

Antes de desenhar, a IA leu as funções, para não desenhar "de cabeça". Isso
achou uma regra escondida: a animação da roda usa `Math.random`, o mesmo que
o Ato 2 diz que não serve para sortear. Ali ele é só enfeite, porque desloca o
ponto de parada sempre **dentro** da fatia já sorteada. Sem o diagrama, alguém
poderia "consertar" isso, ou pior, copiar o `Math.random` para o sorteio.

Os diagramas foram desenhados pela mesma biblioteca que o GitHub usa, para
conferir que nenhum quebra.

### Uma ideia que mudou de forma

Tive outra ideia: para ser aleatório de verdade, consultar uma API pública,
talvez um relógio atômico. A IA discordou com argumentos:

- o gerador do navegador **já é** aleatório para efeitos práticos; uma API só
  troca a confiança no navegador pela confiança na API;
- um relógio é o oposto de aleatório: a hora exata é previsível.

Mas a intuição tinha valor. O que falta não é **acaso**, é **prova**: hoje o
público precisa acreditar que o organizador não sorteou de novo. Existem
**faróis públicos de aleatoriedade** que publicam números assinados de tempos
em tempos. Anunciando antes a lista e qual número futuro será usado, qualquer
pessoa pode refazer a conta depois. Virou a
[issue #4](https://github.com/kafeltz/prototipo-sorteador/issues/4), aberta à
comunidade, e sem precisar de servidor.

### Lição

> A IA escreve o código; o entendimento tem que ser humano. Diagramas guardam
> as regras que não podem ser quebradas. E "mais aleatório" não é o mesmo que
> "verificável": antes de buscar a solução, descubra qual é o problema de
> verdade.

---

## Ato 12: O projeto muda de mãos

**Data:** 19/10/2026

### O que aconteceu

Os alunos que iam continuar o sorteador saíram do projeto. Sigo sozinho, e o
diário muda um pouco de papel: passa a registrar **como o trabalho seria
feito**, para quem quiser aprender com ele depois.

A ambição também mudou. Até aqui era um protótipo; agora a meta é deixar o
sorteador **pronto para produção**, começando pelo que as issues
[#3](https://github.com/kafeltz/prototipo-sorteador/issues/3) (precisamos de um
servidor?) e [#4](https://github.com/kafeltz/prototipo-sorteador/issues/4)
(sorteio que o público consegue conferir) deixaram em aberto.

### O que eu pedi

Primeiro, só um plano, sem código. Depois, que a IA executasse o plano inteiro
sozinha, por horas, sem me pedir ok a cada passo.

### O que foi decidido

- **O plano em marcos, e cada marco em atos.** Primeiro o sorteio verificável
  sem servidor; depois o servidor; por último o ensaio geral. Cada marco é
  útil sozinho: se o trabalho parar no meio, o que ficou pronto funciona.
- **Sozinho, mas com pull request.** Nada vai direto para a `main`: cada marco
  vira um PR, que só entra com os testes passando. Ninguém revisa na hora, mas o
  histórico fica do jeito que uma pessoa conseguiria revisar depois.
- **Autonomia com regras combinadas antes.** A IA trabalha sem esperar meu ok
  entre os itens, mas continua fazendo um item por commit, conferido antes do
  próximo, como no Ato 7. E ficou escrito quando ela **para e me chama**: algo
  que exige conta, chave ou DNS; uma decisão de produto que aparece no meio do
  caminho; um teste que falha sem ela entender por quê.
- **Quatro decisões tomadas antes de começar**, porque mexem com coisa
  pública: o servidor vai para um endereço de prévia, e não para o domínio
  oficial, até a apresentação passar; só eu crio sorteios no servidor, com uma
  senha; a lista de participantes de um sorteio fica pública, com aviso, por
  90 dias; e a IA pode fazer o merge dos PRs quando os testes passarem.

### Lição

> Quando a equipe vai embora, sobra o que foi escrito: o diário, as issues e
> os diagramas. Foi isso que permitiu retomar sem perder nada. E deixar a IA
> trabalhar sozinha por horas só é seguro com as regras combinadas antes: o
> ritmo, onde ela entrega e quando ela tem que parar.

---

## Ato 13: O vilão antes do código

**Data:** 19/10/2026

### O que eu pedi

Tive uma ideia para o sorteio ser à prova de desconfiança: **testemunhas**. As
pessoas leem um QR code, deixam o e-mail e, depois do sorteio, todas recebem a
"semente", o número secreto que decidiu o resultado. Assim ninguém pode dizer
que o sistema mentiu.

### O furo

A IA gostou da ideia, mas achou um furo antes de escrever qualquer código: se
a semente chega **só depois**, a testemunha não sabe quantas sementes o
organizador testou até achar uma que desse o resultado que ele queria. A
semente chega certinha e não prova nada.

Para achar furos assim, o primeiro passo foi escrever uma tabela: **quem pode
trapacear, e como**. Sortear várias vezes, mexer na lista depois, inflar as
chances com nomes repetidos, mostrar um sorteio e esconder outro. Para cada
trapaça, o que impede. A tabela está no
[`COMO-FUNCIONA.md`](COMO-FUNCIONA.md#4-o-sorteio-verificável-quem-pode-trapacear).

### O conserto: o lacre e o farol

- **Um lacre antes do sorteio.** Um texto com a lista, as regras e o horário,
  entregue às testemunhas **antes** de o resultado existir.
- **Um acaso que ninguém controla.** O número vem do farol público da issue
  #4, numa rodada futura. Se a semente viesse do organizador, ele poderia
  testar sementes antes de lacrar; se viesse das testemunhas, ele poderia
  inventar testemunhas falsas no fim.

### A minha ideia, a agenda

Pensei em marcar o sorteio pelo **Google Agenda**: todo mundo que recebe o
convite fica com algo que não dá mais para alterar. A ideia ficou, com um
ajuste que vale a aula:

- **O evento pode ser alterado; o e-mail do convite, não.** O organizador
  edita o evento quando quiser, até sem avisar os convidados. Mas o e-mail que
  chegou fica na caixa de cada um, **assinado pelo Google**. O lacre de verdade
  é o e-mail.
- **A agenda carrega o lacre, mas não gera o acaso.** Se o número saísse do
  evento, o organizador poderia apagar e criar de novo até gostar.
- **De brinde, zero integração.** O sorteador só precisa gerar o texto para
  colar na descrição do evento. Nenhum login no Google, nenhum e-mail guardado
  pelo projeto.

### O limite

Não dá para resolver tudo, e nem é o objetivo. O `COMO-FUNCIONA.md` ganhou uma
seção **"O que isto NÃO protege"**: um conluio do organizador com todas as
testemunhas, dois eventos escondidos, uma traição dentro do próprio farol e,
principalmente, quem não confere.

### Lição

> Segurança começa perguntando quem é o vilão, antes do código. Uma ideia boa
> com um furo vira uma ideia ótima quando alguém procura o furo cedo. E um
> sistema honesto diz onde a proteção dele acaba.

---

## Ato 14: A regra vira um arquivo

**Data:** 19/10/2026

### O que foi feito

A regra que decide quem ganha saiu do `index.html` e foi para um arquivo
próprio, o `regra-do-sorteio.js`. O motivo: daqui para a frente, **quatro
lugares** precisam fazer a mesma conta (o sorteador, o conferidor, o servidor
e os testes). Se cada um tivesse a sua cópia, um dia elas iam discordar, e
num sorteio verificável isso é fatal.

O arquivo ganhou a regra do sorteio verificável, escrita em português antes do
código, no [`COMO-FUNCIONA.md`](COMO-FUNCIONA.md#5-do-número-do-farol-aos-vencedores):

- **O lacre é um texto para gente ler e máquina conferir.** Lista, regras,
  horário e a rodada do farol que vai ser usada.
- **A impressão digital é calculada sobre o lacre "passado a limpo".** Agendas
  e e-mails estragam texto: trocam espaços, inserem linhas em branco,
  escrevem o acento de outro jeito. O lacre é reescrito num formato oficial
  antes da conta, então um lacre colado "sujo" de um convite dá a mesma
  impressão digital. Uma letra trocada num nome, não.
- **Do número do farol aos vencedores, só com SHA-256 e o mesmo descarte do
  Ato 2.** Tudo vira texto antes, para qualquer linguagem conseguir repetir.

### Como conferi

- **Vetores de teste com rodadas reais do farol.** São casos fixos (lacre +
  número → vencedores) que qualquer outra implementação pode usar para se
  conferir.
- **Uma segunda implementação, em Python**, escrita só a partir da descrição
  da regra, sem olhar o JavaScript. As duas chegam aos mesmos vencedores nos
  cinco vetores, inclusive no lacre "sujo". Se a regra só funcionasse no meu
  código, ela não seria verificável.
- **O modo rápido não mudou, e isso foi provado** como no Ato 9: capturas antes
  e depois, 0 pixels diferentes, e um sorteio completo no navegador.
- **Os testes rodam sozinhos no GitHub** a cada pull request.

Um teste falhou na primeira vez: dizia que 2³² dividido por 17 deixa resto 6.
Deixa 1. A conta errada era a do teste, não a do código. A lição do Ato 7
continua valendo.

### Lição

> Código que vai ser auditado tem que dar sempre o mesmo resultado, e precisa
> ser simples o bastante para outra pessoa reescrever do zero. A prova de que
> uma regra é pública é alguém chegar à mesma resposta sem copiar o seu código.

---

## Ato 15: O conferidor antes da funcionalidade

**Data:** 19/10/2026

### O que foi feito

Antes de colocar o sorteio verificável no sorteador, veio **o lado de quem
confere**. Se ninguém consegue conferir, "verificável" é só propaganda.

- **`conferir.html`:** a testemunha cola o lacre que recebeu (pode ser com o
  texto do convite em volta) e a página mostra, passo a passo, o que foi
  conferido: o lacre, a rodada do farol com a assinatura, a semente e os
  vencedores. Se a rodada ainda não saiu, mostra quanto falta e confere
  sozinha na hora.
- **`conferir.mjs`:** a mesma coisa pelo terminal, para quem não quer confiar
  nem na página.
- **`farol.js`:** busca a rodada em quatro endereços do drand. Um fora do ar,
  tenta o próximo. Mas um entregando número com assinatura falsa **para tudo**:
  isso não é "instabilidade", é ataque.

### A assinatura é conferida em quem olha

O farol assina cada rodada com uma chave que só a League of Entropy tem. Quem
confere usa a chave pública, gravada no código, e a conta acontece **no
aparelho da testemunha**. Não importa quem entregou o número, nem se foi o
nosso servidor: número com assinatura errada é recusado.

### A primeira dependência

Conferir assinaturas desse tipo exige matemática de curvas elípticas, e
escrever isso à mão é pedir para errar. Entrou a primeira biblioteca de
terceiros do projeto, a `@noble/curves`, que é auditada e não tem
dependências. Duas decisões:

- **Um arquivo copiado para dentro do repositório**, e não um link para um
  CDN. O sorteador continua abrindo com dois cliques, e o que foi revisado é o
  que roda: um arquivo no repositório não muda de um dia para o outro.
- **Com receita e conferência.** O `vendor/README.md` diz exatamente como gerar
  o arquivo de novo e qual tem que ser o hash dele.

E a receita foi testada de verdade. Na primeira tentativa, o hash deu
diferente. O motivo: eu tinha pegado um atalho (reaproveitar uma pasta de
dependências por um link), e o empacotador escreve o caminho dos arquivos
dentro do resultado. Seguindo a receita à risca, numa pasta limpa, o hash
bateu.

### Como conferi

Testes sem internet, com rodadas reais gravadas e um farol "de mentira" que
cai, demora, responde a rodada errada ou entrega um número forjado. No
navegador: um lacre real colado sujo, um lacre de 20 segundos no futuro (a
página esperou e conferiu sozinha), um lacre quebrado e um participante
chamado `<b>Duda</b>`, que tem que aparecer como texto, e não virar negrito.
As capturas pegaram um defeito de layout na lista de vencedores do celular.

### Lição

> Faça primeiro a ferramenta de quem desconfia. E quando a receita diz "numa
> pasta limpa", é numa pasta limpa: o atalho que parece igual é justamente o
> que a conferência existe para pegar.

---

## Ato 16: O farol e a agenda no sorteador

**Data:** 19/10/2026

### O que foi feito

O sorteador ganhou a opção **"Sorteio verificável"**. O caminho do
organizador:

1. Marca a opção, escolhe o título e o horário e clica em **Lacrar a lista**.
2. A lista e as regras travam, e aparece o lacre, com um botão que abre o
   **Google Agenda com o evento já preenchido**: título, horário e o lacre na
   descrição. Falta só convidar as testemunhas e salvar. Nenhuma API, nenhum
   login: é um link.
3. A roda fica parada em **"AGUARDANDO O FAROL"**, com a contagem: *"Até lá,
   ninguém sabe quem vai ganhar."*
4. Na hora, o SORTEAR busca a rodada, confere a assinatura, calcula **todos** os
   vencedores e anima um de cada vez: decidir primeiro, animar depois, como
   sempre.

Embaixo da roda, inclusive no modo apresentação, fica um **selo** com o
começo da impressão digital (`🔒 Lacre 8184 a70a c2bf 93bf`), para quem
assiste comparar com o convite que recebeu. O selo também vai para o
histórico, para o texto copiado e para a imagem das redes.

### As decisões que protegem o sorteio

- **Horário no passado é recusado.** Se o número do farol já existisse, o
  organizador poderia ver o resultado antes de lacrar.
- **Farol fora do ar: nada é sorteado.** O status explica e o botão espera. O
  modo verificável nunca cai em silêncio para o gerador do navegador.
- **A roda confere a regra.** Antes de girar, o sorteador confere se o nome que
  vai parar no ponteiro é o que a regra calculou. Se discordarem, o sorteio
  para com um erro. Melhor parar a live do que mostrar um vencedor que o
  conferidor não confirmaria.
- **O lacre sobrevive a recarregar a página.** Navegador fechado no meio da
  live não pode virar desculpa para lacrar de novo.
- **Depois que a roda mostrou o primeiro vencedor, não dá para desfazer o
  lacre.** E desfazer depois do horário pede uma confirmação que diz o óbvio:
  *"vai parecer que você não gostou do resultado"*.

### Como conferi

Um teste no navegador fez o caminho inteiro com um lacre de 70 segundos:
horário no passado recusado, campos travados, página recarregada no meio, a
espera, os dois vencedores. Depois, **por fora do navegador**, só com o farol e
a regra, a conta chegou aos mesmos dois nomes. Num segundo teste, os endereços
do farol foram bloqueados na hora do sorteio: nada foi sorteado. Desbloqueados,
o mesmo botão funcionou.

As capturas pegaram mais um defeito de layout: com dois botões no histórico
("Conferir" e "Imagem"), eles ficavam empilhados.

### Lição

> O caminho feliz é o menor pedaço do trabalho. O que torna um sorteio
> confiável são as portas fechadas: horário no passado, farol fora do ar,
> página recarregada, roda e regra discordando. Cada uma é uma linha de código
> e uma trapaça a menos.

---

## Ato 17: Decisões escritas antes do servidor

**Data:** 19/10/2026

### O que eu pedi

Um servidor (um "backend") e um banco de dados. Pensei em SQLite, para ser
ultra pequeno.

### O que foi feito

Antes de qualquer código, três **registros de decisão** na pasta
[`docs/decisoes/`](docs/decisoes/). Cada um diz o contexto, o que foi decidido,
o que se ganha, o que se perde e o que ficou de fora:

1. **Para que um servidor.** A surpresa: o sorteio verificável, que parecia
   precisar de servidor, já funcionava sem ele. Sobrou um uso só: dar a cada
   sorteio um **endereço público**, para quem assiste abrir pelo celular. E o
   servidor **não precisa ser confiável**: a página refaz a conta no navegador
   de quem olha.
2. **Com quê.** Cloudflare Workers com **D1, que é o próprio SQLite**,
   gerenciado. Ultra pequeno, como eu queria, e sem máquina para manter.
   Descartados: uma máquina virtual (alguém tem que cuidar dela) e os Durable
   Objects (o servidor nem precisa estar acordado na hora do sorteio).
3. **Que dados.** As respostas que a issue #3 cobrava: o que fica guardado
   (só o lacre, sem e-mail, IP ou cookie), quem grava (só eu, com senha), quem
   lê (todo mundo: sem a lista, ninguém confere) e por quanto tempo (90 dias).

### Lição

> Decisão escrita é decisão que dá para revisar. Daqui a seis meses, ninguém
> vai lembrar por que não foi uma máquina virtual, mas o arquivo vai estar lá.
> E escrever antes do código às vezes revela que metade do código não precisa
> existir.
