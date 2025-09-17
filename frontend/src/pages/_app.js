// pages/_app.js - Complete Context Provider Setup
import { AuthProvider } from '../contexts/AuthContext';
import { MarketDataProvider } from '../contexts/MarketDataContext';
import { TradingProvider } from '../contexts/TradingContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <MarketDataProvider>
        <TradingProvider>
          <Component {...pageProps} />
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
            style={{ zIndex: 9999 }}
          />
        </TradingProvider>
      </MarketDataProvider>
    </AuthProvider>
  );
}