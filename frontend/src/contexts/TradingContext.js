// frontend/src/contexts/TradingContext.js - Trading Context
import { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const TradingContext = createContext();

const tradingReducer = (state, action) => {
  switch (action.type) {
    case 'SET_ASSETS':
      return { ...state, assets: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_SELECTED_ASSET':
      return { ...state, selectedAsset: action.payload };
    case 'SET_TRADE_AMOUNT':
      return { ...state, tradeAmount: action.payload };
    case 'SET_TRADE_DURATION':
      return { ...state, tradeDuration: action.payload };
    case 'SET_TRADES_HISTORY':
      return { ...state, tradesHistory: action.payload };
    case 'SET_ACTIVE_TRADES':
      return { ...state, activeTrades: action.payload };
    case 'ADD_TRADE':
      return { 
        ...state, 
        activeTrades: [action.payload, ...state.activeTrades] 
      };
    default:
      return state;
  }
};

const initialState = {
  assets: [],
  selectedAsset: null,
  tradeAmount: 10,
  tradeDuration: 60, // seconds
  tradesHistory: [],
  activeTrades: [],
  isLoading: false
};

export function TradingProvider({ children }) {
  const [state, dispatch] = useReducer(tradingReducer, initialState);
  const { token, user, updateBalance } = useAuth();

  useEffect(() => {
    if (token) {
      fetchAssets();
      fetchTradesHistory();
      fetchActiveTrades();
    }
  }, [token]);

  const fetchAssets = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/assets`);
      const assets = await response.json();
      dispatch({ type: 'SET_ASSETS', payload: assets });
      
      if (assets.length > 0 && !state.selectedAsset) {
        dispatch({ type: 'SET_SELECTED_ASSET', payload: assets[0] });
      }
    } catch (error) {
      console.error('Failed to fetch assets:', error);
      toast.error('Failed to load trading assets');
    }
  };

  const fetchTradesHistory = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trades/history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      dispatch({ type: 'SET_TRADES_HISTORY', payload: data.trades || [] });
    } catch (error) {
      console.error('Failed to fetch trades history:', error);
    }
  };

  const fetchActiveTrades = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trades/active`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const activeTrades = await response.json();
      dispatch({ type: 'SET_ACTIVE_TRADES', payload: activeTrades || [] });
    } catch (error) {
      console.error('Failed to fetch active trades:', error);
    }
  };

  const placeTrade = async (type) => {
    if (!state.selectedAsset) {
      toast.error('Please select an asset to trade');
      return;
    }

    if (state.tradeAmount > user.balance) {
      toast.error('Insufficient balance for this trade');
      return;
    }

    if (state.tradeAmount < 1) {
      toast.error('Minimum trade amount is $1');
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trades`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          asset: state.selectedAsset.symbol,
          type,
          amount: state.tradeAmount,
          duration: state.tradeDuration
        })
      });

      const trade = await response.json();

      if (!response.ok) {
        throw new Error(trade.error || 'Failed to place trade');
      }

      dispatch({ type: 'ADD_TRADE', payload: trade });
      updateBalance(user.balance - state.tradeAmount);
      
      toast.success(`${type} trade placed on ${state.selectedAsset.name}!`);
      
      // Refresh active trades
      fetchActiveTrades();
    } catch (error) {
      console.error('Trade error:', error);
      toast.error(error.message);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <TradingContext.Provider value={{
      ...state,
      dispatch,
      placeTrade,
      fetchTradesHistory,
      fetchActiveTrades
    }}>
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