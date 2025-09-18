class TradingEngine {
  constructor(io, redisService) {
    this.io = io;
    this.redis = redisService;
    this.activeTrades = new Map();
  }

  startTradeTimer(trade) {
    const durationMs = trade.duration * 60 * 1000;
    const timeoutId = setTimeout(async () => {
      // eslint-disable-next-line no-undef
      const closedTrade = await TradeService.closeTrade(trade._id);
      this.io.to(`user:${trade.userId}`).emit('trade_result', closedTrade);
    }, durationMs);

    this.activeTrades.set(trade._id, { trade, timeoutId });
  }

  cleanup() {
    for (const [, { timeoutId }] of this.activeTrades.entries()) {
      clearTimeout(timeoutId);
    }
    this.activeTrades.clear();
  }
}

module.exports = new TradingEngine();