// API Configuration - Always use localhost:4999 for production
const currentHost = window.location.host;
const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

// Check if we're running on development server
const isDevServer = currentHost.includes(':3000') || currentHost.includes('localhost:3000');

let API_BASE_URL, WS_BASE_URL;

if (isDevServer) {
  // Development: Connect directly to backend
  API_BASE_URL = 'http://localhost:5004';
  WS_BASE_URL = 'ws://localhost:5004';
} else {
  // Production: Always use 192.168.2.132:4999 (nginx proxy)
  API_BASE_URL = 'http://192.168.2.132:4999';
  WS_BASE_URL = 'ws://192.168.2.132:4999';
}

export { API_BASE_URL, WS_BASE_URL };

// API helper functions
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, mergedOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

export default { API_BASE_URL, WS_BASE_URL, apiRequest };