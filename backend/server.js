// backend/server.js - Updated with Free Market Data APIs
require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Import our free market data services
const FreeMarketDataService = require('./services/freeMarketDataService');
const YahooFinanceService = require('./services/yahooFinanceService');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Initialize market data services
const freeMarketService = new FreeMarketDataService();
const yahooService = new YahooFinanceService();
let marketData = {};
let activeService = null;

// In-memory storage (replace with database in production)
const users = new Map();
const trades = new Map();

// Demo user
users.set('demo@trading.com', {
  id: 1,
  email: 'demo@trading.com',
  password: '$2b$10$dummy.hash.for.demo123',
  name: 'Demo User',
  balance: 10000,
  accountType: 'demo'
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    marketDataAvailable: Object.keys(marketData).length > 0,
    activeDataSource: activeService?.constructor.name || 'Mock Data'
  });
});

// Authentication
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = users.get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // For demo user, allow simple password check
    const isValidPassword = email === 'demo@trading.com' && password === 'demo123';
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        balance: user.balance,
        accountType: user.accountType
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (users.has(email)) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = Date.now();
    
    const newUser = {
      id: userId,
      email,
      password: hashedPassword,
      name: name || 'New Trader',
      balance: 10000, // Demo balance
      accountType: 'demo'
    };

    users.set(email, newUser);

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        balance: newUser.balance,
        accountType: newUser.accountType
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Market data endpoints
app.get('/api/market/data', (req, res) => {
  res.json({
    data: marketData,
    source: activeService?.constructor.name || 'Mock Data',
    timestamp: new Date().toISOString(),
    count: Object.keys(marketData).length
  });
});

app.get('/api/market/data/:symbol', (req, res) => {
  const { symbol } = req.params;
  const data = marketData[symbol];
  
  if (!data) {
    return res.status(404).json({ error: 'Symbol not found' });
  }
  
  res.json({
    symbol: symbol,
    data: data,
    source: activeService?.constructor.name || 'Mock Data'
  });
});

app.get('/api/market/history/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { interval = '1m', count = 100 } = req.query;
    
    let historicalData = [];
    
    // Try to get historical data from active service
    if (activeService && activeService.getHistoricalData) {
      historicalData = await activeService.getHistoricalData(symbol, interval, parseInt(count));
    } else if (yahooService && yahooService.getHistoricalData) {
      historicalData = await yahooService.getHistoricalData(symbol, interval, '1d');
    }
    
    // If no historical data, generate mock data
    if (!historicalData || historicalData.length === 0) {
      historicalData = generateMockHistoricalData(symbol, parseInt(count));
    }
    
    res.json(historicalData);
    
  } catch (error) {
    console.error('Error fetching historical data:', error);
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
});

// Trading endpoints
app.post('/api/trades/execute', authenticateToken, (req, res) => {
  try {
    const { symbol, direction, amount, duration = 60 } = req.body;
    const userId = req.user.userId;
    
    // Validation
    if (!symbol || !direction || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['CALL', 'PUT'].includes(direction)) {
      return res.status(400).json({ error: 'Invalid direction. Must be CALL or PUT' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' });
    }
    
    // Get user
    const userEmail = Array.from(users.entries()).find(([email, user]) => user.id === userId)?.[0];
    const user = users.get(userEmail);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check balance
    if (user.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Get current price
    const currentPrice = marketData[symbol]?.price;
    if (!currentPrice) {
      return res.status(400).json({ error: 'Invalid symbol or price not available' });
    }

    // Create trade
    const tradeId = Date.now().toString();
    const trade = {
      id: tradeId,
      userId: userId,
      symbol: symbol,
      direction: direction,
      amount: amount,
      openPrice: currentPrice,
      openTime: Date.now(),
      duration: duration * 1000, // Convert to milliseconds
      status: 'active',
      payout: 0.8 // 80% payout
    };

    trades.set(tradeId, trade);
    
    // Deduct from balance
    user.balance -= amount;
    users.set(userEmail, user);

    // Schedule trade settlement
    setTimeout(() => {
      settleTrade(tradeId);
    }, trade.duration);

    res.json({
      trade: {
        id: trade.id,
        symbol: trade.symbol,
        direction: trade.direction,
        amount: trade.amount,
        openPrice: trade.openPrice,
        duration: duration,
        status: trade.status,
        timeLeft: trade.duration
      },
      newBalance: user.balance
    });

  } catch (error) {
    console.error('Trade execution error:', error);
    res.status(500).json({ error: 'Failed to execute trade' });
  }
});

app.get('/api/trades/active', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;
    const activeTrades = Array.from(trades.values())
      .filter(trade => trade.userId === userId && trade.status === 'active')
      .map(trade => ({
        id: trade.id,
        symbol: trade.symbol,
        direction: trade.direction,
        amount: trade.amount,
        openPrice: trade.openPrice,
        openTime: trade.openTime,
        duration: trade.duration,
        timeLeft: Math.max(0, trade.openTime + trade.duration - Date.now())
      }));

    res.json(activeTrades);
  } catch (error) {
    console.error('Error fetching active trades:', error);
    res.status(500).json({ error: 'Failed to fetch active trades' });
  }
});

// User balance endpoint
app.get('/api/user/balance', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;
    const userEmail = Array.from(users.entries()).find(([email, user]) => user.id === userId)?.[0];
    const user = users.get(userEmail);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ balance: user.balance });
  } catch (error) {
    console.error('Error fetching balance:', error);
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

// Trade settlement function
function settleTrade(tradeId) {
  const trade = trades.get(tradeId);
  if (!trade || trade.status !== 'active') return;

  const currentPrice = marketData[trade.symbol]?.price;
  if (!currentPrice) {
    console.error(`❌ No current price for ${trade.symbol}, cannot settle trade`);
    return;
  }

  // Determine win/loss
  const isWin = (trade.direction === 'CALL' && currentPrice > trade.openPrice) ||
               (trade.direction === 'PUT' && currentPrice < trade.openPrice);

  trade.status = 'closed';
  trade.closePrice = currentPrice;
  trade.closeTime = Date.now();
  trade.result = isWin ? 'win' : 'loss';
  trade.profit = isWin ? trade.amount * trade.payout : -trade.amount;

  if (isWin) {
    // Find user and update balance
    const userEmail = Array.from(users.entries()).find(([email, user]) => user.id === trade.userId)?.[0];
    const user = users.get(userEmail);
    if (user) {
      user.balance += trade.amount + (trade.amount * trade.payout);
      users.set(userEmail, user);
    }
  }

  trades.set(tradeId, trade);

  console.log(`💰 Trade ${tradeId} settled: ${trade.result.toUpperCase()} - Profit: ${trade.profit}`);

  // Emit trade result to user
  io.to(`user_${trade.userId}`).emit('tradeSettled', {
    trade: {
      id: trade.id,
      symbol: trade.symbol,
      direction: trade.direction,
      amount: trade.amount,
      result: trade.result,
      profit: trade.profit,
      openPrice: trade.openPrice,
      closePrice: trade.closePrice
    }
  });
}

// Generate mock historical data
function generateMockHistoricalData(symbol, count) {
  const data = [];
  const currentData = marketData[symbol];
  const basePrice = currentData?.price || 100;
  let currentPrice = basePrice;

  for (let i = count; i >= 0; i--) {
    const timestamp = Date.now() - (i * 60000); // 1 minute intervals
    const open = currentPrice;
    const change = (Math.random() - 0.5) * 0.01;
    const close = open + (open * change);
    const high = Math.max(open, close) + (Math.random() * 0.005);
    const low = Math.min(open, close) - (Math.random() * 0.005);

    data.push({
      timestamp,
      open: parseFloat(open.toFixed(5)),
      high: parseFloat(high.toFixed(5)),
      low: parseFloat(low.toFixed(5)),
      close: parseFloat(close.toFixed(5)),
      volume: Math.floor(Math.random() * 10000)
    });

    currentPrice = close;
  }

  return data;
}

// WebSocket connections
io.on('connection', (socket) => {
  console.log('👤 Client connected:', socket.id);

  // Join user room for personalized updates
  socket.on('join', (data) => {
    if (data.userId) {
      socket.join(`user_${data.userId}`);
      console.log(`👤 User ${data.userId} joined room`);
    }
  });

  // Subscribe to market data
  socket.on('subscribeMarket', (symbols) => {
    console.log('📊 Client subscribed to:', symbols);
    
    symbols.forEach(symbol => {
      socket.join(`market_${symbol}`);
      
      // Send current data immediately
      if (marketData[symbol]) {
        socket.emit('marketUpdate', {
          symbol: symbol,
          data: marketData[symbol]
        });
      }
    });
  });

  socket.on('disconnect', () => {
    console.log('👤 Client disconnected:', socket.id);
  });
});

// Initialize market data services
async function initializeMarketData() {
  console.log('🚀 Initializing market data services...');
  
  try {
    // Try free market data service first
    console.log('📡 Attempting to start Free Market Data Service...');
    marketData = await freeMarketService.start();
    activeService = freeMarketService;
    
    // Subscribe to real-time updates
    Object.keys(marketData).forEach(symbol => {
      freeMarketService.subscribe(symbol, (data) => {
        marketData[symbol] = data;
        
        // Broadcast to all subscribers
        io.to(`market_${symbol}`).emit('marketUpdate', {
          symbol: symbol,
          data: data
        });
      });
    });
    
    console.log('✅ Free Market Data Service initialized successfully');
    
  } catch (error) {
    console.error('❌ Free Market Data Service failed, trying Yahoo Finance...');
    
    try {
      marketData = await yahooService.start();
      activeService = yahooService;
      console.log('✅ Yahoo Finance Service initialized successfully');
      
    } catch (yahooError) {
      console.error('❌ Yahoo Finance Service failed, using mock data...');
      activeService = null;
      startMockDataUpdates();
    }
  }
}

// Mock market data updater (fallback)
function startMockDataUpdates() {
  const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'BTCUSD', 'ETHUSD', 'AAPL', 'TSLA', 'GOOGL', 'GOLD', 'OIL'];
  
  // Initialize mock data
  symbols.forEach(symbol => {
    marketData[symbol] = generateMockPrice(symbol);
  });
  
  // Update mock data every 2 seconds
  setInterval(() => {
    symbols.forEach(symbol => {
      const currentData = marketData[symbol];
      const change = (Math.random() - 0.5) * 0.1;
      const newPrice = currentData.price * (1 + change / 100);
      
      marketData[symbol] = {
        ...currentData,
        price: parseFloat(newPrice.toFixed(5)),
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(change.toFixed(2)),
        timestamp: Date.now(),
        source: 'mock'
      };
      
      // Broadcast update
      io.to(`market_${symbol}`).emit('marketUpdate', {
        symbol: symbol,
        data: marketData[symbol]
      });
    });
  }, 2000);
  
  console.log('🔄 Mock data updates started');
}

function generateMockPrice(symbol) {
  const basePrices = {
    'EURUSD': 1.08501,
    'GBPUSD': 1.24890,
    'USDJPY': 150.344,
    'BTCUSD': 65980.65,
    'ETHUSD': 3110.34,
    'AAPL': 156.02,
    'TSLA': 251.23,
    'GOOGL': 143.52,
    'GOLD': 2027.40,
    'OIL': 85.24
  };

  const basePrice = basePrices[symbol] || 100;
  const change = (Math.random() - 0.5) * 2;
  const price = basePrice + (basePrice * change / 100);

  return {
    symbol: symbol,
    name: symbol,
    price: parseFloat(price.toFixed(5)),
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat(change.toFixed(2)),
    timestamp: Date.now(),
    source: 'mock'
  };
}

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, async () => {
  console.log(`🚀 Expert Option Backend running on port ${PORT}`);
  console.log(`📊 WebSocket server ready for real-time data`);
  console.log(`🔐 Demo login: demo@trading.com / demo123`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  
  // Initialize market data
  await initializeMarketData();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Shutting down gracefully...');
  if (activeService && activeService.stop) {
    activeService.stop();
  }
  server.close(() => {
    console.log('✅ Server shut down successfully');
    process.exit(0);
  });
});