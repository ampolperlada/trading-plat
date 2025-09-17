class AssetMapper {
  constructor() {
    // Map platform symbols to CoinGecko IDs
    this.symbolMap = {
      'BTC/USD': 'bitcoin',
      'ETH/USD': 'ethereum',
      'ADA/USD': 'cardano',
      'DOGE/USD': 'dogecoin',
      'LINK/USD': 'chainlink',
      'DOT/USD': 'polkadot',
      'LTC/USD': 'litecoin',
      'XLM/USD': 'stellar',
      'EUR/USD': 'tether', // or use forex API for real pairs
      'GBP/USD': 'tether'
    };

    // Reverse mapping for easy lookup
    this.reverseMap = {};
    Object.keys(this.symbolMap).forEach(key => {
      this.reverseMap[this.symbolMap[key]] = key;
    });
  }

  getCoinGeckoId(symbol) {
    return this.symbolMap[symbol] || null;
  }

  getPlatformSymbol(coinId) {
    return this.reverseMap[coinId] || null;
  }

  getAllCoinGeckoIds() {
    return Object.values(this.symbolMap);
  }

  getAllSymbols() {
    return Object.keys(this.symbolMap);
  }
}

module.exports = new AssetMapper();