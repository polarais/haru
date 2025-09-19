import { DiaryEntryDisplay } from '@/lib/types'

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/**
 * 특정 월의 일수를 반환합니다.
 */
export function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate()
}

/**
 * 특정 월의 첫 번째 날이 무슨 요일인지 반환합니다 (0=일요일, 6=토요일).
 */
export function getFirstDayOfWeek(month: number, year: number): number {
  return new Date(year, month - 1, 1).getDay()
}

/**
 * 특정 날짜의 일기들을 필터링해서 반환합니다.
 */
export function getEntriesForDate(entries: DiaryEntryDisplay[], date: number, currentMonth?: number, currentYear?: number): DiaryEntryDisplay[] {
  return entries.filter(entry => {
    if (typeof entry.date === 'string') {
      const [year, month, day] = entry.date.split('-').map(Number)
      
      // If month/year provided, match exactly
      if (currentMonth && currentYear) {
        return year === currentYear && month === currentMonth && day === date
      }
      
      // Otherwise just match day (backward compatibility)
      return day === date
    }
    // Fallback for old numeric date format
    return entry.date === date
  })
}

/**
 * 월/년도가 현재 월인지 확인합니다.
 */
export function isCurrentMonth(month: number, year: number): boolean {
  const now = new Date()
  return now.getFullYear() === year && (now.getMonth() + 1) === month
}

/**
 * 날짜가 오늘인지 확인합니다.
 */
export function isToday(date: number, month: number, year: number): boolean {
  if (!isCurrentMonth(month, year)) return false
  
  const now = new Date()
  return now.getDate() === date
}