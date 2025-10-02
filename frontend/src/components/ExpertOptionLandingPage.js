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
const TradingDashboard = ({ handleBackToLanding }) => {
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
  const [chartPoints, setChartPoints] = useState([]);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showUserProfile, setShowUserProfile] = useState(false);

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
const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000');

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
    });

    // Listen for real price updates from CoinGecko service
    newSocket.on('price_update', (priceUpdates) => {
      console.log('Received price updates:', priceUpdates);
      
      setMarketData(prevData => {
        const updatedData = { ...prevData };
        
        priceUpdates.forEach(update => {
          if (assets[update.symbol]) {
            updatedData[update.symbol] = {
              ...assets[update.symbol],
              price: update.price,
              change: update.changePercent,
              timestamp: update.timestamp
            };
          }
        });
        
        return updatedData;
      });
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
      console.log("Cleaning up WebSocket connection...");
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

  useEffect(() => {
    const interval = setInterval(() => {
      const currentPrice = marketData[selectedAsset]?.price || assets[selectedAsset]?.price || 1.08945;
      const newPoint = {
        time: Date.now(),
        price: currentPrice + (Math.random() - 0.5) * 0.001, // Small random variation
        volume: Math.random() * 1000
      };
      
      setChartPoints(prev => {
        const updated = [...prev, newPoint];
        return updated.slice(-50); // Keep last 50 points
      });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [selectedAsset, marketData]);

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

      console.log("Trade placed successfully:", data.trade);
      
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
      console.error("Error placing trade:", error);
      alert(`Failed to place trade: ${error.message}`);
    }
  };

  const DepositModal = () => (
    showDepositModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md mx-4 border border-slate-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Deposit Funds</h2>
            <button
              onClick={() => setShowDepositModal(false)}
              className="text-slate-400 hover:text-white"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-2">Amount (USD)</label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded text-white"
                placeholder="Enter amount"
              />
            </div>
            
            <div>
              <label className="block text-sm text-slate-300 mb-2">Payment Method</label>
              <select className="w-full p-3 bg-slate-700 border border-slate-600 rounded text-white">
                <option>Credit Card</option>
                <option>Bank Transfer</option>
                <option>PayPal</option>
                <option>Cryptocurrency</option>
              </select>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded p-3">
              <p className="text-blue-300 text-sm">
                Demo Mode: This will simulate a deposit for testing purposes.
              </p>
            </div>

            <button
              onClick={() => {
                if (depositAmount) {
                  setUser(prev => ({...prev, balance: prev.balance + Number(depositAmount)}));
                  setDepositAmount('');
                  setShowDepositModal(false);
                }
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded font-medium"
            >
              Simulate Deposit
            </button>
          </div>
        </div>
      </div>
    )
  );

  const WithdrawModal = () => (
    showWithdrawModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md mx-4 border border-slate-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Withdraw Funds</h2>
            <button
              onClick={() => setShowWithdrawModal(false)}
              className="text-slate-400 hover:text-white"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-2">Amount (USD)</label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded text-white"
                placeholder="Enter amount"
                max={user.balance}
              />
              <div className="text-xs text-slate-400 mt-1">
                Available: ${user.balance.toFixed(2)}
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-slate-300 mb-2">Withdrawal Method</label>
              <select className="w-full p-3 bg-slate-700 border border-slate-600 rounded text-white">
                <option>Bank Account</option>
                <option>Credit Card</option>
                <option>PayPal</option>
                <option>Cryptocurrency</option>
              </select>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded p-3">
              <p className="text-yellow-300 text-sm">
                Demo Mode: This will simulate a withdrawal for testing purposes.
              </p>
            </div>

            <button
              onClick={() => {
                if (withdrawAmount && Number(withdrawAmount) <= user.balance) {
                  setUser(prev => ({...prev, balance: prev.balance - Number(withdrawAmount)}));
                  setWithdrawAmount('');
                  setShowWithdrawModal(false);
                }
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded font-medium"
            >
              Simulate Withdrawal
            </button>
          </div>
        </div>
      </div>
    )
  );

  const UserProfileModal = () => (
    showUserProfile && (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md mx-4 border border-slate-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Profile</h2>
            <button
              onClick={() => setShowUserProfile(false)}
              className="text-slate-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mb-3">
                <span className="text-white text-3xl font-bold">{user.name.charAt(0)}</span>
              </div>
              <h3 className="text-xl font-semibold">{user.name}</h3>
              <span className="text-sm bg-orange-500 px-3 py-1 rounded mt-2">DEMO</span>
            </div>

            {/* Account Info */}
            <div className="space-y-3">
              <div className="bg-slate-700 rounded-lg p-4">
                <div className="text-slate-400 text-sm">Profile ID</div>
                <div className="text-white font-mono">547-785-194</div>
              </div>

              <div className="bg-slate-700 rounded-lg p-4">
                <div className="text-slate-400 text-sm">Email</div>
                <div className="text-white">{user.email}</div>
              </div>

              <div className="bg-slate-700 rounded-lg p-4">
                <div className="text-slate-400 text-sm">Account Balance</div>
                <div className="text-green-400 text-2xl font-bold">${user.balance.toFixed(2)}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-700 rounded-lg p-3">
                  <div className="text-slate-400 text-xs">Total Trades</div>
                  <div className="text-white text-lg font-bold">{activeTrades.length + tradeHistory.length}</div>
                </div>
                <div className="bg-slate-700 rounded-lg p-3">
                  <div className="text-slate-400 text-xs">Win Rate</div>
                  <div className="text-green-400 text-lg font-bold">67%</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-medium transition-colors">
                Edit Profile
              </button>
              <button 
                onClick={handleBackToLanding}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white p-3 rounded-lg font-medium transition-colors"
              >
                Back to Landing
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Professional Trading Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {/* Back Button */}
          <button
            onClick={handleBackToLanding}
            className="flex items-center space-x-2 px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-sm transition-colors"
          >
            <span>←</span>
            <span>Back</span>
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">EO</span>
            </div>
            <span className="text-lg font-semibold">ExpertOption Pro</span>
            <div className="flex items-center space-x-2 ml-4">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-xs font-medium">LIVE</span>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs">Watchlist</button>
            <button className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs">News</button>
            <button className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs">Analysis</button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-xs text-slate-400">Account Balance</div>
            <div className="text-lg font-bold text-green-400">${user.balance.toFixed(2)}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400">P&L Today</div>
            <div className="text-lg font-bold text-green-400">+$127.50</div>
          </div>
          
          {/* User Profile Button */}
          <button
            onClick={() => setShowUserProfile(true)}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded transition-colors"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">{user.name.charAt(0)}</span>
            </div>
            <div className="text-left">
              <div className="text-sm font-medium">{user.name}</div>
              <div className="text-xs text-slate-400">View Profile</div>
            </div>
          </button>
        </div>
      </header>

      {/* Main Trading Interface */}
      <div className="flex-1 flex">
        {/* Left Sidebar - Market Watch */}
        <div className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col">
          <div className="p-3 border-b border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold">Market Watch</h3>
              <button className="text-xs text-blue-400 hover:text-blue-300">+ Add Symbol</button>
            </div>
            <div className="flex space-x-1">
              {categories.map(category => (
                <button
                  key={category.id}
                  className="px-2 py-1 text-xs bg-slate-800 hover:bg-slate-700 rounded"
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-4 gap-1 p-2 text-xs text-slate-400 font-medium border-b border-slate-800">
              <span>Symbol</span>
              <span>Bid</span>
              <span>Ask</span>
              <span>Change</span>
            </div>
            
            {Object.entries(assets).map(([symbol, asset]) => {
              const data = marketData[symbol] || asset;
              const isSelected = selectedAsset === symbol;
              const bid = data.price - 0.0001;
              const ask = data.price + 0.0001;
              
              return (
                <button
                  key={symbol}
                  onClick={() => setSelectedAsset(symbol)}
                  className={`w-full grid grid-cols-4 gap-1 p-2 text-xs hover:bg-slate-800 transition-colors ${
                    isSelected ? 'bg-slate-800 border-l-2 border-blue-500' : ''
                  }`}
                >
                  <div className="text-left">
                    <div className="font-medium">{symbol}</div>
                  </div>
                  <div className="font-mono text-slate-300">
                    {formatPrice(symbol, bid)}
                  </div>
                  <div className="font-mono text-slate-300">
                    {formatPrice(symbol, ask)}
                  </div>
                  <div className={`font-bold ${data.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {data.change >= 0 ? '+' : ''}{data.change.toFixed(2)}%
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center - Chart and Order Entry */}
        <div className="flex-1 flex flex-col">
          {/* Symbol Header */}
          <div className="bg-slate-900 p-4 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-bold">{selectedAsset}</h2>
                <div className="text-2xl font-mono font-bold">
                  {formatPrice(selectedAsset, marketData[selectedAsset]?.price)}
                </div>
                <div className={`flex items-center space-x-1 ${
                  (marketData[selectedAsset]?.change || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {(marketData[selectedAsset]?.change || 0) >= 0 ? '▲' : '▼'}
                  <span className="font-semibold">
                    {Math.abs(marketData[selectedAsset]?.change || 0).toFixed(2)}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400">Spread:</span>
                <span className="text-xs font-mono">0.2</span>
                <span className="text-xs text-slate-400">Swap:</span>
                <span className="text-xs font-mono text-red-400">-1.5</span>
              </div>
            </div>
          </div>

          {/* Chart Area - Expanded */}
          <div className="flex-1 p-4">
            <div className="h-full bg-slate-900 rounded-lg border border-slate-800 flex flex-col">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h3 className="font-semibold">Price Chart</h3>
                  <div className="flex space-x-1">
                    {['1M', '5M', '15M', '1H', '4H', '1D'].map(timeframe => (
                      <button key={timeframe} className="px-2 py-1 text-xs bg-slate-800 hover:bg-slate-700 rounded">
                        {timeframe}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-2 py-1 text-xs bg-slate-800 hover:bg-slate-700 rounded">Indicators</button>
                  <button className="px-2 py-1 text-xs bg-slate-800 hover:bg-slate-700 rounded">Drawing Tools</button>
                </div>
              </div>
              
              {/* Expanded Chart Container */}
              <div className="flex-1 p-4 min-h-0">
                <div className="w-full h-full bg-slate-950 rounded relative overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 1000 500">
                    {/* Enhanced Grid */}
                    <defs>
                      <pattern id="grid" width="50" height="25" patternUnits="userSpaceOnUse">
                        <path d="M 50 0 L 0 0 0 25" fill="none" stroke="#374151" strokeWidth="0.5" opacity="0.2"/>
                      </pattern>
                      <linearGradient id="priceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4"/>
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                    
                    {/* Main price line with more data points */}
                    <path
                      d="M 50 250 L 80 240 L 110 245 L 140 235 L 170 230 L 200 225 L 230 235 L 260 240 L 290 238 L 320 242 L 350 245 L 380 248 L 410 252 L 440 250 L 470 255 L 500 253 L 530 258 L 560 260 L 590 255 L 620 250 L 650 248 L 680 252 L 710 255 L 740 258 L 770 260 L 800 262 L 830 265 L 860 268 L 890 270 L 920 272 L 950 275"
                      stroke="#3b82f6"
                      strokeWidth="2"
                      fill="none"
                      className="animate-pulse"
                    />
                    
                    {/* Area fill */}
                    <path
                      d="M 50 250 L 80 240 L 110 245 L 140 235 L 170 230 L 200 225 L 230 235 L 260 240 L 290 238 L 320 242 L 350 245 L 380 248 L 410 252 L 440 250 L 470 255 L 500 253 L 530 258 L 560 260 L 590 255 L 620 250 L 650 248 L 680 252 L 710 255 L 740 258 L 770 260 L 800 262 L 830 265 L 860 268 L 890 270 L 920 272 L 950 275 L 950 500 L 50 500 Z"
                      fill="url(#priceGradient)"
                      opacity="0.3"
                    />
                    
                    {/* Enhanced candlesticks */}
                    {Array.from({length: 30}).map((_, i) => {
                      const x = 50 + i * 30;
                      const isGreen = Math.random() > 0.5;
                      const height = Math.random() * 30 + 8;
                      const y = 240 + (Math.random() - 0.5) * 60;
                      
                      return (
                        <g key={i}>
                          <line
                            x1={x}
                            y1={y - height/2 - 8}
                            x2={x}
                            y2={y + height/2 + 8}
                            stroke={isGreen ? "#10b981" : "#ef4444"}
                            strokeWidth="1"
                          />
                          <rect
                            x={x - 4}
                            y={isGreen ? y - height/2 : y}
                            width="8"
                            height={height}
                            fill={isGreen ? "#10b981" : "#ef4444"}
                          />
                        </g>
                      );
                    })}
                    
                    {/* Price levels */}
                    {[200, 225, 250, 275, 300].map((level, i) => (
                      <g key={i}>
                        <line
                          x1="0"
                          y1={level}
                          x2="1000"
                          y2={level}
                          stroke="#374151"
                          strokeWidth="0.5"
                          strokeDasharray="2,2"
                          opacity="0.5"
                        />
                        <text x="10" y={level - 5} fill="#64748b" fontSize="10" fontFamily="monospace">
                          {(1.08900 + (250 - level) * 0.0001).toFixed(5)}
                        </text>
                      </g>
                    ))}
                    
                    {/* Current price line */}
                    <line
                      x1="0"
                      y1="250"
                      x2="1000"
                      y2="250"
                      stroke="#10b981"
                      strokeWidth="1"
                      strokeDasharray="5,5"
                      opacity="0.8"
                    />
                  </svg>
                  
                  {/* Enhanced OHLC data */}
                  <div className="absolute top-4 left-4 bg-slate-800/90 rounded p-3 text-xs">
                    <div className="grid grid-cols-4 gap-6">
                      <div>
                        <div className="text-slate-400">Open</div>
                        <div className="text-white font-mono">1.08912</div>
                      </div>
                      <div>
                        <div className="text-slate-400">High</div>
                        <div className="text-green-400 font-mono">1.08967</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Low</div>
                        <div className="text-red-400 font-mono">1.08901</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Close</div>
                        <div className="text-white font-mono">{formatPrice(selectedAsset, marketData[selectedAsset]?.price)}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced volume bars */}
                  <div className="absolute bottom-4 left-4 right-4 h-20 flex items-end space-x-1">
                    {Array.from({length: 80}).map((_, i) => (
                      <div
                        key={i}
                        className="bg-blue-500/20 flex-1 transition-all duration-300 hover:bg-blue-500/40"
                        style={{ height: `${Math.random() * 100}%` }}
                      />
                    ))}
                  </div>
                  
                  {/* Trading signals overlay */}
                  <div className="absolute top-4 right-4 bg-slate-800/90 rounded p-3 text-xs">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>BUY Signal - RSI Oversold</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span>Support Level: 1.08900</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Analysis Panel */}
          <div className="mt-4 bg-slate-800 rounded-lg p-4">
            <h4 className="text-sm font-semibold mb-3">Technical Indicators</h4>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-700 rounded p-3">
                <div className="text-slate-400">RSI (14)</div>
                <div className="text-yellow-400 font-bold">67.8</div>
                <div className="text-xs text-slate-500">Neutral</div>
              </div>
              <div className="bg-slate-700 rounded p-3">
                <div className="text-slate-400">MACD</div>
                <div className="text-green-400 font-bold">+0.0012</div>
                <div className="text-xs text-slate-500">Bullish</div>
              </div>
              <div className="bg-slate-700 rounded p-3">
                <div className="text-slate-400">MA (20)</div>
                <div className="text-blue-400 font-bold">1.0889</div>
                <div className="text-xs text-slate-500">Above</div>
              </div>
            </div>
            
            <div className="mt-3 flex space-x-2">
              <button className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs">Bollinger Bands</button>
              <button className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs">Fibonacci</button>
              <button className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs">Support/Resistance</button>
            </div>
          </div>
        </div>

        {/* Right Panel - Trading Interface */}
        <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col">
          {/* Account Summary */}
          <div className="p-4 border-b border-slate-800">
            <h3 className="text-sm font-semibold mb-3">Account Summary</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-800 rounded p-2">
                <div className="text-slate-400">Balance</div>
                <div className="font-bold text-green-400">${user.balance.toFixed(2)}</div>
              </div>
              <div className="bg-slate-800 rounded p-2">
                <div className="text-slate-400">Equity</div>
                <div className="font-bold">${user.balance.toFixed(2)}</div>
              </div>
              <div className="bg-slate-800 rounded p-2">
                <div className="text-slate-400">Margin</div>
                <div className="font-bold text-blue-400">${(user.balance * 0.1).toFixed(2)}</div>
              </div>
              <div className="bg-slate-800 rounded p-2">
                <div className="text-slate-400">Free Margin</div>
                <div className="font-bold text-green-400">${(user.balance * 0.9).toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="p-4 border-b border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Account Actions</h3>
              <span className="text-xs text-slate-400">Demo Mode</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button 
                onClick={() => setShowDepositModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white p-2 rounded text-xs font-medium transition-colors"
              >
                + Deposit
              </button>
              <button 
                onClick={() => setShowWithdrawModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded text-xs font-medium transition-colors"
              >
                - Withdraw
              </button>
            </div>
            
            <div className="bg-slate-800 rounded p-2 text-xs">
              <div className="text-slate-400 mb-1">Demo Balance Tools</div>
              <button 
                onClick={() => setUser(prev => ({...prev, balance: 10000}))}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white p-1 rounded text-xs"
              >
                Reset to $10,000
              </button>
            </div>
          </div>

          {/* Order Entry */}
          <div className="p-4 border-b border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Quick Trade</h3>
              <div className="flex space-x-1">
                <button className="px-2 py-1 text-xs bg-blue-600 rounded">Market</button>
                <button className="px-2 py-1 text-xs bg-slate-700 rounded">Limit</button>
                <button className="px-2 py-1 text-xs bg-slate-700 rounded">Stop</button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Volume</label>
                <input
                  type="number"
                  value={selectedAmount}
                  onChange={(e) => setSelectedAmount(Number(e.target.value))}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-sm"
                  step="0.01"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[10, 25, 50].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setSelectedAmount(amount)}
                    className="p-1 text-xs bg-slate-800 hover:bg-slate-700 rounded"
                  >
                    ${amount}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => placeTrade('PUT')}
                  className="bg-red-600 hover:bg-red-700 text-white p-3 rounded font-semibold transition-colors"
                >
                  SELL
                  <div className="text-xs opacity-75">
                    {formatPrice(selectedAsset, (marketData[selectedAsset]?.price || 0) - 0.0001)}
                  </div>
                </button>
                <button
                  onClick={() => placeTrade('CALL')}
                  className="bg-green-600 hover:bg-green-700 text-white p-3 rounded font-semibold transition-colors"
                >
                  BUY
                  <div className="text-xs opacity-75">
                    {formatPrice(selectedAsset, (marketData[selectedAsset]?.price || 0) + 0.0001)}
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Market Sentiment */}
          <div className="p-4 border-b border-slate-800">
            <h3 className="text-sm font-semibold mb-3">Market Sentiment</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>EUR/USD</span>
                  <span className="text-green-400">72% Bullish</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: '72%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>GBP/USD</span>
                  <span className="text-red-400">35% Bullish</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{width: '35%'}}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Economic Calendar */}
          <div className="p-4 border-b border-slate-800">
            <h3 className="text-sm font-semibold mb-3">Economic Calendar</h3>
            <div className="space-y-2">
              {[
                { time: '14:30', event: 'USD Non-Farm Payrolls', impact: 'high' },
                { time: '16:00', event: 'EUR ECB Rate Decision', impact: 'medium' },
                { time: '18:00', event: 'GBP Retail Sales', impact: 'low' }
              ].map((event, i) => (
                <div key={i} className="bg-slate-800 rounded p-2 text-xs">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{event.event}</div>
                      <div className="text-slate-400">{event.time} GMT</div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${
                      event.impact === 'high' ? 'bg-red-500' :
                      event.impact === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Positions */}
          <div className="p-4 border-b border-slate-800">
            <h3 className="text-sm font-semibold mb-3">Open Positions</h3>
            <div className="space-y-2">
              {activeTrades.length > 0 ? (
                activeTrades.map(trade => (
                  <div key={trade.id} className="bg-slate-800 rounded p-3 text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">{trade.asset}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        trade.direction === 'CALL' ? 'bg-green-600' : 'bg-red-600'
                      }`}>
                        {trade.direction}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-slate-400">
                      <div>
                        <div>Volume</div>
                        <div className="text-white">{trade.amount}</div>
                      </div>
                      <div>
                        <div>Entry</div>
                        <div className="text-white">{formatPrice(trade.asset, trade.entryPrice)}</div>
                      </div>
                      <div>
                        <div>P&L</div>
                        <div className="text-green-400">+$12.50</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-400 py-8 text-sm">
                  No open positions
                </div>
              )}
            </div>
          </div>

          {/* Trading History */}
          <div className="p-4 border-b border-slate-800">
            <h3 className="text-sm font-semibold mb-3">Recent Trades</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {tradeHistory.length > 0 ? (
                tradeHistory.slice(0, 5).map(trade => (
                  <div key={trade._id} className="bg-slate-800 rounded p-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{trade.asset}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        trade.result === 'win' ? 'bg-green-600' : 'bg-red-600'
                      }`}>
                        {trade.result?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400 mt-1">
                      <span>${trade.amount}</span>
                      <span className={trade.result === 'win' ? 'text-green-400' : 'text-red-400'}>
                        {trade.result === 'win' ? '+' : ''}${trade.profit?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-400 py-4 text-xs">
                  No trading history
                </div>
              )}
            </div>
          </div>

          {/* Position Calculator */}
          <div className="p-4">
            <h3 className="text-sm font-semibold mb-3">Position Calculator</h3>
            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400">Risk %</label>
                  <input 
                    type="number" 
                    defaultValue="2" 
                    className="w-full p-1 bg-slate-700 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-400">Stop Loss</label>
                  <input 
                    type="number" 
                    defaultValue="20" 
                    className="w-full p-1 bg-slate-700 rounded text-xs"
                  />
                </div>
              </div>
              <div className="bg-slate-800 rounded p-2">
                <div className="text-slate-400">Suggested Position Size</div>
                <div className="text-white font-bold">$127.50</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="bg-slate-900 border-t border-slate-800 px-4 py-2 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-4">
          <span className="text-slate-400">Connected to server</span>
          <span className="text-slate-400">Ping: 12ms</span>
          <span className="text-slate-400">Data feed: Real-time</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-slate-400">Server time: {new Date().toLocaleTimeString()}</span>
          <span className="text-slate-400">Build: v4.2.1</span>
        </div>
      </div>

      <DepositModal />
      <WithdrawModal />
      <UserProfileModal />
    </div>
  );
};

// Main Landing Page Component
const ExpertOptionLandingPage = () => {
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
      <TradingDashboard handleBackToLanding={handleBackToLanding} />
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
              <div key={i} className="bg-gradient-to-br from-blue-900/20 to-slate-900/30 rounded-lg p-4 border border-blue-800/20 backdrop-blur-sm hover:from-blue-800/30 hover:to-slate-800/40 transition-all duration-300 animate-pulse" style={{animationDelay: `${i * 200}ms`}}>
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
  <div className="container mx-auto px-4">
    <div className="text-center mb-12">
      <div className="flex items-center justify-center space-x-2 mb-4">
        <Users className="w-6 h-6 text-blue-400" />
        <h2 className="text-2xl font-bold text-white">Join Our Community</h2>
      </div>
      <p className="text-slate-400 text-sm max-w-xl mx-auto">
        Connect with millions of traders worldwide, share strategies, and stay updated with market trends.
      </p>
    </div>

    <div className="grid md:grid-cols-3 gap-6">
      {[
        {
          icon: Activity,
          title: 'Live Market Insights',
          desc: 'Get real-time updates and expert analysis from our community of traders.'
        },
        {
          icon: BarChart3,
          title: 'Trading Signals',
          desc: 'Access professional trading signals to make informed decisions.'
        },
        {
          icon: Users,
          title: 'Social Trading',
          desc: 'Follow top traders and copy their successful strategies.'
        }
      ].map((feature, i) => (
        <div
          key={i}
          className="bg-gradient-to-br from-blue-900/20 to-slate-900/30 rounded-lg p-6 border border-blue-800/20 backdrop-blur-sm hover:from-blue-800/30 hover:to-slate-800/40 transition-all duration-300 animate-fadeIn"
          style={{ animationDelay: `${i * 200}ms` }}
        >
          <feature.icon className="w-8 h-8 text-blue-400 mb-4 mx-auto" />
          <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
          <p className="text-slate-400 text-sm">{feature.desc}</p>
        </div>
      ))}
    </div>

    <div className="text-center mt-8">
      <button
        onClick={handleRegister}
        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25 animate-bounce-subtle"
      >
        Join Now
      </button>
    </div>
  </div>
</section>

<section className="bg-gradient-to-b from-slate-900/80 to-slate-800/80 py-12">
  <div className="container mx-auto px-4">
    <div className="text-center mb-12">
      <div className="flex items-center justify-center space-x-2 mb-4">
        <CreditCard className="w-6 h-6 text-blue-400" />
        <h2 className="text-2xl font-bold text-white">Flexible Payment Options</h2>
      </div>
      <p className="text-slate-400 text-sm max-w-xl mx-auto">
        Deposit and withdraw funds with ease using your preferred payment method.
      </p>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {[
        { name: 'Visa', img: '/visa-logo.png' },
        { name: 'Mastercard', img: '/mastercard-logo.png' },
        { name: 'PayPal', img: '/paypal-logo.png' },
        { name: 'Bitcoin', img: '/bitcoin-logo.png' },
        { name: 'Skrill', img: '/skrill-logo.png' }
      ].map((method, i) => (
        <div
          key={i}
          className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-lg p-4 border border-slate-600/30 flex items-center justify-center hover:from-slate-600/50 hover:to-slate-700/50 transition-all duration-300 animate-slideIn"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <img
            src={method.img}
            alt={method.name}
            className="h-8 w-auto object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
          />
        </div>
      ))}
    </div>
  </div>
</section>

<section className="bg-gradient-to-b from-slate-800/50 to-slate-900/50 py-12 backdrop-blur-sm">
  <div className="container mx-auto px-4">
    <div className="text-center mb-12">
      <div className="flex items-center justify-center space-x-2 mb-4">
        <CheckCircle className="w-6 h-6 text-blue-400" />
        <h2 className="text-2xl font-bold text-white">Why Choose ExpertOption?</h2>
      </div>
      <p className="text-slate-400 text-sm max-w-xl mx-auto">
        Discover why traders worldwide trust ExpertOption for their trading needs.
      </p>
    </div>

    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        {
          title: 'Fast Withdrawals',
          desc: 'Get your funds quickly with same-day processing.'
        },
        {
          title: '24/7 Support',
          desc: 'Our team is available around the clock to assist you.'
        },
        {
          title: 'Advanced Tools',
          desc: 'Access professional charting and analysis tools.'
        },
        {
          title: 'Secure Platform',
          desc: 'Your funds and data are protected with top-tier security.'
        }
      ].map((reason, i) => (
        <div
          key={i}
          className="bg-gradient-to-br from-blue-900/20 to-slate-900/30 rounded-lg p-6 border border-blue-800/20 backdrop-blur-sm hover:from-blue-800/30 hover:to-slate-800/40 transition-all duration-300 animate-fadeIn"
          style={{ animationDelay: `${i * 200}ms` }}
        >
          <h3 className="text-white font-semibold text-lg mb-2">{reason.title}</h3>
          <p className="text-slate-400 text-sm">{reason.desc}</p>
        </div>
      ))}
    </div>
  </div>
</section>

<footer className="bg-slate-900 border-t border-slate-800 py-8">
  <div className="container mx-auto px-4">
    <div className="grid md:grid-cols-4 gap-8">
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">EO</span>
          </div>
          <span className="text-white text-lg font-bold">ExpertOption</span>
        </div>
        <p className="text-slate-400 text-sm">
          Empowering wealth creation since 2014. Trade with confidence.
        </p>
      </div>

      <div>
        <h3 className="text-white font-semibold mb-4">Company</h3>
        <ul className="space-y-2 text-sm">
          <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">About Us</a></li>
          <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Careers</a></li>
          <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Press</a></li>
          <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Legal</a></li>
        </ul>
      </div>

      <div>
        <h3 className="text-white font-semibold mb-4">Resources</h3>
        <ul className="space-y-2 text-sm">
          <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Education</a></li>
          <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Blog</a></li>
          <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">FAQ</a></li>
          <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Support</a></li>
        </ul>
      </div>

      <div>
        <h3 className="text-white font-semibold mb-4">Connect</h3>
        <div className="flex space-x-4 mb-4">
          {['f', 'tw', 'ig', 'yt', 'tg'].map((social, i) => (
            <a
              key={i}
              href="#"
              className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-all duration-300"
            >
              <span className="text-xs">{social}</span>
            </a>
          ))}
        </div>
        <p className="text-slate-400 text-sm">support@expertoption.com</p>
      </div>
    </div>

    <div className="border-t border-slate-800 mt-8 pt-6 text-center">
      <p className="text-slate-400 text-sm">
        &copy; {new Date().getFullYear()} ExpertOption. All rights reserved.
      </p>
      <p className="text-slate-400 text-xs mt-2">
        Risk Warning: Trading involves significant risk and may not be suitable for everyone.
      </p>
    </div>
  </div>
</footer>

<AuthModal />
</div>
);
};

export default ExpertOptionLandingPage;