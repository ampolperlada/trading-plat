
// utils/helpers.js
const formatPrice = (price, decimals = 5) => {
  return Number(price).toFixed(decimals);
};

const formatPercentage = (percent) => {
  return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
};

const calculatePayout = (amount, payoutRate) => {
  return amount * payoutRate;
};

const generateTradeId = () => {
  return `T${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
};

const isMarketOpen = () => {
  const now = new Date();
  const day = now.getUTCDay(); // 0 = Sunday, 6 = Saturday
  const hour = now.getUTCHours();
  
  // Market closed on weekends (simplified)
  if (day === 0 || day === 6) return false;
  
  // Market open 24/5 for forex, crypto always open
  return true;
};

const validateTradeAmount = (amount, minAmount = 1, maxAmount = 5000) => {
  return amount >= minAmount && amount <= maxAmount;
};

const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

const getTradeExpiration = (duration) => {
  return new Date(Date.now() + (duration * 1000));
};

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

module.exports = {
  formatPrice,
  formatPercentage,
  calculatePayout,
  generateTradeId,
  isMarketOpen,
  validateTradeAmount,
  formatCurrency,
  getTradeExpiration,
  sleep
};
