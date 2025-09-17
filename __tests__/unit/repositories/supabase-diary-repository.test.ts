import { SupabaseDiaryRepository } from '@/lib/repositories/supabase-diary-repository'
import { 
  createTestSupabaseClient,
  createTestUser,
  cleanupTestUser,
  createTestEntry,
  checkDatabaseConnection,
  createTestContentBlocks
} from '@/__tests__/helpers/database'
import { CreateDiaryEntryData } from '@/lib/types/diary'

// Mock user service
const createMockUserService = (user: any) => ({
  getCurrentUser: jest.fn().mockResolvedValue(user)
})

describe('SupabaseDiaryRepository', () => {
  let supabase: any
  let repository: SupabaseDiaryRepository
  let testUser: any
  let isConnected: boolean

  beforeAll(async () => {
    supabase = createTestSupabaseClient()
    isConnected = await checkDatabaseConnection(supabase)
  })

  beforeEach(async () => {
    if (!isConnected) {
      console.log('⏭️  Skipping Supabase repository tests - Local Supabase not available')
      return
    }

    testUser = await createTestUser(supabase)
    const mockUserService = createMockUserService(testUser)
    repository = new SupabaseDiaryRepository(supabase, mockUserService)
  })

  afterEach(async () => {
    if (testUser) {
      await cleanupTestUser(supabase, testUser.id)
      testUser = null
    }
  })

  describe('getEntries', () => {
    it('should return empty array when user has no entries', async () => {
      if (!isConnected) return

      const result = await repository.getEntries()

      expect(result.data).toEqual([])
      expect(result.error).toBeNull()
    })

    it('should return user entries ordered by created_at desc', async () => {
      if (!isConnected) return

      // Given - 2개의 테스트 일기 생성
      await createTestEntry(supabase, testUser.id, {
        title: 'First Entry',
        mood: '😊',
        date: '2025-09-16'
      })
      
      // 약간의 지연으로 created_at 시간 차이 만들기
      await new Promise(resolve => setTimeout(resolve, 10))
      
      await createTestEntry(supabase, testUser.id, {
        title: 'Second Entry', 
        mood: '😢',
        date: '2025-09-17'
      })

      // When
      const result = await repository.getEntries()

      // Then
      expect(result.data).toHaveLength(2)
      expect(result.data![0].title).toBe('Second Entry') // 최신순
      expect(result.data![1].title).toBe('First Entry')
      expect(result.error).toBeNull()
    })

    it('should not return deleted entries', async () => {
      if (!isConnected) return

      // Given - 일기 생성 후 삭제
      const entry = await createTestEntry(supabase, testUser.id, {
        title: 'To be deleted',
        mood: '😊'
      })

      await supabase
        .from('diaries')
        .update({ is_deleted: true })
        .eq('id', entry.id)

      // When
      const result = await repository.getEntries()

      // Then
      expect(result.data).toEqual([])
      expect(result.error).toBeNull()
    })

    it('should return error when user not authenticated', async () => {
      if (!isConnected) return

      // Given - 인증되지 않은 사용자
      const mockUserService = createMockUserService(null)
      const unauthRepository = new SupabaseDiaryRepository(supabase, mockUserService)

      // When
      const result = await unauthRepository.getEntries()

      // Then
      expect(result.data).toBeNull()
      expect(result.error).toBe('User not authenticated')
    })
  })

  describe('createEntry', () => {
    it('should create entry with valid data', async () => {
      if (!isConnected) return

      const entryData: CreateDiaryEntryData = {
        date: '2025-09-17',
        mood: '🎉',
        title: 'Great Day!',
        content: createTestContentBlocks(),
        write_mode: 'journal'
      }

      // When
      const result = await repository.createEntry(entryData)

      // Then
      expect(result.data).not.toBeNull()
      expect(result.data!.profile_id).toBe(testUser.id)
      expect(result.data!.date).toBe('2025-09-17')
      expect(result.data!.mood).toBe('🎉')
      expect(result.data!.title).toBe('Great Day!')
      expect(result.data!.content).toHaveLength(3)
      expect(result.data!.write_mode).toBe('journal')
      expect(result.data!.is_deleted).toBe(false)
      expect(result.error).toBeNull()
    })

    it('should enforce daily entry limit (3 entries per day)', async () => {
      if (!isConnected) return

      const date = '2025-09-17'
      
      // Given - 이미 3개의 일기가 있는 날짜
      for (let i = 1; i <= 3; i++) {
        await createTestEntry(supabase, testUser.id, {
          title: `Entry ${i}`,
          date: date,
          mood: '😊'
        })
      }

      // When - 4번째 일기 생성 시도
      const entryData: CreateDiaryEntryData = {
        date: date,
        mood: '😞',
        title: 'Fourth Entry',
        content: [{ type: 'paragraph', text: 'Should fail' }],
        write_mode: 'journal'
      }

      const result = await repository.createEntry(entryData)

      // Then
      expect(result.data).toBeNull()
      expect(result.error).toContain('Daily entry limit')
    })
  })

  describe('getEntryById', () => {
    it('should return specific entry by id', async () => {
      if (!isConnected) return

      // Given
      const createdEntry = await createTestEntry(supabase, testUser.id, {
        title: 'Test Entry',
        mood: '😊'
      })

      // When
      const result = await repository.getEntryById(createdEntry.id)

      // Then
      expect(result.data).not.toBeNull()
      expect(result.data!.id).toBe(createdEntry.id)
      expect(result.data!.title).toBe('Test Entry')
      expect(result.error).toBeNull()
    })

    it('should return error for non-existent entry', async () => {
      if (!isConnected) return

      // When
      const result = await repository.getEntryById('non-existent-id')

      // Then
      expect(result.data).toBeNull()
      expect(result.error).toBe('Entry not found')
    })
  })

  describe('getEntryCountByDate', () => {
    it('should return correct count for specific date', async () => {
      if (!isConnected) return

      const date = '2025-09-17'
      
      // Given - 같은 날짜에 2개 일기 생성
      await createTestEntry(supabase, testUser.id, { date, mood: '😊' })
      await createTestEntry(supabase, testUser.id, { date, mood: '😢' })
      
      // 다른 날짜에도 1개 생성 (카운트에 포함되지 않아야 함)
      await createTestEntry(supabase, testUser.id, { 
        date: '2025-09-18', 
        mood: '🤔' 
      })

      // When
      const result = await repository.getEntryCountByDate(date)

      // Then
      expect(result.data).toBe(2)
      expect(result.error).toBeNull()
    })

    it('should return 0 for date with no entries', async () => {
      if (!isConnected) return

      // When
      const result = await repository.getEntryCountByDate('2025-12-31')

      // Then
      expect(result.data).toBe(0)
      expect(result.error).toBeNull()
    })
  })

  describe('updateEntry', () => {
    it('should update entry fields', async () => {
      if (!isConnected) return

      // Given
      const entry = await createTestEntry(supabase, testUser.id, {
        title: 'Original Title',
        mood: '😊'
      })

      // When
      const result = await repository.updateEntry(entry.id, {
        title: 'Updated Title',
        mood: '🎉',
        summary: 'AI generated summary'
      })

      // Then
      expect(result.data).not.toBeNull()
      expect(result.data!.title).toBe('Updated Title')
      expect(result.data!.mood).toBe('🎉')
      expect(result.data!.summary).toBe('AI generated summary')
      expect(result.error).toBeNull()
    })
  })

  describe('deleteEntry', () => {
    it('should soft delete entry', async () => {
      if (!isConnected) return

      // Given
      const entry = await createTestEntry(supabase, testUser.id, {
        title: 'To be deleted',
        mood: '😊'
      })

      // When
      const result = await repository.deleteEntry(entry.id)

      // Then
      expect(result.error).toBeNull()
      
      // Verify soft deletion
      const { data: deletedEntry } = await supabase
        .from('diaries')
        .select('is_deleted')
        .eq('id', entry.id)
        .single()
      
      expect(deletedEntry.is_deleted).toBe(true)
    })
  })
})