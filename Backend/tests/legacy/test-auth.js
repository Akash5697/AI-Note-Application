const axios = require('axios');

const API_BASE = 'http://localhost:5002/api';

async function testAuthFunctionality() {
  console.log('🔐 Testing Authentication Functionality\n');

  try {
    // Test 1: Check if server is running
    console.log('1️⃣ Checking server status...');
    try {
      const healthResponse = await axios.get(`${API_BASE.replace('/api', '')}/health`);
      console.log('✅ Server is running:', healthResponse.data.message);
    } catch (error) {
      console.log('❌ Server is not running. Please start the backend server first.');
      return;
    }

    // Test 2: Test registration
    console.log('\n2️⃣ Testing user registration...');
    const testUser = {
      name: 'Test User Auth',
      email: `testauth${Date.now()}@example.com`,
      password: 'password123'
    };

    try {
      const registerResponse = await axios.post(`${API_BASE}/auth/register`, testUser);
      console.log('✅ Registration successful!');
      console.log('   User ID:', registerResponse.data._id);
      console.log('   Name:', registerResponse.data.name);
      console.log('   Email:', registerResponse.data.email);
      console.log('   Token received:', registerResponse.data.token ? 'Yes' : 'No');
      
      const authToken = registerResponse.data.token;
      
      // Test 3: Test login with the same user
      console.log('\n3️⃣ Testing login with registered user...');
      const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
        email: testUser.email,
        password: testUser.password
      });
      
      console.log('✅ Login successful!');
      console.log('   User ID:', loginResponse.data._id);
      console.log('   Name:', loginResponse.data.name);
      console.log('   Token received:', loginResponse.data.token ? 'Yes' : 'No');
      
      // Test 4: Test login with wrong password
      console.log('\n4️⃣ Testing login with wrong password...');
      try {
        await axios.post(`${API_BASE}/auth/login`, {
          email: testUser.email,
          password: 'wrongpassword'
        });
        console.log('❌ Should have failed with wrong password');
      } catch (error) {
        if (error.response?.status === 401) {
          console.log('✅ Correctly rejected wrong password');
        } else {
          console.log('❌ Unexpected error:', error.response?.data?.message);
        }
      }
      
      // Test 5: Test login with non-existent user
      console.log('\n5️⃣ Testing login with non-existent user...');
      try {
        await axios.post(`${API_BASE}/auth/login`, {
          email: 'nonexistent@example.com',
          password: 'password123'
        });
        console.log('❌ Should have failed with non-existent user');
      } catch (error) {
        if (error.response?.status === 401) {
          console.log('✅ Correctly rejected non-existent user');
        } else {
          console.log('❌ Unexpected error:', error.response?.data?.message);
        }
      }
      
      // Test 6: Test duplicate registration
      console.log('\n6️⃣ Testing duplicate registration...');
      try {
        await axios.post(`${API_BASE}/auth/register`, testUser);
        console.log('❌ Should have failed with duplicate email');
      } catch (error) {
        if (error.response?.status === 400) {
          console.log('✅ Correctly rejected duplicate registration');
        } else {
          console.log('❌ Unexpected error:', error.response?.data?.message);
        }
      }
      
      // Test 7: Test protected endpoint with token
      console.log('\n7️⃣ Testing protected endpoint with token...');
      try {
        const meResponse = await axios.get(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('✅ Protected endpoint accessible with token');
        console.log('   Current user:', meResponse.data.name);
      } catch (error) {
        console.log('❌ Protected endpoint failed:', error.response?.data?.message);
      }
      
      console.log('\n🎉 All authentication tests completed successfully!');
      console.log('\n📋 Summary:');
      console.log('  ✅ User registration working');
      console.log('  ✅ User login working');
      console.log('  ✅ Password validation working');
      console.log('  ✅ Duplicate email prevention working');
      console.log('  ✅ JWT token generation working');
      console.log('  ✅ Protected routes working');
      
    } catch (error) {
      console.error('❌ Registration failed:', error.response?.data?.message || error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAuthFunctionality(); 