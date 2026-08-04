import React from 'react';
import Icon from '../Icon';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  background: ${props => props.theme.colors.surface};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  padding: 0 20px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 0.5rem;
  color: ${props => props.theme.colors.text};
  font-size: 1.2rem;
  
  &:hover {
    background: ${props => props.theme.colors.background};
  }
`;

/* Der Kopfbalken traegt den Geraetenamen, nicht den Seitentitel — er bleibt
   kleiner als die Seitenueberschrift, uebernimmt aber deren Gewicht und
   Tracking, damit beide erkennbar aus derselben Schrift kommen. */
const Title = styled.h1`
  color: ${props => props.theme.colors.text};
  font-size: 1.25rem;
  font-weight: 750;
  letter-spacing: -0.01em;
  margin: 0;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

/* Referenzform: Punkt und Wort in einer Pille (siehe shared/theme.css
   .sh-live). Vorher war es ein freistehender Punkt neben freiem Text — dasselbe
   Element sah in jeder App anders aus. */
const StatusIndicator = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.82rem;
  padding: 0.4rem 0.7rem;
  border-radius: 999px;
  border: 1px solid ${props => props.theme.colors.border};
  background: color-mix(in srgb, ${props => props.theme.colors.text} 3%, transparent);
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  flex: 0 0 auto;
  border-radius: 50%;
  /* Aus dem Theme statt zweier fest verdrahteter Hex-Werte der alten Palette.
     Getrennt ist grau, nicht rot: „keine Verbindung“ ist kein Fehlerzustand,
     den man rot anschreien muesste — die Referenz macht es genauso. */
  background-color: ${props => props.connected ? props.theme.colors.success : props.theme.colors.textMuted};
  animation: ${props => props.connected ? 'pulse 2s infinite' : 'none'};

  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

const ThemeToggle = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 0.5rem;
  color: ${props => props.theme.colors.text};
  font-size: 1.2rem;
  
  &:hover {
    background: ${props => props.theme.colors.background};
  }
`;

const AlertsCount = styled.div`
  background: ${props => props.count > 0 ? '#e16162' : 'transparent'};
  color: white;
  border-radius: 12px;
  padding: 4px 8px;
  font-size: 0.8rem;
  font-weight: 600;
  min-width: 20px;
  text-align: center;
  display: ${props => props.count > 0 ? 'block' : 'none'};
`;

const Header = ({ 
  isDarkMode, 
  onToggleTheme, 
  isConnected, 
  onToggleSidebar,
  alerts = []
}) => {
  // Same build runs on both Pis; the Pi 5 monitor is only ever reached at its own
  // host (192.168.178.105:4999). Everything else (nginx /app/monitor/, raspi3) = Pi 3.
  const piModel = (typeof window !== 'undefined' && window.location.host.includes('192.168.178.105')) ? '5' : '3';
  return (
    <HeaderContainer>
      <LeftSection>
        <MenuButton onClick={onToggleSidebar} aria-label="Navigation ein-/ausblenden">
          <Icon name="menu" />
        </MenuButton>
        <Title>Raspberry Pi {piModel} Monitor</Title>
      </LeftSection>
      
      <RightSection>
        <StatusIndicator>
          <StatusDot connected={isConnected} />
          {isConnected ? 'live' : 'offline'}
        </StatusIndicator>
        
        <AlertsCount count={alerts.length}>
          {alerts.length}
        </AlertsCount>
        
        <ThemeToggle onClick={onToggleTheme} aria-label={isDarkMode ? 'Helles Design' : 'Dunkles Design'}>
          <Icon name={isDarkMode ? 'sun' : 'moon'} />
        </ThemeToggle>
      </RightSection>
    </HeaderContainer>
  );
};

export default Header;