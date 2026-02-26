const axios = require('axios');

/**
 * API Client helper for testing
 * Provides a centralized way to make API calls with proper error handling
 */
class ApiClient {
  constructor(baseUrl = 'http://localhost:5000/api') {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    };
  }

  /**
   * Set authorization token for authenticated requests
   */
  setAuthToken(token) {
    if (token) {
      this.defaultHeaders.Authorization = `Bearer ${token}`;
    } else {
      delete this.defaultHeaders.Authorization;
    }
  }

  /**
   * Make HTTP GET request
   */
  async get(endpoint, headers = {}) {
    try {
      const response = await axios.get(`${this.baseUrl}${endpoint}`, {
        headers: { ...this.defaultHeaders, ...headers }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Make HTTP POST request
   */
  async post(endpoint, data = {}, headers = {}) {
    try {
      const response = await axios.post(`${this.baseUrl}${endpoint}`, data, {
        headers: { ...this.defaultHeaders, ...headers }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Make HTTP PUT request
   */
  async put(endpoint, data = {}, headers = {}) {
    try {
      const response = await axios.put(`${this.baseUrl}${endpoint}`, data, {
        headers: { ...this.defaultHeaders, ...headers }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Make HTTP DELETE request
   */
  async delete(endpoint, headers = {}) {
    try {
      const response = await axios.delete(`${this.baseUrl}${endpoint}`, {
        headers: { ...this.defaultHeaders, ...headers }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors consistently
   */
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const apiError = new Error(error.response.data.message || 'API Error');
      apiError.status = error.response.status;
      apiError.data = error.response.data;
      return apiError;
    } else if (error.request) {
      // Request was made but no response received
      return new Error('No response from server. Is the server running?');
    } else {
      // Something else happened
      return new Error(error.message || 'Unknown error occurred');
    }
  }

  /**
   * Health check endpoint
   */
  async healthCheck() {
    try {
      const response = await axios.get(`${this.baseUrl.replace('/api', '')}/health`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

module.exports = ApiClient;
