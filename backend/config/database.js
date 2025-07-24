const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const dbConfig = {
  host: '127.0.0.1',
  user: 'raspi_monitor',
  password: 'monitoring_secure_pass_2024',
  database: 'raspi_monitor',
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  charset: 'utf8mb4',
  port: 3306,
  family: 4
};

let pool;

const createPool = () => {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
};

const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connection successful');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

const initializeDatabase = async () => {
  try {
    const connection = await pool.getConnection();
    
    // Test if tables exist
    const [tables] = await connection.execute(`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_schema = ? AND table_name = ?
    `, [dbConfig.database, 'system_info']);
    
    if (tables[0].count === 0) {
      console.log('🔄 Tables not found, database setup required');
      return false;
    }
    
    console.log('✅ Database tables verified');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    return false;
  }
};

const executeQuery = async (query, params = []) => {
  try {
    const connection = await pool.getConnection();
    const [results] = await connection.execute(query, params);
    connection.release();
    return results;
  } catch (error) {
    console.error('Database query error:', error.message);
    throw error;
  }
};

const insertMetrics = async (table, data) => {
  try {
    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);
    
    const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
    return await executeQuery(query, values);
  } catch (error) {
    console.error(`Error inserting into ${table}:`, error.message);
    throw error;
  }
};

const getLatestMetrics = async (table, limit = 100) => {
  try {
    const query = `SELECT * FROM ${table} ORDER BY timestamp DESC LIMIT ?`;
    return await executeQuery(query, [limit]);
  } catch (error) {
    console.error(`Error fetching from ${table}:`, error.message);
    throw error;
  }
};

const getMetricsInRange = async (table, startTime, endTime, limit = 1000) => {
  try {
    const query = `
      SELECT * FROM ${table} 
      WHERE timestamp >= ? AND timestamp <= ?
      ORDER BY timestamp DESC 
      LIMIT ?
    `;
    console.log(`SQL Query: ${query} with params:`, [startTime, endTime, limit]);
    const result = await executeQuery(query, [startTime, endTime, limit]);
    console.log(`Query result for ${table}: ${result.length} rows, first timestamp:`, result[0]?.timestamp);
    return result;
  } catch (error) {
    console.error(`Error fetching range from ${table}:`, error.message);
    throw error;
  }
};

const cleanupOldData = async (table, daysToKeep = 30) => {
  try {
    const query = `DELETE FROM ${table} WHERE timestamp < DATE_SUB(NOW(), INTERVAL ? DAY)`;
    const result = await executeQuery(query, [daysToKeep]);
    console.log(`🧹 Cleaned ${result.affectedRows} old records from ${table}`);
    return result;
  } catch (error) {
    console.error(`Error cleaning ${table}:`, error.message);
    throw error;
  }
};

module.exports = {
  createPool,
  testConnection,
  initializeDatabase,
  executeQuery,
  insertMetrics,
  getLatestMetrics,
  getMetricsInRange,
  cleanupOldData,
  pool: () => pool
};