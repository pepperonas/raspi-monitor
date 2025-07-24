import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { apiRequest } from '../config/api';

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
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const MetricCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.25), 0 2px 4px -1px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.25), 0 4px 6px -2px rgba(0, 0, 0, 0.15);
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
  background: ${props => {
    const temp = props.temperature;
    if (temp > 70) return 'linear-gradient(135deg, #e16162 0%, #dc2626 100%)';
    if (temp > 60) return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
    if (temp > 50) return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
    return 'linear-gradient(135deg, #9cb68f 0%, #84a373 100%)';
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
            setNetworkTraffic(totalBytesPerSecond / 1024); // Convert to KB/s
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

        {/* Fan Status */}
        <MetricCard>
          <MetricTitle>
            🌀 Fan Status
          </MetricTitle>
          <MetricValue color={gpu.fan_status?.status === 'on' ? '#9cb68f' : '#6b7280'}>
            {gpu.fan_status?.description || 'Unknown'}
          </MetricValue>
          <MetricSubtext>
            Level: {gpu.fan_status?.level !== null ? gpu.fan_status.level : '--'} • 
            Status: {gpu.fan_status?.status || 'unknown'}
          </MetricSubtext>
        </MetricCard>

        {/* CPU Usage */}
        <MetricCard>
          <MetricTitle>
            💻 CPU Usage
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
            🧠 Memory Usage
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
            💾 Disk Usage
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

        {/* Network Traffic Rate */}
        <MetricCard>
          <MetricTitle>
            📊 Network I/O
          </MetricTitle>
          <MetricValue color="#9cb68f">
            {networkTraffic !== null ? networkTraffic.toFixed(1) : '--'}
            <MetricUnit>KB/s</MetricUnit>
          </MetricValue>
          <MetricSubtext>
            Real-time network traffic rate
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