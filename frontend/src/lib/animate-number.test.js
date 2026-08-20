import {
  nachkommastellen, zerlege, easeOutCubic, formatiere, pulsStaerke, richtung, TWEEN_MS,
} from './animate-number';

describe('zerlege', () => {
  test('nimmt die Genauigkeit aus der Zeichenkette, nicht aus der Zahl', () => {
    // ⚠️ Der Kern: das Backend liefert Dezimalwerte als STRINGS. Als Zahl waere
    // "9.10" nur 9.1 — die Anzeige spraenge zwischen einer und zwei
    // Nachkommastellen und die Ziffern zuckten.
    expect(zerlege('9.10')).toEqual({ zahl: 9.1, rest: '', stellen: 2 });
    expect(zerlege('49.05')).toEqual({ zahl: 49.05, rest: '', stellen: 2 });
    expect(zerlege('42')).toEqual({ zahl: 42, rest: '', stellen: 0 });
  });

  test('trennt eine angehaengte Einheit ab', () => {
    expect(zerlege('2771 RPM')).toEqual({ zahl: 2771, rest: ' RPM', stellen: 0 });
  });

  test('nimmt auch echte Zahlen', () => {
    expect(zerlege(186)).toEqual({ zahl: 186, rest: '', stellen: 0 });
    expect(zerlege(0)).toEqual({ zahl: 0, rest: '', stellen: 0 });
  });

  test('negative Werte bleiben negativ', () => {
    expect(zerlege('-3.5')).toEqual({ zahl: -3.5, rest: '', stellen: 1 });
  });

  test('was keine Zahl ist, ist nicht animierbar', () => {
    // Diese Werte stehen real in den Karten: Schnittstellenname, Luefter aus,
    // Platzhalter, fehlende Daten.
    ['eth0', 'Unknown', '--', '', null, undefined, NaN, Infinity]
      .forEach(v => expect(zerlege(v)).toBeNull());
  });
});

describe('pulsStaerke', () => {
  test('das uebliche Rauschen bleibt unsichtbar', () => {
    // ⚠️ Der Grund fuer die ganze Funktion: acht Karten pollen im Sekundentakt.
    // Ein fester Aufblitz je Aenderung waere schlimmer als der harte Wechsel.
    expect(pulsStaerke(9.1, 9.3, 15)).toBe(0);   // CPU zappelt
    expect(pulsStaerke(49.05, 49.4, 8)).toBe(0); // Temperatur atmet
    expect(pulsStaerke(2771, 2790)).toBe(0);     // Luefter atmet
    expect(pulsStaerke(186, 187)).toBe(0);       // ein Prozess mehr
  });

  test('ein echter Satz leuchtet voll', () => {
    expect(pulsStaerke(9.1, 30, 15)).toBe(1);
    expect(pulsStaerke(49, 71, 8)).toBe(1);
  });

  test('⚠️ ohne eigenen Bezug wird ein Prozentwert nahe null zum Paukenschlag', () => {
    // Genau deshalb gibt es den Bezug: relativ betrachtet ist 1,5 → 1,8 ein
    // Sprung um 20 %, sichtbar aber nichts. Die relative Regel meldet hier
    // fast volle Staerke — mit dem Bezug der Karte bleibt es still.
    expect(pulsStaerke(1.5, 1.8)).toBeGreaterThan(0.5);
    expect(pulsStaerke(1.5, 1.8, 15)).toBe(0);
  });

  test('die relative Regel passt weiter fuer Raten und Zaehler', () => {
    expect(pulsStaerke(5, 140)).toBe(1);       // Netzwerk-Spitze
    expect(pulsStaerke(2771, 2790)).toBe(0);   // Luefter
  });

  test('der erste Alarm leuchtet, obwohl es nur eine 1 ist', () => {
    // Ohne den Boden von 1 im Bezug waere jede Bewegung ueber der Null
    // unendlich gross — mit ihm ist 0 → 1 genau die volle Fanfare.
    expect(pulsStaerke(0, 1)).toBe(1);
  });

  test('liegt immer zwischen 0 und 1', () => {
    for (const [a, b] of [[1, 1e6], [50, 0], [-20, 20], [0.01, 0.02]]) {
      const s = pulsStaerke(a, b);
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThanOrEqual(1);
    }
  });

  test('kein Puls ohne Aenderung und ohne Vorwert', () => {
    expect(pulsStaerke(42, 42)).toBe(0);
    expect(pulsStaerke(null, 42)).toBe(0);
    expect(pulsStaerke(42, null)).toBe(0);
  });
});

describe('richtung', () => {
  test('zeigt, wohin genickt wird', () => {
    expect(richtung(10, 12)).toBe(1);
    expect(richtung(12, 10)).toBe(-1);
    expect(richtung(10, 10)).toBe(0);
    expect(richtung(null, 10)).toBe(0);
  });
});

describe('easeOutCubic', () => {
  test('faengt bei 0 an und landet auf 1', () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
  });

  test('bremst zum Ende hin ab', () => {
    // Auf halber Zeit ist schon deutlich mehr als die halbe Strecke geschafft.
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.8);
    const frueh = easeOutCubic(0.1) - easeOutCubic(0);
    const spaet = easeOutCubic(1) - easeOutCubic(0.9);
    expect(frueh).toBeGreaterThan(spaet);
  });

  test('klemmt ausserhalb des Bereichs', () => {
    expect(easeOutCubic(-1)).toBe(0);
    expect(easeOutCubic(2)).toBe(1);
  });
});

describe('formatiere', () => {
  test('haelt die Stellenzahl fest, damit die Breite nicht springt', () => {
    expect(formatiere(9.1, 2)).toBe('9.10');
    expect(formatiere(9.126, 2)).toBe('9.13');
    expect(formatiere(186.4, 0)).toBe('186');
  });

  test('haengt die Einheit an', () => {
    expect(formatiere(2771, 0, ' RPM')).toBe('2771 RPM');
    expect(formatiere(49.05, 2, '°')).toBe('49.05°');
  });
});

test('⚠️ der Tween bleibt unter dem Poll-Takt von 1 s', () => {
  // Laeuft er laenger, holt ihn der naechste Poll mitten in der Bewegung ein
  // und die Zahl kommt nie zur Ruhe.
  expect(TWEEN_MS).toBeLessThan(1000);
});

test('nachkommastellen zaehlt, was dasteht', () => {
  expect(nachkommastellen('1.234')).toBe(3);
  expect(nachkommastellen('1')).toBe(0);
  expect(nachkommastellen(2.5)).toBe(1);
});
