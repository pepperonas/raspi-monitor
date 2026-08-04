import React from 'react';
import Icon from '../Icon';
import styled from 'styled-components';

/* Kein abgesetzter Balken mehr: der Kopf ist Teil der Seite und fluchtet mit
   der Inhaltsspalte — so wie in jeder anderen App im Stack. Vorher stand er auf
   eigener Flaeche mit Rahmen, fester Hoehe und Schlagschatten und lief ueber die
   volle Fensterbreite, waehrend der Inhalt darunter bei 1200 px endete: Titel
   und Karten begannen also an verschiedenen Kanten. */
const HeaderContainer = styled.header`
  background: transparent;
  border-bottom: 0;
  box-shadow: none;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  /* Kein Oberpolster: die 20 px zum Leistenrand kommen bereits vom body
     (der Spacer von nav.js beginnt dahinter). Beides zusammen ergab 40 —
     derselbe Doppelabstand wie in hue, PowerHiFi und fog. */
  padding: 0;   /* seitliches Polster kommt von MainContent */
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
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

/* Diese Zeile traegt den GERAETENAMEN, nicht den Seitentitel — der steht
   darunter ("Dashboard", "System", ...) und ist das Gegenstueck zum h1 der
   uebrigen Apps. Sie auf dessen Mass zu bringen war ein Fehlgriff: dann standen
   zwei 40-px-Ueberschriften uebereinander. Sie bleibt klein und uebernimmt nur
   Gewicht und Tracking, damit beide erkennbar aus derselben Schrift kommen. */
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
  background: ${props => props.count > 0 ? '#ff8a80' : 'transparent'};
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
        <Title>Raspberry Pi {piModel} Monitor</Title>
      </LeftSection>
      
      <RightSection>
        <MenuButton onClick={onToggleSidebar} aria-label="Navigation ein-/ausblenden">
          <Icon name="menu" />
        </MenuButton>
        <StatusIndicator>
          <StatusDot connected={isConnected} />
          {isConnected ? 'live' : 'offline'}
        </StatusIndicator>
        
        <AlertsCount count={alerts.length}>
          {alerts.length}
        </AlertsCount>
        
      </RightSection>
    </HeaderContainer>
  );
};

export default Header;