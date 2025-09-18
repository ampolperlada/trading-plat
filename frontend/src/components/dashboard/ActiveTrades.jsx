import React from 'react';

const ActiveTrades = ({ trades }) => {
  if (trades.length === 0) {
    return <div className="text-center text-gray-400">No active trades</div>;
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h3 className="font-bold mb-4">Active Trades</h3>
      <ul>
        {trades.map(trade => (
          <li key={trade._id} className="border-b pb-2 mb-2">
            <div>{trade.asset} | {trade.tradeType}</div>
            <div>${trade.amount} | {trade.duration}m</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActiveTrades;