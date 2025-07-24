export const lightTheme = {
  colors: {
    primary: '#2563eb',
    primaryHover: '#1d4ed8',
    secondary: '#64748b',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    
    background: '#ffffff',
    surface: '#f8fafc',
    card: '#ffffff',
    
    text: '#1e293b',
    textSecondary: '#64748b',
    textMuted: '#94a3b8',
    
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    
    shadow: 'rgba(0, 0, 0, 0.1)',
    shadowLight: 'rgba(0, 0, 0, 0.05)',
    
    // Status colors
    online: '#10b981',
    offline: '#ef4444',
    warning: '#f59e0b',
    
    // Chart colors
    chart: {
      primary: '#2563eb',
      secondary: '#10b981',
      accent: '#f59e0b',
      danger: '#ef4444',
      info: '#3b82f6',
      purple: '#8b5cf6',
      pink: '#ec4899',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  
  typography: {
    fontFamily: {
      sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: '"Fira Code", "SF Mono", Monaco, "Inconsolata", "Roboto Mono", "Source Code Pro", monospace',
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
};

export const darkTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    // Modern Dark Theme based on Material Design
    primary: '#688db1',
    primaryHover: '#5a7ba3',
    secondary: '#9cb68f',
    success: '#9cb68f',
    warning: '#f59e0b',
    error: '#e16162',
    info: '#688db1',
    
    // Background colors from specification
    background: '#2B2E3B',
    backgroundDarker: '#252830',
    surface: '#343845',
    card: '#343845',
    
    // Text colors from specification
    text: '#d1d5db',
    textSecondary: '#9ca3af',
    textMuted: '#94a3b8',
    
    // Border colors
    border: '#4a5568',
    borderLight: '#3a4553',
    
    // Shadow colors
    shadow: 'rgba(0, 0, 0, 0.25)',
    shadowLight: 'rgba(0, 0, 0, 0.15)',
    
    // Status colors
    online: '#9cb68f',
    offline: '#e16162',
    warning: '#f59e0b',
    
    // Chart colors adjusted for dark theme
    chart: {
      primary: '#688db1',
      secondary: '#9cb68f',
      accent: '#f59e0b',
      danger: '#e16162',
      info: '#688db1',
      purple: '#a78bfa',
      pink: '#f472b6',
      gradient: 'linear-gradient(135deg, #688db1 0%, #9cb68f 100%)',
    },
  },
  
  // Add CSS variables for consistent usage
  cssVars: {
    // Colors
    '--background-dark': '#2B2E3B',
    '--background-darker': '#252830',
    '--card-background': '#343845',
    '--accent-blue': '#688db1',
    '--accent-green': '#9cb68f',
    '--accent-red': '#e16162',
    '--text-primary': '#d1d5db',
    '--text-secondary': '#9ca3af',
    
    // Shadows
    '--shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.15)',
    '--shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.25), 0 2px 4px -1px rgba(0, 0, 0, 0.15)',
    '--shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.25), 0 4px 6px -2px rgba(0, 0, 0, 0.15)',
    
    // Spacing
    '--spacing-1': '0.25rem',
    '--spacing-2': '0.5rem',
    '--spacing-3': '0.75rem',
    '--spacing-4': '1rem',
    '--spacing-6': '1.5rem',
    '--spacing-8': '2rem',
    '--spacing-12': '3rem',
    '--spacing-16': '4rem',
    
    // Border radius
    '--radius-sm': '0.25rem',
    '--radius': '0.5rem',
    '--radius-lg': '0.75rem',
    '--radius-xl': '1rem',
  },
};

export default { lightTheme, darkTheme };