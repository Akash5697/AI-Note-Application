const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testArchiveFunctionality() {
  try {
    console.log('🧪 Testing Archive Functionality...\n');

    // First, login to get a token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    console.log('✅ Login successful');

    // Create a test note
    console.log('\n2. Creating a test note...');
    const createResponse = await axios.post(`${API_BASE}/notes`, {
      title: 'Test Note for Archive',
      content: 'This is a test note to check archive functionality',
      tags: ['test', 'archive']
    }, { headers });
    
    const noteId = createResponse.data._id;
    console.log('✅ Note created:', {
      id: noteId,
      title: createResponse.data.title,
      isArchived: createResponse.data.isArchived
    });

    // Test archiving the note
    console.log('\n3. Testing archive functionality...');
    const archiveResponse = await axios.put(`${API_BASE}/notes/${noteId}`, {
      isArchived: true
    }, { headers });
    
    console.log('✅ Note archived:', {
      id: archiveResponse.data._id,
      title: archiveResponse.data.title,
      isArchived: archiveResponse.data.isArchived
    });

    // Test unarchiving the note
    console.log('\n4. Testing unarchive functionality...');
    const unarchiveResponse = await axios.put(`${API_BASE}/notes/${noteId}`, {
      isArchived: false
    }, { headers });
    
    console.log('✅ Note unarchived:', {
      id: unarchiveResponse.data._id,
      title: unarchiveResponse.data.title,
      isArchived: unarchiveResponse.data.isArchived
    });

    // Test getting all notes to see if archive status is preserved
    console.log('\n5. Getting all notes to verify archive status...');
    const getNotesResponse = await axios.get(`${API_BASE}/notes`, { headers });
    
    const testNote = getNotesResponse.data.find(note => note._id === noteId);
    console.log('✅ Notes retrieved:', {
      totalNotes: getNotesResponse.data.length,
      testNoteArchived: testNote ? testNote.isArchived : 'Note not found'
    });

    // Clean up - delete the test note
    console.log('\n6. Cleaning up - deleting test note...');
    await axios.delete(`${API_BASE}/notes/${noteId}`, { headers });
    console.log('✅ Test note deleted');

    console.log('\n🎉 Archive functionality test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure your backend server is running on port 5000');
      console.log('   Run: cd Backend && npm start');
    }
  }
}

testArchiveFunctionality(); 