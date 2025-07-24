import React, { useState } from 'react';
import styled from 'styled-components';
import { apiRequest } from '../config/api';

const SystemContainer = styled.div`
  padding: 20px;
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
  border-radius: 1rem;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.25), 0 2px 4px -1px rgba(0, 0, 0, 0.15);
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
  border-radius: 1rem;
  padding: 24px;
  margin-top: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.25), 0 2px 4px -1px rgba(0, 0, 0, 0.15);
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
  background-color: ${props => props.active ? (props.color || '#4caf50') : '#666'};
  border: 2px solid ${props => props.active ? (props.color || '#4caf50') : '#666'};
  box-shadow: ${props => props.active ? '0 0 6px ' + (props.color || '#4caf50') : 'none'};
`;

const ToggleButton = styled.button`
  background: ${props => props.active ? '#4caf50' : '#666'};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.active ? '#45a049' : '#555'};
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
          <InfoValue style={{ color: isConnected ? '#4caf50' : '#ff6b6b' }}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </InfoValue>
        </InfoItem>
      </SystemInfo>
      
      <LEDSection>
        <SectionTitle>LED Control</SectionTitle>
        
        <LEDControl>
          <LEDLabel>
            <LEDStatus active={actLedActive} color="#4caf50" />
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
            <LEDStatus active={pwrLedActive} color="#ffa500" />
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