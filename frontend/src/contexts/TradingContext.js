// frontend/src/contexts/TradingContext.js
import { createContext, useContext, useReducer } from 'react';
import { useAuth } from './AuthContext';
import { useMarketData } from './MarketDataContext';

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
  const { marketData } = useMarketData();

  // Mock trade execution
  const executeTrade = async (symbol, direction, amount, duration = 60) => {
    if (!user) {
      throw new Error('Please log in to trade');
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      // Get current price from market data
      const currentPrice = marketData[symbol]?.price || Math.random() * 100;
      
      const trade = {
        id: Date.now().toString(),
        symbol,
        direction,
        amount,
        openPrice: currentPrice,
        openTime: Date.now(),
        duration: duration * 1000,
        status: 'active'
      };

      dispatch({ type: 'ADD_ACTIVE_TRADE', payload: trade });

      // Auto-settle after duration
      setTimeout(() => {
        dispatch({ type: 'REMOVE_ACTIVE_TRADE', payload: trade.id });
        
        // Mock win/loss
        const isWin = Math.random() > 0.5;
        console.log(`Trade ${trade.id} ${isWin ? 'WON' : 'LOST'}`);
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