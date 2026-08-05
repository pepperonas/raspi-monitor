import React, { useState, useEffect } from 'react';
import Icon from './components/Icon';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';

// Components
import Header from './components/Layout/Header';
import PageTabs from './components/Layout/PageTabs';
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
    /* Aus dem Theme, nicht fest verdrahtet: theme.js ist die einzige Quelle,
       und ein zweiter Schriftstack hier hat sie schlicht ignoriert. */
    font-family: ${props => props.theme.typography.fontFamily.sans};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    /* Flach statt zweier Radialverläufe: die dB-Analyse hat ihren aus dem Grund
       aufgegeben, aus dem er auch hier auffällt — er liest sich als mehrere
       verschiedene Hintergründe, je nachdem wohin man schaut. */
    background-color: ${props => props.theme.colors.background};
    background-image: none;
    color: ${props => props.theme.colors.text};
    transition: background-color 0.3s ease, color 0.3s ease;
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
  /* Kein eigenes seitliches Polster: seit die App shared/theme.css laedt,
     bringt der body es mit (17,6 px). Beides zusammen ergab 35,2 px je Seite
     und damit 1197,6 statt 1200 Satzspiegel — dieselbe Doppelung wie beim
     Kopfabstand, nur waagerecht. */
  box-sizing: border-box;
  /* Ohne min-width:0 schrumpft ein Flex-Kind nicht unter seine Inhaltsbreite
     (Default min-width:auto). Auf 390 px stand MAIN dadurch 518 px breit —
     157 px Ueberlauf, und die Reiterreihe konnte nicht scrollen, weil ihr
     Elternteil selbst zu breit war. */
  min-width: 0;
  min-height: 100vh;
`;

const ContentArea = styled.div`
  flex: 1;
  /* Satzspiegel 1200 px OHNE eigenes seitliches Polster — das sitzt eine Ebene
     hoeher an MainContent. 1200 mit Innenabstand waeren 1160 und laegen neben
     allen anderen Apps. Ohne Begrenzung lief der Inhalt hier ueber 1626 px. */
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 0 56px;
  overflow-y: auto;
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
  // Das Theme kommt aus der geteilten Leiste (shared/nav.js), damit die Wahl
  // hier dieselbe ist wie in den uebrigen Apps. styled-components lesen kein
  // data-theme, also hoeren wir auf das Ereignis, das nav.js beim Umschalten
  // feuert — und lesen beim Start denselben Schluessel.
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const shared = localStorage.getItem('sh-theme');
    if (shared === 'light' || shared === 'dark') return shared === 'dark';
    const saved = localStorage.getItem('darkMode');   // vorheriger App-Schluessel
    return saved ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    const onTheme = e => setIsDarkMode(e.detail.theme !== 'light');
    window.addEventListener('sh-theme', onTheme);
    return () => window.removeEventListener('sh-theme', onTheme);
  }, []);


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



  // Umgeschaltet wird ausschliesslich ueber den Knopf in der geteilten Leiste
  // — sonst gaebe es auf einem Bildschirm zwei Bedienelemente fuer dieselbe
  // Sache, die sich gegenseitig ueberschreiben.
  const toggleTheme = () => {
    const next = isDarkMode ? 'light' : 'dark';
    try { localStorage.setItem('sh-theme', next); } catch (e) {}
    window.dispatchEvent(new CustomEvent('sh-theme', { detail: { theme: next } }));
    document.documentElement.setAttribute('data-theme', next);
  };


  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <Router>
          <AppContainer>
            <MainContent>
              <Header
                isConnected={isConnected}
                alerts={alerts}
              />
              <ContentArea>
                <PageTabs />
                <AppRoutes
                  metrics={metrics}
                  alerts={alerts}
                  isConnected={isConnected}
                  isDarkMode={isDarkMode}
                  toggleTheme={toggleTheme}
                  wsService={wsService}
                />
              </ContentArea>
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