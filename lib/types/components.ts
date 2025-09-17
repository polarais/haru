// UI 컴포넌트에서 사용하는 타입들

export interface DiaryEntryDisplay {
  id: string
  date: number // 1-31 (일)
  mood: string // 이모지
  title?: string
  content: string // 텍스트만 (표시용)
  preview: string // 요약 텍스트
  hasPhoto: boolean
  photoUrl?: string
}

export interface CalendarDayProps {
  date: number
  entries: DiaryEntryDisplay[]
  isSelected: boolean
  onDateClick: (date: number) => void
  onEntryClick: (entry: DiaryEntryDisplay) => void
}

export interface MoodCalendarGridProps {
  currentMonth: number // 1-12
  currentYear: number
  entries: DiaryEntryDisplay[]
  selectedDate?: number
  onDateClick: (date: number) => void
  onEntryClick: (entry: DiaryEntryDisplay) => void
}

export interface EntryViewPanelProps {
  entry: DiaryEntryDisplay | null
  isOpen: boolean
  onClose: () => void
  onExpand: () => void
  currentEntryIndex: number
  totalEntries: number
  onPreviousEntry: () => void
  onNextEntry: () => void
  onDelete: (entryId: string) => void
}