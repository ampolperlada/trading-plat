// src/components/ExpertOptionTradingDashboard.jsx
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, History, User, LogOut, Plus, Minus } from 'lucide-react';

// CoinGecko API for real crypto prices
const COINGECKO_API = 'https://api.coingecko.com/api/v3/simple/price';

const COIN_GECKO_MAP = {
  BTCUSD: 'bitcoin',
  ETHUSD: 'ethereum',
};

const fetchCryptoPrices = async () => {
  try {
    const ids = Object.values(COIN_GECKO_MAP).join(',');
    const response = await fetch(`${COINGECKO_API}?ids=${ids}&vs_currencies=usd`);
    if (!response.ok) throw new Error('Failed to fetch crypto prices');

    const data = await response.json();
    const prices = {};

    for (const [symbol, id] of Object.entries(COIN_GECKO_MAP)) {
      if (data[id]?.usd) {
        prices[symbol] = {
          price: data[id].usd,
          change: Math.random() * 10 - 5, // Simulated % change
          volume: Math.random() * 1e6,
          timestamp: Date.now(),
        };
      }
    }

    return prices;
  } catch (error) {
    console.error('Error fetching crypto prices:', error);
    return {};
  }
};

const ExpertOptionTradingDashboard = () => {
  // Authentication State
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [loginData, setLoginData] = useState({ email: 'demo@trading.com', password: 'demo123' });

  // Trading State
  const [selectedAsset, setSelectedAsset] = useState('EURUSD');
  const [tradeAmount, setTradeAmount] = useState(10);
  const [selectedTime, setSelectedTime] = useState(60);
  const [activeTrades, setActiveTrades] = useState([]);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [prices, setPrices] = useState({});
  const [chartData, setChartData] = useState([]);

  // UI State
  const [notifications, setNotifications] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Assets Data
  const assets = [
    { symbol: 'EURUSD', name: 'EUR/USD', type: 'forex', basePrice: 1.0856, icon: '💱' },
    { symbol: 'GBPUSD', name: 'GBP/USD', type: 'forex', basePrice: 1.2634, icon: '💱' },
    { symbol: 'USDJPY', name: 'USD/JPY', type: 'forex', basePrice: 149.23, icon: '💱' },
    { symbol: 'BTCUSD', name: 'Bitcoin', type: 'crypto', basePrice: 43247.89, icon: '₿' },
    { symbol: 'ETHUSD', name: 'Ethereum', type: 'crypto', basePrice: 2634.56, icon: 'Ξ' },
    { symbol: 'AAPL', name: 'Apple Inc', type: 'stocks', basePrice: 189.47, icon: '🍎' },
    { symbol: 'TSLA', name: 'Tesla Inc', type: 'stocks', basePrice: 248.91, icon: '🚗' },
    { symbol: 'GOOGL', name: 'Google', type: 'stocks', basePrice: 138.21, icon: '🔍' },
    { symbol: 'GOLD', name: 'Gold', type: 'commodities', basePrice: 2087.45, icon: '🥇' },
    { symbol: 'OIL', name: 'Oil', type: 'commodities', basePrice: 85.24, icon: '🛢️' }
  ];

  const timeOptions = [
    { value: 15, label: '15s' },
    { value: 30, label: '30s' },
    { value: 60, label: '1m' },
    { value: 300, label: '5m' },
    { value: 900, label: '15m' },
    { value: 1800, label: '30m' }
  ];

  // Initialize user and prices
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
      setShowLogin(false);
      addNotification('Welcome back!', 'success');
    }

    const initializePrices = async () => {
      const cryptoPrices = await fetchCryptoPrices();
      const fallbackPrices = {};

      assets.forEach(asset => {
        if (!cryptoPrices[asset.symbol]) {
          fallbackPrices[asset.symbol] = {
            price: asset.basePrice,
            change: (Math.random() - 0.5) * 2,
            volume: Math.random() * 1e6,
            timestamp: Date.now(),
          };
        }
      });

      const allPrices = { ...fallbackPrices, ...cryptoPrices };
      setPrices(allPrices);
      generateChartData();
    };

    initializePrices();
  }, []);

  // Real-time price updates (every 10 seconds)
  useEffect(() => {
    const interval = setInterval(async () => {
      const cryptoPrices = await fetchCryptoPrices();

      setPrices(prev => {
        const newPrices = { ...prev };

        assets.forEach(asset => {
          if (COIN_GECKO_MAP[asset.symbol]) {
            if (cryptoPrices[asset.symbol]) {
              newPrices[asset.symbol] = cryptoPrices[asset.symbol];
            }
          } else {
            const currentPrice = prev[asset.symbol]?.price || asset.basePrice;
            const variation = (Math.random() - 0.5) * 0.002;
            const newPrice = Math.max(0.001, currentPrice * (1 + variation));
            const change = ((newPrice - asset.basePrice) / asset.basePrice) * 100;

            newPrices[asset.symbol] = {
              price: newPrice,
              change,
              volume: Math.random() * 1e6,
              timestamp: Date.now(),
            };
          }
        });

        return newPrices;
      });

      updateChartData();
    }, 10000);

    return () => clearInterval(interval);
  }, [selectedAsset]);

  // Trade settlement checker
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTrades(prevTrades =>
        prevTrades
          .map(trade => {
            if (!trade.settled && Date.now() >= trade.expirationTime) {
              return settleTrade(trade);
            }
            return trade;
          })
          .filter(trade => !trade.settled)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [prices]);

  const generateChartData = () => {
    const data = [];
    const asset = assets.find(a => a.symbol === selectedAsset);
    let price = prices[selectedAsset]?.price || asset?.basePrice || 1.0856;

    for (let i = 0; i < 50; i++) {
      const variation = (Math.random() - 0.5) * 0.001;
      price = price * (1 + variation);
      data.push({
        time: Date.now() - (50 - i) * 60000,
        price: price,
        volume: Math.random() * 100000
      });
    }
    setChartData(data);
  };

  const updateChartData = () => {
    const currentPrice = prices[selectedAsset]?.price;
    if (!currentPrice) return;

    setChartData(prev => {
      const newData = [...prev];
      newData.push({
        time: Date.now(),
        price: currentPrice,
        volume: Math.random() * 100000
      });
      return newData.slice(-50);
    });
  };

  const addNotification = (message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: Date.now()
    };

    setNotifications(prev => [notification, ...prev.slice(0, 4)]);

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  const handleLogin = (e) => {
    e.preventDefault();

    const userData = {
      id: Date.now(),
      email: loginData.email,
      name: loginData.email.split('@')[0],
      balance: 10000,
      accountType: 'Demo',
      joinedDate: new Date().toISOString()
    };

    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', 'demo-token-' + Date.now());

    setUser(userData);
    setIsLoggedIn(true);
    setShowLogin(false);
    addNotification(`Welcome ${userData.name}!`, 'success');
  };

  const placeTrade = (direction) => {
    if (!isLoggedIn) {
      addNotification('Please login to trade', 'error');
      return;
    }

    if (user.balance < tradeAmount) {
      addNotification('Insufficient balance', 'error');
      return;
    }

    const currentPrice = prices[selectedAsset]?.price;
    if (!currentPrice) {
      addNotification('Price data unavailable', 'error');
      return;
    }

    const trade = {
      id: Date.now(),
      asset: selectedAsset,
      direction: direction,
      amount: tradeAmount,
      entryPrice: currentPrice,
      openTime: Date.now(),
      expirationTime: Date.now() + (selectedTime * 1000),
      duration: selectedTime,
      settled: false,
      payout: tradeAmount * 1.8
    };

    const newBalance = user.balance - tradeAmount;
    const updatedUser = { ...user, balance: newBalance };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));

    setActiveTrades(prev => [...prev, trade]);
    addNotification(`${direction} trade placed on ${selectedAsset} - $${tradeAmount}`, 'info');
  };

  const settleTrade = (trade) => {
    const currentPrice = prices[trade.asset]?.price || trade.entryPrice;
    const priceChange = currentPrice - trade.entryPrice;

    let won = false;
    if (trade.direction === 'CALL' && priceChange > 0) won = true;
    if (trade.direction === 'PUT' && priceChange < 0) won = true;

    const settledTrade = {
      ...trade,
      settled: true,
      won,
      closePrice: currentPrice,
      profit: won ? trade.payout - trade.amount : -trade.amount,
      closeTime: Date.now()
    };

    if (won) {
      const newBalance = user.balance + trade.payout;
      const updatedUser = { ...user, balance: newBalance };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      addNotification(`Trade WON! +$${(trade.payout - trade.amount).toFixed(2)}`, 'success');
    } else {
      addNotification(`Trade LOST -$${trade.amount}`, 'error');
    }

    setTradeHistory(prev => [settledTrade, ...prev]);
    return settledTrade;
  };

  const formatPrice = (symbol, price) => {
    if (!price) return '--';
    const asset = assets.find(a => a.symbol === symbol);
    if (asset?.type === 'crypto') return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (symbol === 'USDJPY') return price.toFixed(3);
    return price.toFixed(5);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-md border border-slate-700">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">EO</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">ExpertOption Trading</h1>
            <p className="text-gray-400">Login to start trading</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email (demo@trading.com)"
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              className="w-full p-4 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              required
            />

            <input
              type="password"
              placeholder="Password (demo123)"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              className="w-full p-4 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              required
            />

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-lg font-bold text-white transition"
            >
              Login to Trading Platform
            </button>
          </form>

          <div className="bg-blue-900/30 rounded-lg p-4 mt-6">
            <p className="text-sm font-semibold text-blue-300 mb-1">Demo Account:</p>
            <p className="text-xs text-blue-200">
              Email: demo@trading.com<br />
              Password: demo123<br />
              Virtual Balance: $10,000
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`px-4 py-3 rounded-lg shadow-lg transition-all duration-300 max-w-sm ${
              notification.type === 'success' ? 'bg-green-600' :
              notification.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
            }`}
          >
            <div className="font-semibold">{notification.message}</div>
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">EO</span>
              </div>
              <h1 className="text-xl font-bold">ExpertOption</h1>
            </div>

            {isLoggedIn && (
              <div className="flex items-center space-x-4">
                <div className="bg-green-600 px-4 py-2 rounded-lg">
                  <span className="font-semibold">${user.balance.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => addNotification('Deposit feature coming soon!', 'info')}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
                >
                  Deposit
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {isLoggedIn && (
              <>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition"
                >
                  <History className="w-4 h-4" />
                  <span>History ({tradeHistory.length})</span>
                </button>

                <div className="flex items-center space-x-2 text-sm">
                  <User className="w-4 h-4" />
                  <span>{user.name}</span>
                </div>

                <button
                  onClick={() => {
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                    setIsLoggedIn(false);
                    setUser(null);
                    setShowLogin(true);
                    setActiveTrades([]);
                    addNotification('Logged out successfully', 'info');
                  }}
                  className="text-red-400 hover:text-red-300 p-2"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Assets Sidebar */}
        <div className="w-80 bg-slate-800 border-r border-slate-700 overflow-y-auto">
          <div className="p-4">
            <h3 className="font-semibold mb-4 text-lg">Trading Assets</h3>

            <div className="space-y-2">
              {assets.map(asset => {
                const priceData = prices[asset.symbol];
                const isSelected = selectedAsset === asset.symbol;

                return (
                  <div
                    key={asset.symbol}
                    onClick={() => setSelectedAsset(asset.symbol)}
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{asset.icon}</span>
                        <div>
                          <div className="font-semibold">{asset.symbol}</div>
                          <div className="text-xs opacity-75">{asset.name}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono text-sm">
                          {priceData ? formatPrice(asset.symbol, priceData.price) : '--'}
                        </div>
                        <div className={`text-xs flex items-center ${
                          (priceData?.change || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {(priceData?.change || 0) >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                          {(priceData?.change || 0).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Active Trades */}
            {activeTrades.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-3">Active Trades ({activeTrades.length})</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {activeTrades.map(trade => (
                    <div key={trade.id} className="bg-slate-700 p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{trade.asset}</span>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          trade.direction === 'CALL' ? 'bg-green-600' : 'bg-red-600'
                        }`}>
                          {trade.direction}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-300">
                        <span>${trade.amount}</span>
                        <span>{Math.max(0, Math.ceil((trade.expirationTime - Date.now()) / 1000))}s</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Entry: {formatPrice(trade.asset, trade.entryPrice)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Trading Area */}
        <div className="flex-1 flex flex-col">
          <div className="bg-slate-800 border-b border-slate-700 p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-6">
                <h2 className="text-2xl font-bold">{selectedAsset}</h2>
                <div className="text-3xl font-mono font-bold">
                  {prices[selectedAsset] ? formatPrice(selectedAsset, prices[selectedAsset].price) : '--'}
                </div>
                <div className={`flex items-center space-x-1 ${
                  (prices[selectedAsset]?.change || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {(prices[selectedAsset]?.change || 0) >= 0 ? 
                    <TrendingUp className="w-5 h-5" /> : 
                    <TrendingDown className="w-5 h-5" />
                  }
                  <span className="font-semibold">
                    {(prices[selectedAsset]?.change || 0).toFixed(2)}%
                  </span>
                </div>
              </div>
              <div className="text-sm text-gray-400">
                Last updated: {formatTime(Date.now())}
              </div>
            </div>
          </div>

          <div className="flex-1 p-6">
            <div className="bg-slate-800 rounded-lg p-4 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="time"
                    tickFormatter={(time) => new Date(time).toLocaleTimeString()}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                  />
                  <YAxis
                    domain={['dataMin - 0.001', 'dataMax + 0.001']}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    tickFormatter={(value) => formatPrice(selectedAsset, value)}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#priceGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Trading Panel */}
        <div className="w-80 bg-slate-800 border-l border-slate-700 p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Investment Amount</label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setTradeAmount(Math.max(1, tradeAmount - 5))}
                  className="bg-slate-700 hover:bg-slate-600 p-2 rounded-lg"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="flex-1">
                  <input
                    type="number"
                    value={tradeAmount}
                    onChange={(e) => setTradeAmount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-center font-mono text-lg focus:border-blue-500 focus:outline-none"
                    min="1"
                  />
                </div>
                <button
                  onClick={() => setTradeAmount(tradeAmount + 5)}
                  className="bg-slate-700 hover:bg-slate-600 p-2 rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Potential payout: ${(tradeAmount * 1.8).toFixed(2)} (80% profit)
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Expiration Time</label>
              <div className="grid grid-cols-3 gap-2">
                {timeOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedTime(option.value)}
                    className={`p-2 rounded-lg text-sm font-medium transition ${
                      selectedTime === option.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => placeTrade('CALL')}
                disabled={!isLoggedIn || user?.balance < tradeAmount}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed py-4 rounded-lg font-bold text-lg transition flex items-center justify-center space-x-2"
              >
                <TrendingUp className="w-5 h-5" />
                <span>CALL (Higher)</span>
              </button>

              <button
                onClick={() => placeTrade('PUT')}
                disabled={!isLoggedIn || user?.balance < tradeAmount}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed py-4 rounded-lg font-bold text-lg transition flex items-center justify-center space-x-2"
              >
                <TrendingDown className="w-5 h-5" />
                <span>PUT (Lower)</span>
              </button>
            </div>

            {!isLoggedIn && (
              <div className="bg-yellow-600/20 border border-yellow-600/30 rounded-lg p-3 text-center">
                <p className="text-sm text-yellow-300">
                  Login required to place trades
                </p>
              </div>
            )}

            {isLoggedIn && (
              <div className="bg-slate-700 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Active Trades:</span>
                  <span className="text-sm font-semibold">{activeTrades.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Total Invested:</span>
                  <span className="text-sm font-semibold">
                    ${activeTrades.reduce((sum, trade) => sum + trade.amount, 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Completed Trades:</span>
                  <span className="text-sm font-semibold">{tradeHistory.length}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trade History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden border border-slate-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Trading History</h3>
              <button
                onClick={() => setShowHistory(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="overflow-y-auto max-h-96">
              {tradeHistory.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  No completed trades yet
                </div>
              ) : (
                <div className="space-y-2">
                  {tradeHistory.map(trade => (
                    <div
                      key={trade.id}
                      className={`p-4 rounded-lg border-l-4 ${
                        trade.won
                          ? 'bg-green-900/20 border-green-500'
                          : 'bg-red-900/20 border-red-500'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="font-semibold">{trade.asset}</span>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              trade.direction === 'CALL' ? 'bg-green-600' : 'bg-red-600'
                            }`}>
                              {trade.direction}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              trade.won ? 'bg-green-600' : 'bg-red-600'
                            }`}>
                              {trade.won ? 'WON' : 'LOST'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
                            <div>
                              <div>Amount: ${trade.amount}</div>
                              <div>Entry: {formatPrice(trade.asset, trade.entryPrice)}</div>
                            </div>
                            <div>
                              <div>Close: {formatPrice(trade.asset, trade.closePrice)}</div>
                              <div>Duration: {trade.duration}s</div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${
                            trade.won ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {trade.won ? '+' : ''}${trade.profit.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-400">
                            {formatTime(trade.closeTime)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpertOptionTradingDashboard;