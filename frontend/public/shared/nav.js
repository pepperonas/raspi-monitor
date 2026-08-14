/* Smart-Home App-Switcher — gemeinsame Navigationsleiste aller App-UIs.
 *
 * Selbst-injizierend: EINE Zeile pro App genügt —
 *   <script src="/shared/icons.js" defer></script>
 *   <script src="/shared/nav.js" defer></script>
 * (icons.js ist optional — nav.js bringt die Kern-Icons selbst mit, falls
 *  SHIcons noch nicht geladen ist.)
 *
 * Die Leiste ist FIXED an der absoluten Viewport-Oberkante. Ein Spacer am
 * Body-Anfang verhindert, dass App-Inhalt darunter verdeckt wird.
 *
 * Icons: custom MD3-Expressive SVGs (kein Emoji) — currentColor, tonal.
 *
 * Quelle: smart-home-dashboard repo (shared/), deployt nach
 * raspi3:/home/pi/apps/html/shared/.
 */
(function () {
  'use strict';
  if (document.getElementById('sh-appnav')) return;

  // Minimal inline set so nav works even if icons.js isn't loaded yet.
  var FALLBACK = {
    home: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M12 3.2c.4 0 .78.15 1.08.42l7.1 6.35a1.25 1.25 0 0 1-.83 2.18H18v6.1A1.75 1.75 0 0 1 16.25 20h-2.5A1.75 1.75 0 0 1 12 18.25V14.5A1.5 1.5 0 0 0 10.5 13h-1A1.5 1.5 0 0 0 8 14.5v3.75A1.75 1.75 0 0 1 6.25 20h-2.5A1.75 1.75 0 0 1 2 18.25V12.15H1.65a1.25 1.25 0 0 1-.83-2.18l7.1-6.35A1.6 1.6 0 0 1 9 3.2h3z"/></svg>',
    hue: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M12 2.5a6.25 6.25 0 0 0-3.6 11.35c.42.3.7.72.8 1.2l.15.7h5.3l.15-.7c.1-.48.38-.9.8-1.2A6.25 6.25 0 0 0 12 2.5zm-2.1 14.55a.85.85 0 0 0-.85.85v.2c0 .9.55 1.7 1.4 2.05v.6c0 .55.45 1 1 1h1.1c.55 0 1-.45 1-1v-.6c.85-.35 1.4-1.15 1.4-2.05v-.2a.85.85 0 0 0-.85-.85H9.9z"/></svg>',
    lichtwerk: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M4.2 16.8a9.5 9.5 0 0 1 15.6 0 1.2 1.2 0 0 1-1.95 1.4 7.1 7.1 0 0 0-11.7 0 1.2 1.2 0 1 1-1.95-1.4z"/><circle cx="5.2" cy="14.2" r="1.55"/><circle cx="9.1" cy="10.6" r="1.55"/><circle cx="14.9" cy="10.6" r="1.55"/><circle cx="18.8" cy="14.2" r="1.55"/></svg>',
    disco: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true"><circle cx="12" cy="12.5" r="7.2"/><path d="M10.2 2.4h3.6c.5 0 .9.4.9.9v1.1h-5.4V3.3c0-.5.4-.9.9-.9z"/></svg>',
    db: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M3.5 17.2a1.25 1.25 0 0 1 0-2.5h2.1l3.05-5.4a1.35 1.35 0 0 1 2.35.05L13.2 13l2.55-4.4a1.35 1.35 0 0 1 2.4.1L20.5 13.2h.2a1.25 1.25 0 1 1 0 2.5H19a1.35 1.35 0 0 1-1.2-.7l-1.55-2.7-2.7 4.65a1.35 1.35 0 0 1-2.35-.05L9.1 12.1 7.1 15.7a1.35 1.35 0 0 1-1.15.7H3.5z"/></svg>',
    yamaha: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true"><rect x="3.2" y="4.2" width="17.6" height="15.6" rx="3.2"/><circle cx="7.3" cy="11.2" r="1.35"/><circle cx="12" cy="14.2" r="1.35"/><circle cx="16.7" cy="9.5" r="1.35"/></svg>',
    hifi: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true"><rect x="5" y="2.8" width="14" height="18.4" rx="3"/><circle cx="12" cy="14.2" r="4.2" fill="rgba(0,0,0,.32)"/><circle cx="12" cy="14.2" r="2.1"/><circle cx="12" cy="6.6" r="1.55"/></svg>',
    fog: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M6.2 15.2c-2.1 0-3.7-1.55-3.7-3.45S4.1 8.3 6.2 8.3c.35-2.1 2.15-3.7 4.35-3.7 1.55 0 2.95.8 3.75 2.05.55-.35 1.2-.55 1.9-.55 2 0 3.6 1.55 3.6 3.45 0 .2 0 .4-.05.6 1.55.45 2.65 1.85 2.65 3.5 0 2-1.7 3.65-3.8 3.65H6.2c-2.05 0-3.7-1.55-3.7-3.45 0-.2 0-.4.05-.6.5.2 1.05.3 1.65.3z"/></svg>',
    klima: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M10.2 3.6a1.8 1.8 0 0 1 3.6 0v8.35a3.9 3.9 0 1 1-3.6 0V3.6zm1.8 7.3a1.55 1.55 0 1 0 0 3.1 1.55 1.55 0 0 0 0-3.1z"/></svg>',
    garten: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M18.8 5.2c-4.6-.55-9.1 1.1-11.9 4.55-2.5 3.1-2.85 7.05-.95 9.35 2.05 2.45 5.85 2.15 9.15-.55 3.55-2.9 5.15-7.45 3.7-13.35z"/></svg>',
    monitor: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true"><rect x="3.5" y="12.2" width="3.6" height="7.3" rx="1.4"/><rect x="10.2" y="7.5" width="3.6" height="12" rx="1.4"/><rect x="16.9" y="4.5" width="3.6" height="15" rx="1.4"/></svg>'
  };

  function iconSvg(name) {
    if (globalThis.SHIcons && SHIcons.svg) {
      var s = SHIcons.svg(name);
      if (s) return s;
    }
    return FALLBACK[name] || '';
  }

  // `full` nur dort, wo das Badge-Wort eine Abkuerzung ist: in der Leiste zaehlt
  // Kuerze, in der Fusszeile der richtige Name.
  // Reihenfolge = Dashboard-Kartenlayout (2026-08-13): Hue|Lichtwerk ->
  // Yamaha|PowerHiFi -> dB-Verlauf -> Disco -> Klima -> Garten -> Monitor|Fog
  var APPS = [
    { href: '/',             icon: 'home',      label: 'Home',      full: 'Smart Home Dashboard' },
    { href: '/app/hue/',     icon: 'hue',       label: 'Hue' },
    { href: '/app/licht/',   icon: 'lichtwerk', label: 'Lichtwerk', full: 'Lichtwerk' },
    { href: '/app/yamaha/',  icon: 'yamaha',    label: 'Yamaha' },
    { href: '/app/hifi/',    icon: 'hifi',      label: 'PowerHiFi', full: 'Teufel Power HiFi' },
    { href: '/app/disco/stats', icon: 'db',     label: 'dB',        full: 'dB-Analyse' },
    { href: '/app/disco/',   icon: 'disco',     label: 'Disco' },
    { href: '/app/klima/',   icon: 'klima',     label: 'Klima',     full: 'Raumklima' },
    { href: '/app/garten/',  icon: 'garten',    label: 'Garten',    full: 'Gartenklima' },
    { href: '/app/wetter/',  icon: 'wetter',    label: 'Wetter',    full: 'Wetter (OpenWeather)' },
    { href: '/app/monitor/', icon: 'monitor',   label: 'Monitor',   full: 'Raspi Monitor' },
    { href: '/app/fog/',     icon: 'fog',       label: 'Fog' }
  ];

  var css = ''
    + '#sh-appnav{position:fixed;top:0;left:0;right:0;z-index:9999;display:flex;overflow-x:auto;'
    + 'scrollbar-width:none;-webkit-overflow-scrolling:touch;box-sizing:border-box;'
    + 'width:100%;margin:0;padding:14px 10px;'
    + 'padding-top:calc(14px + env(safe-area-inset-top));'
    + 'padding-left:max(10px,env(safe-area-inset-left));padding-right:max(64px,env(safe-area-inset-right));'
    + 'background:rgba(18,20,28,.88);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);'
    + 'border:0;border-bottom:1px solid rgba(255,255,255,.07);'
    + 'font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;'
    + 'font-size:13px;line-height:1;text-align:left}'
    + '#sh-appnav::-webkit-scrollbar{display:none}'
    + '#sh-appnav .sh-wrap{display:flex;gap:6px;align-items:center;flex:0 0 auto;margin:0 auto;max-width:none}'
    + '#sh-appnav a{display:flex;align-items:center;gap:6px;flex:0 0 auto;box-sizing:border-box;'
    + 'margin:0;border:0;outline:0;background:transparent;box-shadow:none;'
    + 'padding:7px 12px;border-radius:999px;text-decoration:none;white-space:nowrap;'
    + 'color:#aeb4c2;font:600 13px/1 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;'
    + 'letter-spacing:0;text-transform:none;'
    + 'transition:background .18s ease,color .18s ease,transform .18s cubic-bezier(.2,0,0,1)}'
    + '#sh-appnav a .i{display:inline-flex;align-items:center;justify-content: center;width:16px;height:16px;flex:0 0 auto;line-height:0}'
    + '#sh-appnav a .i svg{width:16px;height:16px;display:block}'
    + '@media(hover:hover){#sh-appnav a:hover{background:rgba(255,255,255,.08);color:#e8eaf2;text-decoration:none}}'
    + '#sh-appnav a:active{transform:scale(.94)}'
    + '#sh-appnav a.on{background:rgba(179,197,255,.16);color:#b3c5ff}'
    + '@media(prefers-reduced-motion:reduce){#sh-appnav a{transition:none}}'
    + '[data-theme="light"] #sh-appnav{background:rgba(246,247,252,.88);border-bottom-color:rgba(0,0,0,.08)}'
    + '[data-theme="light"] #sh-appnav a{color:#5a5f6e}'
    + '[data-theme="light"] #sh-appnav a.on{background:rgba(41,82,204,.12);color:#2952cc}'
    + '@media(hover:hover){[data-theme="light"] #sh-appnav a:hover{background:rgba(0,0,0,.06);color:#1c1f27}}'

    /* ---- Theme-Knopf -------------------------------------------------------
       Er kann KEIN Kind der Leiste sein: die scrollt horizontal, und ein
       absolut positioniertes Kind einer Scroll-Box scrollt mit. Also ein
       eigenes fixiertes Element auf gleicher Höhe, mit dem Hintergrund der
       Leiste — die Badges verschwinden dahinter statt darunter durch. Die
       Leiste bekommt rechts entsprechend Polster. */
    + '#sh-themebar{position:fixed;top:0;right:0;z-index:10000;display:flex;align-items:center;'
    + 'box-sizing:border-box;padding:0 10px 0 14px;'
    + 'padding-right:max(10px,env(safe-area-inset-right));'
    + 'padding-top:env(safe-area-inset-top);'
    + 'background:rgba(18,20,28,.88);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);'
    + 'border-bottom:1px solid rgba(255,255,255,.07);'
    + '-webkit-mask-image:linear-gradient(to right,transparent 0,#000 14px);'
    + 'mask-image:linear-gradient(to right,transparent 0,#000 14px)}'
    + '[data-theme="light"] #sh-themebar{background:rgba(246,247,252,.88);border-bottom-color:rgba(0,0,0,.08)}'
    /* Bauform wie in shared/theme.css .sh-theme-btn, nur 44 statt 40 px —
       das ist zugleich die kleinste Trefferfläche, die der Kanon zulässt. */
    + '#sh-themebtn{display:inline-flex;align-items:center;justify-content:center;'
    + 'width:44px;height:44px;padding:0;flex:0 0 auto;'
    + 'border:1px solid #44464f;border-radius:999px;'
    + 'background:rgba(255,255,255,.04);color:#c5c6d0;cursor:pointer;'
    + 'font-size:19px;line-height:0;-webkit-tap-highlight-color:transparent;'
    + 'transition:background .22s cubic-bezier(.2,0,0,1),color .22s cubic-bezier(.2,0,0,1),transform .22s cubic-bezier(.2,0,0,1)}'
    + '[data-theme="light"] #sh-themebtn{border-color:#c9ccd6;background:rgba(0,0,0,.04);color:#4a4d57}'
    + '@media(hover:hover){#sh-themebtn:hover{background:rgba(255,255,255,.1);color:#e8eaf2}'
    + '[data-theme="light"] #sh-themebtn:hover{background:rgba(0,0,0,.08);color:#1c1f27}}'
    + '#sh-themebtn svg{width:19px;height:19px;display:block}'
    + '#sh-themebtn:active{transform:scale(.93)}'
    + '#sh-themebtn:focus-visible{outline:2px solid #b3c5ff;outline-offset:3px}'
    + '@media(prefers-reduced-motion:reduce){#sh-themebtn{transition:none}}'

    /* ---- Fusszeile ---------------------------------------------------------
       Sechs Apps hatten eine, fuenf keine, und die sechs unterschieden sich in
       Schriftgroesse (12/14/16 px), Farbe, Polster und Rahmen. Jetzt eine
       Fassung an einem Ort. Masse in px, wie die ganze Leiste: rem skaliert je
       App-Wurzelgroesse unterschiedlich. */
    + '#sh-footer{box-sizing:border-box;width:100%;max-width:1200px;margin:56px auto 0;'
    + 'padding:24px 0;border-top:1px solid #2b2d35;'
    + 'color:#8e9099;font:400 12px/1.6 "Roboto Flex",Roboto,system-ui,-apple-system,sans-serif;'
    + 'text-align:center}'
    + '#sh-footer .sep{opacity:.45;margin:0 6px}'
    + '#sh-footer a{color:inherit;text-decoration:none;border-bottom:1px solid #44464f;'
    + 'padding-bottom:1px;transition:color .18s ease,border-color .18s ease}'
    + '@media(hover:hover){#sh-footer a:hover{color:#b3c5ff;border-bottom-color:#b3c5ff}}'
    + '#sh-footer a:focus-visible{outline:2px solid #b3c5ff;outline-offset:3px;border-radius:2px}'
    /* Auf schmalen Breiten bricht die Zeile an den Trennern statt mitten im
       Namen — die Teile bleiben so als Einheiten lesbar. */
    + '#sh-footer .part{display:inline-block;white-space:nowrap}'
    + '[data-theme="light"] #sh-footer{border-top-color:#d7dae2;color:#6d7079}'
    + '[data-theme="light"] #sh-footer a{border-bottom-color:#c9ccd6}'
    + '@media(hover:hover){[data-theme="light"] #sh-footer a:hover{color:#2f5bd0;border-bottom-color:#2f5bd0}}'
    + '@media(max-width:520px){#sh-footer{margin-top:40px;padding:20px 0}'
    + '#sh-footer .sep{margin:0 4px}}'

    + '@view-transition{navigation:auto}'
    + '#sh-appnav{view-transition-name:sh-appnav}'
    /* Während des Kreis-Reveals müssen Leiste und Knopf ihre eigenen
       Übergangsnamen abgeben, sonst laufen sie am Reveal vorbei statt mit. */
    + 'html.sh-theme-anim #sh-appnav{view-transition-name:none}'
    + '@media(prefers-reduced-motion:reduce){::view-transition-group(*),::view-transition-old(*),::view-transition-new(*){animation:none!important}}';

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var nav = document.createElement('nav');
  nav.id = 'sh-appnav';
  nav.setAttribute('aria-label', 'Smart-Home-Apps');
  var wrap = document.createElement('div');
  wrap.className = 'sh-wrap';
  nav.appendChild(wrap);

  var onDirectMon = location.port === '4999';
  var dashBase = 'https://home.celox.io:8443';
  var here = location.pathname;
  var bestIdx = -1, bestLen = -1;
  if (!onDirectMon) {
    APPS.forEach(function (app, idx) {
      var active = app.href === '/'
        ? (here === '/' || here === '/index.html')
        : (here.indexOf(app.href) === 0);
      if (active && app.href.length > bestLen) {
        bestLen = app.href.length;
        bestIdx = idx;
      }
    });
  }
  APPS.forEach(function (app, idx) {
    var a = document.createElement('a');
    var isMon = app.href === '/app/monitor/';
    if (onDirectMon && isMon) {
      a.href = location.origin + '/';
      a.className = 'on';
    } else if (onDirectMon) {
      a.href = dashBase + (app.href === '/' ? '/' : app.href);
    } else {
      a.href = app.href;
      if (idx === bestIdx) a.className = 'on';
    }
    var i = document.createElement('span');
    i.className = 'i';
    i.setAttribute('aria-hidden', 'true');
    i.setAttribute('data-icon', app.icon);
    // Prefer SVG icons; keep data-icon for tests / a11y tooling.
    var svg = iconSvg(app.icon);
    if (svg) {
      i.innerHTML = svg;
    } else {
      i.textContent = app.icon;
    }
    var l = document.createElement('span'); l.textContent = app.label;
    a.appendChild(i); a.appendChild(l);
    wrap.appendChild(a);
  });

  /* ---- Theme: eine Implementierung für den ganzen Stack --------------------
     Vorher hatte jede App ihre eigene — eigener localStorage-Schlüssel, eigene
     Animation, eigene Bauform. Weil alle Apps auf derselben Herkunft liegen,
     bringt ein gemeinsamer Schlüssel nebenbei das mit, was vorher fehlte: die
     Wahl gilt beim App-Wechsel weiter, statt zurückzuspringen. */
  var THEME_KEY = 'sh-theme';
  var ALT_KEYS = ['dash-theme', 'theme'];   // was die Apps vorher benutzten

  /* Nicht jede App hat ein helles Theme. Der Disco-Visualizer steht bewusst auf
     fester dunkler Basis (Kontrast zum Farbspiel) und laedt shared/theme.css
     gar nicht. Dort einen Umschalter anzubieten hiess: die Leiste wird hell,
     die Seite bleibt dunkel — eine weisse Leiste ueber einem dunklen Bild.
     Geprueft wird die Bedingung selbst (loesen die geteilten Tokens auf?),
     nicht ein Stellvertreter wie ein Dateiname. */
  function hatHellesTheme() {
    try {
      return !!getComputedStyle(document.documentElement)
        .getPropertyValue('--sh-bg').trim();
    } catch (e) { return false; }
  }

  function readTheme() {
    try {
      var t = localStorage.getItem(THEME_KEY);
      if (t === 'light' || t === 'dark') return t;
      for (var i = 0; i < ALT_KEYS.length; i++) {          // einmalige Übernahme
        var o = localStorage.getItem(ALT_KEYS[i]);
        if (o === 'light' || o === 'dark') { localStorage.setItem(THEME_KEY, o); return o; }
      }
    } catch (e) {}
    return document.documentElement.getAttribute('data-theme') || 'dark';
  }

  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem(THEME_KEY, t); } catch (e) {}
    // Für Oberflächen, die kein Stylesheet lesen (der Monitor hält sein Theme
    // in React-State) — die hängen sich hier ein statt data-theme zu beobachten.
    try { window.dispatchEvent(new CustomEvent('sh-theme', { detail: { theme: t } })); } catch (e) {}
    var b = document.getElementById('sh-themebtn');
    if (b) {
      // Aus demselben Set wie die Leisten-Icons. Ein Emoji hier waere das
      // einzige im ganzen Balken — und saehe je Plattform anders aus.
      var g = iconSvg(t === 'light' ? 'sun' : 'moon');
      if (g) b.innerHTML = g; else b.textContent = t === 'light' ? '\u2600' : '\u263E';
      b.setAttribute('aria-pressed', t === 'light' ? 'true' : 'false');
    }
  }

  function toggleTheme(btn) {
    var next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    var reduced = false;
    try { reduced = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
    if (!document.startViewTransition || reduced) { applyTheme(next); return; }

    // Kreis-Reveal aus der Knopfmitte bis zur entferntesten Viewport-Ecke.
    var r = btn.getBoundingClientRect();
    var x = r.left + r.width / 2, y = r.top + r.height / 2;
    var end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    document.documentElement.classList.add('sh-theme-anim');
    var vt = document.startViewTransition(function () { applyTheme(next); });
    vt.ready.then(function () {
      document.documentElement.animate(
        { clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)',
                     'circle(' + end + 'px at ' + x + 'px ' + y + 'px)'] },
        // Literales Easing: die Web Animations API nimmt KEINE CSS-Variable.
        { duration: 1150, easing: 'cubic-bezier(.2,0,0,1)',
          pseudoElement: '::view-transition-new(root)' }
      );
    }).catch(function () {});
    vt.finished.finally(function () {
      document.documentElement.classList.remove('sh-theme-anim');
    });
  }

  /* Der Disco-Visualizer bekommt keine: er ist bildschirmfuellend, der body
     hat `overflow:hidden`, es gibt dort schlicht keinen Seitenfuss. Die
     dB-Analyse unter /app/disco/stats ist eine normale Seite und bekommt eine. */
  function willFooter() {
    return !/^\/app\/disco\/?$/.test(location.pathname);
  }

  function buildFooter() {
    if (document.getElementById('sh-footer')) return null;
    var f = document.createElement('footer');
    f.id = 'sh-footer';

    var app = bestIdx >= 0 ? APPS[bestIdx] : null;
    var name = app ? (app.full || app.label) : document.title;
    var teile = [
      name,
      location.hostname,
      '\u00a9 ' + new Date().getFullYear() + ' Martin Pfeffer'
    ];
    var html = teile.map(function (t) {
      return '<span class="part">' + escapeHtml(t) + '</span>';
    }).join('<span class="sep" aria-hidden="true">\u00b7</span>');
    html += '<span class="sep" aria-hidden="true">\u00b7</span>'
          + '<span class="part"><a href="https://celox.io" target="_blank" rel="noopener">celox.io</a></span>';
    f.innerHTML = html;
    return f;
  }

  function escapeHtml(t) {
    return String(t).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function mount() {
    if (!document.body) return;
    document.body.appendChild(nav);

    var themebar = null;
    if (hatHellesTheme()) {
      themebar = document.createElement('div');
      themebar.id = 'sh-themebar';
      var btn = document.createElement('button');
      btn.id = 'sh-themebtn';
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Helles oder dunkles Design');
      btn.addEventListener('click', function () { toggleTheme(btn); });
      themebar.appendChild(btn);
      document.body.appendChild(themebar);
      themebar.style.height = nav.offsetHeight + 'px';
      applyTheme(readTheme());
    } else {
      // Ohne helles Theme darf auch der gespeicherte Wert nicht greifen: sonst
      // faerbt eine anderswo getroffene Wahl hier NUR die Leiste ein.
      document.documentElement.setAttribute('data-theme', 'dark');
      // Das rechte Polster bleibt reserviert, obwohl hier kein Knopf steht:
      // die Badge-Reihe zentriert sich im verbleibenden Raum, und ohne die
      // Reservierung spränge sie beim App-Wechsel um die halbe Knopfbreite.
      // Ein leerer Streifen faellt nicht auf, ein Sprung schon.
    }
    // Damit Apps ihren Inhalt unter der Leiste ausrichten koennen, ohne sie
    // selbst nachzumessen (der Disco-Canvas braucht das, der Monitor auch).
    document.documentElement.style.setProperty('--sh-nav-h', nav.offsetHeight + 'px');

    if (willFooter()) {
      var ft = buildFooter();
      if (ft) {
        document.body.appendChild(ft);
        // Der body bringt aus shared/theme.css ein Unterpolster mit (56 px),
        // damit Inhalt nicht bündig am Fensterrand endet. Mit einer Fusszeile
        // IST sie das Seitenende und bringt ihren Platz selbst mit — beides
        // zusammen ergab 84 px unter dem Text gegen 19 px darueber, der Satz
        // sass also sichtbar zu hoch in seinem Feld.
        document.body.style.paddingBottom = '0';
      }
    }
    // Spacer in Leistenhöhe an den Body-Anfang, damit kein Inhalt unter der
    // fixed Bar verschwindet (Höhe nachgemessen, nicht hart kodiert).
    var spacer = document.createElement('div');
    spacer.id = 'sh-appnav-spacer';
    spacer.style.cssText = 'height:' + nav.offsetHeight + 'px;margin:0;padding:0;border:0';
    document.body.insertBefore(spacer, document.body.firstChild);
    window.addEventListener('resize', function () {
      spacer.style.height = nav.offsetHeight + 'px';
      if (themebar) themebar.style.height = nav.offsetHeight + 'px';
      document.documentElement.style.setProperty('--sh-nav-h', nav.offsetHeight + 'px');
    });
    var on = nav.querySelector('a.on');
    if (on) nav.scrollLeft = Math.max(0, on.offsetLeft - (nav.clientWidth - on.offsetWidth) / 2);
  }
  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
