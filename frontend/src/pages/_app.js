// frontend/src/pages/_app.js
import { AuthProvider } from '../contexts/AuthContext';
import { MarketDataProvider } from '../contexts/MarketDataContext';
import { WebSocketProvider } from '../contexts/WebSocketContext';
import { TradingProvider } from '../contexts/TradingContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Head from 'next/head';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>
      <AuthProvider>
        <WebSocketProvider>
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
              />
            </TradingProvider>
          </MarketDataProvider>
        </WebSocketProvider>
      </AuthProvider>
    </>
  );
}