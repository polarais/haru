'use client'

import { CalendarDayProps, DiaryEntryDisplay } from '@/lib/types'
import { cn } from '@/lib/utils'

export function CalendarDay({
  date,
  entries,
  isSelected,
  onDateClick,
  onEntryClick
}: CalendarDayProps) {
  const today = new Date().getDate()
  const isToday = date === today
  
  // 최대 3개까지만 표시
  const displayedEntries = entries.slice(0, 3)
  const remainingCount = Math.max(0, entries.length - 3)

  const handleDateClick = () => {
    onDateClick(date)
  }

  const handleEntryClick = (entry: DiaryEntryDisplay, event: React.MouseEvent) => {
    event.stopPropagation()
    onEntryClick(entry)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onDateClick(date)
    }
  }

  const ariaLabel = `Day ${date}${entries.length > 0 ? ` with ${entries.length} entr${entries.length === 1 ? 'y' : 'ies'}` : ''}`

  return (
    <div
      data-testid="calendar-day"
      role="button"
      tabIndex={0}
      aria-selected={isSelected}
      aria-label={ariaLabel}
      onClick={handleDateClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'h-20 lg:h-20 w-full rounded-lg lg:rounded-xl p-1 lg:p-2 transition-all duration-200 flex flex-col items-center justify-center relative',
        'hover:bg-pink-50 hover:scale-105 group active:scale-95 cursor-pointer',
        {
          'bg-gradient-to-br from-pink-200 to-rose-200 shadow-md': isToday,
          'bg-pink-100 ring-2 ring-pink-300 scale-105': isSelected,
          'bg-gray-50': !isToday && !isSelected,
        }
      )}
    >
      {/* 날짜 숫자 */}
      <span className="text-sm lg:text-sm text-gray-700 group-hover:text-pink-600 transition-colors">{date}</span>
      
      {/* 감정 이모지들 - 원래 디자인 스타일 */}
      {entries.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-0.5 mt-1 max-w-full">
          {entries.length === 1 ? (
            <span className="text-2xl lg:text-3xl leading-none">{entries[0].mood}</span>
          ) : entries.length === 2 ? (
            <>
              <span className="text-xl lg:text-xl leading-none">{entries[0].mood}</span>
              <span className="text-xl lg:text-xl leading-none">{entries[1].mood}</span>
            </>
          ) : (
            <>
              <span className="text-base lg:text-lg leading-none">{entries[0].mood}</span>
              <span className="text-base lg:text-lg leading-none">{entries[1].mood}</span>
              <span className="text-base lg:text-lg leading-none">{entries[2].mood}</span>
            </>
          )}
        </div>
      )}
      
      {/* Today indicator */}
      {isToday && (
        <div className="absolute -top-1 -right-1 w-2 lg:w-2.5 h-2 lg:h-2.5 bg-pink-400 rounded-full animate-pulse"></div>
      )}
    </div>
  )
}