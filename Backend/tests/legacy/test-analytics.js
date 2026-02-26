const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test analytics endpoints
async function testAnalytics() {
  try {
    console.log('Testing Analytics Endpoints...\n');

    // First, let's login to get a token
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'suryakantanag05@gmail.com',
      password: '123456'
    });

    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    console.log('✅ Login successful');

    // Test analytics summary
    console.log('\n📊 Testing Analytics Summary...');
    const summaryResponse = await axios.get(`${BASE_URL}/analytics/summary`, { headers });
    console.log('Summary:', summaryResponse.data);

    // Test most active users
    console.log('\n👥 Testing Most Active Users...');
    const activeUsersResponse = await axios.get(`${BASE_URL}/analytics/active-users`, { headers });
    console.log('Active Users:', activeUsersResponse.data);

    // Test most used tags
    console.log('\n🏷️ Testing Most Used Tags...');
    const popularTagsResponse = await axios.get(`${BASE_URL}/analytics/popular-tags`, { headers });
    console.log('Popular Tags:', popularTagsResponse.data);

    // Test notes per day
    console.log('\n📈 Testing Notes Per Day...');
    const notesPerDayResponse = await axios.get(`${BASE_URL}/analytics/notes-per-day`, { headers });
    console.log('Notes Per Day:', notesPerDayResponse.data);

    console.log('\n✅ All analytics endpoints working correctly!');

  } catch (error) {
    console.error('❌ Error testing analytics:', error.response?.data || error.message);
  }
}

testAnalytics(); 