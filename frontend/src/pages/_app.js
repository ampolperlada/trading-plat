// frontend/src/pages/_app.js
import '../styles/globals.css';
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
        {/* CDN Tailwind for quick fix */}
        <script src="https://cdn.tailwindcss.com"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = {
                theme: {
                  extend: {
                    colors: {
                      primary: {
                        50: '#eff6ff',
                        500: '#3b82f6',
                        600: '#2563eb',
                        700: '#1d4ed8',
                        900: '#1e3a8a'
                      }
                    }
                  }
                }
              }
            `,
          }}
        />
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
                style={{
                  fontSize: '14px'
                }}
              />
            </TradingProvider>
          </MarketDataProvider>
        </WebSocketProvider>
      </AuthProvider>
    </>
  );
}