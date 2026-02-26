const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test roles endpoints for frontend
async function testRolesFrontend() {
  try {
    console.log('Testing Roles Frontend Endpoints...\n');

    // First, let's login as admin to get a token
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'suryakantanag05@gmail.com',
      password: '123456'
    });

    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    console.log('✅ Login successful as admin');

    // Test get all roles (admin only)
    console.log('\n🏷️ Testing Get All Roles (Admin Only)...');
    const rolesResponse = await axios.get(`${BASE_URL}/roles`, { headers });
    console.log('All Roles:', rolesResponse.data);

    // Test get all users (admin only)
    console.log('\n👥 Testing Get All Users (Admin Only)...');
    const usersResponse = await axios.get(`${BASE_URL}/users`, { headers });
    console.log('All Users:', usersResponse.data.map(u => ({ 
      name: u.name, 
      email: u.email, 
      role: u.role?.name 
    })));

    console.log('\n✅ All roles frontend endpoints working correctly!');

  } catch (error) {
    console.error('❌ Error testing roles frontend:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

testRolesFrontend(); 