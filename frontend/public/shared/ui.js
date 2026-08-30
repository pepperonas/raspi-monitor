/* Ripple der Suite — die EINE Implementierung (vorher hatten 4 von 12 Apps je
   eine eigene). Delegiert, passiv, reduced-motion-still; Ziel-Elemente
   brauchen kein overflow:hidden — die .sh-ripple-box (ui.css) kapselt den
   Kreis mit border-radius:inherit. Opt-out per data-no-ripple am Element
   oder einem Vorfahren. Muster wie nav.js: selbst-initialisierend, idempotent. */
(function () {
  'use strict';
  var root = document.documentElement;
  if (root.hasAttribute('data-sh-ui')) return;   // Doppel-Einbindung: no-op
  root.setAttribute('data-sh-ui', '1');

  var reduce = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;

  document.addEventListener('pointerdown', function (e) {
    if (reduce && reduce.matches) return;
    var t = e.target;
    if (!t || !t.closest) return;
    var el = t.closest('.sh-btn, .sh-icon-btn, .sh-pill');
    if (!el || el.closest('[data-no-ripple]') || el.disabled) return;

    var box = el.querySelector(':scope > .sh-ripple-box');
    if (!box) {
      box = document.createElement('span');
      box.className = 'sh-ripple-box';
      box.setAttribute('aria-hidden', 'true');
      el.appendChild(box);
    }
    var r = el.getBoundingClientRect();
    var d = Math.max(r.width, r.height) * 2;
    var s = document.createElement('span');
    s.className = 'sh-ripple';
    s.style.width = s.style.height = d + 'px';
    s.style.left = (e.clientX - r.left - d / 2) + 'px';
    s.style.top  = (e.clientY - r.top  - d / 2) + 'px';
    box.appendChild(s);
    var weg = function () { if (s.parentNode) s.parentNode.removeChild(s); };
    s.addEventListener('animationend', weg, { once: true });
    // Fallback: display:none-Wechsel o. ae. verschlucken animationend.
    setTimeout(weg, 900);
  }, { passive: true });
})();
