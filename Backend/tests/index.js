const testAuth = require('./auth.test');
const testNotes = require('./notes.test');
const testUsers = require('./users.test');
const testRoles = require('./roles.test');
const testAnalytics = require('./analytics.test');
const testSharing = require('./sharing.test');

async function runAllTests() {
  console.log('🚀 Starting Complete API Test Suite\n');
  console.log('='.repeat(50));
  
  const startTime = Date.now();
  let passedTests = 0;
  let totalTests = 0;

  const tests = [
    { name: 'Authentication APIs', test: testAuth },
    { name: 'Notes APIs', test: testNotes },
    { name: 'Users APIs', test: testUsers },
    { name: 'Roles APIs', test: testRoles },
    { name: 'Sharing APIs', test: testSharing },
    { name: 'Analytics APIs', test: testAnalytics }
  ];

  for (const { name, test } of tests) {
    try {
      console.log(`\n📋 Running ${name} Tests...`);
      console.log('-'.repeat(30));
      
      const result = await test();
      if (result.success) {
        passedTests++;
        console.log(`✅ ${name} - All tests passed!`);
      } else {
        console.log(`❌ ${name} - Some tests failed!`);
      }
      totalTests++;
    } catch (error) {
      console.error(`❌ ${name} - Test suite failed:`, error.message);
      totalTests++;
    }
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Results Summary');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  console.log(`⏱️  Duration: ${duration}s`);
  console.log('='.repeat(50));

  if (passedTests === totalTests) {
    console.log('🎉 All test suites passed successfully!');
    process.exit(0);
  } else {
    console.log('⚠️  Some test suites failed. Please check the logs above.');
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled Promise Rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = runAllTests;
