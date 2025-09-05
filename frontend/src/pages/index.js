// pages/index.js - Simple fix
import { useAuth } from '../contexts/AuthContext';
import ExpertOptionClone from '../components/ExpertOptionClone';
import { useEffect, useState } from 'react';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [showTrading, setShowTrading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading ExpertOption...</div>
      </div>
    );
  }

  if (showTrading) {
    return <ExpertOptionClone />;
  }

  // Simple landing page for now
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8">
          <span className="text-white font-bold text-xl">EO</span>
        </div>
        <h1 className="text-5xl font-bold text-white mb-4">
          <span className="text-blue-400">Investing</span> Is Even Better Now
        </h1>
        <p className="text-gray-300 text-lg mb-8 max-w-md mx-auto">
          Providing you with the opportunity to invest in more than 100 assets for continuous income
        </p>
        <button 
          onClick={() => setShowTrading(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105"
        >
          Start Trading
        </button>
      </div>
    </div>
  );
}