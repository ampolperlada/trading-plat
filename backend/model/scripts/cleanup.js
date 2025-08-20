require('dotenv').config();
const mongoose = require('mongoose');

const Trade = require('../models/Trade');
const PriceHistory = require('../services/PriceHistory');
const Transaction = require('../models/Transaction');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trading_platform';

async function cleanupOldData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB for cleanup');
    
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    // Clean up old price history
    const deletedPriceHistory = await PriceHistory.deleteMany({
      timestamp: { $lt: thirtyDaysAgo }
    });
    console.log(`🗑️ Deleted ${deletedPriceHistory.deletedCount} old price records`);
    
    // Clean up old demo trades
    const deletedTrades = await Trade.deleteMany({
      isSettled: true,
      closeTime: { $lt: sevenDaysAgo },
      userId: { $in: await getDemoUserIds() }
    });
    console.log(`🗑️ Deleted ${deletedTrades.deletedCount} old demo trades`);
    
    // Clean up old transactions
    const deletedTransactions = await Transaction.deleteMany({
      createdAt: { $lt: thirtyDaysAgo },
      status: 'completed'
    });
    console.log(`🗑️ Deleted ${deletedTransactions.deletedCount} old transactions`);
    
    console.log('✅ Cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Cleanup error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

async function getDemoUserIds() {
  const User = require('../models/User');
  const demoUsers = await User.find({ accountType: 'demo' }).select('_id');
  return demoUsers.map(user => user._id);
}

if (require.main === module) {
  cleanupOldData();
}

module.exports = { cleanupOldData };
      console.error('Error loading pending trades:', error);
    }
  }

  addTrade(trade) {
    const tradeId = trade._id.toString();
    this.activeTrades.set(tradeId, trade);

    const now = Date.now();
    const expirationTime = new Date(trade.expirationTime).getTime();
    const timeUntilExpiration = expirationTime - now;

    if (timeUntilExpiration > 0) {
      const timer = setTimeout(() => {
        this.settleTrade(tradeId);
      }, timeUntilExpiration);

      this.tradeTimers.set(tradeId, timer);
      console.log(`⏰ Trade ${tradeId} expires in ${Math.round(timeUntilExpiration / 1000)}s`);
    } else {
      this.settleTrade(tradeId);
    }
  }

  async settleTrade(tradeId) {
    try {
      const trade = this.activeTrades.get(tradeId);
      if (!trade) return;

      const asset = await Asset.findOne({ symbol: trade.asset });
      if (!asset) return;

      const closePrice = asset.currentPrice;
      const openPrice = trade.openPrice;

      // Determine win/loss
      let isWin = false;
      if (trade.tradeType === 'CALL') {
        isWin = closePrice > openPrice;
      } else if (trade.tradeType === 'PUT') {
        isWin = closePrice < openPrice;
      }

      let profit = 0;
      let result = 'loss';
      
      if (isWin) {
        profit = trade.amount * trade.payout;
        result = 'win';
      } else {
        profit = -trade.amount;
        result = 'loss';
      }

      // Update trade
      const updatedTrade = await Trade.findByIdAndUpdate(
        tradeId,
        {
          closePrice,
          result,
          profit,
          closeTime: new Date(),
          isSettled: true
        },
        { new: true }
      );

      // Update user
      const user = await User.findById(trade.userId);
      if (user) {
        if (isWin) {
          user.balance += trade.amount + profit;
        }

        user.totalTrades += 1;
        user.totalProfit += profit;
        
        const userTrades = await Trade.countDocuments({ 
          userId: user._id, 
          isSettled: true 
        });
        const userWins = await Trade.countDocuments({ 
          userId: user._id, 
          result: 'win' 
        });
        
        user.winRate = userTrades > 0 ? (userWins / userTrades) * 100 : 0;
        await user.save();

        // Create transaction
        const transaction = new Transaction({
          userId: user._id,
          type: isWin ? 'trade_win' : 'trade_loss',
          amount: isWin ? profit : 0,
          status: 'completed',
          description: `${result.toUpperCase()}: ${trade.tradeType} on ${trade.asset}`,
          tradeId: trade._id,
          processedAt: new Date()
        });

        await transaction.save();

        // Emit to user
        this.io.to(`user:${user._id}`).emit('trade_settled', {
          trade: updatedTrade,
          user: {
            balance: user.balance,
            totalProfit: user.totalProfit,
            totalTrades: user.totalTrades,
            winRate: user.winRate
          }
        });
      }

      // Cleanup
      this.activeTrades.delete(tradeId);
      const timer = this.tradeTimers.get(tradeId);
      if (timer) {
        clearTimeout(timer);
        this.tradeTimers.delete(tradeId);
      }

      console.log(`✅ Trade ${tradeId}: ${result.toUpperCase()} (${isWin ? '+' : ''}${profit})`);

    } catch (error) {
      console.error(`Error settling trade ${tradeId}:`, error);
    }
  }

  getActiveTrades() {
    return Array.from(this.activeTrades.values());
  }

  cleanup() {
    for (const timer of this.tradeTimers.values()) {
      clearTimeout(timer);
    }
    this.tradeTimers.clear();
    this.activeTrades.clear();
  }
}

module.exports = TradingEngine;