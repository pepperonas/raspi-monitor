// Design tokens — angeglichen an die dB-Analyse (/app/disco/stats), die im
// Stack als Maßstab dient. Die Werte sind dort gemessen und stimmen mit
// shared/theme.css überein; diese Datei ist deren JavaScript-Gegenstück, weil
// styled-components kein Stylesheet lesen, sondern theme.colors.*.
//
// Bewusst NICHT übernommen: die Diagrammpalette und der Teal→Violett-Verlauf.
// Die codieren Bedeutung bzw. die Identität dieser App (bis hin zu ihrem
// Favicon) — so wie die Klima-Apps ihre Temperatur-/Feuchte-Farben behalten.

// Ein Radius für Flächen, ein kleiner für Eingaben — wie drüben.
const radii = {
  sm: '16px',
  md: '16px',
  lg: '28px',   // Karten
  xl: '28px',
  full: '999px',
};

// Höhe entsteht über Kontur und Flächenton, nicht über Schlagschatten.
const shadows = { sm: 'none', md: 'none', lg: 'none', xl: 'none' };

const spacing = {
  xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px', xxl: '48px',
};

const typography = {
  fontFamily: {
    sans: "'Roboto Flex', Roboto, system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif",
    mono: "'JetBrains Mono Variable', 'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
  },
  fontSize: {
    xs: '12px', sm: '14px', base: '16px', lg: '18px', xl: '20px',
    '2xl': '24px', '3xl': '30px', '4xl': '36px',
  },
  // 750 für Kartentitel, 800 für Kennzahlen und Seitentitel — die Referenz
  // setzt ihre Hierarchie über Gewicht, nicht über Größe.
  fontWeight: { normal: 440, medium: 500, semibold: 750, bold: 800 },
};

const breakpoints = { sm: '640px', md: '768px', lg: '1024px', xl: '1280px' };

// ---- shared chart palette (stats order) ----
const chart = {
  primary: '#4dd0c4', secondary: '#9b8cff', accent: '#e3b341', danger: '#f06c6c',
  info: '#6ec8d6', purple: '#9b8cff', pink: '#f0883e',
  gradient: 'linear-gradient(135deg, #4dd0c4 0%, #9b8cff 100%)',
};

export const darkTheme = {
  colors: {
    // teal→violet accent
    primary: '#6ec8d6',
    primaryHover: '#4dd0c4',
    accentTeal: '#4dd0c4',
    accentViolet: '#9b8cff',
    accentGradient: 'linear-gradient(135deg, #4dd0c4 0%, #9b8cff 100%)',
    accentGradientSoft: 'linear-gradient(135deg, color-mix(in srgb, #4dd0c4 22%, transparent) 0%, color-mix(in srgb, #9b8cff 22%, transparent) 100%)',
    onAccent: '#08222a',

    secondary: '#9aa4b2',
    success: '#56d364',
    warning: '#e3b341',
    error: '#f06c6c',
    info: '#6ec8d6',

    // tonal dark surfaces (rising tiers)
    background: '#0d0e12',
    // Flach, nicht radial: der Verlauf las sich als zwei Hintergründe.
    backgroundGrad: '#0d0e12',
    surface: '#1c1d23',          // Karten
    surface0: '#121318',
    surfaceElevated: '#26272d',
    surfaceHigh: '#26272d',
    surfaceHover: '#26272d',
    card: '#1c1d23',

    text: '#e4e2e9',
    textSecondary: '#c5c6d0',
    textMuted: '#8e9099',

    border: '#44464f',
    borderLight: '#44464f',
    borderStrong: '#44464f',

    shadow: 'rgba(0, 0, 0, 0.45)',
    shadowLight: 'rgba(0, 0, 0, 0.3)',

    online: '#56d364',
    offline: '#f06c6c',

    track: '#26272d',
    scrim: 'rgba(6, 8, 12, 0.62)',

    chart,
  },
  spacing, borderRadius: radii, shadows, typography, breakpoints,
};

export const lightTheme = {
  colors: {
    ...darkTheme.colors,
    primary: '#2f8f9c',
    primaryHover: '#4dd0c4',
    onAccent: '#ffffff',
    background: '#eef1f7',
    backgroundGrad: '#eef1f7',   // flach, wie im dunklen Theme
    surface: '#ffffff',
    surface0: '#ffffff',
    surfaceElevated: '#e8ebf2',
    surfaceHigh: '#e8ebf2',
    surfaceHover: '#e8ebf2',
    card: '#ffffff',
    text: '#1a1c22',
    textSecondary: '#4a4d57',
    textMuted: '#6d7079',
    border: '#c9ccd6',
    borderLight: '#c9ccd6',
    borderStrong: '#c9ccd6',
    track: '#e8ebf2',
    scrim: 'rgba(20, 26, 36, 0.35)',
  },
  spacing, borderRadius: radii,
  // Auch hell schattenlos — Höhe über Kontur und Flächenton.
  shadows: { sm: 'none', md: 'none', lg: 'none', xl: 'none' },
  typography, breakpoints,
};

const themes = { lightTheme, darkTheme };
export default themes;
