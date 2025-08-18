// backend/server.js - Simplified Trading Platform Server (No Database Required)
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const winston = require('winston');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console()
  ]
});

// In-Memory Data Storage (replaces database)
const inMemoryUsers = [
  {
    id: '1',
    email: 'demo@trading.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeAGxc9D8mREYbKK.', // demo123
    firstName: 'Demo',
    lastName: 'Trader',
    balance: 10000,
    createdAt: new Date(),
    lastLogin: null
  }
];

const inMemoryTrades = [];
let tradeIdCounter = 1;

const inMemoryAssets = [
  { symbol: 'EURUSD', name: 'EUR/USD', category: 'forex', currentPrice: 1.0850, changePercent24h: 0.12, isActive: true },
  { symbol: 'GBPUSD', name: 'GBP/USD', category: 'forex', currentPrice: 1.2650, changePercent24h: -0.34, isActive: true },
  { symbol: 'USDJPY', name: 'USD/JPY', category: 'forex', currentPrice: 150.25, changePercent24h: 0.89, isActive: true },
  { symbol: 'USDCHF', name: 'USD/CHF', category: 'forex', currentPrice: 0.8950, changePercent24h: 0.45, isActive: true },
  { symbol: 'BTCUSD', name: 'Bitcoin/USD', category: 'crypto', currentPrice: 65000, changePercent24h: 2.45, isActive: true },
  { symbol: 'ETHUSD', name: 'Ethereum/USD', category: 'crypto', currentPrice: 3200, changePercent24h: 1.89, isActive: true },
  { symbol: 'BNBUSD', name: 'Binance Coin/USD', category: 'crypto', currentPrice: 245, changePercent24h: 3.21, isActive: true },
  { symbol: 'AAPL', name: 'Apple Inc.', category: 'stocks', currentPrice: 195.50, changePercent24h: 0.67, isActive: true },
  { symbol: 'TSLA', name: 'Tesla Inc.', category: 'stocks', currentPrice: 250.75, changePercent24h: -1.23, isActive: true },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', category: 'stocks', currentPrice: 142.80, changePercent24h: 0.98, isActive: true },
  { symbol: 'MSFT', name: 'Microsoft Corp.', category: 'stocks', currentPrice: 378.90, changePercent24h: 1.45, isActive: true },
  { symbol: 'GOLD', name: 'Gold', category: 'commodities', currentPrice: 2020.50, changePercent24h: 0.45, isActive: true },
  { symbol: 'SILVER', name: 'Silver', category: 'commodities', currentPrice: 24.85, changePercent24h: -0.67, isActive: true },
  { symbol: 'OIL', name: 'Crude Oil', category: 'commodities', currentPrice: 85.25, changePercent24h: -0.78, isActive: true }
];

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Market Data Service (In-Memory)
class MarketDataService {
  constructor() {
    this.priceHistory = new Map();
    this.startPriceSimulation();
  }

  startPriceSimulation() {
    // Update prices every second
    setInterval(() => {
      this.updatePrices();
    }, 1000);
  }

  updatePrices() {
    try {
      inMemoryAssets.forEach(asset => {
        const volatility = this.getVolatility(asset.category);
        const change = (Math.random() - 0.5) * volatility;
        const newPrice = Math.max(0.0001, asset.currentPrice * (1 + change));
        
        // Store price history for charts
        if (!this.priceHistory.has(asset.symbol)) {
          this.priceHistory.set(asset.symbol, []);
        }
        
        const priceData = {
          price: newPrice,
          timestamp: Date.now(),
          change: change * 100,
          volume: Math.random() * 1000000
        };
        
        const history = this.priceHistory.get(asset.symbol);
        history.push(priceData);
        
        // Keep only last 100 points
        if (history.length > 100) {
          history.shift();
        }
        
        // Update asset
        asset.currentPrice = newPrice;
        asset.changePercent24h = change * 100;
        
        // Broadcast to all connected clients
        io.emit('priceUpdate', {
          symbol: asset.symbol,
          price: newPrice,
          change: change * newPrice,
          changePercent: change * 100,
          volume: priceData.volume,
          timestamp: Date.now()
        });
      });
    } catch (error) {
      logger.error('Price update error:', error);
    }
  }

  getVolatility(category) {
    const volatilities = {
      forex: 0.0005,
      crypto: 0.015,
      stocks: 0.003,
      commodities: 0.002
    };
    return volatilities[category] || 0.001;
  }

  getCurrentPrice(symbol) {
    const asset = inMemoryAssets.find(a => a.symbol === symbol);
    return asset ? {
      price: asset.currentPrice,
      change: 0,
      changePercent: asset.changePercent24h,
      volume: Math.random() * 1000000
    } : null;
  }

  getPriceHistory(symbol) {
    const history = this.priceHistory.get(symbol) || [];
    return history.slice(-50).map(point => ({
      time: point.timestamp,
      open: point.price,
      high: point.price * (1 + Math.random() * 0.001),
      low: point.price * (1 - Math.random() * 0.001),
      close: point.price,
      volume: point.volume
    }));
  }
}

// Trading Engine (In-Memory)
class TradingEngine {
  constructor() {
    this.activeTrades = new Map();
    this.startTradeMonitoring();
  }

  startTradeMonitoring() {
    setInterval(() => {
      this.checkExpiredTrades();
    }, 1000);
  }

  createTrade(userId, tradeData) {
    try {
      const { asset, type, amount, duration } = tradeData;
      
      // Find user
      const user = inMemoryUsers.find(u => u.id === userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      if (user.balance < amount) {
        throw new Error('Insufficient balance');
      }

      // Get current price
      const marketData = marketDataService.getCurrentPrice(asset);
      if (!marketData) {
        throw new Error('Asset not available');
      }

      // Create trade
      const trade = {
        _id: (tradeIdCounter++).toString(),
        userId,
        asset,
        type,
        amount,
        entryPrice: marketData.price,
        exitPrice: null,
        duration,
        status: 'PENDING',
        profit: 0,
        payout: 0.8,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + duration * 1000)
      };

      inMemoryTrades.push(trade);

      // Deduct amount from user balance
      user.balance -= amount;

      // Add to active monitoring
      this.activeTrades.set(trade._id, trade);

      // Notify user
      io.to(`user_${userId}`).emit('tradeCreated', {
        tradeId: trade._id,
        asset: trade.asset,
        type: trade.type,
        amount: trade.amount,
        entryPrice: trade.entryPrice,
        expiresAt: trade.expiresAt
      });

      logger.info(`Trade created: ${trade._id} for user ${userId}`);
      return trade;
    } catch (error) {
      logger.error('Create trade error:', error);
      throw error;
    }
  }

  checkExpiredTrades() {
    try {
      const now = new Date();
      const expiredTrades = inMemoryTrades.filter(trade => 
        trade.status === 'PENDING' && new Date(trade.expiresAt) <= now
      );

      expiredTrades.forEach(trade => {
        this.settleTrade(trade);
      });
    } catch (error) {
      logger.error('Check expired trades error:', error);
    }
  }

  settleTrade(trade) {
    try {
      const marketData = marketDataService.getCurrentPrice(trade.asset);
      if (!marketData) {
        logger.error(`Cannot settle trade ${trade._id}: No market data for ${trade.asset}`);
        return;
      }

      const exitPrice = marketData.price;
      let isWin = false;

      // Determine if trade won
      if (trade.type === 'CALL') {
        isWin = exitPrice > trade.entryPrice;
      } else { // PUT
        isWin = exitPrice < trade.entryPrice;
      }

      const profit = isWin ? trade.amount * trade.payout : 0;
      const status = isWin ? 'WON' : 'LOST';

      // Update trade
      trade.exitPrice = exitPrice;
      trade.status = status;
      trade.profit = profit;

      // Update user balance if won
      if (isWin) {
        const user = inMemoryUsers.find(u => u.id === trade.userId);
        if (user) {
          user.balance += trade.amount + profit;
        }
      }

      // Remove from active monitoring
      this.activeTrades.delete(trade._id);

      // Get updated user balance
      const user = inMemoryUsers.find(u => u.id === trade.userId);

      // Notify user via WebSocket
      io.to(`user_${trade.userId}`).emit('tradeSettled', {
        tradeId: trade._id,
        asset: trade.asset,
        type: trade.type,
        amount: trade.amount,
        entryPrice: trade.entryPrice,
        exitPrice,
        status,
        profit,
        newBalance: user ? user.balance : 0
      });

      logger.info(`Trade settled: ${trade._id} - ${status} - Profit: ${profit}`);
    } catch (error) {
      logger.error(`Error settling trade ${trade._id}:`, error);
    }
  }
}

// Initialize services
const marketDataService = new MarketDataService();
const tradingEngine = new TradingEngine();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date(),
    uptime: process.uptime(),
    version: '1.0.0',
    mode: 'in-memory'
  });
});

// Authentication Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user exists
    const existingUser = inMemoryUsers.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user
    const newUser = {
      id: (Date.now()).toString(),
      email,
      password: await bcrypt.hash(password, 10),
      firstName,
      lastName,
      balance: 10000,
      createdAt: new Date(),
      lastLogin: null
    };

    inMemoryUsers.push(newUser);

    // Generate JWT
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        balance: newUser.balance
      }
    });

    logger.info(`User registered: ${email}`);
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = inMemoryUsers.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password - special case for demo account
    let isValidPassword = false;
    if (email === 'demo@trading.com' && password === 'demo123') {
      isValidPassword = true;
    } else {
      isValidPassword = await bcrypt.compare(password, user.password);
    }

    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        balance: user.balance
      }
    });

    logger.info(`User logged in: ${email}`);
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// User Routes
app.get('/api/user/profile', authenticateToken, (req, res) => {
  try {
    const user = inMemoryUsers.find(u => u.id === req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Asset Routes
app.get('/api/assets', (req, res) => {
  try {
    res.json(inMemoryAssets.filter(asset => asset.isActive));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});

app.get('/api/assets/:symbol/history', (req, res) => {
  try {
    const { symbol } = req.params;
    const history = marketDataService.getPriceHistory(symbol);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch price history' });
  }
});

// Trading Routes
app.post('/api/trades', authenticateToken, (req, res) => {
  try {
    const trade = tradingEngine.createTrade(req.user.userId, req.body);
    res.status(201).json(trade);
  } catch (error) {
    logger.error('Trade creation error:', error);
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/trades/history', authenticateToken, (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const userTrades = inMemoryTrades.filter(trade => trade.userId === req.user.userId);
    const sortedTrades = userTrades.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const paginatedTrades = sortedTrades.slice(skip, skip + limit);

    res.json({
      trades: paginatedTrades,
      pagination: {
        current: page,
        pages: Math.ceil(userTrades.length / limit),
        total: userTrades.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trade history' });
  }
});

app.get('/api/trades/active', authenticateToken, (req, res) => {
  try {
    const activeTrades = inMemoryTrades.filter(trade => 
      trade.userId === req.user.userId && trade.status === 'PENDING'
    );

    res.json(activeTrades);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch active trades' });
  }
});

// Market Data Routes
app.get('/api/market/prices/:symbol', (req, res) => {
  try {
    const { symbol } = req.params;
    const priceData = marketDataService.getCurrentPrice(symbol);
    
    if (!priceData) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    res.json(priceData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch price data' });
  }
});

// WebSocket Connection Handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  socket.on('authenticate', (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      socket.userId = decoded.userId;
      socket.join(`user_${decoded.userId}`);
      socket.emit('authenticated', { success: true });
      logger.info(`Socket authenticated: User ${decoded.userId}`);
    } catch (error) {
      socket.emit('authenticated', { success: false, error: 'Invalid token' });
    }
  });

  socket.on('subscribe', (symbols) => {
    if (Array.isArray(symbols)) {
      symbols.forEach(symbol => {
        socket.join(`price_${symbol}`);
      });
      logger.info(`Client ${socket.id} subscribed to: ${symbols.join(', ')}`);
    }
  });

  socket.on('unsubscribe', (symbols) => {
    if (Array.isArray(symbols)) {
      symbols.forEach(symbol => {
        socket.leave(`price_${symbol}`);
      });
    }
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Error handling
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`🚀 ExpertTrade Server running on port ${PORT}`);
  logger.info(`📊 WebSocket server ready for real-time connections`);
  logger.info(`💾 Running in IN-MEMORY mode (no database required)`);
  logger.info(`💼 Demo account: demo@trading.com / demo123`);
  logger.info(`🔗 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;