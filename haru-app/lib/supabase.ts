import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 데이터베이스 타입 정의
export interface UserProfile {
  id: string
  email_confirmed: boolean
  theme_preference: string
  reminder_enabled: boolean
  reminder_time: string | null
  auto_save_enabled: boolean
  auto_save_interval: number
  created_at: string
  updated_at: string
}

export interface DiaryEntry {
  id: string
  profile_id: string
  date: string
  mood: string
  title: string | null
  content: any[] // JSONB 배열
  ai_chats: any[] // JSONB 배열
  summary: string | null
  write_mode: 'journal' | 'chat'
  is_deleted: boolean
  created_at: string
  updated_at: string
}