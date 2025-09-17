// src/utils/marketData.js

const COINGECKO_API = 'https://api.coingecko.com/api/v3/simple/price';

// Map our internal symbols to CoinGecko IDs
const COIN_GECKO_MAP = {
  BTCUSD: 'bitcoin',
  ETHUSD: 'ethereum',
  // Add more if needed
};

export const fetchCryptoPrices = async () => {
  try {
    const ids = Object.values(COIN_GECKO_MAP).join(',');
    const vsCurrencies = 'usd';

    const response = await fetch(
      `${COINGECKO_API}?ids=${ids}&vs_currencies=${vsCurrencies}`
    );

    if (!response.ok) throw new Error('Failed to fetch from CoinGecko');

    const data = await response.json();

    const prices = {};
    for (const [ourSymbol, cgId] of Object.entries(COIN_GECKO_MAP)) {
      if (data[cgId]?.usd) {
        prices[ourSymbol] = {
          price: data[cgId].usd,
          change: Math.random() * 10 - 5, // Placeholder for % change
          volume: Math.random() * 1000000,
          timestamp: Date.now(),
        };
      }
    }

    return prices;
  } catch (error) {
    console.error('Error fetching crypto prices:', error);
    return {};
  }
};