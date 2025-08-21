import { EventEmitter } from 'events';
import { WS_BASE_URL } from '../config/api';

export class WebSocketService extends EventEmitter {
  constructor() {
    super();
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.isConnected = false;
    this.subscriptions = new Set();
    this.heartbeatTimer = null;
  }

  connect() {
    const wsUrl = WS_BASE_URL;
    
    console.log(`🔗 Connecting to WebSocket: ${wsUrl}`);
    
    try {
      this.ws = new WebSocket(wsUrl);
      this.setupEventHandlers();
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.handleReconnect();
    }
  }

  setupEventHandlers() {
    this.ws.onopen = () => {
      console.log('✅ WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connected');
      this.startHeartbeat();
      
      // Resubscribe to channels
      if (this.subscriptions.size > 0) {
        this.subscribe(Array.from(this.subscriptions));
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    // Handle WebSocket ping frames (binary data)
    this.ws.addEventListener('ping', () => {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.pong();
      }
    });

    this.ws.onclose = (event) => {
      console.log(`🔗 WebSocket disconnected: ${event.code} - ${event.reason}`);
      this.isConnected = false;
      this.emit('disconnected');
      this.stopHeartbeat();
      
      if (event.code !== 1000) { // Not a normal closure
        this.handleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.isConnected = false;
      // Don't emit error to prevent uncaught error
      // this.emit('error', error);
    };
  }

  handleMessage(message) {
    const { type, data } = message;
    
    switch (type) {
      case 'welcome':
        console.log('👋 Welcome message received:', data);
        this.emit('welcome', data);
        break;
        
      case 'metrics':
        this.emit('metrics', data);
        break;
        
      case 'alert':
        this.emit('alert', data);
        break;
        
      case 'pong':
        // Heartbeat response
        break;
        
      case 'subscription_confirmed':
        console.log('📺 Subscription confirmed:', data);
        break;
        
      case 'error':
        console.error('WebSocket error message:', data);
        this.emit('error', data);
        break;
        
      default:
        console.warn('Unknown message type:', type);
    }
  }

  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  subscribe(channels) {
    if (!Array.isArray(channels)) {
      channels = [channels];
    }
    
    channels.forEach(channel => this.subscriptions.add(channel));
    
    return this.send({
      type: 'subscribe',
      data: { channels }
    });
  }

  unsubscribe(channels) {
    if (!Array.isArray(channels)) {
      channels = [channels];
    }
    
    channels.forEach(channel => this.subscriptions.delete(channel));
    
    return this.send({
      type: 'unsubscribe',
      data: { channels }
    });
  }

  requestMetrics(requestId = Date.now()) {
    return this.send({
      type: 'request_metrics',
      data: { requestId }
    });
  }

  ping() {
    return this.send({
      type: 'ping',
      data: { timestamp: new Date().toISOString() }
    });
  }

  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected) {
        this.ping();
      }
    }, 25000); // 25 seconds - less than backend's 30s timeout
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      this.emit('maxReconnectAttemptsReached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000);
    
    console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      if (!this.isConnected) {
        this.connect();
      }
    }, delay);
  }

  disconnect() {
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnecting');
      this.ws = null;
    }
    
    this.isConnected = false;
    this.subscriptions.clear();
  }

  getConnectionState() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      subscriptions: Array.from(this.subscriptions)
    };
  }
}