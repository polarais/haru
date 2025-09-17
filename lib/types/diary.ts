// 데이터베이스 구조에 맞는 일기 타입 정의

export interface DiaryEntry {
  id: string
  profile_id: string
  date: string // DATE 형식 (YYYY-MM-DD)
  mood: string // 이모지
  title?: string
  content: ContentBlock[] // paragraph와 image 블록 배열
  ai_chats: AiChatMessage[] // AI 대화 기록
  summary?: string // AI 요약
  write_mode: 'journal' | 'chat'
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export interface ContentBlock {
  type: 'paragraph' | 'image'
  text?: string // paragraph 타입일 때
  url?: string // image 타입일 때
  caption?: string // image 타입 설명
  meta?: ImageMeta // image 메타데이터
}

export interface ImageMeta {
  width: number
  height: number
  size: number
}

export interface AiChatMessage {
  speaker: 'user' | 'assistant'
  message: string
  timestamp: string // ISO 8601 형식
}

export interface CreateDiaryEntryData {
  date: string
  mood: string
  title?: string
  content: ContentBlock[]
  write_mode: 'journal' | 'chat'
}

export interface UpdateDiaryEntryData {
  mood?: string
  title?: string
  content?: ContentBlock[]
  ai_chats?: AiChatMessage[]
  summary?: string
}

// API 응답 타입
export interface Result<T> {
  data: T | null
  error: string | null
}