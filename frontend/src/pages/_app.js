import { useEffect, useState } from 'react';
import '../styles/globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import { WebSocketProvider } from '../contexts/WebSocketContext';
import { TradingProvider } from '../contexts/TradingContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <TradingProvider>
          <div className="min-h-screen bg-gray-900">
            <Component {...pageProps} />
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="dark"
            />
          </div>
        </TradingProvider>
      </WebSocketProvider>
    </AuthProvider>
  );
}

export default MyApp;