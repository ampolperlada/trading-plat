import { useState } from 'react';
import { Play, Smartphone, Monitor, Tablet, Apple, ChevronRight, Shield, TrendingUp, Download, Globe, Star } from 'lucide-react';

export default function ExpertOptionLandingPage() {
  const [email, setEmail] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ 
    firstName: '', 
    lastName: '', 
    email: '', 
    password: '',
    country: 'US'
  });

  // Handle Try Free Demo
  const handleTryDemo = () => {
    // Redirect to trading dashboard
    window.location.href = '/trading-dashboard';
  };

  // Handle Login
  const handleLogin = () => {
    if (loginData.email && loginData.password) {
      // Store user data
      localStorage.setItem('user', JSON.stringify({
        email: loginData.email,
        balance: 10000,
        accountType: 'Demo'
      }));
      localStorage.setItem('token', 'demo-token-' + Date.now());
      
      alert('Login successful! Redirecting to trading dashboard...');
      setShowLoginModal(false);
      
      // Redirect to trading dashboard
      setTimeout(() => {
        window.location.href = '/trading-dashboard';
      }, 1000);
    } else {
      alert('Please fill in all fields');
    }
  };

  // Handle Registration
  const handleRegister = () => {
    if (registerData.email && registerData.password && registerData.firstName && registerData.lastName) {
      // Store user data
      localStorage.setItem('user', JSON.stringify({
        email: registerData.email,
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        balance: 10000,
        accountType: 'Demo'
      }));
      localStorage.setItem('token', 'demo-token-' + Date.now());
      
      alert('Registration successful! Welcome to ExpertOption!');
      setShowRegisterModal(false);
      
      // Redirect to trading dashboard
      setTimeout(() => {
        window.location.href = '/trading-dashboard';
      }, 1000);
    } else {
      alert('Please fill in all fields');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-black text-white">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">EO</span>
            </div>
            <span className="text-xl font-bold">ExpertOption</span>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="#" className="text-gray-300 hover:text-white transition">Trading</a>
            <a href="#" className="text-gray-300 hover:text-white transition">Education</a>
            <a href="#" className="text-gray-300 hover:text-white transition">Company</a>
            <a href="#" className="text-gray-300 hover:text-white transition">Traders</a>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setShowLoginModal(true)}
            className="text-blue-400 hover:text-blue-300 transition"
          >
            Login
          </button>
          <button 
            onClick={() => setShowRegisterModal(true)}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold transition"
          >
            Register
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-blue-400">Investing</span> Is<br />
              Even Better<br />
              Now
            </h1>
            
            <p className="text-xl text-gray-300 leading-relaxed">
              Providing you with the opportunity to invest<br />
              in more than 100 assets for continuous income.
            </p>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold">f</div>
                  <div className="w-8 h-8 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold">m</div>
                  <div className="w-8 h-8 bg-red-600 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold">yt</div>
                  <div className="w-8 h-8 bg-orange-500 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold">G</div>
                </div>
                <span className="text-sm text-gray-400">+100 assets</span>
              </div>
            </div>

            <button 
              onClick={handleTryDemo}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-lg font-bold text-lg transition flex items-center space-x-2"
            >
              <span>Try free demo</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* 3D Phone Mockup */}
          <div className="relative">
            <div className="relative z-10 transform rotate-12 hover:rotate-6 transition-transform duration-500">
              {/* Phone Frame */}
              <div className="w-80 h-[600px] bg-gradient-to-br from-gray-800 to-gray-900 rounded-[3rem] p-4 shadow-2xl border border-gray-700">
                {/* Phone Screen */}
                <div className="w-full h-full bg-slate-900 rounded-[2.5rem] overflow-hidden relative">
                  {/* Status Bar */}
                  <div className="h-8 bg-slate-800 flex items-center justify-between px-4 text-xs">
                    <span>9:41</span>
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* Trading Interface Preview */}
                  <div className="p-4 space-y-4">
                    {/* Asset Buttons */}
                    <div className="flex space-x-2">
                      <div className="bg-blue-600 px-4 py-2 rounded-lg text-xs font-semibold">Stocks</div>
                      <div className="bg-slate-700 px-4 py-2 rounded-lg text-xs">Indices</div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="bg-blue-600 px-4 py-2 rounded-lg text-xs font-semibold">Metals</div>
                      <div className="bg-blue-600 px-4 py-2 rounded-lg text-xs font-semibold">Commodities</div>
                      <div className="bg-blue-600 px-4 py-2 rounded-lg text-xs font-semibold">ETF</div>
                    </div>

                    {/* Chart Area */}
                    <div className="bg-slate-800 rounded-lg p-4 h-48">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-400">EUR/USD</span>
                        <span className="text-xs text-green-400">+0.24%</span>
                      </div>
                      
                      {/* Mini Chart */}
                      <svg className="w-full h-32" viewBox="0 0 200 80">
                        <path
                          d="M0,60 Q50,40 100,45 T200,35"
                          stroke="#22c55e"
                          strokeWidth="2"
                          fill="none"
                        />
                        <path
                          d="M0,65 Q50,45 100,50 T200,40 L200,80 L0,80 Z"
                          fill="url(#gradient)"
                          opacity="0.3"
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.5"/>
                            <stop offset="100%" stopColor="#22c55e" stopOpacity="0"/>
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>

                    {/* Trade Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <button className="bg-green-600 py-3 rounded-lg text-sm font-bold">CALL</button>
                      <button className="bg-red-600 py-3 rounded-lg text-sm font-bold">PUT</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute top-20 -right-10 w-16 h-16 bg-blue-500/20 rounded-full animate-pulse"></div>
            <div className="absolute bottom-20 -left-10 w-12 h-12 bg-purple-500/20 rounded-full animate-pulse delay-1000"></div>
          </div>
        </div>
      </section>

      {/* For All Devices Section */}
      <section className="px-6 py-16 bg-slate-800/50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12">For All Devices</h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                <Smartphone className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold">Android</h3>
              <p className="text-gray-400 text-sm">4.4 and higher</p>
            </div>
            
            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                <Apple className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold">iOS</h3>
              <p className="text-gray-400 text-sm">iOS 10 and higher</p>
            </div>
            
            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                <Monitor className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold">Windows</h3>
              <p className="text-gray-400 text-sm">For quick trading</p>
            </div>
            
            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                <Apple className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold">MacOS</h3>
              <p className="text-gray-400 text-sm">Macintosh and Safari</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-6">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                <Download className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-semibold">Deposit</h3>
              <p className="text-gray-400">
                Open a real account and add funds. We<br />
                do not ask for more than $10.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-semibold">Trade</h3>
              <p className="text-gray-400">
                Trade any of 100 assets and stocks.<br />
                Use technical analysis and trade the<br />
                news.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                <Globe className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-semibold">Withdraw</h3>
              <p className="text-gray-400">
                Get your money to your bank card or e-<br />
                wallet. We take no commission.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted Section */}
      <section className="px-6 py-16 bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <Shield className="w-8 h-8 text-blue-400" />
                <h2 className="text-4xl font-bold">Trusted</h2>
              </div>
              
              <p className="text-gray-300 text-lg">
                ExpertOption is a leader in the online trading industry.<br />
                We are trusted by more than 65,000,000 clients<br />
                worldwide.
              </p>
              
              <button 
                onClick={handleTryDemo}
                className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold transition"
              >
                See more
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-slate-700 rounded-lg p-4 flex items-center space-x-4">
                <Star className="w-6 h-6 text-yellow-400" />
                <div>
                  <h4 className="font-semibold">Best Trading Platform</h4>
                  <p className="text-sm text-gray-400">Award winner at China Trading Expo</p>
                  <p className="text-xs text-gray-500">Shanghai, 27 May 2017</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Trading Platform */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12">Global Trading Platform</h2>
          
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-blue-400">$10</div>
              <div className="text-sm text-gray-400">Minimum Deposit</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-blue-400">$1</div>
              <div className="text-sm text-gray-400">Minimum Trading Amount</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-blue-400">0%</div>
              <div className="text-sm text-gray-400">Commissions</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-blue-400">0%</div>
              <div className="text-sm text-gray-400">Fees</div>
            </div>
          </div>

          <p className="text-gray-400 mb-8">People from 45 countries trade at ExpertOption</p>

          {/* World Map */}
          <div className="relative bg-slate-800 rounded-2xl p-8 overflow-hidden">
            <div className="absolute inset-0 opacity-30">
              <svg viewBox="0 0 800 400" className="w-full h-full">
                <defs>
                  <pattern id="dots" patternUnits="userSpaceOnUse" width="20" height="20">
                    <circle cx="10" cy="10" r="1" fill="#3b82f6" opacity="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#dots)"/>
                
                {/* Simplified world map outline */}
                <path
                  d="M150,150 Q200,120 250,140 T350,130 Q400,110 450,125 T550,120 Q600,100 650,115 M100,200 Q150,180 200,190 T300,185 Q350,165 400,175 T500,170 Q550,150 600,165"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  fill="none"
                  opacity="0.6"
                />
                
                {/* Trading activity dots */}
                <circle cx="200" cy="150" r="3" fill="#22c55e" className="animate-pulse"/>
                <circle cx="350" cy="180" r="3" fill="#22c55e" className="animate-pulse" style={{animationDelay: '0.5s'}}/>
                <circle cx="500" cy="160" r="3" fill="#22c55e" className="animate-pulse" style={{animationDelay: '1s'}}/>
                <circle cx="600" cy="140" r="3" fill="#22c55e" className="animate-pulse" style={{animationDelay: '1.5s'}}/>
              </svg>
            </div>
            
            <div className="relative z-10 text-center">
              <h3 className="text-2xl font-bold mb-4">Real-time Trading Activity</h3>
              <p className="text-gray-400">Join millions of traders worldwide</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-16 bg-slate-900 border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-5 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">EO</span>
                </div>
                <span className="text-lg font-bold">ExpertOption</span>
              </div>
              <p className="text-sm text-gray-400">
                The Company does not provide services to citizens and/or residents of the United States, Belgium, Bulgaria, Canada, Croatia, Cyprus, Czech Republic, Denmark, Estonia, Finland, France, Germany, Greece, Hungary, Iceland, Iran, Ireland, Israel, Italy, Latvia, Liechtenstein, Lithuania, Luxembourg, Malta, Netherlands, North Korea, Norway, Poland, Portugal, Puerto Rico, Romania, Russia, Singapore, Slovakia, Slovenia, Spain, Sudan, Sweden, Switzerland, Turkey, Ukraine, United Kingdom, Yemen.
              </p>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold">Home</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div>Free demo</div>
                <div>Features</div>
                <div>Login</div>
                <div>Register</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold">Trading</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div>Account types</div>
                <div>Social trading</div>
                <div>FAQ</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold">Education</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div>How to Start</div>
                <div>First Steps and Asset</div>
                <div>Strategies</div>
                <div>Fundamental</div>
                <div>Recovery & Growth</div>
                <div>Advanced trading strategies</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold">Company</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div>About company</div>
                <div>News</div>
                <div>Payment Policy</div>
                <div>Return Policy</div>
                <div>Privacy Policy</div>
                <div>AML & KYC</div>
                <div>Regulation</div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400">
              © 2014-2024 ExpertOption. Cape Verde. All rights reserved.
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-400">Payment methods:</div>
              <div className="flex space-x-2">
                <div className="w-8 h-5 bg-blue-600 rounded text-xs flex items-center justify-center">VISA</div>
                <div className="w-8 h-5 bg-red-600 rounded text-xs flex items-center justify-center">MC</div>
                <div className="w-8 h-5 bg-yellow-600 rounded text-xs flex items-center justify-center">$</div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-md border border-slate-700">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">Login to Your Account</h3>
              <p className="text-gray-400">Welcome back to ExpertOption</p>
            </div>

            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email Address"
                value={loginData.email}
                onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                className="w-full p-4 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              />
              
              <input
                type="password"
                placeholder="Password"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                className="w-full p-4 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              />

              <div className="flex space-x-3">
                <button
                  onClick={handleLogin}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-bold transition"
                >
                  Login
                </button>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="flex-1 bg-slate-600 hover:bg-slate-700 py-3 rounded-lg font-bold transition"
                >
                  Cancel
                </button>
              </div>
            </div>

            <div className="text-center mt-6">
              <button 
                onClick={() => {
                  setShowLoginModal(false);
                  setShowRegisterModal(true);
                }}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Don't have an account? Register here
              </button>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-3 mt-6 text-center">
              <p className="text-sm font-semibold text-gray-300 mb-1">Demo Login:</p>
              <p className="text-xs text-gray-400">
                Use any email and password<br />
                Virtual Balance: $10,000
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-md border border-slate-700">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">Create Your Account</h3>
              <p className="text-gray-400">Join ExpertOption today</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="First Name"
                  value={registerData.firstName}
                  onChange={(e) => setRegisterData({...registerData, firstName: e.target.value})}
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={registerData.lastName}
                  onChange={(e) => setRegisterData({...registerData, lastName: e.target.value})}
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <input
                type="email"
                placeholder="Email Address"
                value={registerData.email}
                onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                className="w-full p-4 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              />
              
              <input
                type="password"
                placeholder="Password"
                value={registerData.password}
                onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                className="w-full p-4 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              />

              <select
                value={registerData.country}
                onChange={(e) => setRegisterData({...registerData, country: e.target.value})}
                className="w-full p-4 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="US">United States</option>
                <option value="UK">United Kingdom</option>
                <option value="CA">Canada</option>
                <option value="AU">Australia</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="JP">Japan</option>
                <option value="Other">Other</option>
              </select>

              <div className="flex space-x-3">
                <button
                  onClick={handleRegister}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-bold transition"
                >
                  Create Account
                </button>
                <button
                  onClick={() => setShowRegisterModal(false)}
                  className="flex-1 bg-slate-600 hover:bg-slate-700 py-3 rounded-lg font-bold transition"
                >
                  Cancel
                </button>
              </div>
            </div>

            <div className="text-center mt-6">
              <button 
                onClick={() => {
                  setShowRegisterModal(false);
                  setShowLoginModal(true);
                }}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Already have an account? Login here
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}