// routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { query } = require('../config/database'); // Import the query helper
const bcrypt = require('bcryptjs'); // Import bcrypt for password hashing/verification
const { validateLogin, validateRegister } = require('../middleware/validation');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { error: 'Too many authentication attempts' }
});

// POST /api/auth/login
router.post('/login', authLimiter, validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const users = await query('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    // Compare provided password with the hashed password from DB
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login time
    await query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    const token = jwt.sign(
      { userId: user.id.toString(), email: user.email }, // Use MySQL 'id'
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id, // Use MySQL 'id'
        email: user.email,
        firstName: user.first_name, // Use MySQL column name
        lastName: user.last_name,   // Use MySQL column name
        balance: user.balance,      // Use MySQL column name
        accountType: user.account_type, // Use MySQL column name
        totalProfit: user.total_profit, // Use MySQL column name
        totalTrades: user.total_trades, // Use MySQL column name
        winRate: user.win_rate        // Use MySQL column name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/register
router.post('/register', authLimiter, validateRegister, async (req, res) => {
  try {
    const { email, password, firstName, lastName, country } = req.body;

    // Check if user already exists
    const existingUsers = await query('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert new user into MySQL
    const result = await query(`
      INSERT INTO users (email, password, first_name, last_name, country) 
      VALUES (?, ?, ?, ?, ?)
    `, [email.toLowerCase(), hashedPassword, firstName, lastName, country]);

    // Fetch the newly created user (excluding password)
    const newUserRows = await query('SELECT id, email, first_name, last_name, balance, account_type FROM users WHERE id = ?', [result.insertId]);

    if (newUserRows.length === 0) {
        return res.status(500).json({ error: 'Failed to create user' });
    }

    const newUser = newUserRows[0];
    const token = jwt.sign(
      { userId: newUser.id.toString(), email: newUser.email }, // Use MySQL 'id'
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser.id, // Use MySQL 'id'
        email: newUser.email,
        firstName: newUser.first_name, // Use MySQL column name
        lastName: newUser.last_name,   // Use MySQL column name
        balance: newUser.balance,      // Use MySQL column name
        accountType: newUser.account_type // Use MySQL column name
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;