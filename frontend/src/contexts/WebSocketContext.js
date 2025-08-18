// frontend/src/contexts/WebSocketContext.js - WebSocket Context
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';

const WebSocketContext = createContext();

export function WebSocketProvider({ children }) {
  const { token, isAuthenticated, updateBalance } = useAuth();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [prices, setPrices] = useState({});

  useEffect(() => {
    if (isAuthenticated && token) {
      connectSocket();
    } else {
      disconnectSocket();
    }

    return () => disconnectSocket();
  }, [isAuthenticated, token]);

  const connectSocket = () => {
    if (socketRef.current?.connected) return;

    socketRef.current = io(process.env.NEXT_PUBLIC_API_URL, {
      autoConnect: false
    });

    socketRef.current.connect();

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      console.log('🔗 Connected to trading server');
      
      socketRef.current.emit('authenticate', token);
    });

    socketRef.current.on('authenticated', (data) => {
      if (data.success) {
        console.log('✅ Socket authenticated successfully');
      } else {
        console.error('❌ Socket authentication failed:', data.error);
      }
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
      console.log('🔌 Disconnected from trading server');
    });

    socketRef.current.on('priceUpdate', (data) => {
      setPrices(prev => ({
        ...prev,
        [data.symbol]: {
          price: data.price,
          change: data.change,
          changePercent: data.changePercent,
          volume: data.volume,
          timestamp: data.timestamp
        }
      }));
    });

    socketRef.current.on('tradeCreated', (data) => {
      toast.info(`📈 ${data.type} trade placed on ${data.asset}`, {
        autoClose: 2000
      });
    });

    socketRef.current.on('tradeSettled', (data) => {
      const isWin = data.status === 'WON';
      
      toast[isWin ? 'success' : 'error'](
        `${isWin ? '🎉' : '💔'} Trade ${data.status}! ${isWin ? `Profit: $${data.profit.toFixed(2)}` : ''}`,
        { autoClose: 5000 }
      );
      
      updateBalance(data.newBalance);
    });
  };

  const disconnectSocket = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  };

  const subscribeToAssets = (symbols) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('subscribe', symbols);
    }
  };

  const unsubscribeFromAssets = (symbols) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('unsubscribe', symbols);
    }
  };

  return (
    <WebSocketContext.Provider value={{
      isConnected,
      prices,
      subscribeToAssets,
      unsubscribeFromAssets,
      socket: socketRef.current
    }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};