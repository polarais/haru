#!/usr/bin/env ts-node

/**
 * Script to delete all diary entries from the database
 * 
 * Usage:
 * npx ts-node scripts/delete-all-entries.ts [--permanent]
 * 
 * Options:
 * --permanent: Permanently delete entries (cannot be undone)
 * (default): Soft delete entries (can be recovered by setting is_deleted=false)
 */

import { DiaryAPI } from '../lib/diary-api'

async function main() {
  const args = process.argv.slice(2)
  const isPermanent = args.includes('--permanent')

  console.log('🗑️  Diary Entry Deletion Script')
  console.log('================================')
  
  if (isPermanent) {
    console.log('⚠️  WARNING: This will PERMANENTLY delete all entries!')
    console.log('⚠️  This action CANNOT be undone!')
  } else {
    console.log('ℹ️  This will soft-delete all entries (can be recovered)')
  }

  console.log('\nStarting deletion process...')

  try {
    let result
    
    if (isPermanent) {
      result = await DiaryAPI.permanentlyDeleteAllEntries()
    } else {
      result = await DiaryAPI.deleteAllEntries()
    }

    if (result.error) {
      console.error('❌ Error:', result.error)
      process.exit(1)
    }

    const deletedCount = result.data?.deletedCount || 0
    
    if (deletedCount === 0) {
      console.log('ℹ️  No entries found to delete.')
    } else {
      console.log(`✅ Successfully ${isPermanent ? 'permanently ' : ''}deleted ${deletedCount} entries.`)
    }

    console.log('\n🎉 Deletion process completed!')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  }
}

// Run the script
main().catch(console.error)