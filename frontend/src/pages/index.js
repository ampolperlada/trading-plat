// src/pages/index.js - Expert Option Landing Page
import { useEffect, useState } from 'react';
import ExpertOptionClone from '../components/ExpertOptionClone';
import ExpertOptionLandingPage from '../components/ExpertOptionLandingPage';

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

  return <ExpertOptionLandingPage onStartTrading={() => setShowTrading(true)} />;
}