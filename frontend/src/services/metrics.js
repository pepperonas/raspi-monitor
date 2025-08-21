import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add timestamp to prevent caching
    config.params = {
      ...config.params,
      _t: Date.now()
    };
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export class MetricsService {
  // Health check
  static async getHealth() {
    const response = await api.get('/health');
    return response.data;
  }

  // Latest metrics
  static async getLatestMetrics() {
    const response = await api.get('/metrics/latest');
    return response.data;
  }

  // CPU metrics
  static async getCPUMetrics(limit = 100, range = null) {
    const params = { limit };
    if (range) params.range = range;
    
    const response = await api.get('/metrics/cpu', { params });
    return response.data;
  }

  // Memory metrics
  static async getMemoryMetrics(limit = 100, range = null) {
    const params = { limit };
    if (range) params.range = range;
    
    const response = await api.get('/metrics/memory', { params });
    return response.data;
  }

  // Disk metrics
  static async getDiskMetrics(limit = 100, range = null) {
    const params = { limit };
    if (range) params.range = range;
    
    const response = await api.get('/metrics/disk', { params });
    return response.data;
  }

  // Network metrics
  static async getNetworkMetrics(limit = 100, range = null, interfaceName = null) {
    const params = { limit };
    if (range) params.range = range;
    if (interfaceName) params.interface = interfaceName;
    
    const response = await api.get('/metrics/network', { params });
    return response.data;
  }

  // Process metrics
  static async getProcessMetrics(limit = 100, range = null) {
    const params = { limit };
    if (range) params.range = range;
    
    const response = await api.get('/metrics/processes', { params });
    return response.data;
  }

  // GPU metrics
  static async getGPUMetrics(limit = 100, range = null) {
    const params = { limit };
    if (range) params.range = range;
    
    const response = await api.get('/metrics/gpu', { params });
    return response.data;
  }

  // Metrics summary
  static async getMetricsSummary(hours = 24) {
    const response = await api.get('/metrics/summary', { params: { hours } });
    return response.data;
  }

  // Network interfaces
  static async getNetworkInterfaces() {
    const response = await api.get('/metrics/interfaces');
    return response.data;
  }

  // Alerts
  static async getAlerts(params = {}) {
    const response = await api.get('/alerts', { params });
    return response.data;
  }

  // Active alerts
  static async getActiveAlerts() {
    const response = await api.get('/alerts/active');
    return response.data;
  }

  // Alert summary
  static async getAlertSummary(hours = 24) {
    const response = await api.get('/alerts/summary', { params: { hours } });
    return response.data;
  }

  // Resolve alert
  static async resolveAlert(alertId, resolvedBy = 'user') {
    const response = await api.put(`/alerts/${alertId}/resolve`, { resolved_by: resolvedBy });
    return response.data;
  }

  // Resolve all alerts
  static async resolveAllAlerts(filters = {}) {
    const response = await api.put('/alerts/resolve-all', filters);
    return response.data;
  }

  // Alert types
  static async getAlertTypes() {
    const response = await api.get('/alerts/types');
    return response.data;
  }

  // System info
  static async getSystemInfo() {
    const response = await api.get('/system/info');
    return response.data;
  }

  // Service status
  static async getServiceStatus() {
    const response = await api.get('/system/services');
    return response.data;
  }

  // System events
  static async getSystemEvents(params = {}) {
    const response = await api.get('/system/events', { params });
    return response.data;
  }

  // System stats
  static async getSystemStats() {
    const response = await api.get('/system/stats');
    return response.data;
  }

  // System uptime
  static async getSystemUptime() {
    const response = await api.get('/system/uptime');
    return response.data;
  }

  // Create system event
  static async createSystemEvent(eventType, eventData, description) {
    const response = await api.post('/system/events', {
      event_type: eventType,
      event_data: eventData,
      description
    });
    return response.data;
  }
}

// Utility functions
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const formatUptime = (seconds) => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  let result = '';
  if (days > 0) result += `${days}d `;
  if (hours > 0) result += `${hours}h `;
  if (minutes > 0) result += `${minutes}m `;
  result += `${secs}s`;
  
  return result.trim();
};

export const getStatusColor = (value, thresholds) => {
  if (value >= thresholds.critical) return 'error';
  if (value >= thresholds.warning) return 'warning';
  if (value >= thresholds.good) return 'success';
  return 'info';
};

export const getTimeRange = (range) => {
  const now = new Date();
  let start;
  
  switch (range) {
    case '1h':
      start = new Date(now.getTime() - 60 * 60 * 1000);
      break;
    case '6h':
      start = new Date(now.getTime() - 6 * 60 * 60 * 1000);
      break;
    case '24h':
      start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }
  
  return `${start.toISOString()},${now.toISOString()}`;
};

export default MetricsService;