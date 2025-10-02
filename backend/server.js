/* eslint-disable */

require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const fetch = require('node-fetch');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Check if MongoDB is available, fallback to simple mode if not
let useDatabase = true;
let databaseConfig, TradingEngine, MarketDataService, AuthService;
let authRoutes, tradeRoutes, assetRoutes;
let errorHandler, authenticateToken;

try {
  // Try to import database-dependent modules
  databaseConfig = require('./config/database');
  TradingEngine = require('./services/TradingEngine'); // Ensure this path is correct
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
  console.log('⚠️ Database modules not found, running in simple mode:', error.message);
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
let tradingEngine; // This will hold the instance
let marketDataService;
let authService;

// Simple in-memory cache
let marketDataCache = null;
let lastFetch = 0;
const CACHE_DURATION = 30000; // 30 seconds

// Middleware setup
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:3000",
    "http://localhost:3001", // Add this if your React app runs on 3001
    "http://localhost:3002", // Or any other port it might use
    "http://localhost:5001"  // Add backend origin for debugging
  ],
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
      // --- Initialize TradingEngine and attach to app.locals ---
      tradingEngine = new TradingEngine(io, redisService);
      app.locals.tradingEngine = tradingEngine; // Make it available to routes
      // --- End TradingEngine Init ---
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
    mongodb: useDatabase ? !!databaseConfig.getMongoConnection() : false,
    redis: (redisService && redisService.isConnected) || false,
    activeTrades: tradingEngine?.getActiveTrades?.()?.length || 0 // Safer access
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
  // --- Simple fallback routes (keep your existing logic) ---
  const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';

  // Demo user
  const demoUser = {
    id: 1,
    email: 'demo@trading.com',
    password: 'demo123', // In real simple mode, you'd hash this
    firstName: 'Demo',
    lastName: 'User',
    balance: 10000,
    accountType: 'demo'
  };

  // Simple auth login
  app.post('/api/auth/login', (req, res) => {
    try {
      const { email, password } = req.body;

      // Simple check for demo user
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

  // Simple auth register (demo mode)
  app.post('/api/auth/register', (req, res) => {
    try {
      const { email, password, firstName, lastName, country } = req.body;

      // Basic validation
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }

      // In simple mode, just create a demo-like user
      const user = {
        id: Date.now(), // Simple ID
        email: email.toLowerCase(),
        firstName,
        lastName,
        country: country || 'US',
        balance: 10000,
        accountType: 'demo',
        totalProfit: 0,
        totalTrades: 0,
        winRate: 0
      };

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        token,
        user
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  // Simple trades endpoint (for simple mode, this just logs)
  // You might want to remove or adapt this if your frontend only uses the DB routes
  app.post('/api/trades/simple-place', (req, res) => {
    console.warn("⚠️ Using simple mode trade endpoint. This is for demonstration only.");
    try {
      // This is just a mock, does not interact with TradingEngine
      const { asset, direction, amount, expiryTimeSeconds } = req.body;

      if (!asset || !direction || !amount || !expiryTimeSeconds) {
        return res.status(400).json({ error: 'Missing required fields for simple trade' });
      }

      const trade = {
        id: 'simple_trade_' + Date.now(),
        asset,
        direction,
        amount,
        entryPrice: Math.random() * 100 + 50, // Mock price
        timestamp: Date.now(),
        expiryTime: Date.now() + (expiryTimeSeconds * 1000),
        status: 'active'
      };

      // In a real simple mode, you'd manage this state somehow, maybe in memory
      // For now, just acknowledge
      res.status(201).json({
        success: true,
        message: 'Trade placed in simple mode (not executed)',
        trade: trade
      });

      // Simulate a result after expiry (not broadcasted in simple mode unless you add it)
      // setTimeout(() => {
      //   // Logic to determine win/loss and "notify"
      // }, expiryTimeSeconds * 1000);

    } catch (error) {
      console.error('Simple trade error:', error);
      res.status(500).json({ error: 'Internal server error in simple trade' });
    }
  });

  // Simple assets endpoint
  app.get('/api/assets', (req, res) => {
    const mockAssets = [
      { symbol: 'EUR/USD', name: 'Euro / US Dollar', price: 1.08945, change: 0.12, category: 'forex', icon: '💱' },
      { symbol: 'GBP/USD', name: 'British Pound / US Dollar', price: 1.24567, change: -0.08, category: 'forex', icon: '💱' },
      { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', price: 149.832, change: 0.34, category: 'forex', icon: '💱' },
      { symbol: 'BTC/USD', name: 'Bitcoin', price: 65234.56, change: 2.45, category: 'crypto', icon: '₿' },
      { symbol: 'ETH/USD', name: 'Ethereum', price: 3142.89, change: 1.87, category: 'crypto', icon: 'Ξ' },
      { symbol: 'AAPL', name: 'Apple Inc', price: 189.47, change: 0.89, category: 'stocks', icon: '🍎' },
      { symbol: 'TSLA', name: 'Tesla Inc', price: 248.91, change: -1.23, category: 'stocks', icon: '🚗' },
    ];
    res.json(mockAssets);
  });

  // CoinGecko market data endpoint (keep your existing logic)
  app.get('/api/market-data', async (req, res) => {
    const now = Date.now();

    // Return cached data if recent
    if (marketDataCache && (now - lastFetch) < CACHE_DURATION) {
      return res.json(marketDataCache);
    }

    try {
      // Fetch fresh data from CoinGecko
      const coinGeckoIds = 'bitcoin,ethereum,cardano,dogecoin,chainlink,polkadot,litecoin,stellar';
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckoIds}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_last_updated_at=true`
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();

      // Transform to trading platform format (matching frontend assets)
      marketDataCache = {
        'BTC/USD': {
          price: data.bitcoin?.usd || 0,
          change: data.bitcoin?.usd_24h_change || 0,
          volume: data.bitcoin?.usd_24h_vol || 0,
          lastUpdated: data.bitcoin?.last_updated_at || Date.now()
        },
        'ETH/USD': {
          price: data.ethereum?.usd || 0,
          change: data.ethereum?.usd_24h_change || 0,
          volume: data.ethereum?.usd_24h_vol || 0,
          lastUpdated: data.ethereum?.last_updated_at || Date.now()
        },
        // Add others as needed, or filter based on your frontend list
        // For now, we primarily care about BTC/USD and ETH/USD for crypto assets
      };

      lastFetch = now;
      res.json(marketDataCache);
    } catch (error) {
      console.error('CoinGecko API error:', error);
      if (marketDataCache) {
        res.json(marketDataCache);
      } else {
        res.status(500).json({ error: 'Failed to fetch market data' });
      }
    }
  });

  // Individual asset price endpoint (keep your existing logic, fix URL)
  app.get('/api/market-data/:symbol', async (req, res) => {
    try {
      const { symbol } = req.params;

      // Map symbols to CoinGecko IDs
      const symbolMap = {
        'BTC': 'bitcoin',
        'ETH': 'ethereum',
        'ADA': 'cardano',
        'DOGE': 'dogecoin',
        'LINK': 'chainlink',
        'DOT': 'polkadot',
        'LTC': 'litecoin',
        'XLM': 'stellar'
      };

      const coinId = symbolMap[symbol.toUpperCase()];
      if (!coinId) {
        return res.status(400).json({ error: 'Unsupported symbol' });
      }

      // --- Fix the URL: Remove extra space ---
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`
      );
      // --- End Fix ---

      if (!response.ok) {
        throw new Error(`CoinGecko API error for ${coinId}: ${response.status}`);
      }

      const data = await response.json();
      res.json(data[coinId]);
    } catch (error) {
      console.error('CoinGecko API error:', error);
      res.status(500).json({ error: 'Failed to fetch price data' });
    }
  });
  // --- End Simple fallback routes ---
}

// WebSocket connection handling (keep your existing logic)
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
        const JWT_SECRET = process.env.JWT_SECRET || 'TRADINGOPTION_SECRET_KEY@12345';

        try {
          const decoded = jwt.verify(token, JWT_SECRET);
          socket.userId = decoded.userId.toString();
          socket.emit('authenticated', { userId: socket.userId });
          // In simple mode, maybe emit mock assets or nothing
          socket.emit('assets', []); // Or your mock assets
          socket.join(`user:${socket.userId}`); // Still join for consistency
          console.log(`✅ User authenticated (simple mode): ${decoded.email}`);
        } catch (jwtError) {
          console.error('JWT verification error (simple mode):', jwtError);
          socket.emit('auth_error', 'Invalid token');
        }
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

// Error handling middleware (keep your existing logic)
if (useDatabase && errorHandler) {
  app.use(errorHandler);
} else {
  app.use((error, req, res, next) => {
    console.error('Global error:', error);
    res.status(500).json({ error: 'Internal server error' });
  });
}

// 404 handler (keep your existing logic)
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Graceful shutdown (updated to use the local `tradingEngine` variable)
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');

  if (marketDataService) {
    try {
      await marketDataService.stop();
      console.log('📈 Market Data Service stopped.');
    } catch (err) {
      console.error('Error stopping Market Data Service:', err);
    }
  }

  // --- Use the local tradingEngine variable ---
  if (tradingEngine && typeof tradingEngine.cleanup === 'function') {
    try {
      tradingEngine.cleanup();
      console.log('⚙️ Trading Engine cleaned up.');
    } catch (err) {
      console.error('Error cleaning up Trading Engine:', err);
    }
  }
  // --- End use local variable ---

  if (useDatabase && databaseConfig) {
    try {
      await databaseConfig.closeConnections();
      console.log('🗄️ Database connections closed.');
    } catch (err) {
      console.error('Error closing database connections:', err);
    }
  }

  server.close(() => {
    console.log('🛑 HTTP Server closed. Process terminated.');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully');

  if (marketDataService) {
    try {
      await marketDataService.stop();
      console.log('📈 Market Data Service stopped.');
    } catch (err) {
      console.error('Error stopping Market Data Service:', err);
    }
  }

  // --- Use the local tradingEngine variable ---
  if (tradingEngine && typeof tradingEngine.cleanup === 'function') {
    try {
      tradingEngine.cleanup();
      console.log('⚙️ Trading Engine cleaned up.');
    } catch (err) {
      console.error('Error cleaning up Trading Engine:', err);
    }
  }
  // --- End use local variable ---

  if (useDatabase && databaseConfig) {
    try {
      await databaseConfig.closeConnections();
      console.log('🗄️ Database connections closed.');
    } catch (err) {
      console.error('Error closing database connections:', err);
    }
  }

  server.close(() => {
    console.log('🛑 HTTP Server closed. Process terminated.');
    process.exit(0);
  });
});
// --- End Graceful shutdown ---

// Start server (keep your existing logic)
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
