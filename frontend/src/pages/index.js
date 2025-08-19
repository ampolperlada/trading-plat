// frontend/src/pages/index.js - Simple Working Version
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const { login, register, isLoading } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        await register({ email, password, name });
      } else {
        await login(email, password);
      }
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  const handleDemoLogin = async () => {
    try {
      await login('demo@trading.com', 'demo123');
    } catch (error) {
      console.error('Demo login error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">EO</span>
            </div>
            <span className="text-2xl font-bold">ExpertOption</span>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="#" className="text-gray-300 hover:text-white transition-colors">Trading</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">Education</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">Company</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">Traders</a>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-blue-400 hover:text-blue-300 transition-colors">Login</button>
          <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">Register</button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Hero Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                <span className="text-blue-400">Investing Is</span>
                <br />
                <span className="text-white">Even Better Now</span>
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                Providing you with the opportunity to invest in more than 100 assets for continuous profit. 
                Trade binary options with the most advanced platform.
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <span className="text-gray-300">Real-time trading with instant execution</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <span className="text-gray-300">AI-powered market analysis</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <span className="text-gray-300">Up to 80% profit on successful trades</span>
              </div>
            </div>

            {/* Trading Assets */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Trading Assets</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <div className="text-blue-400 font-semibold">📈 Stocks</div>
                  <div className="text-sm text-gray-400">Apple, Tesla, Google</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <div className="text-blue-400 font-semibold">💱 Forex</div>
                  <div className="text-sm text-gray-400">EUR/USD, GBP/USD</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <div className="text-blue-400 font-semibold">₿ Crypto</div>
                  <div className="text-sm text-gray-400">Bitcoin, Ethereum</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <div className="text-blue-400 font-semibold">🥇 Commodities</div>
                  <div className="text-sm text-gray-400">Gold, Oil, Silver</div>
                </div>
              </div>
            </div>

            {/* Social Proof */}
            <div className="flex items-center space-x-4">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center border-2 border-slate-900">
                  <span className="text-white font-bold text-sm">f</span>
                </div>
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center border-2 border-slate-900">
                  <span className="text-white font-bold text-sm">m</span>
                </div>
                <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center border-2 border-slate-900">
                  <span className="text-white font-bold text-sm">t</span>
                </div>
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center border-2 border-slate-900">
                  <span className="text-white font-bold text-sm">+</span>
                </div>
              </div>
              <div className="text-gray-300">
                <span className="font-bold text-white">+100 assets</span>
              </div>
            </div>

            <button 
              onClick={handleDemoLogin}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-200"
            >
              Try free demo →
            </button>
          </div>

          {/* Right Side - Phone Mockup */}
          <div className="relative flex justify-center">
            <div className="w-80 h-96 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-700/50">
              {/* Phone Screen */}
              <div className="bg-slate-900 rounded-2xl h-full p-4 relative">
                {/* Red Badge */}
                <div className="absolute top-4 right-4 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">T</span>
                </div>

                {/* Asset Categories */}
                <div className="space-y-3 mt-8">
                  <div className="text-xs text-gray-400 mb-4">Asset list</div>
                  
                  <div className="space-y-2">
                    <div className="bg-blue-600 px-3 py-2 rounded-lg text-center text-xs font-semibold text-white">
                      Stocks
                    </div>
                    <div className="bg-slate-700 px-3 py-2 rounded-lg text-center text-xs font-semibold text-gray-300">
                      Indices
                    </div>
                    <div className="bg-slate-700 px-3 py-2 rounded-lg text-center text-xs font-semibold text-gray-300">
                      Metals
                    </div>
                    <div className="bg-slate-700 px-3 py-2 rounded-lg text-center text-xs font-semibold text-gray-300">
                      Commodities
                    </div>
                    <div className="bg-slate-700 px-3 py-2 rounded-lg text-center text-xs font-semibold text-gray-300">
                      ETF
                    </div>
                  </div>
                </div>

                {/* Asset List */}
                <div className="space-y-2 mt-6">
                  <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded text-xs">
                    <div>
                      <div className="text-white font-medium">Apple</div>
                      <div className="text-gray-400">AAPL</div>
                    </div>
                    <div className="text-red-400 font-semibold">-0.87%</div>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded text-xs">
                    <div>
                      <div className="text-white font-medium">Tesla</div>
                      <div className="text-gray-400">TSLA</div>
                    </div>
                    <div className="text-green-400 font-semibold">+0.02%</div>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded text-xs">
                    <div>
                      <div className="text-white font-medium">Google</div>
                      <div className="text-gray-400">GOOGL</div>
                    </div>
                    <div className="text-green-400 font-semibold">+0.15%</div>
                  </div>
                </div>
              </div>

              {/* IBM Badge */}
              <div className="absolute bottom-4 right-4 bg-blue-600 px-2 py-1 rounded text-white text-xs font-bold">
                IBM
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <span className="text-white font-bold">T</span>
            </div>
            <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-purple-500 rounded-full animate-bounce"></div>
            <div className="absolute top-1/2 -left-6 w-6 h-6 bg-green-500 rounded-full animate-ping"></div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-24 grid md:grid-cols-4 gap-8">
          <div className="text-center bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
            <div className="text-3xl font-bold text-blue-400 mb-2">100+</div>
            <div className="text-gray-400">Trading Assets</div>
          </div>
          <div className="text-center bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
            <div className="text-3xl font-bold text-blue-400 mb-2">80%</div>
            <div className="text-gray-400">Max Profit</div>
          </div>
          <div className="text-center bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
            <div className="text-3xl font-bold text-blue-400 mb-2">24/7</div>
            <div className="text-gray-400">Market Access</div>
          </div>
          <div className="text-center bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
            <div className="text-3xl font-bold text-blue-400 mb-2">1M+</div>
            <div className="text-gray-400">Traders Trust Us</div>
          </div>
        </div>

        {/* Demo Account Section */}
        <div className="mt-16 max-w-md mx-auto bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-8 border border-slate-700/50">
          <h3 className="text-xl font-bold text-white mb-6 text-center">Try Demo Account:</h3>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-center space-x-2 bg-slate-700/30 rounded-lg p-3">
              <span className="text-blue-400">📧</span>
              <span className="text-white font-mono">demo@trading.com</span>
            </div>
            <div className="flex items-center justify-center space-x-2 bg-slate-700/30 rounded-lg p-3">
              <span className="text-blue-400">🔑</span>
              <span className="text-white font-mono">demo123</span>
            </div>
          </div>
          
          <div className="text-green-400 font-bold text-center mb-6">$10,000 virtual balance included!</div>
          
          <button 
            onClick={handleDemoLogin}
            className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105"
          >
            Start Demo Trading
          </button>
        </div>
      </div>
    </div>
  );
}