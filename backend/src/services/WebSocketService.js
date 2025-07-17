const WebSocket = require('ws');

class WebSocketService {
  constructor(wss, logger) {
    this.wss = wss;
    this.logger = logger;
    this.clients = new Map();
    this.heartbeatInterval = parseInt(process.env.WS_HEARTBEAT_INTERVAL) || 30000;
    this.heartbeatTimer = null;
    
    this.setupWebSocketServer();
    this.startHeartbeat();
  }

  setupWebSocketServer() {
    this.wss.on('connection', (ws, req) => {
      const clientId = this.generateClientId();
      const clientInfo = {
        id: clientId,
        ws: ws,
        isAlive: true,
        connectedAt: new Date(),
        ip: req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      };

      this.clients.set(clientId, clientInfo);
      this.logger.info(`🔗 WebSocket client connected: ${clientId} (${clientInfo.ip})`);

      // Send welcome message
      this.sendToClient(clientId, {
        type: 'welcome',
        data: {
          clientId: clientId,
          timestamp: new Date().toISOString(),
          message: 'Connected to Raspberry Pi Monitor'
        }
      });

      // Setup message handlers
      ws.on('message', (message) => {
        this.handleMessage(clientId, message);
      });

      ws.on('pong', () => {
        const client = this.clients.get(clientId);
        if (client) {
          client.isAlive = true;
        }
      });

      ws.on('close', (code, reason) => {
        this.logger.info(`🔗 WebSocket client disconnected: ${clientId} (code: ${code}, reason: ${reason})`);
        this.clients.delete(clientId);
      });

      ws.on('error', (error) => {
        this.logger.error(`WebSocket error for client ${clientId}:`, error);
        this.clients.delete(clientId);
      });
    });

    this.wss.on('error', (error) => {
      this.logger.error('WebSocket server error:', error);
    });
  }

  handleMessage(clientId, message) {
    try {
      const data = JSON.parse(message.toString());
      const client = this.clients.get(clientId);
      
      if (!client) {
        this.logger.warn(`Message from unknown client: ${clientId}`);
        return;
      }

      this.logger.info(`📨 Message from ${clientId}:`, data);

      switch (data.type) {
        case 'ping':
          this.sendToClient(clientId, {
            type: 'pong',
            data: {
              timestamp: new Date().toISOString(),
              clientId: clientId
            }
          });
          break;

        case 'subscribe':
          this.handleSubscription(clientId, data.data);
          break;

        case 'unsubscribe':
          this.handleUnsubscription(clientId, data.data);
          break;

        case 'request_metrics':
          this.handleMetricsRequest(clientId, data.data);
          break;

        default:
          this.logger.warn(`Unknown message type: ${data.type}`);
          this.sendToClient(clientId, {
            type: 'error',
            data: {
              message: 'Unknown message type',
              type: data.type
            }
          });
      }
    } catch (error) {
      this.logger.error(`Error handling message from ${clientId}:`, error);
      this.sendToClient(clientId, {
        type: 'error',
        data: {
          message: 'Invalid message format'
        }
      });
    }
  }

  handleSubscription(clientId, subscriptionData) {
    const client = this.clients.get(clientId);
    if (!client) return;

    if (!client.subscriptions) {
      client.subscriptions = new Set();
    }

    const { channels } = subscriptionData;
    if (Array.isArray(channels)) {
      channels.forEach(channel => {
        client.subscriptions.add(channel);
      });
    }

    this.logger.info(`📺 Client ${clientId} subscribed to: ${Array.from(client.subscriptions).join(', ')}`);

    this.sendToClient(clientId, {
      type: 'subscription_confirmed',
      data: {
        channels: Array.from(client.subscriptions)
      }
    });
  }

  handleUnsubscription(clientId, subscriptionData) {
    const client = this.clients.get(clientId);
    if (!client || !client.subscriptions) return;

    const { channels } = subscriptionData;
    if (Array.isArray(channels)) {
      channels.forEach(channel => {
        client.subscriptions.delete(channel);
      });
    }

    this.logger.info(`📺 Client ${clientId} unsubscribed from: ${channels.join(', ')}`);

    this.sendToClient(clientId, {
      type: 'unsubscription_confirmed',
      data: {
        channels: channels
      }
    });
  }

  handleMetricsRequest(clientId, requestData) {
    // This would typically fetch recent metrics from the database
    // For now, just acknowledge the request
    this.sendToClient(clientId, {
      type: 'metrics_request_received',
      data: {
        requestId: requestData.requestId,
        timestamp: new Date().toISOString()
      }
    });
  }

  sendToClient(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client || client.ws.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      client.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      this.logger.error(`Error sending message to client ${clientId}:`, error);
      this.clients.delete(clientId);
      return false;
    }
  }

  broadcast(type, data, channel = 'all') {
    const message = {
      type: type,
      data: data,
      timestamp: new Date().toISOString()
    };

    let sentCount = 0;
    const deadClients = [];

    this.clients.forEach((client, clientId) => {
      // Check if client is subscribed to this channel
      if (channel !== 'all' && client.subscriptions && !client.subscriptions.has(channel)) {
        return;
      }

      if (client.ws.readyState === WebSocket.OPEN) {
        try {
          client.ws.send(JSON.stringify(message));
          sentCount++;
        } catch (error) {
          this.logger.error(`Error broadcasting to client ${clientId}:`, error);
          deadClients.push(clientId);
        }
      } else {
        deadClients.push(clientId);
      }
    });

    // Clean up dead clients
    deadClients.forEach(clientId => {
      this.clients.delete(clientId);
    });

    if (sentCount > 0) {
      this.logger.debug(`📡 Broadcasted ${type} to ${sentCount} clients`);
    }

    return sentCount;
  }

  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      const deadClients = [];

      this.clients.forEach((client, clientId) => {
        if (client.isAlive === false) {
          deadClients.push(clientId);
          return;
        }

        client.isAlive = false;
        
        if (client.ws.readyState === WebSocket.OPEN) {
          try {
            client.ws.ping();
          } catch (error) {
            this.logger.error(`Error sending ping to client ${clientId}:`, error);
            deadClients.push(clientId);
          }
        } else {
          deadClients.push(clientId);
        }
      });

      // Clean up dead clients
      deadClients.forEach(clientId => {
        this.logger.info(`💀 Removing dead client: ${clientId}`);
        this.clients.delete(clientId);
      });

      if (deadClients.length > 0) {
        this.logger.info(`🧹 Cleaned up ${deadClients.length} dead WebSocket clients`);
      }

    }, this.heartbeatInterval);

    this.logger.info(`💓 WebSocket heartbeat started (interval: ${this.heartbeatInterval}ms)`);
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
      this.logger.info('💓 WebSocket heartbeat stopped');
    }
  }

  getClientStats() {
    const stats = {
      total_clients: this.clients.size,
      clients_by_subscription: {},
      oldest_connection: null,
      newest_connection: null
    };

    let oldestTime = null;
    let newestTime = null;

    this.clients.forEach((client, clientId) => {
      const connectedAt = client.connectedAt;
      
      if (!oldestTime || connectedAt < oldestTime) {
        oldestTime = connectedAt;
        stats.oldest_connection = {
          clientId: clientId,
          connectedAt: connectedAt,
          duration: Date.now() - connectedAt.getTime()
        };
      }

      if (!newestTime || connectedAt > newestTime) {
        newestTime = connectedAt;
        stats.newest_connection = {
          clientId: clientId,
          connectedAt: connectedAt,
          duration: Date.now() - connectedAt.getTime()
        };
      }

      if (client.subscriptions) {
        client.subscriptions.forEach(subscription => {
          if (!stats.clients_by_subscription[subscription]) {
            stats.clients_by_subscription[subscription] = 0;
          }
          stats.clients_by_subscription[subscription]++;
        });
      }
    });

    return stats;
  }

  generateClientId() {
    return 'client_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  shutdown() {
    this.stopHeartbeat();
    
    // Close all client connections
    this.clients.forEach((client, clientId) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.close(1000, 'Server shutting down');
      }
    });

    this.clients.clear();
    this.logger.info('🔌 WebSocket service shut down');
  }
}

module.exports = WebSocketService;