import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const DashboardContainer = styled.div`
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

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const MetricCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
`;

const MetricTitle = styled.h3`
  color: ${props => props.theme.colors.text};
  margin-bottom: 16px;
  font-size: 1.2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MetricValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${props => props.color || props.theme.colors.primary};
  margin-bottom: 8px;
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
  background-color: ${props => props.connected ? '#4CAF50' : '#F44336'};
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
  background: ${props => {
    const temp = props.temperature;
    if (temp > 70) return 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)';
    if (temp > 60) return 'linear-gradient(135deg, #ffa726 0%, #fb8c00 100%)';
    if (temp > 50) return 'linear-gradient(135deg, #ffeb3b 0%, #ffc107 100%)';
    return 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)';
  }};
  color: white;
  
  ${MetricTitle} {
    color: white;
  }
  
  ${MetricValue} {
    color: white;
  }
  
  ${MetricSubtext} {
    color: rgba(255, 255, 255, 0.8);
  }
`;

const Dashboard = ({ metrics = {}, alerts = [], isConnected = false }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getTemperatureColor = (temp) => {
    if (temp > 70) return '#ff6b6b';
    if (temp > 60) return '#ffa726';
    if (temp > 50) return '#ffeb3b';
    return '#4caf50';
  };

  const cpu = metrics.cpu?.[0] || {};
  const memory = metrics.memory?.[0] || {};
  const disk = metrics.disk?.[0] || {};
  const gpu = metrics.gpu?.[0] || {};
  const processes = metrics.processes?.[0] || {};
  const network = metrics.network?.[0] || {};

  return (
    <DashboardContainer>
      <PageTitle>Dashboard</PageTitle>
      
      <ConnectionStatus>
        <StatusIndicator connected={isConnected} />
        {isConnected ? 'Connected' : 'Disconnected'} • Last updated: {currentTime.toLocaleTimeString()}
      </ConnectionStatus>

      <MetricsGrid>
        {/* CPU Temperature */}
        <TemperatureCard temperature={cpu.cpu_temp_celsius || 0}>
          <MetricTitle>
            🌡️ CPU Temperature
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
            🎮 GPU Temperature
          </MetricTitle>
          <MetricValue>
            {gpu.gpu_temp_celsius ? `${gpu.gpu_temp_celsius}°` : '--'}
            <MetricUnit>C</MetricUnit>
          </MetricValue>
          <MetricSubtext>
            Current GPU temperature from vcgencmd
          </MetricSubtext>
        </TemperatureCard>

        {/* CPU Usage */}
        <MetricCard>
          <MetricTitle>
            💻 CPU Usage
          </MetricTitle>
          <MetricValue color={cpu.cpu_usage_percent > 80 ? '#ff6b6b' : undefined}>
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
            🧠 Memory Usage
          </MetricTitle>
          <MetricValue color={memory.usage_percent > 80 ? '#ff6b6b' : undefined}>
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
            💾 Disk Usage
          </MetricTitle>
          <MetricValue color={disk.usage_percent > 80 ? '#ff6b6b' : undefined}>
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
            🌐 Network
          </MetricTitle>
          <MetricValue>
            {network.interface_name || 'N/A'}
          </MetricValue>
          <MetricSubtext>
            ↑ {network.bytes_sent ? formatBytes(network.bytes_sent) : '0 B'} • 
            ↓ {network.bytes_recv ? formatBytes(network.bytes_recv) : '0 B'}
          </MetricSubtext>
        </MetricCard>

        {/* Processes */}
        <MetricCard>
          <MetricTitle>
            ⚙️ Processes
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
            🚨 Recent Alerts
          </MetricTitle>
          <MetricValue color={alerts.length > 0 ? '#ff6b6b' : '#4caf50'}>
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