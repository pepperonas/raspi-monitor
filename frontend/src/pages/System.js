import React, { useState } from 'react';
import styled from 'styled-components';
import { apiRequest } from '../config/api';

const SystemContainer = styled.div`
  /* Kein eigenes Polster: 1200 px MIT 20 px Innenabstand sind ein Satzspiegel
     von 1160 und liegen damit neben allen anderen Apps. Das seitliche Polster
     sitzt aussen an der Inhaltsflaeche — so macht es der Massstab. */
  padding: 0;
  max-width: 1200px;
  margin: 0 auto;
`;

const PageTitle = styled.h1`
  color: ${props => props.theme.colors.text};
  margin-bottom: 30px;
  font-size: 2.5rem;
  font-weight: 300;
`;

const SystemInfo = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.28);
`;

const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  
  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.div`
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

const InfoValue = styled.div`
  color: ${props => props.theme.colors.textSecondary};
`;

const LEDSection = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 20px;
  padding: 24px;
  margin-top: 20px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.28);
`;

const SectionTitle = styled.h2`
  color: ${props => props.theme.colors.text};
  margin-bottom: 20px;
  font-size: 1.5rem;
  font-weight: 400;
`;

const LEDControl = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  
  &:last-child {
    border-bottom: none;
  }
`;

const LEDLabel = styled.div`
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LEDStatus = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${props => props.active ? (props.color || '#7ddfa6') : '#666'};
  border: 2px solid ${props => props.active ? (props.color || '#7ddfa6') : '#666'};
  box-shadow: ${props => props.active ? '0 0 6px ' + (props.color || '#7ddfa6') : 'none'};
`;

const ToggleButton = styled.button`
  background: ${props => props.active ? '#7ddfa6' : '#666'};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.active ? props.theme.colors.success : props.theme.colors.textMuted};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const System = ({ isConnected = false }) => {
  const [actLedActive, setActLedActive] = useState(true);
  const [pwrLedActive, setPwrLedActive] = useState(true);
  const [permanentMode, setPermanentMode] = useState(false);

  const toggleLED = async (ledType, isActive) => {
    try {
      const result = await apiRequest('/api/system/led-control', {
        method: 'POST',
        body: JSON.stringify({
          led: ledType,
          action: isActive ? 'on' : 'off',
          permanent: permanentMode
        })
      });
      
      console.log('LED control result:', result);
      
      if (ledType === 'ACT') {
        setActLedActive(isActive);
      } else if (ledType === 'PWR') {
        setPwrLedActive(isActive);
      }
    } catch (error) {
      console.error('LED control error:', error);
      alert('LED-Steuerung fehlgeschlagen: ' + error.message);
    }
  };

  const toggleBothLEDs = async (isActive) => {
    await toggleLED('ACT', isActive);
    await toggleLED('PWR', isActive);
  };

  return (
    <SystemContainer>
      <PageTitle>System Information</PageTitle>
      <SystemInfo>
        <InfoItem>
          <InfoLabel>Hostname</InfoLabel>
          <InfoValue>raspberrypi</InfoValue>
        </InfoItem>
        <InfoItem>
          <InfoLabel>Platform</InfoLabel>
          <InfoValue>Linux</InfoValue>
        </InfoItem>
        <InfoItem>
          <InfoLabel>Architecture</InfoLabel>
          <InfoValue>arm64</InfoValue>
        </InfoItem>
        <InfoItem>
          <InfoLabel>Kernel</InfoLabel>
          <InfoValue>Linux 6.12.34+rpt-rpi-v8</InfoValue>
        </InfoItem>
        <InfoItem>
          <InfoLabel>Connection Status</InfoLabel>
          <InfoValue style={{ color: isConnected ? '#7ddfa6' : '#ff8a80' }}>
            {isConnected ? 'live' : 'offline'}
          </InfoValue>
        </InfoItem>
      </SystemInfo>
      
      <LEDSection>
        <SectionTitle>LED Control</SectionTitle>
        
        <LEDControl>
          <LEDLabel>
            <LEDStatus active={actLedActive} color="#7ddfa6" />
            Activity LED (ACT)
          </LEDLabel>
          <ToggleButton 
            active={actLedActive} 
            onClick={() => toggleLED('ACT', !actLedActive)}
          >
            {actLedActive ? 'EIN' : 'AUS'}
          </ToggleButton>
        </LEDControl>
        
        <LEDControl>
          <LEDLabel>
            <LEDStatus active={pwrLedActive} color="#f5a04a" />
            Power LED (PWR)
          </LEDLabel>
          <ToggleButton 
            active={pwrLedActive} 
            onClick={() => toggleLED('PWR', !pwrLedActive)}
          >
            {pwrLedActive ? 'EIN' : 'AUS'}
          </ToggleButton>
        </LEDControl>
        
        <LEDControl>
          <LEDLabel>
            Permanent Mode (Reboot-fest)
          </LEDLabel>
          <ToggleButton 
            active={permanentMode} 
            onClick={() => setPermanentMode(!permanentMode)}
          >
            {permanentMode ? 'EIN' : 'AUS'}
          </ToggleButton>
        </LEDControl>
        
        <LEDControl>
          <LEDLabel>
            Alle LEDs
          </LEDLabel>
          <ButtonGroup>
            <ToggleButton 
              active={true} 
              onClick={() => toggleBothLEDs(true)}
            >
              Alle EIN
            </ToggleButton>
            <ToggleButton 
              active={false} 
              onClick={() => toggleBothLEDs(false)}
            >
              Alle AUS
            </ToggleButton>
          </ButtonGroup>
        </LEDControl>
      </LEDSection>
    </SystemContainer>
  );
};

export default System;