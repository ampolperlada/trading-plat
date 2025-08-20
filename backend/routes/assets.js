const express = require('express');
const Asset = require('../models/Asset');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/assets
router.get('/', authenticateToken, async (req, res) => {
  try {
    const assets = await Asset.find({ isActive: true }).sort({ category: 1, symbol: 1 });
    res.json(assets);
  } catch (error) {
    console.error('Get assets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/assets/:symbol
router.get('/:symbol', authenticateToken, async (req, res) => {
  try {
    const asset = await Asset.findOne({ symbol: req.params.symbol });
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    res.json(asset);
  } catch (error) {
    console.error('Get asset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;