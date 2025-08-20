
// services/PriceHistory.js
const mongoose = require('mongoose');

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

module.exports = mongoose.model('PriceHistory', priceHistorySchema);
