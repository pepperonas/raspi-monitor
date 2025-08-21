const si = require('systeminformation');
const EventEmitter = require('events');
const fs = require('fs').promises;
const path = require('path');

class MetricsCollector extends EventEmitter {
  constructor(dbPool, logger) {
    super();
    this.dbPool = dbPool;
    this.logger = logger;
    this.isCollecting = false;
    this.collectionInterval = null;
    this.metricsInterval = parseInt(process.env.METRICS_INTERVAL) || 5000;
    this.cleanupInterval = parseInt(process.env.CLEANUP_INTERVAL) || 86400000; // 24 hours
    this.dataRetentionDays = parseInt(process.env.DATA_RETENTION_DAYS) || 30;
    this.cleanupTimer = null;
    
    // Cache for network baseline (for calculating rates)
    this.networkBaseline = new Map();
    this.lastNetworkCheck = null;
    
    // Initialize system information
    this.initializeSystemInfo();
  }

  async initializeSystemInfo() {
    try {
      const systemData = await si.system();
      const osInfo = await si.osInfo();
      const time = await si.time();
      
      await this.dbPool.execute(`
        INSERT INTO system_info (hostname, platform, arch, kernel, uptime_seconds, boot_time)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        uptime_seconds = VALUES(uptime_seconds),
        boot_time = VALUES(boot_time)
      `, [
        osInfo.hostname,
        osInfo.platform,
        osInfo.arch,
        osInfo.kernel,
        time.uptime,
        new Date(Date.now() - (time.uptime * 1000))
      ]);
      
      this.logger.info('✅ System info initialized');
    } catch (error) {
      this.logger.error('❌ Failed to initialize system info:', error);
    }
  }

  async startCollection() {
    if (this.isCollecting) {
      this.logger.warn('Metrics collection already started');
      return;
    }

    this.isCollecting = true;
    this.logger.info(`🔄 Starting metrics collection (interval: ${this.metricsInterval}ms)`);

    // Start periodic collection
    this.collectionInterval = setInterval(async () => {
      try {
        await this.collectAllMetrics();
      } catch (error) {
        this.logger.error('Error in metrics collection:', error);
      }
    }, this.metricsInterval);

    // Start cleanup timer
    this.cleanupTimer = setInterval(async () => {
      try {
        await this.cleanupOldData();
      } catch (error) {
        this.logger.error('Error in cleanup:', error);
      }
    }, this.cleanupInterval);

    // Initial collection
    await this.collectAllMetrics();
    
    this.logger.info('✅ Metrics collection started');
  }

  async stopCollection() {
    if (!this.isCollecting) {
      return;
    }

    this.isCollecting = false;
    
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
      this.collectionInterval = null;
    }
    
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    
    this.logger.info('✅ Metrics collection stopped');
  }

  async collectAllMetrics() {
    const timestamp = new Date();
    const metrics = {};

    try {
      // Collect all metrics in parallel for better performance
      const [
        cpuMetrics,
        memoryMetrics,
        diskMetrics,
        networkMetrics,
        processMetrics,
        gpuMetrics
      ] = await Promise.all([
        this.collectCPUMetrics(),
        this.collectMemoryMetrics(),
        this.collectDiskMetrics(),
        this.collectNetworkMetrics(),
        this.collectProcessMetrics(),
        this.collectGPUMetrics()
      ]);

      // Store metrics in database (batch insert for better performance)
      await this.storeAllMetrics({
        cpu: cpuMetrics,
        memory: memoryMetrics,
        disk: diskMetrics,
        network: networkMetrics,
        processes: processMetrics,
        gpu: gpuMetrics
      });

      // Combine all metrics for emission
      metrics.cpu = cpuMetrics;
      metrics.memory = memoryMetrics;
      metrics.disk = diskMetrics;
      metrics.network = networkMetrics;
      metrics.processes = processMetrics;
      metrics.gpu = gpuMetrics;
      metrics.timestamp = timestamp;

      // Emit metrics for real-time updates
      this.emit('metrics', metrics);

    } catch (error) {
      this.logger.error('Error collecting metrics:', error);
    }
  }

  async collectCPUMetrics() {
    try {
      const [currentLoad, cpuTemperature, cpuInfo] = await Promise.all([
        si.currentLoad(),
        si.cpuTemperature(),
        si.cpu()
      ]);
      
      return {
        usage_percent: parseFloat(currentLoad.currentLoad.toFixed(2)),
        cpu_count: cpuInfo.cores,
        cpu_freq_current: cpuInfo.speed,
        cpu_freq_min: cpuInfo.speedMin || null,
        cpu_freq_max: cpuInfo.speedMax || null,
        cpu_temp_celsius: cpuTemperature.main || null,
        load_avg_1min: currentLoad.avgLoad1 || null,
        load_avg_5min: currentLoad.avgLoad5 || null,
        load_avg_15min: currentLoad.avgLoad15 || null
      };
    } catch (error) {
      this.logger.error('Error collecting CPU metrics:', error);
      return null;
    }
  }

  async collectMemoryMetrics() {
    try {
      const mem = await si.mem();
      
      return {
        total_bytes: mem.total,
        available_bytes: mem.available,
        used_bytes: mem.used,
        free_bytes: mem.free,
        usage_percent: parseFloat(((mem.used / mem.total) * 100).toFixed(2)),
        swap_total_bytes: mem.swaptotal,
        swap_used_bytes: mem.swapused,
        swap_free_bytes: mem.swapfree,
        swap_usage_percent: mem.swaptotal > 0 ? 
          parseFloat(((mem.swapused / mem.swaptotal) * 100).toFixed(2)) : 0
      };
    } catch (error) {
      this.logger.error('Error collecting memory metrics:', error);
      return null;
    }
  }

  async collectDiskMetrics() {
    try {
      const fsSize = await si.fsSize();
      const diskMetrics = [];

      for (const fs of fsSize) {
        if (fs.type !== 'squashfs' && fs.available > 0) {
          diskMetrics.push({
            filesystem: fs.fs,
            mount_point: fs.mount,
            total_bytes: fs.size,
            used_bytes: fs.used,
            available_bytes: fs.available,
            usage_percent: parseFloat(fs.use.toFixed(2)),
            inodes_total: fs.inodes?.total || null,
            inodes_used: fs.inodes?.used || null,
            inodes_free: fs.inodes?.free || null
          });
        }
      }

      return diskMetrics;
    } catch (error) {
      this.logger.error('Error collecting disk metrics:', error);
      return [];
    }
  }

  async collectNetworkMetrics() {
    try {
      const networkStats = await si.networkStats();
      const networkInterfaces = await si.networkInterfaces();
      const networkMetrics = [];

      for (const stat of networkStats) {
        const interfaceInfo = networkInterfaces.find(iface => iface.iface === stat.iface);
        
        networkMetrics.push({
          interface_name: stat.iface,
          bytes_sent: stat.tx_bytes,
          bytes_recv: stat.rx_bytes,
          packets_sent: stat.tx_packets,
          packets_recv: stat.rx_packets,
          errors_in: stat.rx_errors,
          errors_out: stat.tx_errors,
          drops_in: stat.rx_dropped,
          drops_out: stat.tx_dropped,
          speed_mbps: interfaceInfo?.speed || null,
          duplex: interfaceInfo?.duplex || null,
          mtu: interfaceInfo?.mtu || null
        });
      }

      return networkMetrics;
    } catch (error) {
      this.logger.error('Error collecting network metrics:', error);
      return [];
    }
  }

  async collectProcessMetrics() {
    try {
      const processes = await si.processes();
      
      if (!processes || !processes.list) {
        this.logger.warn('Process data incomplete, using defaults');
        return {
          running_processes: 0,
          sleeping_processes: 0,
          zombie_processes: 0,
          total_processes: 0,
          cpu_usage_percent: 0,
          memory_usage_percent: 0
        };
      }
      
      return {
        running_processes: processes.running || 0,
        sleeping_processes: processes.sleeping || 0,
        zombie_processes: processes.zombie || 0,
        total_processes: processes.all || 0,
        cpu_usage_percent: parseFloat(processes.list.slice(0, 10)
          .reduce((acc, p) => acc + (p.pcpu || 0), 0).toFixed(2)) || 0,
        memory_usage_percent: parseFloat(processes.list.slice(0, 10)
          .reduce((acc, p) => acc + (p.pmem || 0), 0).toFixed(2)) || 0
      };
    } catch (error) {
      this.logger.error('Error collecting process metrics:', error);
      return null;
    }
  }

  async collectGPUMetrics() {
    try {
      // For Raspberry Pi, we'll try to get GPU temperature from vcgencmd
      const gpuTemp = await this.getGPUTemperature();
      const gpuMemory = await this.getGPUMemory();
      const fanStatus = await this.getFanStatus();
      
      return {
        gpu_temp_celsius: gpuTemp,
        gpu_memory_used_bytes: gpuMemory.used,
        gpu_memory_total_bytes: gpuMemory.total,
        gpu_usage_percent: null, // Not easily available on Pi
        fan_status: fanStatus
      };
    } catch (error) {
      this.logger.error('Error collecting GPU metrics:', error);
      return null;
    }
  }

  async getGPUTemperature() {
    try {
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);
      
      const { stdout } = await execAsync('vcgencmd measure_temp');
      const match = stdout.match(/temp=(\d+\.\d+)'C/);
      return match ? parseFloat(match[1]) : null;
    } catch (error) {
      return null;
    }
  }

  async getGPUMemory() {
    try {
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);
      
      const { stdout } = await execAsync('vcgencmd get_mem gpu');
      const match = stdout.match(/gpu=(\d+)M/);
      const gpuMemMB = match ? parseInt(match[1]) : 0;
      
      return {
        total: gpuMemMB * 1024 * 1024,
        used: null // Not easily available
      };
    } catch (error) {
      return { total: null, used: null };
    }
  }

  async getFanStatus() {
    try {
      const fs = require('fs').promises;
      
      // Read fan status from thermal cooling device
      const fanStateRaw = await fs.readFile('/sys/class/thermal/cooling_device0/cur_state', 'utf8');
      const fanState = parseInt(fanStateRaw.trim());
      
      return {
        level: fanState,
        status: fanState === 0 ? 'off' : 'on',
        description: this.getFanDescription(fanState)
      };
    } catch (error) {
      this.logger.warn('Could not read fan status:', error.message);
      return {
        level: null,
        status: 'unknown',
        description: 'Fan status unavailable'
      };
    }
  }

  getFanDescription(level) {
    switch (level) {
      case 0: return 'Fan Off';
      case 1: return 'Fan Low';
      case 2: return 'Fan Medium';
      case 3: return 'Fan High';
      case 4: return 'Fan Max';
      default: return `Fan Level ${level}`;
    }
  }

  async storeCPUMetrics(metrics) {
    if (!metrics) return;
    
    try {
      await this.dbPool.execute(`
        INSERT INTO cpu_metrics (
          cpu_usage_percent, cpu_count, cpu_freq_current, cpu_freq_min, cpu_freq_max,
          cpu_temp_celsius, load_avg_1min, load_avg_5min, load_avg_15min
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        metrics.usage_percent,
        metrics.cpu_count,
        metrics.cpu_freq_current,
        metrics.cpu_freq_min,
        metrics.cpu_freq_max,
        metrics.cpu_temp_celsius,
        metrics.load_avg_1min,
        metrics.load_avg_5min,
        metrics.load_avg_15min
      ]);
    } catch (error) {
      this.logger.error('Error storing CPU metrics:', error);
    }
  }

  async storeMemoryMetrics(metrics) {
    if (!metrics) return;
    
    try {
      await this.dbPool.execute(`
        INSERT INTO memory_metrics (
          total_bytes, available_bytes, used_bytes, free_bytes, usage_percent,
          swap_total_bytes, swap_used_bytes, swap_free_bytes, swap_usage_percent
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        metrics.total_bytes,
        metrics.available_bytes,
        metrics.used_bytes,
        metrics.free_bytes,
        metrics.usage_percent,
        metrics.swap_total_bytes,
        metrics.swap_used_bytes,
        metrics.swap_free_bytes,
        metrics.swap_usage_percent
      ]);
    } catch (error) {
      this.logger.error('Error storing memory metrics:', error);
    }
  }

  async storeDiskMetrics(metricsArray) {
    if (!metricsArray || metricsArray.length === 0) return;
    
    try {
      for (const metrics of metricsArray) {
        await this.dbPool.execute(`
          INSERT INTO disk_metrics (
            filesystem, mount_point, total_bytes, used_bytes, available_bytes,
            usage_percent, inodes_total, inodes_used, inodes_free
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          metrics.filesystem,
          metrics.mount_point,
          metrics.total_bytes,
          metrics.used_bytes,
          metrics.available_bytes,
          metrics.usage_percent,
          metrics.inodes_total,
          metrics.inodes_used,
          metrics.inodes_free
        ]);
      }
    } catch (error) {
      this.logger.error('Error storing disk metrics:', error);
    }
  }

  async storeNetworkMetrics(metricsArray) {
    if (!metricsArray || metricsArray.length === 0) return;
    
    try {
      for (const metrics of metricsArray) {
        const safeMetrics = {
          interface_name: metrics.interface_name || null,
          bytes_sent: Number.isFinite(metrics.bytes_sent) ? metrics.bytes_sent : 0,
          bytes_recv: Number.isFinite(metrics.bytes_recv) ? metrics.bytes_recv : 0,
          packets_sent: Number.isFinite(metrics.packets_sent) ? metrics.packets_sent : 0,
          packets_recv: Number.isFinite(metrics.packets_recv) ? metrics.packets_recv : 0,
          errors_in: Number.isFinite(metrics.errors_in) ? metrics.errors_in : 0,
          errors_out: Number.isFinite(metrics.errors_out) ? metrics.errors_out : 0,
          drops_in: Number.isFinite(metrics.drops_in) ? metrics.drops_in : 0,
          drops_out: Number.isFinite(metrics.drops_out) ? metrics.drops_out : 0,
          speed_mbps: metrics.speed_mbps || null,
          duplex: metrics.duplex || null,
          mtu: Number.isFinite(metrics.mtu) ? metrics.mtu : null
        };
        
        await this.dbPool.execute(`
          INSERT INTO network_metrics (
            interface_name, bytes_sent, bytes_recv, packets_sent, packets_recv,
            errors_in, errors_out, drops_in, drops_out, speed_mbps, duplex, mtu
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          safeMetrics.interface_name,
          safeMetrics.bytes_sent,
          safeMetrics.bytes_recv,
          safeMetrics.packets_sent,
          safeMetrics.packets_recv,
          safeMetrics.errors_in,
          safeMetrics.errors_out,
          safeMetrics.drops_in,
          safeMetrics.drops_out,
          safeMetrics.speed_mbps,
          safeMetrics.duplex,
          safeMetrics.mtu
        ]);
      }
    } catch (error) {
      this.logger.error('Error storing network metrics:', error);
    }
  }

  async storeProcessMetrics(metrics) {
    if (!metrics) return;
    
    try {
      const safeMetrics = {
        running_processes: Number.isFinite(metrics.running_processes) ? metrics.running_processes : 0,
        sleeping_processes: Number.isFinite(metrics.sleeping_processes) ? metrics.sleeping_processes : 0,
        zombie_processes: Number.isFinite(metrics.zombie_processes) ? metrics.zombie_processes : 0,
        total_processes: Number.isFinite(metrics.total_processes) ? metrics.total_processes : 0,
        cpu_usage_percent: Number.isFinite(metrics.cpu_usage_percent) ? metrics.cpu_usage_percent : 0,
        memory_usage_percent: Number.isFinite(metrics.memory_usage_percent) ? metrics.memory_usage_percent : 0
      };
      
      await this.dbPool.execute(`
        INSERT INTO process_metrics (
          running_processes, sleeping_processes, zombie_processes, total_processes,
          cpu_usage_percent, memory_usage_percent
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
        safeMetrics.running_processes,
        safeMetrics.sleeping_processes,
        safeMetrics.zombie_processes,
        safeMetrics.total_processes,
        safeMetrics.cpu_usage_percent,
        safeMetrics.memory_usage_percent
      ]);
    } catch (error) {
      this.logger.error('Error storing process metrics:', error);
    }
  }

  async storeGPUMetrics(metrics) {
    if (!metrics) return;
    
    try {
      await this.dbPool.execute(`
        INSERT INTO gpu_metrics (
          gpu_temp_celsius, gpu_memory_used_bytes, gpu_memory_total_bytes, gpu_usage_percent
        ) VALUES (?, ?, ?, ?)
      `, [
        metrics.gpu_temp_celsius,
        metrics.gpu_memory_used_bytes,
        metrics.gpu_memory_total_bytes,
        metrics.gpu_usage_percent
      ]);
    } catch (error) {
      this.logger.error('Error storing GPU metrics:', error);
    }
  }

  async storeAllMetrics(metrics) {
    try {
      await Promise.all([
        this.storeCPUMetrics(metrics.cpu),
        this.storeMemoryMetrics(metrics.memory),
        this.storeDiskMetrics(metrics.disk),
        this.storeNetworkMetrics(metrics.network),
        this.storeProcessMetrics(metrics.processes),
        this.storeGPUMetrics(metrics.gpu)
      ]);
    } catch (error) {
      this.logger.error('Error storing metrics:', error);
    }
  }

  async cleanupOldData() {
    const tables = [
      'cpu_metrics', 'memory_metrics', 'disk_metrics', 'network_metrics',
      'process_metrics', 'gpu_metrics', 'alerts', 'system_events'
    ];

    this.logger.info(`🧹 Starting cleanup of data older than ${this.dataRetentionDays} days`);

    for (const table of tables) {
      try {
        const [result] = await this.dbPool.execute(`
          DELETE FROM ${table} WHERE timestamp < DATE_SUB(NOW(), INTERVAL ? DAY)
        `, [this.dataRetentionDays]);
        
        if (result.affectedRows > 0) {
          this.logger.info(`🧹 Cleaned ${result.affectedRows} old records from ${table}`);
        }
      } catch (error) {
        this.logger.error(`Error cleaning ${table}:`, error);
      }
    }
  }
}

module.exports = MetricsCollector;