// backend/server.js - Simple version to start
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Demo user
const demoUser = {
  id: 1,
  email: 'demo@trading.com',
  password: 'demo123', // In production, this should be hashed
  name: 'Demo User',
  balance: 10000,
  accountType: 'demo'
};

// JWT Secret
const JWT_SECRET = 'your-super-secret-key-change-in-production';

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Expert Option Backend is running'
  });
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Simple demo login
    if (email === demoUser.email && password === demoUser.password) {
      const token = jwt.sign(
        { userId: demoUser.id, email: demoUser.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: demoUser.id,
          email: demoUser.email,
          name: demoUser.name,
          balance: demoUser.balance,
          accountType: demoUser.accountType
        }
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/market/data', (req, res) => {
  // Mock market data
  const mockData = {
    'EURUSD': { price: 1.08501, change: -0.07, name: 'EUR/USD' },
    'GBPUSD': { price: 1.24890, change: 0.02, name: 'GBP/USD' },
    'USDJPY': { price: 150.344, change: -0.02, name: 'USD/JPY' },
    'BTCUSD': { price: 65980.65, change: -0.18, name: 'Bitcoin/USD' },
    'ETHUSD': { price: 3110.34, change: -0.64, name: 'Ethereum/USD' },
    'AAPL': { price: 156.02, change: -0.87, name: 'Apple Inc' },
    'TSLA': { price: 251.23, change: 0.02, name: 'Tesla Inc' },
    'GOOGL': { price: 143.52, change: 0.15, name: 'Alphabet Inc' },
    'GOLD': { price: 2027.40, change: -0.01, name: 'Gold' },
    'OIL': { price: 85.24, change: 0.01, name: 'Oil' }
  };

  res.json({
    data: mockData,
    source: 'Mock Data',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Expert Option Backend running on port ${PORT}`);
  console.log(`🔐 Demo login: demo@trading.com / demo123`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
});