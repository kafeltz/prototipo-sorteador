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
