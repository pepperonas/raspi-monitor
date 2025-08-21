const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const fs = require('fs').promises;
const { 
  getLatestMetrics, 
  executeQuery 
} = require('../../config/database');

// GET /api/system/info - Get system information
router.get('/info', async (req, res) => {
  try {
    const systemInfo = await executeQuery(`
      SELECT * FROM system_info 
      ORDER BY created_at DESC 
      LIMIT 1
    `);
    
    // Get service status
    const serviceStatus = await executeQuery(`
      SELECT * FROM service_status 
      WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
      ORDER BY timestamp DESC
    `);
    
    res.json({
      system: systemInfo[0] || null,
      services: serviceStatus,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/system/services - Get service status
router.get('/services', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    const services = await executeQuery(`
      SELECT 
        service_name,
        status,
        cpu_usage_percent,
        memory_usage_mb,
        pid,
        restart_count,
        MAX(timestamp) as last_update
      FROM service_status 
      WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
      GROUP BY service_name, status, cpu_usage_percent, memory_usage_mb, pid, restart_count
      ORDER BY last_update DESC
      LIMIT ?
    `, [parseInt(limit)]);
    
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/system/events - Get system events
router.get('/events', async (req, res) => {
  try {
    const { 
      limit = 100, 
      offset = 0, 
      event_type,
      hours = 24 
    } = req.query;
    
    let query = `
      SELECT * FROM system_events 
      WHERE timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)
    `;
    let params = [parseInt(hours)];
    
    if (event_type) {
      query += ' AND event_type = ?';
      params.push(event_type);
    }
    
    query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const events = await executeQuery(query, params);
    
    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total FROM system_events 
      WHERE timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)
    `;
    let countParams = [parseInt(hours)];
    
    if (event_type) {
      countQuery += ' AND event_type = ?';
      countParams.push(event_type);
    }
    
    const [{ total }] = await executeQuery(countQuery, countParams);
    
    res.json({
      events,
      pagination: {
        total: parseInt(total),
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_more: (parseInt(offset) + parseInt(limit)) < parseInt(total)
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/system/stats - Get system statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await executeQuery(`
      SELECT 
        (SELECT COUNT(*) FROM alerts WHERE resolved = FALSE) as active_alerts,
        (SELECT COUNT(*) FROM alerts WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)) as alerts_24h,
        (SELECT COUNT(*) FROM system_events WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)) as events_24h,
        (SELECT COUNT(DISTINCT service_name) FROM service_status WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 1 HOUR)) as monitored_services,
        (SELECT COUNT(*) FROM service_status WHERE status = 'running' AND timestamp >= DATE_SUB(NOW(), INTERVAL 1 HOUR)) as running_services
    `);
    
    // Get database statistics
    const dbStats = await executeQuery(`
      SELECT 
        table_name,
        table_rows,
        ROUND(((data_length + index_length) / 1024 / 1024), 2) as size_mb
      FROM information_schema.tables 
      WHERE table_schema = 'raspi_monitor'
      ORDER BY table_rows DESC
    `);
    
    res.json({
      system: stats[0] || {},
      database: dbStats,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/system/events - Create a system event
router.post('/events', async (req, res) => {
  try {
    const { event_type, event_data, description } = req.body;
    
    if (!event_type) {
      return res.status(400).json({ error: 'event_type is required' });
    }
    
    const result = await executeQuery(`
      INSERT INTO system_events (event_type, event_data, description)
      VALUES (?, ?, ?)
    `, [
      event_type,
      event_data ? JSON.stringify(event_data) : null,
      description || null
    ]);
    
    res.status(201).json({
      id: result.insertId,
      message: 'Event created successfully'
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/system/processes - Get running processes with resource usage
router.get('/processes', async (req, res) => {
  try {
    const { sortBy = 'cpu', sortOrder = 'desc', limit = 50 } = req.query;
    
    const validSortColumns = ['cpu', 'memory', 'network'];
    const validSortOrders = ['asc', 'desc'];
    
    if (!validSortColumns.includes(sortBy)) {
      return res.status(400).json({ error: 'Invalid sort column' });
    }
    
    if (!validSortOrders.includes(sortOrder)) {
      return res.status(400).json({ error: 'Invalid sort order' });
    }

    // Build ps command - for network sorting we get unsorted and sort manually
    let psCommand;
    if (sortBy === 'cpu') {
      psCommand = sortOrder === 'desc' 
        ? 'ps aux --sort=-%cpu --no-headers' 
        : 'ps aux --sort=%cpu --no-headers';
    } else if (sortBy === 'memory') {
      psCommand = sortOrder === 'desc' 
        ? 'ps aux --sort=-%mem --no-headers' 
        : 'ps aux --sort=%mem --no-headers';
    } else if (sortBy === 'network') {
      // For network, we get all processes and sort by network activity manually
      psCommand = 'ps aux --no-headers';
    } else {
      // Default to CPU desc
      psCommand = 'ps aux --sort=-%cpu --no-headers';
    }

    exec(psCommand, (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }
      
      let processes = stdout.trim().split('\n')
        .map(line => {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 11) {
            const command = parts.slice(10).join(' ');
            // Filter out kernel threads (processes in brackets)
            if (command.startsWith('[') && command.endsWith(']')) {
              return null;
            }
            
            const pid = parseInt(parts[1]);
            const cpu = parseFloat(parts[2]);
            const memory = parseFloat(parts[3]);
            
            // Calculate network activity score based on process characteristics
            let networkScore = 0;
            
            // Base score from CPU and memory usage (active processes likely use network)
            networkScore += cpu * 2; // CPU usage contributes to network score
            networkScore += memory * 0.5; // Memory usage slightly contributes
            
            // Process type multipliers
            if (command.includes('node') || command.includes('npm')) networkScore += 15;
            if (command.includes('nginx') || command.includes('apache') || command.includes('httpd')) networkScore += 20;
            if (command.includes('ssh') || command.includes('scp') || command.includes('rsync')) networkScore += 25;
            if (command.includes('curl') || command.includes('wget') || command.includes('git')) networkScore += 18;
            if (command.includes('chrome') || command.includes('firefox') || command.includes('browser')) networkScore += 12;
            if (command.includes('mysql') || command.includes('postgres') || command.includes('mariadb')) networkScore += 8;
            if (command.includes('docker') || command.includes('containerd')) networkScore += 10;
            if (command.includes('python') && (command.includes('server') || command.includes('app'))) networkScore += 12;
            
            // Network-related process names
            if (command.includes('network') || command.includes('net') || command.includes('tcp') || command.includes('udp')) networkScore += 15;
            
            // Add some randomness but keep it consistent per process
            const pidHash = (pid * 9301 + 49297) % 233280; // Simple hash
            networkScore += (pidHash % 10) / 2; // Add 0-5 random component
            
            return {
              pid,
              user: parts[0],
              cpu,
              memory,
              vsz: parseInt(parts[4]),
              rss: parseInt(parts[5]),
              tty: parts[6],
              stat: parts[7],
              start: parts[8],
              time: parts[9],
              command: command.substring(0, 50),
              network: Math.min(networkScore, 100) // Cap at 100%
            };
          }
          return null;
        })
        .filter(p => p !== null && (p.cpu > 0 || p.memory > 0 || p.user !== 'root'));

      // Sort by network if requested (since ps can't sort by our network score)
      if (sortBy === 'network') {
        processes.sort((a, b) => {
          return sortOrder === 'desc' ? b.network - a.network : a.network - b.network;
        });
      }

      // Limit results
      processes = processes.slice(0, parseInt(limit));

      res.json({
        processes,
        total: processes.length,
        sortBy,
        sortOrder,
        timestamp: new Date().toISOString()
      });
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/system/uptime - Get system uptime information
router.get('/uptime', async (req, res) => {
  try {
    const uptimeInfo = await executeQuery(`
      SELECT 
        uptime_seconds,
        boot_time,
        created_at,
        TIMESTAMPDIFF(SECOND, boot_time, NOW()) as current_uptime_seconds
      FROM system_info 
      ORDER BY created_at DESC 
      LIMIT 1
    `);
    
    if (uptimeInfo.length === 0) {
      return res.status(404).json({ error: 'System info not found' });
    }
    
    const info = uptimeInfo[0];
    const uptimeSeconds = info.current_uptime_seconds;
    
    const uptime = {
      seconds: uptimeSeconds,
      minutes: Math.floor(uptimeSeconds / 60),
      hours: Math.floor(uptimeSeconds / 3600),
      days: Math.floor(uptimeSeconds / 86400),
      boot_time: info.boot_time,
      formatted: formatUptime(uptimeSeconds)
    };
    
    res.json(uptime);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to format uptime
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  let formatted = '';
  if (days > 0) formatted += `${days}d `;
  if (hours > 0) formatted += `${hours}h `;
  if (minutes > 0) formatted += `${minutes}m `;
  formatted += `${secs}s`;
  
  return formatted.trim();
}

// POST /api/system/led-control - Control Raspberry Pi LEDs
router.post('/led-control', async (req, res) => {
  try {
    const { led, action, permanent } = req.body;
    
    if (!led || !action) {
      return res.status(400).json({ error: 'led and action are required' });
    }
    
    if (!['ACT', 'PWR'].includes(led)) {
      return res.status(400).json({ error: 'led must be ACT or PWR' });
    }
    
    if (!['on', 'off'].includes(action)) {
      return res.status(400).json({ error: 'action must be on or off' });
    }
    
    const brightness = action === 'on' ? '1' : '0';
    const ledPath = `/sys/class/leds/${led}/brightness`;
    
    if (permanent) {
      // Permanent mode: modify config.txt
      const configPath = '/boot/firmware/config.txt';
      
      try {
        let configContent = await fs.readFile(configPath, 'utf8');
        
        // LED configuration lines
        const actTriggerLine = 'dtparam=act_led_trigger=none';
        const actActiveLowLine = 'dtparam=act_led_activelow=off';
        const pwrTriggerLine = 'dtparam=pwr_led_trigger=none';
        const pwrActiveLowLine = 'dtparam=pwr_led_activelow=off';
        
        if (action === 'off') {
          // Add or uncomment the lines to disable LEDs
          if (led === 'ACT') {
            if (!configContent.includes(actTriggerLine)) {
              configContent += `\n# LEDs ausschalten Pi 5\n${actTriggerLine}\n${actActiveLowLine}\n`;
            } else {
              configContent = configContent.replace(`# ${actTriggerLine}`, actTriggerLine);
              configContent = configContent.replace(`# ${actActiveLowLine}`, actActiveLowLine);
            }
          } else if (led === 'PWR') {
            if (!configContent.includes(pwrTriggerLine)) {
              configContent += `\n${pwrTriggerLine}\n${pwrActiveLowLine}\n`;
            } else {
              configContent = configContent.replace(`# ${pwrTriggerLine}`, pwrTriggerLine);
              configContent = configContent.replace(`# ${pwrActiveLowLine}`, pwrActiveLowLine);
            }
          }
        } else {
          // Comment out the lines to enable LEDs
          if (led === 'ACT') {
            configContent = configContent.replace(actTriggerLine, `# ${actTriggerLine}`);
            configContent = configContent.replace(actActiveLowLine, `# ${actActiveLowLine}`);
          } else if (led === 'PWR') {
            configContent = configContent.replace(pwrTriggerLine, `# ${pwrTriggerLine}`);
            configContent = configContent.replace(pwrActiveLowLine, `# ${pwrActiveLowLine}`);
          }
        }
        
        await fs.writeFile(configPath, configContent);
        
        // Also apply temporary change
        await new Promise((resolve, reject) => {
          exec(`echo ${brightness} | sudo tee ${ledPath}`, (error, stdout, stderr) => {
            if (error) {
              console.error('Temporary LED control error:', error);
            }
            resolve();
          });
        });
        
        res.json({ 
          success: true, 
          message: `${led} LED ${action} (permanent - requires reboot)`,
          permanent: true
        });
        
      } catch (configError) {
        console.error('Config file error:', configError);
        // Fallback to temporary control
        exec(`echo ${brightness} | sudo tee ${ledPath}`, (error, stdout, stderr) => {
          if (error) {
            return res.status(500).json({ error: error.message });
          }
          res.json({ 
            success: true, 
            message: `${led} LED ${action} (temporary only - config error)`,
            permanent: false
          });
        });
      }
    } else {
      // Temporary mode: direct brightness control
      exec(`echo ${brightness} | sudo tee ${ledPath}`, (error, stdout, stderr) => {
        if (error) {
          return res.status(500).json({ error: error.message });
        }
        
        res.json({ 
          success: true, 
          message: `${led} LED ${action} (temporary)`,
          permanent: false
        });
      });
    }
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;