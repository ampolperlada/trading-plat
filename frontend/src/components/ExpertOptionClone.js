import React, { useState, useEffect } from 'react';

const ExpertOptionClone = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState('EURUSD');
  const [selectedAmount, setSelectedAmount] = useState(10);
  const [tradeType, setTradeType] = useState(null);
  const [loginData, setLoginData] = useState({
    email: 'demo@trading.com',
    password: 'demo123'
  });
  const [showRegister, setShowRegister] = useState(false);
  const [isTrading, setIsTrading] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  // Mock asset data with real-time updates
  const [assets, setAssets] = useState({
    'EURUSD': { price: 1.08559, change: +0.74, name: 'Euro/US Dollar' },
    'GBPUSD': { price: 1.25481, change: -0.23, name: 'British Pound/US Dollar' },
    'USDJPY': { price: 150.58037, change: +0.15, name: 'US Dollar/Japanese Yen' },
    'BTCUSD': { price: 66104.38, change: +2.45, name: 'Bitcoin/US Dollar' },
    'ETHUSD': { price: 3124.27, change: +1.23, name: 'Ethereum/US Dollar' },
    'AAPL': { price: 156.61, change: -0.87, name: 'Apple Inc' },
    'TSLA': { price: 250.87, change: +0.02, name: 'Tesla Inc' },
    'GOOGL': { price: 143.61, change: +0.55, name: 'Alphabet Inc' },
    'GOLD': { price: 2028.15, change: +0.34, name: 'Gold' },
    'OIL': { price: 85.33, change: -0.12, name: 'Crude Oil' }
  });

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAssets(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(symbol => {
          const change = (Math.random() - 0.5) * 0.1;
          updated[symbol].price += change;
          updated[symbol].change = change;
        });
        return updated;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleLogin = async () => {
    // Simulate API call
    if (loginData.email === 'demo@trading.com' && loginData.password === 'demo123') {
      const userData = {
        id: 1,
        email: loginData.email,
        firstName: 'Demo',
        lastName: 'User',
        balance: 10000,
        accountType: 'demo'
      };
      
      localStorage.setItem('token', 'demo-token-123');
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      setIsLoggedIn(true);
    } else {
      alert('Invalid credentials. Use demo@trading.com / demo123');
    }
  };

  const handleTrade = async (type) => {
    if (!isLoggedIn) {
      alert('Please login to place trades');
      return;
    }

    setIsTrading(true);
    setTradeType(type);

    // Simulate trade execution
    setTimeout(() => {
      const isWin = Math.random() > 0.5;
      const profit = isWin ? selectedAmount * 0.8 : -selectedAmount;
      
      alert(`${type} trade ${isWin ? 'WON' : 'LOST'}! ${isWin ? '+' : ''}$${profit.toFixed(2)}`);
      
      if (isWin) {
        const updatedUser = { ...user, balance: user.balance + selectedAmount + profit };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        const updatedUser = { ...user, balance: user.balance - selectedAmount };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      setIsTrading(false);
      setTradeType(null);
    }, 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold">
                EO
              </div>
              <span className="text-xl font-bold">ExpertOption</span>
            </div>
            {isLoggedIn && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-400">Live Trading</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <div className="text-right">
                  <div className="text-sm text-slate-400">BALANCE</div>
                  <div className="text-xl font-bold text-green-400">${user.balance.toLocaleString()}</div>
                </div>
                <div className="bg-blue-600 px-3 py-1 rounded-full text-sm">Demo Account</div>
                <button 
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-white transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="text-slate-400">Login to start trading</div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        
        {/* Left Sidebar - Assets */}
        <div className="w-64 bg-slate-800 border-r border-slate-700 overflow-y-auto">
          <div className="p-4">
            <div className="flex space-x-1 mb-4">
              <button className="px-3 py-2 bg-blue-600 text-white rounded text-sm font-medium">All</button>
              <button className="px-3 py-2 text-slate-400 hover:text-white rounded text-sm">Forex</button>
              <button className="px-3 py-2 text-slate-400 hover:text-white rounded text-sm">Crypto</button>
            </div>
            <div className="space-y-1">
              {Object.entries(assets).map(([symbol, data]) => (
                <button
                  key={symbol}
                  onClick={() => setSelectedAsset(symbol)}
                  className={`w-full p-3 rounded-lg text-left transition ${
                    selectedAsset === symbol ? 'bg-slate-700' : 'hover:bg-slate-750'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{symbol}</div>
                      <div className="text-xs text-slate-400">{data.name.split('/')[0]}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm">{data.price.toFixed(5)}</div>
                      <div className={`text-xs ${data.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {data.change >= 0 ? '+' : ''}{data.change.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center - Chart */}
        <div className="flex-1 bg-slate-900 p-6">
          <div className="bg-slate-800 rounded-xl h-full">
            {/* Chart Header */}
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{selectedAsset}</h2>
                  <p className="text-slate-400">{assets[selectedAsset]?.name}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-3xl font-mono">{assets[selectedAsset]?.price.toFixed(5)}</span>
                    <span className={`text-lg ${assets[selectedAsset]?.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {assets[selectedAsset]?.change >= 0 ? '+' : ''}{assets[selectedAsset]?.change.toFixed(2)}%
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {['1m', '5m', '15m', '30m', '1h', '4h', '1D'].map((timeframe) => (
                    <button 
                      key={timeframe}
                      className={`px-3 py-1 rounded text-sm ${timeframe === '1m' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      {timeframe}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Chart Area */}
            <div className="p-6 h-[calc(100%-120px)]">
              <div className="h-full bg-slate-900 rounded-lg flex items-center justify-center relative overflow-hidden">
                {/* Simulated Chart */}
                <div className="absolute inset-0 p-4">
                  <svg className="w-full h-full">
                    {/* Grid lines */}
                    <defs>
                      <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                        <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#374151" strokeWidth="0.5"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                    
                    {/* Sample candlestick chart */}
                    {Array.from({length: 50}, (_, i) => {
                      const x = (i * 20) + 10;
                      const high = Math.random() * 200 + 100;
                      const low = high - Math.random() * 50;
                      const open = low + Math.random() * (high - low);
                      const close = low + Math.random() * (high - low);
                      const isGreen = close > open;
                      
                      return (
                        <g key={i}>
                          {/* Wick */}
                          <line x1={x} y1={high} x2={x} y2={low} stroke="#64748b" strokeWidth="1"/>
                          {/* Body */}
                          <rect 
                            x={x-3} 
                            y={Math.min(open, close)} 
                            width="6" 
                            height={Math.abs(close - open) || 1}
                            fill={isGreen ? '#10b981' : '#ef4444'}
                          />
                        </g>
                      );
                    })}
                  </svg>
                </div>
                
                <div className="absolute top-4 left-4 bg-slate-800/80 rounded-lg p-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Connected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Trading Panel / Login */}
        <div className="w-80 bg-slate-800 border-l border-slate-700">
          {!isLoggedIn ? (
            /* Login Panel */
            <div className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">Login to Your Account</h3>
                <p className="text-slate-400">Welcome back to ExpertOption</p>
              </div>

              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                  required
                />
                <button
                  onClick={handleLogin}
                  className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-bold transition"
                >
                  Login
                </button>
              </div>

              <div className="text-center mt-4">
                <button className="text-blue-400 hover:text-blue-300 text-sm">
                  Don't have an account? Create one
                </button>
              </div>

              <div className="bg-slate-700/50 rounded-lg p-4 mt-6">
                <p className="text-sm text-slate-300 text-center">
                  <strong>Demo Login:</strong><br/>
                  demo@trading.com<br/>
                  demo123
                </p>
              </div>
            </div>
          ) : (
            /* Trading Panel */
            <div className="p-6">
              <h3 className="text-xl font-bold mb-6">Trade Panel</h3>
              
              {/* Investment Amount */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">Investment Amount</label>
                <div className="flex space-x-2 mb-3">
                  {[10, 25, 50].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setSelectedAmount(amount)}
                      className={`flex-1 py-2 rounded font-medium transition ${
                        selectedAmount === amount
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={selectedAmount}
                  onChange={(e) => setSelectedAmount(parseInt(e.target.value) || 10)}
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  min="1"
                  max="5000"
                />
              </div>

              {/* Trade Duration */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">Trade Duration</label>
                <select className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white">
                  <option value="60">1 minute</option>
                  <option value="300">5 minutes</option>
                  <option value="900">15 minutes</option>
                </select>
              </div>

              {/* Trade Buttons */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => handleTrade('CALL')}
                  disabled={isTrading}
                  className="w-full bg-green-600 hover:bg-green-700 py-4 rounded-lg font-bold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTrading && tradeType === 'CALL' ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Placing...</span>
                    </div>
                  ) : (
                    'CALL/Higher'
                  )}
                </button>
                <button
                  onClick={() => handleTrade('PUT')}
                  disabled={isTrading}
                  className="w-full bg-red-600 hover:bg-red-700 py-4 rounded-lg font-bold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTrading && tradeType === 'PUT' ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Placing...</span>
                    </div>
                  ) : (
                    'PUT/Lower'
                  )}
                </button>
              </div>

              {/* Trade Info */}
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Payout:</span>
                    <span className="text-green-400">80%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Profit:</span>
                    <span className="text-green-400">+${(selectedAmount * 0.8).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Investment:</span>
                    <span>${selectedAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t border-slate-600">
                    <span>Total Return:</span>
                    <span className="text-green-400">${(selectedAmount + selectedAmount * 0.8).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Current Price */}
              <div className="mt-6 text-center">
                <div className="text-sm text-slate-400 mb-1">CURRENT PRICE</div>
                <div className="text-2xl font-mono font-bold">{assets[selectedAsset]?.price.toFixed(5)}</div>
                <div className={`text-sm ${assets[selectedAsset]?.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {assets[selectedAsset]?.change >= 0 ? '+' : ''}{assets[selectedAsset]?.change.toFixed(2)}%
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpertOptionClone;