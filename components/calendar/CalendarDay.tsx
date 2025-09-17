'use client'

import { CalendarDayProps, DiaryEntryDisplay } from '@/lib/types/components'
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
        'h-16 p-1 border border-gray-100 cursor-pointer transition-all duration-200',
        'flex flex-col items-center justify-start',
        'hover:bg-gray-50',
        {
          'bg-pink-50': isToday,
          'ring-2 ring-pink-500 bg-pink-100': isSelected,
        }
      )}
    >
      {/* 날짜 숫자 */}
      <div className={cn(
        'text-sm font-medium mb-1',
        {
          'text-pink-600 font-semibold': isToday,
          'text-gray-900': !isToday,
        }
      )}>
        {date}
      </div>

      {/* 감정 이모지들 */}
      <div className="flex flex-wrap gap-0.5 items-center">
        {displayedEntries.map((entry) => (
          <button
            key={entry.id}
            onClick={(e) => handleEntryClick(entry, e)}
            className="text-xs hover:scale-110 transition-transform"
            aria-label={`Entry: ${entry.title || 'Untitled'}`}
          >
            {entry.mood}
          </button>
        ))}
        
        {/* 더 많은 항목이 있을 때 표시 */}
        {remainingCount > 0 && (
          <span className="text-xs text-gray-400 font-medium">
            +{remainingCount}
          </span>
        )}
      </div>
    </div>
  )
}