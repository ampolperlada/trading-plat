import { WebSocketProvider } from '../contexts/WebSocketContext';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <WebSocketProvider>
      <Component {...pageProps} />
    </WebSocketProvider>
  );
}

export default MyApp;