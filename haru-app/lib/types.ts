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

// Entry photo (separate table)
export interface EntryPhoto {
  id: string
  entry_id: string
  storage_path: string
  caption?: string
  position_index: number // Position in text where photo should be displayed
  uploaded_at: string
  meta?: {
    width: number
    height: number
    size: number
  }
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
  content: string // Plain text with photo markers like [PHOTO:1]
  photos?: EntryPhoto[] // Separate photos array
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
  content: string // Plain text with photo markers
  ai_chats?: AiChatMessage[]
  summary?: string
  write_mode: 'journal' | 'chat'
}

export interface DiaryEntryUpdate {
  date?: string
  mood?: string
  title?: string
  content?: string // Plain text with photo markers
  ai_chats?: AiChatMessage[]
  summary?: string
  write_mode?: 'journal' | 'chat'
}

// Frontend display types (simplified for UI)
export interface DiaryEntryDisplay {
  id: string
  date: string | number // date string (YYYY-MM-DD) or day number for backward compatibility
  mood: string
  title: string
  content: string // flattened text content (without photo markers)
  preview: string // first 100 chars
  hasPhoto: boolean
  photos?: EntryPhoto[] // Array of photos with position info
  photoUrl?: string // First photo URL for backward compatibility
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
  currentMonth: number // 1-12
  currentYear: number
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