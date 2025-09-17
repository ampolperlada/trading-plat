import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const PriceChart = ({ symbol, socket }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: symbol,
        data: [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1,
      },
    ],
  });

  const [priceHistory, setPriceHistory] = useState([]);

  useEffect(() => {
    if (socket) {
      socket.on('price_update', (data) => {
        if (data.symbol === symbol) {
          const newPrice = data.price;
          const newTimestamp = new Date(data.timestamp).toLocaleTimeString();
          
          setPriceHistory(prev => {
            const updated = [...prev, { price: newPrice, time: newTimestamp }];
            // Keep only last 20 points
            return updated.slice(-20);
          });
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('price_update');
      }
    };
  }, [socket, symbol]);

  useEffect(() => {
    if (priceHistory.length > 0) {
      setChartData({
        labels: priceHistory.map(item => item.time),
        datasets: [
          {
            label: symbol,
            data: priceHistory.map(item => item.price),
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            tension: 0.1,
          },
        ],
      });
    }
  }, [priceHistory, symbol]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `${symbol} Price Chart`,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  return (
    <div className="w-full h-64">
      <Line options={options} data={chartData} />
    </div>
  );
};

export default PriceChart;