import React, { useState, useEffect } from 'react';

const RealExpertOptionPlatform = () => {
  const [selectedAsset, setSelectedAsset] = useState('EURUSD');
  const [investmentAmount, setInvestmentAmount] = useState(10);
  const [timeframe, setTimeframe] = useState('1m');
  const [balance, setBalance] = useState(10000);
  const [activeTrades, setActiveTrades] = useState([]);
  
  // Real market data simulation (this would connect to Investing.com API)
  const [marketData, setMarketData] = useState({
    'EURUSD': { price: 1.08501, change: -0.07 },
    'GBPUSD': { price: 1.2489, change: 0.02 },
    'USDJPY': { price: 150.344, change: -0.02 },
    'BTCUSD': { price: 65980.65, change: -0.18 },
    'ETHUSD': { price: 3110.34, change: -0.64 },
    'AAPL': { price: 156.02, change: -0.87 },
    'TSLA': { price: 251.23, change: 0.02 },
    'GOOGL': { price: 143.52, change: 0.15 },
    'GOLD': { price: 2027.4, change: -0.01 },
    'OIL': { price: 85.24, change: 0.01 }
  });

  const [candleData, setCandleData] = useState([]);

  // Generate realistic candlestick data
  useEffect(() => {
    const generateCandles = () => {
      const candles = [];
      let basePrice = marketData[selectedAsset]?.price || 1.08501;
      
      for (let i = 0; i < 100; i++) {
        const timestamp = Date.now() - (99 - i) * 60000;
        const open = basePrice + (Math.random() - 0.5) * 0.001;
        const volatility = 0.0005;
        const close = open + (Math.random() - 0.5) * volatility;
        const high = Math.max(open, close) + Math.random() * volatility * 0.5;
        const low = Math.min(open, close) - Math.random() * volatility * 0.5;
        
        candles.push({
          timestamp,
          open: parseFloat(open.toFixed(5)),
          high: parseFloat(high.toFixed(5)),
          low: parseFloat(low.toFixed(5)),
          close: parseFloat(close.toFixed(5))
        });
        
        basePrice = close;
      }
      
      setCandleData(candles);
    };

    generateCandles();
    const interval = setInterval(generateCandles, 1000);
    return () => clearInterval(interval);
  }, [selectedAsset, marketData]);

  // Asset categories
  const assetCategories = {
    all: ['EURUSD', 'GBPUSD', 'USDJPY', 'BTCUSD', 'ETHUSD', 'AAPL', 'TSLA', 'GOOGL', 'GOLD', 'OIL'],
    forex: ['EURUSD', 'GBPUSD', 'USDJPY'],
    crypto: ['BTCUSD', 'ETHUSD'],
    stocks: ['AAPL', 'TSLA', 'GOOGL'],
    commodities: ['GOLD', 'OIL']
  };

  const [activeCategory, setActiveCategory] = useState('all');

  // Execute trade
  const executeTrade = (direction) => {
    const newTrade = {
      id: Date.now(),
      asset: selectedAsset,
      direction,
      amount: investmentAmount,
      openPrice: marketData[selectedAsset].price,
      openTime: Date.now(),
      duration: 60, // 1 minute
      payout: 0.8 // 80%
    };

    setActiveTrades(prev => [...prev, newTrade]);
    setBalance(prev => prev - investmentAmount);

    // Auto-settle trade after duration
    setTimeout(() => {
      const currentPrice = marketData[selectedAsset].price;
      const isWin = (direction === 'CALL' && currentPrice > newTrade.openPrice) ||
                   (direction === 'PUT' && currentPrice < newTrade.openPrice);
      
      setActiveTrades(prev => prev.filter(t => t.id !== newTrade.id));
      
      if (isWin) {
        setBalance(prev => prev + newTrade.amount + (newTrade.amount * newTrade.payout));
      }
    }, 60000);
  };

  // Render professional candlestick chart
  const renderChart = () => {
    if (!candleData.length) return null;

    const width = 800;
    const height = 400;
    const padding = { top: 20, right: 80, bottom: 40, left: 60 };
    
    const prices = candleData.flatMap(d => [d.high, d.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;
    
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const candleWidth = chartWidth / candleData.length;

    return (
      <div className="bg-slate-900 rounded-lg border border-slate-700 p-4">
        <svg width={width} height={height} className="w-full h-full">
          {/* Background */}
          <rect width={width} height={height} fill="#0f172a" />
          
          {/* Grid lines */}
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
                  stroke="#1e293b"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
                <text
                  x={width - padding.right + 5}
                  y={y + 4}
                  fill="#64748b"
                  fontSize="12"
                  fontFamily="monospace"
                >
                  {price.toFixed(5)}
                </text>
              </g>
            );
          })}

          {/* Candlesticks */}
          {candleData.map((candle, i) => {
            const x = padding.left + (i * candleWidth) + (candleWidth / 2);
            const isGreen = candle.close > candle.open;
            
            const yHigh = padding.top + ((maxPrice - candle.high) / priceRange) * chartHeight;
            const yLow = padding.top + ((maxPrice - candle.low) / priceRange) * chartHeight;
            const yOpen = padding.top + ((maxPrice - candle.open) / priceRange) * chartHeight;
            const yClose = padding.top + ((maxPrice - candle.close) / priceRange) * chartHeight;
            
            const bodyTop = Math.min(yOpen, yClose);
            const bodyHeight = Math.abs(yClose - yOpen) || 1;
            const wickWidth = Math.max(candleWidth * 0.6, 8);

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
                  x={x - wickWidth/2}
                  y={bodyTop}
                  width={wickWidth}
                  height={bodyHeight}
                  fill={isGreen ? "#22c55e" : "#ef4444"}
                  stroke={isGreen ? "#16a34a" : "#dc2626"}
                  strokeWidth="1"
                />
              </g>
            );
          })}

          {/* Current price line */}
          <line
            x1={padding.left}
            y1={padding.top + ((maxPrice - marketData[selectedAsset].price) / priceRange) * chartHeight}
            x2={width - padding.right}
            y2={padding.top + ((maxPrice - marketData[selectedAsset].price) / priceRange) * chartHeight}
            stroke="#3b82f6"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          
          {/* Price label */}
          <rect
            x={width - padding.right - 60}
            y={padding.top + ((maxPrice - marketData[selectedAsset].price) / priceRange) * chartHeight - 12}
            width="55"
            height="24"
            fill="#3b82f6"
            rx="4"
          />
          <text
            x={width - padding.right - 32}
            y={padding.top + ((maxPrice - marketData[selectedAsset].price) / priceRange) * chartHeight + 4}
            fill="white"
            fontSize="12"
            fontFamily="monospace"
            textAnchor="middle"
          >
            {marketData[selectedAsset].price}
          </text>
        </svg>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Header - Exact Expert Option Style */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">EO</span>
              </div>
              <span className="text-xl font-bold">ExpertOption</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-300">Live Trading</span>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <div className="text-xs text-gray-400 uppercase">Balance</div>
              <div className="text-lg font-bold">${balance.toLocaleString()}</div>
            </div>
            <div className="bg-blue-600 px-3 py-1 rounded text-sm font-semibold">Demo Account</div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Left Panel - Assets (Exact Expert Option Design) */}
        <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col">
          {/* Asset Categories */}
          <div className="p-4 border-b border-slate-700">
            <div className="flex flex-wrap gap-1">
              {[
                { key: 'all', label: 'All' },
                { key: 'forex', label: 'Forex' },
                { key: 'crypto', label: 'Crypto' },
                { key: 'stocks', label: 'Stocks' },
                { key: 'commodities', label: 'Commodities' }
              ].map(category => (
                <button
                  key={category.key}
                  onClick={() => setActiveCategory(category.key)}
                  className={`px-3 py-1 text-xs rounded font-semibold ${
                    activeCategory === category.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Asset List */}
          <div className="flex-1 overflow-y-auto">
            {assetCategories[activeCategory].map(symbol => {
              const data = marketData[symbol];
              const isSelected = selectedAsset === symbol;
              
              return (
                <div
                  key={symbol}
                  onClick={() => setSelectedAsset(symbol)}
                  className={`p-3 cursor-pointer border-b border-slate-700/50 hover:bg-slate-700 ${
                    isSelected ? 'bg-slate-700 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-sm">{symbol}</div>
                      <div className="text-xs text-gray-400">
                        {symbol.includes('USD') ? 'Currency' : 
                         ['AAPL', 'TSLA', 'GOOGL'].includes(symbol) ? 'Stock' :
                         ['BTCUSD', 'ETHUSD'].includes(symbol) ? 'Crypto' : 'Commodity'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm">{data.price}</div>
                      <div className={`text-xs ${
                        data.change >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {data.change >= 0 ? '+' : ''}{data.change}%
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center Panel - Chart */}
        <div className="flex-1 flex flex-col">
          {/* Asset Header */}
          <div className="bg-slate-800 border-b border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">{selectedAsset}</h1>
                <div className="text-sm text-gray-400">
                  {selectedAsset.includes('USD') ? 'EUR/USD' : selectedAsset}
                </div>
                <div className="text-xs text-gray-500">{marketData[selectedAsset].price}</div>
                <div className={`text-sm ${
                  marketData[selectedAsset].change >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {marketData[selectedAsset].change >= 0 ? '+' : ''}{marketData[selectedAsset].change}%
                </div>
              </div>
            </div>
          </div>

          {/* Timeframe Selector */}
          <div className="bg-slate-800 border-b border-slate-700 p-2">
            <div className="flex space-x-1">
              {['1m', '5m', '15m', '30m', '1h', '4h', '1D'].map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 text-xs rounded font-semibold ${
                    timeframe === tf
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Chart Area */}
          <div className="flex-1 p-4">
            {renderChart()}
          </div>
        </div>

        {/* Right Panel - Trading */}
        <div className="w-80 bg-slate-800 border-l border-slate-700 p-4">
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Trade Panel</h3>

            {/* Investment Amount */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Investment Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-400">$</span>
                <input
                  type="number"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                />
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {[10, 25, 50, 100, 250, 500].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setInvestmentAmount(amount)}
                    className={`px-2 py-1 text-xs rounded font-semibold ${
                      investmentAmount === amount
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    }`}
                  >
                    ${amount}
                  </button>
                ))}
              </div>
            </div>

            {/* Trade Duration */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Trade Duration</label>
              <select
                value="1 minute"
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
              >
                <option>1 minute</option>
                <option>3 minutes</option>
                <option>5 minutes</option>
                <option>15 minutes</option>
              </select>
            </div>

            {/* Trade Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => executeTrade('PUT')}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded font-bold text-lg flex items-center justify-center space-x-2"
              >
                <span>PUT/Lower</span>
              </button>
              
              <button
                onClick={() => executeTrade('CALL')}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded font-bold text-lg flex items-center justify-center space-x-2"
              >
                <span>CALL/Higher</span>
              </button>
            </div>

            {/* Payout Info */}
            <div className="bg-slate-700 p-3 rounded">
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-400">Payout: 80%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Profit:</span>
                  <span className="text-green-400">+${(investmentAmount * 0.8).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Investment:</span>
                  <span className="text-white">${investmentAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Active Trades */}
            <div>
              <h4 className="font-semibold mb-2">Active Trades</h4>
              {activeTrades.length === 0 ? (
                <div className="text-gray-400 text-sm text-center py-4">No active trades</div>
              ) : (
                <div className="space-y-2">
                  {activeTrades.map(trade => {
                    const timeLeft = Math.max(0, Math.ceil((trade.openTime + trade.duration * 1000 - Date.now()) / 1000));
                    return (
                      <div key={trade.id} className="bg-slate-700 p-2 rounded text-sm">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold">{trade.asset}</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            trade.direction === 'CALL' ? 'bg-green-600' : 'bg-red-600'
                          }`}>
                            {trade.direction}
                          </span>
                        </div>
                        <div className="flex justify-between text-gray-300">
                          <span>${trade.amount}</span>
                          <span>{timeLeft}s</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealExpertOptionPlatform;