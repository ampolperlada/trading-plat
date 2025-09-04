// pages/index.js - Main Application Entry Point
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/LoginForm';
import ExpertOptionTradingDashboard from '../components/ExpertOptionTradingDashboard';
import { useEffect, useState } from 'react';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-xl">EO</span>
          </div>
          <div className="text-white text-lg">Loading ExpertOption...</div>
          <div className="text-gray-400 text-sm mt-2">Connecting to markets</div>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <ExpertOptionTradingDashboard /> : <LoginForm />;
}