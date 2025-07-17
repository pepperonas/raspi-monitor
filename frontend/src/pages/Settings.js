import React from 'react';
import styled from 'styled-components';

const SettingsContainer = styled.div`
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

const SettingsGroup = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const GroupTitle = styled.h3`
  color: ${props => props.theme.colors.text};
  margin-bottom: 16px;
  font-size: 1.2rem;
  font-weight: 600;
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  
  &:last-child {
    border-bottom: none;
  }
`;

const SettingLabel = styled.div`
  font-weight: 500;
  color: ${props => props.theme.colors.text};
`;

const SettingDescription = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.9rem;
  margin-top: 4px;
`;

const Toggle = styled.button`
  background: ${props => props.active ? props.theme.colors.primary : props.theme.colors.border};
  border: none;
  border-radius: 20px;
  width: 50px;
  height: 24px;
  position: relative;
  cursor: pointer;
  transition: background 0.3s ease;
  
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.active ? '28px' : '2px'};
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: left 0.3s ease;
  }
`;

const Settings = ({ isDarkMode, onToggleTheme, wsService }) => {
  return (
    <SettingsContainer>
      <PageTitle>Settings</PageTitle>
      
      <SettingsGroup>
        <GroupTitle>Display</GroupTitle>
        <SettingItem>
          <div>
            <SettingLabel>Dark Mode</SettingLabel>
            <SettingDescription>
              Switch between light and dark themes
            </SettingDescription>
          </div>
          <Toggle active={isDarkMode} onClick={onToggleTheme} />
        </SettingItem>
      </SettingsGroup>

      <SettingsGroup>
        <GroupTitle>System</GroupTitle>
        <SettingItem>
          <div>
            <SettingLabel>WebSocket Connection</SettingLabel>
            <SettingDescription>
              Real-time data updates via WebSocket
            </SettingDescription>
          </div>
          <div style={{ color: wsService?.isConnected ? '#4caf50' : '#ff6b6b' }}>
            {wsService?.isConnected ? 'Connected' : 'Disconnected'}
          </div>
        </SettingItem>
      </SettingsGroup>

      <SettingsGroup>
        <GroupTitle>About</GroupTitle>
        <SettingItem>
          <div>
            <SettingLabel>Version</SettingLabel>
            <SettingDescription>
              Raspberry Pi Monitor
            </SettingDescription>
          </div>
          <div>v1.0.0</div>
        </SettingItem>
      </SettingsGroup>
    </SettingsContainer>
  );
};

export default Settings;