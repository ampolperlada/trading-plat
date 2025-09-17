import React from 'react';

const AssetList = () => {
  const assets = [
    { name: 'EUR/USD', price: 1.08616, change: 0.05 },
    { name: 'GBP/USD', price: 1.26297, change: -0.03 },
    { name: 'USD/JPY', price: 149.163, change: -0.05 },
    { name: 'BTC/USD', price: 43194.91, change: -0.12 },
    { name: 'ETH/USD', price: 2633.85, change: -0.03 },
    { name: 'AAPL', price: 189.28059, change: -0.10 },
    { name: 'TSLA', price: 248.9954, change: 0.04 },
    { name: 'GOOGL', price: 138.23922, change: 0.02 },
    { name: 'GOLD', price: 2087.04566, change: -0.02 },
    { name: 'OIL', price: 85.26609, change: 0.03 },
  ];

  return (
    <ul className="space-y-2">
      {assets.map((asset, index) => (
        <li
          key={index}
          className={`p-3 rounded-lg cursor-pointer transition ${
            index === 0 ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold">{asset.name}</div>
              <div className="text-xs opacity-80">{asset.name.split('/')[0]} / {asset.name.split('/')[1]}</div>
            </div>
            <div className="text-right">
              <div className="font-mono">{asset.price}</div>
              <div className={`text-xs ${asset.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {asset.change >= 0 ? '↑' : '↓'} {asset.change}%
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default AssetList;