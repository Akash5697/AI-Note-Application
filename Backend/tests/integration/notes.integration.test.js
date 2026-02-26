const ApiClient = require('../helpers/api-client');
const { generateTestUser, generateTestNote } = require('../helpers/test-data');
const { TestRunner, assert, TestCleanup } = require('../helpers/test-utils');

/**
 * Notes API Integration Tests
 * Tests all note endpoints with various scenarios
 */
async function runNotesTests() {
  const client = new ApiClient();
  const runner = new TestRunner('Notes API');
  const cleanup = new TestCleanup();
  
  let testUser = null;
  let testUser2 = null;
  let testNote = null;
  let sharedNote = null;

  // Setup: Create test users
  runner.addTest('Setup - Create Test Users', async () => {
    // Create first test user
    testUser = generateTestUser('notestest1');
    const response1 = await client.post('/auth/register', testUser);
    testUser.id = response1._id;
    testUser.token = response1.token;
    
    // Create second test user for sharing tests
    testUser2 = generateTestUser('notestest2');
    const response2 = await client.post('/auth/register', testUser2);
    testUser2.id = response2._id;
    testUser2.token = response2.token;
    
    // Add cleanup
    cleanup.add(async () => {
      try {
        if (testUser?.token) {
          client.setAuthToken(testUser.token);
          await client.delete(`/users/${testUser.id}`);
        }
        if (testUser2?.token) {
          client.setAuthToken(testUser2.token);
          await client.delete(`/users/${testUser2.id}`);
        }
      } catch (error) {
        // Users might already be deleted
      }
    });
  });

  // Test create note
  runner.addTest('Create Note - Valid Data', async () => {
    client.setAuthToken(testUser.token);
    const noteData = generateTestNote('Integration Test Note');
    
    const response = await client.post('/notes', noteData);
    
    assert.hasProperties(response, ['_id', 'title', 'content', 'tags', 'user', 'isArchived']);
    assert.equals(response.title, noteData.title);
    assert.equals(response.content, noteData.content);
    assert.equals(response.user, testUser.id);
    assert.equals(response.isArchived, false);
    assert.arrayLength(response.tags, noteData.tags.length);
    
    testNote = response;
  });

  // Test create note with invalid data
  runner.addTest('Create Note - Missing Title', async () => {
    client.setAuthToken(testUser.token);
    const invalidNote = {
      content: 'Content without title',
      tags: ['test']
    };
    
    try {
      await client.post('/notes', invalidNote);
      throw new Error('Should have failed with missing title');
    } catch (error) {
      assert.isTrue(error.status >= 400, 'Should return error status');
    }
  });

  // Test create note without authentication
  runner.addTest('Create Note - No Authentication', async () => {
    client.setAuthToken(null);
    const noteData = generateTestNote();
    
    try {
      await client.post('/notes', noteData);
      throw new Error('Should have failed without authentication');
    } catch (error) {
      assert.equals(error.status, 401, 'Should return 401 Unauthorized');
    }
  });

  // Test get all notes
  runner.addTest('Get All Notes', async () => {
    client.setAuthToken(testUser.token);
    const response = await client.get('/notes');
    
    assert.isTrue(Array.isArray(response), 'Should return array of notes');
    assert.isTrue(response.length >= 1, 'Should contain at least the created note');
    
    const createdNote = response.find(note => note._id === testNote._id);
    assert.isDefined(createdNote, 'Should contain the created note');
  });

  // Test get specific note
  runner.addTest('Get Note by ID', async () => {
    client.setAuthToken(testUser.token);
    const response = await client.get(`/notes/${testNote._id}`);
    
    assert.hasProperties(response, ['_id', 'title', 'content', 'tags', 'user']);
    assert.equals(response._id, testNote._id);
    assert.equals(response.title, testNote.title);
    assert.equals(response.user._id || response.user, testUser.id);
  });

  // Test get non-existent note
  runner.addTest('Get Note by ID - Not Found', async () => {
    client.setAuthToken(testUser.token);
    const fakeId = '507f1f77bcf86cd799439011';
    
    try {
      await client.get(`/notes/${fakeId}`);
      throw new Error('Should have failed with non-existent note ID');
    } catch (error) {
      assert.equals(error.status, 404, 'Should return 404 Not Found');
    }
  });

  // Test update note
  runner.addTest('Update Note - Valid Data', async () => {
    client.setAuthToken(testUser.token);
    const updateData = {
      title: 'Updated Test Note Title',
      content: 'Updated content for the test note',
      tags: ['updated', 'test', 'integration']
    };
    
    const response = await client.put(`/notes/${testNote._id}`, updateData);
    
    assert.equals(response.title, updateData.title);
    assert.equals(response.content, updateData.content);
    assert.arrayLength(response.tags, updateData.tags.length);
    
    testNote = response; // Update reference
  });

  // Test archive note
  runner.addTest('Archive Note', async () => {
    client.setAuthToken(testUser.token);
    const archiveData = { isArchived: true };
    
    const response = await client.put(`/notes/${testNote._id}`, archiveData);
    
    assert.equals(response.isArchived, true);
    assert.equals(response._id, testNote._id);
  });

  // Test unarchive note
  runner.addTest('Unarchive Note', async () => {
    client.setAuthToken(testUser.token);
    const unarchiveData = { isArchived: false };
    
    const response = await client.put(`/notes/${testNote._id}`, unarchiveData);
    
    assert.equals(response.isArchived, false);
    assert.equals(response._id, testNote._id);
  });

  // Test update note by non-owner
  runner.addTest('Update Note - Unauthorized User', async () => {
    client.setAuthToken(testUser2.token);
    const updateData = { title: 'Unauthorized Update' };
    
    try {
      await client.put(`/notes/${testNote._id}`, updateData);
      throw new Error('Should have failed - user cannot edit others notes');
    } catch (error) {
      assert.equals(error.status, 401, 'Should return 401 Unauthorized');
    }
  });

  // Test share note
  runner.addTest('Share Note with Another User', async () => {
    client.setAuthToken(testUser.token);
    const shareData = {
      userId: testUser2.id,
      permission: 'read'
    };
    
    const response = await client.post(`/notes/${testNote._id}/share`, shareData);
    
    assert.hasProperties(response, ['_id', 'sharedWith']);
    assert.isTrue(Array.isArray(response.sharedWith), 'Should have sharedWith array');
    assert.isTrue(response.sharedWith.length > 0, 'Should have shared users');
    
    const sharedUser = response.sharedWith.find(share => share.user._id === testUser2.id);
    assert.isDefined(sharedUser, 'Should contain shared user');
    assert.equals(sharedUser.permission, 'read');
  });

  // Test access shared note
  runner.addTest('Access Shared Note', async () => {
    client.setAuthToken(testUser2.token);
    
    try {
      const response = await client.get(`/notes/${testNote._id}`);
      
      assert.equals(response._id, testNote._id);
      assert.equals(response.title, testNote.title);
      
      // Verify that this user is in the sharedWith list
      assert.isTrue(Array.isArray(response.sharedWith), 'Note should have sharedWith array');
      const sharedUser = response.sharedWith.find(share => 
        (share.user._id || share.user) === testUser2.id
      );
      assert.isDefined(sharedUser, 'Current user should be in sharedWith list');
    } catch (error) {
      // If sharing isn't working, let's check the sharing process
      console.log(`    🔍 Debug: Trying to access note ${testNote._id} as user ${testUser2.id}`);
      console.log(`    🔍 Error: ${error.message}`);
      
      // Check if the note was actually shared
      client.setAuthToken(testUser.token);
      const noteCheck = await client.get(`/notes/${testNote._id}`);
      console.log(`    🔍 Note sharedWith:`, noteCheck.sharedWith?.map(s => s.user._id || s.user));
      
      throw error;
    }
  });

  // Test share note with write permission
  runner.addTest('Update Share Permission to Write', async () => {
    client.setAuthToken(testUser.token);
    const updateData = { permission: 'write' };
    
    const response = await client.put(`/notes/${testNote._id}/share/${testUser2.id}`, updateData);
    
    const sharedUser = response.sharedWith.find(share => share.user._id === testUser2.id);
    assert.equals(sharedUser.permission, 'write');
  });

  // Test edit shared note with write permission
  runner.addTest('Edit Shared Note with Write Permission', async () => {
    client.setAuthToken(testUser2.token);
    const updateData = { title: 'Updated by Shared User' };
    
    const response = await client.put(`/notes/${testNote._id}`, updateData);
    
    assert.equals(response.title, updateData.title);
  });

  // Test search notes by tags
  runner.addTest('Search Notes by Tags', async () => {
    client.setAuthToken(testUser.token);
    const response = await client.get('/notes/search?tags=test,integration');
    
    assert.isTrue(Array.isArray(response), 'Should return array of notes');
    // Should find at least one note with test tags
    assert.isTrue(response.length >= 1, 'Should find notes with test tags');
  });

  // Test remove sharing
  runner.addTest('Remove Note Sharing', async () => {
    client.setAuthToken(testUser.token);
    
    const response = await client.delete(`/notes/${testNote._id}/share/${testUser2.id}`);
    
    const sharedUser = response.sharedWith.find(share => share.user._id === testUser2.id);
    assert.isTrue(!sharedUser, 'Shared user should be removed');
  });

  // Test access note after sharing removed
  runner.addTest('Access Note After Sharing Removed', async () => {
    client.setAuthToken(testUser2.token);
    
    try {
      await client.get(`/notes/${testNote._id}`);
      throw new Error('Should have failed - sharing was removed');
    } catch (error) {
      assert.equals(error.status, 401, 'Should return 401 Unauthorized');
    }
  });

  // Test delete note by non-owner
  runner.addTest('Delete Note - Unauthorized User', async () => {
    client.setAuthToken(testUser2.token);
    
    try {
      await client.delete(`/notes/${testNote._id}`);
      throw new Error('Should have failed - user cannot delete others notes');
    } catch (error) {
      assert.equals(error.status, 401, 'Should return 401 Unauthorized');
    }
  });

  // Test delete note by owner
  runner.addTest('Delete Note - Owner', async () => {
    client.setAuthToken(testUser.token);
    
    const response = await client.delete(`/notes/${testNote._id}`);
    
    assert.hasProperties(response, ['message']);
    assert.isTrue(response.message.includes('removed'), 'Should confirm deletion');
  });

  // Test access deleted note
  runner.addTest('Access Deleted Note', async () => {
    client.setAuthToken(testUser.token);
    
    try {
      await client.get(`/notes/${testNote._id}`);
      throw new Error('Should have failed - note was deleted');
    } catch (error) {
      assert.equals(error.status, 404, 'Should return 404 Not Found');
    }
  });

  try {
    const results = await runner.runAll();
    await cleanup.runAll();
    return results;
  } catch (error) {
    await cleanup.runAll();
    throw error;
  }
}

module.exports = runNotesTests;

// Run tests if this file is executed directly
if (require.main === module) {
  runNotesTests()
    .then(results => {
      if (results.success) {
        console.log('\n🎉 All notes tests passed!');
        process.exit(0);
      } else {
        console.log('\n❌ Some notes tests failed!');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 Notes test suite failed:', error);
      process.exit(1);
    });
}
