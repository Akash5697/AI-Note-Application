const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

class AuthTester {
  constructor() {
    this.testUser = null;
    this.adminUser = null;
    this.testResults = [];
  }

  async runTest(name, testFn) {
    try {
      console.log(`  🧪 ${name}...`);
      await testFn();
      console.log(`  ✅ ${name} - PASSED`);
      this.testResults.push({ name, status: 'PASSED' });
      return true;
    } catch (error) {
      console.log(`  ❌ ${name} - FAILED: ${error.message}`);
      this.testResults.push({ name, status: 'FAILED', error: error.message });
      return false;
    }
  }

  async testServerHealth() {
    const response = await axios.get(`${API_BASE.replace('/api', '')}/health`);
    if (!response.data || !response.data.message) {
      throw new Error('Health check failed - invalid response');
    }
  }

  async testUserRegistration() {
    const timestamp = Date.now();
    this.testUser = {
      name: 'Test User',
      email: `testuser${timestamp}@example.com`,
      password: 'password123'
    };

    const response = await axios.post(`${API_BASE}/auth/register`, this.testUser);
    
    if (!response.data._id || !response.data.token) {
      throw new Error('Registration failed - missing user ID or token');
    }

    this.testUser.id = response.data._id;
    this.testUser.token = response.data.token;
  }

  async testAdminRegistration() {
    const timestamp = Date.now();
    this.adminUser = {
      name: 'Admin User',
      email: `admin${timestamp}@example.com`,
      password: 'adminpass123'
    };

    const response = await axios.post(`${API_BASE}/auth/register`, this.adminUser);
    
    if (!response.data._id || !response.data.token) {
      throw new Error('Admin registration failed - missing user ID or token');
    }

    this.adminUser.id = response.data._id;
    this.adminUser.token = response.data.token;
  }

  async testUserLogin() {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: this.testUser.email,
      password: this.testUser.password
    });

    if (!response.data.token || response.data.email !== this.testUser.email) {
      throw new Error('Login failed - invalid response');
    }
  }

  async testInvalidLogin() {
    try {
      await axios.post(`${API_BASE}/auth/login`, {
        email: this.testUser.email,
        password: 'wrongpassword'
      });
      throw new Error('Invalid login should have failed');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        return; // Expected behavior
      }
      throw error;
    }
  }

  async testGetUserProfile() {
    const response = await axios.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${this.testUser.token}` }
    });

    if (!response.data._id || response.data.email !== this.testUser.email) {
      throw new Error('Get profile failed - invalid response');
    }
  }

  async testUnauthorizedAccess() {
    try {
      await axios.get(`${API_BASE}/auth/me`);
      throw new Error('Unauthorized access should have failed');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        return; // Expected behavior
      }
      throw error;
    }
  }

  async testInvalidToken() {
    try {
      await axios.get(`${API_BASE}/auth/me`, {
        headers: { Authorization: 'Bearer invalid-token' }
      });
      throw new Error('Invalid token should have failed');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        return; // Expected behavior
      }
      throw error;
    }
  }

  async testDuplicateRegistration() {
    try {
      await axios.post(`${API_BASE}/auth/register`, {
        name: 'Duplicate User',
        email: this.testUser.email, // Same email as existing user
        password: 'password123'
      });
      throw new Error('Duplicate registration should have failed');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        return; // Expected behavior
      }
      throw error;
    }
  }

  async run() {
    console.log('🔐 Testing Authentication APIs...\n');

    let passed = 0;
    let total = 0;

    const tests = [
      ['Server Health Check', () => this.testServerHealth()],
      ['User Registration', () => this.testUserRegistration()],
      ['Admin Registration', () => this.testAdminRegistration()],
      ['User Login', () => this.testUserLogin()],
      ['Invalid Login Credentials', () => this.testInvalidLogin()],
      ['Get User Profile', () => this.testGetUserProfile()],
      ['Unauthorized Access Protection', () => this.testUnauthorizedAccess()],
      ['Invalid Token Protection', () => this.testInvalidToken()],
      ['Duplicate Registration Prevention', () => this.testDuplicateRegistration()]
    ];

    for (const [name, testFn] of tests) {
      total++;
      if (await this.runTest(name, testFn)) {
        passed++;
      }
    }

    console.log(`\n📊 Authentication Test Results: ${passed}/${total} passed`);
    
    return {
      success: passed === total,
      passed,
      total,
      results: this.testResults,
      testUser: this.testUser,
      adminUser: this.adminUser
    };
  }
}

module.exports = async function testAuth() {
  const tester = new AuthTester();
  return await tester.run();
};
