// As páginas guardam JavaScript dentro do HTML. Um erro de sintaxe ali
// derruba a página inteira, e nenhum outro teste percebe. Este teste lê
// cada <script> sem "src" e confere se ele é JavaScript válido.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

for (const pagina of ['index.html', 'conferir.html', 'sorteio.html', 'apresentacao.html']) {
  test(`os scripts do ${pagina} são JavaScript válido`, () => {
    const html = fs.readFileSync(new URL(`../${pagina}`, import.meta.url), 'utf8');
    const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
    assert.ok(scripts.length > 0);
    for (const codigo of scripts) {
      assert.doesNotThrow(() => new vm.Script(codigo, { filename: pagina }));
    }
  });
}
