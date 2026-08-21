/**
 * Local regression test for writeRecipe() in Code.gs.  Run: node test-writer.js
 *
 * Mocks just enough of DocumentApp to exercise the writer. The mock deliberately
 * reproduces the behaviour that caused a real bug: appendParagraph inherits the
 * text attributes of the paragraph before it, so a paragraph appended after a
 * bold heading starts out bold and must be reset explicitly.
 */

const fs = require('fs');
const assert = require('assert');

let src = fs.readFileSync(__dirname + '/Code.gs', 'utf8');
src = src.replace(/^const (DOC_ID|INBOX_FOLDER_NAME|TRIGGER_MINUTES|STUB_MARKER).*$/gm, '');

global.DocumentApp = {
  ParagraphHeading: { HEADING2: 'H2', HEADING3: 'H3', NORMAL: 'P' },
  GlyphType: { BULLET: 'BULLET', NUMBER: 'NUMBER' },
  ElementType: { PARAGRAPH: 'PARA' }
};

function makeBody() {
  const nodes = [];

  function node(kind, text) {
    // Inherit from the previous node, as Google Docs does.
    const prev = nodes[nodes.length - 1];
    const n = {
      kind, text, heading: 'P', glyph: null,
      bold: prev ? prev.bold : false,
      italic: prev ? prev.italic : false,
      spans: []
    };
    const api = {
      setBold(a, b, v) {
        if (typeof a === 'boolean') { n.bold = a; n.spans = []; return api; }
        n.spans.push([a, b, v]); return api;
      },
      setItalic(v) { n.italic = v; return api; }
    };
    n.setHeading = h => { n.heading = h; return n; };
    n.setGlyphType = g => { n.glyph = g; return n; };
    n.editAsText = () => api;
    nodes.push(n);
    return n;
  }

  return {
    nodes,
    appendParagraph: t => node('para', t),
    appendListItem: t => node('li', t),
    clear: () => { nodes.length = 0; },
    getNumChildren: () => nodes.length,
    getChild: i => nodes[i]
  };
}

/** Which characters ended up bold, after whole-element and per-span settings. */
function boldMask(n) {
  const mask = new Array(n.text.length).fill(n.bold);
  n.spans.forEach(([a, b, v]) => { for (let k = a; k <= b; k++) mask[k] = v; });
  return mask;
}
const boldText = n => n.text.split('').filter((_, i) => boldMask(n)[i]).join('');

eval(src);

const body = makeBody();
writeRecipe(body, {
  title: 'Test Recipe',
  attribution: 'Linda Glauser',
  sections: [
    {
      ingredients: ['1½ cups flour'],
      instructions: ['Bake at **350°F** in a **9 × 13-inch pan**.', 'No bold here.']
    },
    {
      heading: 'Paragraph Style',
      text: 'Plain prose with **one bold run** inside it.',
      note: 'Marginalia from the card.'
    }
  ]
});

const byText = t => body.nodes.find(n => n.text.indexOf(t) === 0);
let checks = 0;
const check = (label, fn) => { fn(); checks++; console.log('  ok  ' + label); };

console.log('writeRecipe:');

check('title is a bold H2', () => {
  const n = byText('Test Recipe');
  assert.strictEqual(n.heading, 'H2');
  assert.strictEqual(n.bold, true);
});

check('attribution is a bold H3', () => {
  const n = byText('Linda Glauser');
  assert.strictEqual(n.heading, 'H3');
  assert.strictEqual(n.bold, true);
});

check('Ingredients/Instructions labels are bold normal paragraphs', () => {
  ['Ingredients', 'Instructions'].forEach(t => {
    const n = byText(t);
    assert.strictEqual(n.heading, 'P');
    assert.strictEqual(n.bold, true);
  });
});

check('ingredient bullets are not bold despite following a bold label', () => {
  const n = byText('1½ cups flour');
  assert.strictEqual(n.glyph, 'BULLET');
  assert.strictEqual(boldText(n), '');
});

check('instruction keeps only its ** spans bold', () => {
  const n = byText('Bake at');
  assert.strictEqual(n.glyph, 'NUMBER');
  assert.strictEqual(n.text, 'Bake at 350°F in a 9 × 13-inch pan.');
  assert.strictEqual(boldText(n), '350°F9 × 13-inch pan');
});

check('instruction with no markers is fully unbold', () => {
  assert.strictEqual(boldText(byText('No bold here.')), '');
});

// The two bugs the live test caught: both of these paragraphs follow a bold
// H3 and inherited its bold before the fix.
check('text paragraph does NOT inherit bold from the heading above it', () => {
  const n = byText('Plain prose');
  assert.strictEqual(n.heading, 'P');
  assert.strictEqual(n.text, 'Plain prose with one bold run inside it.');
  assert.strictEqual(boldText(n), 'one bold run');
});

check('note is italic and NOT bold', () => {
  const n = byText('Marginalia');
  assert.strictEqual(n.italic, true);
  assert.strictEqual(boldText(n), '');
});

console.log('\n' + checks + ' checks passed');
