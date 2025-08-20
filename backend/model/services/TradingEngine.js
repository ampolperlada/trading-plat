// services/TradingEngine.js
const Trade = require('../models/Trade');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Asset = require('../models/Asset');

class TradingEngine {
  constructor(io, redisService) {
    this.io = io;
    this.redis = redisService;
    this.activeTrades = new Map();
    this.tradeTimers = new Map();
    
    this.loadPendingTrades();
  }

  async loadPendingTrades() {
    try {
      const pendingTrades = await Trade.find({ 
        result: 'pending',
        expirationTime: { $gt: new Date() }
      });

      for (const trade of pendingTrades) {
        this.addTrade(trade);
      }

      console.log(`📊 Loaded ${pendingTrades.length} pending trades`);
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