import React, { useRef, useLayoutEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  zerlege, easeOutCubic, formatiere, pulsStaerke, richtung, TWEEN_MS,
} from '../lib/animate-number';

/*
 * Wertwechsel weich statt hart (2026-08-20, Nutzerwunsch „animiere hier die
 * aenderungen der werte schoener").
 *
 * Bisher tauschte jeder Poll den Text aus — 49.05 wurde ohne Uebergang zu
 * 49.87. Jetzt laeuft die Zahl hinueber, und ein Puls markiert, WIE gross der
 * Sprung war (Staerke aus pulsStaerke, siehe dort: acht Karten im
 * Sekundentakt duerfen nicht blinken).
 *
 * ⚠️ Der Text wird per Ref geschrieben, NICHT ueber React-Kinder. Sonst
 * kaempfen zwei Schreiber um denselben Knoten: React setzte bei jedem Poll den
 * Zielwert, waehrend die Schleife noch dazwischen interpoliert — die Zahl
 * spraenge ans Ziel und liefe von dort nochmal los. Aus demselben Grund
 * rendert die Komponente kein einziges Mal pro Bild neu (dasselbe Muster wie
 * FanIndicator nebenan).
 */

const puls = keyframes`
  0%   { transform: translateY(0) scale(1); text-shadow: none; }
  32%  { transform: translateY(calc(var(--nick, 0) * var(--puls, 0) * -2.5px))
                    scale(calc(1 + 0.045 * var(--puls, 0)));
         text-shadow: 0 0 calc(16px * var(--puls, 0)) currentColor; }
  100% { transform: translateY(0) scale(1); text-shadow: none; }
`;

const Wert = styled.span`
  /* Der Puls sitzt auf der Zahl, nicht auf der Karte: die Einheit daneben
     bleibt ruhig stehen, sonst wackelt die ganze Zeile mit. */
  display: inline-block;

  &.pulsiert {
    animation: ${puls} 620ms cubic-bezier(.2, 0, 0, 1);
  }

  /* Wer weniger Bewegung will, bekommt den Wert sofort und ohne Puls —
     die Zahl ist die Information, die Animation nur ihre Betonung. */
  @media (prefers-reduced-motion: reduce) {
    &.pulsiert { animation: none; }
  }
`;

const AnimatedNumber = ({ value, fallback = '--', suffix = '', bezug = null, ...rest }) => {
  const ref = useRef(null);
  // `ist` ist der TATSAECHLICH angezeigte Wert, nicht das letzte Ziel — nur so
  // setzt ein Poll, der mitten in den Lauf platzt, dort auf, wo die Zahl
  // gerade steht, statt einen Sprung zu machen.
  const st = useRef({ ist: null, raf: 0 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const teile = zerlege(value);

    // Nicht animierbar (Schnittstellenname, "Unknown", noch keine Daten):
    // hinschreiben und eine laufende Schleife abraeumen.
    if (!teile) {
      cancelAnimationFrame(st.current.raf);
      st.current.ist = null;
      el.textContent = (value === null || value === undefined || value === '')
        ? fallback : String(value);
      return;
    }

    const { zahl, stellen } = teile;
    // Einheit aus dem Wert selbst ("2771 RPM") plus fest gesetzter Suffix ("°"):
    // beides gehoert IN die Zahl-Spanne, damit es beim Puls mitgeht.
    const rest = teile.rest + suffix;
    const von = st.current.ist;
    const reduziert = typeof window !== 'undefined'
      && typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Erster Wert, unveraendert, oder reduzierte Bewegung: direkt setzen.
    if (von === null || von === zahl || reduziert) {
      cancelAnimationFrame(st.current.raf);
      st.current.ist = zahl;
      el.textContent = formatiere(zahl, stellen, rest);
      return;
    }

    const kraft = pulsStaerke(von, zahl, bezug);
    if (kraft > 0) {
      el.style.setProperty('--puls', kraft.toFixed(3));
      el.style.setProperty('--nick', String(richtung(von, zahl)));
      // Neu anstossen: ohne Abraeumen + Reflow laeuft ein Puls, der noch
      // spielt, nicht wieder von vorn los — die Klasse steht ja schon.
      el.classList.remove('pulsiert');
      void el.offsetWidth;
      el.classList.add('pulsiert');
    }

    cancelAnimationFrame(st.current.raf);
    const start = performance.now();
    const schritt = (t) => {
      const p = Math.min(1, (t - start) / TWEEN_MS);
      const wert = von + (zahl - von) * easeOutCubic(p);
      st.current.ist = wert;
      // Waehrend des Laufs die Stellenzahl des ZIELS verwenden, sonst
      // aendert sich die Breite mitten in der Bewegung.
      el.textContent = formatiere(wert, stellen, rest);
      if (p < 1) {
        st.current.raf = requestAnimationFrame(schritt);
      } else {
        st.current.ist = zahl;
        el.textContent = formatiere(zahl, stellen, rest);
      }
    };
    st.current.raf = requestAnimationFrame(schritt);
  }, [value, fallback, suffix, bezug]);

  // Beim Abbauen die Schleife beenden — sonst schreibt sie in einen Knoten,
  // den es nicht mehr gibt.
  useLayoutEffect(() => {
    const s = st.current;
    return () => cancelAnimationFrame(s.raf);
  }, []);

  // Bewusst ohne Kinder — der Inhalt gehoert der Schleife oben.
  return <Wert ref={ref} {...rest} />;
};

export default AnimatedNumber;
