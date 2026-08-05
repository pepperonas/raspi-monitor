import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

/* Die Unterseiten als Chip-Reihe, in derselben Bauform wie die Zeitraum-Chips
   in dB-Analyse und Klima — dort ist es dieselbe Aufgabe: eine von mehreren
   Ansichten desselben Gegenstands wählen.
   Vorher lag das in einer 280 px breiten Seitenleiste. Die war nicht nur der
   einzige solche Aufbau im Stack, sie verkürzte die Inhaltsspalte auch von
   1200 auf 922 px — deshalb wirkten die Karten hier gedrängter als überall
   sonst. */
const Row = styled.nav`
  display: flex;
  gap: 0.4rem;
  align-items: center;
  /* overflow-x:auto zwingt overflow-y ebenfalls auf auto — die Zeile wird
     damit zur Scroll-Box und klippt AUCH senkrecht. Die 44-px-Trefferflaeche
     der Chips (::after) ragt ueber deren 27 px hinaus; ohne dieses Polster
     schnitt die Zeile sie ab und nahm die Pillen-Kontur gleich mit
     (clientHeight 27 gegen scrollHeight 35). Der Aussenabstand ist um dasselbe
     Mass verringert, damit der sichtbare Abstand gleich bleibt.
     Keine Backticks in Kommentaren innerhalb eines Template-Literals: sie
     beenden es. */
  padding: 9px 0;
  margin: 0.35rem 0 0.45rem;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const Chip = styled(NavLink)`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  flex: 0 0 auto;
  padding: 0.32rem 0.7rem;
  border-radius: 999px;
  border: 1px solid ${props => props.theme.colors.border};
  background: transparent;
  color: ${props => props.theme.colors.text};
  font-size: 0.78rem;
  font-weight: 650;
  text-decoration: none;
  white-space: nowrap;
  transition: background 0.22s cubic-bezier(0.2, 0, 0, 1),
              color 0.22s cubic-bezier(0.2, 0, 0, 1);

  /* Aktiv = gefüllte Fläche, nicht nur getönt: die Referenz zeichnet den
     gewählten Zustand als Fläche aus. */
  &.active {
    background: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.onAccent};
    border-color: transparent;
  }

  @media (hover: hover) {
    &:not(.active):hover {
      background: color-mix(in srgb, ${props => props.theme.colors.text} 8%, transparent);
    }
  }

  /* 44 px Trefferfläche ohne die Pille aufzublasen — wie bei den kleinen
     Chips im Dashboard. */
  position: relative;
  &::after {
    content: '';
    position: absolute;
    inset: 50% 0 auto 0;
    height: 44px;
    transform: translateY(-50%);
  }

  @media (prefers-reduced-motion: reduce) { transition: none; }
`;

export const PAGES = [
  { path: '/dashboard', text: 'Dashboard' },
  { path: '/metrics',   text: 'Metrics' },
  { path: '/charts',    text: 'Charts' },
  { path: '/alerts',    text: 'Alerts' },
  { path: '/tasks',     text: 'Tasks' },
  { path: '/system',    text: 'System' },
  { path: '/settings',  text: 'Settings' },
];

const PageTabs = () => (
  <Row aria-label="Ansicht">
    {PAGES.map(p => (
      <Chip key={p.path} to={p.path}>{p.text}</Chip>
    ))}
  </Row>
);

export default PageTabs;
