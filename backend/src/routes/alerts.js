const express = require('express');
const router = express.Router();
const { 
  getLatestMetrics, 
  executeQuery 
} = require('../../config/database');

// GET /api/alerts - Get alerts with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const { 
      limit = 50, 
      offset = 0, 
      severity, 
      resolved, 
      alert_type,
      hours = 24 
    } = req.query;
    
    let query = `
      SELECT * FROM alerts 
      WHERE timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)
    `;
    let params = [parseInt(hours)];
    
    if (severity) {
      query += ' AND severity = ?';
      params.push(severity);
    }
    
    if (resolved !== undefined) {
      query += ' AND resolved = ?';
      params.push(resolved === 'true');
    }
    
    if (alert_type) {
      query += ' AND alert_type = ?';
      params.push(alert_type);
    }
    
    query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const alerts = await executeQuery(query, params);
    
    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total FROM alerts 
      WHERE timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)
    `;
    let countParams = [parseInt(hours)];
    
    if (severity) {
      countQuery += ' AND severity = ?';
      countParams.push(severity);
    }
    
    if (resolved !== undefined) {
      countQuery += ' AND resolved = ?';
      countParams.push(resolved === 'true');
    }
    
    if (alert_type) {
      countQuery += ' AND alert_type = ?';
      countParams.push(alert_type);
    }
    
    const [{ total }] = await executeQuery(countQuery, countParams);
    
    res.json({
      alerts,
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

// GET /api/alerts/active - Get active (unresolved) alerts
router.get('/active', async (req, res) => {
  try {
    const activeAlerts = await executeQuery(`
      SELECT * FROM alerts 
      WHERE resolved = FALSE 
      ORDER BY severity DESC, timestamp DESC
    `);
    
    res.json(activeAlerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/alerts/summary - Get alert summary statistics
router.get('/summary', async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    
    const summaryQueries = [
      // Alert counts by severity
      `SELECT 
        severity,
        COUNT(*) as count,
        COUNT(CASE WHEN resolved = FALSE THEN 1 END) as active_count
      FROM alerts 
      WHERE timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)
      GROUP BY severity`,
      
      // Alert counts by type
      `SELECT 
        alert_type,
        COUNT(*) as count,
        COUNT(CASE WHEN resolved = FALSE THEN 1 END) as active_count
      FROM alerts 
      WHERE timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)
      GROUP BY alert_type`,
      
      // Recent alert trend (last 24 hours by hour)
      `SELECT 
        DATE_FORMAT(timestamp, '%Y-%m-%d %H:00:00') as hour,
        COUNT(*) as count,
        COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical_count
      FROM alerts 
      WHERE timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)
      GROUP BY DATE_FORMAT(timestamp, '%Y-%m-%d %H:00:00')
      ORDER BY hour DESC`
    ];
    
    const [severityStats] = await Promise.all([
      executeQuery(summaryQueries[0], [parseInt(hours)]),
      executeQuery(summaryQueries[1], [parseInt(hours)]),
      executeQuery(summaryQueries[2], [parseInt(hours)])
    ]);
    
    const typeStats = await executeQuery(summaryQueries[1], [parseInt(hours)]);
    const trendData = await executeQuery(summaryQueries[2], [parseInt(hours)]);
    
    res.json({
      period_hours: parseInt(hours),
      by_severity: severityStats,
      by_type: typeStats,
      trend: trendData,
      generated_at: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/alerts/:id/resolve - Resolve an alert
router.put('/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    const { resolved_by } = req.body;
    
    const result = await executeQuery(`
      UPDATE alerts 
      SET resolved = TRUE, resolved_at = NOW()
      WHERE id = ? AND resolved = FALSE
    `, [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Alert not found or already resolved' });
    }
    
    // Log the resolution
    await executeQuery(`
      INSERT INTO system_events (event_type, event_data, description)
      VALUES ('alert_resolved', ?, ?)
    `, [
      JSON.stringify({ alert_id: id, resolved_by }),
      `Alert ${id} resolved by ${resolved_by || 'system'}`
    ]);
    
    res.json({ message: 'Alert resolved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/alerts/resolve-all - Resolve all alerts of a certain type or severity
router.put('/resolve-all', async (req, res) => {
  try {
    const { alert_type, severity, resolved_by } = req.body;
    
    if (!alert_type && !severity) {
      return res.status(400).json({ 
        error: 'Either alert_type or severity must be specified' 
      });
    }
    
    let query = 'UPDATE alerts SET resolved = TRUE, resolved_at = NOW() WHERE resolved = FALSE';
    let params = [];
    
    if (alert_type) {
      query += ' AND alert_type = ?';
      params.push(alert_type);
    }
    
    if (severity) {
      query += ' AND severity = ?';
      params.push(severity);
    }
    
    const result = await executeQuery(query, params);
    
    // Log the mass resolution
    await executeQuery(`
      INSERT INTO system_events (event_type, event_data, description)
      VALUES ('alerts_bulk_resolved', ?, ?)
    `, [
      JSON.stringify({ alert_type, severity, resolved_by, count: result.affectedRows }),
      `${result.affectedRows} alerts resolved by ${resolved_by || 'system'}`
    ]);
    
    res.json({ 
      message: `${result.affectedRows} alerts resolved successfully` 
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/alerts/types - Get available alert types
router.get('/types', async (req, res) => {
  try {
    const types = await executeQuery(`
      SELECT DISTINCT alert_type, 
             COUNT(*) as total_count,
             COUNT(CASE WHEN resolved = FALSE THEN 1 END) as active_count,
             MAX(timestamp) as last_occurrence
      FROM alerts 
      WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY alert_type
      ORDER BY active_count DESC, total_count DESC
    `);
    
    res.json(types);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;