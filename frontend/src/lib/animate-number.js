// Reine Rechenteile der Wert-Animation (2026-08-20).
//
// Bewusst frei von React und DOM: hier liegt alles, was man ohne Browser
// pruefen kann — das Zerlegen des Server-Werts, die Kurve, die Formatierung
// und die Frage, wie stark eine Aenderung gefeiert werden darf. Die
// Komponente daneben macht nur noch rAF und schreibt Text.

/** Nachkommastellen, wie sie in der Zeichenkette WIRKLICH stehen. */
export function nachkommastellen(s) {
  const p = String(s).split('.');
  return p.length > 1 ? p[1].length : 0;
}

/**
 * Zerlegt einen Server-Wert in Zahl + Rest.
 *
 * ⚠️ Die Genauigkeit kommt aus der Zeichenkette, nicht aus der Zahl: das
 * Backend liefert Dezimalwerte als Strings (fester Vertrag), und `9.10` waere
 * als Zahl nur noch `9.1` — die Anzeige wuerde zwischen einer und zwei
 * Nachkommastellen springen, was bei tabellarischen Ziffern als Zucken
 * auffaellt. Darum wird die Vorlage uebernommen, wie sie ankommt.
 *
 * Werte mit angehaengter Einheit ("2771 RPM") werden mitgenommen; alles ohne
 * fuehrende Zahl ("eth0", "Unknown") liefert null = nicht animierbar.
 */
export function zerlege(wert) {
  if (wert === null || wert === undefined || wert === '') return null;
  if (typeof wert === 'number') {
    if (!Number.isFinite(wert)) return null;
    return { zahl: wert, rest: '', stellen: nachkommastellen(wert) };
  }
  const t = String(wert).trim();
  const m = /^(-?\d+(?:\.\d+)?)(.*)$/.exec(t);
  if (!m) return null;
  return { zahl: parseFloat(m[1]), rest: m[2], stellen: nachkommastellen(m[1]) };
}

/** Weiche Landung: schnell los, sanft ans Ziel. */
export function easeOutCubic(t) {
  const x = t < 0 ? 0 : t > 1 ? 1 : t;
  return 1 - Math.pow(1 - x, 3);
}

/** Zwischenstand als fertiger Text — gleiche Stellenzahl wie das Ziel. */
export function formatiere(zahl, stellen, rest = '') {
  return zahl.toFixed(stellen) + rest;
}

/**
 * Wie kraeftig darf der Puls sein? 0 = gar nicht, 1 = volle Fanfare.
 *
 * ⚠️ Der Grund fuer diese Funktion: das Dashboard pollt im SEKUNDENTAKT. Ein
 * fester Aufblitz bei jeder Aenderung liesse acht Karten im Sekundentakt
 * blinken — das waere schlimmer als der harte Wechsel vorher. Also skaliert
 * die Feier mit der Groesse des Sprungs: das uebliche Rauschen bleibt
 * unsichtbar, ein echter Satz leuchtet.
 *
 * `bezug` ist der Sprung, der als „gross" gilt (volle Staerke). Wer ihn kennt,
 * soll ihn nennen — ⚠️ eine EINZIGE relative Regel taugt hier nicht: bei
 * Prozentwerten nahe null macht sie aus 1,5 → 1,8 einen Paukenschlag (20 %
 * relativ, aber sichtbar nichts), waehrend 19 U/min beim Luefter zu Recht
 * verschwinden. Ohne Angabe gilt darum die relative Regel — ein Viertel des
 * bisherigen Werts, mit 1 als Boden, sonst waere jede Bewegung ueber der Null
 * unendlich gross. Sie passt fuer Raten und Zaehler, deren Groessenordnung
 * selbst wandert.
 */
export function pulsStaerke(vorher, nachher, bezug = null) {
  if (vorher === null || vorher === undefined) return 0;
  if (nachher === null || nachher === undefined) return 0;
  const d = Math.abs(nachher - vorher);
  if (!(d > 0)) return 0;
  const b = (bezug !== null && bezug > 0) ? bezug : Math.max(1, Math.abs(vorher)) * 0.25;
  const s = Math.min(1, d / b);
  return s < 0.08 ? 0 : s;   // unter der Wahrnehmungsschwelle gar nicht erst starten
}

/** -1 faellt, +1 steigt, 0 unveraendert — treibt die Richtung des Nickens. */
export function richtung(vorher, nachher) {
  if (vorher === null || vorher === undefined) return 0;
  if (nachher === null || nachher === undefined) return 0;
  if (nachher > vorher) return 1;
  if (nachher < vorher) return -1;
  return 0;
}

/** Laufzeit des Tweens. Muss unter dem Poll-Takt bleiben, sonst holpert es. */
export const TWEEN_MS = 650;
