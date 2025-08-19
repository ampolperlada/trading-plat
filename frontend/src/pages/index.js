// frontend/src/pages/index.js - Real Expert Option Landing Page
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
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">EO</span>
            </div>
            <span className="text-xl font-bold">ExpertOption</span>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="#" className="text-gray-300 hover:text-white transition-colors">Trading</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">Education</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">Company</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">Traders</a>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setIsSignUp(false)}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Login
          </button>
          <button 
            onClick={() => setIsSignUp(true)}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
          >
            Register
          </button>
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
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-gray-300">Real-time trading with instant execution</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-gray-300">AI-powered market analysis</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-gray-300">Up to 80% profit on successful trades</span>
              </div>
            </div>

            {/* Asset Categories */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Trading Assets</h3>
              
              <div className="space-y-2">
                <div className="text-gray-300">
                  <span className="text-blue-400 font-semibold">Stocks</span>
                  <br />
                  <span className="text-sm">Apple, Tesla, Google</span>
                </div>
                
                <div className="text-gray-300">
                  <span className="text-blue-400 font-semibold">Forex</span>
                  <br />
                  <span className="text-sm">EUR/USD, GBP/USD</span>
                </div>
                
                <div className="text-gray-300">
                  <span className="text-blue-400 font-semibold">Crypto</span>
                  <br />
                  <span className="text-sm">Bitcoin, Ethereum</span>
                </div>
                
                <div className="text-gray-300">
                  <span className="text-blue-400 font-semibold">Commodities</span>
                  <br />
                  <span className="text-sm">Gold, Oil, Silver</span>
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

          {/* Right Side - Login/Register Form */}
          <div className="relative">
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 shadow-2xl">
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                  <p className="text-gray-400">Sign in to your trading account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {isSignUp && (
                    <div>
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                        required
                      />
                    </div>
                  )}
                  
                  <div>
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                      required
                    />
                  </div>
                  
                  <div>
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50"
                  >
                    {isLoading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
                  </button>
                </form>

                <div className="text-center">
                  <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign up"}
                  </button>
                </div>

                {/* Demo Account Section */}
                <div className="border-t border-slate-600 pt-6 space-y-4">
                  <h3 className="text-lg font-semibold text-white text-center">Try Demo Account:</h3>
                  
                  <div className="bg-slate-700/30 rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-blue-400">📧</span>
                      <span className="text-white font-mono text-sm">demo@trading.com</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-blue-400">🔑</span>
                      <span className="text-white font-mono text-sm">demo123</span>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-green-400 font-bold mb-4">$10,000 virtual balance included!</div>
                    
                    <button
                      onClick={handleDemoLogin}
                      className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white py-3 rounded-lg font-semibold transition-all duration-200"
                    >
                      Start Demo Trading
                    </button>
                  </div>
                </div>
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
        <div className="mt-24 grid md:grid-cols-4 gap-8 text-center">
          {[
            { number: '100+', label: 'Trading Assets' },
            { number: '80%', label: 'Max Profit' },
            { number: '24/7', label: 'Market Access' },
            { number: '1M+', label: 'Traders Trust Us' }
          ].map((stat, i) => (
            <div key={i} className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
              <div className="text-3xl font-bold text-blue-400 mb-2">{stat.number}</div>
              <div className="text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features Section */}
        <div className="mt-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">For All Devices</h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { name: 'Android', subtitle: 'All and tablet', icon: '📱' },
              { name: 'iOS', subtitle: 'All and tablet', icon: '🍎' },
              { name: 'Windows', subtitle: 'All platforms', icon: '🖥️' },
              { name: 'MacOS', subtitle: 'All software', icon: '💻' }
            ].map((device, i) => (
              <div key={i} className="text-center bg-slate-800/30 rounded-lg p-6 border border-slate-700/50 hover:border-blue-500/50 transition-colors">
                <div className="text-4xl mb-4">{device.icon}</div>
                <h3 className="text-white font-bold text-lg mb-2">{device.name}</h3>
                <p className="text-gray-400">{device.subtitle}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Deposit',
                description: 'Open a real account and add funds. We work with more than 20 payment systems.',
                icon: '💳'
              },
              {
                title: 'Trade',
                description: 'Trade any of 100 assets and stocks. Use technical analysis and trade the news.',
                icon: '📈'
              },
              {
                title: 'Withdraw',
                description: 'Get funds easily to your bank card or e-wallet. We have no commissions.',
                icon: '💰'
              }
            ].map((step, i) => (
              <div key={i} className="text-center bg-slate-800/30 rounded-lg p-8 border border-slate-700/50">
                <div className="text-5xl mb-6">{step.icon}</div>
                <h3 className="text-white font-bold text-xl mb-4">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}