import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const PriceChart = ({ data }) => {
  return (
    <div className="w-full h-64 md:h-80 bg-gray-900 p-4 rounded-lg shadow">
      <h3 className="text-white text-sm font-semibold mb-2">Price Movement (Last 24h)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
          <YAxis stroke="#6b7280" fontSize={12} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }}
            itemStyle={{ color: '#fff' }}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;