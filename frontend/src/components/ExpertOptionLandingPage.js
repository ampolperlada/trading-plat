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
  CheckCircle
} from 'lucide-react';
import apiService from '../services/api';

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
          expiryTimeSeconds: selectedTime
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
        status: 'active'
      };
      setActiveTrades(prev => [...prev, newTrade]);
      setUser(prev => ({ ...prev, balance: prev.balance - selectedAmount }));
    } catch (error) {
      console.error("❌ Error placing trade:", error);
      alert(`Failed to place trade: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Trading Dashboard Header */}
      <header className="bg-slate-800 border-b border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <img src="/expertoption-logo.png" alt="ExpertOption" className="w-8 h-8" />
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
          <div className="bg-slate-800 p-6 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{selectedAsset}</h2>
                <p className="text-slate-300 text-sm">{assets[selectedAsset]?.name}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-mono font-bold">
                  {formatPrice(selectedAsset, marketData[selectedAsset]?.price)}
                </div>
                <div className={`text-lg font-semibold ${
                  (marketData[selectedAsset]?.change || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {(marketData[selectedAsset]?.change || 0) >= 0 ? '+' : ''}
                  {(marketData[selectedAsset]?.change || 0).toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 p-6">
            <div className="h-full bg-slate-800 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Live Chart</h3>
                <p className="text-slate-300 text-sm">Real-time price movements for {selectedAsset}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Trading */}
        <div className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col">
          <div className="p-6 space-y-6">
            <h2 className="text-2xl font-bold">Trade Options</h2>
            
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-3">Investment Amount</label>
              <input
                type="number"
                value={selectedAmount}
                onChange={(e) => setSelectedAmount(Number(e.target.value))}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 text-center font-mono text-base"
                min="1"
                max={user.balance}
              />
              <div className="grid grid-cols-3 gap-6 mt-3">
                {[10, 25, 50, 100, 250, 500].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setSelectedAmount(amount)}
                    disabled={user.balance < amount}
                    className={`p-3 text-sm rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 ${
                      selectedAmount === amount ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-100 hover:bg-slate-600'
                    } disabled:opacity-50`}
                  >
                    ${amount}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-3">Expiry Time</label>
              <div className="grid grid-cols-5 gap-6">
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
                    className={`p-3 text-sm rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 ${
                      selectedTime === interval.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-100 hover:bg-slate-600'
                    }`}
                  >
                    {interval.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-700 rounded-lg p-6 text-center">
              <div className="text-xs text-slate-300 uppercase tracking-wide mb-1">Current Price</div>
              <div className="text-2xl font-mono font-bold">
                {formatPrice(selectedAsset, marketData[selectedAsset]?.price)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <button
                onClick={() => placeTrade('PUT')}
                disabled={user.balance < selectedAmount}
                className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 flex flex-col items-center space-y-2"
              >
                <TrendingDown className="w-6 h-6" />
                <span className="text-base">PUT</span>
                <span className="text-xs text-slate-300">Lower</span>
              </button>
              
              <button
                onClick={() => placeTrade('CALL')}
                disabled={user.balance < selectedAmount}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 flex flex-col items-center space-y-2"
              >
                <TrendingUp className="w-6 h-6" />
                <span className="text-base">CALL</span>
                <span className="text-xs text-slate-300">Higher</span>
              </button>
            </div>

            <div className="bg-slate-700 rounded-lg p-6 space-y-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Payout:</span>
                <span className="text-emerald-400 font-semibold">80%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Profit:</span>
                <span className="text-emerald-400 font-semibold">+${(selectedAmount * 0.8).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Investment:</span>
                <span className="text-slate-100 font-semibold">${selectedAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex-1 border-t border-slate-700 p-6 space-y-6">
            <h3 className="text-lg font-semibold">Active Trades ({activeTrades.length})</h3>
            <div className="space-y-6 max-h-64 overflow-y-auto">
              {activeTrades.map(trade => {
                const timeLeft = Math.max(0, Math.ceil((trade.expiryTime - Date.now()) / 1000));
                return (
                  <div key={trade.id} className="bg-slate-700 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-base">{trade.asset}</span>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        trade.direction === 'CALL' ? 'bg-emerald-600' : 'bg-rose-600'
                      }`}>
                        {trade.direction}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>${trade.amount}</span>
                      <span>{timeLeft}s</span>
                    </div>
                    <div className="text-xs text-slate-300">
                      Entry: {formatPrice(trade.asset, trade.entryPrice)}
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-1 mt-2">
                      <div 
                        className="bg-blue-500 h-1 rounded-full transition-all duration-1000"
                        style={{ width: `${(timeLeft / selectedTime) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
              {activeTrades.length === 0 && (
                <div className="text-center text-slate-300 text-sm py-8">
                  No active trades
                </div>
              )}
            </div>

            <h3 className="text-lg font-semibold mt-6">Trade History ({tradeHistory.length})</h3>
            <div className="space-y-6 max-h-64 overflow-y-auto">
              {tradeHistory.length > 0 ? (
                tradeHistory.slice(0, 10).map(trade => (
                  <div key={trade._id} className="bg-slate-700 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-base">{trade.asset}</span>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        trade.result === 'win' ? 'bg-emerald-600' : trade.result === 'loss' ? 'bg-rose-600' : 'bg-yellow-600'
                      }`}>
                        {trade.result?.toUpperCase() || 'PENDING'}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>${trade.amount.toFixed(2)}</span>
                      <span>{trade.direction}</span>
                    </div>
                    {trade.result && (
                      <div className="text-xs text-slate-300">
                        Profit: <span className={trade.result === 'win' ? 'text-emerald-400' : 'text-rose-400'}>
                          ${trade.profit?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                    )}
                    <div className="text-xs text-slate-400 mt-1">
                      {new Date(trade.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-300 text-sm py-8">
                  No trade history
                </div>
              )}
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
            <h2 className="text-2xl font-bold">
              {authMode === 'login' ? 'Login' : 'Create Account'}
            </h2>
            <button
              onClick={() => setShowAuthModal(false)}
              className="text-slate-300 hover:text-slate-100 text-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
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
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={registerForm.lastName}
                    onChange={(e) => setRegisterForm({...registerForm, lastName: e.target.value})}
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
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
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
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
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
              required
            />

            {authMode === 'register' && (
              <input
                type="password"
                placeholder="Confirm Password"
                value={registerForm.confirmPassword}
                onChange={(e) => setRegisterForm({...registerForm, confirmPassword: e.target.value})}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                required
              />
            )}

            <button
              type="submit"
              disabled={authLoading}
              onClick={handleAuth}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:bg-blue-800 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
            >
              {authLoading ? 'Please wait...' : (authMode === 'login' ? 'Login' : 'Create Account')}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-slate-300 text-sm">
              {authMode === 'login' ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'register' : 'login');
                  setAuthError('');
                }}
                className="text-blue-600 hover:text-blue-700 ml-1 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
              >
                {authMode === 'login' ? 'Sign up' : 'Login'}
              </button>
            </p>
          </div>

          {authMode === 'login' && (
            <div className="mt-6 p-6 bg-slate-700/50 rounded-lg">
              <p className="text-xs text-slate-300 text-center">
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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-100 text-base">Loading...</div>
      </div>
    );
  }

  if (showTradingDashboard) {
    return (
      <div>
        <div className="absolute top-4 left-4 z-50">
          <button
            onClick={handleBackToLanding}
            className="bg-slate-700 hover:bg-slate-600 text-slate-100 px-6 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
          >
            ← Back to Landing
          </button>
        </div>
        <TradingDashboard />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-slate-100">
      <header className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50">
        <nav className="container mx-auto p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-slate-300 hover:text-slate-100 transition-all duration-200 md:hidden focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="w-4 h-3 bg-rose-600 rounded-sm"></div>
                <span className="text-slate-300 text-sm">Online chat</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <img src="/expertoption-logo.png" alt="ExpertOption" className="w-8 h-8" />
              <span className="text-slate-100 text-lg font-bold">ExpertOption</span>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <button 
                onClick={handleNavigation}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
              >
                Login
              </button>
              <button 
                onClick={handleRegister}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
              >
                Register
              </button>
            </div>

            {mobileMenuOpen && (
              <div className="absolute top-full left-0 right-0 bg-slate-900 border-t border-slate-700 md:hidden">
                <div className="flex flex-col items-center space-y-6 p-6">
                  <button 
                    onClick={handleNavigation}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                  >
                    Login
                  </button>
                  <button 
                    onClick={handleRegister}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                  >
                    Register
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>
      </header>

      <section className="container mx-auto p-6">
        <div className="grid lg:grid-cols-2 gap-6 items-center">
          <div className="space-y-6">
            <h1 className="text-2xl font-bold leading-tight">
              <span className="text-blue-600">Investing</span> Is<br />
              Even Better Now
            </h1>
            
            <p className="text-slate-300 text-base leading-relaxed max-w-md">
              Providing you with the opportunity to invest in more than 100 assets for continuous income
            </p>

            <div className="flex items-center space-x-6">
              <div className="flex -space-x-1">
                <div className="w-8 h-8 bg-blue-600 rounded-full border-2 border-slate-900 flex items-center justify-center">
                  <span className="text-slate-100 text-xs font-bold">f</span>
                </div>
                <div className="w-8 h-8 bg-rose-600 rounded-full border-2 border-slate-900 flex items-center justify-center">
                  <span className="text-slate-100 text-xs font-bold">m</span>
                </div>
                <div className="w-8 h-8 bg-rose-600 rounded-full border-2 border-slate-900 flex items-center justify-center">
                  <span className="text-slate-100 text-xs font-bold">yt</span>
                </div>
                <div className="w-8 h-8 bg-blue-600 rounded-full border-2 border-slate-900 flex items-center justify-center">
                  <span className="text-slate-100 text-xs font-bold">t</span>
                </div>
                <div className="w-8 h-8 bg-emerald-600 rounded-full border-2 border-slate-900 flex items-center justify-center">
                  <span className="text-slate-100 text-xs font-bold">G</span>
                </div>
              </div>
              <span className="text-slate-300 text-base">+100 assets</span>
            </div>

            <button 
              onClick={handleNavigation}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
            >
              <span>Try free demo</span>
              <Play className="w-5 h-5 fill-current" />
            </button>
          </div>

          <div className="relative flex justify-center lg:justify-start lg:ml-8">
            <div className="relative">
              <div className="w-72 h-[520px] relative transform rotate-3">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl shadow-2xl border-4 border-slate-600">
                  <div className="p-6 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-4 text-slate-100 text-sm">
                      <span>9:41</span>
                      <div className="flex space-x-1">
                        <div className="w-4 h-1 bg-slate-100 rounded-full"></div>
                        <div className="w-1 h-1 bg-slate-100 rounded-full"></div>
                        <div className="w-1 h-1 bg-slate-100 rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex-1 space-y-6">
                      {['Stocks', 'Indices', 'Metals', 'Commodities', 'ETF'].map((item, i) => (
                        <div key={i} className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-center relative overflow-hidden">
                          <div className="text-slate-100 font-semibold text-base">{item}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="absolute top-24 -right-12 w-64 h-64 bg-slate-700 rounded-lg border-2 border-slate-600 shadow-lg opacity-80">
                  <div className="p-6 h-full">
                    <div className="space-y-6">
                      <div className="h-3 bg-slate-600 rounded w-full"></div>
                      <div className="h-2 bg-slate-600 rounded w-3/4"></div>
                      <div className="space-y-1 mt-2">
                        {['Tesla', 'Apple', 'IBM', 'Google', 'Netflix', 'Facebook (META)'].map((asset, i) => (
                          <div key={i} className="h-1 bg-slate-600 rounded" style={{width: `${50 + Math.random() * 50}%`}}></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute top-12 -right-6 bg-rose-600 rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                  <span className="text-slate-100 text-sm font-bold">T</span>
                </div>
                <div className="absolute bottom-16 -left-8 bg-blue-600 rounded-lg px-3 py-2 shadow-lg transform -rotate-12">
                  <span className="text-slate-100 text-sm font-medium">Asset List</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-800/50 py-16">
        <div className="container mx-auto p-6">
          <h2 className="text-2xl font-bold text-center mb-12">For All Devices</h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Smartphone, name: 'Android', desc: '4.4 and higher' },
              { icon: Smartphone, name: 'iOS', desc: '9.0 and higher' },
              { icon: Monitor, name: 'Windows', desc: '7 and higher' },
              { icon: Monitor, name: 'MacOS', desc: 'Macintosh and Safari' }
            ].map((platform, i) => (
              <div key={i} className="text-center group">
                <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-700 transition-all duration-200">
                  <platform.icon className="w-8 h-8 text-slate-100" />
                </div>
                <h3 className="text-slate-100 font-semibold text-lg mb-1">{platform.name}</h3>
                <p className="text-slate-300 text-sm">{platform.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto p-6">
          <h2 className="text-2xl font-bold text-center mb-12">How It Works</h2>
          
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
                  <step.icon className="w-8 h-8 text-slate-100" />
                </div>
                <h3 className="text-slate-100 font-semibold text-lg mb-3">{step.title}</h3>
                <p className="text-slate-300 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-800/50 py-12">
        <div className="container mx-auto p-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-slate-100" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Trusted</h2>
            <p className="text-slate-300 text-sm max-w-xl mx-auto mb-6">
              ExpertOption is trusted by traders from around the world and are trusted by more than 70,000,000 clients.
            </p>
            
            <button 
              onClick={handleNavigation}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
            >
              Start trading
            </button>

            <div className="bg-slate-700/30 rounded-lg p-6 max-w-sm mx-auto mt-6">
              <div className="flex items-center space-x-3">
                <Award className="w-8 h-8 text-blue-600 flex-shrink-0" />
                <div className="text-left">
                  <div className="text-slate-100 font-medium text-base">Best Trading Platform</div>
                  <div className="text-slate-300 text-sm">Award winner at China Foreign Expo</div>
                  <div className="text-slate-300 text-sm">ShowChina 6/7 May 2017</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto p-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <Globe className="w-8 h-8 text-blue-600" />
              <h2 className="text-2xl font-bold">Global Trading Platform</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              {[
                { value: '$1B', label: 'Minimum Deposit' },
                { value: '$1', label: 'Minimum Trading Amount' },
                { value: '0%', label: 'Commissions' },
                { value: '0%', label: 'Fees' }
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">{stat.value}</div>
                  <div className="text-slate-100 text-sm font-medium">{stat.label}</div>
                </div>
              ))}
            </div>

            <p className="text-slate-300 text-sm mb-6">People from 48 countries trade at ExpertOption</p>

            <div className="relative h-96 mt-12 mb-12">
              <svg 
                viewBox="0 0 1200 600" 
                className="w-full h-full"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M600,300 m-200,0 a200,200 0 1,1 400,0 a200,200 0 1,1-400,0"
                  stroke="#374151" 
                  strokeWidth="1" 
                  fill="none"
                />
                <g className="opacity-30">
                  {Array.from({length: 100}).map((_, i) => (
                    <circle 
                      key={i}
                      cx={Math.random() * 1200}
                      cy={Math.random() * 600}
                      r={Math.random() * 2 + 1}
                      fill="#374151"
                    />
                  ))}
                </g>
              </svg>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-800/50 py-16">
        <div className="container mx-auto p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Start Trading?</h2>
          <p className="text-slate-300 text-sm mb-8 max-w-2xl mx-auto">
            Join millions of traders worldwide and experience professional trading.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button 
              onClick={handleNavigation}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
            >
              Try Free Demo
            </button>
            <button 
              onClick={handleNavigation}
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
            >
              Start Real Trading
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 border-t border-slate-700">
        <div className="container mx-auto p-6">
          <div className="grid md:grid-cols-6 gap-6">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <img src="/expertoption-logo.png" alt="ExpertOption" className="w-8 h-8" />
                <span className="text-slate-100 font-bold">ExpertOption</span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                The Company does not provide services to citizens and/or residents of Australia, Austria, Belarus, Belgium, Bulgaria, Canada, Croatia, Cyprus, Czech Republic, Denmark, Estonia, Finland, France, Germany, Greece, Hungary, Iceland, Iran, Ireland, Israel, Italy, Latvia, Liechtenstein, Lithuania, Luxembourg, Malta, Myanmar, Netherlands, North Korea, Norway, Poland, Portugal, Romania, Russia, Singapore, Slovakia, Slovenia, Spain, Sudan, Sweden, Switzerland, UK, Ukraine, USA, Yemen.
              </p>
            </div>

            <div>
              <h4 className="text-slate-100 font-semibold text-lg mb-4">Home</h4>
              <ul className="space-y-6">
                <li><a href="#" className="text-slate-300 hover:text-slate-100 transition-all duration-200 text-sm">Free demo</a></li>
                <li><a href="#" className="text-slate-300 hover:text-slate-100 transition-all duration-200 text-sm">Login</a></li>
                <li><a href="#" className="text-slate-300 hover:text-slate-100 transition-all duration-200 text-sm">Registration</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-slate-100 font-semibold text-lg mb-4">Trading</h4>
              <ul className="space-y-6">
                <li><a href="#" className="text-slate-300 hover:text-slate-100 transition-all duration-200 text-sm">Features</a></li>
                <li><a href="#" className="text-slate-300 hover:text-slate-100 transition-all duration-200 text-sm">Account types</a></li>
                <li><a href="#" className="text-slate-300 hover:text-slate-100 transition-all duration-200 text-sm">Social trading</a></li>
                <li><a href="#" className="text-slate-300 hover:text-slate-100 transition-all duration-200 text-sm">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-slate-100 font-semibold text-lg mb-4">Company</h4>
              <ul className="space-y-6">
                <li><a href="#" className="text-slate-300 hover:text-slate-100 transition-all duration-200 text-sm">About company</a></li>
                <li><a href="#" className="text-slate-300 hover:text-slate-100 transition-all duration-200 text-sm">Terms</a></li>
                <li><a href="#" className="text-slate-300 hover:text-slate-100 transition-all duration-200 text-sm">Privacy Policy</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-slate-100 font-semibold text-lg mb-4">Payment methods</h4>
              <div className="grid grid-cols-2 gap-6">
                {['VISA', 'MC', 'PayPal', 'Skrill', 'Neteller', 'Binance Pay'].map((method) => (
                  <div key={method} className="bg-slate-800 rounded-lg p-6 text-center">
                    <span className="text-slate-100 text-xs font-medium">{method}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-8 mt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-slate-300 text-sm">
                © 2014 - 2024 ExpertOption. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                {['f', 't', 'in', 'yt'].map((social) => (
                  <a key={social} href="#" className="text-slate-300 hover:text-slate-100 transition-all duration-200">
                    <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center">
                      <span className="text-xs">{social}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>

      <AuthModal />
    </div>
  );
};

export default ExpertOptionLandingPage;