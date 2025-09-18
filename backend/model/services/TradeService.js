const Trade = require('../models/Trade');
const marketDataService = require('./MarketDataService');

class TradeService {
  async createTrade(tradeData) {
    const { userId, asset, tradeType, amount, duration } = tradeData;
    
    // Get current price
    const priceData = await marketDataService.getPrice(asset);
    const openPrice = priceData.price;
    
    const trade = new Trade({
      userId,
      asset,
      tradeType,
      amount,
      duration,
      openPrice,
      openTime: new Date()
    });
    
    await trade.save();
    return trade;
  }
  
  async closeTrade(tradeId) {
    const trade = await Trade.findById(tradeId);
    if (!trade || trade.status === 'closed') {
      throw new Error('Trade not found or already closed');
    }
    
    // Get current price
    const priceData = await marketDataService.getPrice(trade.asset);
    const closePrice = priceData.price;
    
    // Calculate result
    let result = 'loss';
    let profit = -trade.amount;
    
    if (trade.tradeType === 'CALL' && closePrice > trade.openPrice) {
      result = 'win';
      profit = trade.amount * 0.8; // 80% payout
    } else if (trade.tradeType === 'PUT' && closePrice < trade.openPrice) {
      result = 'win';
      profit = trade.amount * 0.8;
    }
    
    trade.closePrice = closePrice;
    trade.closeTime = new Date();
    trade.result = result;
    trade.profit = profit;
    trade.status = 'closed';
    
    await trade.save();
    return trade;
  }
  
  async getUserTrades(userId) {
    return await Trade.find({ userId }).sort({ openTime: -1 }).limit(50);
  }
  
  async getActiveTrades(userId) {
    return await Trade.find({ userId, status: 'open' });
  }
}

module.exports = new TradeService();