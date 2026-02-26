const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test all frontend endpoints
async function testFrontendComplete() {
  try {
    console.log('Testing All Frontend Endpoints...\n');

    // First, let's login as admin to get a token
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'suryakantanag05@gmail.com',
      password: '123456'
    });

    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    console.log('✅ Login successful as admin');

    // Test 1: Get all roles (for roles component)
    console.log('\n1️⃣ Testing Get All Roles...');
    const rolesResponse = await axios.get(`${BASE_URL}/roles`, { headers });
    console.log('✅ Roles loaded:', rolesResponse.data.length, 'roles');

    // Test 2: Get all users (for roles component)
    console.log('\n2️⃣ Testing Get All Users...');
    const usersResponse = await axios.get(`${BASE_URL}/users`, { headers });
    console.log('✅ Users loaded:', usersResponse.data.length, 'users');

    // Test 3: Get current user profile (for normal users)
    console.log('\n3️⃣ Testing Get Current User Profile...');
    const profileResponse = await axios.get(`${BASE_URL}/users/profile`, { headers });
    console.log('✅ Profile loaded:', profileResponse.data.name);

    // Test 4: Analytics endpoints (for dashboard)
    console.log('\n4️⃣ Testing Analytics Endpoints...');
    const analyticsResponse = await axios.get(`${BASE_URL}/analytics/summary`, { headers });
    console.log('✅ Analytics loaded');

    // Test 5: Role update (for admin promotion)
    console.log('\n5️⃣ Testing Role Update...');
    const adminRole = rolesResponse.data.find(r => r.name === 'admin');
    const normalUser = usersResponse.data.find(u => u.role?.name === 'user');
    
    if (normalUser) {
      const updateResponse = await axios.put(`${BASE_URL}/users/${normalUser._id}/role`, 
        { roleId: adminRole._id }, 
        { headers }
      );
      console.log('✅ Role update successful');
    }

    console.log('\n🎉 All frontend endpoints working correctly!');

  } catch (error) {
    console.error('❌ Error testing frontend endpoints:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('URL:', error.config?.url);
    }
  }
}

testFrontendComplete(); 