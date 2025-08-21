const EventEmitter = require('events');

class AlertService extends EventEmitter {
  constructor(dbPool, logger) {
    super();
    this.dbPool = dbPool;
    this.logger = logger;
    this.isMonitoring = false;
    this.monitoringInterval = null;
    this.checkInterval = 30000; // 30 seconds
    
    // Thresholds from environment variables
    this.thresholds = {
      cpu: parseFloat(process.env.ALERT_CPU_THRESHOLD) || 80,
      memory: parseFloat(process.env.ALERT_MEMORY_THRESHOLD) || 85,
      disk: parseFloat(process.env.ALERT_DISK_THRESHOLD) || 90,
      temperature: parseFloat(process.env.ALERT_TEMP_THRESHOLD) || 75,
      load: 5.0 // 15-minute load average
    };
    
    // Alert cooldown to prevent spam (in minutes)
    this.cooldownPeriod = 10;
    this.activeAlerts = new Map();
  }

  async startMonitoring() {
    if (this.isMonitoring) {
      this.logger.warn('Alert monitoring already started');
      return;
    }

    this.isMonitoring = true;
    this.logger.info(`🔔 Starting alert monitoring (interval: ${this.checkInterval}ms)`);

    this.monitoringInterval = setInterval(async () => {
      try {
        await this.checkAllAlerts();
      } catch (error) {
        this.logger.error('Error in alert monitoring:', error);
      }
    }, this.checkInterval);

    this.logger.info('✅ Alert monitoring started');
  }

  async stopMonitoring() {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    this.logger.info('✅ Alert monitoring stopped');
  }

  async checkAllAlerts() {
    try {
      await Promise.all([
        this.checkCPUAlerts(),
        this.checkMemoryAlerts(),
        this.checkDiskAlerts(),
        this.checkTemperatureAlerts(),
        this.checkLoadAlerts(),
        this.checkProcessAlerts()
      ]);
    } catch (error) {
      this.logger.error('Error checking alerts:', error);
    }
  }

  async checkCPUAlerts() {
    try {
      const [result] = await this.dbPool.execute(`
        SELECT cpu_usage_percent, cpu_temp_celsius 
        FROM cpu_metrics 
        ORDER BY timestamp DESC 
        LIMIT 1
      `);

      if (result.length === 0) return;

      const { cpu_usage_percent, cpu_temp_celsius } = result[0];

      // CPU Usage Alert
      if (cpu_usage_percent > this.thresholds.cpu) {
        await this.createAlert({
          type: 'cpu_usage_high',
          severity: this.getSeverity(cpu_usage_percent, this.thresholds.cpu),
          message: `CPU usage is ${cpu_usage_percent}% (threshold: ${this.thresholds.cpu}%)`,
          metricValue: cpu_usage_percent,
          thresholdValue: this.thresholds.cpu
        });
      }

      // CPU Temperature Alert
      if (cpu_temp_celsius && cpu_temp_celsius > this.thresholds.temperature) {
        await this.createAlert({
          type: 'cpu_temperature_high',
          severity: this.getSeverity(cpu_temp_celsius, this.thresholds.temperature),
          message: `CPU temperature is ${cpu_temp_celsius}°C (threshold: ${this.thresholds.temperature}°C)`,
          metricValue: cpu_temp_celsius,
          thresholdValue: this.thresholds.temperature
        });
      }
    } catch (error) {
      this.logger.error('Error checking CPU alerts:', error);
    }
  }

  async checkMemoryAlerts() {
    try {
      const [result] = await this.dbPool.execute(`
        SELECT usage_percent, swap_usage_percent 
        FROM memory_metrics 
        ORDER BY timestamp DESC 
        LIMIT 1
      `);

      if (result.length === 0) return;

      const { usage_percent, swap_usage_percent } = result[0];

      // Memory Usage Alert
      if (usage_percent > this.thresholds.memory) {
        await this.createAlert({
          type: 'memory_usage_high',
          severity: this.getSeverity(usage_percent, this.thresholds.memory),
          message: `Memory usage is ${usage_percent}% (threshold: ${this.thresholds.memory}%)`,
          metricValue: usage_percent,
          thresholdValue: this.thresholds.memory
        });
      }

      // Swap Usage Alert
      if (swap_usage_percent > 50) {
        await this.createAlert({
          type: 'swap_usage_high',
          severity: this.getSeverity(swap_usage_percent, 50),
          message: `Swap usage is ${swap_usage_percent}% (threshold: 50%)`,
          metricValue: swap_usage_percent,
          thresholdValue: 50
        });
      }
    } catch (error) {
      this.logger.error('Error checking memory alerts:', error);
    }
  }

  async checkDiskAlerts() {
    try {
      const [results] = await this.dbPool.execute(`
        SELECT filesystem, mount_point, usage_percent 
        FROM disk_metrics 
        WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
        GROUP BY filesystem, mount_point
        HAVING MAX(timestamp) = MAX(timestamp)
      `);

      for (const { filesystem, mount_point, usage_percent } of results) {
        if (usage_percent > this.thresholds.disk) {
          await this.createAlert({
            type: 'disk_usage_high',
            severity: this.getSeverity(usage_percent, this.thresholds.disk),
            message: `Disk usage on ${mount_point} (${filesystem}) is ${usage_percent}% (threshold: ${this.thresholds.disk}%)`,
            metricValue: usage_percent,
            thresholdValue: this.thresholds.disk
          });
        }
      }
    } catch (error) {
      this.logger.error('Error checking disk alerts:', error);
    }
  }

  async checkTemperatureAlerts() {
    try {
      const [result] = await this.dbPool.execute(`
        SELECT gpu_temp_celsius 
        FROM gpu_metrics 
        ORDER BY timestamp DESC 
        LIMIT 1
      `);

      if (result.length === 0 || !result[0].gpu_temp_celsius) return;

      const { gpu_temp_celsius } = result[0];

      if (gpu_temp_celsius > this.thresholds.temperature) {
        await this.createAlert({
          type: 'gpu_temperature_high',
          severity: this.getSeverity(gpu_temp_celsius, this.thresholds.temperature),
          message: `GPU temperature is ${gpu_temp_celsius}°C (threshold: ${this.thresholds.temperature}°C)`,
          metricValue: gpu_temp_celsius,
          thresholdValue: this.thresholds.temperature
        });
      }
    } catch (error) {
      this.logger.error('Error checking temperature alerts:', error);
    }
  }

  async checkLoadAlerts() {
    try {
      const [result] = await this.dbPool.execute(`
        SELECT load_avg_15min 
        FROM cpu_metrics 
        ORDER BY timestamp DESC 
        LIMIT 1
      `);

      if (result.length === 0) return;

      const { load_avg_15min } = result[0];

      if (load_avg_15min > this.thresholds.load) {
        await this.createAlert({
          type: 'load_average_high',
          severity: this.getSeverity(load_avg_15min, this.thresholds.load),
          message: `15-minute load average is ${load_avg_15min} (threshold: ${this.thresholds.load})`,
          metricValue: load_avg_15min,
          thresholdValue: this.thresholds.load
        });
      }
    } catch (error) {
      this.logger.error('Error checking load alerts:', error);
    }
  }

  async checkProcessAlerts() {
    try {
      const [result] = await this.dbPool.execute(`
        SELECT zombie_processes, total_processes 
        FROM process_metrics 
        ORDER BY timestamp DESC 
        LIMIT 1
      `);

      if (result.length === 0) return;

      const { zombie_processes, total_processes } = result[0];

      // Zombie Process Alert
      if (zombie_processes > 5) {
        await this.createAlert({
          type: 'zombie_processes_high',
          severity: 'medium',
          message: `${zombie_processes} zombie processes detected`,
          metricValue: zombie_processes,
          thresholdValue: 5
        });
      }

      // Too many processes
      if (total_processes > 500) {
        await this.createAlert({
          type: 'process_count_high',
          severity: 'low',
          message: `Total process count is ${total_processes} (threshold: 500)`,
          metricValue: total_processes,
          thresholdValue: 500
        });
      }
    } catch (error) {
      this.logger.error('Error checking process alerts:', error);
    }
  }

  async createAlert({ type, severity, message, metricValue, thresholdValue }) {
    try {
      // Check if this alert is in cooldown
      const alertKey = `${type}-${severity}`;
      const now = Date.now();
      
      if (this.activeAlerts.has(alertKey)) {
        const lastAlert = this.activeAlerts.get(alertKey);
        const timeDiff = now - lastAlert;
        const cooldownMs = this.cooldownPeriod * 60 * 1000;
        
        if (timeDiff < cooldownMs) {
          return; // Still in cooldown
        }
      }

      // Create the alert
      const [result] = await this.dbPool.execute(`
        INSERT INTO alerts (alert_type, severity, message, metric_value, threshold_value)
        VALUES (?, ?, ?, ?, ?)
      `, [type, severity, message, metricValue, thresholdValue]);

      // Update cooldown
      this.activeAlerts.set(alertKey, now);

      const alert = {
        id: result.insertId,
        type,
        severity,
        message,
        metricValue,
        thresholdValue,
        timestamp: new Date()
      };

      // Emit alert event
      this.emit('alert', alert);

      this.logger.warn(`🚨 Alert created: ${message}`);

      return alert;
    } catch (error) {
      this.logger.error('Error creating alert:', error);
    }
  }

  getSeverity(value, threshold) {
    const ratio = value / threshold;
    
    if (ratio >= 1.5) return 'critical';
    if (ratio >= 1.2) return 'high';
    if (ratio >= 1.0) return 'medium';
    return 'low';
  }

  async resolveAlert(alertId, resolvedBy = 'system') {
    try {
      const [result] = await this.dbPool.execute(`
        UPDATE alerts 
        SET resolved = TRUE, resolved_at = NOW()
        WHERE id = ? AND resolved = FALSE
      `, [alertId]);

      if (result.affectedRows > 0) {
        this.logger.info(`✅ Alert ${alertId} resolved by ${resolvedBy}`);
        
        // Log the resolution
        await this.dbPool.execute(`
          INSERT INTO system_events (event_type, event_data, description)
          VALUES ('alert_resolved', ?, ?)
        `, [
          JSON.stringify({ alert_id: alertId, resolved_by: resolvedBy }),
          `Alert ${alertId} resolved by ${resolvedBy}`
        ]);
      }
    } catch (error) {
      this.logger.error('Error resolving alert:', error);
    }
  }

  async autoResolveAlerts() {
    try {
      // Auto-resolve CPU alerts if usage is back to normal
      await this.dbPool.execute(`
        UPDATE alerts 
        SET resolved = TRUE, resolved_at = NOW()
        WHERE alert_type IN ('cpu_usage_high', 'cpu_temperature_high') 
        AND resolved = FALSE
        AND id IN (
          SELECT alert_id FROM (
            SELECT a.id as alert_id
            FROM alerts a
            LEFT JOIN cpu_metrics c ON c.timestamp > a.timestamp
            WHERE a.alert_type = 'cpu_usage_high' 
            AND c.cpu_usage_percent < ?
            AND c.timestamp >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
          ) temp
        )
      `, [this.thresholds.cpu * 0.8]); // 80% of threshold

      // Auto-resolve memory alerts
      await this.dbPool.execute(`
        UPDATE alerts 
        SET resolved = TRUE, resolved_at = NOW()
        WHERE alert_type = 'memory_usage_high' 
        AND resolved = FALSE
        AND id IN (
          SELECT alert_id FROM (
            SELECT a.id as alert_id
            FROM alerts a
            LEFT JOIN memory_metrics m ON m.timestamp > a.timestamp
            WHERE a.alert_type = 'memory_usage_high' 
            AND m.usage_percent < ?
            AND m.timestamp >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
          ) temp
        )
      `, [this.thresholds.memory * 0.8]);

      this.logger.info('✅ Auto-resolved alerts checked');
    } catch (error) {
      this.logger.error('Error auto-resolving alerts:', error);
    }
  }

  updateThresholds(newThresholds) {
    this.thresholds = { ...this.thresholds, ...newThresholds };
    this.logger.info('✅ Alert thresholds updated:', this.thresholds);
  }
}

module.exports = AlertService;