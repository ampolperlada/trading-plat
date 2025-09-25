// routes/trades.js
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth'); // Adjust path as needed
const { query } = require('../config/database'); // Import the query helper

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

    // --- Get User Balance ---
    const users = await query('SELECT balance FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
        return res.status(404).json({ error: 'User not found.' });
    }
    const user = users[0];
    if (user.balance < amount) {
        return res.status(400).json({ error: 'Insufficient balance.' });
    }
    // --- End User Balance ---

    // --- Get Entry Price (from Market Data Service or Asset model) ---
    // For now, simulate or fetch from your asset table
    const assets = await query('SELECT current_price FROM assets WHERE symbol = ?', [asset]);
    if (assets.length === 0) {
        return res.status(404).json({ error: 'Asset not found.' });
    }
    const entryPrice = assets[0].current_price;
    // --- End Entry Price ---

    // --- Create Trade Record in MySQL ---
    // Calculate expiration time based on current time and duration
    const expirationTime = new Date(Date.now() + (expiryTimeSeconds * 1000));
    const result = await query(`
      INSERT INTO trades (user_id, asset, trade_type, amount, duration, open_price, expiration_time, status, result) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [userId, asset, direction, amount, expiryTimeSeconds, entryPrice, expirationTime, 'open', 'pending']);

    const newTradeId = result.insertId;
    console.log(`🆕 Trade saved to DB with ID: ${newTradeId}`);

    // --- Deduct Balance ---
    await query('UPDATE users SET balance = balance - ? WHERE id = ?', [amount, userId]);

    // --- Notify Trading Engine ---
    // Access tradingEngine (assuming it's attached to app.locals)
    const tradingEngine = req.app.locals.tradingEngine;
    if (tradingEngine) {
        // Fetch the trade record to pass to the engine
        const tradeRecords = await query('SELECT * FROM trades WHERE id = ?', [newTradeId]);
        if (tradeRecords.length > 0) {
            tradingEngine.handleNewTrade(tradeRecords[0]);
        } else {
            console.error(`🚨 Could not fetch newly created trade ${newTradeId} for engine.`);
        }
    } else {
        console.error("🚨 TradingEngine not found in app.locals!");
    }
    // --- End Notify Engine ---

    // --- Respond to Client ---
    res.status(201).json({
        success: true,
        message: 'Trade placed successfully',
        trade: {
            id: newTradeId, // Return the MySQL ID
            userId,
            asset,
            trade_type: direction, // Or direction
            amount,
            open_price: entryPrice, // Or entryPrice
            duration: expiryTimeSeconds, // Or selectedTime
            status: 'open',
            expiration_time: expirationTime
        }
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
        // Fetch last N trades for the user, or implement pagination
        const trades = await query(`
          SELECT * FROM trades 
          WHERE user_id = ? 
          ORDER BY open_time DESC 
          LIMIT 50
        `, [userId]);
        res.json(trades);
    } catch (error) {
        console.error('Error fetching trade history:', error);
        res.status(500).json({ error: 'Failed to fetch trade history.' });
    }
});

module.exports = router;