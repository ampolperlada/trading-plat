
// services/MarketDataService.js
const Asset = require('../models/Asset');

class MarketDataService {
  constructor(io, redisService) {
    this.io = io;
    this.redis = redisService;
    this.priceUpdateInterval = null;
    this.isRunning = false;
    this.updateIntervalMs = 1000; // 1 second
  }

  async start() {
    if (this.isRunning) return;

    this.isRunning = true;
    
    this.priceUpdateInterval = setInterval(() => {
      this.updatePrices();
    }, this.updateIntervalMs);

    console.log('📈 Market data service started');
  }

  async stop() {
    if (!this.isRunning) return;

    this.isRunning = false;
    
    if (this.priceUpdateInterval) {
      clearInterval(this.priceUpdateInterval);
      this.priceUpdateInterval = null;
    }

    console.log('📈 Market data service stopped');
  }

  async updatePrices() {
    try {
      const assets = await Asset.find({ isActive: true });
      const priceUpdates = [];

      for (const asset of assets) {
        const newPrice = this.generateRealisticPrice(asset);
        const priceChange = newPrice - asset.currentPrice;
        const priceChangePercent = (priceChange / asset.currentPrice) * 100;

        asset.currentPrice = newPrice;
        asset.priceChange = priceChange;
        asset.priceChangePercent = priceChangePercent;
        asset.lastUpdated = new Date();
        
        await asset.save();

        // Cache in Redis
        if (this.redis) {
          await this.redis.set(`price:${asset.symbol}`, {
            price: newPrice,
            timestamp: new Date().toISOString()
          }, 60);
        }

        priceUpdates.push({
          symbol: asset.symbol,
          price: newPrice,
          change: priceChange,
          changePercent: priceChangePercent,
          timestamp: asset.lastUpdated
        });
      }

      // Broadcast updates
      this.io.emit('price_update', priceUpdates);

      for (const update of priceUpdates) {
        this.io.to(`prices:${update.symbol}`).emit('asset_price', update);
      }

    } catch (error) {
      console.error('Error updating prices:', error);
    }
  }

  generateRealisticPrice(asset) {
    const currentPrice = asset.currentPrice;
    let volatility;

    switch (asset.category) {
      case 'crypto': volatility = 0.002; break;
      case 'forex': volatility = 0.0005; break;
      case 'stocks': volatility = 0.001; break;
      case 'commodities': volatility = 0.0008; break;
      default: volatility = 0.001;
    }

    const randomChange = (Math.random() - 0.5) * 2 * volatility;
    const newPrice = currentPrice * (1 + randomChange);

    return Math.max(newPrice, currentPrice * 0.95);
  }
}

module.exports = MarketDataService;