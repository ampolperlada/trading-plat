// pages/index.js - ExpertOption Landing Page (Exact UI Match)
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  Play, 
  Download,
  TrendingUp,
  Shield,
  Globe,
  Users,
  Award,
  ChevronDown
} from 'lucide-react';

export default function ExpertOptionLanding() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Redirect to trading if already logged in
    if (isAuthenticated) {
      router.push('/trading');
    }
  }, [isAuthenticated, router]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading ExpertOption...</div>
      </div>
    );
  }

  // If authenticated, show loading while redirecting
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Redirecting to trading platform...</div>
      </div>
    );
  }

  const handleStartTrading = () => {
    router.push('/trading');
  };

  const handleTryDemo = () => {
    router.push('/trading');
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

              {/* Language/Region Selector */}
              <div className="hidden md:flex items-center space-x-2 text-white">
                <span className="w-6 h-4 bg-red-500 rounded-sm"></span>
                <span className="text-sm">Online chat</span>
              </div>
            </div>

            {/* Logo */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">EO</span>
                </div>
                <span className="text-white text-xl font-bold">ExpertOption</span>
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleStartTrading}
                className="text-white hover:text-blue-400 transition-colors text-sm"
              >
                Login
              </button>
              <button 
                onClick={handleStartTrading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                Register
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                <span className="text-blue-400">Investing</span> Is<br />
                Even Better Now
              </h1>
            </div>
            
            <p className="text-gray-300 text-lg leading-relaxed max-w-md">
              Providing you with the opportunity to invest in more than 100 assets for continuous income
            </p>

            {/* Social Proof */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-white text-xs font-bold">f</span>
                  </div>
                  <div className="w-8 h-8 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-white text-xs font-bold">yt</span>
                  </div>
                  <div className="w-8 h-8 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-white text-xs font-bold">in</span>
                  </div>
                  <div className="w-8 h-8 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-white text-xs font-bold">G</span>
                  </div>
                </div>
                <span className="text-gray-300 text-sm">+100 assets</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button 
                onClick={handleTryDemo}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105 flex items-center space-x-2"
              >
                <span>Try free demo</span>
                <Play className="w-4 h-4 fill-current" />
              </button>
            </div>
          </div>

          {/* Mobile App Mockup */}
          <div className="relative">
            <div className="relative z-10">
              <div className="w-80 h-96 mx-auto">
                <div className="relative">
                  {/* Phone Frame */}
                  <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 rounded-3xl shadow-2xl">
                    <div className="p-6 h-full flex flex-col">
                      {/* Status Bar */}
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-white text-sm">9:41</span>
                        <div className="flex space-x-1">
                          <div className="w-1 h-1 bg-white rounded-full"></div>
                          <div className="w-1 h-1 bg-white rounded-full"></div>
                          <div className="w-1 h-1 bg-white rounded-full"></div>
                        </div>
                      </div>

                      {/* App Content */}
                      <div className="flex-1 space-y-4">
                        <div className="bg-blue-600 rounded-xl p-4 text-center">
                          <TrendingUp className="w-8 h-8 text-white mx-auto mb-2" />
                          <span className="text-white font-semibold">Stocks</span>
                        </div>
                        
                        <div className="bg-blue-500 rounded-xl p-4 text-center">
                          <Globe className="w-8 h-8 text-white mx-auto mb-2" />
                          <span className="text-white font-semibold">Indices</span>
                        </div>
                        
                        <div className="bg-purple-600 rounded-xl p-4 text-center">
                          <Award className="w-8 h-8 text-white mx-auto mb-2" />
                          <span className="text-white font-semibold">Metals</span>
                        </div>
                        
                        <div className="bg-blue-700 rounded-xl p-4 text-center">
                          <Users className="w-8 h-8 text-white mx-auto mb-2" />
                          <span className="text-white font-semibold">Commodities</span>
                        </div>
                        
                        <div className="bg-blue-800 rounded-xl p-4 text-center">
                          <Shield className="w-8 h-8 text-white mx-auto mb-2" />
                          <span className="text-white font-semibold">ETF</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating Elements */}
                  <div className="absolute -top-4 -right-4 bg-red-500 rounded-full w-8 h-8 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">7</span>
                  </div>
                  
                  <div className="absolute -bottom-4 -left-4 bg-blue-600 rounded-lg p-2">
                    <span className="text-white text-xs font-bold">Asset List</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For All Devices Section */}
      <section className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">For All Devices</h2>
        
        <div className="grid md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Download className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">Android</h3>
            <p className="text-gray-400 text-sm">4.4 and higher</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Download className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">iOS</h3>
            <p className="text-gray-400 text-sm">9.0 and higher</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Download className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">Windows</h3>
            <p className="text-gray-400 text-sm">7 and lower version</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Download className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">MacOS</h3>
            <p className="text-gray-400 text-sm">Macintosh and Safari</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">How It Works</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Download className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-4">Deposit</h3>
            <p className="text-gray-400 leading-relaxed">
              Open a real account and add funds. We work with more than 20 payment systems.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-4">Trade</h3>
            <p className="text-gray-400 leading-relaxed">
              Trade any of 100 assets and stocks. Use technical analysis and trade the news.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-4">Withdraw</h3>
            <p className="text-gray-400 leading-relaxed">
              Get funds easily to your bank card or e-wallet. We take no commission.
            </p>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Trusted</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            ExpertOption is trusted by traders from around the world and are trusted by more than 70,000,000 clients.
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold mt-6 transition-colors">
            Start trading
          </button>
        </div>

        <div className="flex justify-center items-center space-x-8 text-center">
          <div>
            <Award className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <span className="text-white font-semibold">Best Trading Platform</span>
            <p className="text-gray-400 text-sm">Award winner at China Foreign Expo ShowChina 6/7 May 2017</p>
          </div>
        </div>
      </section>

      {/* Global Trading Platform */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <Globe className="w-16 h-16 text-blue-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-8">Global Trading Platform</h2>
          
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">$1B</div>
              <div className="text-white font-semibold">Minimum Deposit</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">$1</div>
              <div className="text-white font-semibold">Minimum Trading Amount</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">0%</div>
              <div className="text-white font-semibold">Commissions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">0%</div>
              <div className="text-white font-semibold">Fees</div>
            </div>
          </div>

          <p className="text-gray-400 mb-8">People from 48 countries trade at ExpertOption</p>

          {/* World Map Placeholder */}
          <div className="relative h-96 bg-slate-800/50 rounded-2xl flex items-center justify-center">
            <Globe className="w-24 h-24 text-blue-400/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent rounded-2xl"></div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-16 text-center">
        <h2 className="text-4xl font-bold text-white mb-6">Ready to Start Trading?</h2>
        <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
          Join millions of traders worldwide and experience the power of professional trading platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={handleTryDemo}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105"
          >
            Try Free Demo
          </button>
          <button 
            onClick={handleStartTrading}
            className="border-2 border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white px-8 py-4 rounded-lg font-semibold transition-all"
          >
            Start Real Trading
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800/50 border-t border-slate-700">
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-5 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">EO</span>
                </div>
                <span className="text-white font-bold">ExpertOption</span>
              </div>
              <p className="text-gray-400 text-sm">
                The Company does not provide services to citizens and/or residents of Australia, Austria, Belarus, Belgium, Bulgaria, Canada, Croatia, Cyprus, Czech Republic, Denmark, Estonia, Finland, France, Germany, Greece, Hungary, Iceland, Iran, Ireland, Israel, Italy, Latvia, Liechtenstein, Lithuania, Luxembourg, Malta, Myanmar, Netherlands, North Korea, Norway, Poland, Portugal, Romania, Russia, Singapore, Slovakia, Slovenia, Spain, Sudan, Sweden, Switzerland, UK, Ukraine, USA, Yemen.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Home</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Free demo</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Login</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Registration</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Trading</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Account types</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Social trading</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About company</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Payment methods</h4>
              <div className="flex flex-wrap gap-2">
                <div className="bg-slate-700 rounded px-3 py-1">
                  <span className="text-white text-xs">VISA</span>
                </div>
                <div className="bg-slate-700 rounded px-3 py-1">
                  <span className="text-white text-xs">MC</span>
                </div>
                <div className="bg-slate-700 rounded px-3 py-1">
                  <span className="text-white text-xs">PayPal</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-8 mt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2014 - 2024 ExpertOption. ExpertOption. All rights reserved.
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