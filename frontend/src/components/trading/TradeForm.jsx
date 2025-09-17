import React, { useState } from 'react';
import axios from 'axios';

const TradeForm = ({ asset }) => {
  const [amount, setAmount] = useState(10);
  const [duration, setDuration] = useState(1);
  const [tradeType, setTradeType] = useState('CALL');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await axios.post('/api/trades/create', {
        asset: asset.symbol,
        tradeType,
        amount,
        duration
      });

      // Show success toast
      alert('Trade created successfully!');
      // Reset form
      setAmount(10);
      setDuration(1);
      setTradeType('CALL');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create trade');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h3 className="text-xl font-bold mb-4">Trade {asset.name}</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Investment Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          min="1"
          className="w-full p-2 border rounded"
        />
        <div className="flex space-x-2 mt-2">
          {[10, 25, 50, 100, 250, 500].map(val => (
            <button
              key={val}
              onClick={() => setAmount(val)}
              className={`px-3 py-1 rounded ${
                amount === val ? 'bg-blue-600' : 'bg-gray-700'
              }`}
            >
              ${val}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Expiry Time</label>
        <div className="flex space-x-2">
          {[1, 5, 15, 30, 60].map(min => (
            <button
              key={min}
              onClick={() => setDuration(min)}
              className={`px-3 py-1 rounded ${
                duration === min ? 'bg-blue-600' : 'bg-gray-700'
              }`}
            >
              {min}m
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Prediction</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setTradeType('PUT')}
            className={`p-4 rounded-lg text-white ${
              tradeType === 'PUT' ? 'bg-red-600' : 'bg-red-800'
            }`}
          >
            <div className="text-2xl">↓</div>
            <div className="text-sm">PUT</div>
            <div className="text-xs">Lower</div>
          </button>
          <button
            onClick={() => setTradeType('CALL')}
            className={`p-4 rounded-lg text-white ${
              tradeType === 'CALL' ? 'bg-green-600' : 'bg-green-800'
            }`}
          >
            <div className="text-2xl">↑</div>
            <div className="text-sm">CALL</div>
            <div className="text-xs">Higher</div>
          </button>
        </div>
      </div>

      <div className="bg-gray-700 p-3 rounded mb-4">
        <div className="text-sm">Current Price</div>
        <div className="text-xl font-bold">${asset.currentPrice.toFixed(2)}</div>
      </div>

      <div className="bg-gray-700 p-3 rounded mb-4">
        <div className="text-sm">Payout</div>
        <div className="text-green-400 font-bold">+{amount * 0.8}$</div>
        <div className="text-sm">Investment: ${amount}</div>
      </div>

      {error && <div className="text-red-400 text-sm mb-4">{error}</div>}

      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 rounded-lg font-semibold transition"
      >
        {isSubmitting ? 'Processing...' : 'Place Trade'}
      </button>
    </div>
  );
};

export default TradeForm;