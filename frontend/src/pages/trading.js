// frontend/src/pages/trading.js - Simple Working Version
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMarketData } from '../contexts/MarketDataContext';
import { useTrading } from '../contexts/TradingContext';

export default function TradingPage() {
  const { user, logout } = useAuth();
  const { marketData, connectionStatus, fetchHistoricalData } = useMarketData();
  const { activeTrades, executeTrade, isLoading } = useTrading();

  const [selectedAsset, setSelectedAsset] = useState('EURUSD');
  const [investmentAmount, setInvestmentAmount] = useState(10);
  const [timeframe, setTimeframe] = useState('1m');
  const [activeCategory, setActiveCategory] = useState('all');
  const [chartData, setChartData] = useState([]);

  // Asset categories
  const assetCategories = {
    all: ['EURUSD', 'GBPUSD', 'USDJPY', 'BTCUSD', 'ETHUSD', 'AAPL', 'TSLA', 'GOOGL', 'GOLD', 'OIL'],
    forex: ['EURUSD', 'GBPUSD', 'USDJPY'],
    crypto: ['BTCUSD', 'ETHUSD'],
    stocks: ['AAPL', 'TSLA', 'GOOGL'],
    commodities: ['GOLD', 'OIL']
  };

  // Load chart data when asset changes
  useEffect(() => {
    const loadChartData = async () => {
      const data = await fetchHistoricalData(selectedAsset, timeframe, 100);
      setChartData(data);
    };

    if (selectedAsset) {
      loadChartData();
    }
  }, [selectedAsset, timeframe, fetchHistoricalData]);

  // Handle trade execution
  const handleTrade = async (direction) => {
    try {
      await executeTrade(selectedAsset, direction, investmentAmount, 60);
    } catch (error) {
      console.error('Trade execution failed:', error);
    }
  };

  // Render professional candlestick chart
  const renderChart = () => {
    if (!chartData.length) {
      return (
        <div className="flex items-center justify-center h-96 bg-slate-900 rounded-lg border border-slate-700">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <div className="text-gray-400">Loading chart data...</div>
          </div>
        </div>
      );
    }

    const width = 800;
    const height = 400;
    const padding = { top: 20, right: 80, bottom: 40, left: 60 };
    
    const prices = chartData.flatMap(d => [d.high, d.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;
    
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const candleWidth = Math.max(chartWidth / chartData.length - 2, 4);

    return (
      <div className="bg-slate-900 rounded-lg border border-slate-700 p-4 relative">
        {/* Connection Status */}
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span className="text-xs text-gray-400 capitalize">{connectionStatus}</span>
        </div>

        <svg width="100%" height="400" viewBox={`0 0 ${width} ${height}`} className="w-full">
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
            </>
          )}
        </svg>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to access trading</h1>
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Header */}
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
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="text-gray-300">
                {connectionStatus === 'connected' ? 'Live Trading' : 'Connecting...'}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <div className="text-xs text-gray-400 uppercase">Balance</div>
              <div className="text-lg font-bold">${user.balance?.toLocaleString() || '0'}</div>
            </div>
            <div className="bg-blue-600 px-3 py-1 rounded text-sm font-semibold">
              {user.accountType || 'Demo'} Account
            </div>
            <button 
              onClick={logout}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Left Panel - Assets */}
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
                  className={`px-3 py-1 text-xs rounded font-semibold transition-colors ${
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
              
              if (!data) {
                return (
                  <div key={symbol} className="p-3 border-b border-slate-700/50">
                    <div className="animate-pulse">
                      <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                    </div>
                  </div>
                );
              }
              
              return (
                <div
                  key={symbol}
                  onClick={() => setSelectedAsset(symbol)}
                  className={`p-3 cursor-pointer border-b border-slate-700/50 hover:bg-slate-700 transition-colors ${
                    isSelected ? 'bg-slate-700 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-sm">{symbol}</div>
                      <div className="text-xs text-gray-400">{data.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm">{data.price}</div>
                      <div className={`text-xs font-semibold ${
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
                  {marketData[selectedAsset]?.name || selectedAsset}
                </div>
                {marketData[selectedAsset] && (
                  <>
                    <div className="text-lg font-mono">{marketData[selectedAsset].price}</div>
                    <div className={`text-sm font-semibold ${
                      marketData[selectedAsset].change >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {marketData[selectedAsset].change >= 0 ? '+' : ''}{marketData[selectedAsset].change}%
                    </div>
                  </>
                )}
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
                  className={`px-3 py-1 text-xs rounded font-semibold transition-colors ${
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
                  className="w-full pl-8 pr-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:border-blue-500 focus:outline-none"
                  min="1"
                  max={user.balance}
                />
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {[10, 25, 50, 100, 250, 500].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setInvestmentAmount(amount)}
                    disabled={amount > user.balance}
                    className={`px-2 py-1 text-xs rounded font-semibold transition-colors ${
                      investmentAmount === amount
                        ? 'bg-blue-600 text-white'
                        : amount > user.balance
                        ? 'bg-slate-600 text-gray-500 cursor-not-allowed'
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
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white focus:border-blue-500 focus:outline-none"
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
                onClick={() => handleTrade('PUT')}
                disabled={isLoading || !marketData[selectedAsset] || investmentAmount > user.balance}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded font-bold text-lg flex items-center justify-center space-x-2 transition-colors"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <span>📉</span>
                    <span>PUT/Lower</span>
                  </>
                )}
              </button>
              
              <button
                onClick={() => handleTrade('CALL')}
                disabled={isLoading || !marketData[selectedAsset] || investmentAmount > user.balance}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded font-bold text-lg flex items-center justify-center space-x-2 transition-colors"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <span>📈</span>
                    <span>CALL/Higher</span>
                  </>
                )}
              </button>
            </div>

            {/* Payout Info */}
            <div className="bg-slate-700 p-3 rounded border border-slate-600">
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-400">Payout:</span>
                  <span className="text-green-400 font-semibold">80%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Profit:</span>
                  <span className="text-green-400 font-semibold">+${(investmentAmount * 0.8).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Investment:</span>
                  <span className="text-white font-semibold">${investmentAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-600 pt-1 mt-1">
                  <span className="text-gray-400">Total Return:</span>
                  <span className="text-white font-bold">${(investmentAmount + (investmentAmount * 0.8)).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Current Price Display */}
            {marketData[selectedAsset] && (
              <div className="bg-slate-700 p-3 rounded border border-slate-600">
                <div className="text-center">
                  <div className="text-xs text-gray-400 uppercase tracking-wide">Current Price</div>
                  <div className="text-2xl font-mono font-bold">{marketData[selectedAsset].price}</div>
                  <div className={`text-sm font-semibold ${
                    marketData[selectedAsset].change >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {marketData[selectedAsset].change >= 0 ? '+' : ''}{marketData[selectedAsset].change}%
                  </div>
                </div>
              </div>
            )}

            {/* Active Trades */}
            <div>
              <h4 className="font-semibold mb-2 flex items-center justify-between">
                <span>Active Trades</span>
                <span className="bg-blue-600 text-xs px-2 py-1 rounded-full">{activeTrades.length}</span>
              </h4>
              {activeTrades.length === 0 ? (
                <div className="text-gray-400 text-sm text-center py-6 bg-slate-700/50 rounded border border-slate-600/50">
                  No active trades
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {activeTrades.map(trade => {
                    const timeLeft = Math.max(0, Math.ceil((trade.timeLeft || 0) / 1000));
                    const currentPrice = marketData[trade.symbol]?.price;
                    const isWinning = currentPrice && (
                      (trade.direction === 'CALL' && currentPrice > trade.openPrice) ||
                      (trade.direction === 'PUT' && currentPrice < trade.openPrice)
                    );
                    
                    return (
                      <div key={trade.id} className="bg-slate-700 p-3 rounded border border-slate-600">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-sm">{trade.symbol}</span>
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            trade.direction === 'CALL' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                          }`}>
                            {trade.direction}
                          </span>
                        </div>
                        <div className="text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Amount:</span>
                            <span className="text-white">${trade.amount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Open Price:</span>
                            <span className="text-white font-mono">{trade.openPrice}</span>
                          </div>
                          {currentPrice && (
                            <div className="flex justify-between">
                              <span className="text-gray-400">Current Price:</span>
                              <span className={`font-mono ${isWinning ? 'text-green-400' : 'text-red-400'}`}>
                                {currentPrice}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between items-center pt-1 border-t border-slate-600">
                            <span className="text-gray-400">Time Left:</span>
                            <span className="bg-blue-600 px-2 py-1 rounded text-white font-bold">
                              {timeLeft}s
                            </span>
                          </div>
                          {isWinning !== undefined && (
                            <div className="text-center">
                              <span className={`text-xs font-semibold ${isWinning ? 'text-green-400' : 'text-red-400'}`}>
                                {isWinning ? '🎉 Winning' : '😞 Losing'}
                              </span>
                            </div>
                          )}
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
}