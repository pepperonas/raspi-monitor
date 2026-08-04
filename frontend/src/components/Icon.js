import React from 'react';

/**
 * Inline SVG icons, Material 3 Expressive.
 *
 * These replace the emoji the UI used to render. Emoji were never really icons
 * here: they carry the platform's own drawing style (which differs on every OS),
 * they ignore the theme because the colour is baked into the font, and a
 * screen reader announces them by their Unicode name — "high voltage" in front
 * of "Tasks".
 *
 * Most glyphs are lifted verbatim from the shared 84-icon set the other raspi5
 * apps use (smart-home-dashboard `shared/icons.js`), so the monitor now draws
 * from the same hand as its siblings and its own favicon. They are copied rather
 * than imported: the Pi 5 monitor is opened directly on :4999, where the
 * dashboard's `/shared/` path does not exist, and the production build talks
 * same-origin by design.
 *
 * Seven motifs had no counterpart in that set — menu, cpu, gpu, fan, memory,
 * processes, trend — and are drawn here to the same rules:
 *
 *   grid          24×24, artwork inside a ~20px optical square
 *   weight        solid shapes; where a line is needed, stroke-width 1.8–2.2
 *                 with round caps and joins
 *   colour        `currentColor` only. Never a fixed hex — the callers set the
 *                 colour (theme text, threshold green/amber/red) and the icon
 *                 has to follow.
 *   interiors     real holes via `fill-rule="evenodd"`, never a dark overlay.
 *                 The shared set punches its detail with rgba(0,0,0,.35), which
 *                 only reads while the icon itself is light. This app has a light
 *                 theme where the icon is near-black, and there Disk, Memory, CPU
 *                 and System rendered as solid blobs. A hole works at any colour
 *                 on any surface. Where the detail is a stroke and so cannot be a
 *                 hole (check, warning, globe) the whole glyph is outlined instead.
 *   size          1em, so an icon is exactly as tall as the text it sits in and
 *                 the existing `font-size` rules keep working untouched.
 */

const GLYPHS = {
  // ---- verbatim from shared/icons.js -------------------------------------
  heart: '<path d="M12 19.4s-7.4-4.35-9.1-8.55C1.5 7.55 3.4 4.6 6.55 4.6c1.75 0 3.2.95 4.05 2.3l1.4 2.2 1.4-2.2c.85-1.35 2.3-2.3 4.05-2.3 3.15 0 5.05 2.95 3.65 6.25C19.4 15.05 12 19.4 12 19.4z"/>',
  sun: '<circle cx="12" cy="12" r="4.1"/><g stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 2.6v2.6M12 18.8v2.6M2.6 12h2.6M18.8 12h2.6M5.4 5.4l1.85 1.85M16.75 16.75l1.85 1.85M18.6 5.4l-1.85 1.85M7.25 16.75L5.4 18.6"/></g>',
  moon: '<path d="M19.4 14.55A8.2 8.2 0 0 1 9.45 4.6a.95.95 0 0 0-1.2-1.15A9.7 9.7 0 1 0 20.55 15.75a.95.95 0 0 0-1.15-1.2z"/>',
  bars: '<rect x="3.5" y="12.2" width="3.6" height="7.3" rx="1.4"/><rect x="10.2" y="7.5" width="3.6" height="12" rx="1.4"/><rect x="16.9" y="4.5" width="3.6" height="15" rx="1.4"/>',
  wave: '<path d="M2.8 12c1.6-3.2 3.2-4.8 4.8-4.8S10.8 8.8 12 12s3.2 4.8 4.8 4.8S20.4 15.2 22 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  siren: '<path d="M5.4 17.4a6.6 6.6 0 0 1 13.2 0z"/><rect x="3.6" y="17.4" width="16.8" height="2.9" rx="1.45"/><g stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M12 2.6v2.3M5.1 5.5l1.6 1.6M18.9 5.5l-1.6 1.6"/></g>',
  bolt: '<path d="M13.6 2.4a.7.7 0 0 1 1.24.62L13.1 9.4h4.05a.9.9 0 0 1 .7 1.46l-7.5 9.4a.7.7 0 0 1-1.24-.6L10.85 13H6.8a.9.9 0 0 1-.7-1.46z"/>',
  gear: '<path fill-rule="evenodd" d="M10.4 2.6h3.2l.35 2.15c.5.17.97.4 1.4.7l2-.85 1.6 2.77-1.65 1.4c.05.27.08.55.08.83s-.03.56-.08.83l1.65 1.4-1.6 2.77-2-.85c-.43.3-.9.53-1.4.7L13.6 21.4h-3.2l-.35-2.15c-.5-.17-.97-.4-1.4-.7l-2 .85-1.6-2.77 1.65-1.4a5.4 5.4 0 0 1 0-1.66l-1.65-1.4 1.6-2.77 2 .85c.43-.3.9-.53 1.4-.7zM12 9.1a2.9 2.9 0 1 0 0 5.8 2.9 2.9 0 0 0 0-5.8z"/>',
  sliders: '<path d="M4 7.5h16M4 12h16M4 16.5h16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity=".35"/><circle cx="8" cy="7.5" r="2.2"/><circle cx="15" cy="12" r="2.2"/><circle cx="10.5" cy="16.5" r="2.2"/>',
  flame: '<path fill-rule="evenodd" d="M12 2.6c3.1 3.4 5.9 5.9 5.9 9.6a5.9 5.9 0 1 1-11.8 0c0-1.9.8-3.4 1.9-4.8.4 1.1 1.1 1.9 2.1 2.2-.5-2.6.2-5.1 1.9-7zm0 10.4c-1.3 1.3-2.1 2.2-2.1 3.4a2.1 2.1 0 1 0 4.2 0c0-1.2-.8-2.1-2.1-3.4z"/>',
  check: '<circle cx="12" cy="12" r="9.05" fill="none" stroke="currentColor" stroke-width="1.9"/><path d="M7.7 12.3l2.85 2.85 5.75-6.05" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
  warning: '<path d="M12 3.7c.65 0 1.26.34 1.6.89l7.3 12.06a1.87 1.87 0 0 1-1.6 2.85H4.7a1.87 1.87 0 0 1-1.6-2.85l7.3-12.06c.34-.55.95-.89 1.6-.89z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/><rect x="11.05" y="8.6" width="1.9" height="5.3" rx=".95"/><circle cx="12" cy="16.35" r="1.15"/>',
  thermo: '<path d="M10.2 3.6a1.8 1.8 0 0 1 3.6 0v8.35a3.9 3.9 0 1 1-3.6 0V3.6zm1.8 7.3a1.55 1.55 0 1 0 0 3.1 1.55 1.55 0 0 0 0-3.1z"/><path d="M15.4 5.6h3.2M15.4 8.6h2.2M15.4 11.6h3.2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity=".45"/>',
  globe: '<circle cx="12" cy="12" r="8.85" fill="none" stroke="currentColor" stroke-width="1.9"/><path d="M3.3 12h17.4M12 3.15c2.4 2.45 3.6 5.4 3.6 8.85S14.4 18.4 12 20.85C9.6 18.4 8.4 15.45 8.4 12S9.6 5.6 12 3.15z" fill="none" stroke="currentColor" stroke-width="1.6"/>',
  save: '<path fill-rule="evenodd" d="M5.4 3.6h10.2L20.4 8.4v11.1a1.9 1.9 0 0 1-1.9 1.9H5.4a1.9 1.9 0 0 1-1.9-1.9V5.5a1.9 1.9 0 0 1 1.9-1.9zM8.2 4.6h6.2v4.2H8.2zM7.6 13h8.8v5.4H7.6z"/>',

  // ---- drawn here; no counterpart in the shared set -----------------------
  menu: '<rect x="3.2" y="5.9" width="17.6" height="2.4" rx="1.2"/><rect x="3.2" y="10.8" width="17.6" height="2.4" rx="1.2"/><rect x="3.2" y="15.7" width="17.6" height="2.4" rx="1.2"/>',
  cpu: '<path fill-rule="evenodd" d="M8.8 6.4h6.4a2.4 2.4 0 0 1 2.4 2.4v6.4a2.4 2.4 0 0 1-2.4 2.4H8.8a2.4 2.4 0 0 1-2.4-2.4V8.8a2.4 2.4 0 0 1 2.4-2.4zm.7 3.1v5h5v-5z"/><g stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M9.2 3.3v2.4M12 3.3v2.4M14.8 3.3v2.4M9.2 18.3v2.4M12 18.3v2.4M14.8 18.3v2.4M3.3 9.2h2.4M3.3 12h2.4M3.3 14.8h2.4M18.3 9.2h2.4M18.3 12h2.4M18.3 14.8h2.4"/></g>',
  // A board rather than a bare die, so it never reads as a second CPU.
  gpu: '<path fill-rule="evenodd" d="M3 6.6h18a2 2 0 0 1 2 2v6.8a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8.6a2 2 0 0 1 2-2zm2.9 2.7v5.4h5.4V9.3zm8.8.1v1.9h5.1V9.4zm0 3.3v1.9h5.1v-1.9z"/>',
  fan: '<path d="M11.5 10.9c-1.5-2.2-2-4.5-1.1-6.4.75-1.6 2.9-1.75 3.9-.3 1.2 1.75 1.05 4.3-.55 6.9z"/><path d="M11.5 10.9c-1.5-2.2-2-4.5-1.1-6.4.75-1.6 2.9-1.75 3.9-.3 1.2 1.75 1.05 4.3-.55 6.9z" transform="rotate(120 12 12)"/><path d="M11.5 10.9c-1.5-2.2-2-4.5-1.1-6.4.75-1.6 2.9-1.75 3.9-.3 1.2 1.75 1.05 4.3-.55 6.9z" transform="rotate(240 12 12)"/><circle cx="12" cy="12" r="2.5"/>',
  memory: '<path fill-rule="evenodd" d="M2.9 7.1h18.2a1.5 1.5 0 0 1 1.5 1.5v5.3a1.5 1.5 0 0 1-1.5 1.5H2.9a1.5 1.5 0 0 1-1.5-1.5V8.6a1.5 1.5 0 0 1 1.5-1.5zm1.5 2.3v3.6h3.4V9.4zm5.9 0v3.6h3.4V9.4zm5.9 0v3.6h3.4V9.4z"/><g stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M5.6 15.4v2.1M12 15.4v2.1M18.4 15.4v2.1"/></g>',
  // A stack that runs off the bottom edge — there are always more processes
  // than fit, which is exactly what the number beside it says.
  processes: '<path fill-rule="evenodd" d="M5.1 4.6h13.8a1.8 1.8 0 0 1 1.8 1.8v1.1a1.8 1.8 0 0 1-1.8 1.8H5.1a1.8 1.8 0 0 1-1.8-1.8V6.4a1.8 1.8 0 0 1 1.8-1.8zm1.6 1.3a1.05 1.05 0 1 0 0 2.1 1.05 1.05 0 0 0 0-2.1z"/><path fill-rule="evenodd" d="M5.1 10.6h13.8a1.8 1.8 0 0 1 1.8 1.8v1.1a1.8 1.8 0 0 1-1.8 1.8H5.1a1.8 1.8 0 0 1-1.8-1.8v-1.1a1.8 1.8 0 0 1 1.8-1.8zm1.6 1.3a1.05 1.05 0 1 0 0 2.1 1.05 1.05 0 0 0 0-2.1z"/><rect x="3.3" y="16.6" width="17.4" height="3.1" rx="1.5"/>',
  trend: '<path d="M3.4 16.9l4.9-4.9 3.4 3.4 6.6-6.6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M14.2 8.2h4.6v4.6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
};

/**
 * @param name   key in GLYPHS
 * @param title  accessible name. Omit when adjacent text already says it —
 *               then the icon is hidden from assistive tech rather than read
 *               out twice, which is what the emoji used to do.
 */
const Icon = ({ name, title, className, style }) => {
  const d = GLYPHS[name];
  if (!d) return null;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="currentColor"
      className={className}
      // Sits an icon on the text baseline the way an emoji did, so swapping one
      // for the other does not shift a single line.
      style={{ verticalAlign: '-0.145em', flexShrink: 0, ...style }}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : 'true'}
      focusable="false"
    >
      {/* Rendered as a real child, never interpolated into the markup string:
          the glyph below is a module constant, but `title` comes from a caller
          and has no business being parsed as HTML. */}
      {title ? <title>{title}</title> : null}
      <g dangerouslySetInnerHTML={{ __html: d }} />
    </svg>
  );
};

export default Icon;
