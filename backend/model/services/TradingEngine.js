// services/TradingEngine.js
const { query } = require('../config/database'); // Import the query helper
const Asset = require('../models/Asset'); // We'll still need this for initial data, but modify its usage

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
      // Note: MySQL TIMESTAMP comparison might need adjustment based on timezone
      const pendingTrades = await query(`
        SELECT * FROM trades 
        WHERE status = 'open' AND expiration_time > NOW()
      `);

      console.log(`📊 Found ${pendingTrades.length} pending trades to load.`);
      
      for (const trade of pendingTrades) {
        // Convert MySQL timestamp strings to Date objects if necessary
        // trade.expiryTime = new Date(trade.expiration_time); // Example conversion
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
    const tradeId = trade.id.toString(); // Use MySQL 'id' instead of Mongoose '_id'
    
    // Clear any existing timer for this trade (shouldn't happen, but safe)
    if (this.tradeTimers.has(tradeId)) {
        clearTimeout(this.tradeTimers.get(tradeId));
    }

    // Calculate time left until expiry
    // Ensure trade.expiration_time is a Date object or comparable timestamp
    const expiryTime = new Date(trade.expiration_time);
    const timeLeft = expiryTime.getTime() - Date.now();

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
    console.log(`🎲 Processing result for trade ${trade.id}`); // Use MySQL 'id'
    try {
        // 1. Get the final price of the asset (simulated here)
        // Option B: For now, simulate a small price change from entry
        const priceChangeFactor = (Math.random() - 0.5) * 0.002; // +/- 0.1%
        const finalPrice = trade.open_price * (1 + priceChangeFactor); // Use MySQL column name
        
        // 2. Determine win/loss
        let result = 'loss';
        let profit = -trade.amount; // Default to loss amount

        if (
            (trade.trade_type === 'CALL' && finalPrice > trade.open_price) || // Use MySQL column name
            (trade.trade_type === 'PUT' && finalPrice < trade.open_price)    // Use MySQL column name
        ) {
            result = 'win';
            // Payout is amount * payoutPercentage
            const payoutPercentage = trade.payout || 0.8; // Use MySQL column name, fallback to 0.8
            profit = trade.amount * payoutPercentage;
        }

        // 3. Update the trade record in the MySQL database
        await query(`
          UPDATE trades 
          SET status = ?, result = ?, profit = ?, close_price = ?, close_time = NOW(), is_settled = TRUE 
          WHERE id = ?
        `, ['closed', result, profit, finalPrice, trade.id]); // Use MySQL column names

        console.log(`✅ Trade ${trade.id} closed. Result: ${result}, Profit: $${profit.toFixed(2)}`);

        // 4. Update User Balance
        // Adjust user balance based on profit (can be negative)
        await query(`
          UPDATE users 
          SET balance = balance + ? 
          WHERE id = ?
        `, [profit, trade.user_id]); // Use MySQL column names

        console.log(`💰 User ${trade.user_id} balance updated. Profit/Loss: $${profit.toFixed(2)}`);

        // 5. Broadcast the result via Socket.IO
        // Prepare the trade object to send (it might be missing some fields from the query)
        const updatedTradeForBroadcast = {
            id: trade.id,
            asset: trade.asset,
            trade_type: trade.trade_type, // Or direction if you change the column
            amount: trade.amount,
            result: result,
            profit: profit,
            close_price: finalPrice,
            // ... include other relevant fields for the frontend
        };

        // Emit to the specific user's room (you need to ensure users join their room on connect)
        // this.io.to(`user_${trade.userId}`).emit('trade_result', updatedTradeForBroadcast);
        
        // For simplicity, emit to all for now, or use a more specific room if set up
        this.io.emit('trade_result', updatedTradeForBroadcast); // Consider changing to user-specific room
        
    } catch (error) {
        console.error(`❌ Failed to process trade result for ${trade.id}:`, error);
        // Optionally, update trade status to 'error' in DB
        try {
          await query(`
            UPDATE trades 
            SET status = 'error', close_time = NOW(), is_settled = TRUE 
            WHERE id = ?
          `, [trade.id]);
        } catch (updateErr) {
          console.error(`Failed to update trade ${trade.id} status to error:`, updateErr);
        }
    }
  }

  // Method to be called when a new trade is created via API
  async handleNewTrade(tradeRecord) { // tradeRecord is the object from MySQL query
    console.log(`🆕 New trade received by engine: ${tradeRecord.id}`); // Use MySQL 'id'
    this.addTrade(tradeRecord);
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