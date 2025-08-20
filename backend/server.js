// backend/server.js - COMPLETE VERSION
require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Check if MongoDB is available, fallback to simple mode if not
let useDatabase = true;
let databaseConfig, TradingEngine, MarketDataService, AuthService;
let authRoutes, tradeRoutes, assetRoutes;
let errorHandler, authenticateToken;

try {
  // Try to import database-dependent modules
  databaseConfig = require('./config/database');
  TradingEngine = require('./services/TradingEngine');
  MarketDataService = require('./services/MarketDataService');
  AuthService = require('./services/AuthService');
  authRoutes = require('./routes/auth');
  tradeRoutes = require('./routes/trades');
  assetRoutes = require('./routes/assets');
  const middleware = require('./middleware/errorHandler');
  const authMiddleware = require('./middleware/auth');
  errorHandler = middleware.errorHandler;
  authenticateToken = authMiddleware.authenticateToken;
} catch (error) {
  console.log('⚠️ Database modules not found, running in simple mode');
  useDatabase = false;
}

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Global variables
let redisService;
let tradingEngine;
let marketDataService;
let authService;

// Middleware setup
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests from this IP' }
});
app.use('/api', limiter);

// Simple Redis service for fallback
class SimpleRedisService {
  constructor() {
    this.cache = new Map();
    this.isConnected = false;
  }

  async set(key, value, expireInSeconds = null) {
    this.cache.set(key, { value, expires: expireInSeconds ? Date.now() + (expireInSeconds * 1000) : null });
    return true;
  }

  async get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (item.expires && Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }

  async delete(key) {
    return this.cache.delete(key);
  }
}

// Initialize database and services
async function initializeServer() {
  try {
    if (useDatabase) {
      // Full database mode
      await databaseConfig.initializeDatabase();
      const redisClient = databaseConfig.getRedisClient();
      
      // Redis service setup
      class RedisService {
        constructor(client) {
          this.client = client;
          this.isConnected = !!client;
        }

        async set(key, value, expireInSeconds = null) {
          if (!this.isConnected) return false;
          
          try {
            const stringValue = JSON.stringify(value);
            if (expireInSeconds) {
              await this.client.setEx(key, expireInSeconds, stringValue);
            } else {
              await this.client.set(key, stringValue);
            }
            return true;
          } catch (error) {
            console.error('Redis SET error:', error);
            return false;
          }
        }

        async get(key) {
          if (!this.isConnected) return null;
          
          try {
            const value = await this.client.get(key);
            return value ? JSON.parse(value) : null;
          } catch (error) {
            console.error('Redis GET error:', error);
            return null;
          }
        }

        async delete(key) {
          if (!this.isConnected) return false;
          
          try {
            await this.client.del(key);
            return true;
          } catch (error) {
            console.error('Redis DELETE error:', error);
            return false;
          }
        }
      }

      redisService = new RedisService(redisClient);
      
      // Initialize services
      authService = new AuthService(redisService);
      tradingEngine = new TradingEngine(io, redisService);
      marketDataService = new MarketDataService(io, redisService);
      
      // Start market data service
      await marketDataService.start();
      
      console.log('🚀 Full database mode initialized');
    } else {
      // Simple fallback mode
      redisService = new SimpleRedisService();
      console.log('🚀 Simple fallback mode initialized');
    }
  } catch (error) {
    console.error('❌ Failed to initialize server:', error);
    // Fall back to simple mode
    useDatabase = false;
    redisService = new SimpleRedisService();
    console.log('🚀 Falling back to simple mode');
  }
}

// Routes setup
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    mode: useDatabase ? 'database' : 'simple',
    mongodb: useDatabase ? !!databaseConfig?.getMongoConnection() : false,
    redis: redisService?.isConnected || false,
    activeTrades: tradingEngine?.getActiveTrades()?.length || 0
  });
});

if (useDatabase) {
  // Use full database routes
  app.use('/api/auth', authRoutes);
  app.use('/api/trades', tradeRoutes);
  app.use('/api/assets', assetRoutes);

  // User profile route
  app.get('/api/user/profile', authenticateToken, async (req, res) => {
    try {
      const User = require('./models/User');
      const user = await User.findById(req.user._id || req.user.id).select('-password');
      res.json(user);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
} else {
  // Simple fallback routes
  const jwt = require('jsonwebtoken');
  const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';

  // Demo user
  const demoUser = {
    id: 1,
    email: 'demo@trading.com',
    password: 'demo123',
    firstName: 'Demo',
    lastName: 'User',
    balance: 10000,
    accountType: 'demo'
  };

  // Simple auth
  app.post('/api/auth/login', (req, res) => {
    try {
      const { email, password } = req.body;
      
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
            firstName: demoUser.firstName,
            lastName: demoUser.lastName,
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

  // Simple assets endpoint
  app.get('/api/assets', (req, res) => {
    const mockAssets = [
      { symbol: 'EURUSD', name: 'Euro/US Dollar', category: 'forex', currentPrice: 1.09511, payout: 0.8 },
      { symbol: 'GBPUSD', name: 'British Pound/US Dollar', category: 'forex', currentPrice: 1.25481, payout: 0.8 },
      { symbol: 'USDJPY', name: 'US Dollar/Japanese Yen', category: 'forex', currentPrice: 150.58037, payout: 0.8 },
      { symbol: 'BTCUSD', name: 'Bitcoin/US Dollar', category: 'crypto', currentPrice: 66104.38534, payout: 0.85 },
      { symbol: 'ETHUSD', name: 'Ethereum/US Dollar', category: 'crypto', currentPrice: 3124.27865, payout: 0.85 },
      { symbol: 'AAPL', name: 'Apple Inc', category: 'stocks', currentPrice: 156.61687, payout: 0.8 },
      { symbol: 'TSLA', name: 'Tesla Inc', category: 'stocks', currentPrice: 250.87927, payout: 0.8 },
      { symbol: 'GOOGL', name: 'Alphabet Inc', category: 'stocks', currentPrice: 143.61676, payout: 0.8 },
      { symbol: 'GOLD', name: 'Gold', category: 'commodities', currentPrice: 2028.15778, payout: 0.8 },
      { symbol: 'OIL', name: 'Crude Oil', category: 'commodities', currentPrice: 85.33382, payout: 0.8 }
    ];

    res.json(mockAssets);
  });
}

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  socket.on('authenticate', async (token) => {
    try {
      if (useDatabase && authService) {
        const user = await authService.getUserFromToken(token);
        
        if (user) {
          socket.userId = user._id.toString();
          socket.emit('authenticated', { userId: socket.userId });
          
          const Asset = require('./models/Asset');
          const assets = await Asset.find({ isActive: true });
          socket.emit('assets', assets);
          
          socket.join(`user:${socket.userId}`);
          console.log(`✅ User authenticated: ${user.email}`);
        } else {
          socket.emit('auth_error', 'User not found');
        }
      } else {
        // Simple mode authentication
        const jwt = require('jsonwebtoken');
        const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
        
        const decoded = jwt.verify(token, JWT_SECRET);
        socket.userId = decoded.userId.toString();
        socket.emit('authenticated', { userId: socket.userId });
        console.log(`✅ User authenticated (simple mode): ${decoded.email}`);
      }
    } catch (error) {
      console.error('Socket auth error:', error);
      socket.emit('auth_error', 'Invalid token');
    }
  });

  socket.on('subscribe_prices', (symbols) => {
    if (Array.isArray(symbols)) {
      symbols.forEach(symbol => {
        socket.join(`prices:${symbol}`);
      });
      console.log(`📈 Client subscribed to: ${symbols.join(', ')}`);
    }
  });

  socket.on('unsubscribe_prices', (symbols) => {
    if (Array.isArray(symbols)) {
      symbols.forEach(symbol => {
        socket.leave(`prices:${symbol}`);
      });
      console.log(`📉 Client unsubscribed from: ${symbols.join(', ')}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Error handling middleware
if (useDatabase && errorHandler) {
  app.use(errorHandler);
} else {
  app.use((error, req, res, next) => {
    console.error('Global error:', error);
    res.status(500).json({ error: 'Internal server error' });
  });
}

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  
  if (marketDataService) await marketDataService.stop();
  if (tradingEngine) tradingEngine.cleanup();
  if (useDatabase && databaseConfig) await databaseConfig.closeConnections();
  
  server.close(() => {
    console.log('🛑 Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  
  if (marketDataService) await marketDataService.stop();
  if (tradingEngine) tradingEngine.cleanup();
  if (useDatabase && databaseConfig) await databaseConfig.closeConnections();
  
  server.close(() => {
    console.log('🛑 Process terminated');
    process.exit(0);
  });
});

// Start server
const PORT = process.env.PORT || 5000;

async function startServer() {
  await initializeServer();
  
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Mode: ${useDatabase ? 'Full Database' : 'Simple Fallback'}`);
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    console.log(`🔐 Demo login: demo@trading.com / demo123`);
    console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
  });
}

startServer().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});