const mongoose = require('mongoose');

const TradeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  asset: { type: String, required: true },
  tradeType: { type: String, enum: ['CALL', 'PUT'], required: true },
  amount: { type: Number, required: true },
  duration: { type: Number, required: true }, // in minutes
  openPrice: { type: Number, required: true },
  openTime: { type: Date, default: Date.now },
  closePrice: { type: Number },
  closeTime: { type: Date },
  result: { type: String, enum: ['pending', 'win', 'loss'] },
  profit: { type: Number },
  status: { type: String, enum: ['open', 'closed'], default: 'open' }
});

module.exports = mongoose.model('Trade', TradeSchema);