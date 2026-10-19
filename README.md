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

## Como rodar

Não precisa instalar nada. Baixe o repositório e abra o `index.html` no
navegador. Para conferir um sorteio verificável, abra o `conferir.html` (ou,
no terminal, `node conferir.mjs lacre.txt`).

Para rodar os testes: `npm test` (Node 22 e Python 3, sem instalar nada).

## O que já funciona

- Colar uma lista de nomes ou importar CSV, com aviso de nomes repetidos
- Número de vencedores, com ou sem repetição, duração do giro, som liga/desliga
- Contagem 3-2-1, roda girando com "tique", fanfarra e confete
- Histórico com comprovante de cada sorteio, guardado no navegador (não some ao recarregar), com botões para copiar e limpar
- Imagem de cada sorteio para compartilhar nas redes (PNG 1080×1350, nas cores do tema escolhido)
- Modo apresentação em tela cheia, para lives e encontros
- Temas visuais: Clássico, Estúdio (inspirado na Roda a Roda) e Manhã (inspirado no Bom Dia & Cia); a escolha fica guardada no navegador
- **Sorteio verificável**: a lista é lacrada e enviada às testemunhas (pelo Google Agenda, por exemplo) antes do sorteio, o acaso vem do farol público drand, e qualquer pessoa refaz a conta no conferidor

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
