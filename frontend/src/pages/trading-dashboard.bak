import React, { useContext } from 'react';
import { TradingContext } from '../../contexts/TradingContext';
import PriceChart from './PriceChart';
import AssetList from './AssetList';
import TradePanel from './TradePanel';

const TradingDashboard = () => {
  const { balance } = useContext(TradingContext);
  const selectedAsset = {
    name: 'EUR/USD',
    price: 1.08616,
    change: 0.05,
    symbol: 'EURUSD',
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded text-white flex items-center justify-center font-bold">EO</div>
          <span className="text-xl font-bold">ExpertOption</span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="bg-green-600 text-white px-3 py-1 rounded text-sm font-medium">${balance.toFixed(2)}</div>
          <button className="bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded text-sm">Deposit</button>
          <button className="text-gray-300 hover:text-white">History (0)</button>
          <div className="flex items-center space-x-2">
            <span className="text-gray-300">demo</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Assets */}
        <aside className="w-64 bg-gray-800 p-4 border-r border-gray-700">
          <h2 className="text-sm font-semibold mb-3 text-gray-300">Trading Assets</h2>
          <AssetList />
        </aside>

        {/* Main Content - Chart */}
        <main className="flex-1 flex flex-col">
          <div className="p-4 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">{selectedAsset.name}</h1>
              <div className="text-sm text-gray-400">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
            <div className="flex items-center mt-1">
              <span className="text-2xl font-bold">{selectedAsset.price}</span>
              <span className={`ml-2 text-sm ${selectedAsset.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {selectedAsset.change >= 0 ? '↑' : '↓'} {selectedAsset.change}%
              </span>
            </div>
          </div>

          <div className="flex-1 p-4">
            <PriceChart data={generateChartData()} />
          </div>
        </main>

        {/* Right Panel - Trade Controls */}
        <aside className="w-80 bg-gray-800 p-4 border-l border-gray-700">
          <div className="space-y-6">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Investment Amount</label>
              <div className="flex items-center space-x-2">
                <button className="w-8 h-8 bg-gray-700 rounded text-white">−</button>
                <input
                  type="number"
                  value="10"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none"
                />
                <button className="w-8 h-8 bg-gray-700 rounded text-white">+</button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Potential payout: $18.00 (80% profit)
              </p>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Expiration Time</label>
              <div className="grid grid-cols-3 gap-2">
                {[15, 30, 60].map((sec) => (
                  <button
                    key={sec}
                    className="py-1 px-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                  >
                    {sec}s
                  </button>
                ))}
                <button className="py-1 px-2 bg-blue-600 rounded text-sm">1m</button>
                <button className="py-1 px-2 bg-gray-700 hover:bg-gray-600 rounded text-sm">5m</button>
                <button className="py-1 px-2 bg-gray-700 hover:bg-gray-600 rounded text-sm">30m</button>
              </div>
            </div>

            <div className="space-y-2">
              <button className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded">
                ↗️ CALL (Higher)
              </button>
              <button className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded">
                ↘️ PUT (Lower)
              </button>
            </div>

            <div className="bg-gray-700 p-3 rounded text-sm">
              <p>Active Trades: 0</p>
              <p>Total Invested: $0.00</p>
              <p>Completed Trades: 0</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

// Mock Data Generator
function generateChartData() {
  const data = [];
  const basePrice = 1.08616;
  let price = basePrice;

  for (let i = 0; i < 20; i++) {
    const change = (Math.random() - 0.5) * 0.0005;
    price += change;
    data.push({
      time: `${i * 3 + 9}:00 AM`,
      price: parseFloat(price.toFixed(5)),
    });
  }
  return data;
}

export default TradingDashboard;