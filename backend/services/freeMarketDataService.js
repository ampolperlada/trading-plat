// backend/services/freeMarketDataService.js - Free Real Market Data
const axios = require('axios');
const WebSocket = require('ws');

class FreeMarketDataService {
  constructor() {
    // Multiple free API sources
    this.apis = {
      alphavantage: {
        key: process.env.ALPHA_VANTAGE_API_KEY,
        baseUrl: 'https://www.alphavantage.co/query'
      },
      finnhub: {
        key: process.env.FINNHUB_API_KEY,
        baseUrl: 'https://finnhub.io/api/v1'
      },
      twelvedata: {
        key: process.env.TWELVE_DATA_API_KEY,
        baseUrl: 'https://api.twelvedata.com'
      }
    };

    this.wsConnection = null;
    this.subscribers = new Map();
    this.marketData = new Map();
    
    // Asset mapping for different sources
    this.assetMapping = {
      'EURUSD': { 
        symbol: 'EURUSD', 
        name: 'Euro/US Dollar', 
        type: 'forex',
        alphavantage: 'EUR/USD',
        finnhub: 'OANDA:EUR_USD',
        twelvedata: 'EUR/USD'
      },
      'GBPUSD': { 
        symbol: 'GBPUSD', 
        name: 'British Pound/US Dollar', 
        type: 'forex',
        alphavantage: 'GBP/USD',
        finnhub: 'OANDA:GBP_USD',
        twelvedata: 'GBP/USD'
      },
      'USDJPY': { 
        symbol: 'USDJPY', 
        name: 'US Dollar/Japanese Yen', 
        type: 'forex',
        alphavantage: 'USD/JPY',
        finnhub: 'OANDA:USD_JPY',
        twelvedata: 'USD/JPY'
      },
      'BTCUSD': { 
        symbol: 'BTCUSD', 
        name: 'Bitcoin/US Dollar', 
        type: 'crypto',
        alphavantage: 'BTC',
        finnhub: 'BINANCE:BTCUSDT',
        twelvedata: 'BTC/USD'
      },
      'ETHUSD': { 
        symbol: 'ETHUSD', 
        name: 'Ethereum/US Dollar', 
        type: 'crypto',
        alphavantage: 'ETH',
        finnhub: 'BINANCE:ETHUSDT',
        twelvedata: 'ETH/USD'
      },
      'AAPL': { 
        symbol: 'AAPL', 
        name: 'Apple Inc', 
        type: 'stock',
        alphavantage: 'AAPL',
        finnhub: 'AAPL',
        twelvedata: 'AAPL'
      },
      'TSLA': { 
        symbol: 'TSLA', 
        name: 'Tesla Inc', 
        type: 'stock',
        alphavantage: 'TSLA',
        finnhub: 'TSLA',
        twelvedata: 'TSLA'
      },
      'GOOGL': { 
        symbol: 'GOOGL', 
        name: 'Alphabet Inc', 
        type: 'stock',
        alphavantage: 'GOOGL',
        finnhub: 'GOOGL',
        twelvedata: 'GOOGL'
      },
      'GOLD': { 
        symbol: 'GOLD', 
        name: 'Gold Spot', 
        type: 'commodity',
        alphavantage: 'XAU/USD',
        finnhub: 'OANDA:XAU_USD',
        twelvedata: 'XAUUSD'
      },
      'OIL': { 
        symbol: 'OIL', 
        name: 'Crude Oil WTI', 
        type: 'commodity',
        alphavantage: 'WTI',
        finnhub: 'OANDA:WTICO_USD',
        twelvedata: 'BRENT'
      }
    };

    this.currentApiIndex = 0;
    this.apiSources = ['alphavantage', 'finnhub', 'twelvedata'];
    this.rateLimits = {
      alphavantage: { calls: 0, maxCalls: 5, resetTime: Date.now() + 60000 },
      finnhub: { calls: 0, maxCalls: 60, resetTime: Date.now() + 60000 },
      twelvedata: { calls: 0, maxCalls: 800, resetTime: Date.now() + 60000 }
    };
  }

  // Get next available API source
  getNextApi() {
    const now = Date.now();
    
    for (let i = 0; i < this.apiSources.length; i++) {
      const api = this.apiSources[this.currentApiIndex];
      const limit = this.rateLimits[api];
      
      // Reset rate limit if time passed
      if (now > limit.resetTime) {
        limit.calls = 0;
        limit.resetTime = now + 60000;
      }
      
      // Check if API is available
      if (limit.calls < limit.maxCalls && this.apis[api].key) {
        limit.calls++;
        return api;
      }
      
      // Move to next API
      this.currentApiIndex = (this.currentApiIndex + 1) % this.apiSources.length;
    }
    
    return null; // All APIs exhausted
  }

  // Alpha Vantage implementation
  async fetchAlphaVantageData(symbol) {
    const config = this.assetMapping[symbol];
    if (!config || !this.apis.alphavantage.key) return null;

    try {
      const response = await axios.get(this.apis.alphavantage.baseUrl, {
        params: {
          function: config.type === 'forex' ? 'CURRENCY_EXCHANGE_RATE' : 
                   config.type === 'crypto' ? 'CURRENCY_EXCHANGE_RATE' : 'GLOBAL_QUOTE',
          from_currency: config.type === 'forex' ? config.alphavantage.split('/')[0] : config.alphavantage,
          to_currency: config.type === 'forex' ? config.alphavantage.split('/')[1] : 'USD',
          symbol: config.alphavantage,
          apikey: this.apis.alphavantage.key
        },
        timeout: 5000
      });

      return this.parseAlphaVantageResponse(response.data, symbol);
    } catch (error) {
      console.error(`❌ Alpha Vantage error for ${symbol}:`, error.message);
      return null;
    }
  }

  // Finnhub implementation
  async fetchFinnhubData(symbol) {
    const config = this.assetMapping[symbol];
    if (!config || !this.apis.finnhub.key) return null;

    try {
      const response = await axios.get(`${this.apis.finnhub.baseUrl}/quote`, {
        params: {
          symbol: config.finnhub,
          token: this.apis.finnhub.key
        },
        timeout: 5000
      });

      return this.parseFinnhubResponse(response.data, symbol);
    } catch (error) {
      console.error(`❌ Finnhub error for ${symbol}:`, error.message);
      return null;
    }
  }

  // Twelve Data implementation
  async fetchTwelveDataData(symbol) {
    const config = this.assetMapping[symbol];
    if (!config || !this.apis.twelvedata.key) return null;

    try {
      const response = await axios.get(`${this.apis.twelvedata.baseUrl}/price`, {
        params: {
          symbol: config.twelvedata,
          apikey: this.apis.twelvedata.key
        },
        timeout: 5000
      });

      return this.parseTwelveDataResponse(response.data, symbol);
    } catch (error) {
      console.error(`❌ Twelve Data error for ${symbol}:`, error.message);
      return null;
    }
  }

  // Parse Alpha Vantage response
  parseAlphaVantageResponse(data, symbol) {
    const config = this.assetMapping[symbol];
    let price, change = 0;

    if (config.type === 'forex' && data['Realtime Currency Exchange Rate']) {
      const rate = data['Realtime Currency Exchange Rate'];
      price = parseFloat(rate['5. Exchange Rate']);
    } else if (config.type === 'stock' && data['Global Quote']) {
      const quote = data['Global Quote'];
      price = parseFloat(quote['05. price']);
      change = parseFloat(quote['09. change']);
    } else {
      return null;
    }

    return {
      symbol: symbol,
      name: config.name,
      price: parseFloat(price.toFixed(5)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(((change / (price - change)) * 100).toFixed(2)),
      timestamp: Date.now(),
      type: config.type,
      source: 'alphavantage'
    };
  }

  // Parse Finnhub response
  parseFinnhubResponse(data, symbol) {
    const config = this.assetMapping[symbol];
    
    if (!data.c) return null;

    const price = data.c; // Current price
    const change = data.d || 0; // Change
    const changePercent = data.dp || 0; // Change percent

    return {
      symbol: symbol,
      name: config.name,
      price: parseFloat(price.toFixed(5)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      timestamp: Date.now(),
      type: config.type,
      source: 'finnhub'
    };
  }

  // Parse Twelve Data response
  parseTwelveDataResponse(data, symbol) {
    const config = this.assetMapping[symbol];
    
    if (!data.price) return null;

    const price = parseFloat(data.price);
    
    return {
      symbol: symbol,
      name: config.name,
      price: parseFloat(price.toFixed(5)),
      change: 0, // Twelve Data price endpoint doesn't include change
      changePercent: 0,
      timestamp: Date.now(),
      type: config.type,
      source: 'twelvedata'
    };
  }

  // Get current price with fallback to multiple sources
  async getCurrentPrice(symbol) {
    const attempts = [
      () => this.fetchFinnhubData(symbol),
      () => this.fetchAlphaVantageData(symbol),
      () => this.fetchTwelveDataData(symbol)
    ];

    for (const attempt of attempts) {
      try {
        const result = await attempt();
        if (result) {
          this.marketData.set(symbol, result);
          return result;
        }
      } catch (error) {
        console.error(`❌ API attempt failed:`, error.message);
      }
    }

    // Fallback to mock data if all APIs fail
    console.log(`⚠️ All APIs failed for ${symbol}, using mock data`);
    return this.generateMockPrice(symbol);
  }

  // Get all market data
  async getAllMarketData() {
    const marketData = {};
    const symbols = Object.keys(this.assetMapping);
    
    // Fetch data for all symbols with delays to respect rate limits
    for (let i = 0; i < symbols.length; i++) {
      const symbol = symbols[i];
      try {
        marketData[symbol] = await this.getCurrentPrice(symbol);
        
        // Add delay between requests to avoid rate limiting
        if (i < symbols.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`❌ Error fetching ${symbol}:`, error.message);
        marketData[symbol] = this.generateMockPrice(symbol);
      }
    }
    
    return marketData;
  }

  // Generate mock data fallback
  generateMockPrice(symbol) {
    const config = this.assetMapping[symbol];
    const basePrices = {
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
    };

    const basePrice = basePrices[symbol] || 100;
    const change = (Math.random() - 0.5) * 2;
    const price = basePrice + (basePrice * change / 100);

    return {
      symbol: symbol,
      name: config?.name || symbol,
      price: parseFloat(price.toFixed(5)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(change.toFixed(2)),
      timestamp: Date.now(),
      type: config?.type || 'unknown',
      source: 'mock'
    };
  }

  // WebSocket for real-time updates (using Finnhub WebSocket)
  async initializeWebSocket() {
    if (!this.apis.finnhub.key) {
      console.log('⚠️ No Finnhub API key, skipping WebSocket');
      return;
    }

    try {
      this.wsConnection = new WebSocket(`wss://ws.finnhub.io?token=${this.apis.finnhub.key}`);
      
      this.wsConnection.on('open', () => {
        console.log('✅ Connected to Finnhub WebSocket');
        this.subscribeToRealTimeData();
      });

      this.wsConnection.on('message', (data) => {
        try {
          const parsed = JSON.parse(data);
          this.handleRealTimeData(parsed);
        } catch (error) {
          console.error('❌ WebSocket data parsing error:', error);
        }
      });

      this.wsConnection.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
      });

      this.wsConnection.on('close', () => {
        console.log('🔌 WebSocket disconnected, reconnecting in 5s...');
        setTimeout(() => this.initializeWebSocket(), 5000);
      });

    } catch (error) {
      console.error('❌ Failed to initialize WebSocket:', error);
    }
  }

  // Subscribe to real-time data
  subscribeToRealTimeData() {
    Object.values(this.assetMapping).forEach(config => {
      if (config.finnhub && this.wsConnection.readyState === WebSocket.OPEN) {
        this.wsConnection.send(JSON.stringify({
          type: 'subscribe',
          symbol: config.finnhub
        }));
      }
    });
  }

  // Handle real-time WebSocket data
  handleRealTimeData(data) {
    if (data.type === 'trade' && data.data) {
      data.data.forEach(trade => {
        // Find our symbol from Finnhub symbol
        const symbol = Object.keys(this.assetMapping).find(key => 
          this.assetMapping[key].finnhub === trade.s
        );
        
        if (symbol) {
          const currentData = this.marketData.get(symbol) || this.generateMockPrice(symbol);
          const updatedData = {
            ...currentData,
            price: parseFloat(trade.p.toFixed(5)),
            timestamp: trade.t
          };
          
          this.marketData.set(symbol, updatedData);
          this.notifySubscribers(symbol, updatedData);
        }
      });
    }
  }

  // Subscribe to updates
  subscribe(symbol, callback) {
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, new Set());
    }
    this.subscribers.get(symbol).add(callback);
    
    // Send current data if available
    const currentData = this.marketData.get(symbol);
    if (currentData) {
      callback(currentData);
    }
  }

  // Notify subscribers
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

  // Start the service
  async start() {
    console.log('🚀 Starting Free Market Data Service...');
    
    // Test API keys
    const availableApis = [];
    if (this.apis.alphavantage.key) availableApis.push('Alpha Vantage');
    if (this.apis.finnhub.key) availableApis.push('Finnhub');
    if (this.apis.twelvedata.key) availableApis.push('Twelve Data');
    
    console.log('🔑 Available APIs:', availableApis.join(', ') || 'None (using mock data)');
    
    // Initialize WebSocket for real-time data
    await this.initializeWebSocket();
    
    // Fetch initial data
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
    console.log('🛑 Free Market Data Service stopped');
  }
}

module.exports = FreeMarketDataService;