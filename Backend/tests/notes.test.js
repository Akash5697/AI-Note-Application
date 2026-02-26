const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

class NotesTester {
  constructor() {
    this.user = null;
    this.secondUser = null;
    this.note = null;
    this.secondNote = null;
    this.testResults = [];
  }

  async runTest(name, testFn) {
    try {
      console.log(`  🧪 ${name}...`);
      await testFn();
      console.log(`  ✅ ${name} - PASSED`);
      this.testResults.push({ name, status: 'PASSED' });
      return true;
    } catch (error) {
      console.log(`  ❌ ${name} - FAILED: ${error.message}`);
      this.testResults.push({ name, status: 'FAILED', error: error.message });
      return false;
    }
  }

  async setupUsers() {
    // Create first user
    const timestamp = Date.now();
    const userData = {
      name: 'Notes Test User',
      email: `notesuser${timestamp}@example.com`,
      password: 'password123'
    };

    const userResponse = await axios.post(`${API_BASE}/auth/register`, userData);
    this.user = {
      id: userResponse.data._id,
      token: userResponse.data.token,
      email: userData.email
    };

    // Create second user for sharing tests
    const secondUserData = {
      name: 'Second Notes User',
      email: `notesuser2${timestamp}@example.com`,
      password: 'password123'
    };

    const secondUserResponse = await axios.post(`${API_BASE}/auth/register`, secondUserData);
    this.secondUser = {
      id: secondUserResponse.data._id,
      token: secondUserResponse.data.token,
      email: secondUserData.email
    };
  }

  async testCreateNote() {
    const noteData = {
      title: 'Test Note',
      content: 'This is a test note content with <b>HTML</b> formatting.',
      tags: ['test', 'api', 'notes']
    };

    const response = await axios.post(`${API_BASE}/notes`, noteData, {
      headers: { Authorization: `Bearer ${this.user.token}` }
    });

    if (!response.data._id || response.data.title !== noteData.title) {
      throw new Error('Note creation failed - invalid response');
    }

    this.note = response.data;
  }

  async testCreateSecondNote() {
    const noteData = {
      title: 'Second Test Note',
      content: 'This is another test note for searching.',
      tags: ['search', 'test', 'example']
    };

    const response = await axios.post(`${API_BASE}/notes`, noteData, {
      headers: { Authorization: `Bearer ${this.user.token}` }
    });

    this.secondNote = response.data;
  }

  async testGetAllNotes() {
    const response = await axios.get(`${API_BASE}/notes`, {
      headers: { Authorization: `Bearer ${this.user.token}` }
    });

    if (!Array.isArray(response.data) || response.data.length === 0) {
      throw new Error('Get all notes failed - invalid response');
    }

    const noteExists = response.data.some(note => note._id === this.note._id);
    if (!noteExists) {
      throw new Error('Created note not found in notes list');
    }
  }

  async testGetNoteById() {
    const response = await axios.get(`${API_BASE}/notes/${this.note._id}`, {
      headers: { Authorization: `Bearer ${this.user.token}` }
    });

    if (response.data._id !== this.note._id) {
      throw new Error('Get note by ID failed - invalid response');
    }
  }

  async testUpdateNote() {
    const updateData = {
      title: 'Updated Test Note',
      content: 'This is updated content.',
      tags: ['updated', 'test']
    };

    const response = await axios.put(`${API_BASE}/notes/${this.note._id}`, updateData, {
      headers: { Authorization: `Bearer ${this.user.token}` }
    });

    if (response.data.title !== updateData.title) {
      throw new Error('Note update failed - title not updated');
    }

    this.note = response.data;
  }

  async testArchiveNote() {
    const response = await axios.put(`${API_BASE}/notes/${this.note._id}`, {
      isArchived: true
    }, {
      headers: { Authorization: `Bearer ${this.user.token}` }
    });

    if (response.data.isArchived !== true) {
      throw new Error('Note archiving failed');
    }
  }

  async testUnarchiveNote() {
    const response = await axios.put(`${API_BASE}/notes/${this.note._id}`, {
      isArchived: false
    }, {
      headers: { Authorization: `Bearer ${this.user.token}` }
    });

    if (response.data.isArchived !== false) {
      throw new Error('Note unarchiving failed');
    }
  }

  async testSearchNotes() {
    const response = await axios.get(`${API_BASE}/notes/search?tags=test`, {
      headers: { Authorization: `Bearer ${this.user.token}` }
    });

    if (!Array.isArray(response.data)) {
      throw new Error('Search notes failed - invalid response');
    }

    const hasTestTag = response.data.some(note => 
      note.tags && note.tags.includes('test')
    );
    
    if (!hasTestTag) {
      throw new Error('Search notes failed - no notes with test tag found');
    }
  }

  async testShareNote() {
    const shareData = {
      userId: this.secondUser.id,
      permission: 'read'
    };

    const response = await axios.post(`${API_BASE}/notes/${this.note._id}/share`, shareData, {
      headers: { Authorization: `Bearer ${this.user.token}` }
    });

    const sharedUser = response.data.sharedWith.find(share => 
      share.user.toString() === this.secondUser.id
    );

    if (!sharedUser || sharedUser.permission !== 'read') {
      throw new Error('Note sharing failed');
    }
  }

  async testUpdateSharing() {
    const response = await axios.put(
      `${API_BASE}/notes/${this.note._id}/share/${this.secondUser.id}`,
      { permission: 'write' },
      { headers: { Authorization: `Bearer ${this.user.token}` } }
    );

    const sharedUser = response.data.sharedWith.find(share => 
      share.user.toString() === this.secondUser.id
    );

    if (!sharedUser || sharedUser.permission !== 'write') {
      throw new Error('Update sharing permission failed');
    }
  }

  async testAccessSharedNote() {
    const response = await axios.get(`${API_BASE}/notes/${this.note._id}`, {
      headers: { Authorization: `Bearer ${this.secondUser.token}` }
    });

    if (response.data._id !== this.note._id) {
      throw new Error('Access shared note failed');
    }
  }

  async testRemoveSharing() {
    const response = await axios.delete(
      `${API_BASE}/notes/${this.note._id}/share/${this.secondUser.id}`,
      { headers: { Authorization: `Bearer ${this.user.token}` } }
    );

    const sharedUser = response.data.sharedWith.find(share => 
      share.user.toString() === this.secondUser.id
    );

    if (sharedUser) {
      throw new Error('Remove sharing failed - user still has access');
    }
  }

  async testUnauthorizedNoteAccess() {
    try {
      await axios.get(`${API_BASE}/notes/${this.note._id}`, {
        headers: { Authorization: `Bearer ${this.secondUser.token}` }
      });
      throw new Error('Unauthorized access should have failed');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        return; // Expected behavior
      }
      throw error;
    }
  }

  async testDeleteNote() {
    const response = await axios.delete(`${API_BASE}/notes/${this.secondNote._id}`, {
      headers: { Authorization: `Bearer ${this.user.token}` }
    });

    if (!response.data.message || !response.data.message.includes('removed')) {
      throw new Error('Note deletion failed');
    }
  }

  async testInvalidNoteAccess() {
    try {
      await axios.get(`${API_BASE}/notes/invalid-id`, {
        headers: { Authorization: `Bearer ${this.user.token}` }
      });
      throw new Error('Invalid note ID should have failed');
    } catch (error) {
      if (error.response && (error.response.status === 404 || error.response.status === 400)) {
        return; // Expected behavior
      }
      throw error;
    }
  }

  async run() {
    console.log('📝 Testing Notes APIs...\n');

    let passed = 0;
    let total = 0;

    // Setup users first
    await this.setupUsers();

    const tests = [
      ['Create Note', () => this.testCreateNote()],
      ['Create Second Note', () => this.testCreateSecondNote()],
      ['Get All Notes', () => this.testGetAllNotes()],
      ['Get Note By ID', () => this.testGetNoteById()],
      ['Update Note', () => this.testUpdateNote()],
      ['Archive Note', () => this.testArchiveNote()],
      ['Unarchive Note', () => this.testUnarchiveNote()],
      ['Search Notes', () => this.testSearchNotes()],
      ['Share Note', () => this.testShareNote()],
      ['Update Sharing Permission', () => this.testUpdateSharing()],
      ['Access Shared Note', () => this.testAccessSharedNote()],
      ['Remove Sharing', () => this.testRemoveSharing()],
      ['Unauthorized Note Access', () => this.testUnauthorizedNoteAccess()],
      ['Delete Note', () => this.testDeleteNote()],
      ['Invalid Note ID Access', () => this.testInvalidNoteAccess()]
    ];

    for (const [name, testFn] of tests) {
      total++;
      if (await this.runTest(name, testFn)) {
        passed++;
      }
    }

    console.log(`\n📊 Notes Test Results: ${passed}/${total} passed`);
    
    return {
      success: passed === total,
      passed,
      total,
      results: this.testResults,
      user: this.user
    };
  }
}

module.exports = async function testNotes() {
  const tester = new NotesTester();
  return await tester.run();
};
