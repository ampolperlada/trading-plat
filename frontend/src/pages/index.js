import React, { useState, useEffect } from 'react';
import { ChevronDown, Play, Globe, Shield, TrendingUp, Award, Users, BarChart3 } from 'lucide-react';

const ExpertOptionLanding = () => {
  const [activeTab, setActiveTab] = useState('Stocks');
  const [currentPrice, setCurrentPrice] = useState(785.69694);
  const [priceChange, setPriceChange] = useState(-0.66);

  // Simulate price movement
  useEffect(() => {
    const interval = setInterval(() => {
      const change = (Math.random() - 0.5) * 2;
      setCurrentPrice(prev => prev + change);
      setPriceChange((Math.random() - 0.5) * 4);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const assetCategories = {
    'Stocks': [
      { name: 'Apple', symbol: 'AAPL', change: -0.87 },
      { name: 'Tesla', symbol: 'TSLA', change: +0.02 },
      { name: 'Google', symbol: 'GOOGL', change: +0.55 }
    ],
    'Indices': [
      { name: 'S&P 500', symbol: 'SPX', change: +0.23 },
      { name: 'NASDAQ', symbol: 'NDX', change: +0.45 },
      { name: 'Dow Jones', symbol: 'DJI', change: -0.12 }
    ],
    'Metals': [
      { name: 'Gold', symbol: 'GOLD', change: +0.34 },
      { name: 'Silver', symbol: 'SILVER', change: -0.23 },
      { name: 'Platinum', symbol: 'PLAT', change: +0.78 }
    ],
    'Commodities': [
      { name: 'Oil', symbol: 'OIL', change: +1.23 },
      { name: 'Gas', symbol: 'GAS', change: -0.45 },
      { name: 'Wheat', symbol: 'WHEAT', change: +0.67 }
    ],
    'ETF': [
      { name: 'SPY', symbol: 'SPY', change: +0.12 },
      { name: 'QQQ', symbol: 'QQQ', change: +0.34 },
      { name: 'IWM', symbol: 'IWM', change: -0.23 }
    ]
  };

  const handleStartTrading = () => {
    window.location.href = '/auth';
  };

  const handleLogin = () => {
    window.location.href = '/auth';
  };

  const handleRegister = () => {
    window.location.href = '/auth';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white">
      {/* Header */}
      <header className="relative z-10 px-6 py-4 bg-slate-900/30 backdrop-blur-sm border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">
                EO
              </div>
              <span className="text-xl font-bold">ExpertOption</span>
            </div>
            <nav className="hidden md:flex space-x-6">
              <button className="hover:text-slate-300 transition">Trading</button>
              <button className="hover:text-slate-300 transition">Education</button>
              <button className="hover:text-slate-300 transition">Company</button>
              <button className="hover:text-slate-300 transition">Traders</button>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleLogin}
              className="text-slate-300 hover:text-white transition"
            >
              Login
            </button>
            <button 
              onClick={handleRegister}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium transition"
            >
              Register
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div className="space-y-8">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
                <span className="text-blue-300">Investing Is</span><br />
                <span className="text-white">Even Better Now</span>
              </h1>
              <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                Providing you with the opportunity to invest in more than 100 assets for 
                continuous profit. Trade binary options with the most advanced platform.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                  </svg>
                </div>
                <span className="text-slate-300">Real-time trading with instant execution</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                  </svg>
                </div>
                <span className="text-slate-300">AI-powered market analysis</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                  </svg>
                </div>
                <span className="text-slate-300">Up to 80% profit on successful trades</span>
              </div>
            </div>

            {/* Trading Assets */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold">Trading Assets</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="font-medium">Stocks</span>
                  </div>
                  <p className="text-sm text-slate-400">Apple, Tesla, Google</p>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <Globe className="w-5 h-5 text-orange-400" />
                    </div>
                    <span className="font-medium">Forex</span>
                  </div>
                  <p className="text-sm text-slate-400">EUR/USD, GBP/USD</p>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-purple-400" />
                    </div>
                    <span className="font-medium">Crypto</span>
                  </div>
                  <p className="text-sm text-slate-400">Bitcoin, Ethereum</p>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <Award className="w-5 h-5 text-yellow-400" />
                    </div>
                    <span className="font-medium">Commodities</span>
                  </div>
                  <p className="text-sm text-slate-400">Gold, Oil, Silver</p>
                </div>
              </div>

              {/* Social Trading */}
              <div className="flex items-center space-x-4">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full border-2 border-slate-800 flex items-center justify-center text-sm font-bold">T</div>
                  <div className="w-8 h-8 bg-red-500 rounded-full border-2 border-slate-800 flex items-center justify-center text-sm font-bold">M</div>
                  <div className="w-8 h-8 bg-green-500 rounded-full border-2 border-slate-800 flex items-center justify-center text-sm font-bold">S</div>
                  <div className="w-8 h-8 bg-purple-500 rounded-full border-2 border-slate-800 flex items-center justify-center text-sm font-bold">C</div>
                </div>
                <span className="text-slate-300 font-medium">+100 assets</span>
              </div>

              <button 
                onClick={handleStartTrading}
                className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200"
              >
                Try free demo →
              </button>
            </div>
          </div>

          {/* Right Content - Trading Widget */}
          <div className="relative">
            {/* Mobile Preview */}
            <div className="relative mx-auto w-80 h-96 bg-slate-800 rounded-3xl border-4 border-slate-700 overflow-hidden">
              {/* Mobile Header */}
              <div className="bg-slate-900 px-4 py-3 flex items-center justify-between">
                <div className="flex space-x-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="text-xs text-slate-400">ExpertOption</div>
              </div>

              {/* Asset List */}
              <div className="p-4">
                <div className="bg-slate-700/50 rounded-lg p-3 mb-4">
                  <div className="text-xs text-slate-400 mb-2">Asset list</div>
                  <div className="space-y-1">
                    {Object.keys(assetCategories).map((category) => (
                      <button
                        key={category}
                        onClick={() => setActiveTab(category)}
                        className={`w-full px-3 py-2 rounded text-sm font-medium transition ${
                          activeTab === category 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-slate-700/60 text-slate-300 hover:bg-slate-600/60'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Assets */}
                <div className="space-y-2">
                  {assetCategories[activeTab]?.map((asset, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-slate-700/30 rounded">
                      <div>
                        <div className="text-sm font-medium text-white">{asset.name}</div>
                        <div className="text-xs text-slate-400">{asset.symbol}</div>
                      </div>
                      <div className={`text-sm font-medium ${asset.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating Action Button */}
              <div className="absolute bottom-4 right-4">
                <button className="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition">
                  <span className="text-white font-bold text-xs">IBM</span>
                </button>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-8 right-8 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
            <div className="absolute bottom-8 left-8 w-6 h-6 bg-purple-400 rounded-full animate-bounce"></div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 text-center">
            <div className="text-3xl font-bold text-slate-300 mb-2">100+</div>
            <div className="text-slate-400">Trading Assets</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 text-center">
            <div className="text-3xl font-bold text-slate-300 mb-2">80%</div>
            <div className="text-slate-400">Max Profit</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 text-center">
            <div className="text-3xl font-bold text-slate-300 mb-2">24/7</div>
            <div className="text-slate-400">Market Access</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 text-center">
            <div className="text-3xl font-bold text-slate-300 mb-2">1M+</div>
            <div className="text-slate-400">Traders Trust Us</div>
          </div>
        </div>

        {/* Demo Account Section */}
        <div className="mt-20 text-center">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-8 border border-slate-700 max-w-md mx-auto">
            <h3 className="text-2xl font-bold mb-6">Try Demo Account:</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-6 h-6 bg-slate-700 rounded flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-slate-300">demo@trading.com</span>
              </div>
              
              <div className="flex items-center justify-center space-x-2">
                <div className="w-6 h-6 bg-slate-700 rounded flex items-center justify-center">
                  <Shield className="w-4 h-4 text-yellow-400" />
                </div>
                <span className="text-slate-300">demo123</span>
              </div>
              
              <div className="text-2xl font-bold text-green-400">
                $10,000 virtual balance included!
              </div>
            </div>

            <button 
              onClick={handleStartTrading}
              className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-xl font-bold text-lg transition-all duration-200"
            >
              Start Demo Trading
            </button>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="mt-32 bg-gradient-to-b from-transparent to-slate-900/80 backdrop-blur-sm border-t border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-8">For All Devices</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-700/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📱</span>
                </div>
                <h4 className="font-bold text-slate-300 mb-2">Android</h4>
                <p className="text-sm text-slate-400">4.6 app rating</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-700/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🍎</span>
                </div>
                <h4 className="font-bold text-slate-300 mb-2">iOS</h4>
                <p className="text-sm text-slate-400">4.5 app rating</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-700/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💻</span>
                </div>
                <h4 className="font-bold text-slate-300 mb-2">Windows</h4>
                <p className="text-sm text-slate-400">All platforms</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-700/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🖥️</span>
                </div>
                <h4 className="font-bold text-slate-300 mb-2">MacOS</h4>
                <p className="text-sm text-slate-400">MacOS and higher</p>
              </div>
            </div>
          </div>

          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-8">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-slate-700/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">👤</span>
                </div>
                <h4 className="text-xl font-bold mb-4">Deposit</h4>
                <p className="text-slate-400">Open a real account and add funds. We work with most top payment systems.</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-slate-700/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">📈</span>
                </div>
                <h4 className="text-xl font-bold mb-4">Trade</h4>
                <p className="text-slate-400">Trade any of 100 assets and stocks. Use our analytical instruments for better profit.</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-slate-700/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">💰</span>
                </div>
                <h4 className="text-xl font-bold mb-4">Withdraw</h4>
                <p className="text-slate-400">Get funds easily to your bank card or e-wallet. We have no commission.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertOptionLanding;