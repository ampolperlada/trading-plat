import React, { useState, useEffect } from 'react';
import PriceChart from './PriceChart';

const Dashboard = ({ socket }) => {
  const [selectedAsset, setSelectedAsset] = useState('BTC/USD');
  const [marketData, setMarketData] = useState({});

  useEffect(() => {
    if (socket) {
      socket.on('market_data_update', (data) => {
        setMarketData(data);
      });
    }

    return () => {
      if (socket) {
        socket.off('market_data_update');
      }
    };
  }, [socket]);

  return (
    <div className="p-4">
      <div className="mb-4">
        <select 
          value={selectedAsset} 
          onChange={(e) => setSelectedAsset(e.target.value)}
          className="p-2 border rounded"
        >
          {Object.keys(marketData).map(symbol => (
            <option key={symbol} value={symbol}>{symbol}</option>
          ))}
        </select>
      </div>
      
      <div className="mb-6">
        <PriceChart symbol={selectedAsset} socket={socket} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(marketData).map(([symbol, data]) => (
          <div 
            key={symbol} 
            className={`p-4 border rounded cursor-pointer ${
              selectedAsset === symbol ? 'bg-blue-100 border-blue-500' : 'bg-white'
            }`}
            onClick={() => setSelectedAsset(symbol)}
          >
            <div className="font-bold">{symbol}</div>
            <div className="text-lg">${data.price?.toFixed(2)}</div>
            <div className={`text-sm ${data.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.change?.toFixed(2)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;