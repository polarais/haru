'use client'

import { MoodCalendarGridProps } from '@/lib/types/components'
import { CalendarDay } from './CalendarDay'
import { 
  WEEKDAYS, 
  getDaysInMonth, 
  getFirstDayOfWeek, 
  getEntriesForDate 
} from '@/lib/utils/calendar'

export function MoodCalendarGrid({
  currentMonth,
  currentYear,
  entries,
  selectedDate,
  onDateClick,
  onEntryClick
}: MoodCalendarGridProps) {
  const daysInMonth = getDaysInMonth(currentMonth, currentYear)
  const firstDayOfWeek = getFirstDayOfWeek(currentMonth, currentYear)
  
  const monthNames = [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const ariaLabel = `Calendar for ${monthNames[currentMonth]} ${currentYear}`

  return (
    <div 
      data-testid="calendar-grid"
      role="grid"
      aria-label={ariaLabel}
      className="grid grid-cols-7 gap-1"
    >
      {/* 요일 헤더 */}
      {WEEKDAYS.map(day => (
        <div 
          key={day} 
          role="columnheader"
          className="text-center text-sm font-medium text-gray-500 py-2"
        >
          {day}
        </div>
      ))}
      
      {/* 빈 셀들 - 월 시작 전 */}
      {Array.from({ length: firstDayOfWeek }).map((_, index) => (
        <div 
          key={`empty-${index}`} 
          data-testid="empty-cell"
          className="h-16" 
        />
      ))}
      
      {/* 날짜 셀들 */}
      {Array.from({ length: daysInMonth }).map((_, index) => {
        const date = index + 1
        const dayEntries = getEntriesForDate(entries, date)
        const isSelected = selectedDate === date
        
        return (
          <CalendarDay
            key={date}
            date={date}
            entries={dayEntries}
            isSelected={isSelected}
            onDateClick={onDateClick}
            onEntryClick={onEntryClick}
          />
        )
      })}
    </div>
  )
}