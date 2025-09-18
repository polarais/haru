// Database types based on the simplified schema

export interface UserProfile {
  id: string // References auth.users(id)
  email_confirmed: boolean
  theme_preference: 'pink' | 'dark' | 'light'
  reminder_enabled: boolean
  reminder_time?: string // TIME format
  auto_save_enabled: boolean
  auto_save_interval: number // seconds
  created_at: string
  updated_at: string
}

export interface DiaryContentBlock {
  type: 'paragraph' | 'image'
  text?: string // for paragraph type
  url?: string // for image type
  caption?: string // for image type
  meta?: {
    width: number
    height: number
    size: number
  }
}

export interface AiChatMessage {
  speaker: 'user' | 'assistant'
  message: string
  timestamp: string // ISO 8601 format
}

export interface DiaryEntry {
  id: string
  profile_id: string
  date: string // DATE format (YYYY-MM-DD)
  mood: string // emoji
  title?: string
  content: DiaryContentBlock[] // JSONB array
  ai_chats: AiChatMessage[] // JSONB array
  summary?: string // AI generated summary
  write_mode: 'journal' | 'chat'
  is_deleted: boolean
  created_at: string
  updated_at: string
}

// For Create/Update operations (omitting auto-generated fields)
export interface DiaryEntryInsert {
  profile_id?: string // Will be set automatically from auth
  date: string
  mood: string
  title?: string
  content: DiaryContentBlock[]
  ai_chats?: AiChatMessage[]
  summary?: string
  write_mode: 'journal' | 'chat'
}

export interface DiaryEntryUpdate {
  date?: string
  mood?: string
  title?: string
  content?: DiaryContentBlock[]
  ai_chats?: AiChatMessage[]
  summary?: string
  write_mode?: 'journal' | 'chat'
}

// Frontend display types (simplified for UI)
export interface DiaryEntryDisplay {
  id: string
  date: number // day of month for calendar display
  mood: string
  title: string
  content: string // flattened text content
  preview: string // first 100 chars
  hasPhoto: boolean
  photoUrl?: string
  aiReflection?: {
    summary: string
    chatHistory: Array<{
      id: string
      type: 'user' | 'ai'
      content: string
      timestamp: Date
    }>
    savedAt: Date
  }
}

// API response types
export interface ApiResponse<T> {
  data?: T
  error?: string
}

export interface SaveEntryResponse {
  id: string
  updated_at: string
}

// Component props interfaces
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
  onDelete: (entry: DiaryEntryDisplay) => void
}