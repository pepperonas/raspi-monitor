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

/* Skin = Suite-Dialekt (.sh-pill aus der vendorten shared-Kopie; NavLink v6
   haengt 'active' selbst an -> .sh-pill.active fuellt Primary). Hier bleibt
   nur, was der Dialekt nicht mitbringt: Chip-Dichte im Kopf (wie fog),
   Link-Layout und die 44-px-Trefferflaeche. */
const Chip = styled(NavLink)`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  flex: 0 0 auto;
  padding: 0.32rem 0.7rem;
  text-decoration: none;
  white-space: nowrap;

  position: relative;
  &::after {
    content: '';
    position: absolute;
    inset: 50% 0 auto 0;
    height: 44px;
    transform: translateY(-50%);
  }
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
      <Chip key={p.path} to={p.path} className="sh-pill">{p.text}</Chip>
    ))}
  </Row>
);

export default PageTabs;
