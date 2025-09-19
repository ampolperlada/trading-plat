// services/TradingEngine.js
const Trade = require('../models/Trade');
// Assuming you have an Asset model, or you can fetch prices from MarketDataService
// const Asset = require('../models/Asset'); 
// const marketDataService = require('./MarketDataService'); // If you need to inject this

class TradingEngine {
  constructor(io, redisService) {
    this.io = io;
    this.redis = redisService;
    this.activeTrades = new Map();
    this.tradeTimers = new Map();
    
    // Load pending trades when the engine starts
    this.loadPendingTrades().catch(err => console.error("Failed to load pending trades on startup:", err));
  }

  async loadPendingTrades() {
    try {
      // Find trades that are still pending and haven't expired yet
      const pendingTrades = await Trade.find({ 
        status: 'open', // Assuming 'open' is the status for active trades
        expiryTime: { $gt: new Date() }
      });

      console.log(`📊 Found ${pendingTrades.length} pending trades to load.`);
      
      for (const trade of pendingTrades) {
        this.addTrade(trade);
      }

      console.log(`📊 Loaded ${pendingTrades.length} pending trades into engine.`);
    } catch (error) {
      console.error('Error loading pending trades:', error);
      // Don't throw, let the app continue
    }
  }

  // Add a trade to the engine's active list and set its timer
  addTrade(trade) {
    const tradeId = trade._id.toString();
    
    // Clear any existing timer for this trade (shouldn't happen, but safe)
    if (this.tradeTimers.has(tradeId)) {
        clearTimeout(this.tradeTimers.get(tradeId));
    }

    // Calculate time left until expiry
    const timeLeft = trade.expiryTime.getTime() - Date.now();

    if (timeLeft > 0) {
        console.log(`🕒 Scheduling result for trade ${tradeId} in ${timeLeft}ms`);
        const timerId = setTimeout(async () => {
            try {
                await this.processTradeResult(trade);
            } catch (err) {
                console.error(`Error processing trade ${tradeId}:`, err);
            } finally {
                // Clean up
                this.activeTrades.delete(tradeId);
                this.tradeTimers.delete(tradeId);
            }
        }, timeLeft);

        this.activeTrades.set(tradeId, trade);
        this.tradeTimers.set(tradeId, timerId);
    } else {
        // Trade has already expired, process immediately or mark as expired
        console.warn(`Trade ${tradeId} was already expired when loaded. Processing now.`);
        this.processTradeResult(trade).catch(err => console.error(`Error processing expired trade ${tradeId}:`, err));
    }
  }

  // This is the core logic to determine win/loss and update the database
  async processTradeResult(trade) {
    console.log(`🎲 Processing result for trade ${trade._id}`);
    try {
        // 1. Get the final price of the asset
        // Option A: If you have a direct way to get the current price (e.g., from MarketDataService)
        // const finalPriceData = await marketDataService.getPrice(trade.asset);
        // const finalPrice = finalPriceData.price;

        // Option B: For now, simulate a small price change from entry
        const priceChangeFactor = (Math.random() - 0.5) * 0.002; // +/- 0.1%
        const finalPrice = trade.entryPrice * (1 + priceChangeFactor);
        
        // 2. Determine win/loss
        let result = 'loss';
        let profit = -trade.amount; // Default to loss amount

        if (
            (trade.direction === 'CALL' && finalPrice > trade.entryPrice) ||
            (trade.direction === 'PUT' && finalPrice < trade.entryPrice)
        ) {
            result = 'win';
            // Payout is amount + (amount * payoutPercentage)
            // Assuming 80% payout for now, adjust as needed or fetch from asset/settings
            const payoutPercentage = 0.8; 
            profit = trade.amount * payoutPercentage;
        }

        // 3. Update the trade document in the database
        trade.status = 'closed';
        trade.result = result;
        trade.profit = profit;
        trade.closePrice = finalPrice;
        trade.closeTime = new Date();
        await trade.save();

        console.log(`✅ Trade ${trade._id} closed. Result: ${result}, Profit: $${profit.toFixed(2)}`);

        // 4. Update User Balance (if using a User model)
        // const User = require('../models/User');
        // const user = await User.findById(trade.userId);
        // if (user) {
        //     user.balance += profit; // Add profit (can be negative)
        //     await user.save();
        //     console.log(`💰 User ${user._id} balance updated to $${user.balance.toFixed(2)}`);
        // }

        // 5. Broadcast the result via Socket.IO
        // Emit to the specific user's room (you need to ensure users join their room on connect)
        // this.io.to(`user_${trade.userId}`).emit('trade_result', trade.toObject());
        
        // For simplicity, emit to all for now, or use a more specific room if set up
        this.io.emit('trade_result', trade.toObject()); // Consider changing to user-specific room
        
    } catch (error) {
        console.error(`❌ Failed to process trade result for ${trade._id}:`, error);
        // Optionally, update trade status to 'error' in DB
    }
  }

  // Method to be called when a new trade is created via API
  async handleNewTrade(tradeDocument) {
    console.log(`🆕 New trade received by engine: ${tradeDocument._id}`);
    this.addTrade(tradeDocument);
  }

  // Graceful shutdown: Clear all timers
  cleanup() {
    console.log("🧹 Cleaning up Trading Engine...");
    for (const timerId of this.tradeTimers.values()) {
        clearTimeout(timerId);
    }
    this.activeTrades.clear();
    this.tradeTimers.clear();
    console.log("🧹 Trading Engine cleanup complete.");
  }
}

module.exports = TradingEngine;