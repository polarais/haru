import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { DiaryEntry, CreateDiaryEntryData } from '@/lib/types/diary'

// 로컬 Supabase 설정
const TEST_SUPABASE_URL = process.env.TEST_SUPABASE_URL || 'http://localhost:54321'
const TEST_SUPABASE_ANON_KEY = process.env.TEST_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

export interface TestUser {
  id: string
  email: string
}

/**
 * 테스트용 Supabase 클라이언트 생성
 */
export function createTestSupabaseClient(): SupabaseClient {
  return createClient(TEST_SUPABASE_URL, TEST_SUPABASE_ANON_KEY)
}

/**
 * 테스트용 사용자 생성
 */
export async function createTestUser(
  supabase: SupabaseClient, 
  email: string = `test-${Date.now()}@example.com`
): Promise<TestUser> {
  // 테스트용 사용자 생성 (Supabase Auth 사용)
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: 'test-password-123!'
  })

  if (authError || !authData.user) {
    throw new Error(`Failed to create test user: ${authError?.message}`)
  }

  // user_profiles 테이블에 프로필 생성
  const { error: profileError } = await supabase
    .from('user_profiles')
    .insert({
      id: authData.user.id,
      email_confirmed: true,
      theme_preference: 'pink',
      auto_save_enabled: true,
      auto_save_interval: 30
    })

  if (profileError) {
    throw new Error(`Failed to create user profile: ${profileError.message}`)
  }

  return {
    id: authData.user.id,
    email: email
  }
}

/**
 * 테스트 사용자 및 관련 데이터 정리
 */
export async function cleanupTestUser(supabase: SupabaseClient, userId: string): Promise<void> {
  try {
    // 1. 일기 데이터 삭제 (CASCADE로 자동 삭제되지만 명시적으로)
    await supabase
      .from('diaries')
      .delete()
      .eq('profile_id', userId)

    // 2. 사용자 프로필 삭제
    await supabase
      .from('user_profiles')
      .delete()
      .eq('id', userId)

    // 3. Auth 사용자 삭제 (관리자 권한 필요 - 실제로는 수동 정리)
    // await supabase.auth.admin.deleteUser(userId)
  } catch (error) {
    console.warn(`Cleanup warning for user ${userId}:`, error)
  }
}

/**
 * 테스트용 일기 생성
 */
export async function createTestEntry(
  supabase: SupabaseClient,
  userId: string,
  entryData: Partial<CreateDiaryEntryData> & { title?: string }
): Promise<DiaryEntry> {
  const defaultData: CreateDiaryEntryData = {
    date: new Date().toISOString().split('T')[0],
    mood: '😊',
    content: [{ type: 'paragraph', text: 'Test content' }],
    write_mode: 'journal',
    ...entryData
  }

  const { data, error } = await supabase
    .from('diaries')
    .insert({
      profile_id: userId,
      date: defaultData.date,
      mood: defaultData.mood,
      title: entryData.title,
      content: defaultData.content,
      ai_chats: [],
      write_mode: defaultData.write_mode,
      is_deleted: false
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create test entry: ${error.message}`)
  }

  return data as DiaryEntry
}

/**
 * 테스트 데이터베이스 초기화 (모든 테스트 데이터 삭제)
 */
export async function resetTestDatabase(supabase: SupabaseClient): Promise<void> {
  try {
    // 테스트 사용자들의 이메일 패턴으로 식별하여 삭제
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('id')
      .like('email', 'test-%@example.com')

    if (profiles) {
      for (const profile of profiles) {
        await cleanupTestUser(supabase, profile.id)
      }
    }
  } catch (error) {
    console.warn('Database reset warning:', error)
  }
}

/**
 * 데이터베이스 연결 확인
 */
export async function checkDatabaseConnection(supabase: SupabaseClient): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .select('count', { count: 'exact', head: true })

    return !error
  } catch {
    return false
  }
}

/**
 * 테스트용 AI 채팅 메시지 생성
 */
export function createTestAiChatMessages() {
  return [
    {
      speaker: 'user' as const,
      message: 'How was my day?',
      timestamp: new Date().toISOString()
    },
    {
      speaker: 'assistant' as const,
      message: 'It sounds like you had a productive day! Tell me more about what made it special.',
      timestamp: new Date().toISOString()
    }
  ]
}

/**
 * 테스트용 콘텐츠 블록 생성
 */
export function createTestContentBlocks() {
  return [
    {
      type: 'paragraph' as const,
      text: 'Today was a great day. I accomplished many things.'
    },
    {
      type: 'image' as const,
      url: 'https://example.com/test-image.jpg',
      caption: 'Beautiful sunset',
      meta: {
        width: 1024,
        height: 768,
        size: 245760
      }
    },
    {
      type: 'paragraph' as const,
      text: 'Looking forward to tomorrow!'
    }
  ]
}