import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { apiRequest } from '../config/api';

const TasksContainer = styled.div`
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

const ProcessesSection = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 1rem;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.25), 0 2px 4px -1px rgba(0, 0, 0, 0.15);
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
      if (val > 80) return '#ff6b6b';
      if (val > 60) return '#ffa500';
      return '#4caf50';
    }};
    transition: width 0.3s ease;
  }
`;

const SortControls = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  align-items: center;
  flex-wrap: wrap;
`;

const SortButton = styled.button`
  background: ${props => props.active ? props.theme.colors.primary : props.theme.colors.surface};
  color: ${props => props.active ? 'white' : props.theme.colors.text};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.active ? props.theme.colors.primary : props.theme.colors.border};
  }
`;

const RefreshButton = styled.button`
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  margin-left: auto;
  
  &:hover {
    background: ${props => props.theme.colors.primaryDark || props.theme.colors.primary};
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
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

  // Handle sorting - simple toggle between asc/desc for same column
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

  // Auto refresh
  useEffect(() => {
    loadProcesses();
  }, [sortBy, sortOrder]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadProcesses();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Format memory size
  const formatMemory = (mb) => {
    if (mb > 1024) {
      return `${(mb / 1024).toFixed(1)}GB`;
    }
    return `${mb.toFixed(0)}MB`;
  };

  // Format network value
  const formatNetwork = (value) => {
    if (value > 1024) {
      return `${(value / 1024).toFixed(1)}MB/s`;
    }
    return `${value.toFixed(1)}KB/s`;
  };

  // Calculate stats
  const totalProcesses = processes.length;
  const avgCpu = processes.length > 0 ? (processes.reduce((sum, p) => sum + p.cpu, 0) / processes.length).toFixed(1) : 0;
  const avgMemory = processes.length > 0 ? (processes.reduce((sum, p) => sum + p.memory, 0) / processes.length).toFixed(1) : 0;
  const highCpuProcesses = processes.filter(p => p.cpu > 5).length;

  return (
    <TasksContainer>
      <PageTitle>Running Tasks</PageTitle>
      
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
        <SortControls>
          <span style={{ color: '#666', marginRight: '12px' }}>Sortieren nach:</span>
          <SortButton 
            active={sortBy === 'cpu'} 
            onClick={() => handleSort('cpu')}
          >
            CPU {sortBy === 'cpu' && (sortOrder === 'desc' ? '↓' : '↑')}
          </SortButton>
          <SortButton 
            active={sortBy === 'memory'} 
            onClick={() => handleSort('memory')}
          >
            RAM {sortBy === 'memory' && (sortOrder === 'desc' ? '↓' : '↑')}
          </SortButton>
          <SortButton 
            active={sortBy === 'network'} 
            onClick={() => handleSort('network')}
          >
            Netzwerk {sortBy === 'network' && (sortOrder === 'desc' ? '↓' : '↑')}
          </SortButton>
          
          <RefreshButton 
            onClick={() => loadProcesses()} 
            disabled={loading}
          >
            {loading ? 'Aktualisiere...' : 'Aktualisieren'}
          </RefreshButton>
        </SortControls>

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
              <TableHeader 
                sortable 
                sorted={sortBy === 'network' ? sortOrder : null}
                onClick={() => handleSort('network')}
              >
                Netzwerk
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
                    <ProgressBar value={process.cpu} />
                    <span>{process.cpu.toFixed(1)}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ProgressBar value={process.memory} />
                    <span>{process.memory.toFixed(1)}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ProgressBar value={process.network} />
                    <span>{formatNetwork(process.network)}</span>
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