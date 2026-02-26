#!/usr/bin/env node

/**
 * Master Test Runner
 * Organizes and runs all types of tests
 */

const path = require('path');
const fs = require('fs');

// Import test suites
const runIntegrationTests = require('./integration/all-tests');

async function runAllTests() {
  console.log('🧪 NOTES APP - COMPLETE TEST SUITE');
  console.log('='.repeat(70));
  console.log('🕐 Started at:', new Date().toISOString());
  console.log('📍 Environment: Testing');
  console.log('🌐 API Base URL: http://localhost:5000/api');
  console.log('='.repeat(70));

  const startTime = Date.now();
  const allResults = [];

  try {
    // Check if server is running
    console.log('\n🔍 Pre-flight Checks...');
    console.log('  ⚡ Checking if server is running...');
    
    const ApiClient = require('./helpers/api-client');
    const client = new ApiClient();
    
    try {
      await client.healthCheck();
      console.log('  ✅ Server is running and healthy');
    } catch (error) {
      console.log('  ❌ Server is not running or not healthy');
      console.log('  💡 Please start the server first:');
      console.log('     cd Backend && npm start');
      process.exit(1);
    }

    // Run Integration Tests
    console.log('\n🧪 INTEGRATION TESTS');
    console.log('='.repeat(50));
    const integrationResults = await runIntegrationTests();
    allResults.push({
      type: 'Integration Tests',
      ...integrationResults
    });

    // Future: Add Unit Tests
    console.log('\n📝 UNIT TESTS');
    console.log('='.repeat(50));
    console.log('  ℹ️  Unit tests not implemented yet');
    console.log('  💡 Consider adding unit tests for:');
    console.log('     - Utility functions');
    console.log('     - Middleware validation');
    console.log('     - Model methods');
    console.log('     - Helper functions');

    // Future: Add Performance Tests
    console.log('\n⚡ PERFORMANCE TESTS');
    console.log('='.repeat(50));
    console.log('  ℹ️  Performance tests not implemented yet');
    console.log('  💡 Consider adding performance tests for:');
    console.log('     - API response times');
    console.log('     - Database query performance');
    console.log('     - Concurrent user handling');
    console.log('     - Memory usage');

    // Calculate overall results
    const endTime = Date.now();
    const totalDuration = ((endTime - startTime) / 1000).toFixed(2);
    
    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;
    let overallSuccess = true;

    allResults.forEach(result => {
      if (result.summary) {
        totalTests += result.summary.totalTests;
        totalPassed += result.summary.totalPassed;
        totalFailed += result.summary.totalFailed;
        if (!result.success) overallSuccess = false;
      }
    });

    // Final Summary
    console.log('\n' + '='.repeat(70));
    console.log('🏁 FINAL TEST RESULTS');
    console.log('='.repeat(70));
    
    allResults.forEach(result => {
      const status = result.success ? '✅' : '❌';
      const summary = result.summary || {};
      console.log(`${status} ${result.type.padEnd(20)} ${summary.totalPassed || 0}/${summary.totalTests || 0} tests passed`);
    });
    
    console.log('-'.repeat(70));
    console.log(`📊 Overall Results:`);
    console.log(`   🎯 Total Tests: ${totalTests}`);
    console.log(`   ✅ Passed: ${totalPassed} (${((totalPassed / totalTests) * 100).toFixed(1)}%)`);
    console.log(`   ❌ Failed: ${totalFailed} (${((totalFailed / totalTests) * 100).toFixed(1)}%)`);
    console.log(`   ⏱️  Duration: ${totalDuration}s`);
    console.log(`   🕐 Completed: ${new Date().toISOString()}`);
    
    if (overallSuccess) {
      console.log('\n🎉 ALL TESTS PASSED! YOUR API IS WORKING PERFECTLY! 🎉');
      console.log('✨ Great job! Your Notes App API is robust and reliable.');
    } else {
      console.log('\n⚠️  SOME TESTS FAILED');
      console.log('💡 Please review the detailed logs above for specific failures.');
      console.log('🔧 Fix the issues and run the tests again.');
    }
    
    console.log('='.repeat(70));

    // Generate test report file
    const reportPath = path.join(__dirname, 'test-report.json');
    const report = {
      timestamp: new Date().toISOString(),
      duration: totalDuration,
      results: allResults,
      summary: {
        totalTests,
        totalPassed,
        totalFailed,
        successRate: (totalPassed / totalTests) * 100,
        overallSuccess
      }
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Test report saved to: ${reportPath}`);

    process.exit(overallSuccess ? 0 : 1);

  } catch (error) {
    console.error('\n💥 Test runner failed:', error);
    process.exit(1);
  }
}

// Handle signals
process.on('SIGINT', () => {
  console.log('\n⏹️  Test run interrupted by user');
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n⏹️  Test run terminated');
  process.exit(1);
});

// Run if executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = runAllTests;
