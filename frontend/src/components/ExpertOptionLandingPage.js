import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { 
  Menu, 
  X, 
  Play, 
  Download,
  Smartphone,
  Monitor,
  Globe,
  Shield,
  Award,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  CreditCard,
  CheckCircle,
  Activity,
  BarChart3
} from 'lucide-react';
import apiService from '../services/api';

// Custom styles for animations
const floatingAnimation = `
@keyframes bounce-slow {
  0%, 100% { transform: translateY(0px) rotate(3deg); }
  50% { transform: translateY(-10px) rotate(3deg); }
}
.animate-bounce-slow {
  animation: bounce-slow 3s ease-in-out infinite;
}
`;

const additionalStyles = `
.animate-float {
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

.gradient-text {
  background: linear-gradient(45deg, #3b82f6, #06b6d4, #8b5cf6);
  background-size: 300% 300%;
  animation: gradient-shift 3s ease infinite;
}

@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
`;

const animations = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes bounce-subtle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }
.animate-slideIn { animation: slideIn 0.5s ease-out forwards; }
.animate-bounce-subtle { animation: bounce-subtle 2s ease-in-out infinite; }
`;

// Trading Dashboard Component
const TradingDashboard = () => {
  const [selectedAsset, setSelectedAsset] = useState('EUR/USD');
  const [selectedAmount, setSelectedAmount] = useState(10);
  const [selectedTime, setSelectedTime] = useState(60);
  const [user, setUser] = useState({ 
    name: 'Demo User', 
    balance: 10000,
    email: 'demo@trading.com'
  });
  const [activeTrades, setActiveTrades] = useState([]);
  const [marketData, setMarketData] = useState({});
  const [isConnected, setIsConnected] = useState(true);
  const [socket, setSocket] = useState(null);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });
  const [tradingMode, setTradingMode] = useState('binary'); // binary, forex, crypto
  const [leverage, setLeverage] = useState(1);
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [marketNews, setMarketNews] = useState([]);

  const assets = {
    'EUR/USD': { name: 'Euro / US Dollar', price: 1.08945, change: 0.12, category: 'forex', icon: '💱' },
    'GBP/USD': { name: 'British Pound / US Dollar', price: 1.24567, change: -0.08, category: 'forex', icon: '💱' },
    'USD/JPY': { name: 'US Dollar / Japanese Yen', price: 149.832, change: 0.34, category: 'forex', icon: '💱' },
    'BTC/USD': { name: 'Bitcoin', price: 65234.56, change: 2.45, category: 'crypto', icon: '₿' },
    'ETH/USD': { name: 'Ethereum', price: 3142.89, change: 1.87, category: 'crypto', icon: 'Ξ' },
    'AAPL': { name: 'Apple Inc', price: 189.47, change: 0.89, category: 'stocks', icon: '🍎' },
    'TSLA': { name: 'Tesla Inc', price: 248.91, change: -1.23, category: 'stocks', icon: '🚗' },
  };

  const categories = [
    { id: 'all', name: 'All', icon: '🌐' },
    { id: 'forex', name: 'Forex', icon: '💱' },
    { id: 'crypto', name: 'Crypto', icon: '₿' },
    { id: 'stocks', name: 'Stocks', icon: '📈' }
  ];

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    newSocket.on('connect', () => {
      console.log('🟢 Connected to WebSocket server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('🔴 Disconnected from WebSocket server');
      setIsConnected(false);
    });

    newSocket.on('price_update', (data) => {
      if (Array.isArray(data)) {
        setMarketData(prevData => {
          const updatedData = { ...prevData };
          data.forEach(update => {
            if (assets[update.symbol]) {
              updatedData[update.symbol] = {
                ...assets[update.symbol],
                price: update.price,
                change: update.changePercent || update.change,
                timestamp: update.timestamp
              };
            }
          });
          return updatedData;
        });
      }
    });

    newSocket.on('trade_result', (closedTradeData) => {
      console.log("Received trade result:", closedTradeData);
      setActiveTrades(prev => prev.filter(t => t.id !== closedTradeData._id));
      if (closedTradeData.result === 'win') {
        setUser(prev => ({ ...prev, balance: prev.balance + closedTradeData.profit }));
      }
      setTradeHistory(prev => [closedTradeData, ...prev]);
    });

    setSocket(newSocket);
    return () => {
      console.log("🧹 Cleaning up WebSocket connection...");
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/trades/history', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const historyData = await response.json();
        if (response.ok) {
          setTradeHistory(historyData);
        } else {
          console.error("Failed to fetch history:", historyData.error);
        }
      } catch (err) {
        console.error("Error fetching trade history:", err);
      }
    };

    if (localStorage.getItem('token')) {
      fetchHistory();
    }
  }, []);

  const formatPrice = (symbol, price) => {
    if (!price) return '0.00000';
    if (symbol.includes('JPY')) return price.toFixed(3);
    if (symbol.includes('BTC') || symbol.includes('ETH')) return price.toFixed(2);
    return price.toFixed(5);
  };

  const placeTrade = async (direction) => {
    const currentPrice = marketData[selectedAsset]?.price;
    if (!currentPrice || user.balance < selectedAmount || !socket) return;

    try {
      const response = await fetch('http://localhost:5000/api/trades/place', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          asset: selectedAsset,
          direction: direction,
          amount: selectedAmount,
          expiryTimeSeconds: selectedTime,
          leverage: tradingMode === 'forex' ? leverage : undefined,
          stopLoss: tradingMode === 'forex' ? stopLoss : undefined,
          takeProfit: tradingMode === 'forex' ? takeProfit : undefined
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to place trade');
      }

      console.log("✅ Trade placed successfully:", data.trade);
      
      const newTrade = {
        id: data.trade._id,
        asset: data.trade.asset,
        direction: data.trade.direction,
        amount: data.trade.amount,
        entryPrice: data.trade.entryPrice,
        timestamp: new Date(data.trade.createdAt).getTime(),
        expiryTime: new Date(data.trade.expiryTime).getTime(),
        status: 'active',
        leverage: data.trade.leverage,
        stopLoss: data.trade.stopLoss,
        takeProfit: data.trade.takeProfit
      };
      setActiveTrades(prev => [...prev, newTrade]);
      setUser(prev => ({ ...prev, balance: prev.balance - selectedAmount }));
    } catch (error) {
      console.error("❌ Error placing trade:", error);
      alert(`Failed to place trade: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      {/* Trading Dashboard Header */}
      <header className="bg-slate-800 border-b border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">EO</span>
              </div>
              <span className="text-2xl font-bold">ExpertOption</span>
            </div>
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse"></div>
              ) : (
                <div className="w-2 h-2 bg-rose-600 rounded-full"></div>
              )}
              <span className={`text-sm ${isConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isConnected ? 'Live' : 'Offline'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="bg-slate-700 rounded-lg p-6">
              <div className="text-center">
                <div className="text-slate-300 text-sm">Balance</div>
                <div className="text-emerald-400 font-bold text-lg">
                  ${user.balance.toFixed(2)}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-slate-100 text-sm">{user.name.charAt(0)}</span>
              </div>
              <span className="text-slate-100">{user.name}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Panel - Assets */}
        <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col">
          <div className="p-6 border-b border-slate-700">
            <div className="grid grid-cols-4 gap-6">
              {categories.map(category => (
                <button
                  key={category.id}
                  className="p-2 rounded-lg text-sm bg-slate-700 text-slate-300 hover:bg-slate-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                >
                  <div className="text-center">
                    <div className="text-sm mb-1">{category.icon}</div>
                    <div>{category.name}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {Object.entries(assets).map(([symbol, asset]) => {
              const data = marketData[symbol] || asset;
              const isSelected = selectedAsset === symbol;
              
              return (
                <button
                  key={symbol}
                  onClick={() => setSelectedAsset(symbol)}
                  className={`w-full p-6 text-left hover:bg-slate-700 transition-all duration-200 border-l-4 ${
                    isSelected ? 'bg-slate-700 border-blue-500' : 'border-transparent'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{asset.icon}</span>
                      <div>
                        <div className="font-bold text-base">{symbol}</div>
                        <div className="text-sm text-slate-300">{asset.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-base font-semibold">
                        {formatPrice(symbol, data.price)}
                      </div>
                      <div className={`text-xs font-bold ${
                        data.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {data.change >= 0 ? '+' : ''}{data.change.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center Panel - Chart */}
        <div className="flex-1 flex flex-col">
          <div className="bg-slate-800 p-4 border-b border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">{selectedAsset}</h2>
                <p className="text-slate-300 text-sm">{assets[selectedAsset]?.name}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-mono font-bold animate-pulse">
                  {formatPrice(selectedAsset, marketData[selectedAsset]?.price)}
                </div>
                <div className={`text-lg font-semibold ${
                  (marketData[selectedAsset]?.change || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {(marketData[selectedAsset]?.change || 0) >= 0 ? '↗' : '↘'} 
                  {(marketData[selectedAsset]?.change || 0).toFixed(2)}%
                </div>
              </div>
            </div>
            
            {/* Trading Mode Selector */}
            <div className="flex space-x-2">
              {['binary', 'forex', 'crypto'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setTradingMode(mode)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                    tradingMode === mode 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {mode.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex-1 grid grid-cols-3 gap-4 p-4">
            {/* Main Chart */}
            <div className="col-span-2 bg-slate-800 rounded-xl p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Price Chart</h3>
                <div className="flex space-x-2">
                  {['1m', '5m', '15m', '1h', '4h', '1d'].map(interval => (
                    <button key={interval} className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs transition-all">
                      {interval}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-64 bg-slate-900 rounded-lg flex items-center justify-center relative overflow-hidden">
                {/* Simulated Chart Lines */}
                <svg className="absolute inset-0 w-full h-full">
                  <defs>
                    <linearGradient id="priceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3"/>
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  <path 
                    d="M 0 150 Q 50 120, 100 140 T 200 130 T 300 110 T 400 125"
                    stroke="#3b82f6" 
                    strokeWidth="2" 
                    fill="none"
                    className="animate-pulse"
                  />
                  <path 
                    d="M 0 150 Q 50 120, 100 140 T 200 130 T 300 110 T 400 125 L 400 250 L 0 250 Z"
                    fill="url(#priceGradient)"
                  />
                </svg>
                <div className="text-center z-10">
                  <Activity className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-slate-300 text-sm">Live Price Data</p>
                </div>
              </div>
            </div>

            {/* Order Book & Market Depth */}
            <div className="bg-slate-800 rounded-xl p-4">
              <h3 className="text-lg font-semibold mb-4">Order Book</h3>
              <div className="space-y-2">
                <div className="text-xs text-slate-400 grid grid-cols-3 gap-2">
                  <span>Price</span>
                  <span>Size</span>
                  <span>Total</span>
                </div>
                {/* Mock order book data */}
                {Array.from({length: 8}).map((_, i) => (
                  <div key={i} className="text-xs grid grid-cols-3 gap-2">
                    <span className="text-rose-400">{(1.08945 + i * 0.0001).toFixed(5)}</span>
                    <span className="text-slate-300">{(Math.random() * 100).toFixed(1)}</span>
                    <span className="text-slate-400">{(Math.random() * 1000).toFixed(0)}</span>
                  </div>
                ))}
                <div className="border-t border-slate-700 pt-2">
                  <div className="text-center text-lg font-mono font-bold text-blue-400">
                    {formatPrice(selectedAsset, marketData[selectedAsset]?.price)}
                  </div>
                </div>
                {Array.from({length: 8}).map((_, i) => (
                  <div key={i} className="text-xs grid grid-cols-3 gap-2">
                    <span className="text-emerald-400">{(1.08945 - i * 0.0001).toFixed(5)}</span>
                    <span className="text-slate-300">{(Math.random() * 100).toFixed(1)}</span>
                    <span className="text-slate-400">{(Math.random() * 1000).toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Trading */}
        <div className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Trade Panel</h2>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-slate-400">Live</span>
              </div>
            </div>
            
            {/* Trading Mode Specific Controls */}
            {tradingMode === 'forex' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-slate-300 text-sm mb-2">Leverage</label>
                  <select 
                    value={leverage}
                    onChange={(e) => setLeverage(Number(e.target.value))}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                  >
                    <option value={1}>1:1</option>
                    <option value={10}>1:10</option>
                    <option value={50}>1:50</option>
                    <option value={100}>1:100</option>
                    <option value={500}>1:500</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 text-sm mb-2">Stop Loss</label>
                    <input
                      type="number"
                      value={stopLoss}
                      onChange={(e) => setStopLoss(e.target.value)}
                      className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                      placeholder="0.00000"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-sm mb-2">Take Profit</label>
                    <input
                      type="number"
                      value={takeProfit}
                      onChange={(e) => setTakeProfit(e.target.value)}
                      className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                      placeholder="0.00000"
                    />
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-slate-300 text-sm mb-2">Investment Amount</label>
              <div className="relative">
                <input
                  type="number"
                  value={selectedAmount}
                  onChange={(e) => setSelectedAmount(Number(e.target.value))}
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-center font-mono text-lg pr-12"
                  min="1"
                  max={user.balance}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400">USD</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3">
                {[10, 25, 50, 100, 250, 500].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setSelectedAmount(amount)}
                    disabled={user.balance < amount}
                    className={`p-2 text-sm rounded font-medium transition-all duration-200 ${
                      selectedAmount === amount 
                        ? 'bg-blue-600 text-white transform scale-105' 
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    } disabled:opacity-50`}
                  >
                    ${amount}
                  </button>
                ))}
              </div>
            </div>

            {tradingMode === 'binary' && (
              <div>
                <label className="block text-slate-300 text-sm mb-2">Expiry Time</label>
                <div className="grid grid-cols-5 gap-1">
                  {[
                    { value: 60, label: '1m' },
                    { value: 300, label: '5m' },
                    { value: 900, label: '15m' },
                    { value: 1800, label: '30m' },
                    { value: 3600, label: '1h' }
                  ].map(interval => (
                    <button
                      key={interval.value}
                      onClick={() => setSelectedTime(interval.value)}
                      className={`p-2 text-sm rounded font-medium transition-all duration-200 ${
                        selectedTime === interval.value
                          ? 'bg-blue-600 text-white transform scale-105'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {interval.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Market Sentiment Indicator */}
            <div className="bg-slate-700 rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-300 text-sm">Market Sentiment</span>
                <span className="text-emerald-400 text-sm font-bold">68% Bullish</span>
              </div>
              <div className="w-full bg-slate-600 rounded-full h-2">
                <div className="bg-gradient-to-r from-rose-500 to-emerald-500 h-2 rounded-full" style={{width: '68%'}}></div>
              </div>
            </div>

            {/* Current Price Display */}
            <div className="bg-slate-700 rounded-lg p-4 text-center">
              <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Current Price</div>
              <div className="text-2xl font-mono font-bold text-blue-400 animate-pulse">
                {formatPrice(selectedAsset, marketData[selectedAsset]?.price)}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Spread: 0.1 pips | Swap: -0.5
              </div>
            </div>

            {/* Trading Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => placeTrade('PUT')}
                disabled={user.balance < selectedAmount}
                className="bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white p-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 flex flex-col items-center space-y-2 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-1000"></div>
                <TrendingDown className="w-6 h-6" />
                <span className="text-lg font-bold">SELL</span>
                <span className="text-xs opacity-75">Lower</span>
              </button>
              
              <button
                onClick={() => placeTrade('CALL')}
                disabled={user.balance < selectedAmount}
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white p-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 flex flex-col items-center space-y-2 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-1000"></div>
                <TrendingUp className="w-6 h-6" />
                <span className="text-lg font-bold">BUY</span>
                <span className="text-xs opacity-75">Higher</span>
              </button>
            </div>

            {/* Trade Summary */}
            <div className="bg-slate-700 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Potential Payout:</span>
                <span className="text-emerald-400 font-semibold">
                  {tradingMode === 'binary' ? '85%' : `1:${leverage}`}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Potential Profit:</span>
                <span className="text-emerald-400 font-semibold">
                  +${tradingMode === 'binary' ? (selectedAmount * 0.85).toFixed(2) : (selectedAmount * leverage * 0.1).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Risk Amount:</span>
                <span className="text-rose-400 font-semibold">-${selectedAmount.toFixed(2)}</span>
              </div>
              {tradingMode === 'forex' && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Margin Required:</span>
                  <span className="text-blue-400 font-semibold">${(selectedAmount / leverage).toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Economic Calendar & News */}
          <div className="border-t border-slate-700 p-4 max-h-96 overflow-y-auto">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
                  Economic Calendar
                </h3>
                <div className="space-y-2">
                  {[
                    { time: '14:30', event: 'USD Non-Farm Payrolls', impact: 'high' },
                    { time: '16:00', event: 'EUR ECB Rate Decision', impact: 'medium' },
                    { time: '18:00', event: 'GBP BOE Minutes', impact: 'low' }
                  ].map((event, i) => (
                    <div key={i} className="bg-slate-700 rounded p-3 hover:bg-slate-600 transition-all cursor-pointer">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm font-medium">{event.event}</div>
                          <div className="text-xs text-slate-400">{event.time} GMT</div>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${
                          event.impact === 'high' ? 'bg-rose-500' :
                          event.impact === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Landing Page Component
const ExpertOptionLandingPage = ({ onStartTrading }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showTradingDashboard, setShowTradingDashboard] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      let result;
      
      if (authMode === 'login') {
        result = await apiService.login(loginForm.email, loginForm.password);
      } else {
        if (registerForm.password !== registerForm.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        
        result = await apiService.register({
          firstName: registerForm.firstName,
          lastName: registerForm.lastName,
          email: registerForm.email,
          password: registerForm.password
        });
      }

      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      
      setShowTradingDashboard(true);
      setShowAuthModal(false);
      
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = () => {
    setShowAuthModal(true);
    setAuthMode('register');
  };

  const handleNavigation = () => {
    setShowAuthModal(true);
    setAuthMode('login');
  };

  const handleBackToLanding = () => {
    setShowTradingDashboard(false);
  };

  const AuthModal = () => (
    showAuthModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md mx-4 border border-slate-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              {authMode === 'login' ? 'Login' : 'Create Account'}
            </h2>
            <button
              onClick={() => setShowAuthModal(false)}
              className="text-slate-300 hover:text-white text-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
            >
              ×
            </button>
          </div>

          {authError && (
            <div className="bg-rose-600/10 border border-rose-600 rounded-lg p-6 mb-6">
              <p className="text-rose-400 text-sm">{authError}</p>
            </div>
          )}

          <div className="space-y-6">
            {authMode === 'register' && (
              <>
                <div className="grid grid-cols-2 gap-6">
                  <input
                    type="text"
                    placeholder="First Name"
                    value={registerForm.firstName}
                    onChange={(e) => setRegisterForm({...registerForm, firstName: e.target.value})}
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={registerForm.lastName}
                    onChange={(e) => setRegisterForm({...registerForm, lastName: e.target.value})}
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                    required
                  />
                </div>
              </>
            )}

            <input
              type="email"
              placeholder="Email Address"
              value={authMode === 'login' ? loginForm.email : registerForm.email}
              onChange={(e) => {
                if (authMode === 'login') {
                  setLoginForm({...loginForm, email: e.target.value});
                } else {
                  setRegisterForm({...registerForm, email: e.target.value});
                }
              }}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={authMode === 'login' ? loginForm.password : registerForm.password}
              onChange={(e) => {
                if (authMode === 'login') {
                  setLoginForm({...loginForm, password: e.target.value});
                } else {
                  setRegisterForm({...registerForm, password: e.target.value});
                }
              }}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
              required
            />

            {authMode === 'register' && (
              <input
                type="password"
                placeholder="Confirm Password"
                value={registerForm.confirmPassword}
                onChange={(e) => setRegisterForm({...registerForm, confirmPassword: e.target.value})}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                required
              />
            )}

            <button
              type="submit"
              disabled={authLoading}
              onClick={handleAuth}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
            >
              {authLoading ? 'Please wait...' : (authMode === 'login' ? 'Login' : 'Create Account')}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              {authMode === 'login' ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'register' : 'login');
                  setAuthError('');
                }}
                className="text-blue-400 hover:text-blue-300 ml-1 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
              >
                {authMode === 'login' ? 'Sign up' : 'Login'}
              </button>
            </p>
          </div>

          {authMode === 'login' && (
            <div className="mt-6 p-6 bg-slate-700/50 rounded-lg">
              <p className="text-xs text-slate-400 text-center">
                Demo Account: demo@trading.com / demo123
              </p>
            </div>
          )}
        </div>
      </div>
    )
  );

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-base">Loading...</div>
      </div>
    );
  }

  if (showTradingDashboard) {
    return (
      <div>
        <div className="absolute top-4 left-4 z-50">
          <button
            onClick={handleBackToLanding}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
          >
            ← Back to Landing
          </button>
        </div>
        <TradingDashboard />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl animate-bounce"></div>
      </div>
      
      <style>{floatingAnimation}</style>
      <style>{additionalStyles}</style>
      <style>{animations}</style>

      <header className="bg-slate-900/98 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <nav className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded flex items-center justify-center animate-pulse">
                  <span className="text-white text-xs font-bold">EO</span>
                </div>
                <span className="text-white text-lg font-bold">ExpertOption</span>
              </div>
              
              <nav className="hidden md:flex items-center space-x-6">
                <a href="#" className="text-slate-300 hover:text-blue-400 text-sm transition-all duration-300 hover:scale-105">Trading</a>
                <a href="#" className="text-slate-300 hover:text-blue-400 text-sm transition-all duration-300 hover:scale-105">Education</a>
                <a href="#" className="text-slate-300 hover:text-blue-400 text-sm transition-all duration-300 hover:scale-105">Markets</a>
                <a href="#" className="text-slate-300 hover:text-blue-400 text-sm transition-all duration-300 hover:scale-105">Analytics</a>
                <a href="#" className="text-slate-300 hover:text-blue-400 text-sm transition-all duration-300 hover:scale-105">Company</a>
                <a href="#" className="text-slate-300 hover:text-blue-400 text-sm transition-all duration-300 hover:scale-105">Support</a>
                <a href="#" className="text-slate-300 hover:text-blue-400 text-sm transition-all duration-300 hover:scale-105">Blog</a>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-sm animate-pulse"></div>
                <span className="text-slate-400 text-xs">Online chat</span>
              </div>
              <button 
                onClick={handleNavigation}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
              >
                Trade Now
              </button>
            </div>
          </div>
        </nav>
      </header>

      <section className="bg-gradient-to-b from-slate-900/80 to-slate-800/80 py-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                  <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent animate-pulse">Investing</span> Is<br />
                  <span className="animate-fadeIn">Even Better Now</span>
                </h1>
                <p className="text-slate-400 text-base max-w-md">
                  Providing you with the opportunity to invest in more than 100 assets for continuous income
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gradient-to-br from-blue-900/30 to-slate-900/50 rounded-lg p-3 border border-blue-800/30 backdrop-blur-sm hover:from-blue-800/40 hover:to-slate-800/60 transition-all duration-300 animate-fadeIn">
                  <div className="text-blue-300 font-bold">70M+</div>
                  <div className="text-slate-400">Active traders</div>
                </div>
                <div className="bg-gradient-to-br from-blue-900/30 to-slate-900/50 rounded-lg p-3 border border-blue-800/30 backdrop-blur-sm hover:from-blue-800/40 hover:to-slate-800/60 transition-all duration-300 animate-fadeIn delay-100">
                  <div className="text-blue-300 font-bold">100+</div>
                  <div className="text-slate-400">Trading assets</div>
                </div>
                <div className="bg-gradient-to-br from-blue-900/30 to-slate-900/50 rounded-lg p-3 border border-blue-800/30 backdrop-blur-sm hover:from-blue-800/40 hover:to-slate-800/60 transition-all duration-300 animate-fadeIn delay-200">
                  <div className="text-blue-300 font-bold">$1</div>
                  <div className="text-slate-400">Min investment</div>
                </div>
                <div className="bg-gradient-to-br from-blue-900/30 to-slate-900/50 rounded-lg p-3 border border-blue-800/30 backdrop-blur-sm hover:from-blue-800/40 hover:to-slate-800/60 transition-all duration-300 animate-fadeIn delay-300">
                  <div className="text-blue-300 font-bold">95%</div>
                  <div className="text-slate-400">Max payout</div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button 
                  onClick={handleNavigation}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25 animate-bounce-subtle flex items-center space-x-2"
                >
                  <span>Trade Now</span>
                  <Play className="w-4 h-4" />
                </button>
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-1">
                    {['f', 'tw', 'ig', 'yt', 'tg'].map((social, i) => (
                      <div key={i} className="w-6 h-6 bg-slate-700 rounded-full border border-slate-600 flex items-center justify-center">
                        <span className="text-white text-xs">{social}</span>
                      </div>
                    ))}
                  </div>
                  <span className="text-slate-400 text-sm">Follow us</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="w-64 h-[480px] mx-auto bg-slate-800 rounded-3xl border border-slate-700 p-4">
                <div className="h-full bg-slate-900 rounded-2xl p-3 space-y-3">
                  <div className="flex justify-between items-center text-white text-xs">
                    <span>9:41</span>
                    <div className="flex space-x-1">
                      <div className="w-3 h-1 bg-white rounded"></div>
                      <div className="w-1 h-1 bg-white/50 rounded"></div>
                    </div>
                  </div>
                  {['Stocks', 'Indices', 'Metals', 'Commodities', 'ETF'].map((item, i) => (
                    <div key={i} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg p-3 text-center transition-all duration-300 shadow-sm transform hover:scale-105 animate-slideIn" style={{animationDelay: `${i * 100}ms`}}>
                      <span className="text-white text-sm font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-slate-800/50 to-slate-900/50 py-8 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-white text-center mb-6">For All Devices</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Smartphone, name: 'Android', desc: '4.4+' },
              { icon: Smartphone, name: 'iOS', desc: '9.0+' },
              { icon: Monitor, name: 'Windows', desc: '7+' },
              { icon: Monitor, name: 'MacOS', desc: 'Safari' }
            ].map((platform, i) => (
              <div key={i} className="bg-gradient-to-br from-blue-900/20 to-slate-900/40 rounded-lg p-4 text-center group hover:from-blue-800/30 hover:to-slate-800/50 transition-all duration-300 border border-blue-800/20 backdrop-blur-sm transform hover:scale-105 hover:-translate-y-1">
                <platform.icon className="w-8 h-8 text-blue-400 mx-auto mb-2 group-hover:text-blue-300 transition-colors group-hover:scale-110 duration-300" />
                <h3 className="text-slate-200 font-medium text-sm">{platform.name}</h3>
                <p className="text-slate-400 text-xs">{platform.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-slate-900/80 to-slate-800/80 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-white text-center mb-12">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Download,
                title: 'Deposit',
                desc: 'Open a real account and add funds. We work with more than 20 payment systems.'
              },
              {
                icon: TrendingUp,
                title: 'Trade',
                desc: 'Trade any of 100 assets and stocks. Use technical analysis and trade the news.'
              },
              {
                icon: DollarSign,
                title: 'Withdraw',
                desc: 'Get funds easily to your bank card or e-wallet. We take no commission.'
              }
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-3">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-slate-800/50 to-slate-900/50 py-12 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Trusted</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto mb-6">
              ExpertOption is trusted by traders from around the world and are trusted by more than 70,000,000 clients.
            </p>
            
            <button 
              onClick={handleNavigation}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
            >
              Start trading
            </button>

            <div className="bg-slate-700/50 rounded-lg p-6 max-w-sm mx-auto mt-6">
              <div className="flex items-center space-x-3">
                <Award className="w-8 h-8 text-blue-600 flex-shrink-0" />
                <div className="text-left">
                  <div className="text-white font-medium text-base">Best Trading Platform</div>
                  <div className="text-slate-400 text-sm">Award winner at China Foreign Expo</div>
                  <div className="text-slate-400 text-sm">ShowChina 6/7 May 2017</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-slate-900/80 to-slate-800/80 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Globe className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Global Trading Platform</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { value: '$1', label: 'Min Deposit' },
              { value: '$1', label: 'Min Trade' },
              { value: '0%', label: 'Commission' },
              { value: '95%', label: 'Max Payout' }
            ].map((stat, i) => (
              <div key={i} className="bg-gradient-to-br from-blue-900/20 to-slate-900/30 rounded-lg p-4 border border-blue-800/20 backdrop-blur-sm hover:from-blue-800/30 hover:to-slate-800/40 transition-all duration-300 transform hover:scale-105 animate-pulse" style={{animationDelay: `${i * 200}ms`}}>
                <div className="text-xl font-bold text-blue-300 mb-1">{stat.value}</div>
                <div className="text-slate-400 text-xs">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 rounded-xl p-6 max-w-4xl mx-auto border border-slate-700/20 backdrop-blur-sm">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-6">
              {['USA', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'].map((currency, i) => (
                <div key={i} className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-slate-600/30 rounded p-2 text-center hover:from-slate-600/50 hover:to-slate-700/50 transition-all duration-300">
                  <span className="text-slate-200 text-sm font-medium">{currency}</span>
                </div>
              ))}
            </div>
            <p className="text-slate-400 text-sm">Available in 48 countries worldwide</p>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-slate-800/50 to-slate-900/50 py-12 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Start Trading?</h2>
          <p className="text-slate-400 text-sm mb-8 max-w-2xl mx-auto">
            Join millions of traders worldwide and experience professional trading.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button 
              onClick={handleNavigation}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
            >
              Try Free Demo
            </button>
            <button 
              onClick={handleNavigation}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
            >
              Start Real Trading
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-slate-950 border-t border-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-5 gap-6">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">EO</span>
                </div>
                <span className="text-white font-bold">ExpertOption</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed mb-4">
                Professional binary options trading platform trusted by millions of traders worldwide.
              </p>
              <div className="flex space-x-4">
                {['f', 't', 'ig', 'yt'].map((social) => (
                  <a key={social} href="#" className="text-slate-400 hover:text-white transition-colors">
                    <div className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center">
                      <span className="text-xs">{social}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-white font-medium mb-3 text-sm">Trading</h4>
              <ul className="space-y-2">
                {['Features', 'Account Types', 'Demo Account', 'Mobile App'].map((item) => (
                  <li key={item}><a href="#" className="text-slate-400 hover:text-white text-xs transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-medium mb-3 text-sm">Company</h4>
              <ul className="space-y-2">
                {['About Us', 'Terms', 'Privacy', 'Support'].map((item) => (
                  <li key={item}><a href="#" className="text-slate-400 hover:text-white text-xs transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-medium mb-3 text-sm">Payment Methods</h4>
              <div className="grid grid-cols-3 gap-2">
                {['VISA', 'MC', 'PayPal', 'Skrill', 'Crypto', 'Wire'].map((method) => (
                  <div key={method} className="bg-slate-800 rounded px-2 py-1 text-center">
                    <span className="text-white text-xs">{method}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4 mt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-xs">© 2024 ExpertOption. All rights reserved.</p>
            <p className="text-slate-500 text-xs mt-2 md:mt-0">Risk warning: Trading involves substantial risk</p>
          </div>
        </div>
      </footer>

      <AuthModal />
    </div>
  );
};

export default ExpertOptionLandingPage;