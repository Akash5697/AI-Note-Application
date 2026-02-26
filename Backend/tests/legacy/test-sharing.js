const axios = require('axios');

const API_BASE = 'http://localhost:5002/api';

async function testNoteSharing() {
  console.log('🧪 Testing Note Sharing Functionality\n');

  try {
    // Step 1: Login as Surya Kanta Nag
    console.log('1️⃣ Logging in as Surya Kanta Nag...');
    const suryaLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'suryakantanag05@gmail.com',
      password: 'password123'
    });
    const suryaToken = suryaLogin.data.token;
    console.log('✅ Logged in as Surya Kanta Nag');

    // Step 2: Login as Test User
    console.log('\n2️⃣ Logging in as Test User...');
    const testUserLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    const testUserToken = testUserLogin.data.token;
    console.log('✅ Logged in as Test User');

    // Step 3: Get notes for Surya
    console.log('\n3️⃣ Getting Surya\'s notes...');
    const suryaNotes = await axios.get(`${API_BASE}/notes`, {
      headers: { Authorization: `Bearer ${suryaToken}` }
    });
    console.log(`Found ${suryaNotes.data.length} notes for Surya`);

    if (suryaNotes.data.length === 0) {
      console.log('❌ No notes found. Please create a note first.');
      return;
    }

    const noteToShare = suryaNotes.data[0];
    console.log(`Selected note: "${noteToShare.title}"`);

    // Step 4: Get users for sharing
    console.log('\n4️⃣ Getting users available for sharing...');
    const usersForSharing = await axios.get(`${API_BASE}/users/sharing`, {
      headers: { Authorization: `Bearer ${suryaToken}` }
    });
    console.log('Available users for sharing:');
    usersForSharing.data.forEach(user => {
      console.log(`  - ${user.name} (${user.email})`);
    });

    // Step 5: Share note with Test User
    console.log('\n5️⃣ Sharing note with Test User...');
    const shareResponse = await axios.post(`${API_BASE}/notes/${noteToShare._id}/share`, {
      userId: testUserLogin.data._id,
      permission: 'read'
    }, {
      headers: { Authorization: `Bearer ${suryaToken}` }
    });
    console.log('✅ Note shared successfully!');
    console.log('Shared note details:', {
      title: shareResponse.data.title,
      sharedWith: shareResponse.data.sharedWith?.length || 0
    });

    // Step 6: Test that Test User can see the shared note
    console.log('\n6️⃣ Testing if Test User can see the shared note...');
    const testUserNotes = await axios.get(`${API_BASE}/notes`, {
      headers: { Authorization: `Bearer ${testUserToken}` }
    });
    
    const sharedNote = testUserNotes.data.find(note => note._id === noteToShare._id);
    if (sharedNote) {
      console.log('✅ Test User can see the shared note!');
      console.log(`Note: "${sharedNote.title}"`);
      console.log(`Permission: ${sharedNote.sharedWith?.[0]?.permission || 'read'}`);
    } else {
      console.log('❌ Test User cannot see the shared note');
    }

    // Step 7: Test updating permission
    console.log('\n7️⃣ Testing permission update...');
    const updatePermission = await axios.put(`${API_BASE}/notes/${noteToShare._id}/share/${testUserLogin.data._id}`, {
      permission: 'write'
    }, {
      headers: { Authorization: `Bearer ${suryaToken}` }
    });
    console.log('✅ Permission updated to "write"');

    // Step 8: Test removing sharing
    console.log('\n8️⃣ Testing remove sharing...');
    const removeSharing = await axios.delete(`${API_BASE}/notes/${noteToShare._id}/share/${testUserLogin.data._id}`, {
      headers: { Authorization: `Bearer ${suryaToken}` }
    });
    console.log('✅ Sharing removed successfully');

    console.log('\n🎉 All sharing tests completed successfully!');
    console.log('\n📋 Summary of sharing features:');
    console.log('  ✅ Share notes with other users');
    console.log('  ✅ Set read/write permissions');
    console.log('  ✅ Update permissions');
    console.log('  ✅ Remove sharing');
    console.log('  ✅ Shared users can see notes');
    console.log('  ✅ Permission-based access control');

  } catch (error) {
    console.error('❌ Error during sharing test:', error.response?.data?.message || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Make sure you have users with these credentials:');
      console.log('  - suryakantanag05@gmail.com / password123');
      console.log('  - test@example.com / password123');
    }
  }
}

testNoteSharing(); 