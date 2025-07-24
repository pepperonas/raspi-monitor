import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const SidebarContainer = styled.nav`
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: ${props => props.isOpen ? '280px' : '60px'};
  background: ${props => props.theme.colors.surface};
  border-right: 1px solid ${props => props.theme.colors.border};
  transition: width 0.3s ease;
  z-index: 1000;
  overflow: hidden;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.25);
  
  @media (max-width: 768px) {
    transform: ${props => props.isOpen ? 'translateX(0)' : 'translateX(-100%)'};
    width: 280px;
    transition: transform 0.3s ease;
  }
`;

const SidebarHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Logo = styled.div`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
`;

const SidebarTitle = styled.h2`
  color: ${props => props.theme.colors.text};
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
  opacity: ${props => props.isOpen ? '1' : '0'};
  transition: opacity 0.3s ease;
`;

const NavigationList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const NavigationItem = styled.li`
  margin: 0;
`;

const NavigationLink = styled(Link)`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.textSecondary};
  text-decoration: none;
  transition: all 0.3s ease;
  border-right: 3px solid ${props => props.active ? props.theme.colors.primary : 'transparent'};
  background: ${props => props.active ? `${props.theme.colors.primary}20` : 'transparent'};
  
  &:hover {
    color: ${props => props.theme.colors.primary};
    background: ${props => `${props.theme.colors.primary}10`};
  }
`;

const NavigationIcon = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  margin-right: 16px;
`;

const NavigationText = styled.span`
  white-space: nowrap;
  opacity: ${props => props.isOpen ? '1' : '0'};
  transition: opacity 0.3s ease;
`;

const Sidebar = ({ isOpen, onToggle }) => {
  const location = useLocation();

  const navigationItems = [
    { path: '/dashboard', icon: '📊', text: 'Dashboard' },
    { path: '/metrics', icon: '📈', text: 'Metrics' },
    { path: '/charts', icon: '📋', text: 'Charts' },
    { path: '/alerts', icon: '🚨', text: 'Alerts' },
    { path: '/system', icon: '⚙️', text: 'System' },
    { path: '/settings', icon: '🔧', text: 'Settings' }
  ];

  return (
    <SidebarContainer isOpen={isOpen}>
      <SidebarHeader>
        <Logo>🔥</Logo>
        <SidebarTitle isOpen={isOpen}>Pi Monitor</SidebarTitle>
      </SidebarHeader>
      
      <NavigationList>
        {navigationItems.map((item) => (
          <NavigationItem key={item.path}>
            <NavigationLink 
              to={item.path} 
              active={location.pathname === item.path}
            >
              <NavigationIcon>{item.icon}</NavigationIcon>
              <NavigationText isOpen={isOpen}>{item.text}</NavigationText>
            </NavigationLink>
          </NavigationItem>
        ))}
      </NavigationList>
    </SidebarContainer>
  );
};

export default Sidebar;