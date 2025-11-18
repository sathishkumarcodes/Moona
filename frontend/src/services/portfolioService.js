import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
const API = `${BACKEND_URL}/api`;

const portfolioService = {
  async getSummary() {
    try {
      const response = await axios.get(`${API}/portfolio/summary`, {
        withCredentials: true,
        timeout: 30000
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching portfolio summary:', error);
      throw error;
    }
  },

  async getPerformance() {
    try {
      const response = await axios.get(`${API}/portfolio/performance`, {
        withCredentials: true,
        timeout: 30000
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching portfolio performance:', error);
      throw error;
    }
  },

  async getAllocation() {
    try {
      const response = await axios.get(`${API}/portfolio/allocation`, {
        withCredentials: true,
        timeout: 30000
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching portfolio allocation:', error);
      throw error;
    }
  },

  async getSPYComparison() {
    try {
      const response = await axios.get(`${API}/portfolio/spy-comparison`, {
        withCredentials: true,
        timeout: 30000
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching SPY comparison:', error);
      throw error;
    }
  },

  async getTopPerformers(limit = 5) {
    try {
      const response = await axios.get(`${API}/portfolio/top-performers?limit=${limit}`, {
        withCredentials: true,
        timeout: 30000
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching top performers:', error);
      throw error;
    }
  }
};

export default portfolioService;

