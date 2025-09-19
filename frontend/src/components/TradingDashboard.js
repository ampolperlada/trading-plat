import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Settings, User, LogOut, Wifi, DollarSign } from 'lucide-react';
import io from 'socket.io-client';
import apiService from './apiService'; // Assume this is your API service module

export default function TradingDashboard() {
  const [user, setUser] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState('EURUSD');
  const [selectedAmount, setSelectedAmount] = useState(10);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1m');
  const [activeCategory, setActiveCategory] = useState('All');
  const [marketData, setMarketData] = useState({});
  const [chartData, setChartData] = useState([]);
  const [isPlacingTrade, setIsPlacingTrade] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTrades, setActiveTrades] = useState([]);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [loginData, setLoginData] = useState({ email: 'demo@trading.com', password: 'demo123' });

  // Asset categories
  const assets = {
    'EURUSD': { name: 'Euro/US Dollar' },
    'GBPUSD': { name: 'British Pound' },
    'USDJPY': { name: 'US Dollar' },
    'BTCUSD': { name: 'Bitcoin' },
    'ETHUSD': { name: 'Ethereum' },
    'AAPL': { name: 'Apple Inc' },
    'TSLA': { name: 'Tesla Inc' },
    'GOOGL': { name: 'Alphabet Inc' },
    'GOLD': { name: 'Gold' },
    'OIL': { name: 'Crude Oil' }
  };

  const assetCategories = {
    'All': ['EURUSD', 'GBPUSD', 'USDJPY', 'BTCUSD', 'ETHUSD', 'AAPL', 'TSLA', 'GOOGL', 'GOLD', 'OIL'],
    'Forex': ['EURUSD', 'GBPUSD', 'USDJPY'],
    'Crypto': ['BTCUSD', 'ETHUSD']
  };

  // Initialize WebSocket and market data
  useEffect(() => {
    const socket = io('http://localhost:5000');

    socket.on('connect', () => {
      console.log('Connected to WebSocket');
      socket.emit('subscribe_prices', Object.keys(assets));
    });

    socket.on('price_update', (data) => {
      setMarketData(prev => ({
        ...prev,
        [data.symbol]: {
          ...(prev[data.symbol] || assets[data.symbol]),
          price: data.price,
          change: data.changePercent,
          timestamp: data.timestamp
        }
      }));
    });

    socket.on('trade_result', (result) => {
      setActiveTrades(prev => prev.filter(t => t.id !== result._id));
      if (result.result === 'win') {
        setUser(prev => ({ ...prev, balance: prev.balance + result.profit }));
      }
      setTradeHistory(prev => [...prev, result]);
    });

    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      setIsLoggedIn(true);
      fetchUserData();
      fetchHistory();
    }

    return () => {
      socket.disconnect();
    };
  }, []);

  // Fetch user data
  const fetchUserData = async () => {
    try {
      const response = await apiService.get('/user/profile');
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Fetch trade history
  const fetchHistory = async () => {
    try {
      const response = await apiService.get('/trades/history');
      setTradeHistory(response.data);
    } catch (error) {
      console.error('Error fetching trade history:', error);
    }
  };

  // Generate realistic candlestick chart data
  const generateChartData = (basePrice) => {
    const data = [];
    let currentPrice = parseFloat(basePrice);
    
    for (let i = 0; i < 50; i++) {
      const change = (Math.random() - 0.5) * 0.002;
      const open = currentPrice;
      const close = currentPrice + change;
      const high = Math.max(open, close) + Math.random() * 0.001;
      const low = Math.min(open, close) - Math.random() * 0.001;
      
      data.push({ 
        open, 
        high, 
        low, 
        close, 
        timestamp: Date.now() - (50 - i) * 60000,
        volume: Math.random() * 1000 + 500 
      });
      currentPrice = close;
    }
    setChartData(data);
  };

  // Update chart when asset changes
  useEffect(() => {
    if (marketData[selectedAsset]?.price) {
      generateChartData(marketData[selectedAsset].price);
    }
  }, [selectedAsset, marketData]);

  // Login function
  const handleLogin = async () => {
    if (loginData.email && loginData.password) {
      try {
        const userData = {
          email: loginData.email,
          balance: 10000,
          accountType: 'Demo',
          name: 'Demo User'
        };
        
        setUser(userData);
        setIsLoggedIn(true);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', 'demo-token-' + Date.now());
        await fetchUserData();
        await fetchHistory();
      } catch (error) {
        console.error('Login error:', error);
      }
    }
  };

  // Logout function
  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setTradeHistory([]);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // Place trade function
  const placeTrade = async (direction) => {
    if (!isLoggedIn) {
      alert('Please login to start trading');
      return;
    }

    if (user.balance < selectedAmount) {
      alert('Insufficient balance');
      return;
    }
    
    setIsPlacingTrade(true);
    
    const trade = {
      id: Date.now(),
      asset: selectedAsset,
      direction,
      amount: selectedAmount,
      entryPrice: parseFloat(marketData[selectedAsset]?.price),
      timestamp: Date.now(),
      expiryTime: Date.now() + (60 * 1000),
      status: 'active'
    };

    try {
      await apiService.post('/trades/place', trade);
      setActiveTrades(prev => [...prev, trade]);
      setUser(prev => ({
        ...prev,
        balance: prev.balance - selectedAmount
      }));
    } catch (error) {
      console.error('Error placing trade:', error);
      alert('Failed to place trade');
    }
    
    setIsPlacingTrade(false);
  };

  // Render professional candlestick chart
  const renderChart = () => {
    const width = 600;
    const height = 350;
    const padding = { top: 20, right: 80, bottom: 40, left: 60 };
    
    if (!chartData.length) {
      return (
        <div className="flex items-center justify-center h-80 bg-slate-800 rounded-lg">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <div className="text-gray-400">Loading chart...</div>
          </div>
        </div>
      );
    }

    const prices = chartData.flatMap(d => [d.high, d.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;
    
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const candleWidth = Math.max(chartWidth / chartData.length - 2, 6);

    return (
      <div className="bg-slate-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">{selectedAsset}</h2>
            <p className="text-gray-400 text-sm">{marketData[selectedAsset]?.name}</p>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-3xl font-mono text-white">{marketData[selectedAsset]?.price}</span>
              <span className={`text-lg font-semibold ${
                marketData[selectedAsset]?.change?.startsWith('+') ? 'text-green-400' : 
                marketData[selectedAsset]?.change?.startsWith('-') ? 'text-red-400' : 'text-gray-400'
              }`}>
                {marketData[selectedAsset]?.change}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Wifi className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-400">Connected</span>
          </div>
        </div>

        <div className="flex space-x-1 mb-4">
          {['1m', '5m', '15m', '30m', '1h', '4h', '1D'].map(tf => (
            <button
              key={tf}
              onClick={() => setSelectedTimeframe(tf)}
              className={`px-4 py-2 text-sm rounded font-semibold transition ${
                selectedTimeframe === tf 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        <svg width="100%" height="300" viewBox={`0 0 ${width} ${height}`} className="w-full">
          <rect width={width} height={height} fill="#1e293b" />
          
          {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
            const y = padding.top + chartHeight * ratio;
            const price = maxPrice - (priceRange * ratio);
            return (
              <g key={ratio}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#334155"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
                <text
                  x={width - padding.right + 5}
                  y={y + 4}
                  fill="#64748b"
                  fontSize="11"
                  fontFamily="monospace"
                >
                  {price.toFixed(5)}
                </text>
              </g>
            );
          })}

          {chartData.map((candle, i) => {
            const x = padding.left + (i * (candleWidth + 2)) + (candleWidth / 2);
            const isGreen = candle.close > candle.open;
            
            const yHigh = padding.top + ((maxPrice - candle.high) / priceRange) * chartHeight;
            const yLow = padding.top + ((maxPrice - candle.low) / priceRange) * chartHeight;
            const yOpen = padding.top + ((maxPrice - candle.open) / priceRange) * chartHeight;
            const yClose = padding.top + ((maxPrice - candle.close) / priceRange) * chartHeight;
            
            const bodyTop = Math.min(yOpen, yClose);
            const bodyHeight = Math.abs(yClose - yOpen) || 1;

            return (
              <g key={i}>
                <line
                  x1={x}
                  y1={yHigh}
                  x2={x}
                  y2={yLow}
                  stroke={isGreen ? "#22c55e" : "#ef4444"}
                  strokeWidth="2"
                />
                <rect
                  x={x - candleWidth/2}
                  y={bodyTop}
                  width={candleWidth}
                  height={bodyHeight}
                  fill={isGreen ? "#22c55e" : "#ef4444"}
                  stroke={isGreen ? "#16a34a" : "#dc2626"}
                  strokeWidth="1"
                />
              </g>
            );
          })}

          {marketData[selectedAsset] && (
            <>
              <line
                x1={padding.left}
                y1={padding.top + ((maxPrice - parseFloat(marketData[selectedAsset].price)) / priceRange) * chartHeight}
                x2={width - padding.right}
                y2={padding.top + ((maxPrice - parseFloat(marketData[selectedAsset].price)) / priceRange) * chartHeight}
                stroke="#3b82f6"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
              <rect
                x={width - padding.right - 70}
                y={padding.top + ((maxPrice - parseFloat(marketData[selectedAsset].price)) / priceRange) * chartHeight - 12}
                width="65"
                height="24"
                fill="#3b82f6"
                rx="4"
              />
              <text
                x={width - padding.right - 37}
                y={padding.top + ((maxPrice - parseFloat(marketData[selectedAsset].price)) / priceRange) * chartHeight + 4}
                fill="white"
                fontSize="12"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {marketData[selectedAsset].price}
              </text>
            </>
          )}
        </svg>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex">
      <div className="w-72 bg-slate-800 border-r border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">EO</span>
            </div>
            <span className="text-xl font-bold">ExpertOption</span>
          </div>
        </div>

        <div className="p-3 border-b border-slate-700">
          <div className="flex space-x-1">
            {['All', 'Forex', 'Crypto'].map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-3 py-2 text-sm rounded font-semibold transition ${
                  activeCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {assetCategories[activeCategory].map(symbol => {
            const data = marketData[symbol];
            const isSelected = selectedAsset === symbol;
            
            return (
              <div
                key={symbol}
                onClick={() => setSelectedAsset(symbol)}
                className={`p-4 cursor-pointer border-b border-slate-700/50 hover:bg-slate-700 transition ${
                  isSelected ? 'bg-slate-700 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold text-sm">{symbol}</div>
                    <div className="text-xs text-gray-400">{data?.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm font-semibold">{data?.price}</div>
                    <div className={`text-xs font-bold ${
                      data?.change?.startsWith('+') ? 'text-green-400' : 
                      data?.change?.startsWith('-') ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {data?.change}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-6">
          {renderChart()}
        </div>
      </div>

      <div className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-700">
          {!isLoggedIn ? (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Login to Your Account</h3>
                <p className="text-sm text-gray-400 mb-4">Welcome back to ExpertOption</p>
              </div>

              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="demo@trading.com"
                  value={loginData.email}
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
                <input
                  type="password"
                  placeholder="demo123"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
                <button
                  onClick={handleLogin}
                  className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-bold transition"
                >
                  Login
                </button>
              </div>

              <div className="text-center">
                <button className="text-blue-400 hover:text-blue-300 text-sm">
                  Don't have an account? Create one
                </button>
              </div>

              <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                <p className="text-sm font-semibold text-gray-300 mb-1">Demo Login:</p>
                <p className="text-xs text-gray-400">
                  demo@trading.com<br />
                  demo123<br />
                  Virtual Balance: $10,000
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-400">Balance</div>
                  <div className="text-2xl font-bold">${user.balance.toLocaleString()}</div>
                  <div className="text-sm text-blue-400">{user.accountType} Account</div>
                </div>
                <button 
                  onClick={handleLogout} 
                  className="text-gray-400 hover:text-white transition"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 p-4 space-y-4">
          <h3 className="text-lg font-bold">Trade</h3>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">Investment Amount</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={selectedAmount}
                onChange={(e) => setSelectedAmount(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                min="1"
                max={isLoggedIn ? user.balance : 1000}
                disabled={!isLoggedIn}
              />
            </div>
            <div className="flex space-x-2 mt-2">
              {[10, 25, 50, 100].map(amount => (
                <button
                  key={amount}
                  onClick={() => setSelectedAmount(amount)}
                  disabled={!isLoggedIn}
                  className={`px-3 py-1 text-sm rounded font-semibold transition disabled:opacity-50 ${
                    selectedAmount === amount ? 'bg-blue-600 text-white' : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
                  }`}
                >
                  ${amount}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-700 rounded-lg p-4">
            <div className="text-center">
              <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Current Price</div>
              <div className="text-2xl font-mono font-bold">{marketData[selectedAsset]?.price || '1.17581'}</div>
              <div className={`text-sm font-semibold ${
                marketData[selectedAsset]?.change?.startsWith('+') ? 'text-green-400' : 
                marketData[selectedAsset]?.change?.startsWith('-') ? 'text-red-400' : 'text-gray-400'
              }`}>
                {marketData[selectedAsset]?.change || '+0.00%'}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => placeTrade('CALL')}
              disabled={isPlacingTrade || !isLoggedIn}
              className="w-full bg-green-600 hover:bg-green-700 py-4 rounded-lg font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition"
            >
              <TrendingUp className="w-5 h-5" />
              <span>{isPlacingTrade ? 'Placing...' : 'CALL/Higher'}</span>
            </button>
            
            <button
              onClick={() => placeTrade('PUT')}
              disabled={isPlacingTrade || !isLoggedIn}
              className="w-full bg-red-600 hover:bg-red-700 py-4 rounded-lg font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition"
            >
              <TrendingDown className="w-5 h-5" />
              <span>{isPlacingTrade ? 'Placing...' : 'PUT/Lower'}</span>
            </button>
          </div>

          <div className="bg-slate-700 rounded-lg p-4">
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Payout:</span>
                <span className="text-green-400 font-semibold">80%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Profit:</span>
                <span className="text-green-400 font-semibold">+${(selectedAmount * 0.8).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Investment:</span>
                <span className="text-white font-semibold">${selectedAmount.toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-600 pt-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Return:</span>
                  <span className="text-white font-bold">${(selectedAmount + (selectedAmount * 0.8)).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {!isLoggedIn && (
            <div className="bg-slate-700/30 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-400">
                Login to start trading with CALL/PUT buttons
              </p>
            </div>
          )}

          {activeTrades.length > 0 && (
            <div className="bg-slate-700 rounded-lg p-4">
              <h4 className="text-sm font-semibold mb-2">Active Trades</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {activeTrades.slice(-3).map(trade => (
                  <div key={trade.id} className="text-xs bg-slate-600 rounded p-2">
                    <div className="flex justify-between">
                      <span>{trade.asset} {trade.direction}</span>
                      <span className={`font-semibold ${
                        trade.status === 'won' ? 'text-green-400' : 
                        trade.status === 'lost' ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {trade.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-gray-400">
                      ${trade.amount} → {trade.status === 'won' ? `$${trade.payout?.toFixed(2)}` : '$0'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tradeHistory.length > 0 && (
            <div className="bg-slate-700 rounded-lg p-4">
              <h4 className="text-sm font-semibold mb-2">Trade History</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {tradeHistory.slice(-3).map(trade => (
                  <div key={trade._id} className="text-xs bg-slate-600 rounded p-2">
                    <div className="flex justify-between">
                      <span>{trade.asset} {trade.direction}</span>
                      <span className={`font-semibold ${
                        trade.result === 'win' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {trade.result.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-gray-400">
                      ${trade.amount} → {trade.result === 'win' ? `$${trade.profit?.toFixed(2)}` : '$0'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}