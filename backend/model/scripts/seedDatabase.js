// scripts/seedDatabase.js
require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const User = require('../models/User');
const Asset = require('../models/Asset');
const PriceHistory = require('../services/PriceHistory');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trading_platform';

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function seedAssets() {
  console.log('🌱 Seeding assets...');
  
  const assets = [
    // Forex
    { symbol: 'EURUSD', name: 'Euro/US Dollar', category: 'forex', currentPrice: 1.09511, payout: 0.8 },
    { symbol: 'GBPUSD', name: 'British Pound/US Dollar', category: 'forex', currentPrice: 1.25481, payout: 0.8 },
    { symbol: 'USDJPY', name: 'US Dollar/Japanese Yen', category: 'forex', currentPrice: 150.58037, payout: 0.8 },
    { symbol: 'AUDUSD', name: 'Australian Dollar/US Dollar', category: 'forex', currentPrice: 0.67234, payout: 0.8 },
    { symbol: 'USDCAD', name: 'US Dollar/Canadian Dollar', category: 'forex', currentPrice: 1.34567, payout: 0.8 },
    
    // Crypto
    { symbol: 'BTCUSD', name: 'Bitcoin/US Dollar', category: 'crypto', currentPrice: 66104.38534, payout: 0.85 },
    { symbol: 'ETHUSD', name: 'Ethereum/US Dollar', category: 'crypto', currentPrice: 3124.27865, payout: 0.85 },
    { symbol: 'ADAUSD', name: 'Cardano/US Dollar', category: 'crypto', currentPrice: 0.45123, payout: 0.85 },
    { symbol: 'DOGEUSD', name: 'Dogecoin/US Dollar', category: 'crypto', currentPrice: 0.08456, payout: 0.85 },
    
    // Stocks
    { symbol: 'AAPL', name: 'Apple Inc', category: 'stocks', currentPrice: 156.61687, payout: 0.8 },
    { symbol: 'TSLA', name: 'Tesla Inc', category: 'stocks', currentPrice: 250.87927, payout: 0.8 },
    { symbol: 'GOOGL', name: 'Alphabet Inc', category: 'stocks', currentPrice: 143.61676, payout: 0.8 },
    { symbol: 'MSFT', name: 'Microsoft Corporation', category: 'stocks', currentPrice: 387.45123, payout: 0.8 },
    { symbol: 'AMZN', name: 'Amazon.com Inc', category: 'stocks', currentPrice: 145.78234, payout: 0.8 },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', category: 'stocks', currentPrice: 467.89123, payout: 0.8 },
    
    // Commodities
    { symbol: 'GOLD', name: 'Gold', category: 'commodities', currentPrice: 2028.15778, payout: 0.8 },
    { symbol: 'SILVER', name: 'Silver', category: 'commodities', currentPrice: 24.567, payout: 0.8 },
    { symbol: 'OIL', name: 'Crude Oil', category: 'commodities', currentPrice: 85.33382, payout: 0.8 },
    { symbol: 'GAS', name: 'Natural Gas', category: 'commodities', currentPrice: 3.456, payout: 0.8 },
    
    // Indices
    { symbol: 'SPX500', name: 'S&P 500 Index', category: 'indices', currentPrice: 4567.89, payout: 0.8 },
    { symbol: 'NASDAQ', name: 'NASDAQ 100 Index', category: 'indices', currentPrice: 15678.23, payout: 0.8 },
    { symbol: 'DAX30', name: 'DAX 30 Index', category: 'indices', currentPrice: 16234.56, payout: 0.8 }
  ];

  try {
    await Asset.deleteMany({});
    await Asset.insertMany(assets);
    console.log(`✅ Seeded ${assets.length} assets`);
  } catch (error) {
    console.error('❌ Error seeding assets:', error);
  }
}

async function seedUsers() {
  console.log('🌱 Seeding users...');
  
  const users = [
    {
      email: 'demo@trading.com',
      password: 'demo123',
      firstName: 'Demo',
      lastName: 'User',
      country: 'US',
      balance: 10000,
      accountType: 'demo',
      isVerified: true
    },
    {
      email: 'admin@trading.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      country: 'US',
      balance: 50000,
      accountType: 'real',
      isVerified: true
    },
    {
      email: 'trader@trading.com',
      password: 'trader123',
      firstName: 'Pro',
      lastName: 'Trader',
      country: 'UK',
      balance: 25000,
      accountType: 'real',
      isVerified: true,
      totalTrades: 150,
      totalProfit: 5500,
      winRate: 73.5
    }
  ];

  try {
    await User.deleteMany({});
    
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
    }
    
    console.log(`✅ Seeded ${users.length} users`);
  } catch (error) {
    console.error('❌ Error seeding users:', error);
  }
}

async function seedDatabase() {
  try {
    await connectDB();
    console.log('🌱 Starting database seeding...');
    
    await seedAssets();
    await seedUsers();
    
    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, seedAssets, seedUsers };