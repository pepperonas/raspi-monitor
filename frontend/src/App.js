import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';

// Components
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Metrics from './pages/Metrics';
import Alerts from './pages/Alerts';
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
    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Oxygen',
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
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 20px;
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

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved ? JSON.parse(saved) : true;
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
      console.log('❌ WebSocket disconnected');
    });

    ws.on('metrics', (data) => {
      setMetrics(data);
    });

    ws.on('alert', (data) => {
      setAlerts(prev => [data, ...prev.slice(0, 49)]); // Keep last 50 alerts
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
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route 
                    path="/dashboard" 
                    element={
                      <Dashboard 
                        metrics={metrics} 
                        alerts={alerts}
                        isConnected={isConnected}
                      />
                    } 
                  />
                  <Route 
                    path="/metrics" 
                    element={
                      <Metrics 
                        metrics={metrics}
                        isConnected={isConnected}
                      />
                    } 
                  />
                  <Route 
                    path="/alerts" 
                    element={
                      <Alerts 
                        alerts={alerts}
                        isConnected={isConnected}
                      />
                    } 
                  />
                  <Route 
                    path="/system" 
                    element={
                      <System 
                        isConnected={isConnected}
                      />
                    } 
                  />
                  <Route 
                    path="/settings" 
                    element={
                      <Settings 
                        isDarkMode={isDarkMode}
                        onToggleTheme={toggleTheme}
                        wsService={wsService}
                      />
                    } 
                  />
                </Routes>
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