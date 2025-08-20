const express = require('express');
const Trade = require('../models/Trade');
const User = require('../models/User');
const Asset = require('../models/Asset');
const Transaction = require('../models/Transaction');
const { authenticateToken } = require('../middleware/auth');
const { validateTrade } = require('../middleware/validation');

const router = express.Router();

// GET /api/trades
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 50, status } = req.query;
    const query = { userId: req.user._id };
    
    if (status) query.result = status;

    const trades = await Trade.find(query)
      .sort({ openTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Trade.countDocuments(query);

    res.json({
      trades,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get trades error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/trades
router.post('/', authenticateToken, validateTrade, async (req, res) => {
  try {
    const { asset, tradeType, amount, duration } = req.body;

    const user = await User.findById(req.user._id);
    if (user.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    const assetData = await Asset.findOne({ symbol: asset });
    if (!assetData) {
      return res.status(400).json({ error: 'Asset not found' });
    }

    const trade = new Trade({
      userId: user._id,
      asset,
      tradeType,
      amount,
      duration,
      openPrice: assetData.currentPrice,
      payout: assetData.payout
    });

    await trade.save();

    // Update user balance
    user.balance -= amount;
    await user.save();

    // Create transaction
    const transaction = new Transaction({
      userId: user._id,
      type: 'trade_loss',
      amount: -amount,
      status: 'completed',
      description: `${tradeType} trade on ${asset}`,
      tradeId: trade._id
    });

    await transaction.save();

    res.json(trade);
  } catch (error) {
    console.error('Create trade error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;