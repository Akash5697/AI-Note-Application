const ApiClient = require('../helpers/api-client');
const { generateTestUser, generateTestAdmin, testScenarios } = require('../helpers/test-data');
const { TestRunner, assert, TestCleanup } = require('../helpers/test-utils');

/**
 * Authentication API Integration Tests
 * Tests all auth endpoints with various scenarios
 */
async function runAuthTests() {
  const client = new ApiClient();
  const runner = new TestRunner('Authentication API');
  const cleanup = new TestCleanup();
  
  let testUser = null;
  let adminUser = null;

  // Test server health
  runner.addTest('Server Health Check', async () => {
    const health = await client.healthCheck();
    assert.hasProperties(health, ['status', 'message']);
    assert.equals(health.status, 'OK');
  });

  // Test user registration
  runner.addTest('User Registration - Valid Data', async () => {
    testUser = generateTestUser();
    const response = await client.post('/auth/register', testUser);
    
    assert.hasProperties(response, ['_id', 'name', 'email', 'token']);
    assert.equals(response.name, testUser.name);
    assert.equals(response.email, testUser.email);
    assert.isValidJWT(response.token);
    
    testUser.id = response._id;
    testUser.token = response.token;
    
    // Add cleanup
    cleanup.add(async () => {
      if (testUser?.token) {
        try {
          client.setAuthToken(testUser.token);
          await client.delete(`/users/${testUser.id}`);
        } catch (error) {
          // User might already be deleted
        }
      }
    });
  });

  // Test registration with invalid data
  runner.addTest('User Registration - Invalid Email', async () => {
    try {
      await client.post('/auth/register', testScenarios.invalidEmail);
      throw new Error('Should have failed with invalid email');
    } catch (error) {
      assert.isTrue(error.status >= 400, 'Should return error status');
    }
  });

  runner.addTest('User Registration - Missing Fields', async () => {
    try {
      await client.post('/auth/register', testScenarios.missingFields);
      throw new Error('Should have failed with missing fields');
    } catch (error) {
      assert.isTrue(error.status >= 400, 'Should return error status');
    }
  });

  // Test duplicate registration
  runner.addTest('User Registration - Duplicate Email', async () => {
    try {
      await client.post('/auth/register', testUser);
      throw new Error('Should have failed with duplicate email');
    } catch (error) {
      assert.isTrue(error.status >= 400, 'Should return error status');
    }
  });

  // Test user login
  runner.addTest('User Login - Valid Credentials', async () => {
    const loginData = {
      email: testUser.email,
      password: testUser.password
    };
    
    const response = await client.post('/auth/login', loginData);
    
    assert.hasProperties(response, ['_id', 'name', 'email', 'token']);
    assert.equals(response._id, testUser.id);
    assert.equals(response.email, testUser.email);
    assert.isValidJWT(response.token);
  });

  // Test login with invalid credentials
  runner.addTest('User Login - Invalid Credentials', async () => {
    try {
      await client.post('/auth/login', testScenarios.invalidCredentials);
      throw new Error('Should have failed with invalid credentials');
    } catch (error) {
      assert.isTrue(error.status >= 400, 'Should return error status');
    }
  });

  // Test protected endpoint
  runner.addTest('Get Current User - With Token', async () => {
    client.setAuthToken(testUser.token);
    const response = await client.get('/auth/me');
    
    assert.hasProperties(response, ['_id', 'name', 'email']);
    assert.equals(response._id, testUser.id);
    assert.equals(response.email, testUser.email);
  });

  // Test protected endpoint without token
  runner.addTest('Get Current User - Without Token', async () => {
    client.setAuthToken(null);
    
    try {
      await client.get('/auth/me');
      throw new Error('Should have failed without token');
    } catch (error) {
      assert.equals(error.status, 401, 'Should return 401 Unauthorized');
    }
  });

  // Test protected endpoint with invalid token
  runner.addTest('Get Current User - Invalid Token', async () => {
    client.setAuthToken('invalid.jwt.token');
    
    try {
      await client.get('/auth/me');
      throw new Error('Should have failed with invalid token');
    } catch (error) {
      assert.isTrue(error.status >= 400, 'Should return error status');
    }
  });

  // Test logout (if endpoint exists)
  runner.addTest('User Logout', async () => {
    client.setAuthToken(testUser.token);
    
    try {
      const response = await client.post('/auth/logout');
      // Logout might not return specific data, just check it doesn't error
      assert.isTrue(true, 'Logout completed without error');
    } catch (error) {
      // If logout endpoint doesn't exist, that's okay
      if (error.status === 404) {
        console.log('    ℹ️  Logout endpoint not implemented');
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

module.exports = runAuthTests;

// Run tests if this file is executed directly
if (require.main === module) {
  runAuthTests()
    .then(results => {
      if (results.success) {
        console.log('\n🎉 All authentication tests passed!');
        process.exit(0);
      } else {
        console.log('\n❌ Some authentication tests failed!');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 Authentication test suite failed:', error);
      process.exit(1);
    });
}
