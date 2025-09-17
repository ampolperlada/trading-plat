const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const TradeService = require('../services/TradeService');
const TradingEngine = require('../services/TradingEngine');

router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { asset, tradeType, amount, duration } = req.body;

    if (!['CALL', 'PUT'].includes(tradeType)) {
      return res.status(400).json({ error: 'Invalid trade type' });
    }

    if (amount <= 0 || !duration) {
      return res.status(400).json({ error: 'Invalid trade parameters' });
    }

    const trade = await TradeService.createTrade({
      userId: req.user.id,
      asset,
      tradeType,
      amount,
      duration
    });

    // Start trade timer
    TradingEngine.startTradeTimer(trade);

    res.status(201).json(trade);
  } catch (error) {
    console.error('Trade creation error:', error);
    res.status(500).json({ error: 'Failed to create trade' });
  }
});

router.get('/active', authenticateToken, async (req, res) => {
  try {
    const trades = await TradeService.getActiveTrades(req.user.id);
    res.json(trades);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch active trades' });
  }
});

router.get('/history', authenticateToken, async (req, res) => {
  try {
    const trades = await TradeService.getUserTrades(req.user.id);
    res.json(trades);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trade history' });
  }
});

module.exports = router;