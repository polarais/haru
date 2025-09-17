import { formatDate, isToday, getRelativeDate } from '@/lib/utils/date'

describe('Date Utilities', () => {
  describe('formatDate', () => {
    it('should format date string in English', () => {
      expect(formatDate('2025-09-17')).toBe('Sep 17, 2025')
    })
    
    it('should handle invalid date', () => {
      expect(formatDate('invalid')).toBe('Invalid Date')
    })
    
    it('should handle different date formats', () => {
      expect(formatDate('2025-01-01')).toBe('Jan 1, 2025')
      expect(formatDate('2025-12-31')).toBe('Dec 31, 2025')
    })
  })
  
  describe('isToday', () => {
    it('should return true for today', () => {
      const today = new Date().toISOString().split('T')[0]
      expect(isToday(today)).toBe(true)
    })
    
    it('should return false for yesterday', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]
      expect(isToday(yesterdayStr)).toBe(false)
    })
    
    it('should return false for tomorrow', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowStr = tomorrow.toISOString().split('T')[0]
      expect(isToday(tomorrowStr)).toBe(false)
    })
  })
  
  describe('getRelativeDate', () => {
    it('should return "Today" for today', () => {
      const today = new Date().toISOString().split('T')[0]
      expect(getRelativeDate(today)).toBe('Today')
    })
    
    it('should return "Yesterday" for yesterday', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]
      expect(getRelativeDate(yesterdayStr)).toBe('Yesterday')
    })
    
    it('should return "Tomorrow" for tomorrow', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowStr = tomorrow.toISOString().split('T')[0]
      expect(getRelativeDate(tomorrowStr)).toBe('Tomorrow')
    })
    
    it('should return formatted date for other dates', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 7)
      const pastDateStr = pastDate.toISOString().split('T')[0]
      expect(getRelativeDate(pastDateStr)).toMatch(/[A-Z][a-z]{2} \d{1,2}, \d{4}/)
    })
  })
})