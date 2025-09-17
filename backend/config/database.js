/* eslint-disable linebreak-style */
const mysql = require('mysql2/promise');

class DatabaseConfig {
  constructor() {
    this.pool = null;
    this.isConnected = false;
  }

  async initializeDatabase() {
    try {
      const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'trading_platform',
        port: process.env.DB_PORT || 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      };

      this.pool = await mysql.createPool(config);

      // Test the connection
      await this.pool.execute('SELECT 1');
      this.isConnected = true;

      console.log('✅ MySQL database connected successfully');
      return this.pool;
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      this.isConnected = false;
      throw error;
    }
  }

  getConnection() {
    return this.pool;
  }

  getPool() {
    return this.pool;
  }

  // Helper method for executing queries
  async query(sql, params = []) {
    if (!this.pool) {
      throw new Error('Database not initialized. Call initializeDatabase() first.');
    }
    try {
      const [rows] = await this.pool.execute(sql, params);
      return rows;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  getMongoConnection() {
    return null;
  }

  getRedisClient() {
    return null;
  }

  async closeConnections() {
    if (this.pool) {
      await this.pool.end();
      this.isConnected = false;
      console.log('🔌 Database connection closed');
    }
  }
}

const databaseConfig = new DatabaseConfig();

// Export both the instance and helper functions
module.exports = {
  initializeDatabase: () => databaseConfig.initializeDatabase(),
  getConnection: () => databaseConfig.getConnection(),
  getPool: () => databaseConfig.getPool(),
  query: (sql, params) => databaseConfig.query(sql, params),
  closeConnections: () => databaseConfig.closeConnections(),
  getMongoConnection: () => databaseConfig.getMongoConnection(),
  getRedisClient: () => databaseConfig.getRedisClient()
};