import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';

// Components
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Metrics from './pages/Metrics';
import Charts from './pages/Charts';
import Alerts from './pages/Alerts';
import Tasks from './pages/Tasks';
import System from './pages/System';
import Settings from './pages/Settings';

// Services
import { WebSocketService } from './services/websocket';
import { MetricsService } from './services/metrics';

// Theme
import { lightTheme, darkTheme } from './theme';

// Global styles
const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text};
    transition: all 0.3s ease;
  }

  code {
    font-family: 'Fira Code', 'SF Mono', Monaco, 'Inconsolata', 'Roboto Mono',
      'Source Code Pro', monospace;
  }

  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.surface};
  }

  ::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.border};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${props => props.theme.colors.textSecondary};
  }

  /* ===== Obsessive-Detail Politur (2026-06-16) — additiv, kein Umbau ===== */
  button:focus-visible,a[href]:focus-visible,input:focus-visible,select:focus-visible,[role="button"]:focus-visible,[tabindex]:not([tabindex="-1"]):focus-visible{
    outline:2px solid var(--accent, var(--primary, #aac7ff)); outline-offset:3px; border-radius:10px;
  }
  button:focus:not(:focus-visible),a:focus:not(:focus-visible){ outline:none; }
  h1,h2,h3{ text-wrap:balance; }
  @media (pointer:coarse){ button,[role="button"]{ min-height:44px; } }
  @media (prefers-reduced-motion: reduce){
    *,*::before,*::after{ animation-duration:.01ms!important; animation-iteration-count:1!important; transition-duration:.01ms!important; scroll-behavior:auto!important; }
  }

  /* ===== MD3 Expressive Motion — "live control room" (2026-06-27) ===== */
  /* One timing system: emphasized easing + a gentle spring, reused everywhere. */
  :root{
    --md-decelerate: cubic-bezier(0.05,0.7,0.1,1);   /* entrances */
    --md-emphasized: cubic-bezier(0.2,0,0,1);
    --md-spring: cubic-bezier(0.34,1.42,0.5,1);       /* spatial overshoot */
    --md-fast:180ms; --md-med:360ms; --md-slow:520ms;
  }
  /* Core transition: a view slides up as you move between consoles. */
  @keyframes md-page-in{ from{opacity:0; transform:translateY(12px);} to{opacity:1; transform:none;} }
  .md-page{ animation: md-page-in var(--md-med) var(--md-decelerate) backwards; }
  /* Signature catch: instruments power on, staggered, with a spring overshoot. */
  @keyframes md-panel-rise{ 0%{opacity:0; transform:translateY(20px) scale(.98);} 100%{opacity:1; transform:none;} }
  .md-stagger > *{ animation: md-panel-rise var(--md-slow) var(--md-spring) backwards; }
  .md-stagger > *:nth-child(1){animation-delay:.03s} .md-stagger > *:nth-child(2){animation-delay:.07s}
  .md-stagger > *:nth-child(3){animation-delay:.11s} .md-stagger > *:nth-child(4){animation-delay:.15s}
  .md-stagger > *:nth-child(5){animation-delay:.19s} .md-stagger > *:nth-child(6){animation-delay:.23s}
  .md-stagger > *:nth-child(7){animation-delay:.27s} .md-stagger > *:nth-child(8){animation-delay:.31s}
  .md-stagger > *:nth-child(9){animation-delay:.35s} .md-stagger > *:nth-child(n+10){animation-delay:.39s}
  /* Vital sign: a value blooms softly in its own colour the instant it updates. */
  @keyframes md-tick{ 0%{text-shadow:0 0 0 transparent;} 35%{text-shadow:0 0 16px currentColor;} 100%{text-shadow:0 0 0 transparent;} }
  .md-tick{ animation: md-tick 600ms ease-out; }
  /* Cursor-reactive cards (gated to real pointers below, in JS). */
  .md-tiltable{ transition: transform var(--md-fast) var(--md-emphasized), box-shadow var(--md-med) var(--md-emphasized); transform-style:preserve-3d; will-change:transform; }
`;

const AppContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: ${props => props.theme.colors.background};
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: ${props => props.sidebarOpen ? '280px' : '60px'};
  transition: margin-left 0.3s ease;
  min-height: 100vh;
  
  @media (max-width: 1024px) {
    margin-left: 0;
  }
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
`;

const Footer = styled.footer`
  text-align: center;
  padding: 20px;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 14px;
  border-top: 1px solid ${props => props.theme.colors.border};
  background-color: ${props => props.theme.colors.surface};
`;

// React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
      retry: 1,
      staleTime: 30000, // 30 seconds
    },
  },
});

// Keyed by path so the page-transition (md-page) replays on every navigation.
function AppRoutes({ metrics, alerts, isConnected, isDarkMode, toggleTheme, wsService }) {
  const location = useLocation();
  return (
    <div className="md-page" key={location.pathname}>
      <Routes location={location}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard metrics={metrics} alerts={alerts} isConnected={isConnected} />} />
        <Route path="/metrics" element={<Metrics metrics={metrics} isConnected={isConnected} />} />
        <Route path="/charts" element={<Charts metrics={metrics} isConnected={isConnected} />} />
        <Route path="/alerts" element={<Alerts alerts={alerts} isConnected={isConnected} />} />
        <Route path="/tasks" element={<Tasks isConnected={isConnected} />} />
        <Route path="/system" element={<System isConnected={isConnected} />} />
        <Route path="/settings" element={<Settings isDarkMode={isDarkMode} onToggleTheme={toggleTheme} wsService={wsService} />} />
      </Routes>
    </div>
  );
}

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : true;
  });

  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    const isMobile = window.innerWidth <= 1024;
    return saved ? JSON.parse(saved) : !isMobile;
  });

  const [isConnected, setIsConnected] = useState(false);
  const [metrics, setMetrics] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [wsService, setWsService] = useState(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const ws = new WebSocketService();
    setWsService(ws);

    ws.on('connected', () => {
      setIsConnected(true);
      console.log('✅ WebSocket connected');
    });

    ws.on('disconnected', () => {
      setIsConnected(false);
      console.log('❌ WebSocket disconnected - using REST API fallback');
    });

    ws.on('metrics', (data) => {
      setMetrics(data);
    });

    ws.on('alert', (data) => {
      setAlerts(prev => [data, ...prev.slice(0, 49)]); // Keep last 50 alerts
    });

    ws.on('maxReconnectAttemptsReached', () => {
      console.log('📡 WebSocket failed - falling back to REST API polling');
      setIsConnected(false);
    });

    ws.connect();

    return () => {
      ws.disconnect();
    };
  }, []);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <Router>
          <AppContainer>
            <Sidebar 
              isOpen={sidebarOpen}
              onToggle={toggleSidebar}
            />
            <MainContent sidebarOpen={sidebarOpen}>
              <Header
                isDarkMode={isDarkMode}
                onToggleTheme={toggleTheme}
                isConnected={isConnected}
                onToggleSidebar={toggleSidebar}
                alerts={alerts}
              />
              <ContentArea>
                <AppRoutes
                  metrics={metrics}
                  alerts={alerts}
                  isConnected={isConnected}
                  isDarkMode={isDarkMode}
                  toggleTheme={toggleTheme}
                  wsService={wsService}
                />
              </ContentArea>
              <Footer>
                Made with ❤️ by Martin Pfeffer
              </Footer>
            </MainContent>
          </AppContainer>
        </Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: theme.colors.surface,
              color: theme.colors.text,
              border: `1px solid ${theme.colors.border}`,
            },
          }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;