// frontend/src/contexts/TradingContext.js - Simple version to start
import { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';

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
  isLoading: false,
  error: null
};

export function TradingProvider({ children }) {
  const [state, dispatch] = useReducer(tradingReducer, initialState);
  const { user } = useAuth();

  // Mock trade execution for now
  const executeTrade = async (symbol, direction, amount, duration = 60) => {
    if (!user) {
      throw new Error('Please log in to trade');
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      // Mock trade
      const trade = {
        id: Date.now().toString(),
        symbol,
        direction,
        amount,
        openPrice: Math.random() * 100,
        openTime: Date.now(),
        duration: duration * 1000,
        status: 'active'
      };

      dispatch({ type: 'ADD_ACTIVE_TRADE', payload: trade });

      // Auto-settle after duration
      setTimeout(() => {
        dispatch({ type: 'REMOVE_ACTIVE_TRADE', payload: trade.id });
      }, trade.duration);

      return trade;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const calculatePayout = (amount, payoutRate = 0.8) => {
    return amount * payoutRate;
  };

  const getTradeStats = () => {
    return {
      activeTrades: state.activeTrades.length,
      totalInvestment: state.activeTrades.reduce((sum, trade) => sum + trade.amount, 0)
    };
  };

  const value = {
    ...state,
    executeTrade,
    calculatePayout,
    getTradeStats
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