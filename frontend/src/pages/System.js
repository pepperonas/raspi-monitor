import React from 'react';
import styled from 'styled-components';

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
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

const System = ({ isConnected = false }) => {
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
    </SystemContainer>
  );
};

export default System;