import { 
  getDaysInMonth, 
  getFirstDayOfWeek, 
  getEntriesForDate, 
  isCurrentMonth, 
  isToday,
  WEEKDAYS 
} from '@/lib/utils/calendar'
import { DiaryEntryDisplay } from '@/lib/types/components'

describe('Calendar Utilities', () => {
  describe('WEEKDAYS constant', () => {
    it('should have correct Korean weekday names', () => {
      expect(WEEKDAYS).toEqual(['일', '월', '화', '수', '목', '금', '토'])
    })

    it('should have 7 days', () => {
      expect(WEEKDAYS).toHaveLength(7)
    })
  })

  describe('getDaysInMonth', () => {
    it('should return correct days for regular months', () => {
      expect(getDaysInMonth(1, 2025)).toBe(31) // January
      expect(getDaysInMonth(4, 2025)).toBe(30) // April
      expect(getDaysInMonth(6, 2025)).toBe(30) // June
      expect(getDaysInMonth(12, 2025)).toBe(31) // December
    })

    it('should return 28 for February in non-leap year', () => {
      expect(getDaysInMonth(2, 2025)).toBe(28)
      expect(getDaysInMonth(2, 2023)).toBe(28)
    })

    it('should return 29 for February in leap year', () => {
      expect(getDaysInMonth(2, 2024)).toBe(29)
      expect(getDaysInMonth(2, 2020)).toBe(29)
    })

    it('should handle edge cases for leap year calculation', () => {
      expect(getDaysInMonth(2, 1900)).toBe(28) // Not leap (divisible by 100 but not 400)
      expect(getDaysInMonth(2, 2000)).toBe(29) // Leap (divisible by 400)
    })
  })

  describe('getFirstDayOfWeek', () => {
    it('should return correct first day of week', () => {
      // September 1, 2025 is a Monday (day 1)
      expect(getFirstDayOfWeek(9, 2025)).toBe(1)
      
      // January 1, 2025 is a Wednesday (day 3)
      expect(getFirstDayOfWeek(1, 2025)).toBe(3)
      
      // December 1, 2024 is a Sunday (day 0)
      expect(getFirstDayOfWeek(12, 2024)).toBe(0)
    })

    it('should handle different years correctly', () => {
      // January 1st in different years
      expect(getFirstDayOfWeek(1, 2020)).toBe(3) // Wednesday
      expect(getFirstDayOfWeek(1, 2021)).toBe(5) // Friday
      expect(getFirstDayOfWeek(1, 2022)).toBe(6) // Saturday
    })
  })

  describe('getEntriesForDate', () => {
    const mockEntries: DiaryEntryDisplay[] = [
      {
        id: '1',
        date: 17,
        mood: '😊',
        title: 'Happy Day',
        content: 'Great!',
        preview: 'Great!',
        hasPhoto: false
      },
      {
        id: '2',
        date: 17,
        mood: '🎉',
        title: 'Party',
        content: 'Fun!',
        preview: 'Fun!',
        hasPhoto: true
      },
      {
        id: '3',
        date: 25,
        mood: '😢',
        title: 'Sad',
        content: 'Bad day',
        preview: 'Bad day',
        hasPhoto: false
      }
    ]

    it('should return entries for specific date', () => {
      const entriesFor17 = getEntriesForDate(mockEntries, 17)
      
      expect(entriesFor17).toHaveLength(2)
      expect(entriesFor17[0].id).toBe('1')
      expect(entriesFor17[1].id).toBe('2')
    })

    it('should return single entry for date with one entry', () => {
      const entriesFor25 = getEntriesForDate(mockEntries, 25)
      
      expect(entriesFor25).toHaveLength(1)
      expect(entriesFor25[0].id).toBe('3')
    })

    it('should return empty array for date with no entries', () => {
      const entriesFor5 = getEntriesForDate(mockEntries, 5)
      
      expect(entriesFor5).toEqual([])
    })

    it('should handle empty entries array', () => {
      const result = getEntriesForDate([], 17)
      
      expect(result).toEqual([])
    })
  })

  describe('isCurrentMonth', () => {
    beforeAll(() => {
      // Mock current date to September 17, 2025
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2025-09-17'))
    })

    afterAll(() => {
      jest.useRealTimers()
    })

    it('should return true for current month and year', () => {
      expect(isCurrentMonth(9, 2025)).toBe(true)
    })

    it('should return false for different month, same year', () => {
      expect(isCurrentMonth(8, 2025)).toBe(false)
      expect(isCurrentMonth(10, 2025)).toBe(false)
    })

    it('should return false for same month, different year', () => {
      expect(isCurrentMonth(9, 2024)).toBe(false)
      expect(isCurrentMonth(9, 2026)).toBe(false)
    })

    it('should return false for different month and year', () => {
      expect(isCurrentMonth(12, 2024)).toBe(false)
    })
  })

  describe('isToday', () => {
    beforeAll(() => {
      // Mock current date to September 17, 2025
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2025-09-17'))
    })

    afterAll(() => {
      jest.useRealTimers()
    })

    it('should return true for today', () => {
      expect(isToday(17, 9, 2025)).toBe(true)
    })

    it('should return false for different date in same month', () => {
      expect(isToday(16, 9, 2025)).toBe(false)
      expect(isToday(18, 9, 2025)).toBe(false)
    })

    it('should return false for same date in different month', () => {
      expect(isToday(17, 8, 2025)).toBe(false)
      expect(isToday(17, 10, 2025)).toBe(false)
    })

    it('should return false for same date in different year', () => {
      expect(isToday(17, 9, 2024)).toBe(false)
      expect(isToday(17, 9, 2026)).toBe(false)
    })

    it('should return false for different month and year', () => {
      expect(isToday(17, 12, 2024)).toBe(false)
    })
  })
})