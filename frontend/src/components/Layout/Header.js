import React, { useState, useEffect } from 'react';
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
  flex-direction: column;
  min-width: 0;
`;

/* Seitenkopf wie in jeder anderen App: App-Name als h1, darunter ein
   Untertitel. Welche Unterseite offen ist, sagt der aktive Reiter — vorher
   standen hier zwei Ueberschriften uebereinander (Geraetename klein,
   Seitenname gross), was es sonst nirgends im Stack gibt. */
const Title = styled.h1`
  color: ${props => props.theme.colors.text};
  font-size: clamp(1.85rem, 5vw, 2.55rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.05;
  margin: 0;
`;

const Subtitle = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.9rem;
  margin-top: 0.35rem;
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
  isConnected,
  alerts = []
}) => {
  // Das Board sagt selbst, was es ist (/api/system/info -> /proc/device-tree/model).
  // Vorher wurde das aus dem Hostnamen abgeleitet, unter dem die Seite
  // ausgeliefert wurde: ueber die Domain stand dort "Raspberry Pi 3 Monitor",
  // waehrend daneben 8 GB RAM und eine Luefterdrehzahl angezeigt wurden —
  // eine Vermutung ueber den Host, ausgegeben als Tatsache ueber die Hardware.
  const [modell, setModell] = useState('');
  useEffect(() => {
    let abgebrochen = false;
    fetch('api/system/info')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (!abgebrochen && d && d.model) setModell(d.model); })
      .catch(() => {});
    return () => { abgebrochen = true; };
  }, []);
  // Aus "Raspberry Pi 5 Model B Rev 1.0" wird "Raspberry Pi 5" — die Revision
  // gehoert auf die System-Seite, nicht in den Kopf.
  const kurz = (modell.match(/^Raspberry Pi\s*\w+/) || [])[0] || modell;

  return (
    <HeaderContainer>
      <LeftSection>
        <Title>Raspi Monitor</Title>
        <Subtitle>{kurz ? `${kurz} · CPU, RAM, Temperatur` : 'CPU, RAM, Temperatur'}</Subtitle>
      </LeftSection>

      <RightSection>
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