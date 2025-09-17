import React, { useContext, useState } from 'react';
import { TradingContext } from '../../contexts/TradingContext';
import Button from '../ui/Button';

const TradeForm = ({ asset, currentPrice }) => {
  const { executeTrade, balance } = useContext(TradingContext);
  const [amount, setAmount] = useState(10);
  const [expiry, setExpiry] = useState(60); // seconds

  const handleTrade = (type) => {
    if (amount > balance) return alert("Insufficient balance!");

    const outcome = Math.random() > 0.5 ? "win" : "loss";
    executeTrade(asset, type, amount, currentPrice, outcome);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg max-w-md mx-auto mt-6">
      <h3 className="text-white text-lg font-bold mb-4">Place Trade</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-gray-300 text-sm mb-1">Amount ($)</label>
          <input
            type="number"
            min="1"
            max={balance}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm mb-1">Expiry (sec)</label>
          <select
            value={expiry}
            onChange={(e) => setExpiry(Number(e.target.value))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none"
          >
            <option value={30}>30 seconds</option>
            <option value={60}>60 seconds</option>
            <option value={120}>2 minutes</option>
            <option value={300}>5 minutes</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <Button onClick={() => handleTrade("CALL")} className="bg-green-600 hover:bg-green-700">
            CALL
          </Button>
          <Button onClick={() => handleTrade("PUT")} className="bg-red-600 hover:red-700">
            PUT
          </Button>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-4">
        Current Price: <strong>${currentPrice?.toFixed(5)}</strong>
      </p>
    </div>
  );
};

export default TradeForm;