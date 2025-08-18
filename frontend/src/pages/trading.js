// frontend/src/pages/trading.js - Enhanced Expert Option Design
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

// Mock data for assets
const assets = {
  all: [
    { symbol: 'EURUSD', name: 'EUR/USD', price: 1.08501, change: -0.07, category: 'forex' },
    { symbol: 'GBPUSD', name: 'GBP/USD', price: 1.24890, change: +0.02, category: 'forex' },
    { symbol: 'USDJPY', name: 'USD/JPY', price: 150.344, change: -0.02, category: 'forex' },
    { symbol: 'BTCUSD', name: 'Bitcoin/USD', price: 65980.65, change: -0.18, category: 'crypto' },
    { symbol: 'ETHUSD', name: 'Ethereum/USD', price: 3110.34, change: -0.64, category: 'crypto' },
    { symbol: 'AAPL', name: 'Apple Inc.', price: 156.02, change: -0.87, category: 'stocks' },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 251.23, change: +0.02, category: 'stocks' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 143.52, change: +0.15, category: 'stocks' },
    { symbol: 'GOLD', name: 'Gold', price: 2027.40, change: -0.01, category: 'commodities' },
    { symbol: 'OIL', name: 'Oil', price: 85.24, change: +0.01, category: 'commodities' }
  ]
};

export default function Trading() {
  const router = useRouter();
  const [selectedAsset, setSelectedAsset] = useState(assets.all[0]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [timeframe, setTimeframe] = useState('1m');
  const [investmentAmount, setInvestmentAmount] = useState(10);
  const [tradingTime, setTradingTime] = useState(60);
  const [balance, setBalance] = useState(10000);
  const [activeTrades, setActiveTrades] = useState([]);
  const [candleData, setCandleData] = useState([]);
  const chartRef = useRef(null);

  // Generate mock candlestick data
  useEffect(() => {
    const generateCandles = () => {
      const candles = [];
      let price = selectedAsset.price;
      
      for (let i = 0; i < 50; i++) {
        const open = price;
        const change = (Math.random() - 0.5) * 0.01;
        const close = open + change;
        const high = Math.max(open, close) + Math.random() * 0.005;
        const low = Math.min(open, close) - Math.random() * 0.005;
        
        candles.push({
          time: Date.now() - (49 - i) * 60000,
          open: open.toFixed(5),
          high: high.toFixed(5),
          low: low.toFixed(5),
          close: close.toFixed(5)
        });
        
        price = close;
      }
      
      setCandleData(candles);
    };

    generateCandles();
    const interval = setInterval(generateCandles, 1000);
    return () => clearInterval(interval);
  }, [selectedAsset]);

  // Filter assets by category
  const filteredAssets = activeCategory === 'all' 
    ? assets.all 
    : assets.all.filter(asset => asset.category === activeCategory);

  // Handle trade execution
  const executeTrade = (direction) => {
    const newTrade = {
      id: Date.now(),
      asset: selectedAsset.symbol,
      direction: direction,
      amount: investmentAmount,
      openPrice: selectedAsset.price,
      openTime: new Date(),
      duration: tradingTime,
      payout: investmentAmount * 0.8 // 80% payout
    };

    setActiveTrades(prev => [...prev, newTrade]);
    setBalance(prev => prev - investmentAmount);

    // Simulate trade completion
    setTimeout(() => {
      const isWin = Math.random() > 0.5;
      setActiveTrades(prev => prev.filter(trade => trade.id !== newTrade.id));
      
      if (isWin) {
        setBalance(prev => prev + newTrade.amount + newTrade.payout);
      }
    }, tradingTime * 1000);
  };

  // Render candlestick chart
  const renderChart = () => {
    if (candleData.length === 0) return null;

    const maxPrice = Math.max(...candleData.map(c => parseFloat(c.high)));
    const minPrice = Math.min(...candleData.map(c => parseFloat(c.low)));
    const priceRange = maxPrice - minPrice;
    const chartHeight = 500;
    const chartWidth = 900;
    const candleWidth = Math.max(chartWidth / candleData.length - 2, 8);

    return (
      <div className="relative w-full h-full bg-gradient-to-b from-slate-900 to-slate-800 rounded-lg border border-slate-700/50">
        <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full">
          {/* Background Grid */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{stopColor:"#1e293b", stopOpacity:0.8}} />
              <stop offset="100%" style={{stopColor:"#0f172a", stopOpacity:0.9}} />
            </linearGradient>
          </defs>
          
          <rect width="100%" height="100%" fill="url(#chartGradient)" />
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Price lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <g key={i}>
              <line
                x1="0"
                y1={chartHeight * ratio}
                x2={chartWidth}
                y2={chartHeight * ratio}
                stroke="#334155"
                strokeWidth="1"
                opacity="0.5"
                strokeDasharray="5,5"
              />
              <text
                x="10"
                y={chartHeight * ratio - 8}
                fill="#94a3b8"
                fontSize="12"
                fontFamily="monospace"
                fontWeight="500"
              >
                {(maxPrice - priceRange * ratio).toFixed(5)}
              </text>
            </g>
          ))}

          {/* Candlesticks with shadows */}
          {candleData.map((candle, i) => {
            const x = i * (candleWidth + 2) + candleWidth / 2;
            const open = parseFloat(candle.open);
            const close = parseFloat(candle.close);
            const high = parseFloat(candle.high);
            const low = parseFloat(candle.low);
            
            const yHigh = chartHeight - ((high - minPrice) / priceRange) * chartHeight;
            const yLow = chartHeight - ((low - minPrice) / priceRange) * chartHeight;
            const yOpen = chartHeight - ((open - minPrice) / priceRange) * chartHeight;
            const yClose = chartHeight - ((close - minPrice) / priceRange) * chartHeight;
            
            const isGreen = close > open;
            const bodyTop = Math.min(yOpen, yClose);
            const bodyHeight = Math.max(Math.abs(yClose - yOpen), 2);
            
            return (
              <g key={i}>
                {/* Shadow for depth */}
                <line
                  x1={x + 1}
                  y1={yHigh + 1}
                  x2={x + 1}
                  y2={yLow + 1}
                  stroke="#000000"
                  strokeWidth="2"
                  opacity="0.3"
                />
                <rect
                  x={x - candleWidth / 2 + 1}
                  y={bodyTop + 1}
                  width={candleWidth}
                  height={bodyHeight}
                  fill="#000000"
                  opacity="0.3"
                />
                
                {/* Wick */}
                <line
                  x1={x}
                  y1={yHigh}
                  x2={x}
                  y2={yLow}
                  stroke={isGreen ? "#10b981" : "#ef4444"}
                  strokeWidth="2"
                />
                
                {/* Body with gradient */}
                <defs>
                  <linearGradient id={`candle-${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{stopColor: isGreen ? "#34d399" : "#f87171", stopOpacity: 1}} />
                    <stop offset="100%" style={{stopColor: isGreen ? "#059669" : "#dc2626", stopOpacity: 1}} />
                  </linearGradient>
                </defs>
                
                <rect
                  x={x - candleWidth / 2}
                  y={bodyTop}
                  width={candleWidth}
                  height={bodyHeight}
                  fill={`url(#candle-${i})`}
                  stroke={isGreen ? "#10b981" : "#ef4444"}
                  strokeWidth="1"
                  rx="1"
                />
              </g>
            );
          })}

          {/* Current price line */}
          <line
            x1="0"
            y1={chartHeight - ((selectedAsset.price - minPrice) / priceRange) * chartHeight}
            x2={chartWidth}
            y2={chartHeight - ((selectedAsset.price - minPrice) / priceRange) * chartHeight}
            stroke="#3b82f6"
            strokeWidth="2"
            strokeDasharray="10,5"
            opacity="0.8"
          />
          
          {/* Current price label */}
          <rect
            x={chartWidth - 100}
            y={chartHeight - ((selectedAsset.price - minPrice) / priceRange) * chartHeight - 12}
            width="90"
            height="24"
            fill="#3b82f6"
            rx="4"
          />
          <text
            x={chartWidth - 55}
            y={chartHeight - ((selectedAsset.price - minPrice) / priceRange) * chartHeight + 4}
            fill="white"
            fontSize="12"
            fontFamily="monospace"
            fontWeight="bold"
            textAnchor="middle"
          >
            {selectedAsset.price}
          </text>
        </svg>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Enhanced Header */}
      <header className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-600/50 shadow-lg backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">EO</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                ExpertOption
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
              <span className="text-sm text-gray-300 font-medium">Live Trading</span>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <div className="text-sm text-gray-400 uppercase tracking-wide">Balance</div>
              <div className="text-2xl font-bold text-green-400">${balance.toLocaleString()}</div>
            </div>
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2 rounded-lg text-sm font-semibold shadow-lg">
              Demo Account
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-screen">
        {/* Enhanced Left Panel - Assets */}
        <div className="w-80 bg-gradient-to-b from-slate-800 to-slate-900 border-r border-slate-600/50 shadow-xl">
          {/* Asset Categories */}
          <div className="p-4 border-b border-slate-600/50 bg-slate-800/50">
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All', icon: '🌐' },
                { key: 'forex', label: 'Forex', icon: '💱' },
                { key: 'crypto', label: 'Crypto', icon: '₿' },
                { key: 'stocks', label: 'Stocks', icon: '📈' },
                { key: 'commodities', label: 'Commodities', icon: '🥇' }
              ].map(category => (
                <button
                  key={category.key}
                  onClick={() => setActiveCategory(category.key)}
                  className={`px-3 py-2 text-sm rounded-lg font-medium transition-all duration-200 flex items-center space-x-1 ${
                    activeCategory === category.key
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg transform scale-105'
                      : 'bg-slate-700/50 text-gray-300 hover:bg-slate-600/50 hover:scale-105'
                  }`}
                >
                  <span>{category.icon}</span>
                  <span>{category.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Enhanced Asset List */}
          <div className="p-2 overflow-y-auto h-full">
            {filteredAssets.map(asset => (
              <div
                key={asset.symbol}
                onClick={() => setSelectedAsset(asset)}
                className={`p-4 rounded-lg cursor-pointer transition-all duration-200 hover:transform hover:scale-102 ${
                  selectedAsset.symbol === asset.symbol 
                    ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/50 shadow-lg' 
                    : 'hover:bg-slate-700/50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="font-bold text-lg">{asset.symbol}</div>
                    <div className="text-sm text-gray-400">{asset.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-lg font-bold">{asset.price}</div>
                    <div className={`text-sm font-semibold px-2 py-1 rounded ${
                      asset.change >= 0 
                        ? 'text-green-400 bg-green-500/10' 
                        : 'text-red-400 bg-red-500/10'
                    }`}>
                      {asset.change >= 0 ? '+' : ''}{asset.change}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Center Panel - Chart */}
        <div className="flex-1 flex flex-col">
          {/* Enhanced Asset Info */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-600/50 p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <h2 className="text-3xl font-bold">{selectedAsset.symbol}</h2>
                  <div className="text-gray-400 text-lg">{selectedAsset.name}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-mono font-bold">{selectedAsset.price}</div>
                <div className={`text-lg font-semibold px-3 py-1 rounded-lg ${
                  selectedAsset.change >= 0 
                    ? 'text-green-400 bg-green-500/20' 
                    : 'text-red-400 bg-red-500/20'
                }`}>
                  {selectedAsset.change >= 0 ? '+' : ''}{selectedAsset.change}%
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Timeframes */}
          <div className="bg-slate-800/50 border-b border-slate-600/50 p-3">
            <div className="flex space-x-2">
              {['1m', '5m', '15m', '30m', '1h', '4h', '1D'].map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-4 py-2 text-sm rounded-lg font-semibold transition-all duration-200 ${
                    timeframe === tf
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg transform scale-105'
                      : 'bg-slate-700/50 text-gray-300 hover:bg-slate-600/50 hover:scale-105'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Enhanced Chart */}
          <div className="flex-1 p-4 bg-gradient-to-br from-slate-900/50 to-slate-800/50">
            <div className="h-full rounded-xl shadow-2xl">
              {renderChart()}
            </div>
          </div>
        </div>

        {/* Enhanced Right Panel - Trading */}
        <div className="w-80 bg-gradient-to-b from-slate-800 to-slate-900 border-l border-slate-600/50 shadow-xl">
          <div className="p-6 space-y-6">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Trade Panel
            </h3>

            {/* Enhanced Investment Amount */}
            <div className="space-y-3">
              <label className="block text-sm text-gray-300 font-semibold uppercase tracking-wide">Investment Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400 text-lg">$</span>
                <input
                  type="number"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-lg font-bold focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
              
              {/* Enhanced Quick Amount Buttons */}
              <div className="grid grid-cols-3 gap-2">
                {[10, 25, 50, 100, 250, 500].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setInvestmentAmount(amount)}
                    className={`px-3 py-2 text-sm rounded-lg font-semibold transition-all duration-200 ${
                      investmentAmount === amount
                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg transform scale-105'
                        : 'bg-slate-700/50 text-gray-300 hover:bg-slate-600/50 hover:scale-105'
                    }`}
                  >
                    ${amount}
                  </button>
                ))}
              </div>
            </div>

            {/* Enhanced Time */}
            <div className="space-y-3">
              <label className="block text-sm text-gray-300 font-semibold uppercase tracking-wide">Trade Duration</label>
              <select
                value={tradingTime}
                onChange={(e) => setTradingTime(Number(e.target.value))}
                className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white font-semibold focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              >
                <option value={60}>1 minute</option>
                <option value={180}>3 minutes</option>
                <option value={300}>5 minutes</option>
                <option value={900}>15 minutes</option>
              </select>
            </div>

            {/* Enhanced Trade Buttons */}
            <div className="space-y-4">
              <button
                onClick={() => executeTrade('PUT')}
                className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center space-x-3 shadow-lg hover:shadow-red-500/25 transform hover:scale-105 transition-all duration-200"
              >
                <span className="text-2xl">📉</span>
                <span>PUT / Lower</span>
              </button>
              
              <button
                onClick={() => executeTrade('CALL')}
                className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center space-x-3 shadow-lg hover:shadow-green-500/25 transform hover:scale-105 transition-all duration-200"
              >
                <span className="text-2xl">📈</span>
                <span>CALL / Higher</span>
              </button>
            </div>

            {/* Enhanced Payout Info */}
            <div className="bg-gradient-to-r from-slate-700/50 to-slate-600/50 p-4 rounded-xl border border-slate-600/50">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 font-semibold">Payout:</span>
                  <span className="text-green-400 font-bold text-lg">80%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 font-semibold">Profit:</span>
                  <span className="text-green-400 font-bold text-lg">+${(investmentAmount * 0.8).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 font-semibold">Investment:</span>
                  <span className="text-white font-bold text-lg">${investmentAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Enhanced Active Trades */}
            <div className="space-y-3">
              <h4 className="font-bold text-lg text-gray-300 uppercase tracking-wide">Active Trades</h4>
              {activeTrades.length === 0 ? (
                <div className="text-gray-400 text-center py-8 bg-slate-700/30 rounded-lg border border-slate-600/50">
                  No active trades
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {activeTrades.map(trade => (
                    <div key={trade.id} className="bg-gradient-to-r from-slate-700/50 to-slate-600/50 p-4 rounded-lg border border-slate-600/50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-lg">{trade.asset}</span>
                        <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                          trade.direction === 'CALL' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-red-600 text-white'
                        }`}>
                          {trade.direction}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span className="font-semibold">${trade.amount}</span>
                        <span className="bg-blue-600 px-2 py-1 rounded text-white font-bold">
                          {Math.ceil((trade.openTime.getTime() + trade.duration * 1000 - Date.now()) / 1000)}s
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}