// routes/assets.js
const express = require('express');
const { query } = require('../config/database'); // Import the query helper
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/assets
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Fetch active assets from MySQL
    const assets = await query(`
      SELECT symbol, name, category, current_price, price_change_percent, payout, is_active 
      FROM assets 
      WHERE is_active = TRUE 
      ORDER BY category ASC, symbol ASC
    `);
    res.json(assets);
  } catch (error) {
    console.error('Get assets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/assets/:symbol
router.get('/:symbol', authenticateToken, async (req, res) => {
  try {
    const symbol = req.params.symbol;
    // Fetch specific asset from MySQL
    const assets = await query(`
      SELECT symbol, name, category, current_price, price_change_percent, payout, is_active 
      FROM assets 
      WHERE symbol = ?
    `, [symbol]);
    
    if (assets.length === 0) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    res.json(assets[0]);
  } catch (error) {
    console.error('Get asset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;