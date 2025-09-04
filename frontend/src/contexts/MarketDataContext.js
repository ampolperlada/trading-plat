// frontend/src/contexts/MarketDataContext.js
import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';

const MarketDataContext = createContext();

// CoinGecko API configuration
const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const UPDATE_INTERVAL = 10000; // 10 seconds

// Asset mapping for CoinGecko API
const ASSET_CONFIG = {
  // Crypto (CoinGecko)
  'BTCUSD': { 
    id: 'bitcoin', 
    type: 'crypto', 
    name: 'Bitcoin', 
    icon: '₿',
    decimals: 2,
    category: 'crypto'
  },
  'ETHUSD': { 
    id: 'ethereum', 
    type: 'crypto', 
    name: 'Ethereum', 
    icon: 'Ξ',
    decimals: 2,
    category: 'crypto'
  },
  'ADAUSD': { 
    id: 'cardano', 
    type: 'crypto', 
    name: 'Cardano', 
    icon: '₳',
    decimals: 4,
    category: 'crypto'
  },
  'SOLUSD': { 
    id: 'solana', 
    type: 'crypto', 
    name: 'Solana', 
    icon: '◎',
    decimals: 2,
    category: 'crypto'
  },
  'DOGEUSD': { 
    id: 'dogecoin', 
    type: 'crypto', 
    name: 'Dogecoin', 
    icon: 'Ð',
    decimals: 4,
    category: 'crypto'
  },
  
  // Forex (Mock data with realistic prices)
  'EURUSD': { 
    type: 'forex', 
    name: 'Euro/US Dollar', 
    icon: '💱',
    basePrice: 1.08501,
    decimals: 5,
    category: 'forex'
  },
  'GBPUSD': { 
    type: 'forex', 
    name: 'British Pound/US Dollar', 
    icon: '💱',
    basePrice: 1.24890,
    decimals: 5,
    category: 'forex'
  },
  'USDJPY': { 
    type: 'forex', 
    name: 'US Dollar/Japanese Yen', 
    icon: '💱',
    basePrice: 150.344,
    decimals: 3,
    category: 'forex'
  },
  'USDCHF': { 
    type: 'forex', 
    name: 'US Dollar/Swiss Franc', 
    icon: '💱',
    basePrice: 0.89234,
    decimals: 5,
    category: 'forex'
  },
  'AUDUSD': { 
    type: 'forex', 
    name: 'Australian Dollar/US Dollar', 
    icon: '💱',
    basePrice: 0.66789,
    decimals: 5,
    category: 'forex'
  },
  
  // Stocks (Mock)
  'AAPL': { 
    type: 'stock', 
    name: 'Apple Inc', 
    icon: '🍎',
    basePrice: 189.47,
    decimals: 2,
    category: 'stocks'
  },
  'TSLA': { 
    type: 'stock', 
    name: 'Tesla Inc', 
    icon: '🚗',
    basePrice: 248.91,
    decimals: 2,
    category: 'stocks'
  },
  'GOOGL': { 
    type: 'stock', 
    name: 'Alphabet Inc', 
    icon: '🔍',
    basePrice: 138.21,
    decimals: 2,
    category: 'stocks'
  },
  'AMZN': { 
    type: 'stock', 
    name: 'Amazon Inc', 
    icon: '📦',
    basePrice: 145.67,
    decimals: 2,
    category: 'stocks'
  },
  'MSFT': { 
    type: 'stock', 
    name: 'Microsoft Corp', 
    icon: '💻',
    basePrice: 378.91,
    decimals: 2,
    category: 'stocks'
  },
  
  // Commodities (Mock)
  'GOLD': { 
    type: 'commodity', 
    name: 'Gold', 
    icon: '🥇',
    basePrice: 2027.40,
    decimals: 2,
    category: 'commodities'
  },
  'SILVER': { 
    type: 'commodity', 
    name: 'Silver', 
    icon: '🥈',
    basePrice: 23.45,
    decimals: 2,
    category: 'commodities'
  },
  'OIL': { 
    type: 'commodity', 
    name: 'Crude Oil', 
    icon: '🛢️',
    basePrice: 85.24,
    decimals: 2,
    category: 'commodities'
  }
};

const marketDataReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'UPDATE_PRICES':
      return { 
        ...state, 
        marketData: { ...state.marketData, ...action.payload },
        lastUpdate: Date.now(),
        error: null,
        isLoading: false
      };
    case 'UPDATE_CHART_DATA':
      return {
        ...state,
        chartData: {
          ...state.chartData,
          [action.payload.symbol]: action.payload.data
        }
      };
    case 'SET_CONNECTION_STATUS':
      return { ...state, isConnected: action.payload };
    default:
      return state;
  }
};

const initialState = {
  marketData: {},
  chartData: {},
  isLoading: true,
  error: null,
  isConnected: false,
  lastUpdate: null
};

export function MarketDataProvider({ children }) {
  const [state, dispatch] = useReducer(marketDataReducer, initialState);

  // Fetch crypto prices from CoinGecko
  const fetchCryptoPrices = useCallback(async () => {
    const cryptoAssets = Object.entries(ASSET_CONFIG).filter(([_, config]) => config.type === 'crypto');
    
    if (cryptoAssets.length === 0) return {};
    
    const ids = cryptoAssets.map(([_, config]) => config.id).join(',');
    
    try {
      const response = await fetch(
        `${COINGECKO_API}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`
      );
      
      if (!response.ok) throw new Error('CoinGecko API request failed');
      
      const data = await response.json();
      const cryptoPrices = {};
      
      cryptoAssets.forEach(([symbol, config]) => {
        const coinData = data[config.id];
        if (coinData) {
          cryptoPrices[symbol] = {
            price: coinData.usd,
            changePercent: coinData.usd_24h_change || 0,
            volume: coinData.usd_24h_vol || 0,
            timestamp: Date.now(),
            type: 'crypto'
          };
        }
      });
      
      return cryptoPrices;
    } catch (error) {
      console.error('Error fetching crypto prices:', error);
      return {};
    }
  }, []);

  // Generate mock data for non-crypto assets
  const generateMockPrices = useCallback((baseData = {}) => {
    const mockPrices = {};
    
    Object.entries(ASSET_CONFIG).forEach(([symbol, config]) => {
      if (config.type !== 'crypto') {
        const previousPrice = baseData[symbol]?.price || config.basePrice;
        const variation = (Math.random() - 0.5) * 0.002; // 0.2% max variation
        const newPrice = previousPrice * (1 + variation);
        const changePercent = ((newPrice - config.basePrice) / config.basePrice) * 100;
        
        mockPrices[symbol] = {
          price: Math.max(0.0001, newPrice),
          changePercent,
          volume: Math.random() * 1000000 + 500000,
          timestamp: Date.now(),
          type: config.type
        };
      }
    });
    
    return mockPrices;
  }, []);

  // Main price update function
  const updatePrices = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const [cryptoPrices, mockPrices] = await Promise.all([
        fetchCryptoPrices(),
        Promise.resolve(generateMockPrices(state.marketData))
      ]);
      
      const allPrices = { ...mockPrices, ...cryptoPrices };
      
      dispatch({ type: 'UPDATE_PRICES', payload: allPrices });
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: true });
      
    } catch (error) {
      console.error('Error updating prices:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: false });
    }
  }, [fetchCryptoPrices, generateMockPrices, state.marketData]);

  // Generate chart data for selected asset
  const generateChartData = useCallback((symbol, timeframe = '1m') => {
    const config = ASSET_CONFIG[symbol];
    if (!config) return;

    const currentPrice = state.marketData[symbol]?.price || config.basePrice || 100;
    const candleCount = 50;
    const data = [];
    let price = currentPrice;

    for (let i = 0; i < candleCount; i++) {
      const variation = (Math.random() - 0.5) * 0.001;
      const open = price;
      const close = price * (1 + variation);
      const high = Math.max(open, close) * (1 + Math.random() * 0.0005);
      const low = Math.min(open, close) * (1 - Math.random() * 0.0005);
      
      data.push({
        timestamp: Date.now() - (candleCount - i) * 60000,
        open,
        high,
        low,
        close,
        volume: Math.random() * 1000000 + 100000
      });
      
      price = close;
    }

    dispatch({
      type: 'UPDATE_CHART_DATA',
      payload: { symbol, data }
    });
  }, [state.marketData]);

  // Initialize and start price updates
  useEffect(() => {
    updatePrices(); // Initial load
    
    const interval = setInterval(updatePrices, UPDATE_INTERVAL);
    
    return () => clearInterval(interval);
  }, [updatePrices]);

  // Helper functions
  const getAssetPrice = (symbol) => {
    return state.marketData[symbol]?.price || ASSET_CONFIG[symbol]?.basePrice || 0;
  };

  const getAssetChange = (symbol) => {
    return state.marketData[symbol]?.changePercent || 0;
  };

  const formatPrice = (symbol, price) => {
    const config = ASSET_CONFIG[symbol];
    if (!config) return price?.toFixed(2) || '0.00';
    
    return price?.toFixed(config.decimals) || '0.00';
  };

  const getAssetConfig = (symbol) => {
    return ASSET_CONFIG[symbol];
  };

  const getAllAssets = () => {
    return Object.entries(ASSET_CONFIG).map(([symbol, config]) => ({
      symbol,
      ...config,
      price: getAssetPrice(symbol),
      changePercent: getAssetChange(symbol),
      volume: state.marketData[symbol]?.volume || 0
    }));
  };

  const getAssetsByCategory = (category) => {
    return getAllAssets().filter(asset => 
      category === 'all' || asset.category === category
    );
  };

  const value = {
    ...state,
    // Data
    marketData: state.marketData,
    chartData: state.chartData,
    
    // Methods
    updatePrices,
    generateChartData,
    getAssetPrice,
    getAssetChange,
    formatPrice,
    getAssetConfig,
    getAllAssets,
    getAssetsByCategory,
    
    // Asset config
    ASSET_CONFIG
  };

  return (
    <MarketDataContext.Provider value={value}>
      {children}
    </MarketDataContext.Provider>
  );
}

export const useMarketData = () => {
  const context = useContext(MarketDataContext);
  if (!context) {
    throw new Error('useMarketData must be used within a MarketDataProvider');
  }
  return context;
};