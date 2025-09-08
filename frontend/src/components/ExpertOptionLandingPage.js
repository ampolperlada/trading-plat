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
  DollarSign,
  CreditCard,
  CheckCircle
} from 'lucide-react';

export default function ExpertOptionLandingPage({ onStartTrading }) {
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

  const handleNavigation = () => {
    if (onStartTrading) {
      onStartTrading();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
      {/* Header - Exact Expert Option Style */}
      <header className="relative z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50">
        <nav className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left side */}
            <div className="flex items-center space-x-6">
              <button className="text-gray-400 hover:text-white transition-colors">
                <Menu className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="w-4 h-3 bg-red-500 rounded-sm"></div>
                <span className="text-gray-400 text-sm">Online chat</span>
              </div>
            </div>

            {/* Center Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">EO</span>
              </div>
              <span className="text-white text-lg font-bold">ExpertOption</span>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleNavigation}
                className="text-gray-400 hover:text-white transition-colors text-sm px-3 py-1"
              >
                Login
              </button>
              <button 
                onClick={handleNavigation}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Register
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section - Exact Layout */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
              <span className="text-blue-400">Investing</span> Is<br />
              Even Better Now
            </h1>
            
            <p className="text-gray-400 text-base leading-relaxed max-w-md">
              Providing you with the opportunity to invest in more than 100 assets for continuous income
            </p>

            {/* Social Icons Row */}
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
              <span className="text-gray-400 text-sm">+100 assets</span>
            </div>

            {/* CTA Button */}
            <button 
              onClick={handleNavigation}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 flex items-center space-x-2"
            >
              <span>Try free demo</span>
              <Play className="w-4 h-4 fill-current" />
            </button>
          </div>

          {/* Right Side - Enhanced Phone Mockup */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative">
              {/* Main Phone */}
              <div className="w-64 h-[480px] relative">
                <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 rounded-[2.5rem] shadow-2xl border-4 border-gray-700">
                  {/* Phone Content */}
                  <div className="p-4 h-full flex flex-col">
                    {/* Status Bar */}
                    <div className="flex justify-between items-center mb-4 text-white text-xs">
                      <span>9:41</span>
                      <div className="flex space-x-1">
                        <div className="w-4 h-1 bg-white rounded-full"></div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                      </div>
                    </div>

                    {/* Trading Categories */}
                    <div className="flex-1 space-y-2">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-3 text-center relative overflow-hidden">
                        <TrendingUp className="w-6 h-6 text-white mx-auto mb-1" />
                        <span className="text-white font-semibold text-sm">Stocks</span>
                        <div className="absolute top-0 right-0 w-8 h-8 bg-white/20 rounded-full -mr-4 -mt-4"></div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl p-3 text-center relative overflow-hidden">
                        <Globe className="w-6 h-6 text-white mx-auto mb-1" />
                        <span className="text-white font-semibold text-sm">Indices</span>
                        <div className="absolute top-0 right-0 w-8 h-8 bg-white/20 rounded-full -mr-4 -mt-4"></div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-3 text-center relative overflow-hidden">
                        <Award className="w-6 h-6 text-white mx-auto mb-1" />
                        <span className="text-white font-semibold text-sm">Metals</span>
                        <div className="absolute top-0 right-0 w-8 h-8 bg-white/20 rounded-full -mr-4 -mt-4"></div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-3 text-center relative overflow-hidden">
                        <Users className="w-6 h-6 text-white mx-auto mb-1" />
                        <span className="text-white font-semibold text-sm">Commodities</span>
                        <div className="absolute top-0 right-0 w-8 h-8 bg-white/20 rounded-full -mr-4 -mt-4"></div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-blue-700 to-blue-800 rounded-xl p-3 text-center relative overflow-hidden">
                        <Shield className="w-6 h-6 text-white mx-auto mb-1" />
                        <span className="text-white font-semibold text-sm">ETF</span>
                        <div className="absolute top-0 right-0 w-8 h-8 bg-white/20 rounded-full -mr-4 -mt-4"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-3 -right-3 bg-red-500 rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                  <span className="text-white text-xs font-bold">7</span>
                </div>
                
                <div className="absolute -bottom-3 -left-3 bg-blue-600 rounded-lg p-2 shadow-lg text-white text-xs font-medium">
                  Asset List
                </div>
              </div>

              {/* Side Phone Preview */}
              <div className="absolute top-8 -right-12 w-48 h-80 bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl border-2 border-gray-700 transform rotate-12 shadow-xl">
                <div className="p-3 h-full">
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-600 rounded"></div>
                    <div className="h-2 bg-gray-600 rounded w-3/4"></div>
                    <div className="space-y-1 mt-4">
                      {Array.from({length: 8}, (_, i) => (
                        <div key={i} className="h-1 bg-gray-600 rounded" style={{width: `${60 + Math.random() * 40}%`}}></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For All Devices Section */}
      <section className="bg-slate-800/50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-12">For All Devices</h2>
          
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
                <h3 className="text-white font-semibold mb-1">{platform.name}</h3>
                <p className="text-gray-400 text-sm">{platform.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-12">How It Works</h2>
          
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
                <h3 className="text-white font-semibold text-lg mb-3">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted Section - More compact */}
      <section className="bg-slate-800/50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Trusted</h2>
            <p className="text-gray-400 max-w-xl mx-auto mb-6 text-sm">
              ExpertOption is trusted by traders from around the world and are trusted by more than 70,000,000 clients.
            </p>
            
            <button 
              onClick={handleNavigation}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium mb-6 transition-colors"
            >
              Start trading
            </button>

            <div className="bg-slate-700/30 rounded-lg p-4 max-w-sm mx-auto">
              <div className="flex items-center space-x-3">
                <Award className="w-8 h-8 text-blue-400 flex-shrink-0" />
                <div className="text-left">
                  <div className="text-white font-medium text-sm">Best Trading Platform</div>
                  <div className="text-gray-400 text-xs">Award winner at China Foreign Expo</div>
                  <div className="text-gray-400 text-xs">ShowChina 6/7 May 2017</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Trading Platform */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-8">
              <Globe className="w-10 h-10 text-blue-400" />
              <h2 className="text-3xl font-bold text-white">Global Trading Platform</h2>
            </div>
            
            {/* Stats Grid */}
            <div className="grid md:grid-cols-4 gap-6 mb-12">
              {[
                { value: '$1B', label: 'Minimum Deposit' },
                { value: '$1', label: 'Minimum Trading Amount' },
                { value: '0%', label: 'Commissions' },
                { value: '0%', label: 'Fees' }
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">{stat.value}</div>
                  <div className="text-white font-medium">{stat.label}</div>
                </div>
              ))}
            </div>

            <p className="text-gray-400 mb-8">People from 48 countries trade at ExpertOption</p>

            {/* World Map */}
            <div className="relative h-64 bg-slate-800/30 rounded-2xl flex items-center justify-center overflow-hidden mb-8">
              <div className="absolute inset-0 opacity-20">
                <svg viewBox="0 0 800 400" className="w-full h-full">
                  {Array.from({ length: 30 }, (_, i) => 
                    Array.from({ length: 60 }, (_, j) => (
                      <circle
                        key={`${i}-${j}`}
                        cx={j * 13 + 20}
                        cy={i * 13 + 20}
                        r="1.5"
                        fill="#3b82f6"
                        opacity={Math.random() * 0.8 + 0.2}
                      />
                    ))
                  )}
                </svg>
              </div>
              <Globe className="w-16 h-16 text-blue-400/40" />
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
            {/* Company Info */}
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

            {/* Navigation Columns */}
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

            {/* Payment Methods */}
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

          {/* Footer Bottom */}
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