// frontend/src/pages/dashboard.js - Main Trading Dashboard
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
  FaTrophy,
  FaHistory,
  FaCog
} from 'react-icons/fa';

export default function Dashboard() {
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
  const [countdown, setCountdown] = useState({});
  const [selectedTab, setSelectedTab] = useState('trade');
  const [priceHistory, setPriceHistory] = useState([]);
  const chartRef = useRef(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user]);

  // Subscribe to price updates for selected asset
  useEffect(() => {
    if (selectedAsset) {
      subscribeToAssets([selectedAsset.symbol]);
    }
  }, [selectedAsset]);

  // Update price history for chart
  useEffect(() => {
    if (selectedAsset && prices[selectedAsset.symbol]) {
      const newPrice = {
        time: Date.now(),
        price: prices[selectedAsset.symbol].price
      };
      
      setPriceHistory(prev => {
        const updated = [...prev, newPrice];
        return updated.slice(-100); // Keep last 100 points
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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

  // Simple chart component
  const PriceChart = () => {
    useEffect(() => {
      if (!chartRef.current || priceHistory.length < 2) return;

      const canvas = chartRef.current;
      const ctx = canvas.getContext('2d');
      const { width, height } = canvas;

      // Clear canvas
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, width, height);

      if (priceHistory.length < 2) return;

      // Calculate price range
      const prices = priceHistory.map(p => p.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const priceRange = maxPrice - minPrice || 1;

      // Draw grid
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 1;
      
      for (let i = 0; i <= 5; i++) {
        const y = (height / 5) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw price line
      const isPositive = priceChange >= 0;
      ctx.strokeStyle = isPositive ? '#10B981' : '#EF4444';
      ctx.lineWidth = 2;
      ctx.beginPath();

      priceHistory.forEach((point, index) => {
        const x = (index / (priceHistory.length - 1)) * width;
        const y = height - ((point.price - minPrice) / priceRange) * height;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      // Draw current price point
      if (priceHistory.length > 0) {
        const lastPoint = priceHistory[priceHistory.length - 1];
        const lastX = width;
        const lastY = height - ((lastPoint.price - minPrice) / priceRange) * height;

        ctx.fillStyle = isPositive ? '#10B981' : '#EF4444';
        ctx.beginPath();
        ctx.arc(lastX - 5, lastY, 4, 0, 2 * Math.PI);
        ctx.fill();
      }

      // Draw price labels
      ctx.fillStyle = '#9CA3AF';
      ctx.font = '12px Inter';
      ctx.textAlign = 'right';

      for (let i = 0; i <= 5; i++) {
        const price = minPrice + (priceRange / 5) * (5 - i);
        const y = (height / 5) * i + 15;
        ctx.fillText(formatPrice(price, selectedAsset?.symbol), width - 10, y);
      }

    }, [priceHistory, selectedAsset, priceChange]);

    return (
      <canvas
        ref={chartRef}
        width={800}
        height={400}
        className="w-full h-full rounded-lg"
        style={{ maxWidth: '100%', height: '300px' }}
      />
    );
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Top Navigation */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <FaChartLine className="text-white text-sm" />
              </div>
              <h1 className="text-xl font-bold text-white">ExpertTrade</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <FaWifi className="text-green-500" />
              ) : (
                <FaWifiSlash className="text-red-500" />
              )}
              <span className={`text-sm ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
                {isConnected ? 'Live' : 'Disconnected'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="text-right">
              <p className="text-sm text-gray-400">Balance</p>
              <p className="text-xl font-bold text-green-500">
                ${user.balance?.toFixed(2) || '0.00'}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <FaUser className="text-gray-400" />
              <span className="text-white">{user.firstName}</span>
            </div>

            <button
              onClick={logout}
              className="text-gray-400 hover:text-white transition-colors p-2"
              title="Logout"
            >
              <FaSignOutAlt size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Sidebar - Assets */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white mb-4">Trading Assets</h2>
            
            {/* Asset Categories */}
            <div className="flex space-x-2 mb-4">
              {['forex', 'crypto', 'stocks', 'commodities'].map(category => (
                <button
                  key={category}
                  className="px-3 py-1 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600 transition-colors capitalize"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Assets List */}
          <div className="flex-1 overflow-y-auto">
            {assets.map(asset => {
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
                      <p className="text-white font-medium">{asset.name}</p>
                      <p className="text-gray-400 text-sm">{asset.symbol}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">
                        {formatPrice(assetPrice, asset.symbol)}
                      </p>
                      <p className={`text-sm ${assetChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {assetChange >= 0 ? '+' : ''}{assetChange.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Chart Section */}
          <div className="flex-1 p-6">
            <div className="bg-gray-800 rounded-xl p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedAsset?.name || 'Select Asset'}</h2>
                  <p className="text-gray-400">{selectedAsset?.symbol}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-white">
                    {formatPrice(currentPrice, selectedAsset?.symbol)}
                  </p>
                  <p className={`text-lg ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                  </p>
                </div>
              </div>
              
              <div className="h-[calc(100%-120px)] bg-gray-900 rounded-lg p-4">
                <PriceChart />
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Trading Panel */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          {/* Tabs */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex space-x-2">
              {[
                { id: 'trade', label: 'Trade', icon: FaChartLine },
                { id: 'active', label: 'Active', icon: FaClock },
                { id: 'history', label: 'History', icon: FaHistory }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      selectedTab === tab.id 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {selectedTab === 'trade' && (
              <div className="p-4 space-y-6">
                <h2 className="text-lg font-semibold text-white">Place Trade</h2>
                
                {/* Trade Amount */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Investment Amount
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="text-white">$</span>
                    <input
                      type="number"
                      value={tradeAmount}
                      onChange={(e) => dispatch({ type: 'SET_TRADE_AMOUNT', payload: parseFloat(e.target.value) || 0 })}
                      className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none"
                      min="1"
                      step="1"
                    />
                  </div>
                  <div className="flex space-x-2 mt-2">
                    {[10, 25, 50, 100].map(amount => (
                      <button
                        key={amount}
                        onClick={() => dispatch({ type: 'SET_TRADE_AMOUNT', payload: amount })}
                        className="px-3 py-1 bg-gray-700 text-gray-300 rounded text-sm hover:bg-gray-600 transition-colors"
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Trade Duration */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Expiry Time
                  </label>
                  <select
                    value={tradeDuration}
                    onChange={(e) => dispatch({ type: 'SET_TRADE_DURATION', payload: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none"
                  >
                    <option value={60}>1 minute</option>
                    <option value={300}>5 minutes</option>
                    <option value={900}>15 minutes</option>
                    <option value={1800}>30 minutes</option>
                    <option value={3600}>1 hour</option>
                  </select>
                </div>

                {/* Trade Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => placeTrade('CALL')}
                    disabled={!selectedAsset || isLoading}
                    className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:opacity-50 text-white font-semibold py-4 px-4 rounded-lg transition-all transform hover:scale-105"
                  >
                    <FaArrowUp />
                    <span>CALL</span>
                  </button>
                  <button
                    onClick={() => placeTrade('PUT')}
                    disabled={!selectedAsset || isLoading}
                    className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:opacity-50 text-white font-semibold py-4 px-4 rounded-lg transition-all transform hover:scale-105"
                  >
                    <FaArrowDown />
                    <span>PUT</span>
                  </button>
                </div>

                {/* Trade Info */}
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Payout Rate</span>
                    <span className="text-white">80%</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Potential Profit</span>
                    <span className="text-green-500">+${(tradeAmount * 0.8).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Risk Amount</span>
                    <span className="text-red-500">${tradeAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'active' && (
              <div className="p-4">
                <h2 className="text-lg font-semibold text-white mb-4">Active Trades</h2>
                <div className="space-y-3">
                  {activeTrades.map(trade => (
                    <div key={trade._id} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-medium">{trade.asset}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          trade.type === 'CALL' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                        }`}>
                          {trade.type}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Amount: ${trade.amount}</span>
                        <span className="text-gray-400">
                          {countdown[trade._id] ? formatTime(countdown[trade._id]) : 'Expired'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400">
                        Entry: {formatPrice(trade.entryPrice, trade.asset)}
                      </div>
                    </div>
                  ))}
                  {activeTrades.length === 0 && (
                    <p className="text-gray-400 text-center py-8">No active trades</p>
                  )}
                </div>
              </div>
            )}

            {selectedTab === 'history' && (
              <div className="p-4">
                <h2 className="text-lg font-semibold text-white mb-4">Trade History</h2>
                <div className="space-y-3">
                  {tradesHistory.slice(0, 10).map(trade => (
                    <div key={trade._id} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-medium">{trade.asset}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          trade.status === 'WON' ? 'bg-green-600 text-white' : 
                          trade.status === 'LOST' ? 'bg-red-600 text-white' : 
                          'bg-yellow-600 text-white'
                        }`}>
                          {trade.status}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">${trade.amount}</span>
                        <span className={`${trade.profit > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {trade.profit > 0 ? '+' : ''}${trade.profit.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(trade.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                  {tradesHistory.length === 0 && (
                    <p className="text-gray-400 text-center py-8">No trades yet</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}