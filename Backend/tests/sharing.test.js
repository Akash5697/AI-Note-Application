const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

class SharingTester {
  constructor() {
    this.userA = null;
    this.userB = null;
    this.userC = null;
    this.sharedNote = null;
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
    const timestamp = Date.now();

    // Create three users for comprehensive sharing tests
    const users = [
      {
        name: 'Sharing User A',
        email: `sharinguserA${timestamp}@example.com`,
        password: 'password123'
      },
      {
        name: 'Sharing User B',
        email: `sharinguserB${timestamp}@example.com`,
        password: 'password123'
      },
      {
        name: 'Sharing User C',
        email: `sharinguserC${timestamp}@example.com`,
        password: 'password123'
      }
    ];

    const responses = await Promise.all(
      users.map(userData => axios.post(`${API_BASE}/auth/register`, userData))
    );

    this.userA = {
      id: responses[0].data._id,
      token: responses[0].data.token,
      email: users[0].email,
      name: users[0].name
    };

    this.userB = {
      id: responses[1].data._id,
      token: responses[1].data.token,
      email: users[1].email,
      name: users[1].name
    };

    this.userC = {
      id: responses[2].data._id,
      token: responses[2].data.token,
      email: users[2].email,
      name: users[2].name
    };

    console.log('    👥 Created 3 test users for sharing tests');
  }

  async setupSharedNote() {
    const noteData = {
      title: 'Shared Test Note',
      content: 'This note will be shared between users for testing.',
      tags: ['shared', 'test', 'collaboration']
    };

    const response = await axios.post(`${API_BASE}/notes`, noteData, {
      headers: { Authorization: `Bearer ${this.userA.token}` }
    });

    this.sharedNote = response.data;
    console.log('    📝 Created test note for sharing');
  }

  async testShareNoteWithReadPermission() {
    const shareData = {
      userId: this.userB.id,
      permission: 'read'
    };

    const response = await axios.post(`${API_BASE}/notes/${this.sharedNote._id}/share`, shareData, {
      headers: { Authorization: `Bearer ${this.userA.token}` }
    });

    const sharedUser = response.data.sharedWith.find(share => 
      share.user.toString() === this.userB.id
    );

    if (!sharedUser || sharedUser.permission !== 'read') {
      throw new Error('Share note with read permission failed');
    }

    console.log('    📖 Shared note with read permission');
  }

  async testSharedUserCanReadNote() {
    const response = await axios.get(`${API_BASE}/notes/${this.sharedNote._id}`, {
      headers: { Authorization: `Bearer ${this.userB.token}` }
    });

    if (response.data._id !== this.sharedNote._id) {
      throw new Error('Shared user cannot read note');
    }

    if (response.data.title !== this.sharedNote.title) {
      throw new Error('Shared note content mismatch');
    }
  }

  async testSharedUserCannotEditWithReadPermission() {
    try {
      await axios.put(`${API_BASE}/notes/${this.sharedNote._id}`, {
        title: 'Unauthorized Edit Attempt',
        content: 'This should fail'
      }, {
        headers: { Authorization: `Bearer ${this.userB.token}` }
      });

      throw new Error('Read-only user should not be able to edit note');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        return; // Expected behavior
      }
      throw error;
    }
  }

  async testUpgradePermissionToWrite() {
    const response = await axios.put(
      `${API_BASE}/notes/${this.sharedNote._id}/share/${this.userB.id}`,
      { permission: 'write' },
      { headers: { Authorization: `Bearer ${this.userA.token}` } }
    );

    const sharedUser = response.data.sharedWith.find(share => 
      share.user.toString() === this.userB.id
    );

    if (!sharedUser || sharedUser.permission !== 'write') {
      throw new Error('Upgrade to write permission failed');
    }

    console.log('    ✏️  Upgraded permission to write');
  }

  async testSharedUserCanEditWithWritePermission() {
    const updateData = {
      title: 'Updated by Shared User',
      content: 'This content was updated by user B with write permission.',
      tags: ['shared', 'updated', 'collaboration']
    };

    const response = await axios.put(`${API_BASE}/notes/${this.sharedNote._id}`, updateData, {
      headers: { Authorization: `Bearer ${this.userB.token}` }
    });

    if (response.data.title !== updateData.title) {
      throw new Error('Shared user with write permission cannot edit note');
    }

    this.sharedNote = response.data;
  }

  async testShareWithMultipleUsers() {
    const shareData = {
      userId: this.userC.id,
      permission: 'read'
    };

    const response = await axios.post(`${API_BASE}/notes/${this.sharedNote._id}/share`, shareData, {
      headers: { Authorization: `Bearer ${this.userA.token}` }
    });

    if (response.data.sharedWith.length < 2) {
      throw new Error('Note should be shared with multiple users');
    }

    const userCAccess = response.data.sharedWith.find(share => 
      share.user.toString() === this.userC.id
    );

    if (!userCAccess) {
      throw new Error('Third user not added to shared list');
    }

    console.log('    👥 Shared with multiple users');
  }

  async testDuplicateSharePrevention() {
    try {
      await axios.post(`${API_BASE}/notes/${this.sharedNote._id}/share`, {
        userId: this.userB.id,
        permission: 'read'
      }, {
        headers: { Authorization: `Bearer ${this.userA.token}` }
      });

      throw new Error('Duplicate sharing should have been prevented');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        return; // Expected behavior
      }
      throw error;
    }
  }

  async testNonOwnerCannotShare() {
    try {
      await axios.post(`${API_BASE}/notes/${this.sharedNote._id}/share`, {
        userId: this.userC.id,
        permission: 'read'
      }, {
        headers: { Authorization: `Bearer ${this.userB.token}` }
      });

      throw new Error('Non-owner should not be able to share note');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        return; // Expected behavior
      }
      throw error;
    }
  }

  async testOwnerCanRemoveSharing() {
    const response = await axios.delete(
      `${API_BASE}/notes/${this.sharedNote._id}/share/${this.userC.id}`,
      { headers: { Authorization: `Bearer ${this.userA.token}` } }
    );

    const userCAccess = response.data.sharedWith.find(share => 
      share.user.toString() === this.userC.id
    );

    if (userCAccess) {
      throw new Error('User C should no longer have access');
    }

    console.log('    🚫 Removed sharing access for User C');
  }

  async testRemovedUserCannotAccessNote() {
    try {
      await axios.get(`${API_BASE}/notes/${this.sharedNote._id}`, {
        headers: { Authorization: `Bearer ${this.userC.token}` }
      });

      throw new Error('Removed user should not be able to access note');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        return; // Expected behavior
      }
      throw error;
    }
  }

  async testShareWithInvalidUser() {
    try {
      await axios.post(`${API_BASE}/notes/${this.sharedNote._id}/share`, {
        userId: 'invalid-user-id',
        permission: 'read'
      }, {
        headers: { Authorization: `Bearer ${this.userA.token}` }
      });

      throw new Error('Sharing with invalid user should have failed');
    } catch (error) {
      if (error.response && (error.response.status === 404 || error.response.status === 400)) {
        return; // Expected behavior
      }
      throw error;
    }
  }

  async testInvalidPermissionType() {
    try {
      await axios.post(`${API_BASE}/notes/${this.sharedNote._id}/share`, {
        userId: this.userC.id,
        permission: 'invalid-permission'
      }, {
        headers: { Authorization: `Bearer ${this.userA.token}` }
      });

      throw new Error('Invalid permission type should have failed');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        return; // Expected behavior
      }
      throw error;
    }
  }

  async testOnlyOwnerCanDeleteNote() {
    try {
      await axios.delete(`${API_BASE}/notes/${this.sharedNote._id}`, {
        headers: { Authorization: `Bearer ${this.userB.token}` }
      });

      throw new Error('Shared user should not be able to delete note');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        return; // Expected behavior
      }
      throw error;
    }
  }

  async run() {
    console.log('🤝 Testing Note Sharing APIs...\n');

    let passed = 0;
    let total = 0;

    // Setup users and shared note first
    await this.setupUsers();
    await this.setupSharedNote();

    const tests = [
      ['Share Note with Read Permission', () => this.testShareNoteWithReadPermission()],
      ['Shared User Can Read Note', () => this.testSharedUserCanReadNote()],
      ['Shared User Cannot Edit with Read Permission', () => this.testSharedUserCannotEditWithReadPermission()],
      ['Upgrade Permission to Write', () => this.testUpgradePermissionToWrite()],
      ['Shared User Can Edit with Write Permission', () => this.testSharedUserCanEditWithWritePermission()],
      ['Share with Multiple Users', () => this.testShareWithMultipleUsers()],
      ['Duplicate Share Prevention', () => this.testDuplicateSharePrevention()],
      ['Non-Owner Cannot Share', () => this.testNonOwnerCannotShare()],
      ['Owner Can Remove Sharing', () => this.testOwnerCanRemoveSharing()],
      ['Removed User Cannot Access Note', () => this.testRemovedUserCannotAccessNote()],
      ['Share with Invalid User (Should Fail)', () => this.testShareWithInvalidUser()],
      ['Invalid Permission Type (Should Fail)', () => this.testInvalidPermissionType()],
      ['Only Owner Can Delete Note', () => this.testOnlyOwnerCanDeleteNote()]
    ];

    for (const [name, testFn] of tests) {
      total++;
      if (await this.runTest(name, testFn)) {
        passed++;
      }
    }

    console.log(`\n📊 Sharing Test Results: ${passed}/${total} passed`);
    
    return {
      success: passed === total,
      passed,
      total,
      results: this.testResults,
      users: { userA: this.userA, userB: this.userB, userC: this.userC }
    };
  }
}

module.exports = async function testSharing() {
  const tester = new SharingTester();
  return await tester.run();
};
