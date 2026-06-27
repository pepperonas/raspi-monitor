import React, { useState, useEffect, useRef } from 'react';
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
  
  @media (max-width: 1024px) {
    transform: ${props => props.isOpen ? 'translateX(0)' : 'translateX(-100%)'};
    width: 280px;
    transition: transform 0.3s ease;
    box-shadow: ${props => props.isOpen ? '2px 0 20px rgba(0, 0, 0, 0.5)' : 'none'};
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  opacity: ${props => props.visible ? '1' : '0'};
  visibility: ${props => props.visible ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
  
  @media (min-width: 1025px) {
    display: none;
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
  position: relative;
`;

/* MD3 active indicator — a single pill that GLIDES between items (spring). */
const ActiveIndicator = styled.div`
  position: absolute;
  left: 0;
  right: 8px;
  top: 0;
  border-radius: 0 28px 28px 0;
  background: ${props => `${props.theme.colors.primary}22`};
  border-left: 3px solid ${props => props.theme.colors.primary};
  transition: transform var(--md-slow, 480ms) var(--md-spring, cubic-bezier(0.34,1.42,0.5,1)),
              height 220ms var(--md-emphasized, ease), opacity 200ms ease;
  pointer-events: none;
  z-index: 0;
`;

const NavigationItem = styled.li`
  margin: 0;
`;

const NavigationLink = styled(Link)`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  padding: 16px 20px;
  color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.textSecondary};
  text-decoration: none;
  transition: color 200ms var(--md-emphasized, ease);

  /* quiet hover state-layer (the sliding pill is the loud one) */
  &:hover {
    color: ${props => props.theme.colors.primary};
    background: ${props => `${props.theme.colors.primary}0f`};
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
  const listRef = useRef(null);
  const [ind, setInd] = useState({ y: 0, h: 0, show: false });

  const navigationItems = [
    { path: '/dashboard', icon: '📊', text: 'Dashboard' },
    { path: '/metrics', icon: '📈', text: 'Metrics' },
    { path: '/charts', icon: '📋', text: 'Charts' },
    { path: '/alerts', icon: '🚨', text: 'Alerts' },
    { path: '/tasks', icon: '⚡', text: 'Tasks' },
    { path: '/system', icon: '⚙️', text: 'System' },
    { path: '/settings', icon: '🔧', text: 'Settings' }
  ];

  // Measure the active item so the indicator can glide to its exact position.
  useEffect(() => {
    const idx = navigationItems.findIndex(i => i.path === location.pathname);
    const li = listRef.current?.querySelectorAll('li')[idx];
    if (li) setInd({ y: li.offsetTop, h: li.offsetHeight, show: true });
    else setInd(s => ({ ...s, show: false }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, isOpen]);

  const handleLinkClick = () => {
    // Close sidebar on mobile when a link is clicked
    if (window.innerWidth <= 1024) {
      onToggle();
    }
  };

  return (
    <>
      <Overlay visible={isOpen} onClick={onToggle} />
      <SidebarContainer isOpen={isOpen}>
        <SidebarHeader>
          <Logo>🔥</Logo>
          <SidebarTitle isOpen={isOpen}>Pi Monitor</SidebarTitle>
        </SidebarHeader>
        
        <NavigationList ref={listRef}>
          <ActiveIndicator style={{ transform: `translateY(${ind.y}px)`, height: `${ind.h}px`, opacity: ind.show ? 1 : 0 }} />
          {navigationItems.map((item) => (
            <NavigationItem key={item.path}>
              <NavigationLink 
                to={item.path} 
                active={location.pathname === item.path}
                onClick={handleLinkClick}
              >
                <NavigationIcon>{item.icon}</NavigationIcon>
                <NavigationText isOpen={isOpen}>{item.text}</NavigationText>
              </NavigationLink>
            </NavigationItem>
          ))}
        </NavigationList>
      </SidebarContainer>
    </>
  );
};

export default Sidebar;