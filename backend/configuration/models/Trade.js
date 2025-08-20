const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  asset: { 
    type: String, 
    required: true,
    enum: ['EURUSD', 'GBPUSD', 'USDJPY', 'BTCUSD', 'ETHUSD', 'AAPL', 'TSLA', 'GOOGL', 'GOLD', 'OIL']
  },
  tradeType: { type: String, required: true, enum: ['CALL', 'PUT'] },
  amount: { type: Number, required: true, min: 1 },
  duration: { type: Number, required: true, enum: [60, 300, 900, 1800, 3600] },
  openPrice: { type: Number, required: true },
  closePrice: { type: Number, default: null },
  payout: { type: Number, default: 0.8 },
  result: { type: String, enum: ['pending', 'win', 'loss'], default: 'pending' },
  profit: { type: Number, default: 0 },
  openTime: { type: Date, default: Date.now },
  closeTime: { type: Date, default: null },
  expirationTime: { type: Date, required: true },
  isSettled: { type: Boolean, default: false }
});

tradeSchema.pre('save', function(next) {
  if (this.isNew) {
    this.expirationTime = new Date(this.openTime.getTime() + (this.duration * 1000));
  }
  next();
});

module.exports = mongoose.model('Trade', tradeSchema);