import { FullConfig } from '@playwright/test'

async function globalTeardown(config: FullConfig) {
  console.log('🏁 Starting E2E Test Teardown...')
  
  const fs = require('fs')
  const path = require('path')
  
  const testResultsDir = path.join(__dirname, '..', 'test-results')
  const sessionFile = path.join(testResultsDir, 'test-session.json')
  
  if (fs.existsSync(sessionFile)) {
    // Update session info with end time
    const sessionData = JSON.parse(fs.readFileSync(sessionFile, 'utf8'))
    sessionData.endTime = new Date().toISOString()
    
    // Calculate total duration
    const startTime = new Date(sessionData.startTime)
    const endTime = new Date(sessionData.endTime)
    sessionData.duration = endTime.getTime() - startTime.getTime()
    sessionData.durationFormatted = `${Math.round(sessionData.duration / 1000)}s`
    
    fs.writeFileSync(sessionFile, JSON.stringify(sessionData, null, 2))
    
    console.log(`⏱️  Total test session duration: ${sessionData.durationFormatted}`)
  }
  
  // Generate test summary
  try {
    const reportDir = path.join(testResultsDir, 'playwright-report')
    const resultsFile = path.join(testResultsDir, 'test-results.json')
    
    if (fs.existsSync(resultsFile)) {
      const results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'))
      
      console.log('📊 Test Results Summary:')
      console.log(`- Total Tests: ${results.stats?.expected || 'N/A'}`)
      console.log(`- Passed: ${results.stats?.passed || 'N/A'}`)
      console.log(`- Failed: ${results.stats?.failed || 'N/A'}`)
      console.log(`- Skipped: ${results.stats?.skipped || 'N/A'}`)
      
      if (results.stats?.failed > 0) {
        console.log('❌ Some tests failed. Check the HTML report for details.')
      } else {
        console.log('✅ All tests passed!')
      }
    }
    
    if (fs.existsSync(reportDir)) {
      console.log(`📄 HTML Report available at: ${path.resolve(reportDir, 'index.html')}`)
    }
  } catch (error) {
    console.log('⚠️  Could not generate test summary:', error)
  }
  
  // Log artifacts location
  console.log(`📁 Test artifacts saved to: ${path.resolve(testResultsDir)}`)
  
  console.log('✅ Global teardown completed')
}

export default globalTeardown