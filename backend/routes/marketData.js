const express = require('express');
const router = express.Router();
const marketDataService = require('../services/MarketDataService');

// Get all market data
router.get('/', async (req, res) => {
  try {
    const data = await marketDataService.fetchMarketData();
    res.json(data);
  } catch (error) {
    console.error('Market data API error:', error);
    res.status(500).json({ error: 'Failed to fetch market data' });
  }
});

// Get specific asset price
router.get('/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const priceData = await marketDataService.getPrice(symbol);
    if (!priceData.price) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    res.json({ symbol, ...priceData });
  } catch (error) {
    console.error('Asset price API error:', error);
    res.status(500).json({ error: 'Failed to fetch asset price' });
  }
});

module.exports = router;