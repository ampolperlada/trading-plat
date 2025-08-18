// frontend/src/contexts/TradingContext.js - Enhanced Trading with Real API
import { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useMarketData } from './MarketDataContext';
import { toast } from 'react-toastify';

const TradingContext = createContext();

const tradingReducer = (state, action) => {
  switch (action.type) {
    case 'SET_ACTIVE_TRADES':
      return { ...state, activeTrades: action.payload };
    case 'ADD_ACTIVE_TRADE':
      return { ...state, activeTrades: [...state.activeTrades, action.payload] };
    case 'REMOVE_ACTIVE_TRADE':
      return { 
        ...state, 
        activeTrades: state.activeTrades.filter(trade => trade.id !== action.payload) 
      };
    case 'UPDATE_BALANCE':
      return { ...state, balance: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

const initialState = {
  activeTrades: [],
  balance: 0,
  isLoading: false,
  error: null
};

export function TradingProvider({ children }) {
  const [state, dispatch] = useReducer(tradingReducer, initialState);
  const { user, token } = useAuth();
  const { socket, joinUserRoom } = useMarketData();

  // Join user room when authenticated
  useEffect(() => {
    if (user && socket) {
      joinUserRoom(user.id);
    }
  }, [user, socket, joinUserRoom]);

  // Fetch active trades on mount
  useEffect(() => {
    if (user && token) {
      fetchActiveTrades();
    }
  }, [user, token]);

  // Listen for trade settlements
  useEffect(() => {
    if (socket) {
      socket.on('tradeSettled', (data) => {
        handleTradeSettlement(data.trade);
      });

      return () => {
        socket.off('tradeSettled');
      };
    }
  }, [socket]);

  // Execute a trade
  const executeTrade = async (symbol, direction, amount, duration = 60) => {
    if (!user || !token) {
      toast.error('Please log in to trade');
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trades/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          symbol,
          direction,
          amount,
          duration
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to execute trade');
      }

      // Add trade to active trades
      dispatch({ type: 'ADD_ACTIVE_TRADE', payload: data.trade });
      dispatch({ type: 'UPDATE_BALANCE', payload: data.newBalance });

      toast.success(`${direction} trade executed for ${symbol}!`);
      
      return data.trade;

    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error(error.message);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Fetch active trades
  const fetchActiveTrades = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trades/active`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const trades = await response.json();
        dispatch({ type: 'SET_ACTIVE_TRADES', payload: trades });
      }
    } catch (error) {
      console.error('❌ Failed to fetch active trades:', error);
    }
  };

  // Handle trade settlement
  const handleTradeSettlement = (trade) => {
    // Remove from active trades
    dispatch({ type: 'REMOVE_ACTIVE_TRADE', payload: trade.id });

    // Show notification
    if (trade.result === 'win') {
      toast.success(`🎉 Trade Won! Profit: $${trade.profit.toFixed(2)}`);
    } else {
      toast.error(`😞 Trade Lost! Loss: $${Math.abs(trade.profit).toFixed(2)}`);
    }

    // Update balance (if needed - should come from backend)
    if (user) {
      // The backend should handle balance updates
      // This is just for UI consistency
    }
  };

  // Calculate payout for a potential trade
  const calculatePayout = (amount, payoutRate = 0.8) => {
    return amount * payoutRate;
  };

  // Get trade statistics
  const getTradeStats = () => {
    return {
      activeTrades: state.activeTrades.length,
      totalInvestment: state.activeTrades.reduce((sum, trade) => sum + trade.amount, 0)
    };
  };

  const value = {
    ...state,
    executeTrade,
    fetchActiveTrades,
    calculatePayout,
    getTradeStats,
    balance: user?.balance || state.balance
  };

  return (
    <TradingContext.Provider value={value}>
      {children}
    </TradingContext.Provider>
  );
}

export const useTrading = () => {
  const context = useContext(TradingContext);
  if (!context) {
    throw new Error('useTrading must be used within a TradingProvider');
  }
  return context;
};