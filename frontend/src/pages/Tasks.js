import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { apiRequest } from '../config/api';

const TasksContainer = styled.div`
  /* Kein eigenes Polster: 1200 px MIT 20 px Innenabstand sind ein Satzspiegel
     von 1160 und liegen damit neben allen anderen Apps. Das seitliche Polster
     sitzt aussen an der Inhaltsflaeche — so macht es der Massstab. */
  padding: 0;
  max-width: 1200px;
  margin: 0 auto;
`;

const ProcessesSection = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.28);
`;

const ProcessTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
`;

const TableHeader = styled.th`
  text-align: left;
  padding: 12px 8px;
  border-bottom: 2px solid ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.text};
  font-weight: 600;
  cursor: ${props => props.sortable ? 'pointer' : 'default'};
  user-select: none;
  position: relative;
  
  &:hover {
    background: ${props => props.sortable ? props.theme.colors.background : 'transparent'};
  }
  
  ${props => props.sortable && `
    &::after {
      content: '${props.sorted === 'asc' ? '↑' : props.sorted === 'desc' ? '↓' : '↕'}';
      position: absolute;
      right: 8px;
      color: ${props.sorted ? props.theme.colors.primary : props.theme.colors.textSecondary};
    }
  `}
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background: ${props => props.theme.colors.background};
  }
  
  &:hover {
    background: ${props => props.theme.colors.border};
  }
`;

const TableCell = styled.td`
  padding: 8px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.text};
  font-size: 0.9rem;
`;

const ProgressBar = styled.div`
  width: 60px;
  height: 8px;
  background: ${props => props.theme.colors.border};
  border-radius: 4px;
  overflow: hidden;
  
  &::after {
    content: '';
    display: block;
    width: ${props => Math.min(props.value || 0, 100)}%;
    height: 100%;
    background: ${props => {
      const val = props.value || 0;
      if (val > 80) return '#ff8a80';
      if (val > 60) return '#f5a04a';
      return '#7ddfa6';
    }};
    transition: width 0.3s ease;
  }
`;

const StatsRow = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const StatCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  padding: 16px;
  min-width: 150px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const Tasks = () => {
  const [processes, setProcesses] = useState([]);
  const [sortBy, setSortBy] = useState('cpu');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Load processes data
  const loadProcesses = async () => {
    setLoading(true);
    try {
      const data = await apiRequest(
        `/api/system/processes?sortBy=${sortBy}&sortOrder=${sortOrder}&limit=30`
      );
      setProcesses(data.processes || []);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to load processes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sortierung ueber die klickbaren Spaltenkoepfe (CPU/RAM) — das Backend
  // sortiert seit 2026-08-14 ECHT (ps --sort); die fruehere Chip-Reihe +
  // der Refresh-Button sind entfernt (Backend ignorierte sortBy, per-
  // Prozess-Netzwerk existiert nicht, die Seite pollt eh alle 5 s).
  const handleSort = (column) => {
    if (sortBy === column) {
      // Same column: toggle order
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      // Different column: set new column and default to desc
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  // Initial-Load + 5-s-Auto-Poll in EINEM Effect, abhaengig von der
  // Sortierung: das fruehere setInterval mit []-Deps hielt eine STALE
  // CLOSURE auf loadProcesses (sortBy='cpu' fuer immer) und ueberschrieb
  // jede Header-Sortierung 5 s spaeter wieder mit der CPU-Reihenfolge.
  useEffect(() => {
    loadProcesses();
    const interval = setInterval(() => loadProcesses(), 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, sortOrder]);

  // Format memory size (null-safe — the backend can omit fields for some processes)
  const formatMemory = (mb) => {
    mb = mb ?? 0;
    if (mb > 1024) {
      return `${(mb / 1024).toFixed(1)}GB`;
    }
    return `${mb.toFixed(0)}MB`;
  };

  // Calculate stats
  const totalProcesses = processes.length;
  const avgCpu = processes.length > 0 ? (processes.reduce((sum, p) => sum + (p.cpu ?? 0), 0) / processes.length).toFixed(1) : 0;
  const avgMemory = processes.length > 0 ? (processes.reduce((sum, p) => sum + (p.memory ?? 0), 0) / processes.length).toFixed(1) : 0;
  const highCpuProcesses = processes.filter(p => p.cpu > 5).length;

  return (
    <TasksContainer>
      
      <StatsRow>
        <StatCard>
          <StatValue>{totalProcesses}</StatValue>
          <StatLabel>Total Processes</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{avgCpu}%</StatValue>
          <StatLabel>Avg CPU</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{avgMemory}%</StatValue>
          <StatLabel>Avg Memory</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{highCpuProcesses}</StatValue>
          <StatLabel>High CPU (>5%)</StatLabel>
        </StatCard>
      </StatsRow>

      <ProcessesSection>
        {lastUpdate && (
          <div style={{ 
            fontSize: '0.8rem', 
            color: '#666', 
            marginBottom: '12px' 
          }}>
            Letzte Aktualisierung: {lastUpdate.toLocaleTimeString()}
          </div>
        )}

        <ProcessTable>
          <thead>
            <tr>
              <TableHeader>PID</TableHeader>
              <TableHeader>User</TableHeader>
              <TableHeader>Command</TableHeader>
              <TableHeader 
                sortable 
                sorted={sortBy === 'cpu' ? sortOrder : null}
                onClick={() => handleSort('cpu')}
              >
                CPU %
              </TableHeader>
              <TableHeader 
                sortable 
                sorted={sortBy === 'memory' ? sortOrder : null}
                onClick={() => handleSort('memory')}
              >
                RAM %
              </TableHeader>
              <TableHeader>RSS</TableHeader>
              <TableHeader>Status</TableHeader>
            </tr>
          </thead>
          <tbody>
            {processes.map((process) => (
              <TableRow key={`${process.pid}-${process.start}`}>
                <TableCell>{process.pid}</TableCell>
                <TableCell>{process.user}</TableCell>
                <TableCell style={{ 
                  maxWidth: '200px', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap' 
                }}>
                  {process.command}
                </TableCell>
                <TableCell>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ProgressBar value={process.cpu ?? 0} />
                    <span>{(process.cpu ?? 0).toFixed(1)}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ProgressBar value={process.memory ?? 0} />
                    <span>{(process.memory ?? 0).toFixed(1)}%</span>
                  </div>
                </TableCell>
                <TableCell>{formatMemory(process.rss / 1024)}</TableCell>
                <TableCell>{process.stat || '-'}</TableCell>
              </TableRow>
            ))}
          </tbody>
        </ProcessTable>

        {processes.length === 0 && !loading && (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: '#666' 
          }}>
            Keine Prozesse gefunden
          </div>
        )}
      </ProcessesSection>
    </TasksContainer>
  );
};

export default Tasks;