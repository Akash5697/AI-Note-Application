const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test user endpoints
async function testUsers() {
  try {
    console.log('Testing User Endpoints...\n');

    // First, let's login to get a token
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'suryakantanag05@gmail.com',
      password: '123456'
    });

    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    console.log('✅ Login successful');

    // Test get current user profile
    console.log('\n👤 Testing Get Current User Profile...');
    const profileResponse = await axios.get(`${BASE_URL}/users/profile`, { headers });
    console.log('Current User Profile:', profileResponse.data);

    // Test get all users (admin only)
    console.log('\n👥 Testing Get All Users (Admin Only)...');
    const allUsersResponse = await axios.get(`${BASE_URL}/users`, { headers });
    console.log('All Users:', allUsersResponse.data);

    console.log('\n✅ All user endpoints working correctly!');

  } catch (error) {
    console.error('❌ Error testing users:', error.response?.data || error.message);
  }
}

testUsers(); 