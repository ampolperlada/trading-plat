// services/AuthService.js
const jwt = require('jsonwebtoken');
const { query } = require('../config/database'); // Import the query helper
const bcrypt = require('bcryptjs'); // Import bcrypt for password comparison

class AuthService {
  constructor(redisService) {
    this.redis = redisService;
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
  }

  generateToken(userId, email) {
    return jwt.sign(
      { userId, email },
      this.jwtSecret,
      { expiresIn: '24h' }
    );
  }

  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret);
      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  async getUserFromToken(token) {
    try {
      const decoded = await this.verifyToken(token);
      
      // Check Redis cache (if available)
      let user = null;
      if (this.redis) {
        const cached = await this.redis.get(`session:${decoded.userId}`);
        user = cached;
      }
      
      if (!user) {
        // Fetch user from MySQL using the query helper
        const users = await query('SELECT id, email, first_name, last_name, balance, is_verified, account_type, total_profit, total_trades, win_rate, created_at, last_login FROM users WHERE id = ?', [decoded.userId]);
        
        if (users.length === 0) {
          throw new Error('User not found');
        }
        
        user = users[0];
        
        // Cache the user in Redis (if available)
        if (this.redis && user) {
          await this.redis.set(`session:${decoded.userId}`, user, 3600); // Cache for 1 hour
        }
      }
      
      return user;
    } catch (error) {
      console.error('AuthService getUserFromToken error:', error.message);
      throw new Error('Invalid or expired token');
    }
  }

  async invalidateUserSession(userId) {
    if (this.redis) {
      await this.redis.delete(`session:${userId}`);
    }
  }
}

module.exports = AuthService;