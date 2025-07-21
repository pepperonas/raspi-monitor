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
    primary: '#3b82f6',
    primaryHover: '#2563eb',
    secondary: '#64748b',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    
    background: '#0f172a',
    surface: '#1e293b',
    card: '#334155',
    
    text: '#f8fafc',
    textSecondary: '#cbd5e1',
    textMuted: '#94a3b8',
    
    border: '#374151',
    borderLight: '#2d3748',
    
    shadow: 'rgba(0, 0, 0, 0.3)',
    shadowLight: 'rgba(0, 0, 0, 0.2)',
    
    // Status colors remain the same
    online: '#10b981',
    offline: '#ef4444',
    warning: '#f59e0b',
    
    // Chart colors (slightly adjusted for dark mode)
    chart: {
      primary: '#3b82f6',
      secondary: '#10b981',
      accent: '#f59e0b',
      danger: '#ef4444',
      info: '#60a5fa',
      purple: '#a78bfa',
      pink: '#f472b6',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
  },
};

export default { lightTheme, darkTheme };