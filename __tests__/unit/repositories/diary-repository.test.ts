import { IDiaryRepository } from '@/lib/repositories/diary-repository.interface'
import { DiaryEntry, CreateDiaryEntryData } from '@/lib/types/diary'

// Mock implementation for testing interface behavior
class MockDiaryRepository implements IDiaryRepository {
  private entries: DiaryEntry[] = []
  private currentUser = { id: 'test-user-123' }

  async getEntries() {
    const userEntries = this.entries.filter(
      entry => entry.profile_id === this.currentUser.id && !entry.is_deleted
    )
    return { data: userEntries, error: null }
  }

  async getEntryById(id: string) {
    const entry = this.entries.find(e => e.id === id && !e.is_deleted)
    if (!entry) {
      return { data: null, error: 'Entry not found' }
    }
    return { data: entry, error: null }
  }

  async getEntriesByDate(date: string) {
    const dateEntries = this.entries.filter(
      entry => entry.date === date && entry.profile_id === this.currentUser.id && !entry.is_deleted
    )
    return { data: dateEntries, error: null }
  }

  async createEntry(data: CreateDiaryEntryData) {
    const entry: DiaryEntry = {
      id: `entry-${Date.now()}`,
      profile_id: this.currentUser.id,
      date: data.date,
      mood: data.mood,
      title: data.title,
      content: data.content,
      ai_chats: [],
      summary: undefined,
      write_mode: data.write_mode,
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    this.entries.push(entry)
    return { data: entry, error: null }
  }

  async updateEntry(id: string, data: any) {
    const index = this.entries.findIndex(e => e.id === id)
    if (index === -1) {
      return { data: null, error: 'Entry not found' }
    }
    
    this.entries[index] = {
      ...this.entries[index],
      ...data,
      updated_at: new Date().toISOString()
    }
    return { data: this.entries[index], error: null }
  }

  async deleteEntry(id: string) {
    const index = this.entries.findIndex(e => e.id === id)
    if (index === -1) {
      return { data: null, error: 'Entry not found' }
    }
    
    this.entries[index].is_deleted = true
    return { data: null, error: null }
  }

  async getEntryCountByDate(date: string) {
    const count = this.entries.filter(
      entry => entry.date === date && entry.profile_id === this.currentUser.id && !entry.is_deleted
    ).length
    return { data: count, error: null }
  }

  // Test helper methods
  reset() {
    this.entries = []
  }

  setCurrentUser(userId: string) {
    this.currentUser = { id: userId }
  }
}

describe('DiaryRepository Interface', () => {
  let repository: MockDiaryRepository

  beforeEach(() => {
    repository = new MockDiaryRepository()
  })

  describe('getEntries', () => {
    it('should return empty array when no entries exist', async () => {
      const result = await repository.getEntries()
      
      expect(result.data).toEqual([])
      expect(result.error).toBeNull()
    })

    it('should return user entries only', async () => {
      // Given - 다른 사용자의 일기도 생성
      repository.setCurrentUser('user-1')
      await repository.createEntry({
        date: '2025-09-17',
        mood: '😊',
        title: 'User 1 Entry',
        content: [{ type: 'paragraph', text: 'Hello from user 1' }],
        write_mode: 'journal'
      })

      repository.setCurrentUser('user-2')
      await repository.createEntry({
        date: '2025-09-17',
        mood: '😢',
        title: 'User 2 Entry',
        content: [{ type: 'paragraph', text: 'Hello from user 2' }],
        write_mode: 'journal'
      })

      // When - user-2로 조회
      const result = await repository.getEntries()

      // Then - user-2의 일기만 반환
      expect(result.data).toHaveLength(1)
      expect(result.data![0].title).toBe('User 2 Entry')
      expect(result.error).toBeNull()
    })

    it('should not return deleted entries', async () => {
      // Given
      const createResult = await repository.createEntry({
        date: '2025-09-17',
        mood: '😊',
        title: 'Test Entry',
        content: [{ type: 'paragraph', text: 'Test content' }],
        write_mode: 'journal'
      })
      
      await repository.deleteEntry(createResult.data!.id)

      // When
      const result = await repository.getEntries()

      // Then
      expect(result.data).toEqual([])
      expect(result.error).toBeNull()
    })
  })

  describe('createEntry', () => {
    it('should create entry with valid data', async () => {
      const entryData: CreateDiaryEntryData = {
        date: '2025-09-17',
        mood: '😊',
        title: 'Test Entry',
        content: [
          { type: 'paragraph', text: 'First paragraph' },
          { type: 'image', url: 'https://example.com/image.jpg', caption: 'Test image' }
        ],
        write_mode: 'journal'
      }

      const result = await repository.createEntry(entryData)

      expect(result.data).not.toBeNull()
      expect(result.data!.date).toBe('2025-09-17')
      expect(result.data!.mood).toBe('😊')
      expect(result.data!.title).toBe('Test Entry')
      expect(result.data!.content).toHaveLength(2)
      expect(result.data!.content[0].type).toBe('paragraph')
      expect(result.data!.content[1].type).toBe('image')
      expect(result.data!.write_mode).toBe('journal')
      expect(result.data!.is_deleted).toBe(false)
      expect(result.error).toBeNull()
    })
  })

  describe('getEntryCountByDate', () => {
    it('should return correct count for specific date', async () => {
      // Given - 같은 날짜에 2개, 다른 날짜에 1개 생성
      await repository.createEntry({
        date: '2025-09-17',
        mood: '😊',
        content: [{ type: 'paragraph', text: 'Entry 1' }],
        write_mode: 'journal'
      })
      
      await repository.createEntry({
        date: '2025-09-17',
        mood: '😢',
        content: [{ type: 'paragraph', text: 'Entry 2' }],
        write_mode: 'journal'
      })
      
      await repository.createEntry({
        date: '2025-09-18',
        mood: '🤔',
        content: [{ type: 'paragraph', text: 'Entry 3' }],
        write_mode: 'journal'
      })

      // When
      const result = await repository.getEntryCountByDate('2025-09-17')

      // Then
      expect(result.data).toBe(2)
      expect(result.error).toBeNull()
    })

    it('should return 0 for date with no entries', async () => {
      const result = await repository.getEntryCountByDate('2025-09-17')

      expect(result.data).toBe(0)
      expect(result.error).toBeNull()
    })
  })
})