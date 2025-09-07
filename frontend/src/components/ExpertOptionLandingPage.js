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
  Users,
  DollarSign
} from 'lucide-react';

export default function ExpertOptionLandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

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

  const navigateToTrading = () => {
    // In a real app, this would use Next.js router
    alert('Navigate to trading dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Header */}
      <header className="relative z-50">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              {/* Menu Icon */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white hover:text-blue-400 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Language/Region with flag */}
              <div className="hidden md:flex items-center space-x-2 text-white">
                <div className="flex items-center space-x-1">
                  <div className="w-4 h-3 bg-gradient-to-b from-red-500 to-red-600 rounded-sm"></div>
                  <span className="text-sm">Online chat</span>
                </div>
              </div>
            </div>

            {/* Logo - Centered */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">EO</span>
                </div>
                <span className="text-white text-xl font-bold">ExpertOption</span>
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={navigateToTrading}
                className="text-white hover:text-blue-400 transition-colors text-sm"
              >
                Login
              </button>
              <button 
                onClick={navigateToTrading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                Register
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                <span className="text-blue-400">Investing</span> Is<br />
                Even Better Now
              </h1>
            </div>
            
            <p className="text-gray-300 text-lg leading-relaxed max-w-lg">
              Providing you with the opportunity to invest in more than 100 assets for continuous income
            </p>

            {/* Social Media Icons */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="flex -space-x-1">
                  <div className="w-8 h-8 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-white text-xs font-bold">f</span>
                  </div>
                  <div className="w-8 h-8 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-white text-xs font-bold">yt</span>
                  </div>
                  <div className="w-8 h-8 bg-blue-700 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-white text-xs font-bold">in</span>
                  </div>
                  <div className="w-8 h-8 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-white text-xs font-bold">G</span>
                  </div>
                </div>
                <span className="text-gray-300 text-sm font-medium">+100 assets</span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <button 
                onClick={navigateToTrading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105 flex items-center space-x-2 text-lg"
              >
                <span>Try free demo</span>
                <Play className="w-5 h-5 fill-current" />
              </button>
            </div>
          </div>

          {/* Mobile App Mockup */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative">
              {/* Phone Container */}
              <div className="w-72 h-[500px] relative">
                {/* Phone Frame */}
                <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 rounded-[3rem] shadow-2xl border-8 border-gray-700">
                  <div className="p-6 h-full flex flex-col">
                    {/* Status Bar */}
                    <div className="flex justify-between items-center mb-6 text-white text-sm">
                      <span>9:41</span>
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                      </div>
                    </div>

                    {/* App Interface */}
                    <div className="flex-1 space-y-3">
                      {/* Stocks */}
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4 text-center relative overflow-hidden">
                        <div className="relative z-10">
                          <TrendingUp className="w-8 h-8 text-white mx-auto mb-2" />
                          <span className="text-white font-bold text-lg">Stocks</span>
                        </div>
                        <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8"></div>
                      </div>
                      
                      {/* Indices */}
                      <div className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-2xl p-4 text-center relative overflow-hidden">
                        <div className="relative z-10">
                          <Globe className="w-8 h-8 text-white mx-auto mb-2" />
                          <span className="text-white font-bold text-lg">Indices</span>
                        </div>
                        <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8"></div>
                      </div>
                      
                      {/* Metals */}
                      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-4 text-center relative overflow-hidden">
                        <div className="relative z-10">
                          <Award className="w-8 h-8 text-white mx-auto mb-2" />
                          <span className="text-white font-bold text-lg">Metals</span>
                        </div>
                        <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8"></div>
                      </div>
                      
                      {/* Commodities */}
                      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-4 text-center relative overflow-hidden">
                        <div className="relative z-10">
                          <Users className="w-8 h-8 text-white mx-auto mb-2" />
                          <span className="text-white font-bold text-lg">Commodities</span>
                        </div>
                        <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8"></div>
                      </div>
                      
                      {/* ETF */}
                      <div className="bg-gradient-to-r from-blue-700 to-blue-800 rounded-2xl p-4 text-center relative overflow-hidden">
                        <div className="relative z-10">
                          <Shield className="w-8 h-8 text-white mx-auto mb-2" />
                          <span className="text-white font-bold text-lg">ETF</span>
                        </div>
                        <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 bg-red-500 rounded-full w-10 h-10 flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm font-bold">7</span>
                </div>
                
                <div className="absolute -bottom-4 -left-4 bg-blue-600 rounded-xl p-3 shadow-lg">
                  <span className="text-white text-sm font-bold">Asset List</span>
                </div>

                <div className="absolute top-20 -right-8 bg-blue-500 rounded-lg p-2 shadow-lg transform rotate-12">
                  <span className="text-white text-xs font-medium">Market</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For All Devices Section */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-white text-center mb-16">For All Devices</h2>
        
        <div className="grid md:grid-cols-4 gap-8">
          <div className="text-center group">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-700 transition-colors">
              <Smartphone className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Android</h3>
            <p className="text-gray-400">4.4 and higher</p>
          </div>
          
          <div className="text-center group">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-700 transition-colors">
              <Smartphone className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">iOS</h3>
            <p className="text-gray-400">9.0 and higher</p>
          </div>
          
          <div className="text-center group">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-700 transition-colors">
              <Monitor className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Windows</h3>
            <p className="text-gray-400">7 and higher</p>
          </div>
          
          <div className="text-center group">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-700 transition-colors">
              <Monitor className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">MacOS</h3>
            <p className="text-gray-400">Macintosh and Safari</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-white text-center mb-16">How It Works</h2>
        
        <div className="grid md:grid-cols-3 gap-12">
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <Download className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-white font-bold text-xl mb-4">Deposit</h3>
            <p className="text-gray-400 leading-relaxed">
              Open a real account and add funds. We work with more than 20 payment systems.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <TrendingUp className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-white font-bold text-xl mb-4">Trade</h3>
            <p className="text-gray-400 leading-relaxed">
              Trade any of 100 assets and stocks. Use technical analysis and trade the news.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <DollarSign className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-white font-bold text-xl mb-4">Withdraw</h3>
            <p className="text-gray-400 leading-relaxed">
              Get funds easily to your bank card or e-wallet. We take no commission.
            </p>
          </div>
        </div>
      </section>

      {/* Trusted Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-6">Trusted</h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto mb-8">
            ExpertOption is trusted by traders from around the world and are trusted by more than 70,000,000 clients.
          </p>
          
          <div className="flex justify-center mb-8">
            <button 
              onClick={navigateToTrading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors"
            >
              Start trading
            </button>
          </div>

          <div className="flex justify-center">
            <div className="bg-slate-800/50 rounded-2xl p-6 inline-flex items-center space-x-4">
              <Award className="w-12 h-12 text-blue-400" />
              <div className="text-left">
                <div className="text-white font-bold text-lg">Best Trading Platform</div>
                <div className="text-gray-400 text-sm">Award winner at China Foreign Expo</div>
                <div className="text-gray-400 text-sm">ShowChina 6/7 May 2017</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Trading Platform */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-8">
            <Globe className="w-12 h-12 text-blue-400" />
            <h2 className="text-4xl font-bold text-white">Global Trading Platform</h2>
          </div>
          
          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">$1B</div>
              <div className="text-white font-semibold">Minimum Deposit</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">$1</div>
              <div className="text-white font-semibold">Minimum Trading Amount</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">0%</div>
              <div className="text-white font-semibold">Commissions</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">0%</div>
              <div className="text-white font-semibold">Fees</div>
            </div>
          </div>

          <p className="text-gray-400 text-lg mb-12">People from 48 countries trade at ExpertOption</p>

          {/* World Map Visualization */}
          <div className="relative h-96 bg-slate-800/30 rounded-3xl flex items-center justify-center overflow-hidden">
            {/* Simplified world map made with dots */}
            <div className="absolute inset-0 opacity-20">
              <svg viewBox="0 0 1000 500" className="w-full h-full">
                {/* Create dotted world map pattern */}
                {Array.from({ length: 50 }, (_, i) => 
                  Array.from({ length: 100 }, (_, j) => (
                    <circle
                      key={`${i}-${j}`}
                      cx={j * 10}
                      cy={i * 10}
                      r="1"
                      fill="#3b82f6"
                      opacity={Math.random() * 0.6 + 0.2}
                    />
                  ))
                )}
              </svg>
            </div>
            <div className="relative z-10">
              <Globe className="w-32 h-32 text-blue-400/40" />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl font-bold text-white mb-6">Ready to Start Trading?</h2>
        <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
          Join millions of traders worldwide and experience professional trading.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={navigateToTrading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105"
          >
            Try Free Demo
          </button>
          <button 
            onClick={navigateToTrading}
            className="border-2 border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all"
          >
            Start Real Trading
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800/50 border-t border-slate-700">
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-5 gap-8">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">EO</span>
                </div>
                <span className="text-white text-xl font-bold">ExpertOption</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                The Company does not provide services to citizens and/or residents of Australia, Austria, Belarus, Belgium, Bulgaria, Canada, Croatia, Cyprus, Czech Republic, Denmark, Estonia, Finland, France, Germany, Greece, Hungary, Iceland, Iran, Ireland, Israel, Italy, Latvia, Liechtenstein, Lithuania, Luxembourg, Malta, Myanmar, Netherlands, North Korea, Norway, Poland, Portugal, Romania, Russia, Singapore, Slovakia, Slovenia, Spain, Sudan, Sweden, Switzerland, UK, Ukraine, USA, Yemen.
              </p>
            </div>

            {/* Navigation Links */}
            <div>
              <h4 className="text-white font-bold mb-4">Home</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Free demo</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Login</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Registration</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Trading</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Account types</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Social trading</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">FAQ</a></li>
              </ul>
            </div>

            {/* Payment Methods */}
            <div>
              <h4 className="text-white font-bold mb-4">Payment methods</h4>
              <div className="flex flex-wrap gap-2">
                <div className="bg-slate-700 rounded px-3 py-2">
                  <span className="text-white text-xs font-medium">VISA</span>
                </div>
                <div className="bg-slate-700 rounded px-3 py-2">
                  <span className="text-white text-xs font-medium">MC</span>
                </div>
                <div className="bg-slate-700 rounded px-3 py-2">
                  <span className="text-white text-xs font-medium">PayPal</span>
                </div>
                <div className="bg-slate-700 rounded px-3 py-2">
                  <span className="text-white text-xs font-medium">Skrill</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-slate-700 pt-8 mt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2014 - 2024 ExpertOption. All rights reserved.
              </p>
              <div className="flex space-x-4 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                    <span className="text-xs">f</span>
                  </div>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                    <span className="text-xs">t</span>
                  </div>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                    <span className="text-xs">in</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}