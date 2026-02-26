const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test role update functionality
async function testRoleUpdate() {
  try {
    console.log('Testing Role Update Functionality...\n');

    // First, let's login as admin to get a token
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'suryakantanag05@gmail.com',
      password: '123456'
    });

    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    console.log('✅ Login successful as admin');

    // Get all roles to find admin role ID
    console.log('\n🏷️ Getting all roles...');
    const rolesResponse = await axios.get(`${BASE_URL}/roles`, { headers });
    const adminRole = rolesResponse.data.find(r => r.name === 'admin');
    console.log('Admin role ID:', adminRole._id);

    // Get all users to find a normal user
    console.log('\n👥 Getting all users...');
    const usersResponse = await axios.get(`${BASE_URL}/users`, { headers });
    const normalUser = usersResponse.data.find(u => u.role?.name === 'user');
    console.log('Normal user to promote:', normalUser.name, normalUser._id);

    // Test role update
    console.log('\n🔄 Testing role update...');
    const updateResponse = await axios.put(`${BASE_URL}/users/${normalUser._id}/role`, 
      { roleId: adminRole._id }, 
      { headers }
    );
    console.log('Role update response:', updateResponse.data);

    console.log('\n✅ Role update functionality working correctly!');

  } catch (error) {
    console.error('❌ Error testing role update:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

testRoleUpdate(); 