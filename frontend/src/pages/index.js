// src/pages/index.js - Expert Option Landing Page
import { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import components with no SSR
const ExpertOptionClone = dynamic(() => import('../components/ExpertOptionClone'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-slate-900 flex items-center justify-center">
    <div className="text-white">Loading...</div>
  </div>
});

const ExpertOptionLandingPage = dynamic(() => import('../components/ExpertOptionLandingPage'), {
  ssr: false,
});

export default function Home() {
  const [showTrading, setShowTrading] = useState(false);

  if (showTrading) {
    return <ExpertOptionClone />;
  }

  return <ExpertOptionLandingPage onStartTrading={() => setShowTrading(true)} />;
}