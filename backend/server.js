// backend/server.js - Expert Option Backend with Real Market Data
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const InvestingDataService = require('./services/investingDataService');

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

// Initialize services
const investingService = new InvestingDataService();
let marketData = {};

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
    marketDataAvailable: Object.keys(marketData).length > 0
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
  res.json(marketData);
});

app.get('/api/market/data/:symbol', (req, res) => {
  const { symbol } = req.params;
  const data = marketData[symbol];
  
  if (!data) {
    return res.status(404).json({ error: 'Symbol not found' });
  }
  
  res.json(data);
});

app.get('/api/market/history/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { interval = '1m', count = 100 } = req.query;
    
    const historicalData = await investingService.getHistoricalData(symbol, interval, parseInt(count));
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
      return res.status(400).json({ error: 'Invalid symbol' });
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
        status: trade.status
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

// Trade settlement function
function settleTrade(tradeId) {
  const trade = trades.get(tradeId);
  if (!trade || trade.status !== 'active') return;

  const currentPrice = marketData[trade.symbol]?.price;
  if (!currentPrice) return;

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

// Initialize market data service
async function initializeMarketData() {
  try {
    console.log('🚀 Initializing market data service...');
    
    // Start the investing service
    marketData = await investingService.start();
    
    // Subscribe to real-time updates
    Object.keys(marketData).forEach(symbol => {
      investingService.subscribe(symbol, (data) => {
        marketData[symbol] = data;
        
        // Broadcast to all subscribers
        io.to(`market_${symbol}`).emit('marketUpdate', {
          symbol: symbol,
          data: data
        });
      });
    });
    
    console.log('✅ Market data service initialized successfully');
    
  } catch (error) {
    console.error('❌ Failed to initialize market data:', error);
    
    // Fallback to mock data
    console.log('🔄 Using mock market data...');
    setInterval(updateMockMarketData, 1000);
  }
}

// Mock market data updater (fallback)
function updateMockMarketData() {
  const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'BTCUSD', 'ETHUSD', 'AAPL', 'TSLA', 'GOOGL', 'GOLD', 'OIL'];
  
  symbols.forEach(symbol => {
    if (!marketData[symbol]) {
      marketData[symbol] = investingService.generateMockPrice(symbol);
    } else {
      // Update with small random changes
      const change = (Math.random() - 0.5) * 0.1;
      const newPrice = marketData[symbol].price * (1 + change / 100);
      
      marketData[symbol] = {
        ...marketData[symbol],
        price: parseFloat(newPrice.toFixed(5)),
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(change.toFixed(2)),
        timestamp: Date.now()
      };
    }
    
    // Broadcast update
    io.to(`market_${symbol}`).emit('marketUpdate', {
      symbol: symbol,
      data: marketData[symbol]
    });
  });
}

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, async () => {
  console.log(`🚀 Expert Option Backend running on port ${PORT}`);
  console.log(`📊 WebSocket server ready for real-time data`);
  console.log(`🔐 Demo login: demo@trading.com / demo123`);
  
  // Initialize market data
  await initializeMarketData();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Shutting down gracefully...');
  investingService.stop();
  server.close(() => {
    console.log('✅ Server shut down successfully');
    process.exit(0);
  });
});