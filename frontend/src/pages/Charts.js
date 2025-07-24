import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { apiRequest } from '../config/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const ChartsContainer = styled.div`
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

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
`;

const ChartCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ChartTitle = styled.h3`
  color: ${props => props.theme.colors.text};
  margin-bottom: 20px;
  font-size: 1.3rem;
  font-weight: 500;
`;

const ChartWrapper = styled.div`
  width: 100%;
  height: 300px;
  
  .recharts-cartesian-grid-horizontal line,
  .recharts-cartesian-grid-vertical line {
    stroke: ${props => props.theme.colors.border};
  }
  
  .recharts-text {
    fill: ${props => props.theme.colors.textSecondary};
    font-size: 12px;
  }
  
  .recharts-tooltip-wrapper {
    .recharts-default-tooltip {
      background-color: ${props => props.theme.colors.surface} !important;
      border: 1px solid ${props => props.theme.colors.border} !important;
      border-radius: 0.5rem !important;
      color: ${props => props.theme.colors.text} !important;
    }
  }
`;

const MetricsSummary = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
`;

const MetricCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  padding: 16px;
  text-align: center;
`;

const MetricValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: ${props => props.color || props.theme.colors.primary};
  margin-bottom: 5px;
`;

const MetricLabel = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.9rem;
`;

const TimeRangeSelector = styled.div`
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  align-items: center;
`;

const TimeButton = styled.button`
  background: ${props => props.active ? props.theme.colors.primary : props.theme.colors.surface};
  color: ${props => props.active ? 'white' : props.theme.colors.text};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.theme.colors.primary};
    color: white;
  }
`;

const Charts = ({ metrics = {}, isConnected = false }) => {
  const [timeRange, setTimeRange] = useState('1h');
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // Only fetch data if connected
    if (!isConnected) {
      setChartData([]);
      return;
    }

    // Fetch historical chart data from database
    const fetchChartData = async () => {
      try {
        const data = await apiRequest(`/api/metrics/charts?range=${timeRange}&limit=50`);
        
        // Convert database data to Recharts format
        const chartPoints = [];
        const maxLength = Math.max(
          data.data.cpu?.length || 0,
          data.data.memory?.length || 0,
          data.data.temperature?.length || 0,
          data.data.network?.length || 0
        );
        
        for (let i = 0; i < maxLength; i++) {
          const cpuPoint = data.data.cpu?.[i];
          const memoryPoint = data.data.memory?.[i];
          const tempPoint = data.data.temperature?.[i];
          const networkPoint = data.data.network?.[i];
          
          // Use the first available timestamp
          const timestamp = cpuPoint?.timestamp || memoryPoint?.timestamp || tempPoint?.timestamp || networkPoint?.timestamp;
          
          if (timestamp) {
            // Ensure timestamp is properly parsed as UTC and converted to local time
            const utcTime = new Date(timestamp);
            const localTimeString = utcTime.toLocaleTimeString('de-DE', { 
              hour: '2-digit', 
              minute: '2-digit',
              timeZone: 'Europe/Berlin'
            });
            
            chartPoints.push({
              timestamp: localTimeString,
              fullTimestamp: timestamp,
              cpu: cpuPoint?.value || null,
              memory: memoryPoint?.value || null,
              temperature: tempPoint?.value || null,
              network: networkPoint?.value || null
            });
          }
        }
        
        // Sort by timestamp and take most recent points
        chartPoints.sort((a, b) => new Date(a.fullTimestamp) - new Date(b.fullTimestamp));
        
        setChartData(chartPoints);
      } catch (error) {
        console.error('Failed to fetch historical chart data:', error);
        setChartData([]);
      }
    };

    // Initial fetch
    fetchChartData();
    
    // Refresh data every 5 seconds for historical data
    const interval = setInterval(fetchChartData, 5000);
    
    return () => clearInterval(interval);
  }, [timeRange, isConnected]);

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: '#343845',
          border: '1px solid #4a5568',
          borderRadius: '0.5rem',
          padding: '12px',
          color: '#d1d5db'
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>{`Zeit: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ margin: '4px 0', color: entry.color }}>
              {`${entry.name}: ${entry.value !== null ? entry.value.toFixed(1) : '--'}${getUnit(entry.dataKey)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const getUnit = (dataKey) => {
    const units = {
      cpu: '%',
      memory: '%',
      temperature: '°C',
      network: ' KB/s'
    };
    return units[dataKey] || '';
  };

  const getCurrentMetrics = () => {
    if (!isConnected || chartData.length === 0) {
      return { cpu: '--', memory: '--', temperature: '--', network: '--' };
    }
    
    const lastPoint = chartData[chartData.length - 1];
    
    return {
      cpu: lastPoint.cpu !== null ? lastPoint.cpu.toFixed(1) : '--',
      memory: lastPoint.memory !== null ? lastPoint.memory.toFixed(1) : '--',
      temperature: lastPoint.temperature !== null ? lastPoint.temperature.toFixed(1) : '--',
      network: lastPoint.network !== null ? lastPoint.network.toFixed(0) : '--'
    };
  };

  const currentMetrics = getCurrentMetrics();

  if (!isConnected) {
    return (
      <ChartsContainer>
        <PageTitle>System Charts</PageTitle>
        <div style={{ 
          textAlign: 'center', 
          color: '#e16162', 
          marginTop: '40px',
          padding: '40px',
          background: 'rgba(225, 97, 98, 0.1)',
          borderRadius: '1rem',
          border: '1px solid rgba(225, 97, 98, 0.2)'
        }}>
          <h3 style={{ marginBottom: '16px', color: '#e16162' }}>⚠️ Nicht verbunden</h3>
          <p style={{ color: '#9ca3af' }}>Keine Diagrammdaten verfügbar</p>
        </div>
      </ChartsContainer>
    );
  }

  return (
    <ChartsContainer>
      <PageTitle>System Charts</PageTitle>
      
      <TimeRangeSelector>
        <span>Zeitbereich: </span>
        {['1h', '6h', '24h', '7d'].map(range => (
          <TimeButton
            key={range}
            active={timeRange === range}
            onClick={() => setTimeRange(range)}
          >
            {range}
          </TimeButton>
        ))}
      </TimeRangeSelector>

      <MetricsSummary>
        <MetricCard>
          <MetricValue color="#9cb68f">{currentMetrics.cpu}%</MetricValue>
          <MetricLabel>CPU Usage</MetricLabel>
        </MetricCard>
        <MetricCard>
          <MetricValue color="#688db1">{currentMetrics.memory}%</MetricValue>
          <MetricLabel>Memory Usage</MetricLabel>
        </MetricCard>
        <MetricCard>
          <MetricValue color="#f59e0b">{currentMetrics.temperature}°C</MetricValue>
          <MetricLabel>Temperature</MetricLabel>
        </MetricCard>
        <MetricCard>
          <MetricValue color="#a78bfa">{currentMetrics.network} KB/s</MetricValue>
          <MetricLabel>Network I/O</MetricLabel>
        </MetricCard>
      </MetricsSummary>

      <ChartsGrid>
        <ChartCard>
          <ChartTitle>CPU Usage</ChartTitle>
          <ChartWrapper>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tick={{ fontSize: 11 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tick={{ fontSize: 11 }}
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="cpu" 
                  stroke="#9cb68f" 
                  strokeWidth={2}
                  dot={false}
                  name="CPU"
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </ChartCard>
        
        <ChartCard>
          <ChartTitle>Memory Usage</ChartTitle>
          <ChartWrapper>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tick={{ fontSize: 11 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tick={{ fontSize: 11 }}
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="memory" 
                  stroke="#688db1" 
                  strokeWidth={2}
                  dot={false}
                  name="Memory"
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </ChartCard>
        
        <ChartCard>
          <ChartTitle>Temperature</ChartTitle>
          <ChartWrapper>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tick={{ fontSize: 11 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tick={{ fontSize: 11 }}
                  domain={['dataMin - 5', 'dataMax + 5']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="temperature" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  dot={false}
                  name="Temperature"
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </ChartCard>
        
        <ChartCard>
          <ChartTitle>Network I/O</ChartTitle>
          <ChartWrapper>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tick={{ fontSize: 11 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tick={{ fontSize: 11 }}
                  domain={[0, 'dataMax + 100']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="network" 
                  stroke="#a78bfa" 
                  strokeWidth={2}
                  dot={false}
                  name="Network"
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </ChartCard>
      </ChartsGrid>
    </ChartsContainer>
  );
};

export default Charts;