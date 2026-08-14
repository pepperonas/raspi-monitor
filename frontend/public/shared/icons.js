/* Smart-Home MD3 Expressive icon set — custom SVG, currentColor.
 * Usage:
 *   <span data-sh-icon="hue" class="card-icon"></span>
 *   SHIcons.html('hue') / SHIcons.hydrate(root)
 * Source: smart-home-dashboard/shared/icons.js → html/shared/
 */
(function (global) {
  'use strict';
  var ICONS = {
    'alert': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M7.2 10.5V9a4.8 4.8 0 0 1 9.6 0v1.5h1.3A1.7 1.7 0 0 1 19.8 12.2v5.6A1.7 1.7 0 0 1 18.1 19.5H5.9A1.7 1.7 0 0 1 4.2 17.8v-5.6A1.7 1.7 0 0 1 5.9 10.5h1.3z"/><path d="M9.2 6.2l-1.6-2.2M14.8 6.2l1.6-2.2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" opacity=".7"/></svg>',
    'auto': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><rect x="5.5" y="7.5" width="13" height="11" rx="3"/><circle cx="9.2" cy="12.5" r="1.4"/><circle cx="14.8" cy="12.5" r="1.4"/><path d="M9.5 4.8h5v2.7h-5z" opacity=".85"/><path d="M8 18.5v1.7M16 18.5v1.7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    'bass': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3.2"/><path d="M12 3.8v2.4M12 17.8v2.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    'brightness': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="5.2" opacity=".35"/><circle cx="12" cy="12" r="3.1"/><path d="M12 3.2v1.6M12 19.2v1.6M3.2 12h1.6M19.2 12h1.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" fill="none"/></svg>',
    'bulb': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M12 2.5a6.25 6.25 0 0 0-3.6 11.35c.42.3.7.72.8 1.2l.15.7h5.3l.15-.7c.1-.48.38-.9.8-1.2A6.25 6.25 0 0 0 12 2.5zm-2.1 14.55a.85.85 0 0 0-.85.85v.2c0 .9.55 1.7 1.4 2.05v.6c0 .55.45 1 1 1h1.1c.55 0 1-.45 1-1v-.6c.85-.35 1.4-1.15 1.4-2.05v-.2a.85.85 0 0 0-.85-.85H9.9z"/><circle cx="12" cy="9.2" r="2.2" opacity=".35"/></svg>',
    'chart': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><rect x="3.5" y="12.2" width="3.6" height="7.3" rx="1.4"/><rect x="10.2" y="7.5" width="3.6" height="12" rx="1.4"/><rect x="16.9" y="4.5" width="3.6" height="15" rx="1.4"/></svg>',
    'check': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/><path d="M7.6 12.2l2.7 2.7 6.1-6.1" fill="none" stroke="rgba(0,0,0,.4)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    'close': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M6.4 6.4l11.2 11.2M17.6 6.4L6.4 17.6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    'db': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M3.5 17.2a1.25 1.25 0 0 1 0-2.5h2.1l3.05-5.4a1.35 1.35 0 0 1 2.35.05L13.2 13l2.55-4.4a1.35 1.35 0 0 1 2.4.1L20.5 13.2h.2a1.25 1.25 0 1 1 0 2.5H19a1.35 1.35 0 0 1-1.2-.7l-1.55-2.7-2.7 4.65a1.35 1.35 0 0 1-2.35-.05L9.1 12.1 7.1 15.7a1.35 1.35 0 0 1-1.15.7H3.5z"/></svg>',
    'disco': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><circle cx="12" cy="12.5" r="7.2"/><path fill="none" stroke="rgba(0,0,0,.28)" stroke-width="1.1" d="M5.2 10.2h13.6M5.2 14.8h13.6M8.4 5.8v13.4M15.6 5.8v13.4"/><path opacity=".4" d="M12 5.3a7.2 7.2 0 0 1 5.8 3.1H12z"/><path d="M10.2 2.4h3.6c.5 0 .9.4.9.9v1.1h-5.4V3.3c0-.5.4-.9.9-.9z"/></svg>',
    'droplet': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M12 3.2c2.8 3.4 6.4 7.1 6.4 10.4A6.4 6.4 0 0 1 5.6 13.6C5.6 10.3 9.2 6.6 12 3.2z"/></svg>',
    'external': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M10 5.2H6.8A2.6 2.6 0 0 0 4.2 7.8v9.4A2.6 2.6 0 0 0 6.8 19.8h9.4a2.6 2.6 0 0 0 2.6-2.6V14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M13.5 4.5H19.5V10.5M19.2 4.8l-8.2 8.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    'heart': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M12 19.4s-7.4-4.35-9.1-8.55C1.5 7.55 3.4 4.6 6.55 4.6c1.75 0 3.2.95 4.05 2.35C11.45 5.55 12.9 4.6 14.65 4.6c3.15 0 5.05 2.95 3.65 6.25C19.4 15.05 12 19.4 12 19.4z"/></svg>',
    'home': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M12 3.2c.4 0 .78.15 1.08.42l7.1 6.35a1.25 1.25 0 0 1-.83 2.18H18v6.1A1.75 1.75 0 0 1 16.25 20h-2.5A1.75 1.75 0 0 1 12 18.25V14.5h0A1.5 1.5 0 0 0 10.5 13h-1A1.5 1.5 0 0 0 8 14.5v3.75A1.75 1.75 0 0 1 6.25 20h-2.5A1.75 1.75 0 0 1 2 18.25V12.15H1.65a1.25 1.25 0 0 1-.83-2.18l7.1-6.35A1.6 1.6 0 0 1 9 3.2h3z"/></svg>',
    'leaf': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M18.8 5.2c-4.6-.55-9.1 1.1-11.9 4.55-2.5 3.1-2.85 7.05-.95 9.35 2.05 2.45 5.85 2.15 9.15-.55 3.55-2.9 5.15-7.45 3.7-13.35z"/><path d="M8.2 18.4c2.4-2.55 5.5-5.05 9.4-6.85" fill="none" stroke="rgba(0,0,0,.3)" stroke-width="1.5" stroke-linecap="round"/></svg>',
    'lichtwerk': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M4.2 16.8a9.5 9.5 0 0 1 15.6 0 1.2 1.2 0 0 1-1.95 1.4 7.1 7.1 0 0 0-11.7 0 1.2 1.2 0 1 1-1.95-1.4z"/><circle cx="5.2" cy="14.2" r="1.55"/><circle cx="9.1" cy="10.6" r="1.55"/><circle cx="14.9" cy="10.6" r="1.55"/><circle cx="18.8" cy="14.2" r="1.55"/><circle cx="12" cy="9.2" r="1.7" opacity=".45"/></svg>',
    'matrix': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><rect x="3.5" y="3.5" width="17" height="17" rx="3"/><g fill="rgba(0,0,0,.4)"><circle cx="8" cy="8" r="1.2"/><circle cx="12" cy="8" r="1.2"/><circle cx="16" cy="8" r="1.2"/><circle cx="8" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="16" cy="12" r="1.2"/><circle cx="8" cy="16" r="1.2"/><circle cx="12" cy="16" r="1.2"/><circle cx="16" cy="16" r="1.2"/></g></svg>',
    'mist': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M6.2 15.2c-2.1 0-3.7-1.55-3.7-3.45S4.1 8.3 6.2 8.3c.35-2.1 2.15-3.7 4.35-3.7 1.55 0 2.95.8 3.75 2.05.55-.35 1.2-.55 1.9-.55 2 0 3.6 1.55 3.6 3.45 0 .2 0 .4-.05.6 1.55.45 2.65 1.85 2.65 3.5 0 2-1.7 3.65-3.8 3.65H6.2c-2.05 0-3.7-1.55-3.7-3.45 0-.2 0-.4.05-.6.5.2 1.05.3 1.65.3z" opacity=".92"/><path d="M4.5 19.2c1.2-.9 2.7-1.4 4.3-1.4h7.6c1.35 0 2.6.35 3.7.95" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" opacity=".45"/></svg>',
    'moon': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M19.4 14.55A8.2 8.2 0 0 1 9.45 4.6a.95.95 0 0 0-1.2-1.15A9.7 9.7 0 1 0 20.55 15.75a.95.95 0 0 0-1.15-1.2z"/></svg>',
    'music': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M9.2 16.7V6.35c0-.85.55-1.6 1.35-1.85l7.4-2.2A1.55 1.55 0 0 1 20 3.8v9.55a3.35 3.35 0 1 1-2.3-3.15V6.55l-6.3 1.85v8.3a3.35 3.35 0 1 1-2.2-.99z"/></svg>',
    'mute': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M4.2 9.2h2.55l4.1-3.55c.85-.74 2.15-.14 2.15.97v11.76c0 1.11-1.3 1.71-2.15.97L6.75 15.8H4.2A1.7 1.7 0 0 1 2.5 14.1v-3.2A1.7 1.7 0 0 1 4.2 9.2z"/><path d="M16.2 9.4l5.2 5.2M21.4 9.4l-5.2 5.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    'note': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><rect x="5" y="3.5" width="14" height="17" rx="2.5"/><path d="M8.2 8.2h7.6M8.2 12h7.6M8.2 15.8h5.2" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="1.6" stroke-linecap="round"/></svg>',
    'pause': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><rect x="6.2" y="4.5" width="4" height="15" rx="1.6"/><rect x="13.8" y="4.5" width="4" height="15" rx="1.6"/></svg>',
    'play': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M8.2 5.4c0-1.1 1.2-1.75 2.15-1.15l9.1 5.85c.9.58.9 1.92 0 2.5l-9.1 5.85c-.95.6-2.15-.05-2.15-1.15V5.4z"/></svg>',
    'power': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M12 3.2a1.25 1.25 0 0 1 1.25 1.25v7.1a1.25 1.25 0 1 1-2.5 0V4.45A1.25 1.25 0 0 1 12 3.2z"/><path d="M7.35 6.4a1.2 1.2 0 0 1-.15 1.7 5.7 5.7 0 1 0 9.6 0 1.2 1.2 0 1 1 1.55-1.84 8.1 8.1 0 1 1-12.7 0 1.2 1.2 0 0 1 1.7.14z"/></svg>',
    'sliders': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M4 7.5h16M4 12h16M4 16.5h16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity=".35"/><circle cx="8" cy="7.5" r="2.2"/><circle cx="15" cy="12" r="2.2"/><circle cx="10.5" cy="16.5" r="2.2"/></svg>',
    'sparkle': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M12 2.4c.35 2.9 1.55 5.1 3.6 6.55C13.55 10.4 12.35 12.6 12 15.5c-.35-2.9-1.55-5.1-3.6-6.55C10.45 7.5 11.65 5.3 12 2.4z"/><path d="M18.6 13.2c.2 1.55.8 2.7 1.9 3.45-1.1.75-1.7 1.9-1.9 3.45-.2-1.55-.8-2.7-1.9-3.45 1.1-.75 1.7-1.9 1.9-3.45z" opacity=".85"/><path d="M6.2 14.5c.15 1.15.55 2 1.35 2.55-.8.55-1.2 1.4-1.35 2.55-.15-1.15-.55-2-1.35-2.55.8-.55 1.2-1.4 1.35-2.55z" opacity=".7"/></svg>',
    'speaker': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><rect x="5" y="2.8" width="14" height="18.4" rx="3"/><circle cx="12" cy="14.2" r="4.2" fill="rgba(0,0,0,.32)"/><circle cx="12" cy="14.2" r="2.1"/><circle cx="12" cy="6.6" r="1.55"/></svg>',
    'strip': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M12 2.8l1.55 5.35h5.55l-4.45 3.35 1.65 5.4L12 13.85 7.7 16.9l1.65-5.4L4.9 8.15h5.55z"/></svg>',
    'sun': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="4.1"/><g stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.05 5.05l1.55 1.55M17.4 17.4l1.55 1.55M18.95 5.05l-1.55 1.55M6.6 17.4l-1.55 1.55"/></g></svg>',
    'thermo': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M10.2 3.6a1.8 1.8 0 0 1 3.6 0v8.35a3.9 3.9 0 1 1-3.6 0V3.6zm1.8 7.3a1.55 1.55 0 1 0 0 3.1 1.55 1.55 0 0 0 0-3.1z"/><path d="M12 4.8v7.2" stroke="rgba(0,0,0,.35)" stroke-width="1.6" stroke-linecap="round" fill="none"/></svg>',
    'wetter': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><circle cx="8.6" cy="8.2" r="3.1" opacity=".85"/><g stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity=".85"><path d="M8.6 2.9v1.5M3.3 8.2h1.5M4.85 4.45l1.05 1.05M12.35 4.45L11.3 5.5"/></g><path d="M9.3 18.9a3.6 3.6 0 0 1-.55-7.16A4.95 4.95 0 0 1 18.4 10.5a3.8 3.8 0 0 1-.35 7.56z"/></svg>',
    'volume': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M4.2 9.2h2.55l4.1-3.55c.85-.74 2.15-.14 2.15.97v11.76c0 1.11-1.3 1.71-2.15.97L6.75 15.8H4.2A1.7 1.7 0 0 1 2.5 14.1v-3.2A1.7 1.7 0 0 1 4.2 9.2z"/><path d="M16.2 9.1a3.6 3.6 0 0 1 0 5.8" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M18.15 7a5.7 5.7 0 0 1 0 10" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" opacity=".55"/></svg>',
    'warning': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M12 3.4c.7 0 1.35.36 1.72.96l7.35 12.2A2 2 0 0 1 19.35 19.5H4.65a2 2 0 0 1-1.72-3l7.35-12.2A2 2 0 0 1 12 3.4z"/><rect x="11.1" y="9" width="1.8" height="5.2" rx=".9" fill="rgba(0,0,0,.4)"/><circle cx="12" cy="16.2" r="1.05" fill="rgba(0,0,0,.4)"/></svg>',
    'wave': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M2.8 12c1.6-3.2 3.2-4.8 4.8-4.8S10.8 8.8 12 12s3.2 4.8 4.8 4.8S20.4 15.2 22 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    'yamaha': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><rect x="3.2" y="4.2" width="17.6" height="15.6" rx="3.2"/><rect x="6.2" y="7" width="2.2" height="10" rx="1.1" fill="rgba(0,0,0,.35)"/><rect x="10.9" y="7" width="2.2" height="10" rx="1.1" fill="rgba(0,0,0,.35)"/><rect x="15.6" y="7" width="2.2" height="10" rx="1.1" fill="rgba(0,0,0,.35)"/><circle cx="7.3" cy="11.2" r="1.35"/><circle cx="12" cy="14.2" r="1.35"/><circle cx="16.7" cy="9.5" r="1.35"/></svg>',
    'antenna': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M4.4 18.6l7.1-8.4 3.9 3.3-7.1 8.4z" transform="translate(0 -1.2)"/><path d="M14.2 9.6a5.4 5.4 0 0 0-4.6-4.6M17.6 8.2A9 9 0 0 0 10 1.6" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><circle cx="14.9" cy="13.4" r="2.1"/></svg>',
    'balance': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M12 3.2v16.4M7 20.4h10" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/><path d="M4.4 6.6h15.2" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/><path d="M4.4 6.6L1.9 12.4h5z M19.6 6.6l-2.5 5.8h5z"/></svg>',
    'bolt': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M13.6 2.4a.7.7 0 0 1 1.24.62L13.1 9.4h4.05a.9.9 0 0 1 .7 1.46l-7.5 9.5a.7.7 0 0 1-1.23-.6l1.72-6.4H6.8a.9.9 0 0 1-.7-1.47l7.5-9.49z"/></svg>',
    'burst': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M12 2.6l2.1 5.1 5.2-1.8-2.6 4.9 4.7 2.9-5.4.9 1.1 5.4-4.2-3.5-3.7 4-.5-5.5-5.5-.4 3.9-3.5-3.3-4.4 5.4 1.4z"/></svg>',
    'chevron-down': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M6.4 9.6l5.6 5.4 5.6-5.4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    'clock': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/><path d="M12 6.8V12l3.4 2.1" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    'cloud-sun': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><circle cx="8.2" cy="7.4" r="3.1"/><path d="M8.2 1.8v1.6M3.6 3.4l1.15 1.15M2.6 7.4h1.6M12.65 3.4L11.5 4.55" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M9.6 19.6a4.3 4.3 0 0 1-.5-8.57 5.6 5.6 0 0 1 10.7 1.6 3.5 3.5 0 0 1-.5 6.97z" opacity=".92"/></svg>',
    'crystal': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M12 2.6l6 5.2-6 13.6-6-13.6z"/><path d="M6 7.8h12M12 2.6v18.8" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="1.3"/></svg>',
    'disc': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.4" fill="rgba(0,0,0,.35)"/><circle cx="12" cy="12" r="1.15"/></svg>',
    'dot': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="5.4"/></svg>',
    'drum': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><ellipse cx="12" cy="8.2" rx="8.4" ry="3.4"/><path d="M3.6 8.2v6.4c0 1.9 3.76 3.4 8.4 3.4s8.4-1.5 8.4-3.4V8.2" fill="currentColor" opacity=".72"/><path d="M6.6 6.4l10.8 3.6M17.4 6.4L6.6 10" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="1.3"/></svg>',
    'dry': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M12 2.8c2.9 3.5 6.6 7.3 6.6 10.7A6.6 6.6 0 0 1 5.4 13.5C5.4 10.1 9.1 6.3 12 2.8z" opacity=".38"/><path d="M4.6 4.6l14.8 14.8" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/></svg>',
    'edit': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M4.4 16.1l9.6-9.6 3.9 3.9-9.6 9.6-4.6.7z"/><path d="M15.6 4.9l1.4-1.4a1.7 1.7 0 0 1 2.4 0l1.5 1.5a1.7 1.7 0 0 1 0 2.4l-1.4 1.4z" opacity=".62"/></svg>',
    'flame': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M12 2.6c3.1 3.4 5.9 5.9 5.9 9.6a5.9 5.9 0 1 1-11.8 0c0-1.9.8-3.4 1.9-4.8.3 1 .9 1.8 1.7 2.2.5-2.5 1.3-4.6 2.3-7z"/><path d="M12 12.4c1.3 1.4 2 2.4 2 3.6a2 2 0 1 1-4 0c0-1.2.7-2.2 2-3.6z" fill="rgba(0,0,0,.35)"/></svg>',
    'gear': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M10.4 2.6h3.2l.35 2.15c.5.17.97.4 1.4.7l2-.85 1.6 2.77-1.65 1.4c.05.27.07.55.07.83s-.02.56-.07.83l1.65 1.4-1.6 2.77-2-.85c-.43.3-.9.53-1.4.7l-.35 2.15h-3.2l-.35-2.15c-.5-.17-.97-.4-1.4-.7l-2 .85-1.6-2.77 1.65-1.4A6 6 0 0 1 6.2 12c0-.28.02-.56.07-.83L4.62 9.77l1.6-2.77 2 .85c.43-.3.9-.53 1.4-.7z" transform="translate(0 2.4)"/><circle cx="12" cy="14.4" r="2.5" fill="rgba(0,0,0,.35)"/></svg>',
    'globe': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="8.8"/><path d="M3.4 12h17.2M12 3.2c2.4 2.4 3.6 5.4 3.6 8.8s-1.2 6.4-3.6 8.8c-2.4-2.4-3.6-5.4-3.6-8.8S9.6 5.6 12 3.2z" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="1.4"/></svg>',
    'group': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><circle cx="9" cy="8.6" r="3.4"/><path d="M3 19.4a6 6 0 0 1 12 0z"/><circle cx="16.8" cy="9.6" r="2.6" opacity=".6"/><path d="M13.6 19.4a5 5 0 0 1 7.8-4.1" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" opacity=".6"/></svg>',
    'headphones': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M4.2 15.4v-2.6a7.8 7.8 0 0 1 15.6 0v2.6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><rect x="2.6" y="13.8" width="4.6" height="7.2" rx="2.3"/><rect x="16.8" y="13.8" width="4.6" height="7.2" rx="2.3"/></svg>',
    'heat': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M10.2 3.6a1.8 1.8 0 0 1 3.6 0v8.35a3.9 3.9 0 1 1-3.6 0z"/><path d="M17.6 4.4c.9 1 .9 2 0 3s-.9 2 0 3M20.6 4.4c.9 1 .9 2 0 3s-.9 2 0 3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" opacity=".75"/></svg>',
    'help': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/><path d="M9.7 9.4a2.4 2.4 0 1 1 3.4 2.2c-.7.35-1.1.9-1.1 1.7v.4" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="16.6" r="1.15" fill="rgba(0,0,0,.35)"/></svg>',
    'link': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M9.6 14.4l4.8-4.8" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/><path d="M10.6 6.6l1.6-1.6a4 4 0 0 1 5.7 5.7l-1.6 1.6M13.4 17.4l-1.6 1.6a4 4 0 0 1-5.7-5.7l1.6-1.6" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/></svg>',
    'lock': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><rect x="4.8" y="10.4" width="14.4" height="10" rx="3"/><path d="M8.2 10.4V8a3.8 3.8 0 0 1 7.6 0v2.4" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/><circle cx="12" cy="15.4" r="1.55" fill="rgba(0,0,0,.35)"/></svg>',
    'mood': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/><circle cx="9.1" cy="10.2" r="1.4" fill="rgba(0,0,0,.35)"/><circle cx="14.9" cy="10.2" r="1.4" fill="rgba(0,0,0,.35)"/><path d="M8 14.4a5 5 0 0 0 8 0" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="1.9" stroke-linecap="round"/></svg>',
    'palette': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M12 3.2c5.1 0 8.8 3.3 8.8 7.6 0 2.7-2 4.3-4.3 4.3h-1.6c-1 0-1.7.7-1.7 1.6 0 .5.2.8.5 1.2.3.4.5.8.5 1.3 0 1-.8 1.6-2 1.6-4.9 0-8.9-4-8.9-8.9S7 3.2 12 3.2z"/><circle cx="8" cy="10" r="1.35" fill="rgba(0,0,0,.35)"/><circle cx="12" cy="7.6" r="1.35" fill="rgba(0,0,0,.35)"/><circle cx="16.2" cy="10.2" r="1.35" fill="rgba(0,0,0,.35)"/></svg>',
    'party': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M3.4 20.6l4.6-11.4 6.8 6.8z"/><circle cx="17.4" cy="5.6" r="1.5" opacity=".8"/><circle cx="20.4" cy="10.4" r="1.2" opacity=".62"/><circle cx="12.6" cy="3.6" r="1.2" opacity=".62"/><path d="M15 9.4l2.6-2.6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" opacity=".7"/></svg>',
    'phone': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><rect x="6.4" y="2.4" width="11.2" height="19.2" rx="3"/><rect x="8.4" y="5.2" width="7.2" height="12" rx="1.2" fill="rgba(0,0,0,.35)"/><circle cx="12" cy="19.2" r="1.05" fill="rgba(0,0,0,.35)"/></svg>',
    'plus': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M12 5.2v13.6M5.2 12h13.6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>',
    'radio': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><rect x="2.6" y="8.4" width="18.8" height="12.2" rx="3"/><circle cx="16.4" cy="14.5" r="3.1" fill="rgba(0,0,0,.35)"/><rect x="5.6" y="11.6" width="6.2" height="1.9" rx=".95" fill="rgba(0,0,0,.35)"/><path d="M7.4 8.4l9.4-4.8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    'rainbow': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M2.6 19.4a9.4 9.4 0 0 1 18.8 0" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><path d="M6 19.4a6 6 0 0 1 12 0" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" opacity=".62"/><path d="M9.4 19.4a2.6 2.6 0 0 1 5.2 0" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" opacity=".34"/></svg>',
    'refresh': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M20 12a8 8 0 1 1-2.35-5.65" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M20.4 3.6v4.6h-4.6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    'robot': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><rect x="4.4" y="7.6" width="15.2" height="12" rx="3.6"/><circle cx="9.2" cy="13.2" r="1.7" fill="rgba(0,0,0,.35)"/><circle cx="14.8" cy="13.2" r="1.7" fill="rgba(0,0,0,.35)"/><path d="M12 3.2v4.4" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><circle cx="12" cy="2.8" r="1.5"/><path d="M2.6 12.4v3.2M21.4 12.4v3.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    'rocket': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M12 2.4c3.4 2.3 5.3 6 5.3 10.1l-1.9 3.3H8.6l-1.9-3.3C6.7 8.4 8.6 4.7 12 2.4z"/><circle cx="12" cy="9.4" r="2.1" fill="rgba(0,0,0,.35)"/><path d="M8.6 15.8l-2.4 3.9 4-1.1M15.4 15.8l2.4 3.9-4-1.1" fill="currentColor" opacity=".62"/></svg>',
    'save': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M5.4 3.6h10.2L20.4 8.4v11.1a1.9 1.9 0 0 1-1.9 1.9H5.4a1.9 1.9 0 0 1-1.9-1.9V5.5a1.9 1.9 0 0 1 1.9-1.9z"/><rect x="7.6" y="3.6" width="7.4" height="5" rx="1" fill="rgba(0,0,0,.35)"/><rect x="7" y="12.4" width="10" height="6.2" rx="1.3" fill="rgba(0,0,0,.35)"/></svg>',
    'search': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><circle cx="10.6" cy="10.6" r="6.1" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M15.2 15.2l4.6 4.6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
    'siren': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M5.4 17.4a6.6 6.6 0 0 1 13.2 0z"/><rect x="3.6" y="17.4" width="16.8" height="3.2" rx="1.6"/><path d="M12 2.6v2.4M4.6 6.2l1.7 1.7M19.4 6.2l-1.7 1.7" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>',
    'sleep': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M19.4 14.55A8.2 8.2 0 0 1 9.45 4.6a.95.95 0 0 0-1.2-1.15A9.7 9.7 0 1 0 20.55 15.75a.95.95 0 0 0-1.15-1.2z" opacity=".55"/><path d="M14.6 3.4h4.4l-4.4 4.6h4.4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    'sparkle-lg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M12 2.4l1.85 5.6a3 3 0 0 0 1.9 1.9L21.6 12l-5.85 2.1a3 3 0 0 0-1.9 1.9L12 21.6l-1.85-5.6a3 3 0 0 0-1.9-1.9L2.4 12l5.85-2.1a3 3 0 0 0 1.9-1.9z"/><circle cx="19.2" cy="5" r="1.5" opacity=".55"/></svg>',
    'sunrise': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><circle cx="12" cy="12.6" r="4.1"/><path d="M12 3.4v2.2M5.2 6.4l1.6 1.6M18.8 6.4l-1.6 1.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M2.8 17.6h18.4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M6 20.6h5M13.4 20.6h4.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity=".5"/></svg>',
    'target': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="8.6" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4.8" fill="none" stroke="currentColor" stroke-width="2" opacity=".6"/><circle cx="12" cy="12" r="1.9"/></svg>',
    'thumb': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M8.6 20.4V10.2l4-6.8a1.7 1.7 0 0 1 3.1 1.25L14.6 9h4.6a2 2 0 0 1 1.95 2.5l-1.8 7.2a2 2 0 0 1-1.95 1.5z"/><rect x="3.2" y="10" width="4" height="10.4" rx="1.6" opacity=".62"/></svg>',
    'trash': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M6.4 8.2h11.2l-.85 10.5a2.1 2.1 0 0 1-2.1 1.9H9.35a2.1 2.1 0 0 1-2.1-1.9z"/><rect x="4.6" y="5.2" width="14.8" height="2.3" rx="1.15"/><rect x="9.6" y="2.9" width="4.8" height="2" rx="1"/><path d="M10 11.2v5.6M14 11.2v5.6" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="1.5" stroke-linecap="round"/></svg>',
    'pressure': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="8.6"/><path d="M12 12l4.1-3.6" fill="none" stroke="rgba(0,0,0,.4)" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="12" r="1.5" fill="rgba(0,0,0,.4)"/><path d="M12 3.4v1.5M20.6 12h-1.5M12 20.6v-1.5M3.4 12h1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none" opacity=".55"/></svg>',
    'rain': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M6.6 14.6c-1.95 0-3.45-1.45-3.45-3.2s1.5-3.2 3.45-3.2c.35-1.95 2-3.45 4.05-3.45 1.45 0 2.75.75 3.5 1.9.5-.3 1.1-.5 1.75-.5 1.85 0 3.35 1.45 3.35 3.2 0 .2 0 .35-.05.55 1.45.4 2.45 1.7 2.45 3.25 0 1.85-1.6 3.4-3.55 3.4H6.6z"/><path d="M8.4 18.4l-.9 2.4M12 18.4l-.9 2.4M15.6 18.4l-.9 2.4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity=".7"/></svg>',
    'storm': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M6.6 14.6c-1.95 0-3.45-1.45-3.45-3.2s1.5-3.2 3.45-3.2c.35-1.95 2-3.45 4.05-3.45 1.45 0 2.75.75 3.5 1.9.5-.3 1.1-.5 1.75-.5 1.85 0 3.35 1.45 3.35 3.2 0 .2 0 .35-.05.55 1.45.4 2.45 1.7 2.45 3.25 0 1.85-1.6 3.4-3.55 3.4H6.6z"/><path d="M12.9 17.6h3.1l-4.4 5.1 1-3.3H9.6l3.9-4.4z" opacity=".95"/></svg>',
    'bug': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M12 6.4c3.05 0 5.5 2.5 5.5 5.6v1.7c0 3.1-2.45 5.6-5.5 5.6s-5.5-2.5-5.5-5.6V12c0-3.1 2.45-5.6 5.5-5.6z"/><path d="M9.3 6.1a3.2 3.2 0 0 1 5.4 0" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M9.1 3.6l1.2 1.6M14.9 3.6l-1.2 1.6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M6.5 10.2L3.4 8.6M6.5 14.2H3.2M6.8 17.6l-2.7 2M17.5 10.2l3.1-1.6M17.5 14.2h3.3M17.2 17.6l2.7 2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M12 8.6v9.4" stroke="rgba(0,0,0,.32)" stroke-width="1.5" fill="none"/></svg>',
  };

  function svg(name) {
    return ICONS[name] || '';
  }

  function html(name, className) {
    var cls = 'sh-icon' + (className ? ' ' + className : '');
    return '<span class="' + cls + '" data-sh-icon="' + name + '" aria-hidden="true">' + svg(name) + '</span>';
  }

  function mount(el, name) {
    if (!el) return;
    if (name) el.setAttribute('data-sh-icon', name);
    var n = el.getAttribute('data-sh-icon');
    if (!n || !ICONS[n]) return;
    // Schon gefuellt: nichts tun. Sonst schriebe der Beobachter unten bei jeder
    // DOM-Aenderung dieselben SVGs erneut.
    if (el.getAttribute('data-sh-mounted') === n) return;
    el.classList.add('sh-icon');
    el.setAttribute('aria-hidden', 'true');
    el.setAttribute('data-sh-mounted', n);
    el.innerHTML = ICONS[n];
  }

  function hydrate(root) {
    var scope = root || document;
    var nodes = scope.querySelectorAll ? scope.querySelectorAll('[data-sh-icon]') : [];
    for (var i = 0; i < nodes.length; i++) mount(nodes[i]);
  }

  // Shared CSS once
  if (typeof document !== 'undefined' && !document.getElementById('sh-icons-css')) {
    var st = document.createElement('style');
    st.id = 'sh-icons-css';
    st.textContent = ''
      + '.sh-icon{display:inline-flex;align-items:center;justify-content:center;line-height:0;'
      + 'flex:0 0 auto;vertical-align:-0.125em;color:inherit}'
      + '.sh-icon svg{width:1em;height:1em;display:block}'
      + '.card-icon.sh-icon{font-size:1.85rem;width:2.35rem;height:2.35rem;'
      + 'border-radius:14px;background:color-mix(in srgb,var(--blue,#b3c5ff) 16%,transparent);'
      + 'color:var(--blue,#b3c5ff);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--blue,#b3c5ff) 22%,transparent)}'
      + '.card-icon.sh-icon svg{width:1.25rem;height:1.25rem}'
      + '.btn-icon.sh-icon{font-size:1.05rem}'
      + '.sh-icon-lg{font-size:2.6rem}'
      + '.veil-emoji.sh-icon{font-size:clamp(4rem,18vw,7rem);color:var(--blue,#b3c5ff);'
      + 'filter:drop-shadow(0 0 28px color-mix(in srgb,var(--blue,#b3c5ff) 55%,transparent))}'
      + '.theme-btn .sh-icon,.master-toggle .sh-icon{font-size:1.05em;margin-inline:0.15em}'
      + '[data-theme=light] .card-icon.sh-icon{background:color-mix(in srgb,var(--blue,#3d5bd6) 12%,transparent);color:var(--blue,#3d5bd6)}'
      + '.card-icon[data-sh-icon=disco]{color:#ff7ad9;background:color-mix(in srgb,#ff7ad9 16%,transparent);box-shadow:inset 0 0 0 1px color-mix(in srgb,#ff7ad9 28%,transparent)}'
      + '.card-icon[data-sh-icon=fog]{color:#9ad7ff;background:color-mix(in srgb,#9ad7ff 14%,transparent);box-shadow:inset 0 0 0 1px color-mix(in srgb,#9ad7ff 26%,transparent)}'
      + '.card-icon[data-sh-icon=garten]{color:#7ddfa6;background:color-mix(in srgb,#7ddfa6 14%,transparent);box-shadow:inset 0 0 0 1px color-mix(in srgb,#7ddfa6 26%,transparent)}'
      + '.card-icon[data-sh-icon=klima]{color:#ffb74d;background:color-mix(in srgb,#ffb74d 14%,transparent);box-shadow:inset 0 0 0 1px color-mix(in srgb,#ffb74d 26%,transparent)}'
      + '.card-icon[data-sh-icon=hifi],.card-icon[data-sh-icon=music]{color:#cbbdff;background:color-mix(in srgb,#cbbdff 14%,transparent);box-shadow:inset 0 0 0 1px color-mix(in srgb,#cbbdff 26%,transparent)}'
      + '.card-icon[data-sh-icon=sparkle]{color:#ffd27a;background:color-mix(in srgb,#ffd27a 14%,transparent);box-shadow:inset 0 0 0 1px color-mix(in srgb,#ffd27a 26%,transparent)}'
      + '.card-icon[data-sh-icon=monitor]{color:#7ea2ff;background:color-mix(in srgb,#7ea2ff 14%,transparent);box-shadow:inset 0 0 0 1px color-mix(in srgb,#7ea2ff 26%,transparent)}'
      + '.nav-icon.sh-icon,.quick-icon.sh-icon,.icon.sh-icon{font-size:1.35rem;width:1.35rem;height:1.35rem}'
      + '.nav-icon.sh-icon svg,.quick-icon.sh-icon svg,.icon.sh-icon svg{width:1.35rem;height:1.35rem}';
    document.head.appendChild(st);
  }

  // ---- Zweitnamen ---------------------------------------------------------
  // Sieben Zeichnungen standen wortgleich unter zwei oder drei Namen (87 Eintraege,
  // 80 verschiedene Bilder) — immer ein App-Name neben einem Sachbegriff. Beide
  // Namen bleiben gueltig: nav.js spricht die App an, die Apps meist die Sache.
  // Nur existiert das Bild jetzt einmal, sonst laufen die Kopien beim naechsten
  // Nachziehen auseinander und dieselbe Sache saehe an zwei Orten verschieden aus.
  ICONS['mixer'] = ICONS['yamaha'];
  ICONS['hue'] = ICONS['bulb'];
  ICONS['lamp'] = ICONS['bulb'];
  ICONS['monitor'] = ICONS['chart'];
  ICONS['fog'] = ICONS['mist'];
  ICONS['garten'] = ICONS['leaf'];
  ICONS['hifi'] = ICONS['speaker'];
  ICONS['klima'] = ICONS['thermo'];

  var api = { ICONS: ICONS, svg: svg, html: html, mount: mount, hydrate: hydrate };
  global.SHIcons = api;

  /* Nachtraeglich eingefuegtes Markup mitnehmen.
     Ein einmaliges hydrate() beim Laden reicht nicht: die Apps bauen den
     Grossteil ihrer Oberflaeche zur Laufzeit (Lampenkarten, Meldungen,
     Knopfbeschriftungen). Deren data-sh-icon-Platzhalter blieben sonst leer —
     in hue betraf das 53 von 156 Icons, also ein gutes Drittel. Der Beobachter
     ist billig: er laeuft nur auf hinzugefuegte Knoten, und mount() kehrt bei
     bereits gefuellten sofort zurueck. */
  function observe() {
    if (!global.MutationObserver || !document.body) return;
    new MutationObserver(function (recs) {
      for (var i = 0; i < recs.length; i++) {
        var added = recs[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          var node = added[j];
          if (node.nodeType !== 1) continue;
          if (node.hasAttribute && node.hasAttribute('data-sh-icon')) mount(node);
          if (node.querySelectorAll) hydrate(node);
        }
      }
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { hydrate(document); observe(); });
    } else {
      hydrate(document);
      observe();
    }
  }
})(typeof window !== 'undefined' ? window : globalThis);
