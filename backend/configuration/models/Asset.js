const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['forex', 'crypto', 'stocks', 'commodities', 'indices']
  },
  currentPrice: { type: Number, required: true },
  priceChange: { type: Number, default: 0 },
  priceChangePercent: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  minTradeAmount: { type: Number, default: 1 },
  maxTradeAmount: { type: Number, default: 5000 },
  payout: { type: Number, default: 0.8 },
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Asset', assetSchema);