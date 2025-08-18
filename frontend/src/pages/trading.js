// frontend/src/pages/trading.js - Real Expert Option Interface
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useTrading } from '../contexts/TradingContext';
import { useRouter } from 'next/router';
import { 
  FaChartLine, 
  FaUser, 
  FaSignOutAlt, 
  FaArrowUp, 
  FaArrowDown, 
  FaClock,
  FaWifi,
  FaWifiSlash,
  FaDollarSign,
  FaPlay,
  FaPause,
  FaBell,
  FaCog,
  FaQuestionCircle,
  FaGift
} from 'react-icons/fa';

export default function ExpertOptionTradingInterface() {
  const { user, logout } = useAuth();
  const { isConnected, prices, subscribeToAssets } = useWebSocket();
  const { 
    assets, 
    selectedAsset, 
    tradeAmount, 
    tradeDuration, 
    activeTrades,
    tradesHistory,
    dispatch, 
    placeTrade, 
    isLoading 
  } = useTrading();
  
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [timeframe, setTimeframe] = useState('1m');
  const [countdown, setCountdown] = useState({});
  const [priceHistory, setPriceHistory] = useState([]);
  const [isTrading, setIsTrading] = useState(false);
  const chartRef = useRef(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user]);

  // Subscribe to price updates
  useEffect(() => {
    if (selectedAsset) {
      subscribeToAssets([selectedAsset.symbol]);
    }
  }, [selectedAsset]);

  // Update price history for candlestick chart
  useEffect(() => {
    if (selectedAsset && prices[selectedAsset.symbol]) {
      const newCandle = {
        time: Date.now(),
        open: prices[selectedAsset.symbol].price,
        high: prices[selectedAsset.symbol].price * (1 + Math.random() * 0.001),
        low: prices[selectedAsset.symbol].price * (1 - Math.random() * 0.001),
        close: prices[selectedAsset.symbol].price,
        volume: prices[selectedAsset.symbol].volume || Math.random() * 1000000
      };
      
      setPriceHistory(prev => {
        const updated = [...prev, newCandle];
        return updated.slice(-200); // Keep last 200 candles
      });
    }
  }, [selectedAsset, prices]);

  // Countdown timer for active trades
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        const newCountdown = {};
        activeTrades.forEach(trade => {
          const timeLeft = Math.max(0, new Date(trade.expiresAt) - new Date());
          newCountdown[trade._id] = Math.floor(timeLeft / 1000);
        });
        return newCountdown;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeTrades]);

  const currentPrice = selectedAsset && prices[selectedAsset.symbol] 
    ? prices[selectedAsset.symbol].price 
    : selectedAsset?.currentPrice || 0;

  const priceChange = selectedAsset && prices[selectedAsset.symbol]
    ? prices[selectedAsset.symbol].changePercent
    : 0;

  // Asset categories like Expert Option
  const assetCategories = [
    { id: 'all', name: 'All', icon: '🌐' },
    { id: 'forex', name: 'Forex', icon: '💱' },
    { id: 'crypto', name: 'Crypto', icon: '₿' },
    { id: 'stocks', name: 'Stocks', icon: '📈' },
    { id: 'commodities', name: 'Commodities', icon: '🥇' }
  ];

  // Timeframes like Expert Option
  const timeframes = ['1m', '5m', '15m', '30m', '1h', '4h', '1D'];

  // Filter assets by category
  const filteredAssets = selectedCategory === 'all' 
    ? assets 
    : assets.filter(asset => asset.category === selectedCategory);

  const formatPrice = (price, symbol) => {
    if (!price) return '0.0000';
    
    if (symbol?.includes('JPY')) {
      return price.toFixed(3);
    } else if (symbol?.includes('USD') && !symbol?.includes('BTC') && !symbol?.includes('ETH')) {
      return price.toFixed(5);
    } else {
      return price.toFixed(2);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Professional Candlestick Chart Component
  const CandlestickChart = () => {
    useEffect(() => {
      if (!chartRef.current || priceHistory.length < 2) return;

      const canvas = chartRef.current;
      const ctx = canvas.getContext('2d');
      const { width, height } = canvas;

      // Clear canvas
      ctx.fillStyle = '#1a1d29';
      ctx.fillRect(0, 0, width, height);

      if (priceHistory.length < 2) return;

      // Calculate price range
      const highs = priceHistory.map(c => c.high);
      const lows = priceHistory.map(c => c.low);
      const maxPrice = Math.max(...highs);
      const minPrice = Math.min(...lows);
      const priceRange = maxPrice - minPrice || 1;

      // Draw grid
      ctx.strokeStyle = '#2a2d3a';
      ctx.lineWidth = 1;
      
      // Horizontal grid lines
      for (let i = 0; i <= 10; i++) {
        const y = (height / 10) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Vertical grid lines
      for (let i = 0; i <= 10; i++) {
        const x = (width / 10) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Draw candlesticks
      const candleWidth = Math.max(2, width / priceHistory.length - 2);
      
      priceHistory.forEach((candle, index) => {
        const x = (index / (priceHistory.length - 1)) * width;
        
        const openY = height - ((candle.open - minPrice) / priceRange) * height;
        const closeY = height - ((candle.close - minPrice) / priceRange) * height;
        const highY = height - ((candle.high - minPrice) / priceRange) * height;
        const lowY = height - ((candle.low - minPrice) / priceRange) * height;

        const isGreen = candle.close >= candle.open;
        
        // Draw wick
        ctx.strokeStyle = isGreen ? '#26a69a' : '#ef5350';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, highY);
        ctx.lineTo(x, lowY);
        ctx.stroke();

        // Draw body
        ctx.fillStyle = isGreen ? '#26a69a' : '#ef5350';
        const bodyTop = Math.min(openY, closeY);
        const bodyHeight = Math.abs(closeY - openY) || 1;
        
        ctx.fillRect(x - candleWidth/2, bodyTop, candleWidth, bodyHeight);
      });

      // Draw price labels
      ctx.fillStyle = '#8892b0';
      ctx.font = '12px Arial';
      ctx.textAlign = 'right';

      for (let i = 0; i <= 5; i++) {
        const price = minPrice + (priceRange / 5) * (5 - i);
        const y = (height / 5) * i + 15;
        ctx.fillText(formatPrice(price, selectedAsset?.symbol), width - 10, y);
      }

    }, [priceHistory, selectedAsset]);

    return (
      <canvas
        ref={chartRef}
        width={1000}
        height={500}
        className="w-full h-full rounded-lg"
        style={{ maxWidth: '100%', height: '400px' }}
      />
    );
  };

  const handleTrade = async (type) => {
    setIsTrading(true);
    try {
      await placeTrade(type);
    } finally {
      setIsTrading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Expert Option Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <FaChartLine className="text-white text-sm" />
              </div>
              <h1 className="text-xl font-bold text-white">ExpertOption</h1>
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-500 text-sm">Live</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-red-500 text-sm">Offline</span>
                </div>
              )}
            </div>
          </div>

          {/* Header Right */}
          <div className="flex items-center space-x-6">
            {/* Balance */}
            <div className="bg-gray-700 rounded-lg px-4 py-2">
              <div className="text-center">
                <p className="text-gray-400 text-xs">Balance</p>
                <p className="text-green-500 font-bold text-lg">
                  ${user.balance?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <button className="text-gray-400 hover:text-white p-2">
                <FaBell size={18} />
              </button>
              <button className="text-gray-400 hover:text-white p-2">
                <FaGift size={18} />
              </button>
              <button className="text-gray-400 hover:text-white p-2">
                <FaCog size={18} />
              </button>
              
              <div className="flex items-center space-x-2">
                <FaUser className="text-gray-400" />
                <span className="text-white text-sm">{user.firstName}</span>
              </div>

              <button
                onClick={logout}
                className="text-gray-400 hover:text-white p-2"
                title="Logout"
              >
                <FaSignOutAlt size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Panel - Assets (Expert Option Style) */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
          {/* Asset Categories */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex space-x-1">
              {assetCategories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Assets List */}
          <div className="flex-1 overflow-y-auto">
            {filteredAssets.map(asset => {
              const assetPrice = prices[asset.symbol]?.price || asset.currentPrice;
              const assetChange = prices[asset.symbol]?.changePercent || asset.changePercent24h || 0;
              const isSelected = selectedAsset?.symbol === asset.symbol;
              
              return (
                <button
                  key={asset.symbol}
                  onClick={() => dispatch({ type: 'SET_SELECTED_ASSET', payload: asset })}
                  className={`w-full p-4 text-left hover:bg-gray-700 transition-colors border-l-4 ${
                    isSelected 
                      ? 'bg-gray-700 border-blue-500' 
                      : 'border-transparent'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-medium text-sm">{asset.symbol}</p>
                      <p className="text-gray-400 text-xs">{asset.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium text-sm">
                        {formatPrice(assetPrice, asset.symbol)}
                      </p>
                      <p className={`text-xs ${assetChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {assetChange >= 0 ? '+' : ''}{assetChange.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center Panel - Chart (Expert Option Style) */}
        <div className="flex-1 flex flex-col bg-gray-900">
          {/* Chart Header */}
          <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedAsset?.symbol || 'Select Asset'}</h2>
                  <p className="text-gray-400 text-sm">{selectedAsset?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">
                    {formatPrice(currentPrice, selectedAsset?.symbol)}
                  </p>
                  <p className={`text-sm ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                  </p>
                </div>
              </div>

              {/* Timeframe Selector */}
              <div className="flex space-x-1">
                {timeframes.map(tf => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      timeframe === tf
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Chart Container */}
          <div className="flex-1 p-6">
            <div className="h-full bg-gray-800 rounded-lg p-4">
              <CandlestickChart />
            </div>
          </div>
        </div>

        {/* Right Panel - Trading (Expert Option Style) */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          {/* Trading Panel */}
          <div className="p-6 space-y-6">
            <h2 className="text-lg font-bold text-white">Trade</h2>
            
            {/* Investment Amount */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-3">
                Investment
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  value={tradeAmount}
                  onChange={(e) => dispatch({ type: 'SET_TRADE_AMOUNT', payload: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-8 pr-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none text-lg font-medium"
                  min="1"
                  step="1"
                />
              </div>
              <div className="flex space-x-2 mt-3">
                {[10, 25, 50, 100, 250, 500].map(amount => (
                  <button
                    key={amount}
                    onClick={() => dispatch({ type: 'SET_TRADE_AMOUNT', payload: amount })}
                    className="flex-1 px-2 py-2 bg-gray-700 text-gray-300 rounded text-sm hover:bg-gray-600 transition-colors"
                  >
                    ${amount}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Selector */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-3">
                Time
              </label>
              <select
                value={tradeDuration}
                onChange={(e) => dispatch({ type: 'SET_TRADE_DURATION', payload: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none"
              >
                <option value={60}>1 minute</option>
                <option value={300}>5 minutes</option>
                <option value={900}>15 minutes</option>
                <option value={1800}>30 minutes</option>
                <option value={3600}>1 hour</option>
              </select>
            </div>

            {/* Trade Buttons - Expert Option Style */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleTrade('PUT')}
                disabled={!selectedAsset || isTrading}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:bg-gray-600 disabled:opacity-50 text-white font-bold py-6 px-4 rounded-lg transition-all transform hover:scale-105 flex flex-col items-center space-y-2"
              >
                <FaArrowDown size={24} />
                <span className="text-lg">PUT</span>
                <span className="text-xs opacity-75">Lower</span>
              </button>
              
              <button
                onClick={() => handleTrade('CALL')}
                disabled={!selectedAsset || isTrading}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:bg-gray-600 disabled:opacity-50 text-white font-bold py-6 px-4 rounded-lg transition-all transform hover:scale-105 flex flex-col items-center space-y-2"
              >
                <FaArrowUp size={24} />
                <span className="text-lg">CALL</span>
                <span className="text-xs opacity-75">Higher</span>
              </button>
            </div>

            {/* Trade Info */}
            <div className="bg-gray-700 rounded-lg p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Payout</span>
                <span className="text-green-500 font-medium">80%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Profit</span>
                <span className="text-green-500 font-medium">+${(tradeAmount * 0.8).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Investment</span>
                <span className="text-white font-medium">${tradeAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Active Trades */}
          <div className="flex-1 border-t border-gray-700">
            <div className="p-4">
              <h3 className="text-white font-medium mb-4">Active Trades</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {activeTrades.map(trade => (
                  <div key={trade._id} className="bg-gray-700 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-medium text-sm">{trade.asset}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        trade.type === 'CALL' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                      }`}>
                        {trade.type}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>${trade.amount}</span>
                      <span>
                        {countdown[trade._id] ? formatTime(countdown[trade._id]) : 'Expired'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Entry: {formatPrice(trade.entryPrice, trade.asset)}
                    </div>
                  </div>
                ))}
                {activeTrades.length === 0 && (
                  <p className="text-gray-400 text-sm text-center py-8">No active trades</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}