const express = require('express');
const router = express.Router();
const { 
  getLatestMetrics, 
  getMetricsInRange, 
  executeQuery 
} = require('../../config/database');

// Helper function to get live fan status
const getFanStatus = async () => {
  try {
    const fs = require('fs').promises;
    const fanStateRaw = await fs.readFile('/sys/class/thermal/cooling_device0/cur_state', 'utf8');
    const fanState = parseInt(fanStateRaw.trim());
    
    const getFanDescription = (level) => {
      switch (level) {
        case 0: return 'Fan Off';
        case 1: return 'Fan Low';
        case 2: return 'Fan Medium';
        case 3: return 'Fan High';
        case 4: return 'Fan Max';
        default: return `Fan Level ${level}`;
      }
    };
    
    return {
      level: fanState,
      status: fanState === 0 ? 'off' : 'on',
      description: getFanDescription(fanState)
    };
  } catch (error) {
    return {
      level: null,
      status: 'unknown',
      description: 'Fan status unavailable'
    };
  }
};

// GET /api/metrics - Get latest metrics for all categories (default route)
router.get('/', async (req, res) => {
  try {
    const fanStatus = await getFanStatus();
    const metrics = {
      cpu: await getLatestMetrics('cpu_metrics', 1),
      memory: await getLatestMetrics('memory_metrics', 1),
      disk: await getLatestMetrics('disk_metrics', 5),
      network: await getLatestMetrics('network_metrics', 10),
      processes: await getLatestMetrics('process_metrics', 1),
      gpu: await getLatestMetrics('gpu_metrics', 1),
      timestamp: new Date().toISOString()
    };
    
    // Add fan status to GPU metrics if available
    if (metrics.gpu && metrics.gpu.length > 0) {
      metrics.gpu[0].fan_status = fanStatus;
    }
    
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/metrics/latest - Get latest metrics for all categories
router.get('/latest', async (req, res) => {
  try {
    const fanStatus = await getFanStatus();
    const metrics = {
      cpu: await getLatestMetrics('cpu_metrics', 1),
      memory: await getLatestMetrics('memory_metrics', 1),
      disk: await getLatestMetrics('disk_metrics', 5),
      network: await getLatestMetrics('network_metrics', 10),
      processes: await getLatestMetrics('process_metrics', 1),
      gpu: await getLatestMetrics('gpu_metrics', 1),
      timestamp: new Date().toISOString()
    };
    
    // Add fan status to GPU metrics if available
    if (metrics.gpu && metrics.gpu.length > 0) {
      metrics.gpu[0].fan_status = fanStatus;
    }
    
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/metrics/cpu - Get CPU metrics
router.get('/cpu', async (req, res) => {
  try {
    const { limit = 100, range } = req.query;
    let metrics;
    
    if (range) {
      const [start, end] = range.split(',');
      metrics = await getMetricsInRange('cpu_metrics', start, end, parseInt(limit));
    } else {
      metrics = await getLatestMetrics('cpu_metrics', parseInt(limit));
    }
    
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/metrics/memory - Get memory metrics
router.get('/memory', async (req, res) => {
  try {
    const { limit = 100, range } = req.query;
    let metrics;
    
    if (range) {
      const [start, end] = range.split(',');
      metrics = await getMetricsInRange('memory_metrics', start, end, parseInt(limit));
    } else {
      metrics = await getLatestMetrics('memory_metrics', parseInt(limit));
    }
    
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/metrics/disk - Get disk metrics
router.get('/disk', async (req, res) => {
  try {
    const { limit = 100, range } = req.query;
    let metrics;
    
    if (range) {
      const [start, end] = range.split(',');
      metrics = await getMetricsInRange('disk_metrics', start, end, parseInt(limit));
    } else {
      metrics = await getLatestMetrics('disk_metrics', parseInt(limit));
    }
    
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/metrics/network - Get network metrics
router.get('/network', async (req, res) => {
  try {
    const { limit = 100, range, interface: interfaceName } = req.query;
    let metrics;
    
    if (range) {
      const [start, end] = range.split(',');
      let query = 'SELECT * FROM network_metrics WHERE timestamp BETWEEN ? AND ?';
      let params = [start, end];
      
      if (interfaceName) {
        query += ' AND interface_name = ?';
        params.push(interfaceName);
      }
      
      query += ' ORDER BY timestamp DESC LIMIT ?';
      params.push(parseInt(limit));
      
      metrics = await executeQuery(query, params);
    } else {
      let query = 'SELECT * FROM network_metrics';
      let params = [];
      
      if (interfaceName) {
        query += ' WHERE interface_name = ?';
        params.push(interfaceName);
      }
      
      query += ' ORDER BY timestamp DESC LIMIT ?';
      params.push(parseInt(limit));
      
      metrics = await executeQuery(query, params);
    }
    
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/metrics/processes - Get process metrics
router.get('/processes', async (req, res) => {
  try {
    const { limit = 100, range } = req.query;
    let metrics;
    
    if (range) {
      const [start, end] = range.split(',');
      metrics = await getMetricsInRange('process_metrics', start, end, parseInt(limit));
    } else {
      metrics = await getLatestMetrics('process_metrics', parseInt(limit));
    }
    
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/metrics/gpu - Get GPU metrics
router.get('/gpu', async (req, res) => {
  try {
    const { limit = 100, range } = req.query;
    let metrics;
    
    if (range) {
      const [start, end] = range.split(',');
      metrics = await getMetricsInRange('gpu_metrics', start, end, parseInt(limit));
    } else {
      metrics = await getLatestMetrics('gpu_metrics', parseInt(limit));
    }
    
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/metrics/summary - Get aggregated metrics summary
router.get('/summary', async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    const hoursBack = parseInt(hours);
    
    // Simplified queries for testing
    const cpuQuery = `SELECT 
      AVG(cpu_usage_percent) as avg_value,
      MAX(cpu_usage_percent) as max_value,
      MIN(cpu_usage_percent) as min_value,
      AVG(cpu_temp_celsius) as avg_temp,
      MAX(cpu_temp_celsius) as max_temp
    FROM cpu_metrics 
    WHERE timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)`;
    
    const memoryQuery = `SELECT 
      AVG(usage_percent) as avg_value,
      MAX(usage_percent) as max_value,
      MIN(usage_percent) as min_value,
      AVG(used_bytes) as avg_used_bytes
    FROM memory_metrics 
    WHERE timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)`;
    
    const diskQuery = `SELECT 
      AVG(usage_percent) as avg_value,
      MAX(usage_percent) as max_value,
      MIN(usage_percent) as min_value,
      filesystem
    FROM disk_metrics 
    WHERE timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)
    GROUP BY filesystem`;
    
    const cpuSummary = await executeQuery(cpuQuery, [hoursBack]);
    const memorySummary = await executeQuery(memoryQuery, [hoursBack]);
    const diskSummary = await executeQuery(diskQuery, [hoursBack]);
    
    res.json({
      period_hours: hoursBack,
      cpu: cpuSummary[0] || null,
      memory: memorySummary[0] || null,
      disk: diskSummary || [],
      generated_at: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/metrics/interfaces - Get available network interfaces
router.get('/interfaces', async (req, res) => {
  try {
    const interfaces = await executeQuery(`
      SELECT DISTINCT interface_name, 
             COUNT(*) as metric_count,
             MAX(timestamp) as last_update
      FROM network_metrics 
      WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
      GROUP BY interface_name
      ORDER BY interface_name
    `);
    
    res.json(interfaces);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/metrics/charts - Get chart data for specified time range
router.get('/charts', async (req, res) => {
  try {
    const { 
      range = '1h', 
      limit = 50 
    } = req.query;
    
    // Calculate time range in UTC to match database timestamps
    const now = new Date();
    let startTime = new Date();
    
    switch (range) {
      case '1h':
        startTime = new Date(now.getTime() - (60 * 60 * 1000));
        break;
      case '6h':
        startTime = new Date(now.getTime() - (6 * 60 * 60 * 1000));
        break;
      case '24h':
        startTime = new Date(now.getTime() - (24 * 60 * 60 * 1000));
        break;
      case '7d':
        startTime = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        break;
      default:
        startTime = new Date(now.getTime() - (60 * 60 * 1000));
    }
    
    const timeRange = `${startTime.toISOString()},${now.toISOString()}`;
    
    // Temporary fix: Get latest data without time range filtering
    // This bypasses the timezone issue in the database query
    const [cpuData, memoryData, networkData, gpuData] = await Promise.all([
      getLatestMetrics('cpu_metrics', parseInt(limit)),
      getLatestMetrics('memory_metrics', parseInt(limit)),
      getLatestMetrics('network_metrics', parseInt(limit)),
      getLatestMetrics('gpu_metrics', parseInt(limit))
    ]);
    
    // Format data for charts
    const chartData = {
      cpu: cpuData.map(row => ({
        timestamp: row.timestamp,
        value: parseFloat(row.cpu_usage_percent) || 0
      })),
      memory: memoryData.map(row => ({
        timestamp: row.timestamp,
        value: parseFloat(row.usage_percent) || 0
      })),
      temperature: cpuData.map(row => ({
        timestamp: row.timestamp,
        value: parseFloat(row.cpu_temp_celsius) || 0
      })),
      network: networkData.map((row, index) => {
        // Calculate total network I/O (sent + received) in KB/s
        let totalBytesPerSecond = 0;
        if (index < networkData.length - 1) { // Since data is DESC, compare with next (older) entry
          const prevRow = networkData[index + 1];
          const timeDiff = (new Date(row.timestamp) - new Date(prevRow.timestamp)) / 1000; // seconds
          if (timeDiff > 0) {
            const sentDiff = Math.max(0, parseFloat(row.bytes_sent) - parseFloat(prevRow.bytes_sent));
            const recvDiff = Math.max(0, parseFloat(row.bytes_recv) - parseFloat(prevRow.bytes_recv));
            totalBytesPerSecond = (sentDiff + recvDiff) / timeDiff;
          }
        }
        return {
          timestamp: row.timestamp,
          value: Math.max(0, totalBytesPerSecond / 1024) // Convert to KB/s, ensure non-negative
        };
      }),
      gpu_temperature: gpuData.map(row => ({
        timestamp: row.timestamp,
        value: parseFloat(row.gpu_temp_celsius) || 0
      }))
    };
    
    res.json({
      range,
      startTime: startTime.toISOString(),
      endTime: now.toISOString(),
      data: chartData,
      timestamp: now.toISOString()
    });
    
  } catch (error) {
    console.error('Chart data error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;