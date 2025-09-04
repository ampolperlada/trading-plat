// src/components/ExpertOptionClone.js - Enhanced with Real CoinGecko Integration
import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, User, LogOut, Wifi, WifiOff, DollarSign, History, Plus, Minus } from 'lucide-react';

export default function ExpertOptionClone() {
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
  const [showHistory, setShowHistory] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Enhanced CoinGecko Asset Configuration
  const COINGECKO_ASSETS = {
    'BTCUSD': 'bitcoin',
    'ETHUSD': 'ethereum',
    'ADAUSD': 'cardano',
    'SOLUSD': 'solana',
    'DOGEUSD': 'dogecoin',
    'MATICUSD': 'matic-network',
    'LINKUSD': 'chainlink',
    'DOTUSD': 'polkadot',
    'AVAXUSD': 'avalanche-2',
    'ATOMUSD': 'cosmos'
  };

  // Asset categories with enhanced crypto selection
  const assetCategories = {
    'All': ['EURUSD', 'GBPUSD', 'USDJPY', 'BTCUSD', 'ETHUSD', 'ADAUSD', 'SOLUSD', 'AAPL', 'TSLA', 'GOOGL', 'GOLD', 'OIL'],
    'Forex': ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD'],
    'Crypto': ['BTCUSD', 'ETHUSD', 'ADAUSD', 'SOLUSD', 'DOGEUSD', 'MATICUSD', 'LINKUSD', 'DOTUSD', 'AVAXUSD', 'ATOMUSD'],
    'Stocks': ['AAPL', 'TSLA', 'GOOGL', 'AMZN', 'MSFT', 'NVDA'],
    'Commodities': ['GOLD', 'SILVER', 'OIL', 'COPPER']
  };

  // Enhanced asset info with more detailed configuration
  const assetInfo = {
    // Forex
    'EURUSD': { name: 'Euro/US Dollar', icon: '💱', basePrice: 1.08501, decimals: 5, type: 'forex' },
    'GBPUSD': { name: 'British Pound/US Dollar', icon: '💱', basePrice: 1.24890, decimals: 5, type: 'forex' },
    'USDJPY': { name: 'US Dollar/Japanese Yen', icon: '💱', basePrice: 150.344, decimals: 3, type: 'forex' },
    'AUDUSD': { name: 'Australian Dollar/US Dollar', icon: '💱', basePrice: 0.66789, decimals: 5, type: 'forex' },
    'USDCAD': { name: 'US Dollar/Canadian Dollar', icon: '💱', basePrice: 1.37234, decimals: 5, type: 'forex' },
    'NZDUSD': { name: 'New Zealand Dollar/US Dollar', icon: '💱', basePrice: 0.59876, decimals: 5, type: 'forex' },

    // Crypto (Real CoinGecko data)
    'BTCUSD': { name: 'Bitcoin', icon: '₿', basePrice: 65000, decimals: 0, type: 'crypto' },
    'ETHUSD': { name: 'Ethereum', icon: 'Ξ', basePrice: 3100, decimals: 0, type: 'crypto' },
    'ADAUSD': { name: 'Cardano', icon: '₳', basePrice: 0.45, decimals: 3, type: 'crypto' },
    'SOLUSD': { name: 'Solana', icon: '◎', basePrice: 110, decimals: 2, type: 'crypto' },
    'DOGEUSD': { name: 'Dogecoin', icon: 'Ð', basePrice: 0.08, decimals: 4, type: 'crypto' },
    'MATICUSD': { name: 'Polygon', icon: '⬟', basePrice: 0.85, decimals: 3, type: 'crypto' },
    'LINKUSD': { name: 'Chainlink', icon: '🔗', basePrice: 15, decimals: 2, type: 'crypto' },
    'DOTUSD': { name: 'Polkadot', icon: '●', basePrice: 7.5, decimals: 2, type: 'crypto' },
    'AVAXUSD': { name: 'Avalanche', icon: '▲', basePrice: 38, decimals: 2, type: 'crypto' },
    'ATOMUSD': { name: 'Cosmos', icon: '⚛', basePrice: 9.2, decimals: 2, type: 'crypto' },

    // Stocks
    'AAPL': { name: 'Apple Inc', icon: '🍎', basePrice: 189.47, decimals: 2, type: 'stock' },
    'TSLA': { name: 'Tesla Inc', icon: '🚗', basePrice: 248.91, decimals: 2, type: 'stock' },
    'GOOGL': { name: 'Alphabet Inc', icon: '🔍', basePrice: 138.21, decimals: 2, type: 'stock' },
    'AMZN': { name: 'Amazon Inc', icon: '📦', basePrice: 145.67, decimals: 2, type: 'stock' },
    'MSFT': { name: 'Microsoft Corp', icon: '💻', basePrice: 378.91, decimals: 2, type: 'stock' },
    'NVDA': { name: 'NVIDIA Corp', icon: '🎮', basePrice: 520.34, decimals: 2, type: 'stock' },

    // Commodities
    'GOLD': { name: 'Gold', icon: '🥇', basePrice: 2027.40, decimals: 2, type: 'commodity' },
    'SILVER': { name: 'Silver', icon: '🥈', basePrice: 23.45, decimals: 2, type: 'commodity' },
    'OIL': { name: 'Crude Oil', icon: '🛢️', basePrice: 85.24, decimals: 2, type: 'commodity' },
    'COPPER': { name: 'Copper', icon: '🔶', basePrice: 3.87, decimals: 3, type: 'commodity' }
  };

  // Enhanced CoinGecko API fetch with better error handling and retry logic
  const fetchCryptoPrices = async (retryCount = 0) => {
    try {
      setIsConnected(true);
      const ids = Object.values(COINGECKO_ASSETS).join(',');
      
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      const cryptoPrices = {};

      // Map the API response to our asset format
      Object.entries(COINGECKO_ASSETS).forEach(([symbol, coinId]) => {
        const coinData = data[coinId];
        if (coinData && coinData.usd) {
          cryptoPrices[symbol] = {
            price: coinData.usd,
            change: coinData.usd_24h_change || 0,
            volume: coinData.usd_24h_vol || 0,
            timestamp: Date.now(),
            source: 'coingecko'
          };
        }
      });

      console.log(`✅ CoinGecko API: Fetched ${Object.keys(cryptoPrices).length} crypto prices`);
      setLastUpdate(Date.now());
      return cryptoPrices;

    } catch (error) {
      console.error('CoinGecko API Error:', error);
      setIsConnected(false);
      
      // Retry logic with exponential backoff
      if (retryCount < 3) {
        console.log(`🔄 Retrying CoinGecko API in ${(retryCount + 1) * 2} seconds...`);
        setTimeout(() => {
          fetchCryptoPrices(retryCount + 1);
        }, (retryCount + 1) * 2000);
      }
      
      return {};
    }
  };

  // Generate realistic mock prices for non-crypto assets
  const generateMockPrices = (baseData = {}) => {
    const mockPrices = {};
    
    Object.entries(assetInfo).forEach(([symbol, info]) => {
      if (info.type !== 'crypto') {
        const previousPrice = baseData[symbol]?.price || info.basePrice;
        const variation = (Math.random() - 0.5) * 0.001; // 0.1% max variation
        const newPrice = previousPrice * (1 + variation);
        const changePercent = ((newPrice - info.basePrice) / info.basePrice) * 100;
        
        mockPrices[symbol] = {
          price: Math.max(0.0001, newPrice),
          change: changePercent,
          volume: Math.random() * 1000000 + 500000,
          timestamp: Date.now(),
          source: 'mock'
        };
      }
    });
    
    return mockPrices;
  };

  // Initialize market data
  useEffect(() => {
    const initializeData = async () => {
      console.log('🚀 Initializing ExpertOption with enhanced CoinGecko integration...');
      
      // Check for existing user session
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (userData && token) {
        setUser(JSON.parse(userData));
        setIsLoggedIn(true);
      }

      // Initialize prices
      const [cryptoPrices, mockPrices] = await Promise.all([
        fetchCryptoPrices(),
        Promise.resolve(generateMockPrices())
      ]);

      const allPrices = { ...mockPrices, ...cryptoPrices };
      setMarketData(allPrices);
      generateChartData(selectedAsset, allPrices);
      
      console.log(`📊 Market data initialized with ${Object.keys(allPrices).length} assets`);
    };

    initializeData();
  }, []);

  // Enhanced real-time price updates every 15 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      console.log('🔄 Updating market prices...');
      
      const [cryptoPrices, mockPrices] = await Promise.all([
        fetchCryptoPrices(),
        Promise.resolve(generateMockPrices(marketData))
      ]);

      const allPrices = { ...mockPrices, ...cryptoPrices };
      
      setMarketData(prevData => {
        // Smooth price transitions to avoid jarring jumps
        const smoothedPrices = {};
        Object.entries(allPrices).forEach(([symbol, newData]) => {
          const oldData = prevData[symbol];
          if (oldData && newData.source === 'mock') {
            // For mock data, ensure smoother transitions
            const maxChange = oldData.price * 0.002; // Max 0.2% change per update
            const priceDiff = newData.price - oldData.price;
            const smoothedPrice = oldData.price + Math.max(-maxChange, Math.min(maxChange, priceDiff));
            
            smoothedPrices[symbol] = {
              ...newData,
              price: smoothedPrice
            };
          } else {
            smoothedPrices[symbol] = newData;
          }
        });
        
        return smoothedPrices;
      });
      
      // Update chart data for selected asset
      updateChartData();
      
    }, 15000); // Update every 15 seconds

    return () => clearInterval(interval);
  }, [selectedAsset, marketData]);

  // Generate realistic candlestick chart data
  const generateChartData = (asset, priceData = marketData) => {
    const info = assetInfo[asset];
    if (!info) return;

    const currentPrice = priceData[asset]?.price || info.basePrice;
    const data = [];
    let price = currentPrice;

    // Generate 50 historical candles
    for (let i = 0; i < 50; i++) {
      const variation = (Math.random() - 0.5) * 0.002;
      const open = price;
      const close = price * (1 + variation);
      const high = Math.max(open, close) * (1 + Math.random() * 0.001);
      const low = Math.min(open, close) * (1 - Math.random() * 0.001);
      
      data.push({
        timestamp: Date.now() - (50 - i) * 60000,
        open,
        high,
        low,
        close,
        volume: Math.random() * 1000000 + 100000
      });
      price = close;
    }

    setChartData(data);
  };

  // Update chart with new price point
  const updateChartData = () => {
    if (!marketData[selectedAsset]) return;

    const currentPrice = marketData[selectedAsset].price;
    const lastCandle = chartData[chartData.length - 1];
    
    if (lastCandle) {
      const newCandle = {
        timestamp: Date.now(),
        open: lastCandle.close,
        high: Math.max(lastCandle.close, currentPrice),
        low: Math.min(lastCandle.close, currentPrice),
        close: currentPrice,
        volume: Math.random() * 1000000 + 100000
      };

      setChartData(prev => [...prev.slice(-49), newCandle]);
    }
  };

  // Format price based on asset type and decimals
  const formatPrice = (symbol, price) => {
    const info = assetInfo[symbol];
    if (!info || !price) return '0.00';
    
    return price.toFixed(info.decimals);
  };

  // Enhanced login function
  const handleLogin = () => {
    if (loginData.email && loginData.password) {
      const userData = {
        email: loginData.email,
        balance: 10000,
        accountType: 'Demo',
        name: loginData.email.split('@')[0],
        joinDate: new Date().toISOString()
      };
      
      setUser(userData);
      setIsLoggedIn(true);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', 'demo-token-' + Date.now());
      
      console.log('✅ User logged in successfully');
    }
  };

  // Enhanced trade execution with better simulation
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
    
    const currentPrice = marketData[selectedAsset]?.price;
    if (!currentPrice) {
      alert('Price data unavailable');
      setIsPlacingTrade(false);
      return;
    }

    const trade = {
      id: Date.now().toString(),
      asset: selectedAsset,
      direction,
      amount: selectedAmount,
      entryPrice: currentPrice,
      timestamp: Date.now(),
      expiryTime: Date.now() + (60 * 1000), // 1 minute expiry
      status: 'active',
      payoutRate: 0.8
    };

    setActiveTrades(prev => [...prev, trade]);
    
    // Deduct investment amount
    const newBalance = user.balance - selectedAmount;
    const updatedUser = { ...user, balance: newBalance };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));

    console.log(`🎯 ${direction} trade placed: ${selectedAsset} at $${formatPrice(selectedAsset, currentPrice)}`);

    // Simulate trade result after 60 seconds with enhanced logic
    setTimeout(() => {
      const currentMarketPrice = marketData[selectedAsset]?.price;
      if (!currentMarketPrice) return;

      const priceChange = currentMarketPrice - trade.entryPrice;
      const priceChangePercent = (priceChange / trade.entryPrice) * 100;
      
      // Enhanced win/loss logic
      let isWin = false;
      
      // Basic direction check
      if (direction === 'CALL' && priceChange > 0) isWin = true;
      if (direction === 'PUT' && priceChange < 0) isWin = true;
      
      // Add slight randomness for very small price movements (more realistic)
      if (Math.abs(priceChangePercent) < 0.01) {
        isWin = Math.random() > 0.45; // Slightly favor the house
      }
      
      const payout = isWin ? selectedAmount + (selectedAmount * trade.payoutRate) : 0;
      const profit = isWin ? selectedAmount * trade.payoutRate : -selectedAmount;
      
      // Update user balance if won
      if (isWin) {
        const finalBalance = user.balance + payout;
        const finalUser = { ...user, balance: finalBalance };
        setUser(finalUser);
        localStorage.setItem('user', JSON.stringify(finalUser));
      }

      // Update trade record
      const completedTrade = {
        ...trade,
        status: isWin ? 'won' : 'lost',
        exitPrice: currentMarketPrice,
        priceChange: priceChange,
        priceChangePercent: priceChangePercent,
        payout: payout,
        profit: profit,
        closeTime: Date.now()
      };

      // Remove from active trades and add to history
      setActiveTrades(prev => prev.filter(t => t.id !== trade.id));
      setTradeHistory(prev => [completedTrade, ...prev]);

      // Show result notification
      const resultMessage = isWin 
        ? `🎉 ${direction} Trade WON! Profit: +$${profit.toFixed(2)}` 
        : `😞 ${direction} Trade LOST! Loss: -$${Math.abs(profit).toFixed(2)}`;
      
      alert(resultMessage);
      console.log(`📊 Trade completed: ${resultMessage}`);

    }, 60000);

    setIsPlacingTrade(false);
  };

  // Handle asset selection
  const handleAssetSelect = (symbol) => {
    setSelectedAsset(symbol);
    generateChartData(symbol);
    console.log(`📈 Selected asset: ${symbol} (${assetInfo[symbol]?.name})`);
  };

  // Logout function
  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setActiveTrades([]);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    console.log('👋 User logged out');
  };

  // Professional candlestick chart renderer
  const renderChart = () => {
    const width = 800;
    const height = 400;
    const padding = { top: 20, right: 80, bottom: 40, left: 60 };
    
    if (!chartData.length) {
      return (
        <div className="flex items-center justify-center h-96 bg-slate-800 rounded-lg">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <div className="text-gray-400">Loading chart data...</div>
            {!isConnected && (
              <div className="text-red-400 text-sm mt-2">Connection issues - using cached data</div>
            )}
          </div>
        </div>
      );
    }

    const prices = chartData.flatMap(d => [d.high, d.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;
    
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const candleWidth = Math.max(chartWidth / chartData.length - 2, 6);

    return (
      <div className="bg-slate-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">{selectedAsset}</h2>
            <p className="text-gray-400 text-sm">{assetInfo[selectedAsset]?.name}</p>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-3xl font-mono text-white">
                {formatPrice(selectedAsset, marketData[selectedAsset]?.price)}
              </span>
              <span className={`text-lg font-semibold ${
                (marketData[selectedAsset]?.change || 0) >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {(marketData[selectedAsset]?.change || 0) >= 0 ? '+' : ''}{(marketData[selectedAsset]?.change || 0).toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-400">Live Data</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-400">Offline</span>
              </>
            )}
          </div>
        </div>

        {/* Timeframe buttons */}
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

        <svg width="100%" height="400" viewBox={`0 0 ${width} ${height}`} className="w-full">
          <rect width={width} height={height} fill="#1e293b" />
          
          {/* Price grid lines */}
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
                  {formatPrice(selectedAsset, price)}
                </text>
              </g>
            );
          })}

          {/* Candlesticks */}
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
                {/* Wick */}
                <line
                  x1={x}
                  y1={yHigh}
                  x2={x}
                  y2={yLow}
                  stroke={isGreen ? "#22c55e" : "#ef4444"}
                  strokeWidth="2"
                />
                {/* Body */}
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

          {/* Current price line */}
          {marketData[selectedAsset] && (
            <>
              <line
                x1={padding.left}
                y1={padding.top + ((maxPrice - marketData[selectedAsset].price) / priceRange) * chartHeight}
                x2={width - padding.right}
                y2={padding.top + ((maxPrice - marketData[selectedAsset].price) / priceRange) * chartHeight}
                stroke="#3b82f6"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
              <rect
                x={width - padding.right - 80}
                y={padding.top + ((maxPrice - marketData[selectedAsset].price) / priceRange) * chartHeight - 12}
                width="75"
                height="24"
                fill="#3b82f6"
                rx="4"
              />
              <text
                x={width - padding.right - 42}
                y={padding.top + ((maxPrice - marketData[selectedAsset].price) / priceRange) * chartHeight + 4}
                fill="white"
                fontSize="12"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {formatPrice(selectedAsset, marketData[selectedAsset].price)}
              </text>
            </>
          )}
        </svg>

        {/* Last update indicator */}
        {lastUpdate && (
          <div className="text-xs text-gray-500 mt-2 text-right">
            Last updated: {new Date(lastUpdate).toLocaleTimeString()}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex">
      {/* Left Sidebar - Enhanced Assets List */}
      <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">EO</span>
            </div>
            <span className="text-xl font-bold">ExpertOption</span>
          </div>
        </div>

        {/* Asset Categories */}
        <div className="p-3 border-b border-slate-700">
          <div className="flex flex-wrap gap-1">
            {Object.keys(assetCategories).map(category => (
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

        {/* Enhanced Assets List with Real-time Data */}
        <div className="flex-1 overflow-y-auto">
          {assetCategories[activeCategory].map(symbol => {
            const data = marketData[symbol];
            const info = assetInfo[symbol];
            const isSelected = selectedAsset === symbol;
            
            return (
              <div
                key={symbol}
                onClick={() => handleAssetSelect(symbol)}
                className={`p-4 cursor-pointer border-b border-slate-700/50 hover:bg-slate-700 transition ${
                  isSelected ? 'bg-slate-700 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{info?.icon}</span>
                    <div>
                      <div className="font-bold text-sm flex items-center space-x-1">
                        <span>{symbol}</span>
                        {data?.source === 'coingecko' && (
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Live CoinGecko data"></span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">{info?.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm font-semibold">
                      {formatPrice(symbol, data?.price)}
                    </div>
                    <div className={`text-xs font-bold flex items-center justify-end space-x-1 ${
                      (data?.change || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {(data?.change || 0) >= 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      <span>
                        {(data?.change || 0) >= 0 ? '+' : ''}{(data?.change || 0).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Trading Area */}
      <div className="flex-1 flex flex-col">
        {/* Chart Area */}
        <div className="flex-1 p-6">
          {renderChart()}
        </div>
      </div>

      {/* Right Panel - Enhanced Trading Interface */}
      <div className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col">
        {/* Top section - Login or User info */}
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

        {/* Enhanced Trading Panel */}
        <div className="flex-1 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Trade</h3>
            {tradeHistory.length > 0 && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center space-x-2 text-sm text-blue-400 hover:text-blue-300 transition"
              >
                <History className="w-4 h-4" />
                <span>History ({tradeHistory.length})</span>
              </button>
            )}
          </div>
          
          {/* Investment Amount with Enhanced Controls */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Investment Amount</label>
            <div className="flex items-center space-x-2 mb-2">
              <button
                onClick={() => setSelectedAmount(Math.max(1, selectedAmount - 5))}
                className="bg-slate-700 hover:bg-slate-600 p-2 rounded-lg transition"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="relative flex-1">
                <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={selectedAmount}
                  onChange={(e) => setSelectedAmount(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none text-center font-mono text-lg"
                  min="1"
                  max={isLoggedIn ? user.balance : 1000}
                  disabled={!isLoggedIn}
                />
              </div>
              <button
                onClick={() => setSelectedAmount(selectedAmount + 5)}
                className="bg-slate-700 hover:bg-slate-600 p-2 rounded-lg transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex space-x-2">
              {[10, 25, 50, 100, 250, 500].map(amount => (
                <button
                  key={amount}
                  onClick={() => setSelectedAmount(amount)}
                  disabled={!isLoggedIn || (user && user.balance < amount)}
                  className={`px-3 py-1 text-sm rounded font-semibold transition disabled:opacity-50 ${
                    selectedAmount === amount ? 'bg-blue-600 text-white' : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
                  }`}
                >
                  ${amount}
                </button>
              ))}
            </div>
          </div>

          {/* Current Price Display with Enhanced Info */}
          <div className="bg-slate-700 rounded-lg p-4">
            <div className="text-center">
              <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Current Price</div>
              <div className="text-2xl font-mono font-bold">
                {formatPrice(selectedAsset, marketData[selectedAsset]?.price)}
              </div>
              <div className={`text-sm font-semibold flex items-center justify-center space-x-1 ${
                (marketData[selectedAsset]?.change || 0) >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {(marketData[selectedAsset]?.change || 0) >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>
                  {(marketData[selectedAsset]?.change || 0) >= 0 ? '+' : ''}
                  {(marketData[selectedAsset]?.change || 0).toFixed(2)}%
                </span>
              </div>
              {marketData[selectedAsset]?.source === 'coingecko' && (
                <div className="text-xs text-green-400 mt-1">Live CoinGecko Data</div>
              )}
            </div>
          </div>

          {/* Enhanced Trade Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => placeTrade('CALL')}
              disabled={isPlacingTrade || !isLoggedIn || !marketData[selectedAsset]}
              className="w-full bg-green-600 hover:bg-green-700 py-4 rounded-lg font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition transform hover:scale-105 disabled:transform-none"
            >
              <TrendingUp className="w-5 h-5" />
              <span>{isPlacingTrade ? 'Placing...' : 'CALL/Higher'}</span>
            </button>
            
            <button
              onClick={() => placeTrade('PUT')}
              disabled={isPlacingTrade || !isLoggedIn || !marketData[selectedAsset]}
              className="w-full bg-red-600 hover:bg-red-700 py-4 rounded-lg font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition transform hover:scale-105 disabled:transform-none"
            >
              <TrendingDown className="w-5 h-5" />
              <span>{isPlacingTrade ? 'Placing...' : 'PUT/Lower'}</span>
            </button>
          </div>

          {/* Enhanced Trade Info */}
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

          {/* Login prompt when not logged in */}
          {!isLoggedIn && (
            <div className="bg-slate-700/30 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-400">
                Login to start trading with CALL/PUT buttons
              </p>
            </div>
          )}

          {/* Enhanced Active Trades Display */}
          {activeTrades.length > 0 && (
            <div className="bg-slate-700 rounded-lg p-4">
              <h4 className="text-sm font-semibold mb-2 flex items-center space-x-2">
                <span>Active Trades</span>
                <span className="bg-blue-600 px-2 py-1 rounded-full text-xs">{activeTrades.length}</span>
              </h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {activeTrades.slice(-3).map(trade => {
                  const timeLeft = Math.max(0, Math.ceil((trade.expiryTime - Date.now()) / 1000));
                  return (
                    <div key={trade.id} className="text-xs bg-slate-600 rounded p-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{trade.asset} {trade.direction}</span>
                        <span className={`font-semibold ${
                          trade.direction === 'CALL' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {timeLeft}s
                        </span>
                      </div>
                      <div className="text-gray-400 mt-1">
                        ${trade.amount} → Entry: {formatPrice(trade.asset, trade.entryPrice)}
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-1 mt-2">
                        <div 
                          className="bg-blue-500 h-1 rounded-full transition-all duration-1000"
                          style={{ width: `${(timeLeft / 60) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Market Status Indicator */}
          <div className="bg-slate-700 rounded-lg p-4">
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Market Status:</span>
                <span className={`font-semibold ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                  {isConnected ? 'Live' : 'Offline'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Active Trades:</span>
                <span className="text-white font-semibold">{activeTrades.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Completed:</span>
                <span className="text-white font-semibold">{tradeHistory.length}</span>
              </div>
              {tradeHistory.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Win Rate:</span>
                  <span className="text-white font-semibold">
                    {((tradeHistory.filter(t => t.status === 'won').length / tradeHistory.length) * 100).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Trade History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden border border-slate-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Trading History</h3>
              <button
                onClick={() => setShowHistory(false)}
                className="text-gray-400 hover:text-white text-2xl transition"
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
                        trade.status === 'won'
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
                              trade.status === 'won' ? 'bg-green-600' : 'bg-red-600'
                            }`}>
                              {trade.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
                            <div>
                              <div>Amount: ${trade.amount}</div>
                              <div>Entry: {formatPrice(trade.asset, trade.entryPrice)}</div>
                            </div>
                            <div>
                              <div>Exit: {formatPrice(trade.asset, trade.exitPrice)}</div>
                              <div>Change: {trade.priceChangePercent?.toFixed(3)}%</div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${
                            trade.status === 'won' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {trade.profit >= 0 ? '+' : ''}${trade.profit?.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(trade.closeTime).toLocaleTimeString()}
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
}