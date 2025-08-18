// frontend/src/pages/index.js - Landing Page with Expert Option Style
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaChartLine, FaLock, FaMobile, FaGlobe, FaArrowUp, FaArrowDown } from 'react-icons/fa';

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const { login, register, isLoading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin) {
      await login(formData.email, formData.password);
    } else {
      await register(formData);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <FaChartLine className="text-white text-xl" />
            </div>
<h1 className="text-2xl font-bold text-white">ExpertTrade</h1>
          </div>
          <div className="hidden md:flex space-x-8 text-gray-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#trading" className="hover:text-white transition-colors">Trading</a>
            <a href="#about" className="hover:text-white transition-colors">About</a>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left Side - Marketing Content */}
          <div className="text-center lg:text-left">
            <h2 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Investing Is
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                Even Better Now
              </span>
            </h2>
            
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Providing you with the opportunity to invest in more than 100 assets for continuous profit. 
              Trade binary options with the most advanced platform.
            </p>

            {/* Asset Categories */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-blue-600 rounded-lg p-4 text-center">
                <FaChartLine className="text-white text-2xl mx-auto mb-2" />
                <p className="text-white font-semibold">Stocks</p>
                <p className="text-blue-100 text-sm">Apple, Tesla, Google</p>
              </div>
              <div className="bg-orange-600 rounded-lg p-4 text-center">
                <FaGlobe className="text-white text-2xl mx-auto mb-2" />
                <p className="text-white font-semibold">Forex</p>
                <p className="text-orange-100 text-sm">EUR/USD, GBP/USD</p>
              </div>
              <div className="bg-yellow-600 rounded-lg p-4 text-center">
                <FaLock className="text-white text-2xl mx-auto mb-2" />
                <p className="text-white font-semibold">Crypto</p>
                <p className="text-yellow-100 text-sm">Bitcoin, Ethereum</p>
              </div>
              <div className="bg-green-600 rounded-lg p-4 text-center">
                <FaMobile className="text-white text-2xl mx-auto mb-2" />
                <p className="text-white font-semibold">Commodities</p>
                <p className="text-green-100 text-sm">Gold, Oil, Silver</p>
              </div>
            </div>

            {/* Features */}
            <div className="text-left space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span className="text-gray-300">Real-time trading with instant execution</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span className="text-gray-300">AI-powered market analysis</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span className="text-gray-300">Up to 80% profit on successful trades</span>
              </div>
            </div>
          </div>

          {/* Right Side - Auth Form */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-white mb-2">
                {isLogin ? 'Welcome Back' : 'Start Trading Today'}
              </h3>
              <p className="text-gray-300">
                {isLogin ? 'Sign in to your trading account' : 'Create your free account in seconds'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 text-white placeholder-gray-400 rounded-xl border border-white/20 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 text-white placeholder-gray-400 rounded-xl border border-white/20 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                    required
                  />
                </div>
              )}

              <input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 text-white placeholder-gray-400 rounded-xl border border-white/20 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                required
              />

              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 text-white placeholder-gray-400 rounded-xl border border-white/20 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                required
              />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 transform hover:scale-105"
              >
                {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Start Trading')}
              </button>
            </form>

            <div className="text-center mt-6">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>

            {isLogin && (
              <div className="mt-6 p-4 bg-blue-900/30 rounded-xl border border-blue-500/30">
                <p className="text-blue-300 text-sm mb-2 font-semibold">Try Demo Account:</p>
                <p className="text-xs text-blue-200">📧 demo@trading.com</p>
                <p className="text-xs text-blue-200">🔑 demo123</p>
                <p className="text-xs text-blue-300 mt-1">$10,000 virtual balance included!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-white mb-2">100+</div>
            <div className="text-gray-400">Trading Assets</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-2">80%</div>
            <div className="text-gray-400">Max Profit</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-2">24/7</div>
            <div className="text-gray-400">Market Access</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-2">1M+</div>
            <div className="text-gray-400">Traders Trust Us</div>
          </div>
        </div>
      </div>
    </div>
  );
}
