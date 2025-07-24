const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const winston = require('winston');
require('dotenv').config();

const { createPool, testConnection, initializeDatabase } = require('../config/database');
const metricsRoutes = require('./routes/metrics');
const alertsRoutes = require('./routes/alerts');
const systemRoutes = require('./routes/system');
const MetricsCollector = require('./services/MetricsCollector');
const AlertService = require('./services/AlertService');
const WebSocketService = require('./services/WebSocketService');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5004;

// Logging Setup
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: process.env.ERROR_LOG_FILE || 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new winston.transports.File({ 
      filename: process.env.LOG_FILE || 'logs/app.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "http://192.168.2.132:4999", "http://localhost:4999", "http://monitor.pi.local", "ws://192.168.2.132:4999", "ws://localhost:4999", "ws:", "wss:"],
      upgradeInsecureRequests: null
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  originAgentCluster: false
}));

app.use(compression());
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Static files (React build)
app.use(express.static(path.join(__dirname, '../../frontend/build')));

// API Routes
app.use('/api/metrics', metricsRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/system', systemRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = await testConnection();
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: dbStatus ? 'connected' : 'disconnected',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// Catch-all handler for React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/build/index.html'));
});

// Global error handler
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// WebSocket Setup
const wss = new WebSocket.Server({ 
  server,
  perMessageDeflate: false,
  clientTracking: true
});
const wsService = new WebSocketService(wss, logger);

// Services
let metricsCollector;
let alertService;

const initializeServices = async () => {
  try {
    // Initialize database
    const dbPool = createPool();
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      throw new Error('Database connection failed');
    }
    
    const dbInitialized = await initializeDatabase();
    if (!dbInitialized) {
      logger.warn('Database tables not found. Please run database setup.');
    }
    
    // Initialize services
    metricsCollector = new MetricsCollector(dbPool, logger);
    alertService = new AlertService(dbPool, logger);
    
    // Start metric collection
    await metricsCollector.startCollection();
    
    // Start alert monitoring
    await alertService.startMonitoring();
    
    // Connect WebSocket service to metrics
    metricsCollector.on('metrics', (metrics) => {
      wsService.broadcast('metrics', metrics);
    });
    
    alertService.on('alert', (alert) => {
      wsService.broadcast('alert', alert);
    });
    
    logger.info('✅ All services initialized successfully');
    
  } catch (error) {
    logger.error('❌ Service initialization failed:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('🔄 Shutting down gracefully...');
  
  try {
    if (metricsCollector) {
      await metricsCollector.stopCollection();
    }
    
    if (alertService) {
      await alertService.stopMonitoring();
    }
    
    server.close(() => {
      logger.info('✅ Server closed');
      process.exit(0);
    });
    
    // Force exit if graceful shutdown takes too long
    setTimeout(() => {
      logger.error('❌ Forced shutdown');
      process.exit(1);
    }, 10000);
    
  } catch (error) {
    logger.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

// Signal handlers
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Unhandled promise rejection
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Uncaught exception
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 Raspberry Pi Monitor Server running on port ${PORT}`);
  logger.info(`📊 WebSocket Server running on port ${PORT}`);
  logger.info(`🌐 Dashboard: http://localhost:${PORT}`);
  logger.info(`🌐 Remote: http://192.168.2.132:${PORT}`);
  logger.info(`🔧 API: http://localhost:${PORT}/api`);
  
  initializeServices();
});

module.exports = { app, server };