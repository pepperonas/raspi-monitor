import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { apiRequest } from '../config/api';

const AlertsContainer = styled.div`
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

const AlertsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const AlertItem = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-left: 4px solid ${props => {
    switch(props.severity) {
      case 'critical': return '#e16162';
      case 'high': return '#f59e0b';
      case 'medium': return '#f59e0b';
      case 'low': return '#9cb68f';
      default: return props.theme.colors.border;
    }
  }};
  border-radius: 0.5rem;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
`;

const AlertHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const AlertType = styled.div`
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

const AlertSeverity = styled.div`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  color: white;
  background: ${props => {
    switch(props.severity) {
      case 'critical': return '#ff6b6b';
      case 'high': return '#ffa726';
      case 'medium': return '#ffeb3b';
      case 'low': return '#4caf50';
      default: return props.theme.colors.textSecondary;
    }
  }};
`;

const AlertMessage = styled.div`
  color: ${props => props.theme.colors.text};
  margin-bottom: 8px;
`;

const AlertTimestamp = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.9rem;
`;

const NoAlerts = styled.div`
  text-align: center;
  padding: 40px;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 1.1rem;
`;

const Alerts = ({ alerts = [], isConnected = false }) => {
  const [alertsData, setAlertsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const data = await apiRequest('/api/alerts');
        setAlertsData(data.alerts || data || []);
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
        setAlertsData(alerts);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000);

    return () => clearInterval(interval);
  }, [alerts]);

  const currentAlerts = alertsData.length > 0 ? alertsData : alerts;

  if (loading && currentAlerts.length === 0) {
    return (
      <AlertsContainer>
        <PageTitle>Alerts</PageTitle>
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          Loading alerts...
        </div>
      </AlertsContainer>
    );
  }
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp).toLocaleString();
  };

  if (currentAlerts.length === 0) {
    return (
      <AlertsContainer>
        <PageTitle>Alerts</PageTitle>
        <NoAlerts>
          ✅ No alerts to display
        </NoAlerts>
      </AlertsContainer>
    );
  }

  return (
    <AlertsContainer>
      <PageTitle>Alerts</PageTitle>
      <AlertsList>
        {currentAlerts.map((alert, index) => (
          <AlertItem key={index} severity={alert.severity}>
            <AlertHeader>
              <AlertType>{alert.alert_type || 'Unknown Alert'}</AlertType>
              <AlertSeverity severity={alert.severity}>
                {alert.severity || 'unknown'}
              </AlertSeverity>
            </AlertHeader>
            <AlertMessage>
              {alert.message || 'No message provided'}
            </AlertMessage>
            <AlertTimestamp>
              {formatTimestamp(alert.timestamp)}
            </AlertTimestamp>
          </AlertItem>
        ))}
      </AlertsList>
    </AlertsContainer>
  );
};

export default Alerts;