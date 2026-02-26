/**
 * Test data generators and mock objects for testing
 */

/**
 * Generate unique test user data
 */
function generateTestUser(prefix = 'testuser') {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  
  return {
    name: `Test User ${random}`,
    email: `${prefix}${timestamp}${random}@example.com`,
    password: 'password123'
  };
}

/**
 * Generate test admin user data
 */
function generateTestAdmin(prefix = 'testadmin') {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  
  return {
    name: `Test Admin ${random}`,
    email: `${prefix}${timestamp}${random}@example.com`,
    password: 'adminpass123'
  };
}

/**
 * Generate test note data
 */
function generateTestNote(title = 'Test Note') {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  
  return {
    title: `${title} ${random}`,
    content: `This is test content for note ${random}. Created at ${new Date().toISOString()}`,
    tags: ['test', 'automation', `tag${random}`]
  };
}

/**
 * Generate test role data
 */
function generateTestRole(name = 'TestRole') {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  
  return {
    name: `${name}${random}`,
    description: `Test role created for testing purposes ${random}`,
    permissions: ['read', 'write']
  };
}

/**
 * Mock API responses for testing
 */
const mockResponses = {
  successfulLogin: {
    _id: '507f1f77bcf86cd799439011',
    name: 'Test User',
    email: 'test@example.com',
    token: 'mock.jwt.token'
  },
  
  successfulRegistration: {
    _id: '507f1f77bcf86cd799439012',
    name: 'New User',
    email: 'newuser@example.com',
    token: 'mock.jwt.token'
  },
  
  healthCheck: {
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  },
  
  noteCreated: {
    _id: '507f1f77bcf86cd799439013',
    title: 'Test Note',
    content: 'Test content',
    tags: ['test'],
    user: '507f1f77bcf86cd799439011',
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
};

/**
 * Common test scenarios
 */
const testScenarios = {
  invalidCredentials: {
    email: 'invalid@example.com',
    password: 'wrongpassword'
  },
  
  invalidEmail: {
    email: 'not-an-email',
    password: 'password123'
  },
  
  missingFields: {
    email: 'test@example.com'
    // password intentionally missing
  },
  
  invalidNoteData: {
    title: '', // Empty title
    content: 'Some content',
    tags: []
  }
};

/**
 * Test configuration
 */
const testConfig = {
  timeout: 10000, // 10 seconds
  retries: 3,
  baseUrl: 'http://localhost:5000/api',
  healthUrl: 'http://localhost:5000/health'
};

module.exports = {
  generateTestUser,
  generateTestAdmin,
  generateTestNote,
  generateTestRole,
  mockResponses,
  testScenarios,
  testConfig
};
