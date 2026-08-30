// Chart-Motion (2026-08-30): Einzeichnen initial + bei Range-Wechsel,
// NIE im 5-s-Poll (recharts wuerde sonst jede Runde nachzeichnen).
const fs = require('fs');
const path = require('path');
const SRC = fs.readFileSync(path.join(__dirname, 'Charts.js'), 'utf8');
const PUR = SRC.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/[^\n]*$/gm, '');

test('Range-Wechsel setzt den Einflug zurueck', () => {
  const i = PUR.indexOf('const setTimeRange');
  const fn = PUR.slice(i, i + 400);
  expect(fn).toMatch(/drawInDone\.current = false/);
  expect(fn).toMatch(/setDrawIn\(true\)/);
});

test('der Poll animiert nie selbst (nur drawIn steuert)', () => {
  expect(PUR).toMatch(/isAnimationActive=\{drawIn\}/);
  // Nach dem Einflug wird abgeschaltet:
  expect(PUR).toMatch(/setTimeout\(\(\) => setDrawIn\(false\), 1400\)/);
});
