const API_BASE_URL = 'http://localhost:5000/api';

export const api = {
  // Health check
  health: async () => {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
  },

  // Authentication
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },

  // Registration
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  },

  // Get assets
  getAssets: async (token) => {
    const response = await fetch(`${API_BASE_URL}/assets`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // Place trade
  placeTrade: async (tradeData, token) => {
    const response = await fetch(`${API_BASE_URL}/trades`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(tradeData)
    });
    return response.json();
  },

  // Get user trades
  getTrades: async (token) => {
    const response = await fetch(`${API_BASE_URL}/trades`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }
};