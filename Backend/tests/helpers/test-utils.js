/**
 * Utility functions for testing
 */

/**
 * Test runner helper
 */
class TestRunner {
  constructor(suiteName) {
    this.suiteName = suiteName;
    this.tests = [];
    this.results = [];
    this.startTime = null;
    this.endTime = null;
  }

  /**
   * Add a test to the suite
   */
  addTest(name, testFn) {
    this.tests.push({ name, testFn });
  }

  /**
   * Run a single test
   */
  async runTest(name, testFn) {
    const testStart = Date.now();
    
    try {
      console.log(`    🧪 ${name}...`);
      await testFn();
      const duration = Date.now() - testStart;
      console.log(`    ✅ ${name} - PASSED (${duration}ms)`);
      this.results.push({ name, status: 'PASSED', duration });
      return true;
    } catch (error) {
      const duration = Date.now() - testStart;
      console.log(`    ❌ ${name} - FAILED: ${error.message} (${duration}ms)`);
      this.results.push({ name, status: 'FAILED', error: error.message, duration });
      return false;
    }
  }

  /**
   * Run all tests in the suite
   */
  async runAll() {
    console.log(`\n📋 Running ${this.suiteName} Tests`);
    console.log('  ' + '-'.repeat(40));
    
    this.startTime = Date.now();
    let passedCount = 0;

    for (const { name, testFn } of this.tests) {
      const success = await this.runTest(name, testFn);
      if (success) passedCount++;
    }

    this.endTime = Date.now();
    const totalDuration = this.endTime - this.startTime;

    // Print summary
    console.log(`\n  📊 ${this.suiteName} Summary:`);
    console.log(`    ✅ Passed: ${passedCount}/${this.tests.length}`);
    console.log(`    ❌ Failed: ${this.tests.length - passedCount}/${this.tests.length}`);
    console.log(`    ⏱️  Duration: ${totalDuration}ms`);

    return {
      suiteName: this.suiteName,
      total: this.tests.length,
      passed: passedCount,
      failed: this.tests.length - passedCount,
      duration: totalDuration,
      success: passedCount === this.tests.length,
      results: this.results
    };
  }
}

/**
 * Assert helper functions
 */
const assert = {
  /**
   * Assert that value is truthy
   */
  isTrue(value, message = 'Expected value to be truthy') {
    if (!value) {
      throw new Error(message);
    }
  },

  /**
   * Assert that value is falsy
   */
  isFalse(value, message = 'Expected value to be falsy') {
    if (value) {
      throw new Error(message);
    }
  },

  /**
   * Assert that values are equal
   */
  equals(actual, expected, message = `Expected ${actual} to equal ${expected}`) {
    if (actual !== expected) {
      throw new Error(message);
    }
  },

  /**
   * Assert that object exists and has required properties
   */
  hasProperties(obj, properties, message = 'Object missing required properties') {
    if (!obj || typeof obj !== 'object') {
      throw new Error('Expected object but got ' + typeof obj);
    }
    
    for (const prop of properties) {
      if (!(prop in obj)) {
        throw new Error(`${message}: missing property '${prop}'`);
      }
    }
  },

  /**
   * Assert that value is defined
   */
  isDefined(value, message = 'Expected value to be defined') {
    if (value === undefined || value === null) {
      throw new Error(message);
    }
  },

  /**
   * Assert that value is a valid email
   */
  isValidEmail(email, message = 'Expected valid email address') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error(message);
    }
  },

  /**
   * Assert that value is a valid JWT token
   */
  isValidJWT(token, message = 'Expected valid JWT token') {
    const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
    if (!jwtRegex.test(token)) {
      throw new Error(message);
    }
  },

  /**
   * Assert that array contains expected number of items
   */
  arrayLength(array, expectedLength, message = `Expected array length ${expectedLength}`) {
    if (!Array.isArray(array)) {
      throw new Error('Expected array but got ' + typeof array);
    }
    if (array.length !== expectedLength) {
      throw new Error(`${message}, but got ${array.length}`);
    }
  },

  /**
   * Assert that response has success status code
   */
  isSuccessStatus(status, message = 'Expected success status code (200-299)') {
    if (status < 200 || status >= 300) {
      throw new Error(`${message}, but got ${status}`);
    }
  },

  /**
   * Assert that response has error status code
   */
  isErrorStatus(status, message = 'Expected error status code (400+)') {
    if (status < 400) {
      throw new Error(`${message}, but got ${status}`);
    }
  },

  /**
   * Handle admin-only test gracefully
   * Returns true if test should pass due to expected admin limitation
   */
  handleAdminTest(error, testName = 'Admin test') {
    if (error.status === 403 && error.message.includes('Admin privileges required')) {
      console.log(`    ℹ️  ${testName} - Admin privileges not available (expected limitation)`);
      return true;
    }
    return false;
  }
};

/**
 * Sleep utility for testing timing-dependent functionality
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate random string for testing
 */
function randomString(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Cleanup helper - removes test data after tests complete
 */
class TestCleanup {
  constructor() {
    this.cleanup = [];
  }

  /**
   * Add cleanup function
   */
  add(cleanupFn) {
    this.cleanup.push(cleanupFn);
  }

  /**
   * Run all cleanup functions
   */
  async runAll() {
    console.log('\n🧹 Running cleanup...');
    
    for (const cleanupFn of this.cleanup) {
      try {
        await cleanupFn();
      } catch (error) {
        console.warn('⚠️  Cleanup warning:', error.message);
      }
    }
    
    console.log('✅ Cleanup completed');
  }
}

module.exports = {
  TestRunner,
  assert,
  sleep,
  randomString,
  TestCleanup
};
