# Código de terceiros

Este projeto evita dependências, mas uma coisa ele não deve fazer sozinho:
**criptografia de curvas elípticas**. Conferir a assinatura do farol drand
exige a matemática das assinaturas BLS, e escrever isso à mão é pedir para
errar. Por isso usamos uma biblioteca pronta, auditada e sem dependências.

## `noble-bls.js`

- **O que é:** o pedaço da [@noble/curves](https://github.com/paulmillr/noble-curves)
  2.4.0 que confere assinaturas BLS "curtas" (o esquema do drand quicknet).
  Licença MIT, em `LICENSE-noble-curves`.
- **Por que um arquivo copiado, e não um link para um CDN:** o sorteador abre
  com dois cliques, sem servidor e sem `npm install`. E um arquivo dentro do
  repositório não muda de um dia para o outro: o que foi revisado é o que roda.
- **Como é usado:** pendura `NobleBls.conferirAssinaturaCurta(...)` em
  `globalThis`. Quem usa é o `farol.js`.

### Como gerar de novo (e conferir que ninguém mexeu)

Numa pasta vazia, fora do repositório:

```sh
npm init -y
npm install @noble/curves@2.4.0 esbuild@0.25.10
cp <repositório>/vendor/noble-bls.entrada.js entrada.js
npx esbuild entrada.js --bundle --format=iife --target=es2020 \
  --legal-comments=inline --log-level=warning \
  --banner:js="/* @noble/curves 2.4.0 (bls12-381), licença MIT, (c) Paul Miller. Gerado por esbuild 0.25.10 a partir de vendor/README.md. Não edite à mão. */" \
  --outfile=noble-bls.js
sha256sum noble-bls.js
```

O resultado tem que ser idêntico ao arquivo do repositório:

```
0934a577bbc7592955f42b1b6cafc3a0dc6257a8a3690c12c9cda47f720b0798  noble-bls.js
```

Para atualizar a versão, troque os números acima, gere de novo, rode
`npm test` e atualize o hash neste arquivo, tudo no mesmo commit.
