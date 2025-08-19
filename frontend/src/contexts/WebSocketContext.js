// frontend/src/contexts/WebSocketContext.js
import { createContext, useContext, useEffect, useState } from 'react';

const WebSocketContext = createContext();

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}

export function WebSocketProvider({ children }) {
  const [isConnected, setIsConnected] = useState(false);
  const [prices, setPrices] = useState({});
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Mock WebSocket connection for now
    setIsConnected(true);
    
    // Simulate price updates
    const interval = setInterval(() => {
      const mockPrices = {
        'EURUSD': { 
          price: 1.08501 + (Math.random() - 0.5) * 0.001, 
          changePercent: (Math.random() - 0.5) * 2,
          volume: Math.random() * 1000000
        },
        'GBPUSD': { 
          price: 1.24890 + (Math.random() - 0.5) * 0.001, 
          changePercent: (Math.random() - 0.5) * 2,
          volume: Math.random() * 1000000
        },
        'USDJPY': { 
          price: 150.344 + (Math.random() - 0.5) * 0.1, 
          changePercent: (Math.random() - 0.5) * 2,
          volume: Math.random() * 1000000
        },
        'BTCUSD': { 
          price: 65980.65 + (Math.random() - 0.5) * 100, 
          changePercent: (Math.random() - 0.5) * 5,
          volume: Math.random() * 1000000
        },
        'ETHUSD': { 
          price: 3110.34 + (Math.random() - 0.5) * 50, 
          changePercent: (Math.random() - 0.5) * 5,
          volume: Math.random() * 1000000
        },
        'AAPL': { 
          price: 156.02 + (Math.random() - 0.5) * 2, 
          changePercent: (Math.random() - 0.5) * 3,
          volume: Math.random() * 1000000
        },
        'TSLA': { 
          price: 251.23 + (Math.random() - 0.5) * 5, 
          changePercent: (Math.random() - 0.5) * 4,
          volume: Math.random() * 1000000
        },
        'GOOGL': { 
          price: 143.52 + (Math.random() - 0.5) * 2, 
          changePercent: (Math.random() - 0.5) * 3,
          volume: Math.random() * 1000000
        },
        'GOLD': { 
          price: 2027.40 + (Math.random() - 0.5) * 10, 
          changePercent: (Math.random() - 0.5) * 2,
          volume: Math.random() * 1000000
        },
        'OIL': { 
          price: 85.24 + (Math.random() - 0.5) * 1, 
          changePercent: (Math.random() - 0.5) * 2,
          volume: Math.random() * 1000000
        }
      };
      
      setPrices(mockPrices);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const subscribeToAssets = (assets) => {
    console.log('Subscribing to assets:', assets);
    // Mock subscription
  };

  const value = {
    isConnected,
    prices,
    socket,
    subscribeToAssets
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}