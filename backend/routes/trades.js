// routes/trades.js
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth'); // Adjust path as needed
const Trade = require('../models/Trade'); // Adjust path as needed
// We need to access the tradingEngine instance from server.js
// A common way is to attach it to the app object or use a singleton/service locator
// For simplicity here, assuming you have access to it somehow (e.g., global, or passed in)
// Let's assume it's attached to the app object in server.js: app.locals.tradingEngine = tradingEngine;

router.post('/place', authenticateToken, async (req, res) => {
  try {
    const { asset, direction, amount, expiryTimeSeconds } = req.body; // Expecting seconds
    const userId = req.user.id; // Assuming JWT payload has user ID

    // --- Basic Validation ---
    if (!asset || !direction || !amount || !expiryTimeSeconds) {
        return res.status(400).json({ error: 'Missing required fields: asset, direction, amount, expiryTimeSeconds' });
    }
    if (!['CALL', 'PUT'].includes(direction)) {
        return res.status(400).json({ error: 'Invalid direction. Must be CALL or PUT.' });
    }
    if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount.' });
    }
    if (isNaN(expiryTimeSeconds) || expiryTimeSeconds <= 0) {
        return res.status(400).json({ error: 'Invalid expiry time.' });
    }
    // --- End Validation ---

    // --- Get User Balance (if using User model) ---
    // const User = require('../models/User');
    // const user = await User.findById(userId);
    // if (!user) {
    //     return res.status(404).json({ error: 'User not found.' });
    // }
    // if (user.balance < amount) {
    //     return res.status(400).json({ error: 'Insufficient balance.' });
    // }
    // --- End User Balance ---

    // --- Get Entry Price (from Market Data Service or Asset model) ---
    // const marketDataService = require('../services/MarketDataService');
    // const priceData = await marketDataService.getPrice(asset);
    // const entryPrice = priceData.price;
    // For now, simulate or use a default
    const entryPrice = Math.random() * 100 + 50; // Placeholder
    // --- End Entry Price ---

    // --- Create Trade Document ---
    const expiryTime = new Date(Date.now() + (expiryTimeSeconds * 1000));
    const newTrade = new Trade({
        userId,
        asset,
        direction,
        amount,
        entryPrice,
        expiryTime,
        status: 'open',
        result: 'pending'
        // closePrice, closeTime, profit will be set later by TradingEngine
    });

    const savedTrade = await newTrade.save();
    console.log(`🆕 Trade saved to DB: ${savedTrade._id}`);
    // --- End Create Trade ---

    // --- Deduct Balance (if using User model) ---
    // user.balance -= amount;
    // await user.save();
    // --- End Deduct Balance ---

    // --- Notify Trading Engine ---
    // Access tradingEngine (assuming it's attached to app.locals)
    const tradingEngine = req.app.locals.tradingEngine;
    if (tradingEngine) {
        tradingEngine.handleNewTrade(savedTrade);
    } else {
        console.error("🚨 TradingEngine not found in app.locals!");
        // Depending on your setup, you might want to handle this differently
        // e.g., return an error or rely on the periodic check/loadPendingTrades
    }
    // --- End Notify Engine ---

    // --- Respond to Client ---
    res.status(201).json({
        success: true,
        message: 'Trade placed successfully',
        trade: savedTrade
    });
    // --- End Respond ---

  } catch (error) {
    console.error('Error placing trade:', error);
    res.status(500).json({ error: 'Internal server error while placing trade.' });
  }
});

// Add other trade routes (history, etc.) as needed
router.get('/history', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        // Fetch last N trades, or implement pagination
        const trades = await Trade.find({ userId }).sort({ createdAt: -1 }).limit(50);
        res.json(trades);
    } catch (error) {
        console.error('Error fetching trade history:', error);
        res.status(500).json({ error: 'Failed to fetch trade history.' });
    }
});

module.exports = router;