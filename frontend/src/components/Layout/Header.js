import React from 'react';
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

const Title = styled.h1`
  color: ${props => props.theme.colors.text};
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.9rem;
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => props.connected ? '#9cb68f' : '#e16162'};
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
  return (
    <HeaderContainer>
      <LeftSection>
        <MenuButton onClick={onToggleSidebar}>
          ☰
        </MenuButton>
        <Title>Raspberry Pi Monitor</Title>
      </LeftSection>
      
      <RightSection>
        <StatusIndicator>
          <StatusDot connected={isConnected} />
          {isConnected ? 'Connected' : 'Disconnected'}
        </StatusIndicator>
        
        <AlertsCount count={alerts.length}>
          {alerts.length}
        </AlertsCount>
        
        <ThemeToggle onClick={onToggleTheme}>
          {isDarkMode ? '☀️' : '🌙'}
        </ThemeToggle>
      </RightSection>
    </HeaderContainer>
  );
};

export default Header;