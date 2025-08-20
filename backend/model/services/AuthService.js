// services/AuthService.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

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
      
      // Check Redis cache
      let user = null;
      if (this.redis) {
        const cached = await this.redis.get(`session:${decoded.userId}`);
        user = cached;
      }
      
      if (!user) {
        user = await User.findById(decoded.userId).select('-password');
        if (user && this.redis) {
          await this.redis.set(`session:${decoded.userId}`, user.toObject(), 3600);
        }
      }
      
      return user;
    } catch (error) {
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