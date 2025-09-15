const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Auth endpoints
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: { email, password }
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: userData
    });
  }

  // Trading endpoints
  async getAssets() {
    return this.request('/assets');
  }

  async placeTrade(tradeData, token) {
    return this.request('/trades', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: tradeData
    });
  }

  async getUserProfile(token) {
    return this.request('/user/profile', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  async getHealthCheck() {
    return this.request('/health');
  }
}

export default new ApiService();