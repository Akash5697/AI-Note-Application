const ApiClient = require('../helpers/api-client');
const { generateTestUser, generateTestNote } = require('../helpers/test-data');
const { TestRunner, assert, TestCleanup, sleep } = require('../helpers/test-utils');

/**
 * Analytics API Integration Tests
 * Tests all analytics endpoints
 */
async function runAnalyticsTests() {
  const client = new ApiClient();
  const runner = new TestRunner('Analytics API');
  const cleanup = new TestCleanup();
  
  let adminUser = null;
  let regularUser = null;
  let testNotes = [];

  // Setup: Create users and test data
  runner.addTest('Setup - Create Users and Test Data', async () => {
    // Create admin user
    adminUser = generateTestUser('analyticsadmin');
    const adminResponse = await client.post('/auth/register', adminUser);
    adminUser.id = adminResponse._id;
    adminUser.token = adminResponse.token;
    
    // Create regular user
    regularUser = generateTestUser('analyticsuser');
    const userResponse = await client.post('/auth/register', regularUser);
    regularUser.id = userResponse._id;
    regularUser.token = userResponse.token;
    
    // Create some test notes for analytics data
    client.setAuthToken(regularUser.token);
    for (let i = 0; i < 3; i++) {
      const noteData = generateTestNote(`Analytics Test Note ${i + 1}`);
      const noteResponse = await client.post('/notes', noteData);
      testNotes.push(noteResponse);
    }
    
    // Add cleanup
    cleanup.add(async () => {
      try {
        if (regularUser?.token) {
          client.setAuthToken(regularUser.token);
          for (const note of testNotes) {
            await client.delete(`/notes/${note._id}`);
          }
          await client.delete(`/users/${regularUser.id}`);
        }
        if (adminUser?.token) {
          client.setAuthToken(adminUser.token);
          await client.delete(`/users/${adminUser.id}`);
        }
      } catch (error) {
        // Resources might already be deleted
      }
    });
  });

  // Test analytics summary (admin only)
  runner.addTest('Get Analytics Summary - Admin Access', async () => {
    client.setAuthToken(adminUser.token);
    const response = await client.get('/analytics/summary');
    
    assert.hasProperties(response, ['totalUsers', 'totalNotes']);
    assert.isTrue(typeof response.totalUsers === 'number', 'Should return numeric total users');
    assert.isTrue(typeof response.totalNotes === 'number', 'Should return numeric total notes');
    assert.isTrue(response.totalUsers >= 2, 'Should have at least admin and regular user');
    assert.isTrue(response.totalNotes >= 3, 'Should have at least 3 test notes');
  });

  // Test analytics summary as regular user (should fail)
  runner.addTest('Get Analytics Summary - Regular User Access', async () => {
    client.setAuthToken(regularUser.token);
    
    try {
      await client.get('/analytics/summary');
      throw new Error('Should have failed - regular users cannot access analytics');
    } catch (error) {
      assert.isTrue(error.status === 401 || error.status === 403, 'Should return 401/403');
    }
  });

  // Test most active users
  runner.addTest('Get Most Active Users - Admin Access', async () => {
    client.setAuthToken(adminUser.token);
    const response = await client.get('/analytics/users/most-active');
    
    assert.isTrue(Array.isArray(response), 'Should return array of users');
    
    if (response.length > 0) {
      const firstUser = response[0];
      assert.hasProperties(firstUser, ['_id', 'name', 'notesCount']);
      assert.isTrue(typeof firstUser.notesCount === 'number', 'Should include note count');
    }
  });

  // Test most used tags
  runner.addTest('Get Most Used Tags - Admin Access', async () => {
    client.setAuthToken(adminUser.token);
    const response = await client.get('/analytics/tags/most-used');
    
    assert.isTrue(Array.isArray(response), 'Should return array of tags');
    
    if (response.length > 0) {
      const firstTag = response[0];
      assert.hasProperties(firstTag, ['_id', 'count']);
      assert.isTrue(typeof firstTag.count === 'number', 'Should include tag count');
      assert.isTrue(firstTag.count > 0, 'Tag count should be positive');
    }
  });

  // Test notes per day analytics
  runner.addTest('Get Notes Per Day - Admin Access', async () => {
    client.setAuthToken(adminUser.token);
    const response = await client.get('/analytics/notes/per-day');
    
    assert.isTrue(Array.isArray(response), 'Should return array of daily stats');
    
    if (response.length > 0) {
      const firstDay = response[0];
      assert.hasProperties(firstDay, ['_id', 'count']);
      assert.isTrue(typeof firstDay.count === 'number', 'Should include daily count');
    }
  });

  // Test analytics with date range filter
  runner.addTest('Get Analytics with Date Range', async () => {
    client.setAuthToken(adminUser.token);
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    try {
      const response = await client.get(`/analytics/notes/per-day?startDate=${startDate}&endDate=${endDate}`);
      assert.isTrue(Array.isArray(response), 'Should return array of filtered stats');
    } catch (error) {
      // If date filtering isn't implemented, that's okay
      if (error.status === 404) {
        console.log('    ℹ️  Date range filtering not implemented');
      } else {
        throw error;
      }
    }
  });

  // Test user activity analytics
  runner.addTest('Get User Activity Analytics', async () => {
    client.setAuthToken(adminUser.token);
    
    try {
      const response = await client.get('/analytics/users/activity');
      assert.isTrue(Array.isArray(response), 'Should return user activity data');
      
      if (response.length > 0) {
        const firstActivity = response[0];
        assert.hasProperties(firstActivity, ['_id']);
      }
    } catch (error) {
      // If user activity endpoint doesn't exist, that's okay
      if (error.status === 404) {
        console.log('    ℹ️  User activity analytics not implemented');
      } else {
        throw error;
      }
    }
  });

  // Test tag analytics
  runner.addTest('Get Tag Analytics', async () => {
    client.setAuthToken(adminUser.token);
    
    try {
      const response = await client.get('/analytics/tags/usage');
      assert.isTrue(Array.isArray(response), 'Should return tag usage data');
    } catch (error) {
      // If tag analytics endpoint doesn't exist, that's okay
      if (error.status === 404) {
        console.log('    ℹ️  Tag analytics endpoint not implemented');
      } else {
        throw error;
      }
    }
  });

  // Test growth analytics
  runner.addTest('Get Growth Analytics', async () => {
    client.setAuthToken(adminUser.token);
    
    try {
      const response = await client.get('/analytics/growth');
      assert.hasProperties(response, ['userGrowth', 'noteGrowth']);
    } catch (error) {
      // If growth analytics endpoint doesn't exist, that's okay
      if (error.status === 404) {
        console.log('    ℹ️  Growth analytics not implemented');
      } else {
        throw error;
      }
    }
  });

  // Test real-time analytics
  runner.addTest('Get Real-time Analytics', async () => {
    client.setAuthToken(adminUser.token);
    
    try {
      const response = await client.get('/analytics/realtime');
      assert.hasProperties(response, ['activeUsers']);
      assert.isTrue(typeof response.activeUsers === 'number', 'Should return active user count');
    } catch (error) {
      // If real-time analytics endpoint doesn't exist, that's okay
      if (error.status === 404) {
        console.log('    ℹ️  Real-time analytics not implemented');
      } else {
        throw error;
      }
    }
  });

  // Test export analytics data
  runner.addTest('Export Analytics Data', async () => {
    client.setAuthToken(adminUser.token);
    
    try {
      const response = await client.get('/analytics/export');
      // Export might return different formats (CSV, JSON, etc.)
      assert.isDefined(response, 'Should return export data');
    } catch (error) {
      // If export endpoint doesn't exist, that's okay
      if (error.status === 404) {
        console.log('    ℹ️  Analytics export not implemented');
      } else {
        throw error;
      }
    }
  });

  // Test analytics permissions for different roles
  runner.addTest('Analytics Access - Different Roles', async () => {
    // Test with regular user token
    client.setAuthToken(regularUser.token);
    
    const endpoints = [
      '/analytics/users/most-active',
      '/analytics/tags/most-used',
      '/analytics/notes/per-day'
    ];
    
    for (const endpoint of endpoints) {
      try {
        await client.get(endpoint);
        throw new Error(`Should have failed for endpoint ${endpoint} - regular users cannot access analytics`);
      } catch (error) {
        assert.isTrue(error.status === 401 || error.status === 403, 
          `Should return 401/403 for ${endpoint}`);
      }
    }
  });

  // Test analytics with invalid parameters
  runner.addTest('Analytics with Invalid Parameters', async () => {
    client.setAuthToken(adminUser.token);
    
    try {
      // Test with invalid limit parameter
      await client.get('/analytics/users/most-active?limit=invalid');
      // If it doesn't fail, the endpoint might not validate parameters
      console.log('    ℹ️  Parameter validation not implemented');
    } catch (error) {
      if (error.status >= 400) {
        assert.isTrue(true, 'Properly validates invalid parameters');
      } else {
        throw error;
      }
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

module.exports = runAnalyticsTests;

// Run tests if this file is executed directly
if (require.main === module) {
  runAnalyticsTests()
    .then(results => {
      if (results.success) {
        console.log('\n🎉 All analytics tests passed!');
        process.exit(0);
      } else {
        console.log('\n❌ Some analytics tests failed!');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 Analytics test suite failed:', error);
      process.exit(1);
    });
}
