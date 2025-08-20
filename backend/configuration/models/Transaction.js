const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['deposit', 'withdrawal', 'trade_win', 'trade_loss', 'bonus']
  },
  amount: { type: Number, required: true },
  status: { 
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  description: { type: String, required: true },
  tradeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trade' },
  paymentMethod: { type: String },
  createdAt: { type: Date, default: Date.now },
  processedAt: { type: Date }
});

module.exports = mongoose.model('Transaction', transactionSchema);