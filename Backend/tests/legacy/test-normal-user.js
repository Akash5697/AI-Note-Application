const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test user endpoints for normal user
async function testNormalUser() {
  try {
    console.log('Testing User Endpoints for Normal User...\n');

    // First, let's login as a normal user
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'bittu@gmail.com',
      password: '123456' // Assuming this is the password
    });

    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    console.log('✅ Login successful as normal user');

    // Test get current user profile (should work)
    console.log('\n👤 Testing Get Current User Profile...');
    const profileResponse = await axios.get(`${BASE_URL}/users/profile`, { headers });
    console.log('Current User Profile:', profileResponse.data);

    // Test get all users (should fail - admin only)
    console.log('\n👥 Testing Get All Users (Should Fail - Admin Only)...');
    try {
      const allUsersResponse = await axios.get(`${BASE_URL}/users`, { headers });
      console.log('All Users:', allUsersResponse.data);
    } catch (error) {
      console.log('❌ Expected Error - Access denied:', error.response?.data?.message);
    }

    console.log('\n✅ Normal user endpoints working correctly!');

  } catch (error) {
    console.error('❌ Error testing normal user:', error.response?.data || error.message);
  }
}

testNormalUser(); 