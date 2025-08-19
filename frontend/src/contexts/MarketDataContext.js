// frontend/src/contexts/MarketDataContext.js - Simple version to start
import { createContext, useContext, useEffect, useState } from 'react';

const MarketDataContext = createContext();

export function useMarketData() {
  const context = useContext(MarketDataContext);
  if (!context) {
    throw new Error('useMarketData must be used within a MarketDataProvider');
  }
  return context;
}

export function MarketDataProvider({ children }) {
  const [marketData, setMarketData] = useState({});
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  // Mock data for now (we'll connect to real API later)
  useEffect(() => {
    const mockData = {
      'EURUSD': { price: 1.08501, change: -0.07, name: 'EUR/USD' },
      'GBPUSD': { price: 1.24890, change: 0.02, name: 'GBP/USD' },
      'USDJPY': { price: 150.344, change: -0.02, name: 'USD/JPY' },
      'BTCUSD': { price: 65980.65, change: -0.18, name: 'Bitcoin/USD' },
      'ETHUSD': { price: 3110.34, change: -0.64, name: 'Ethereum/USD' },
      'AAPL': { price: 156.02, change: -0.87, name: 'Apple Inc' },
      'TSLA': { price: 251.23, change: 0.02, name: 'Tesla Inc' },
      'GOOGL': { price: 143.52, change: 0.15, name: 'Alphabet Inc' },
      'GOLD': { price: 2027.40, change: -0.01, name: 'Gold' },
      'OIL': { price: 85.24, change: 0.01, name: 'Oil' }
    };

    setMarketData(mockData);
    setConnectionStatus('connected');

    // Update prices every 2 seconds
    const interval = setInterval(() => {
      setMarketData(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(symbol => {
          const change = (Math.random() - 0.5) * 0.1;
          updated[symbol] = {
            ...updated[symbol],
            price: parseFloat((updated[symbol].price * (1 + change / 100)).toFixed(5)),
            change: parseFloat(change.toFixed(2))
          };
        });
        return updated;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const fetchHistoricalData = async (symbol, interval = '1m', count = 100) => {
    // Mock historical data
    const data = [];
    const basePrice = marketData[symbol]?.price || 100;
    let currentPrice = basePrice;

    for (let i = count; i >= 0; i--) {
      const timestamp = Date.now() - (i * 60000);
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
        close: parseFloat(close.toFixed(5))
      });

      currentPrice = close;
    }

    return data;
  };

  const value = {
    marketData,
    connectionStatus,
    fetchHistoricalData,
    joinUserRoom: () => {}, // placeholder
    socket: null // placeholder
  };

  return (
    <MarketDataContext.Provider value={value}>
      {children}
    </MarketDataContext.Provider>
  );
}