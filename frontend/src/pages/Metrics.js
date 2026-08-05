import React, { useState, useEffect } from 'react';
import Icon from '../components/Icon';
import styled from 'styled-components';
import { apiRequest } from '../config/api';

const MetricsContainer = styled.div`
  /* Kein eigenes Polster: 1200 px MIT 20 px Innenabstand sind ein Satzspiegel
     von 1160 und liegen damit neben allen anderen Apps. Das seitliche Polster
     sitzt aussen an der Inhaltsflaeche — so macht es der Massstab. */
  padding: 0;
  max-width: 1200px;
  margin: 0 auto;
`;

const ChartContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.28);
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
  padding: 22px 24px;
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  color: #fff;

  /* Refined tonal temp-reactive containers (match the Dashboard hero cards). */
  ${props => {
    const temp = props.temperature;
    // Tonale Flaeche aus der Palette statt vier eigener Verlaufspaare.
    const c = props.theme.colors;
    const ton = temp > 70 ? c.error : temp > 50 ? c.warning : c.success;
    const staerke = temp > 70 ? 26 : temp > 60 ? 22 : temp > 50 ? 16 : 14;
    return `background: color-mix(in srgb, ${ton} ${staerke}%, ${c.surface});`;
  }}

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(110% 140% at 92% 0%, rgba(255, 255, 255, 0.22), transparent 55%);
    pointer-events: none;
  }
  & > * { position: relative; }
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
  border-radius: 0.5rem;
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
  const [metricsData, setMetricsData] = useState({});
  const [loading, setLoading] = useState(true);

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
        setMetricsData(data);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
        setMetricsData(metrics);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 1000); // Update every 1 second

    return () => clearInterval(interval);
  }, [metrics]);

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const currentMetrics = Object.keys(metricsData).length > 0 ? metricsData : metrics;
  
  const cpu = currentMetrics.cpu?.[0] || {};
  const memory = currentMetrics.memory?.[0] || {};
  const disk = currentMetrics.disk?.[0] || {};
  const gpu = currentMetrics.gpu?.[0] || {};
  const processes = currentMetrics.processes?.[0] || {};
  const network = currentMetrics.network?.[0] || {};
  
  if (loading && Object.keys(currentMetrics).length === 0) {
    return (
      <MetricsContainer>
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          Loading metrics...
        </div>
      </MetricsContainer>
    );
  }

  return (
    <MetricsContainer>
      
      {/* CPU Temperature */}
      <ChartContainer>
        <ChartTitle><Icon name="thermo" /> CPU Temperature</ChartTitle>
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
        <ChartTitle><Icon name="gpu" /> GPU Temperature</ChartTitle>
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
        <ChartTitle><Icon name="bars" /> System Metrics</ChartTitle>
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