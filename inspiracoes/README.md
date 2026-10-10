# Inspirações

Imagens que a comunidade enviou como **ideia** de visual para o sorteador.
Elas ficam guardadas aqui para não perder o caminho de aprendizado: mostram de
onde cada layout partiu.

**Não são peças do sorteador.** Nenhum layout carrega estes arquivos. Cada
protótipo usou as imagens como inspiração: extraiu o que dava (recortes,
cores) e refez o resto em HTML e CSS. Os recortes usados de verdade ficam em
`assets/`.

## layout-02: quarto gamer neon

| Arquivo | O que é | O que virou |
|---|---|---|
| `montagem-quarto-gamer.webp` | Montagem do layout inteiro, gerada por IA | Referência de disposição e paleta; a mesa gamer virou a imagem do prêmio |
| `logo-presente-original.webp` | Logo do presente neon sobre fundo escuro | Logo com fundo transparente |
| `foto-quarto-captura-youtube.webp` | Foto do quarto, capturada de um vídeo do YouTube | Fundo da página, recortado sem os controles do player |

Resultado: [`layout-02.html`](../layout-02.html). O processo está no Ato 4 do
[diário](../DIARIO.md).

## layout-03: sala do jogo

Ideia do próprio mantenedor: um cenário escuro inspirado no filme *Jogos
Mortais* (*Saw*, 2004), com uma TV de tubo passando a gravação do boneco, mas
sem nada sangrento.

| Arquivo | O que é | O que virou |
|---|---|---|
| `boneco-ventriloquo.jpg` | Foto do boneco gerada pelo mantenedor no Leonardo.ai | O boneco na tela da TV, reduzido e com efeito de fita VHS feito em CSS |

A primeira versão tinha o boneco desenhado à mão em SVG, mas ficou com cara
de desenho animado. A foto gerada por IA resolveu o realismo. Azulejos,
lâmpada, chiado da TV, dossiê e fita cassete continuam sendo só CSS.

<details>
<summary>Prompt usado no Leonardo.ai</summary>

O nome do filme e do personagem ficaram de fora de propósito: algumas IAs
bloqueiam personagens protegidos, e a ideia era descrever as características.

**Prompt:**

```
Photorealistic close-up portrait of a creepy antique ventriloquist puppet, head and shoulders, centered, facing the camera. Glossy white porcelain face with fine cracks and worn paint, hand-painted red spiral circles on both cheeks, deep black eye sockets with glossy black eyes and small glowing red irises, red painted lips, hinged wooden jaw with visible carved seams running down to the chin, messy short black hair. Wearing a black tuxedo, white shirt and a red bow tie. Single dim light bulb from above, harsh shadows, plain pitch-black background. Cinematic horror film still, unsettling but clean, sharp focus, 35mm photography, high detail.
```

**Negative prompt:**

```
blood, gore, wounds, injury, cartoon, anime, illustration, 3d render, plastic toy, text, letters, watermark, logo, frame, border, TV, scanlines, multiple faces, cropped head, hands
```

Proporção 4:3 (a mesma da tela da TV) e fundo preto liso, para facilitar o
encaixe. Sem TV nem linhas de tela na imagem, porque esse efeito é feito no
código.

</details>

Resultado: [`layout-03.html`](../layout-03.html).

> **Direitos:** no layout 02, a foto do quarto vem de um vídeo, e a parede tem personagens de
> jogos de terceiros. Serve para discussão de layout; antes de virar o visual
> oficial, é preciso confirmar o uso com quem enviou. No layout 03, mesmo sem
> citar o filme, a IA gerou um boneco muito parecido com o personagem, que é do
> estúdio; para uso oficial, vale gerar uma versão mais diferente do original.
