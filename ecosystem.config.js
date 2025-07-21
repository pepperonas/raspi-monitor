module.exports = {
  apps: [
    {
      name: 'raspi-monitor',
      script: 'backend/src/server.js',
      cwd: '/home/martin/apps/raspi-monitor',
      
      // Instance configuration
      instances: 1,
      exec_mode: 'fork', // Use 'cluster' for multiple instances
      
      // Environment variables
      env: {
        NODE_ENV: 'production',
        PORT: 4999,
        DB_HOST: 'localhost',
        DB_USER: 'raspi_monitor',
        DB_PASSWORD: 'monitoring_secure_pass_2024',
        DB_NAME: 'raspi_monitor',
        METRICS_INTERVAL: 5000,
        CLEANUP_INTERVAL: 86400000,
        DATA_RETENTION_DAYS: 30,
        ALERT_CPU_THRESHOLD: 80,
        ALERT_MEMORY_THRESHOLD: 85,
        ALERT_DISK_THRESHOLD: 90,
        ALERT_TEMP_THRESHOLD: 75,
        WS_PORT: 4999,
        WS_HEARTBEAT_INTERVAL: 30000,
        LOG_LEVEL: 'info'
      },
      
      // Development environment
      env_development: {
        NODE_ENV: 'development',
        PORT: 4999,
        LOG_LEVEL: 'debug',
        METRICS_INTERVAL: 2000, // More frequent in development
      },
      
      // Production environment
      env_production: {
        NODE_ENV: 'production',
        PORT: 4999,
        LOG_LEVEL: 'warn',
        METRICS_INTERVAL: 5000,
      },
      
      // Restart configuration
      watch: false, // Set to true for development
      ignore_watch: ['node_modules', 'logs', 'frontend/build'],
      watch_delay: 1000,
      
      // Auto-restart configuration
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '200M',
      
      // Logging
      log_file: '/home/martin/apps/raspi-monitor/backend/logs/combined.log',
      out_file: '/home/martin/apps/raspi-monitor/backend/logs/out.log',
      error_file: '/home/martin/apps/raspi-monitor/backend/logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Merge logs from all instances
      merge_logs: true,
      
      // Process management
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      
      // Source map support
      source_map_support: true,
      
      // Advanced configuration
      node_args: ['--max-old-space-size=256'], // Limit memory for Pi
      
      // Monitoring
      pmx: true,
      
      // Cron restart disabled for performance
      // cron_restart: '0 3 * * *',
      
      // Health check
      health_check_grace_period: 3000,
      
      // Instance variables
      instance_var: 'INSTANCE_ID',
      
      // Post-deploy hooks
      post_update: ['npm install --production', 'npm run build:frontend'],
      
      // Pre-start script
      pre_start: 'backend/scripts/pre-start.sh'
    }
  ],
  
  // Deployment configuration
  deploy: {
    production: {
      user: 'martin',
      host: 'localhost',
      ref: 'origin/main',
      repo: 'git@github.com:user/raspi-monitor.git',
      path: '/home/martin/apps/raspi-monitor',
      'post-deploy': 'npm install --production && npm run build && pm2 reload ecosystem.config.js --env production'
    }
  }
};