// frontend/src/pages/_app.js - Updated with Real Data Providers
import '../styles/globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import { MarketDataProvider } from '../contexts/MarketDataContext';
import { TradingProvider } from '../contexts/TradingContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <MarketDataProvider>
        <TradingProvider>
          <Component {...pageProps} />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
            style={{
              fontSize: '14px'
            }}
          />
        </TradingProvider>
      </MarketDataProvider>
    </AuthProvider>
  );
}