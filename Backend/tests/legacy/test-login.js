const axios = require('axios');

const API_BASE = 'http://localhost:5002/api';

async function testLogin() {
  console.log('🔐 Testing Login...\n');

  try {
    // Test login with Surya Kanta Nag
    console.log('Testing login for suryakantanag05@gmail.com...');
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: 'suryakantanag05@gmail.com',
      password: 'password123'
    });
    
    console.log('✅ Login successful!');
    console.log('User:', response.data.name);
    console.log('Email:', response.data.email);
    console.log('Token received:', response.data.token ? 'Yes' : 'No');
    
  } catch (error) {
    console.error('❌ Login failed:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 The password might be different. Let me check the user details...');
    }
  }
}

testLogin(); 