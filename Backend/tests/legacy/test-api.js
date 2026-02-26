const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testAPI() {
  try {
    console.log('🧪 Testing Backend API...\n');

    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${API_BASE.replace('/api', '')}/health`);
    console.log('✅ Health check passed:', healthResponse.data);

    // Test registration with a unique email
    console.log('\n2. Testing user registration...');
    const timestamp = Date.now();
    const registerData = {
      name: 'Test User',
      email: `test${timestamp}@example.com`,
      password: 'password123'
    };
    
    const registerResponse = await axios.post(`${API_BASE}/auth/register`, registerData);
    console.log('✅ Registration successful:', {
      id: registerResponse.data._id,
      name: registerResponse.data.name,
      email: registerResponse.data.email,
      hasToken: !!registerResponse.data.token
    });

    // Test login
    console.log('\n3. Testing user login...');
    const loginData = {
      email: registerData.email,
      password: 'password123'
    };
    
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, loginData);
    console.log('✅ Login successful:', {
      id: loginResponse.data._id,
      name: loginResponse.data.name,
      email: loginResponse.data.email,
      hasToken: !!loginResponse.data.token
    });

    // Test protected endpoint
    console.log('\n4. Testing protected endpoint...');
    const token = loginResponse.data.token;
    const meResponse = await axios.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Protected endpoint successful:', {
      id: meResponse.data._id,
      name: meResponse.data.name,
      email: meResponse.data.email
    });

    console.log('\n🎉 All tests passed! Backend is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure your backend server is running on port 5000');
      console.log('   Run: cd Backend && npm start');
    }
  }
}

testAPI(); 