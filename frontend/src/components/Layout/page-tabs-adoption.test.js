// Phase-3-Adoption (2026-08-30): die Chip-Reihe traegt den Suite-Dialekt.
const fs = require('fs');
const path = require('path');
const SRC = fs.readFileSync(path.join(__dirname, 'PageTabs.js'), 'utf8');
const PUR = SRC.replace(/\/\*[\s\S]*?\*\//g, '');

test('die Chips sind sh-pills (NavLink v6 haengt .active selbst an)', () => {
  expect(PUR).toMatch(/className="sh-pill"/);
});

test('kein eigener Pillen-Skin mehr — nur Dichte, Layout, Trefferflaeche', () => {
  expect(PUR).not.toMatch(/&\.active/);
  expect(PUR).not.toMatch(/border-radius/);
  expect(PUR).not.toMatch(/theme\.colors\.primary/);
  // Die 44-px-Trefferflaeche MUSS bleiben (sh-pill bringt sie nicht mit):
  expect(PUR).toMatch(/height: 44px/);
});
