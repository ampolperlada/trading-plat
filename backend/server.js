// backend/server.js - Main Trading Platform Server
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
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
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Database Models
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  balance: { type: Number, default: 10000 }, // Demo balance
  isVerified: { type: Boolean, default: true }, // Auto-verified for demo
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date },
  preferences: {
    theme: { type: String, default: 'dark' },
    notifications: { type: Boolean, default: true },
    riskLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }
  }
});

const tradeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  asset: { type: String, required: true }, // EURUSD, BTCUSD, etc.
  type: { type: String, enum: ['CALL', 'PUT'], required: true },
  amount: { type: Number, required: true },
  entryPrice: { type: Number, required: true },
  exitPrice: { type: Number },
  duration: { type: Number, required: true }, // in seconds
  status: { type: String, enum: ['PENDING', 'WON', 'LOST'], default: 'PENDING' },
  profit: { type: Number, default: 0 },
  payout: { type: Number, default: 0.8 }, // 80% payout
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true }
});

const assetSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, enum: ['forex', 'crypto', 'stocks', 'commodities'] },
  currentPrice: { type: Number, required: true },
  change24h: { type: Number, default: 0 },
  changePercent24h: { type: Number, default: 0 },
  volume: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  lastUpdated: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Trade = mongoose.model('Trade', tradeSchema);
const Asset = mongoose.model('Asset', assetSchema);

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

// Market Data Service (Simulated Expert Option style)
class MarketDataService {
  constructor() {
    this.assets = new Map();
    this.priceHistory = new Map();
    this.subscribers = new Set();
    this.startPriceSimulation();
  }

  startPriceSimulation() {
    // Update prices every second (like Expert Option)
    setInterval(() => {
      this.updatePrices();
    }, 1000);

    // Save to database every 10 seconds
    setInterval(() => {
      this.savePricesToDatabase();
    }, 10000);
  }

  async updatePrices() {
    try {
      const assets = await Asset.find({ isActive: true });
      
      assets.forEach(asset => {
        const volatility = this.getVolatility(asset.category);
        const trend = this.getMarketTrend();
        const change = this.generatePriceChange(volatility, trend);
        
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
        
        // Keep only last 1000 points (about 16 minutes of data)
        if (history.length > 1000) {
          history.shift();
        }
        
        // Update asset object
        asset.currentPrice = newPrice;
        asset.change24h = change * asset.currentPrice;
        asset.changePercent24h = change * 100;
        asset.volume = priceData.volume;
        asset.lastUpdated = new Date();
        
        // Broadcast to all connected clients
        io.emit('priceUpdate', {
          symbol: asset.symbol,
          price: newPrice,
          change: asset.change24h,
          changePercent: asset.changePercent24h,
          volume: asset.volume,
          timestamp: Date.now()
        });
      });
    } catch (error) {
      logger.error('Price update error:', error);
    }
  }

  generatePriceChange(volatility, trend) {
    // Generate more realistic price movements
    const random = (Math.random() - 0.5) * 2; // -1 to 1
    const trendInfluence = trend * 0.3; // Add market trend
    const noise = random * volatility;
    
    return (trendInfluence + noise) * (1 + Math.sin(Date.now() / 10000) * 0.1);
  }

  getVolatility(category) {
    const volatilities = {
      forex: 0.0005,   // Very low volatility
      crypto: 0.015,   // High volatility
      stocks: 0.003,   // Medium volatility
      commodities: 0.002
    };
    return volatilities[category] || 0.001;
  }

  getMarketTrend() {
    // Simulate market trends (bull/bear cycles)
    const time = Date.now();
    const cycle = Math.sin(time / 300000) * 0.001; // 5-minute cycles
    return cycle;
  }

  async getCurrentPrice(symbol) {
    try {
      const asset = await Asset.findOne({ symbol });
      return asset ? {
        price: asset.currentPrice,
        change: asset.change24h,
        changePercent: asset.changePercent24h,
        volume: asset.volume
      } : null;
    } catch (error) {
      logger.error('Get price error:', error);
      return null;
    }
  }

  getPriceHistory(symbol, timeframe = '1m') {
    const history = this.priceHistory.get(symbol) || [];
    
    // Return last 100 points for charts
    return history.slice(-100).map(point => ({
      time: point.timestamp,
      open: point.price,
      high: point.price * (1 + Math.random() * 0.001),
      low: point.price * (1 - Math.random() * 0.001),
      close: point.price,
      volume: point.volume
    }));
  }

  async savePricesToDatabase() {
    try {
      const assets = await Asset.find({ isActive: true });
      const bulkOps = assets.map(asset => ({
        updateOne: {
          filter: { symbol: asset.symbol },
          update: {
            currentPrice: asset.currentPrice,
            change24h: asset.change24h,
            changePercent24h: asset.changePercent24h,
            volume: asset.volume,
            lastUpdated: new Date()
          }
        }
      }));
      
      if (bulkOps.length > 0) {
        await Asset.bulkWrite(bulkOps);
      }
    } catch (error) {
      logger.error('Database save error:', error);
    }
  }
}

// Trading Engine (Expert Option style)
class TradingEngine {
  constructor() {
    this.activeTrades = new Map();
    this.startTradeMonitoring();
  }

  startTradeMonitoring() {
    // Check for expired trades every second
    setInterval(() => {
      this.checkExpiredTrades();
    }, 1000);
  }

  async createTrade(userId, tradeData) {
    try {
      const { asset, type, amount, duration } = tradeData;
      
      // Validate user balance
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      if (user.balance < amount) {
        throw new Error('Insufficient balance');
      }

      // Get current price
      const marketData = await marketDataService.getCurrentPrice(asset);
      if (!marketData) {
        throw new Error('Asset not available');
      }

      // Create trade
      const trade = new Trade({
        userId,
        asset,
        type,
        amount,
        entryPrice: marketData.price,
        duration,
        expiresAt: new Date(Date.now() + duration * 1000)
      });

      await trade.save();

      // Deduct amount from user balance
      await User.findByIdAndUpdate(userId, {
        $inc: { balance: -amount }
      });

      // Add to active monitoring
      this.activeTrades.set(trade._id.toString(), trade);

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

  async checkExpiredTrades() {
    try {
      const expiredTrades = await Trade.find({
        status: 'PENDING',
        expiresAt: { $lte: new Date() }
      });

      for (const trade of expiredTrades) {
        await this.settleTrade(trade);
      }
    } catch (error) {
      logger.error('Check expired trades error:', error);
    }
  }

  async settleTrade(trade) {
    try {
      const marketData = await marketDataService.getCurrentPrice(trade.asset);
      if (!marketData) {
        logger.error(`Cannot settle trade ${trade._id}: No market data for ${trade.asset}`);
        return;
      }

      const exitPrice = marketData.price;
      let isWin = false;

      // Determine if trade won (Expert Option logic)
      if (trade.type === 'CALL') {
        isWin = exitPrice > trade.entryPrice;
      } else { // PUT
        isWin = exitPrice < trade.entryPrice;
      }

      const profit = isWin ? trade.amount * trade.payout : 0; // 80% payout if win
      const status = isWin ? 'WON' : 'LOST';

      // Update trade
      await Trade.findByIdAndUpdate(trade._id, {
        exitPrice,
        status,
        profit
      });

      // Update user balance if won
      if (isWin) {
        await User.findByIdAndUpdate(trade.userId, {
          $inc: { balance: trade.amount + profit }
        });
      }

      // Remove from active monitoring
      this.activeTrades.delete(trade._id.toString());

      // Get updated user balance
      const updatedUser = await User.findById(trade.userId);

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
        newBalance: updatedUser.balance
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
    version: '1.0.0'
  });
});

// Authentication Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName
    });

    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        balance: user.balance
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
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
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
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Asset Routes
app.get('/api/assets', async (req, res) => {
  try {
    const assets = await Asset.find({ isActive: true }).sort({ name: 1 });
    res.json(assets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});

app.get('/api/assets/:symbol/history', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { timeframe = '1m' } = req.query;
    
    const history = marketDataService.getPriceHistory(symbol, timeframe);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch price history' });
  }
});

// Trading Routes
app.post('/api/trades', authenticateToken, async (req, res) => {
  try {
    const trade = await tradingEngine.createTrade(req.user.userId, req.body);
    res.status(201).json(trade);
  } catch (error) {
    logger.error('Trade creation error:', error);
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/trades/history', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const trades = await Trade.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Trade.countDocuments({ userId: req.user.userId });

    res.json({
      trades,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trade history' });
  }
});

app.get('/api/trades/active', authenticateToken, async (req, res) => {
  try {
    const activeTrades = await Trade.find({ 
      userId: req.user.userId,
      status: 'PENDING'
    }).sort({ createdAt: -1 });

    res.json(activeTrades);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch active trades' });
  }
});

// Market Data Routes
app.get('/api/market/prices/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const priceData = await marketDataService.getCurrentPrice(symbol);
    
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

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trading_platform')



.then(() => logger.info('Connected to MongoDB'))
.catch(error => logger.error('MongoDB connection error:', error));

// Initialize demo assets (Expert Option style)
const initializeDemoAssets = async () => {
  try {
    const count = await Asset.countDocuments();
    if (count === 0) {
      const demoAssets = [
        // Forex Pairs (Major)
        { symbol: 'EURUSD', name: 'EUR/USD', category: 'forex', currentPrice: 1.0850 },
        { symbol: 'GBPUSD', name: 'GBP/USD', category: 'forex', currentPrice: 1.2650 },
        { symbol: 'USDJPY', name: 'USD/JPY', category: 'forex', currentPrice: 150.25 },
        { symbol: 'USDCHF', name: 'USD/CHF', category: 'forex', currentPrice: 0.8950 },
        { symbol: 'AUDUSD', name: 'AUD/USD', category: 'forex', currentPrice: 0.6750 },
        { symbol: 'USDCAD', name: 'USD/CAD', category: 'forex', currentPrice: 1.3550 },
        
        // Cryptocurrencies
        { symbol: 'BTCUSD', name: 'Bitcoin/USD', category: 'crypto', currentPrice: 65000 },
        { symbol: 'ETHUSD', name: 'Ethereum/USD', category: 'crypto', currentPrice: 3200 },
        { symbol: 'BNBUSD', name: 'Binance Coin/USD', category: 'crypto', currentPrice: 245 },
        { symbol: 'ADAUSD', name: 'Cardano/USD', category: 'crypto', currentPrice: 0.45 },
        { symbol: 'SOLUSD', name: 'Solana/USD', category: 'crypto', currentPrice: 98 },
        
        // Stocks
        { symbol: 'AAPL', name: 'Apple Inc.', category: 'stocks', currentPrice: 195.50 },
        { symbol: 'TSLA', name: 'Tesla Inc.', category: 'stocks', currentPrice: 250.75 },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', category: 'stocks', currentPrice: 142.80 },
        { symbol: 'MSFT', name: 'Microsoft Corp.', category: 'stocks', currentPrice: 378.90 },
        { symbol: 'AMZN', name: 'Amazon.com Inc.', category: 'stocks', currentPrice: 155.20 },
        
        // Commodities
        { symbol: 'GOLD', name: 'Gold', category: 'commodities', currentPrice: 2020.50 },
        { symbol: 'SILVER', name: 'Silver', category: 'commodities', currentPrice: 24.85 },
        { symbol: 'OIL', name: 'Crude Oil', category: 'commodities', currentPrice: 85.25 },
        { symbol: 'GAS', name: 'Natural Gas', category: 'commodities', currentPrice: 3.45 }
      ];

      await Asset.insertMany(demoAssets);
      logger.info('Demo assets initialized successfully');
    }
  } catch (error) {
    logger.error('Asset initialization error:', error);
  }
};

// Fallback API routes when database is not available
app.get('/api/assets', async (req, res) => {
  try {
    let assets = await Asset.find({ isActive: true }).sort({ name: 1 });
    
    // If database fails, return simulated data
    if (assets.length === 0) {
      assets = [
        { symbol: 'EURUSD', name: 'EUR/USD', category: 'forex', currentPrice: 1.0850, changePercent24h: 0.12 },
        { symbol: 'GBPUSD', name: 'GBP/USD', category: 'forex', currentPrice: 1.2650, changePercent24h: -0.34 },
        { symbol: 'BTCUSD', name: 'Bitcoin/USD', category: 'crypto', currentPrice: 65000, changePercent24h: 2.45 },
        { symbol: 'ETHUSD', name: 'Ethereum/USD', category: 'crypto', currentPrice: 3200, changePercent24h: 1.89 },
        { symbol: 'AAPL', name: 'Apple Inc.', category: 'stocks', currentPrice: 195.50, changePercent24h: 0.67 },
        { symbol: 'TSLA', name: 'Tesla Inc.', category: 'stocks', currentPrice: 250.75, changePercent24h: -1.23 }
      ];
    }
    
    res.json(assets);
  } catch (error) {
    // Return simulated data if all else fails
    res.json([
      { symbol: 'EURUSD', name: 'EUR/USD', category: 'forex', currentPrice: 1.0850, changePercent24h: 0.12 },
      { symbol: 'BTCUSD', name: 'Bitcoin/USD', category: 'crypto', currentPrice: 65000, changePercent24h: 2.45 }
    ]);
  }
});
// Create demo user
const createDemoUser = async () => {
  try {
    const demoEmail = 'demo@trading.com';
    const existingDemo = await User.findOne({ email: demoEmail });
    
    if (!existingDemo) {
      const hashedPassword = await bcrypt.hash('demo123', 12);
      const demoUser = new User({
        email: demoEmail,
        password: hashedPassword,
        firstName: 'Demo',
        lastName: 'User',
        balance: 10000,
        isVerified: true
      });
      
      await demoUser.save();
      logger.info('Demo user created: demo@trading.com / demo123');
    }
  } catch (error) {
    logger.error('Demo user creation error:', error);
  }
};

// Error handling
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    mongoose.connection.close();
    process.exit(0);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`🚀 Trading Platform Server running on port ${PORT}`);
  logger.info(`📊 WebSocket server ready for real-time connections`);
  
  // Initialize demo data
  initializeDemoAssets();
  createDemoUser();
  
  logger.info(`💼 Demo account: demo@trading.com / demo123`);
  logger.info(`🔗 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;