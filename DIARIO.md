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

- **Direitos das imagens.** A foto do quarto é a captura de um vídeo, e a
  parede tem personagens de jogos (Pac-Man, Link, o cogumelo do Mario). Para um
  protótipo de discussão está bom; para a versão final, é preciso confirmar com
  quem enviou se pode usar a imagem, e de preferência ter um fundo próprio.
- **Escolher.** Este é só o layout 02. A ideia é juntar outras propostas e
  decidir com a comunidade.

### Lição

> Imagem gerada por IA é ótima para conversar sobre o visual e péssima para
> virar interface. Use como referência: extraia o que é imagem (fundo, logo,
> cores) e refaça o resto em HTML e CSS.
