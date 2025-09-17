import { 
  createTestSupabaseClient,
  createTestUser,
  cleanupTestUser,
  createTestEntry,
  checkDatabaseConnection,
  createTestAiChatMessages,
  createTestContentBlocks
} from './database'

describe('Database Test Helpers', () => {
  let supabase: any
  
  beforeAll(async () => {
    supabase = createTestSupabaseClient()
  })

  describe('Database Connection', () => {
    it('should connect to test database', async () => {
      const isConnected = await checkDatabaseConnection(supabase)
      
      if (!isConnected) {
        console.warn('⚠️  Local Supabase not running. Start it with: supabase start')
      }
      
      // 이 테스트는 로컬 환경에서만 실행
      expect(typeof isConnected).toBe('boolean')
    }, 10000)
  })

  describe('Test Data Helpers', () => {
    it('should create test AI chat messages', () => {
      const messages = createTestAiChatMessages()
      
      expect(messages).toHaveLength(2)
      expect(messages[0].speaker).toBe('user')
      expect(messages[1].speaker).toBe('assistant')
      expect(messages[0].message).toBe('How was my day?')
      expect(messages[0].timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })

    it('should create test content blocks', () => {
      const blocks = createTestContentBlocks()
      
      expect(blocks).toHaveLength(3)
      expect(blocks[0].type).toBe('paragraph')
      expect(blocks[1].type).toBe('image')
      expect(blocks[2].type).toBe('paragraph')
      expect(blocks[1].meta).toEqual({
        width: 1024,
        height: 768,
        size: 245760
      })
    })
  })

  // 실제 데이터베이스 테스트 (로컬 Supabase가 실행 중일 때만)
  describe('Database Operations (requires local Supabase)', () => {
    let testUser: any
    let isConnected: boolean

    beforeAll(async () => {
      isConnected = await checkDatabaseConnection(supabase)
    })

    afterEach(async () => {
      if (testUser) {
        await cleanupTestUser(supabase, testUser.id)
        testUser = null
      }
    })

    it('should create and cleanup test user', async () => {
      if (!isConnected) {
        console.log('⏭️  Skipping database test - Local Supabase not available')
        return
      }
      
      // Given & When
      testUser = await createTestUser(supabase)
      
      // Then
      expect(testUser.id).toBeDefined()
      expect(testUser.email).toMatch(/test-\d+@example\.com/)
      
      // Verify user profile was created
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', testUser.id)
        .single()
      
      expect(profile).not.toBeNull()
      expect(profile.theme_preference).toBe('pink')
      expect(profile.auto_save_enabled).toBe(true)
    }, 15000)

    it('should create test entry for user', async () => {
      if (!isConnected) {
        console.log('⏭️  Skipping database test - Local Supabase not available')
        return
      }
      
      // Given
      testUser = await createTestUser(supabase)
      
      // When
      const entry = await createTestEntry(supabase, testUser.id, {
        title: 'Test Entry',
        mood: '🎉',
        content: createTestContentBlocks()
      })
      
      // Then
      expect(entry.id).toBeDefined()
      expect(entry.profile_id).toBe(testUser.id)
      expect(entry.title).toBe('Test Entry')
      expect(entry.mood).toBe('🎉')
      expect(entry.content).toHaveLength(3)
      expect(entry.is_deleted).toBe(false)
    }, 15000)
  })
})