// Design tokens — adopted from celox `stats` ("M3 Dark Premium"):
// deep neutral-dark base, layered surfaces, one teal→violet accent.
// styled-components read theme.colors.*, so remapping here recolours the whole app.

const radii = {
  sm: '10px',
  md: '16px',
  lg: '22px',   // cards
  xl: '28px',
  full: '999px',
};

const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.4)',
  md: '0 4px 16px rgba(0, 0, 0, 0.35)',
  lg: '0 12px 40px rgba(0, 0, 0, 0.45)',
  xl: '0 12px 40px rgba(0, 0, 0, 0.45)',
};

const spacing = {
  xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px', xxl: '48px',
};

const typography = {
  fontFamily: {
    sans: "'Inter Variable', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    mono: "'JetBrains Mono Variable', 'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
  },
  fontSize: {
    xs: '12px', sm: '14px', base: '16px', lg: '18px', xl: '20px',
    '2xl': '24px', '3xl': '30px', '4xl': '36px',
  },
  fontWeight: { normal: 440, medium: 500, semibold: 650, bold: 720 },
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
    background: '#0e1116',
    backgroundGrad: 'radial-gradient(1200px 700px at 15% -10%, #161b24 0%, #0e1116 55%)',
    surface: '#171c25',          // surface-1 (cards)
    surface0: '#12161d',
    surfaceElevated: '#1d232e',  // surface-2
    surfaceHigh: '#242b38',      // surface-3
    surfaceHover: '#262e3c',
    card: '#171c25',

    text: '#e7ecf2',
    textSecondary: '#9aa4b2',
    textMuted: '#6b7484',

    border: '#262d39',
    borderLight: '#1d232e',
    borderStrong: '#333c4b',

    shadow: 'rgba(0, 0, 0, 0.45)',
    shadowLight: 'rgba(0, 0, 0, 0.3)',

    online: '#56d364',
    offline: '#f06c6c',

    track: '#2a323f',
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
    background: '#f4f6fa',
    backgroundGrad: 'radial-gradient(1200px 700px at 15% -10%, #ffffff 0%, #eef1f7 55%)',
    surface: '#ffffff',
    surface0: '#ffffff',
    surfaceElevated: '#f3f5fa',
    surfaceHigh: '#e9edf4',
    surfaceHover: '#eef1f7',
    card: '#ffffff',
    text: '#1a2230',
    textSecondary: '#5a6472',
    textMuted: '#8a94a4',
    border: '#dde3ec',
    borderLight: '#e9edf4',
    borderStrong: '#c7cfdc',
    track: '#dbe1ea',
    scrim: 'rgba(20, 26, 36, 0.35)',
  },
  spacing, borderRadius: radii,
  shadows: {
    sm: '0 1px 2px rgba(20, 30, 50, 0.08)',
    md: '0 4px 16px rgba(20, 30, 50, 0.1)',
    lg: '0 12px 40px rgba(20, 30, 50, 0.14)',
    xl: '0 12px 40px rgba(20, 30, 50, 0.14)',
  },
  typography, breakpoints,
};

const themes = { lightTheme, darkTheme };
export default themes;
