/**
 * Complete API Integration Test Suite
 * Runs all integration tests in proper order
 */

const runAuthTests = require('./auth.integration.test');
const runNotesTests = require('./notes.integration.test');
const runUsersTests = require('./users.integration.test');
const runRolesTests = require('./roles.integration.test');
const runAnalyticsTests = require('./analytics.integration.test');

async function runAllIntegrationTests() {
  console.log('🚀 Starting Complete API Integration Test Suite');
  console.log('=' * 60);
  
  const startTime = Date.now();
  const results = [];

  const testSuites = [
    { name: 'Authentication API', test: runAuthTests },
    { name: 'Notes API', test: runNotesTests },
    { name: 'Users API', test: runUsersTests },
    { name: 'Roles API', test: runRolesTests },
    { name: 'Analytics API', test: runAnalyticsTests }
  ];

  let totalPassed = 0;
  let totalFailed = 0;
  let totalTests = 0;

  for (const { name, test } of testSuites) {
    try {
      console.log(`\n🧪 Running ${name} Integration Tests...`);
      console.log('-'.repeat(50));
      
      const result = await test();
      results.push({ name, ...result });
      
      totalPassed += result.passed;
      totalFailed += result.failed;
      totalTests += result.total;
      
      if (result.success) {
        console.log(`✅ ${name} - All tests passed! (${result.passed}/${result.total})`);
      } else {
        console.log(`❌ ${name} - Some tests failed! (${result.passed}/${result.total})`);
      }
    } catch (error) {
      console.error(`💥 ${name} - Test suite failed:`, error.message);
      results.push({ 
        name, 
        success: false, 
        error: error.message,
        passed: 0,
        failed: 1,
        total: 1
      });
      totalFailed += 1;
      totalTests += 1;
    }
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  // Print comprehensive summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 INTEGRATION TESTS SUMMARY');
  console.log('='.repeat(60));
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const passRate = result.total > 0 ? `${result.passed}/${result.total}` : '0/0';
    console.log(`${status} ${result.name.padEnd(25)} ${passRate.padStart(8)} tests`);
  });
  
  console.log('-'.repeat(60));
  console.log(`📈 Total Passed: ${totalPassed}/${totalTests} tests`);
  console.log(`📉 Total Failed: ${totalFailed}/${totalTests} tests`);
  console.log(`⏱️  Total Duration: ${duration}s`);
  console.log(`📊 Success Rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%`);
  console.log('='.repeat(60));

  const overallSuccess = totalFailed === 0;
  
  if (overallSuccess) {
    console.log('🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY!');
    console.log('✨ Your API is working correctly across all endpoints!');
  } else {
    console.log('⚠️  SOME INTEGRATION TESTS FAILED!');
    console.log('💡 Please check the detailed logs above for failure information.');
  }

  return {
    success: overallSuccess,
    results,
    summary: {
      totalTests,
      totalPassed,
      totalFailed,
      duration: parseFloat(duration),
      successRate: (totalPassed / totalTests) * 100
    }
  };
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
  runAllIntegrationTests()
    .then(results => {
      if (results.success) {
        process.exit(0);
      } else {
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 Integration test runner failed:', error);
      process.exit(1);
    });
}

module.exports = runAllIntegrationTests;
