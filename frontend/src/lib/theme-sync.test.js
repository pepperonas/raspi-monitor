// Drift-Waechter: theme.js ist der handgepflegte JS-Spiegel von
// shared/theme.css (styled-components koennen kein Stylesheet lesen).
// Bis 2026-08-30 sicherte NICHTS diese Gleichheit — jetzt dieser Test.
const fs = require('fs');
const path = require('path');

const css = fs.readFileSync(
  path.join(__dirname, '..', '..', 'public', 'shared', 'theme.css'), 'utf8');
const tokenwert = (name) => {
  const m = css.match(new RegExp('--' + name + ':\\s*([^;]+);'));
  return m ? m[1].trim() : null;
};

// theme.js exportiert darkTheme — die Paare unten sind die dokumentierte
// Spiegel-Beziehung (Kommentar in theme.js: "Zustandsfarben = shared/theme.css").
const { darkTheme } = require('../theme');

test('theme.js spiegelt die shared-Farben exakt', () => {
  expect(darkTheme.colors.primary).toBe(tokenwert('sh-primary'));     // #b3c5ff
  expect(darkTheme.colors.onAccent).toBe(tokenwert('sh-on-primary')); // #0a285a
  expect(darkTheme.colors.success).toBe(tokenwert('sh-ok'));          // #7ddfa6
  expect(darkTheme.colors.warning).toBe(tokenwert('sh-warn'));        // #f5a04a
  expect(darkTheme.colors.error).toBe(tokenwert('sh-loud'));          // #ff8a80
  expect(darkTheme.colors.info).toBe(tokenwert('sh-accent'));         // #7ea2ff
  expect(darkTheme.colors.background).toBe(tokenwert('sh-bg2'));      // #0d0e12
});

test('theme.js spiegelt den Karten-Radius (28px = --sh-shape-xl)', () => {
  // Nach dem Token-Ausbau traegt die Shape-Skala das Literal; die alten
  // --sh-radius-Tokens sind Aliasse darauf.
  expect(tokenwert('sh-shape-xl')).toBe('28px');
  expect(darkTheme.borderRadius.lg).toBe(tokenwert('sh-shape-xl'));
});
