const fetch = require('node-fetch');
const AssetMapper = require('./AssetMapper');
const { io } = require('../server');

class MarketDataService {
  constructor(io, redisService) {
    this.io = io;
    this.redis = redisService;
    this.priceUpdateInterval = null;
    this.isRunning = false;
    this.updateIntervalMs = 5000; // 5 seconds
  }

  async start() {
    if (this.isRunning) return;

    this.isRunning = true;
    
    this.priceUpdateInterval = setInterval(() => {
      this.fetchRealPrices();
    }, this.updateIntervalMs);

    console.log('📈 Market data service started (real-time)');
  }

  async stop() {
    if (!this.isRunning) return;

    this.isRunning = false;
    
    if (this.priceUpdateInterval) {
      clearInterval(this.priceUpdateInterval);
      this.priceUpdateInterval = null;
    }

    console.log('📉 Market data service stopped');
  }

  async fetchRealPrices() {
    try {
      const coinIds = AssetMapper.getAllCoinGeckoIds().join(',');
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();

      const priceUpdates = [];
      const assetsToUpdate = [];

      Object.keys(data).forEach(coinId => {
        const symbol = AssetMapper.getPlatformSymbol(coinId);
        if (!symbol) return;

        const currentPrice = data[coinId].usd;
        const changePercent = data[coinId].usd_24h_change || 0;

        // Update in DB
        assetsToUpdate.push({
          symbol,
          currentPrice,
          priceChangePercent: changePercent,
          lastUpdated: new Date()
        });

        // Prepare broadcast
        priceUpdates.push({
          symbol,
          price: currentPrice,
          changePercent,
          timestamp: new Date().toISOString()
        });
      });

      // Save to DB
      await Promise.all(
        assetsToUpdate.map(async asset => {
          const existing = await Asset.findOne({ symbol: asset.symbol });
          if (existing) {
            existing.currentPrice = asset.currentPrice;
            existing.priceChangePercent = asset.priceChangePercent;
            existing.lastUpdated = asset.lastUpdated;
            await existing.save();
          }
        })
      );

      // Broadcast updates ONCE per update cycle
      this.io.emit('price_update', priceUpdates);

      // Optional: Room-based broadcasting for scalability
      /*
      priceUpdates.forEach(update => {
        this.io.to(`prices:${update.symbol}`).emit('price_update', update);
      });
      */

    } catch (error) {
      console.error('Error fetching real prices:', error);
      // Fallback to simulation
      this.simulatePrices();
    }
  }

  async simulatePrices() {
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

      priceUpdates.push({
        symbol: asset.symbol,
        price: newPrice,
        change: priceChange,
        changePercent: priceChangePercent,
        timestamp: asset.lastUpdated
      });
    }

    this.io.emit('price_update', priceUpdates);
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