/* eslint-disable linebreak-style */
const mysql = require('mysql2/promise');

class DatabaseConfig {
  constructor() {
    this.connection = null;
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

      this.connection = await mysql.createPool(config);

      // Test the connection
      await this.connection.execute('SELECT 1');
      this.isConnected = true;

      console.log('✅ MySQL database connected successfully');
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      this.isConnected = false;
      throw error;
    }
  }

  getConnection() {
    return this.connection;
  }

  // eslint-disable-next-line class-methods-use-this
  getMongoConnection() {
    return null;
  }

  // eslint-disable-next-line class-methods-use-this
  getRedisClient() {
    return null;
  }

  async closeConnections() {
    if (this.connection) {
      await this.connection.end();
      this.isConnected = false;
      console.log('🔌 Database connection closed');
    }
  }
}

module.exports = new DatabaseConfig();
