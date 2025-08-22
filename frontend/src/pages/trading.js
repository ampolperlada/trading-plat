import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function TradingPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to main page since trading is now the homepage
    // Preserve any query parameters if they exist
    const { query } = router;
    const queryString = Object.keys(query).length > 0 
      ? '?' + new URLSearchParams(query).toString() 
      : '';
    
    router.replace('/' + queryString);
  }, [router]);
  
  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <div className="text-lg font-semibold mb-2">Redirecting to Trading Platform...</div>
        <div className="text-gray-400 text-sm">
          Trading interface is now available on the homepage
        </div>
      </div>
    </div>
  );
}