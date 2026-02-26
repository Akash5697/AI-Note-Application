const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test frontend user endpoints
async function testFrontendUsers() {
  try {
    console.log('Testing Frontend User Endpoints...\n');

    // First, let's login to get a token
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'suryakantanag05@gmail.com',
      password: '123456'
    });

    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    console.log('✅ Login successful');

    // Test the exact endpoint that frontend calls
    console.log('\n👥 Testing Frontend GetAllUsers Endpoint...');
    const allUsersResponse = await axios.get(`${BASE_URL}/users`, { headers });
    console.log('All Users Response:', {
      status: allUsersResponse.status,
      dataLength: allUsersResponse.data.length,
      users: allUsersResponse.data.map(u => ({ name: u.name, email: u.email, role: u.role?.name }))
    });

    // Test current user profile endpoint
    console.log('\n👤 Testing Frontend GetCurrentUser Endpoint...');
    const profileResponse = await axios.get(`${BASE_URL}/users/profile`, { headers });
    console.log('Current User Profile:', {
      name: profileResponse.data.name,
      email: profileResponse.data.email,
      role: profileResponse.data.role?.name
    });

    console.log('\n✅ Frontend user endpoints working correctly!');

  } catch (error) {
    console.error('❌ Error testing frontend users:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

testFrontendUsers(); 