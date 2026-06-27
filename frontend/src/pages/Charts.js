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
  ResponsiveContainer
} from 'recharts';

// ---- formatting helpers ----------------------------------------------------
const humanRate = (bps) => {
  if (bps === null || bps === undefined || isNaN(bps)) return '--';
  const u = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
  let v = Math.max(0, bps), i = 0;
  while (v >= 1024 && i < u.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(v >= 100 || i === 0 ? 0 : 1)} ${u[i]}`;
};

const ACCENT = { cpu: '#9cb68f', memory: '#b3c5ff', temperature: '#f59e0b', network: '#d0bcff' };

const ChartsContainer = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

const PageTitle = styled.h1`
  color: ${props => props.theme.colors.text};
  margin-bottom: 24px;
  font-size: 2.2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(440px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
`;

const ChartCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 28px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
`;

const ChartTitle = styled.h3`
  color: ${props => props.theme.colors.text};
  margin-bottom: 18px;
  font-size: 1.15rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  &::before {
    content: '';
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${props => props.dotcolor || props.theme.colors.primary};
    box-shadow: 0 0 10px ${props => props.dotcolor || props.theme.colors.primary};
  }
`;

const ChartWrapper = styled.div`
  width: 100%;
  height: 300px;
  .recharts-cartesian-grid-horizontal line,
  .recharts-cartesian-grid-vertical line { stroke: ${props => props.theme.colors.border}; }
  .recharts-text { fill: ${props => props.theme.colors.textSecondary}; font-size: 12px; }
`;

const MetricsSummary = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 28px;
`;

const MetricCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 24px;
  padding: 20px;
  text-align: center;
`;

const MetricValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.color || props.theme.colors.primary};
  margin-bottom: 6px;
  font-variant-numeric: tabular-nums;
`;

const MetricLabel = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.85rem;
  font-weight: 500;
`;

const TimeRangeSelector = styled.div`
  margin-bottom: 24px;
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  span { color: ${props => props.theme.colors.textSecondary}; margin-right: 4px; }
`;

const TimeButton = styled.button`
  background: ${props => props.active ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.active ? '#00316e' : props.theme.colors.text};
  border: 1px solid ${props => props.active ? props.theme.colors.primary : props.theme.colors.border};
  border-radius: 9999px;
  padding: 8px 18px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(.2,0,0,1);
  &:hover { background: ${props => props.active ? props.theme.colors.primary : 'rgba(179,197,255,0.12)'}; }
`;

const Charts = ({ isConnected = false }) => {
  const [timeRange, setTimeRange] = useState('1h');
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (!isConnected) { setChartData([]); return; }

    const labelFor = (utc, range) => {
      const o = { timeZone: 'Europe/Berlin' };
      if (range === '7d') return utc.toLocaleDateString('de-DE', { ...o, day: '2-digit', month: '2-digit' });
      if (range === '24h') return utc.toLocaleString('de-DE', { ...o, weekday: 'short', hour: '2-digit', minute: '2-digit' });
      return utc.toLocaleTimeString('de-DE', { ...o, hour: '2-digit', minute: '2-digit' });
    };

    const fetchChartData = async () => {
      try {
        const data = await apiRequest(`/api/metrics/charts?range=${timeRange}`);
        const d = data.data || {};
        const maxLength = Math.max(d.cpu?.length || 0, d.memory?.length || 0, d.temperature?.length || 0, d.network?.length || 0);

        const pts = [];
        for (let i = 0; i < maxLength; i++) {
          const ts = d.cpu?.[i]?.timestamp || d.memory?.[i]?.timestamp || d.temperature?.[i]?.timestamp || d.network?.[i]?.timestamp;
          if (!ts) continue;
          pts.push({
            fullTimestamp: ts,
            t: new Date(ts).getTime(),
            cpu: d.cpu?.[i]?.value ?? null,
            memory: d.memory?.[i]?.value ?? null,
            temperature: d.temperature?.[i]?.value ?? null,
            netRaw: d.network?.[i]?.value ?? null,   // cumulative bytes_recv
          });
        }
        pts.sort((a, b) => a.t - b.t);

        // derive network RATE (B/s) from the cumulative counter deltas
        for (let i = 0; i < pts.length; i++) {
          if (i === 0 || pts[i].netRaw === null || pts[i - 1].netRaw === null) { pts[i].network = null; }
          else {
            const dBytes = pts[i].netRaw - pts[i - 1].netRaw;
            const dSec = (pts[i].t - pts[i - 1].t) / 1000;
            pts[i].network = (dBytes >= 0 && dSec > 0) ? dBytes / dSec : null; // negative = counter reset
          }
          pts[i].timestamp = labelFor(new Date(pts[i].fullTimestamp), timeRange);
        }
        setChartData(pts);
      } catch (e) {
        console.error('Failed to fetch chart data:', e);
        setChartData([]);
      }
    };

    fetchChartData();
    const iv = setInterval(fetchChartData, 5000);
    return () => clearInterval(iv);
  }, [timeRange, isConnected]);

  const fmtVal = (key, v) => {
    if (v === null || v === undefined) return '--';
    if (key === 'network') return humanRate(v);
    if (key === 'temperature') return `${v.toFixed(1)} °C`;
    return `${v.toFixed(1)} %`;
  };

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const full = payload[0]?.payload?.fullTimestamp;
    const when = full ? new Date(full).toLocaleString('de-DE', { timeZone: 'Europe/Berlin' }) : '';
    return (
      <div style={{ background: '#1c1d23', border: '1px solid #44464f', borderRadius: 16, padding: 12, color: '#e4e2e9' }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 700, fontSize: 12 }}>{when}</p>
        {payload.map((e, i) => (
          <p key={i} style={{ margin: '4px 0', color: e.color }}>{`${e.name}: ${fmtVal(e.dataKey, e.value)}`}</p>
        ))}
      </div>
    );
  };

  const last = chartData[chartData.length - 1] || {};
  const cur = {
    cpu: last.cpu != null ? last.cpu.toFixed(1) : '--',
    memory: last.memory != null ? last.memory.toFixed(1) : '--',
    temperature: last.temperature != null ? last.temperature.toFixed(1) : '--',
    network: humanRate(last.network),
  };

  if (!isConnected) {
    return (
      <ChartsContainer>
        <PageTitle>System Charts</PageTitle>
        <div style={{ textAlign: 'center', color: '#e16162', marginTop: 40, padding: 40, background: 'rgba(225,97,98,0.1)', borderRadius: 28, border: '1px solid rgba(225,97,98,0.2)' }}>
          <h3 style={{ marginBottom: 16, color: '#e16162' }}>⚠️ Nicht verbunden</h3>
          <p style={{ color: '#9ca3af' }}>Keine Diagrammdaten verfügbar</p>
        </div>
      </ChartsContainer>
    );
  }

  const charts = [
    { key: 'cpu', title: 'CPU Usage', domain: [0, 100], yfmt: (v) => `${v}%` },
    { key: 'memory', title: 'Memory Usage', domain: [0, 100], yfmt: (v) => `${v}%` },
    { key: 'temperature', title: 'Temperature', domain: ['dataMin - 5', 'dataMax + 5'], yfmt: (v) => `${v}°` },
    { key: 'network', title: 'Network I/O (Empfang)', domain: [0, 'auto'], yfmt: humanRate },
  ];

  return (
    <ChartsContainer>
      <PageTitle>System Charts</PageTitle>

      <TimeRangeSelector>
        <span>Zeitbereich:</span>
        {['1h', '6h', '24h', '7d'].map(range => (
          <TimeButton key={range} active={timeRange === range} onClick={() => setTimeRange(range)}>{range}</TimeButton>
        ))}
      </TimeRangeSelector>

      <MetricsSummary>
        <MetricCard><MetricValue color={ACCENT.cpu}>{cur.cpu}%</MetricValue><MetricLabel>CPU Usage</MetricLabel></MetricCard>
        <MetricCard><MetricValue color={ACCENT.memory}>{cur.memory}%</MetricValue><MetricLabel>Memory Usage</MetricLabel></MetricCard>
        <MetricCard><MetricValue color={ACCENT.temperature}>{cur.temperature}°C</MetricValue><MetricLabel>Temperature</MetricLabel></MetricCard>
        <MetricCard><MetricValue color={ACCENT.network}>{cur.network}</MetricValue><MetricLabel>Network I/O</MetricLabel></MetricCard>
      </MetricsSummary>

      <ChartsGrid>
        {charts.map(c => (
          <ChartCard key={c.key}>
            <ChartTitle dotcolor={ACCENT[c.key]}>{c.title}</ChartTitle>
            <ChartWrapper>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 16, left: 4, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" tick={{ fontSize: 11 }} interval="preserveStartEnd" minTickGap={40} />
                  <YAxis tick={{ fontSize: 11 }} domain={c.domain} width={c.key === 'network' ? 64 : 40} tickFormatter={c.yfmt} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey={c.key} stroke={ACCENT[c.key]} strokeWidth={2.5} dot={false} name={c.title} connectNulls={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartWrapper>
          </ChartCard>
        ))}
      </ChartsGrid>
    </ChartsContainer>
  );
};

export default Charts;
