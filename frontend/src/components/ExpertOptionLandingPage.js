import React, { useState, useEffect } from 'react';
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

  // Mock market data
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

  // Initialize and update market data
  useEffect(() => {
    const updatePrices = () => {
      setMarketData(prevData => {
        const newData = {};
        Object.entries(assets).forEach(([symbol, asset]) => {
          const prevPrice = prevData[symbol]?.price || asset.price;
          const variation = (Math.random() - 0.5) * 0.001;
          const newPrice = prevPrice * (1 + variation);
          const changePercent = ((newPrice - asset.price) / asset.price) * 100;
          
          newData[symbol] = {
            ...asset,
            price: Math.max(0.0001, newPrice),
            change: changePercent,
            timestamp: Date.now()
          };
        });
        return newData;
      });
    };

    updatePrices();
    const interval = setInterval(updatePrices, 3000);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (symbol, price) => {
    if (!price) return '0.00000';
    if (symbol.includes('JPY')) return price.toFixed(3);
    if (symbol.includes('BTC') || symbol.includes('ETH')) return price.toFixed(2);
    return price.toFixed(5);
  };

  const placeTrade = async (direction) => {
    const currentPrice = marketData[selectedAsset]?.price;
    if (!currentPrice || user.balance < selectedAmount) return;

    const trade = {
      id: Date.now().toString(),
      asset: selectedAsset,
      direction,
      amount: selectedAmount,
      entryPrice: currentPrice,
      timestamp: Date.now(),
      expiryTime: Date.now() + (selectedTime * 1000),
      status: 'active'
    };

    setActiveTrades(prev => [...prev, trade]);
    setUser(prev => ({ ...prev, balance: prev.balance - selectedAmount }));

    // Simulate trade result
    setTimeout(() => {
      const finalPrice = marketData[selectedAsset]?.price;
      if (!finalPrice) return;

      const priceChange = finalPrice - trade.entryPrice;
      const isWin = (direction === 'CALL' && priceChange > 0) || (direction === 'PUT' && priceChange < 0);
      const payout = isWin ? selectedAmount * 1.8 : 0;

      if (isWin) {
        setUser(prev => ({ ...prev, balance: prev.balance + payout }));
      }

      setActiveTrades(prev => prev.filter(t => t.id !== trade.id));
    }, selectedTime * 1000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Trading Dashboard Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">EO</span>
              </div>
              <span className="text-xl font-bold text-white">ExpertOption</span>
            </div>
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              ) : (
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              )}
              <span className={`text-sm ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
                {isConnected ? 'Live' : 'Offline'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="bg-slate-700 rounded-lg px-4 py-2">
              <div className="text-center">
                <div className="text-gray-400 text-xs">Balance</div>
                <div className="text-green-500 font-bold text-lg">
                  ${user.balance.toFixed(2)}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">{user.name.charAt(0)}</span>
              </div>
              <span className="text-white">{user.name}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Panel - Assets */}
        <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col">
          <div className="p-4 border-b border-slate-700">
            <div className="grid grid-cols-4 gap-1">
              {categories.map(category => (
                <button
                  key={category.id}
                  className="p-2 rounded text-xs transition-colors bg-slate-700 text-gray-300 hover:bg-slate-600"
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
                  className={`w-full p-4 text-left hover:bg-slate-700 transition-colors border-l-4 ${
                    isSelected ? 'bg-slate-700 border-blue-500' : 'border-transparent'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{asset.icon}</span>
                      <div>
                        <div className="font-bold text-sm">{symbol}</div>
                        <div className="text-xs text-gray-400">{asset.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm font-semibold">
                        {formatPrice(symbol, data.price)}
                      </div>
                      <div className={`text-xs font-bold ${
                        data.change >= 0 ? 'text-green-400' : 'text-red-400'
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
          <div className="bg-slate-800 px-6 py-4 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedAsset}</h2>
                <p className="text-gray-400">{assets[selectedAsset]?.name}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-mono font-bold text-white">
                  {formatPrice(selectedAsset, marketData[selectedAsset]?.price)}
                </div>
                <div className={`text-lg font-semibold ${
                  (marketData[selectedAsset]?.change || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {(marketData[selectedAsset]?.change || 0) >= 0 ? '+' : ''}
                  {(marketData[selectedAsset]?.change || 0).toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 p-6">
            <div className="h-full bg-slate-800 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Live Chart</h3>
                <p className="text-gray-400">Real-time price movements for {selectedAsset}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Trading */}
        <div className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col">
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-bold text-white">Trade Options</h2>
            
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-3">Investment Amount</label>
              <input
                type="number"
                value={selectedAmount}
                onChange={(e) => setSelectedAmount(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none text-center font-mono text-lg"
                min="1"
                max={user.balance}
              />
              <div className="grid grid-cols-3 gap-2 mt-3">
                {[10, 25, 50, 100, 250, 500].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setSelectedAmount(amount)}
                    disabled={user.balance < amount}
                    className={`px-3 py-2 text-sm rounded font-semibold transition disabled:opacity-50 ${
                      selectedAmount === amount ? 'bg-blue-600 text-white' : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
                    }`}
                  >
                    ${amount}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-3">Expiry Time</label>
              <div className="grid grid-cols-5 gap-1">
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
                    className={`p-3 text-sm rounded font-semibold transition ${
                      selectedTime === interval.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    }`}
                  >
                    {interval.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-700 rounded-lg p-4 text-center">
              <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Current Price</div>
              <div className="text-2xl font-mono font-bold">
                {formatPrice(selectedAsset, marketData[selectedAsset]?.price)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => placeTrade('PUT')}
                disabled={user.balance < selectedAmount}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:opacity-50 text-white font-bold py-6 px-4 rounded-lg transition-all transform hover:scale-105 flex flex-col items-center space-y-2"
              >
                <TrendingDown className="w-6 h-6" />
                <span className="text-lg">PUT</span>
                <span className="text-xs opacity-75">Lower</span>
              </button>
              
              <button
                onClick={() => placeTrade('CALL')}
                disabled={user.balance < selectedAmount}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 text-white font-bold py-6 px-4 rounded-lg transition-all transform hover:scale-105 flex flex-col items-center space-y-2"
              >
                <TrendingUp className="w-6 h-6" />
                <span className="text-lg">CALL</span>
                <span className="text-xs opacity-75">Higher</span>
              </button>
            </div>

            <div className="bg-slate-700 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Payout:</span>
                <span className="text-green-400 font-semibold">80%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Profit:</span>
                <span className="text-green-400 font-semibold">+${(selectedAmount * 0.8).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Investment:</span>
                <span className="text-white font-semibold">${selectedAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex-1 border-t border-slate-700 p-4">
            <h3 className="text-white font-medium mb-4">Active Trades ({activeTrades.length})</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {activeTrades.map(trade => {
                const timeLeft = Math.max(0, Math.ceil((trade.expiryTime - Date.now()) / 1000));
                return (
                  <div key={trade.id} className="bg-slate-700 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-sm">{trade.asset}</span>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        trade.direction === 'CALL' ? 'bg-green-600' : 'bg-red-600'
                      }`}>
                        {trade.direction}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>${trade.amount}</span>
                      <span>{timeLeft}s</span>
                    </div>
                    <div className="text-xs text-gray-400">
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
                <div className="text-center text-gray-400 py-8 text-sm">
                  No active trades
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
export default function ExpertOptionLandingPage({ onStartTrading }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showTradingDashboard, setShowTradingDashboard] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const handleNavigation = () => {
    setShowTradingDashboard(true);
  };

  const handleBackToLanding = () => {
    setShowTradingDashboard(false);
  };

  // Show trading dashboard if requested
  if (showTradingDashboard) {
    return (
      <div>
        <div className="absolute top-4 left-4 z-50">
          <button
            onClick={handleBackToLanding}
            className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            ← Back to Landing
          </button>
        </div>
        <TradingDashboard />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-800 to-purple-900">
      {/* Header */}
      <header className="relative z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50">
        <nav className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button className="text-gray-400 hover:text-white transition-colors">
                <Menu className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="w-4 h-3 bg-red-500 rounded-sm"></div>
                <span className="text-gray-400 text-sm">Online chat</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">EO</span>
              </div>
              <span className="text-white text-lg font-bold">ExpertOption</span>
            </div>

            <div className="flex items-center space-x-3">
              <button 
                onClick={handleNavigation}
                className="text-gray-300 hover:text-white transition-colors text-sm px-4 py-2 rounded-lg border border-slate-600 hover:border-slate-500"
              >
                Login
              </button>
              <button 
                onClick={handleNavigation}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                Register
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
              <span className="text-blue-400">Investing</span> Is<br />
              Even Better Now
            </h1>
            
            <p className="text-gray-400 text-lg leading-relaxed max-w-md">
              Providing you with the opportunity to invest in more than 100 assets for continuous income
            </p>

            <div className="flex items-center space-x-4">
              <div className="flex -space-x-1">
                <div className="w-8 h-8 bg-blue-600 rounded-full border-2 border-slate-900 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">f</span>
                </div>
                <div className="w-8 h-8 bg-red-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">m</span>
                </div>
                <div className="w-8 h-8 bg-red-600 rounded-full border-2 border-slate-900 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">yt</span>
                </div>
                <div className="w-8 h-8 bg-blue-700 rounded-full border-2 border-slate-900 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">t</span>
                </div>
                <div className="w-8 h-8 bg-green-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">G</span>
                </div>
              </div>
              <span className="text-gray-400 text-base">+100 assets</span>
            </div>

            <button 
              onClick={handleNavigation}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-medium transition-all transform hover:scale-105 flex items-center space-x-2 text-lg"
            >
              <span>Try free demo</span>
              <Play className="w-5 h-5 fill-current" />
            </button>
          </div>

          {/* Phone Mockup */}
          <div className="relative flex justify-center lg:justify-start lg:ml-8">
            <div className="relative">
              <div className="w-72 h-[520px] relative transform rotate-12">
                <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 rounded-[2.5rem] shadow-2xl border-4 border-gray-600">
                  <div className="p-4 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-4 text-white text-sm">
                      <span>9:41</span>
                      <div className="flex space-x-1">
                        <div className="w-4 h-1 bg-white rounded-full"></div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                      </div>
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-center relative overflow-hidden">
                        <TrendingUp className="w-6 h-6 text-white mx-auto mb-2" />
                        <span className="text-white font-semibold text-sm">Stocks</span>
                      </div>
                      
                      <div className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl p-4 text-center relative overflow-hidden">
                        <Globe className="w-6 h-6 text-white mx-auto mb-2" />
                        <span className="text-white font-semibold text-sm">Indices</span>
                      </div>
                      
                      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-center relative overflow-hidden">
                        <Award className="w-6 h-6 text-white mx-auto mb-2" />
                        <span className="text-white font-semibold text-sm">Metals</span>
                      </div>
                      
                      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 text-center relative overflow-hidden">
                        <Users className="w-6 h-6 text-white mx-auto mb-2" />
                        <span className="text-white font-semibold text-sm">Commodities</span>
                      </div>
                      
                      <div className="bg-gradient-to-r from-blue-700 to-blue-800 rounded-xl p-4 text-center relative overflow-hidden">
                        <Shield className="w-6 h-6 text-white mx-auto mb-2" />
                        <span className="text-white font-semibold text-sm">ETF</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute -top-3 -right-3 bg-red-500 rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm font-bold">7</span>
                </div>
                
                <div className="absolute -bottom-3 -left-3 bg-blue-600 rounded-lg px-3 py-2 shadow-lg">
                  <span className="text-white text-sm font-medium">Asset List</span>
                </div>
              </div>

              <div className="absolute top-12 -right-6 w-52 h-80 bg-gradient-to-b from-gray-700 to-gray-800 rounded-xl border-2 border-gray-600 transform rotate-3 shadow-lg opacity-80">
                <div className="p-3 h-full">
                  <div className="space-y-1.5">
                    <div className="h-3 bg-gray-600 rounded w-full"></div>
                    <div className="h-2 bg-gray-600 rounded w-3/4"></div>
                    <div className="space-y-1 mt-4">
                      {Array.from({length: 15}, (_, i) => (
                        <div key={i} className="h-1 bg-gray-600 rounded" style={{width: `${50 + Math.random() * 50}%`}}></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute top-6 right-8 bg-blue-500 rounded-lg p-2 shadow-lg transform rotate-6">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>

              <div className="absolute bottom-16 -left-8 bg-green-500 rounded-lg p-2 shadow-lg transform -rotate-12">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For All Devices */}
      <section className="bg-slate-800/50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-white text-center mb-12">For All Devices</h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Smartphone, name: 'Android', desc: '4.4 and higher' },
              { icon: Smartphone, name: 'iOS', desc: '9.0 and higher' },
              { icon: Monitor, name: 'Windows', desc: '7 and higher' },
              { icon: Monitor, name: 'MacOS', desc: 'Macintosh and Safari' }
            ].map((platform, i) => (
              <div key={i} className="text-center group">
                <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-700 transition-colors">
                  <platform.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-1">{platform.name}</h3>
                <p className="text-gray-400 text-base">{platform.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-white text-center mb-12">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
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
                <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white font-semibold text-xl mb-3">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed text-base">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted Section */}
      <section className="bg-slate-800/50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Trusted</h2>
            <p className="text-gray-400 max-w-xl mx-auto mb-6 text-base">
              ExpertOption is trusted by traders from around the world and are trusted by more than 70,000,000 clients.
            </p>
            
            <button 
              onClick={handleNavigation}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium mb-6 transition-colors text-lg"
            >
              Start trading
            </button>

            <div className="bg-slate-700/30 rounded-lg p-4 max-w-sm mx-auto">
              <div className="flex items-center space-x-3">
                <Award className="w-8 h-8 text-blue-400 flex-shrink-0" />
                <div className="text-left">
                  <div className="text-white font-medium text-base">Best Trading Platform</div>
                  <div className="text-gray-400 text-sm">Award winner at China Foreign Expo</div>
                  <div className="text-gray-400 text-sm">ShowChina 6/7 May 2017</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Trading Platform */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <Globe className="w-8 h-8 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">Global Trading Platform</h2>
            </div>
            
            <div className="grid grid-cols-4 gap-4 mb-8">
              {[
                { value: '$1B', label: 'Minimum Deposit' },
                { value: '$1', label: 'Minimum Trading Amount' },
                { value: '0%', label: 'Commissions' },
                { value: '0%', label: 'Fees' }
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-1">{stat.value}</div>
                  <div className="text-white text-sm font-medium">{stat.label}</div>
                </div>
              ))}
            </div>

            <p className="text-gray-400 text-sm mb-6">People from 48 countries trade at ExpertOption</p>

            <div className="relative h-48 bg-slate-800/20 rounded-xl flex items-center justify-center overflow-hidden">
              <Globe className="w-12 h-12 text-blue-400/30" />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-slate-800/50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Trading?</h2>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            Join millions of traders worldwide and experience professional trading.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleNavigation}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
            >
              Try Free Demo
            </button>
            <button 
              onClick={handleNavigation}
              className="border-2 border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white px-8 py-3 rounded-lg font-semibold transition-all"
            >
              Start Real Trading
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-700">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-6 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">EO</span>
                </div>
                <span className="text-white font-bold">ExpertOption</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                The Company does not provide services to citizens and/or residents of Australia, Austria, Belarus, Belgium, Bulgaria, Canada, Croatia, Cyprus, Czech Republic, Denmark, Estonia, Finland, France, Germany, Greece, Hungary, Iceland, Iran, Ireland, Israel, Italy, Latvia, Liechtenstein, Lithuania, Luxembourg, Malta, Myanmar, Netherlands, North Korea, Norway, Poland, Portugal, Romania, Russia, Singapore, Slovakia, Slovenia, Spain, Sudan, Sweden, Switzerland, UK, Ukraine, USA, Yemen.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Home</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Free demo</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Login</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Registration</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Trading</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Account types</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Social trading</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">About company</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Terms</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Payment methods</h4>
              <div className="grid grid-cols-2 gap-2">
                {['VISA', 'MC', 'PayPal', 'Skrill', 'Neteller', 'WebMoney'].map((method) => (
                  <div key={method} className="bg-slate-800 rounded px-2 py-1 text-center">
                    <span className="text-white text-xs font-medium">{method}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-8 mt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2014 - 2024 ExpertOption. All rights reserved.
              </p>
              <div className="flex space-x-4 mt-4 md:mt-0">
                {['f', 't', 'in', 'yt'].map((social) => (
                  <a key={social} href="#" className="text-gray-400 hover:text-white transition-colors">
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
    </div>
  );
}