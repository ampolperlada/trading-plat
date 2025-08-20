// In your frontend components, replace mock data with real API calls

// frontend/src/utils/api.js
const API_BASE_URL = 'http://localhost:5000/api';

export const api = {
  // Authentication
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
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
  }
};