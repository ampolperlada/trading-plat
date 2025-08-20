// scripts/cleanup.js
require('dotenv').config();
const mongoose = require('mongoose');

const Trade = require('../models/Trade');
const Transaction = require('../models/Transaction');

// Create PriceHistory model here since it was missing
const priceHistorySchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  timestamp: { type: Date, required: true },
  open: { type: Number, required: true },
  high: { type: Number, required: true },
  low: { type: Number, required: true },
  close: { type: Number, required: true },
  volume: { type: Number, default: 0 }
});

priceHistorySchema.index({ symbol: 1, timestamp: -1 });
const PriceHistory = mongoose.model('PriceHistory', priceHistorySchema);

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