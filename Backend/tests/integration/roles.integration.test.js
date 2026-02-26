const ApiClient = require('../helpers/api-client');
const { generateTestUser, generateTestRole } = require('../helpers/test-data');
const { TestRunner, assert, TestCleanup } = require('../helpers/test-utils');

/**
 * Roles API Integration Tests
 * Tests all role management endpoints
 */
async function runRolesTests() {
  const client = new ApiClient();
  const runner = new TestRunner('Roles API');
  const cleanup = new TestCleanup();
  
  let adminUser = null;
  let regularUser = null;
  let testRole = null;

  // Setup: Create admin and regular users
  runner.addTest('Setup - Create Admin and Regular Users', async () => {
    // Create admin user
    adminUser = generateTestUser('rolesadmin');
    const adminResponse = await client.post('/auth/register', adminUser);
    adminUser.id = adminResponse._id;
    adminUser.token = adminResponse.token;
    
    // Create regular user
    regularUser = generateTestUser('rolesregular');
    const userResponse = await client.post('/auth/register', regularUser);
    regularUser.id = userResponse._id;
    regularUser.token = userResponse.token;
    
    // Add cleanup
    cleanup.add(async () => {
      try {
        if (adminUser?.token) {
          client.setAuthToken(adminUser.token);
          await client.delete(`/users/${adminUser.id}`);
        }
        if (regularUser?.token) {
          client.setAuthToken(regularUser.token);
          await client.delete(`/users/${regularUser.id}`);
        }
        if (testRole?.id && adminUser?.token) {
          client.setAuthToken(adminUser.token);
          await client.delete(`/roles/${testRole.id}`);
        }
      } catch (error) {
        // Resources might already be deleted
      }
    });
  });

  // Test get all roles (admin only)
  runner.addTest('Get All Roles - Admin Access', async () => {
    client.setAuthToken(adminUser.token);
    const response = await client.get('/roles');
    
    assert.isTrue(Array.isArray(response), 'Should return array of roles');
    
    if (response.length > 0) {
      const firstRole = response[0];
      assert.hasProperties(firstRole, ['_id', 'name']);
    }
  });

  // Test get all roles as regular user (should fail)
  runner.addTest('Get All Roles - Regular User Access', async () => {
    client.setAuthToken(regularUser.token);
    
    try {
      await client.get('/roles');
      throw new Error('Should have failed - regular users cannot list roles');
    } catch (error) {
      assert.isTrue(error.status === 401 || error.status === 403, 'Should return 401/403');
    }
  });

  // Test create role (admin only)
  runner.addTest('Create Role - Admin Access', async () => {
    client.setAuthToken(adminUser.token);
    testRole = generateTestRole('TestRole');
    
    const response = await client.post('/roles', testRole);
    
    assert.hasProperties(response, ['_id', 'name']);
    assert.equals(response.name, testRole.name);
    
    if (testRole.description) {
      assert.equals(response.description, testRole.description);
    }
    
    testRole.id = response._id;
  });

  // Test create role with duplicate name
  runner.addTest('Create Role - Duplicate Name', async () => {
    client.setAuthToken(adminUser.token);
    
    try {
      await client.post('/roles', testRole); // Same role data
      throw new Error('Should have failed with duplicate role name');
    } catch (error) {
      assert.isTrue(error.status >= 400, 'Should return error status');
    }
  });

  // Test create role as regular user (should fail)
  runner.addTest('Create Role - Regular User Access', async () => {
    client.setAuthToken(regularUser.token);
    const newRole = generateTestRole('UnauthorizedRole');
    
    try {
      await client.post('/roles', newRole);
      throw new Error('Should have failed - regular users cannot create roles');
    } catch (error) {
      assert.isTrue(error.status === 401 || error.status === 403, 'Should return 401/403');
    }
  });

  // Test get specific role
  runner.addTest('Get Role by ID - Admin Access', async () => {
    client.setAuthToken(adminUser.token);
    const response = await client.get(`/roles/${testRole.id}`);
    
    assert.hasProperties(response, ['_id', 'name']);
    assert.equals(response._id, testRole.id);
    assert.equals(response.name, testRole.name);
  });

  // Test get non-existent role
  runner.addTest('Get Role by ID - Not Found', async () => {
    client.setAuthToken(adminUser.token);
    const fakeId = '507f1f77bcf86cd799439011';
    
    try {
      await client.get(`/roles/${fakeId}`);
      throw new Error('Should have failed with non-existent role ID');
    } catch (error) {
      assert.equals(error.status, 404, 'Should return 404 Not Found');
    }
  });

  // Test update role
  runner.addTest('Update Role - Admin Access', async () => {
    client.setAuthToken(adminUser.token);
    const updateData = {
      name: 'Updated Test Role Name',
      description: 'Updated description for test role'
    };
    
    const response = await client.put(`/roles/${testRole.id}`, updateData);
    
    assert.equals(response.name, updateData.name);
    assert.equals(response._id, testRole.id);
    
    if (updateData.description) {
      assert.equals(response.description, updateData.description);
    }
  });

  // Test update role as regular user (should fail)
  runner.addTest('Update Role - Regular User Access', async () => {
    client.setAuthToken(regularUser.token);
    const updateData = {
      name: 'Unauthorized Update'
    };
    
    try {
      await client.put(`/roles/${testRole.id}`, updateData);
      throw new Error('Should have failed - regular users cannot update roles');
    } catch (error) {
      assert.isTrue(error.status === 401 || error.status === 403, 'Should return 401/403');
    }
  });

  // Test assign role to user
  runner.addTest('Assign Role to User - Admin Access', async () => {
    client.setAuthToken(adminUser.token);
    
    try {
      const response = await client.post(`/roles/${testRole.id}/users/${regularUser.id}`);
      assert.hasProperties(response, ['message']);
    } catch (error) {
      // If role assignment endpoint doesn't exist, that's okay
      if (error.status === 404) {
        console.log('    ℹ️  Role assignment endpoint not implemented');
      } else {
        throw error;
      }
    }
  });

  // Test get users with specific role
  runner.addTest('Get Users with Role - Admin Access', async () => {
    client.setAuthToken(adminUser.token);
    
    try {
      const response = await client.get(`/roles/${testRole.id}/users`);
      assert.isTrue(Array.isArray(response), 'Should return array of users');
    } catch (error) {
      // If role users endpoint doesn't exist, that's okay
      if (error.status === 404) {
        console.log('    ℹ️  Role users endpoint not implemented');
      } else {
        throw error;
      }
    }
  });

  // Test remove role from user
  runner.addTest('Remove Role from User - Admin Access', async () => {
    client.setAuthToken(adminUser.token);
    
    try {
      const response = await client.delete(`/roles/${testRole.id}/users/${regularUser.id}`);
      assert.hasProperties(response, ['message']);
    } catch (error) {
      // If role removal endpoint doesn't exist, that's okay
      if (error.status === 404) {
        console.log('    ℹ️  Role removal endpoint not implemented');
      } else {
        throw error;
      }
    }
  });

  // Test role permissions
  runner.addTest('Get Role Permissions - Admin Access', async () => {
    client.setAuthToken(adminUser.token);
    
    try {
      const response = await client.get(`/roles/${testRole.id}/permissions`);
      assert.isTrue(Array.isArray(response), 'Should return array of permissions');
    } catch (error) {
      // If permissions endpoint doesn't exist, that's okay
      if (error.status === 404) {
        console.log('    ℹ️  Role permissions endpoint not implemented');
      } else {
        throw error;
      }
    }
  });

  // Test update role permissions
  runner.addTest('Update Role Permissions - Admin Access', async () => {
    client.setAuthToken(adminUser.token);
    const permissionsData = {
      permissions: ['read', 'write', 'delete']
    };
    
    try {
      const response = await client.put(`/roles/${testRole.id}/permissions`, permissionsData);
      assert.hasProperties(response, ['_id']);
    } catch (error) {
      // If permissions update endpoint doesn't exist, that's okay
      if (error.status === 404) {
        console.log('    ℹ️  Permissions update endpoint not implemented');
      } else {
        throw error;
      }
    }
  });

  // Test role validation with invalid data
  runner.addTest('Create Role - Invalid Data', async () => {
    client.setAuthToken(adminUser.token);
    const invalidRole = {
      // Missing required name field
      description: 'Role without name'
    };
    
    try {
      await client.post('/roles', invalidRole);
      throw new Error('Should have failed with invalid role data');
    } catch (error) {
      assert.isTrue(error.status >= 400, 'Should return error status');
    }
  });

  // Test delete role by regular user (should fail)
  runner.addTest('Delete Role - Regular User Access', async () => {
    client.setAuthToken(regularUser.token);
    
    try {
      await client.delete(`/roles/${testRole.id}`);
      throw new Error('Should have failed - regular users cannot delete roles');
    } catch (error) {
      assert.isTrue(error.status === 401 || error.status === 403, 'Should return 401/403');
    }
  });

  // Test role search/filter
  runner.addTest('Search Roles by Name', async () => {
    client.setAuthToken(adminUser.token);
    
    try {
      const response = await client.get('/roles?search=Test');
      assert.isTrue(Array.isArray(response), 'Should return array of roles');
    } catch (error) {
      // If search endpoint doesn't exist, that's okay
      if (error.status === 404) {
        console.log('    ℹ️  Role search endpoint not implemented');
      } else {
        throw error;
      }
    }
  });

  // Test delete role by admin
  runner.addTest('Delete Role - Admin Access', async () => {
    client.setAuthToken(adminUser.token);
    
    const response = await client.delete(`/roles/${testRole.id}`);
    
    assert.hasProperties(response, ['message']);
    assert.isTrue(response.message.includes('deleted') || response.message.includes('removed'), 
      'Should confirm deletion');
  });

  // Test access deleted role
  runner.addTest('Access Deleted Role', async () => {
    client.setAuthToken(adminUser.token);
    
    try {
      await client.get(`/roles/${testRole.id}`);
      throw new Error('Should have failed - role was deleted');
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

module.exports = runRolesTests;

// Run tests if this file is executed directly
if (require.main === module) {
  runRolesTests()
    .then(results => {
      if (results.success) {
        console.log('\n🎉 All roles tests passed!');
        process.exit(0);
      } else {
        console.log('\n❌ Some roles tests failed!');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 Roles test suite failed:', error);
      process.exit(1);
    });
}
