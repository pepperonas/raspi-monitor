import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const MetricsContainer = styled.div`
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

const ChartContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ChartTitle = styled.h3`
  color: ${props => props.theme.colors.text};
  margin-bottom: 16px;
  font-size: 1.2rem;
  font-weight: 600;
`;

const TemperatureChart = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
  border-radius: 8px;
  color: white;
  
  ${props => {
    const temp = props.temperature;
    if (temp > 70) return 'background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);';
    if (temp > 60) return 'background: linear-gradient(135deg, #ffa726 0%, #fb8c00 100%);';
    if (temp > 50) return 'background: linear-gradient(135deg, #ffeb3b 0%, #ffc107 100%);';
    return 'background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);';
  }}
`;

const TemperatureValue = styled.div`
  font-size: 3rem;
  font-weight: 700;
`;

const TemperatureInfo = styled.div`
  flex: 1;
`;

const TemperatureLabel = styled.div`
  font-size: 1.2rem;
  margin-bottom: 4px;
`;

const TemperatureSubtext = styled.div`
  font-size: 0.9rem;
  opacity: 0.8;
`;

const MetricsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-top: 20px;
`;

const MetricItem = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  padding: 16px;
  
  h4 {
    color: ${props => props.theme.colors.text};
    margin-bottom: 8px;
    font-size: 1rem;
  }
  
  .value {
    font-size: 1.5rem;
    font-weight: 600;
    color: ${props => props.theme.colors.primary};
  }
  
  .unit {
    font-size: 0.9rem;
    color: ${props => props.theme.colors.textSecondary};
  }
`;

const Metrics = ({ metrics = {}, isConnected = false }) => {
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

  const cpu = metrics.cpu?.[0] || {};
  const memory = metrics.memory?.[0] || {};
  const disk = metrics.disk?.[0] || {};
  const gpu = metrics.gpu?.[0] || {};
  const processes = metrics.processes?.[0] || {};
  const network = metrics.network?.[0] || {};

  return (
    <MetricsContainer>
      <PageTitle>Metrics</PageTitle>
      
      {/* CPU Temperature */}
      <ChartContainer>
        <ChartTitle>🌡️ CPU Temperature</ChartTitle>
        <TemperatureChart temperature={cpu.cpu_temp_celsius || 0}>
          <TemperatureValue>
            {cpu.cpu_temp_celsius ? `${cpu.cpu_temp_celsius}°` : '--'}
          </TemperatureValue>
          <TemperatureInfo>
            <TemperatureLabel>CPU Temperature</TemperatureLabel>
            <TemperatureSubtext>
              Measured using vcgencmd measure_temp
            </TemperatureSubtext>
          </TemperatureInfo>
        </TemperatureChart>
      </ChartContainer>

      {/* GPU Temperature */}
      <ChartContainer>
        <ChartTitle>🎮 GPU Temperature</ChartTitle>
        <TemperatureChart temperature={gpu.gpu_temp_celsius || 0}>
          <TemperatureValue>
            {gpu.gpu_temp_celsius ? `${gpu.gpu_temp_celsius}°` : '--'}
          </TemperatureValue>
          <TemperatureInfo>
            <TemperatureLabel>GPU Temperature</TemperatureLabel>
            <TemperatureSubtext>
              Measured using vcgencmd measure_temp
            </TemperatureSubtext>
          </TemperatureInfo>
        </TemperatureChart>
      </ChartContainer>

      {/* System Metrics */}
      <ChartContainer>
        <ChartTitle>📊 System Metrics</ChartTitle>
        <MetricsList>
          <MetricItem>
            <h4>CPU Usage</h4>
            <div className="value">{cpu.cpu_usage_percent || '--'}<span className="unit">%</span></div>
          </MetricItem>
          <MetricItem>
            <h4>CPU Cores</h4>
            <div className="value">{cpu.cpu_count || '--'}</div>
          </MetricItem>
          <MetricItem>
            <h4>CPU Frequency</h4>
            <div className="value">{cpu.cpu_freq_current || '--'}<span className="unit">GHz</span></div>
          </MetricItem>
          <MetricItem>
            <h4>Memory Usage</h4>
            <div className="value">{memory.usage_percent || '--'}<span className="unit">%</span></div>
          </MetricItem>
          <MetricItem>
            <h4>Memory Used</h4>
            <div className="value">{memory.used_bytes ? formatBytes(memory.used_bytes) : '--'}</div>
          </MetricItem>
          <MetricItem>
            <h4>Memory Total</h4>
            <div className="value">{memory.total_bytes ? formatBytes(memory.total_bytes) : '--'}</div>
          </MetricItem>
          <MetricItem>
            <h4>Disk Usage</h4>
            <div className="value">{disk.usage_percent || '--'}<span className="unit">%</span></div>
          </MetricItem>
          <MetricItem>
            <h4>Disk Available</h4>
            <div className="value">{disk.available_bytes ? formatBytes(disk.available_bytes) : '--'}</div>
          </MetricItem>
          <MetricItem>
            <h4>Total Processes</h4>
            <div className="value">{processes.total_processes || '--'}</div>
          </MetricItem>
          <MetricItem>
            <h4>Running Processes</h4>
            <div className="value">{processes.running_processes || '--'}</div>
          </MetricItem>
          <MetricItem>
            <h4>Network Interface</h4>
            <div className="value">{network.interface_name || 'N/A'}</div>
          </MetricItem>
          <MetricItem>
            <h4>Network Sent</h4>
            <div className="value">{network.bytes_sent ? formatBytes(network.bytes_sent) : '--'}</div>
          </MetricItem>
        </MetricsList>
      </ChartContainer>
    </MetricsContainer>
  );
};

export default Metrics;