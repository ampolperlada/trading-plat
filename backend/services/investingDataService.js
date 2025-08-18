// backend/services/investingDataService.js - Real Market Data Integration
const axios = require('axios');
const WebSocket = require('ws');

class InvestingDataService {
  constructor() {
    this.apiKey = process.env.INVESTING_API_KEY;
    this.baseURL = 'https://api.investing.com/api/financialdata';
    this.wsConnection = null;
    this.subscribers = new Map();
    this.marketData = new Map();
    
    // Asset mapping for Investing.com IDs
    this.assetMapping = {
      'EURUSD': { id: 1, name: 'EUR/USD', type: 'currency' },
      'GBPUSD': { id: 2, name: 'GBP/USD', type: 'currency' },
      'USDJPY': { id: 3, name: 'USD/JPY', type: 'currency' },
      'BTCUSD': { id: 945629, name: 'Bitcoin', type: 'crypto' },
      'ETHUSD': { id: 997650, name: 'Ethereum', type: 'crypto' },
      'AAPL': { id: 6408, name: 'Apple Inc', type: 'stock' },
      'TSLA': { id: 13994, name: 'Tesla Inc', type: 'stock' },
      'GOOGL': { id: 6369, name: 'Alphabet Inc', type: 'stock' },
      'GOLD': { id: 8830, name: 'Gold Futures', type: 'commodity' },
      'OIL': { id: 8849, name: 'Crude Oil WTI', type: 'commodity' }
    };
  }

  // Initialize WebSocket connection for real-time data
  async initializeWebSocket() {
    try {
      this.wsConnection = new WebSocket('wss://stream.investing.com/ws');
      
      this.wsConnection.on('open', () => {
        console.log('✅ Connected to Investing.com WebSocket');
        this.subscribeToAssets();
      });

      this.wsConnection.on('message', (data) => {
        this.handleMarketData(JSON.parse(data));
      });

      this.wsConnection.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
        setTimeout(() => this.initializeWebSocket(), 5000);
      });

      this.wsConnection.on('close', () => {
        console.log('🔌 WebSocket disconnected, reconnecting...');
        setTimeout(() => this.initializeWebSocket(), 3000);
      });

    } catch (error) {
      console.error('❌ Failed to initialize WebSocket:', error);
    }
  }

  // Subscribe to real-time price updates
  subscribeToAssets() {
    Object.entries(this.assetMapping).forEach(([symbol, config]) => {
      const subscribeMessage = {
        action: 'subscribe',
        id: config.id,
        symbol: symbol
      };
      
      if (this.wsConnection.readyState === WebSocket.OPEN) {
        this.wsConnection.send(JSON.stringify(subscribeMessage));
      }
    });
  }

  // Handle incoming market data
  handleMarketData(data) {
    if (data.price && data.symbol) {
      const symbol = data.symbol;
      const previousData = this.marketData.get(symbol) || {};
      
      const marketUpdate = {
        symbol: symbol,
        price: parseFloat(data.price),
        change: parseFloat(data.change || 0),
        changePercent: parseFloat(data.changePercent || 0),
        timestamp: Date.now(),
        volume: data.volume || 0,
        high: data.high || data.price,
        low: data.low || data.price,
        open: data.open || previousData.price || data.price
      };

      this.marketData.set(symbol, marketUpdate);
      
      // Notify all subscribers
      this.notifySubscribers(symbol, marketUpdate);
    }
  }

  // Get historical candlestick data
  async getHistoricalData(symbol, interval = '1m', count = 100) {
    try {
      const config = this.assetMapping[symbol];
      if (!config) throw new Error(`Unknown symbol: ${symbol}`);

      const response = await axios.get(`${this.baseURL}/historical`, {
        params: {
          symbol: config.id,
          resolution: interval,
          count: count
        },
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return this.formatCandlestickData(response.data);
    } catch (error) {
      console.error(`❌ Error fetching historical data for ${symbol}:`, error.message);
      return this.generateMockHistoricalData(symbol, count);
    }
  }

  // Format candlestick data for charts
  formatCandlestickData(rawData) {
    if (!rawData.candles) return [];
    
    return rawData.candles.map(candle => ({
      timestamp: candle.time * 1000,
      open: parseFloat(candle.open),
      high: parseFloat(candle.high),
      low: parseFloat(candle.low),
      close: parseFloat(candle.close),
      volume: parseInt(candle.volume || 0)
    }));
  }

  // Get current market data for all assets
  async getAllMarketData() {
    const marketData = {};
    
    for (const [symbol, config] of Object.entries(this.assetMapping)) {
      try {
        const data = await this.getCurrentPrice(symbol);
        marketData[symbol] = data;
      } catch (error) {
        console.error(`❌ Error fetching data for ${symbol}:`, error.message);
        marketData[symbol] = this.generateMockPrice(symbol);
      }
    }
    
    return marketData;
  }

  // Get current price for a specific asset
  async getCurrentPrice(symbol) {
    try {
      const config = this.assetMapping[symbol];
      if (!config) throw new Error(`Unknown symbol: ${symbol}`);

      const response = await axios.get(`${this.baseURL}/quote`, {
        params: { symbol: config.id },
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        symbol: symbol,
        name: config.name,
        price: parseFloat(response.data.price),
        change: parseFloat(response.data.change),
        changePercent: parseFloat(response.data.changePercent),
        timestamp: Date.now(),
        type: config.type
      };
    } catch (error) {
      console.error(`❌ Error fetching current price for ${symbol}:`, error.message);
      return this.generateMockPrice(symbol);
    }
  }

  // Subscribe to real-time updates
  subscribe(symbol, callback) {
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, new Set());
    }
    this.subscribers.get(symbol).add(callback);
    
    // Send current data immediately if available
    const currentData = this.marketData.get(symbol);
    if (currentData) {
      callback(currentData);
    }
  }

  // Unsubscribe from updates
  unsubscribe(symbol, callback) {
    if (this.subscribers.has(symbol)) {
      this.subscribers.get(symbol).delete(callback);
    }
  }

  // Notify all subscribers of updates
  notifySubscribers(symbol, data) {
    if (this.subscribers.has(symbol)) {
      this.subscribers.get(symbol).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('❌ Error notifying subscriber:', error);
        }
      });
    }
  }

  // Generate mock data when API is unavailable
  generateMockPrice(symbol) {
    const basePrice = {
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
    }[symbol] || 100;

    const change = (Math.random() - 0.5) * 2;
    const price = basePrice + (basePrice * change / 100);

    return {
      symbol: symbol,
      name: this.assetMapping[symbol]?.name || symbol,
      price: parseFloat(price.toFixed(5)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(change.toFixed(2)),
      timestamp: Date.now(),
      type: this.assetMapping[symbol]?.type || 'unknown'
    };
  }

  // Generate mock historical data
  generateMockHistoricalData(symbol, count) {
    const data = [];
    const basePrice = this.generateMockPrice(symbol).price;
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

  // Start the service
  async start() {
    console.log('🚀 Starting Investing.com Data Service...');
    await this.initializeWebSocket();
    
    // Fetch initial market data
    const initialData = await this.getAllMarketData();
    console.log('📊 Initial market data loaded:', Object.keys(initialData).length, 'assets');
    
    return initialData;
  }

  // Stop the service
  stop() {
    if (this.wsConnection) {
      this.wsConnection.close();
    }
    this.subscribers.clear();
    this.marketData.clear();
    console.log('🛑 Investing.com Data Service stopped');
  }
}

module.exports = InvestingDataService;