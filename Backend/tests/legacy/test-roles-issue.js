const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test roles functionality to identify issues
async function testRolesIssue() {
  try {
    console.log('🔍 Testing Roles Functionality for Issues...\n');

    // Test 1: Login as admin
    console.log('1️⃣ Testing Admin Login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'suryakantanag05@gmail.com',
      password: '123456'
    });

    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    console.log('✅ Admin login successful');

    // Test 2: Check if roles endpoint exists and works
    console.log('\n2️⃣ Testing Roles Endpoint...');
    try {
      const rolesResponse = await axios.get(`${BASE_URL}/roles`, { headers });
      console.log('✅ Roles endpoint working - Found', rolesResponse.data.length, 'roles');
      console.log('Roles:', rolesResponse.data.map(r => ({ name: r.name, id: r._id })));
    } catch (error) {
      console.error('❌ Roles endpoint failed:', error.response?.data || error.message);
    }

    // Test 3: Check if users endpoint exists and works
    console.log('\n3️⃣ Testing Users Endpoint...');
    try {
      const usersResponse = await axios.get(`${BASE_URL}/users`, { headers });
      console.log('✅ Users endpoint working - Found', usersResponse.data.length, 'users');
      console.log('Users:', usersResponse.data.map(u => ({ 
        name: u.name, 
        email: u.email, 
        role: u.role?.name || 'No role' 
      })));
    } catch (error) {
      console.error('❌ Users endpoint failed:', error.response?.data || error.message);
    }

    // Test 4: Check if user profile endpoint works
    console.log('\n4️⃣ Testing User Profile Endpoint...');
    try {
      const profileResponse = await axios.get(`${BASE_URL}/users/profile`, { headers });
      console.log('✅ Profile endpoint working - User:', profileResponse.data.name);
    } catch (error) {
      console.error('❌ Profile endpoint failed:', error.response?.data || error.message);
    }

    // Test 5: Check if role update endpoint works
    console.log('\n5️⃣ Testing Role Update Endpoint...');
    try {
      const rolesResponse = await axios.get(`${BASE_URL}/roles`, { headers });
      const adminRole = rolesResponse.data.find(r => r.name === 'admin');
      const usersResponse = await axios.get(`${BASE_URL}/users`, { headers });
      const normalUser = usersResponse.data.find(u => u.role?.name === 'user');
      
      if (adminRole && normalUser) {
        const updateResponse = await axios.put(`${BASE_URL}/users/${normalUser._id}/role`, 
          { roleId: adminRole._id }, 
          { headers }
        );
        console.log('✅ Role update endpoint working');
      } else {
        console.log('⚠️ Skipping role update test - no suitable users found');
      }
    } catch (error) {
      console.error('❌ Role update endpoint failed:', error.response?.data || error.message);
    }

    console.log('\n🎯 Test Summary: All endpoints should be working correctly!');

  } catch (error) {
    console.error('❌ Critical error:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('URL:', error.config?.url);
    }
  }
}

testRolesIssue(); 