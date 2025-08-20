require('dotenv').config();
const mongoose = require('mongoose');
const Redis = require('redis');

class DatabaseConfig {
  constructor() {
    this.mongoConnection = null;
    this.redisClient = null;
  }

  async connectMongoDB() {
    try {
      const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trading_platform';
      
      this.mongoConnection = await mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      console.log(`✅ MongoDB Connected: ${this.mongoConnection.connection.host}`);
      return this.mongoConnection;
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      throw error;
    }
  }

  async connectRedis() {
    try {
      const redisURL = process.env.REDIS_URL || 'redis://localhost:6379';
      
      this.redisClient = Redis.createClient({ url: redisURL });
      await this.redisClient.connect();
      
      console.log('✅ Redis Connected');
      return this.redisClient;
    } catch (error) {
      console.error('❌ Redis connection failed:', error);
      return null; // App works without Redis
    }
  }

  async initializeDatabase() {
    await this.connectMongoDB();
    await this.connectRedis();
    await this.seedInitialData();
  }

  async seedInitialData() {
    try {
      const Asset = require('../models/Asset');
      const existingAssets = await Asset.countDocuments();
      if (existingAssets > 0) return;

      const initialAssets = [
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

      await Asset.insertMany(initialAssets);
      console.log('📊 Initial assets seeded');

      // Create demo user
      const User = require('../models/User');
      const existingDemoUser = await User.findOne({ email: 'demo@trading.com' });
      
      if (!existingDemoUser) {
        const demoUser = new User({
          email: 'demo@trading.com',
          password: 'demo123',
          firstName: 'Demo',
          lastName: 'User',
          country: 'US',
          balance: 10000,
          accountType: 'demo',
          isVerified: true
        });
        await demoUser.save();
        console.log('👤 Demo user created');
      }
    } catch (error) {
      console.error('❌ Error seeding data:', error);
    }
  }

  getRedisClient() { return this.redisClient; }
  
  async closeConnections() {
    if (this.mongoConnection) await mongoose.connection.close();
    if (this.redisClient) await this.redisClient.quit();
  }
}

module.exports = new DatabaseConfig();
