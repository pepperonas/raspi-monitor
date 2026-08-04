import React, { useState, useEffect, useRef } from 'react';
import Icon from '../components/Icon';
import styled from 'styled-components';
import { apiRequest } from '../config/api';

const DashboardContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const PageTitle = styled.h1`
  /* Wie die Referenz: eine Groesse, ein Gewicht, keine Verlaufsfuellung.
     Der Farbverlauf im Text war das einzige Display-Element im Stack, das
     die Ueberschrift zur Grafik machte statt zur Ueberschrift. */
  margin-bottom: 8px;
  font-size: clamp(1.85rem, 5vw, 2.55rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.05;
  color: ${props => props.theme.colors.text};
  width: fit-content;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const MetricCard = styled.div.attrs({ 'data-tilt': true })`
  position: relative;
  /* Hoehe ueber Kontur und Flaechenton, wie in der Referenz — nicht ueber eine
     zusaetzliche Flaechenstufe plus Schatten plus Glanzkante. */
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  /* Aus dem Theme, nicht fest verdrahtet — sonst laeuft die eine Karte
     wieder aus dem Raster, sobald der Token sich aendert. */
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: 1.1rem 1.15rem;
  box-shadow: none;
  transition: transform 220ms var(--md-spring, ease), box-shadow 260ms var(--md-emphasized, ease), border-color 260ms ease;
  transform-style: preserve-3d;

  &:hover {
    border-color: ${props => props.theme.colors.borderStrong};
  }
`;

/* Kleines Versal-Label ueber der grossen Zahl — die Kachel-Auszeichnung der
   Referenz. Die Hierarchie traegt dort die Zahl, nicht die Ueberschrift. */
const MetricTitle = styled.h3`
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 0;
  font-size: 0.76rem;
  font-weight: 650;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MetricValue = styled.div`
  font-size: clamp(1.65rem, 4vw, 2.25rem);
  font-weight: 800;
  letter-spacing: -0.015em;
  line-height: 1.05;
  margin-top: 0.4rem;
  color: ${props => props.color || props.theme.colors.primary};
  margin-bottom: 8px;
  font-variant-numeric: tabular-nums;   /* live digits don't jitter */
`;

const MetricUnit = styled.span`
  font-size: 1rem;
  color: ${props => props.theme.colors.textSecondary};
  font-weight: 400;
`;

const MetricSubtext = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.9rem;
  margin-top: 8px;
`;

const StatusIndicator = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${props => props.connected ? '#9cb68f' : '#e16162'};
  animation: ${props => props.connected ? 'pulse 2s infinite' : 'none'};

  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

const ConnectionStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.9rem;
  margin-bottom: 20px;
`;

const TemperatureCard = styled(MetricCard)`
  border: none;
  overflow: hidden;
  /* Richer, tonal temp-reactive containers (MD3 container colours, not neon). */
  background: ${props => {
    const temp = props.temperature;
    if (temp > 70) return 'linear-gradient(135deg, #a83236 0%, #6d1c20 100%)';
    if (temp > 60) return 'linear-gradient(135deg, #bd7a2c 0%, #8a531a 100%)';
    if (temp > 50) return 'linear-gradient(135deg, #b0863d 0%, #7e5d24 100%)';
    return 'linear-gradient(135deg, #4a6a58 0%, #324f3e 100%)';
  }};
  color: #fff;

  /* Soft radial highlight in the top-right = expressive "lit" hero surface. */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(120% 92% at 86% 4%, rgba(255, 255, 255, 0.24), transparent 56%);
    pointer-events: none;
  }

  ${MetricTitle}, ${MetricValue} { color: #fff; position: relative; }
  ${MetricSubtext} { color: rgba(255, 255, 255, 0.84); position: relative; }
`;

const Dashboard = ({ metrics = {}, alerts = [], isConnected = false }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dashboardMetrics, setDashboardMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const [networkTraffic, setNetworkTraffic] = useState(null);
  const [previousNetworkData, setPreviousNetworkData] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const data = await apiRequest('/api/metrics');
        setDashboardMetrics(data);
        
        // Calculate network traffic rate
        const currentNetworkData = data.network?.[0];
        if (currentNetworkData && previousNetworkData) {
          const timeDiff = (new Date(currentNetworkData.timestamp) - new Date(previousNetworkData.timestamp)) / 1000;
          if (timeDiff > 0) {
            const sentDiff = Math.max(0, parseFloat(currentNetworkData.bytes_sent) - parseFloat(previousNetworkData.bytes_sent));
            const recvDiff = Math.max(0, parseFloat(currentNetworkData.bytes_recv) - parseFloat(previousNetworkData.bytes_recv));
            const totalBytesPerSecond = (sentDiff + recvDiff) / timeDiff;
            setNetworkTraffic(totalBytesPerSecond); // bytes/s — unit auto-scaled at render (fmtRate)
          }
        }
        
        if (currentNetworkData) {
          setPreviousNetworkData(currentNetworkData);
        }
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
        // Use WebSocket metrics as fallback
        setDashboardMetrics(metrics);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 1000); // Update every 1 second

    return () => clearInterval(interval);
  }, [metrics, previousNetworkData]);

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  // Auto-scaling transfer rate: bytes/s -> B/s, KB/s, MB/s, GB/s (returns value + unit split).
  const fmtRate = (bps) => {
    if (bps == null || isNaN(bps)) return { v: '--', u: 'KB/s' };
    const u = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
    let i = 0, v = bps;
    while (v >= 1024 && i < u.length - 1) { v /= 1024; i++; }
    return { v: v.toFixed(v >= 100 || i === 0 ? 0 : 1), u: u[i] };
  };
  const netRate = fmtRate(networkTraffic);

  const getTemperatureColor = (temp) => {
    if (temp > 70) return '#e16162';
    if (temp > 60) return '#f59e0b';
    if (temp > 50) return '#f59e0b';
    return '#9cb68f';
  };

  // Use dashboard metrics or fallback to WebSocket metrics
  const currentMetrics = Object.keys(dashboardMetrics).length > 0 ? dashboardMetrics : metrics;
  
  const cpu = currentMetrics.cpu?.[0] || {};
  const memory = currentMetrics.memory?.[0] || {};
  const disk = currentMetrics.disk?.[0] || {};
  const gpu = currentMetrics.gpu?.[0] || {};
  const processes = currentMetrics.processes?.[0] || {};
  const network = currentMetrics.network?.[0] || {};

  // Cursor-reactive tilt — a few degrees toward the pointer, damped by the card's
  // own transform transition. Gated to real pointers (playbook: touch pays nothing).
  const lastTilt = useRef(null);
  const canTilt = useRef(typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches);
  const onTilt = (e) => {
    if (!canTilt.current) return;
    const card = e.target.closest('[data-tilt]');
    if (lastTilt.current && lastTilt.current !== card) { lastTilt.current.style.transform = ''; lastTilt.current = null; }
    if (!card) return;
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(820px) rotateX(${(-py * 4).toFixed(2)}deg) rotateY(${(px * 4).toFixed(2)}deg) translateY(-4px)`;
    lastTilt.current = card;
  };
  const offTilt = () => { if (lastTilt.current) { lastTilt.current.style.transform = ''; lastTilt.current = null; } };

  if (loading && Object.keys(currentMetrics).length === 0) {
    return (
      <DashboardContainer>
        <PageTitle>Dashboard</PageTitle>
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          Loading metrics...
        </div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <PageTitle>Dashboard</PageTitle>
      
      <ConnectionStatus>
        <StatusIndicator connected={isConnected} />
        {isConnected ? 'Connected' : 'Disconnected'} • Last updated: {currentTime.toLocaleTimeString()}
      </ConnectionStatus>

      <MetricsGrid className="md-stagger" onMouseMove={onTilt} onMouseLeave={offTilt}>
        {/* CPU Temperature */}
        <TemperatureCard temperature={cpu.cpu_temp_celsius || 0}>
          <MetricTitle>
            <Icon name="thermo" /> CPU Temperature
          </MetricTitle>
          <MetricValue>
            {cpu.cpu_temp_celsius ? `${cpu.cpu_temp_celsius}°` : '--'}
            <MetricUnit>C</MetricUnit>
          </MetricValue>
          <MetricSubtext>
            Current CPU temperature from vcgencmd
          </MetricSubtext>
        </TemperatureCard>

        {/* GPU Temperature */}
        <TemperatureCard temperature={gpu.gpu_temp_celsius || 0}>
          <MetricTitle>
            <Icon name="gpu" /> GPU Temperature
          </MetricTitle>
          <MetricValue>
            {gpu.gpu_temp_celsius ? `${gpu.gpu_temp_celsius}°` : '--'}
            <MetricUnit>C</MetricUnit>
          </MetricValue>
          <MetricSubtext>
            Current GPU temperature from vcgencmd
          </MetricSubtext>
        </TemperatureCard>

        {/* Fan Status */}
        <MetricCard>
          <MetricTitle>
            <Icon name="fan" /> Fan Status
          </MetricTitle>
          <MetricValue color={gpu.fan_status?.status === 'on' ? '#9cb68f' : '#6b7280'}>
            {gpu.fan_status?.description || 'Unknown'}
          </MetricValue>
          <MetricSubtext>
            Level: {(gpu.fan_status && gpu.fan_status.level !== null) ? gpu.fan_status.level : '--'} • 
            Status: {gpu.fan_status?.status || 'unknown'}
          </MetricSubtext>
        </MetricCard>

        {/* CPU Usage */}
        <MetricCard>
          <MetricTitle>
            <Icon name="cpu" /> CPU Usage
          </MetricTitle>
          <MetricValue color={cpu.cpu_usage_percent > 80 ? '#e16162' : '#688db1'}>
            {cpu.cpu_usage_percent ? `${cpu.cpu_usage_percent}` : '--'}
            <MetricUnit>%</MetricUnit>
          </MetricValue>
          <MetricSubtext>
            {cpu.cpu_count ? `${cpu.cpu_count} cores` : ''} • {cpu.cpu_freq_current ? `${cpu.cpu_freq_current} GHz` : ''}
          </MetricSubtext>
        </MetricCard>

        {/* Memory Usage */}
        <MetricCard>
          <MetricTitle>
            <Icon name="memory" /> Memory Usage
          </MetricTitle>
          <MetricValue color={memory.usage_percent > 80 ? '#e16162' : '#688db1'}>
            {memory.usage_percent ? `${memory.usage_percent}` : '--'}
            <MetricUnit>%</MetricUnit>
          </MetricValue>
          <MetricSubtext>
            {memory.used_bytes && memory.total_bytes ? 
              `${formatBytes(memory.used_bytes)} / ${formatBytes(memory.total_bytes)}` : 
              'No data'
            }
          </MetricSubtext>
        </MetricCard>

        {/* Disk Usage */}
        <MetricCard>
          <MetricTitle>
            <Icon name="save" /> Disk Usage
          </MetricTitle>
          <MetricValue color={disk.usage_percent > 80 ? '#e16162' : '#688db1'}>
            {disk.usage_percent ? `${disk.usage_percent}` : '--'}
            <MetricUnit>%</MetricUnit>
          </MetricValue>
          <MetricSubtext>
            {disk.mount_point || 'Root'} • {disk.available_bytes && disk.total_bytes ? 
              `${formatBytes(disk.available_bytes)} free` : 
              'No data'
            }
          </MetricSubtext>
        </MetricCard>

        {/* Network */}
        <MetricCard>
          <MetricTitle>
            <Icon name="globe" /> Network
          </MetricTitle>
          <MetricValue>
            {network.interface_name || 'N/A'}
          </MetricValue>
          <MetricSubtext>
            ↑ {network.bytes_sent ? formatBytes(network.bytes_sent) : '0 B'} • 
            ↓ {network.bytes_recv ? formatBytes(network.bytes_recv) : '0 B'}
          </MetricSubtext>
        </MetricCard>

        {/* Network Traffic Rate */}
        <MetricCard>
          <MetricTitle>
            <Icon name="bars" /> Network I/O
          </MetricTitle>
          <MetricValue color="#9cb68f">
            {netRate.v}
            <MetricUnit>{netRate.u}</MetricUnit>
          </MetricValue>
          <MetricSubtext>
            Real-time network traffic rate
          </MetricSubtext>
        </MetricCard>

        {/* Processes */}
        <MetricCard>
          <MetricTitle>
            <Icon name="processes" /> Processes
          </MetricTitle>
          <MetricValue>
            {processes.total_processes || '--'}
          </MetricValue>
          <MetricSubtext>
            {processes.running_processes || 0} running • {processes.sleeping_processes || 0} sleeping
          </MetricSubtext>
        </MetricCard>

        {/* Alerts */}
        <MetricCard>
          <MetricTitle>
            <Icon name="siren" /> Recent Alerts
          </MetricTitle>
          <MetricValue color={alerts.length > 0 ? '#e16162' : '#9cb68f'}>
            {alerts.length}
          </MetricValue>
          <MetricSubtext>
            {alerts.length > 0 ? 
              `Latest: ${alerts[0]?.alert_type || 'Unknown'}` : 
              'No recent alerts'
            }
          </MetricSubtext>
        </MetricCard>
      </MetricsGrid>
    </DashboardContainer>
  );
};

export default Dashboard;