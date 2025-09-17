import { FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting E2E Test Setup...')
  
  // Clear previous test results
  const fs = require('fs')
  const path = require('path')
  
  const testResultsDir = path.join(__dirname, '..', 'test-results')
  if (fs.existsSync(testResultsDir)) {
    console.log('🧹 Cleaning up previous test results...')
    fs.rmSync(testResultsDir, { recursive: true, force: true })
  }
  
  // Create fresh test results directory
  fs.mkdirSync(testResultsDir, { recursive: true })
  console.log('📁 Created test results directory')
  
  // Log test environment info
  console.log('🌍 Test Environment Information:')
  console.log(`- Base URL: ${config.use?.baseURL}`)
  console.log(`- Workers: ${config.workers}`)
  console.log(`- Retries: ${config.retries}`)
  console.log(`- Projects: ${config.projects.map(p => p.name).join(', ')}`)
  
  // Create test data directory if needed
  const testDataDir = path.join(testResultsDir, 'test-data')
  fs.mkdirSync(testDataDir, { recursive: true })
  
  // Log start time
  const startTime = new Date().toISOString()
  fs.writeFileSync(
    path.join(testResultsDir, 'test-session.json'),
    JSON.stringify({
      startTime,
      config: {
        baseURL: config.use?.baseURL,
        workers: config.workers,
        projects: config.projects.map(p => p.name)
      }
    }, null, 2)
  )
  
  console.log('✅ Global setup completed successfully')
}

export default globalSetup