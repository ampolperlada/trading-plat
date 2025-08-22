import { useEffect } from 'react';
import { useRouter } from 'next/router';
import ExpertOptionClone from '../components/ExpertOptionClone';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Optional: Clear any existing auth data on fresh load
    // This ensures clean state when landing on the main page
    const urlParams = new URLSearchParams(window.location.search);
    const clearAuth = urlParams.get('clear');
    
    if (clearAuth === 'true') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Remove the query param from URL without reload
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  return (
    <div>
      {/* Expert Option Clone - Landing Page is Trading Interface */}
      <ExpertOptionClone />
    </div>
  );
}