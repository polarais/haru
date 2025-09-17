import { SupabaseClient } from '@supabase/supabase-js'
import { IDiaryRepository } from './diary-repository.interface'
import { DiaryEntry, CreateDiaryEntryData, UpdateDiaryEntryData, Result } from '@/lib/types/diary'

export interface IUserService {
  getCurrentUser(): Promise<{ id: string } | null>
}

export class SupabaseDiaryRepository implements IDiaryRepository {
  constructor(
    private supabase: SupabaseClient,
    private userService: IUserService
  ) {}

  async getEntries(): Promise<Result<DiaryEntry[]>> {
    try {
      const user = await this.userService.getCurrentUser()
      if (!user) {
        return { data: null, error: 'User not authenticated' }
      }

      const { data, error } = await this.supabase
        .from('diaries')
        .select('*')
        .eq('profile_id', user.id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: data as DiaryEntry[], error: null }
    } catch (error) {
      return { data: null, error: 'Failed to fetch entries' }
    }
  }

  async getEntryById(id: string): Promise<Result<DiaryEntry>> {
    try {
      const user = await this.userService.getCurrentUser()
      if (!user) {
        return { data: null, error: 'User not authenticated' }
      }

      const { data, error } = await this.supabase
        .from('diaries')
        .select('*')
        .eq('id', id)
        .eq('profile_id', user.id)
        .eq('is_deleted', false)
        .single()

      if (error) {
        return { data: null, error: 'Entry not found' }
      }

      return { data: data as DiaryEntry, error: null }
    } catch (error) {
      return { data: null, error: 'Failed to fetch entry' }
    }
  }

  async getEntriesByDate(date: string): Promise<Result<DiaryEntry[]>> {
    try {
      const user = await this.userService.getCurrentUser()
      if (!user) {
        return { data: null, error: 'User not authenticated' }
      }

      const { data, error } = await this.supabase
        .from('diaries')
        .select('*')
        .eq('profile_id', user.id)
        .eq('date', date)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: data as DiaryEntry[], error: null }
    } catch (error) {
      return { data: null, error: 'Failed to fetch entries by date' }
    }
  }

  async createEntry(data: CreateDiaryEntryData): Promise<Result<DiaryEntry>> {
    try {
      const user = await this.userService.getCurrentUser()
      if (!user) {
        return { data: null, error: 'User not authenticated' }
      }

      // 하루 3개 제한 확인
      const countResult = await this.getEntryCountByDate(data.date)
      if (countResult.error) {
        return { data: null, error: countResult.error }
      }
      
      if (countResult.data! >= 3) {
        return { data: null, error: 'Daily entry limit (3) exceeded' }
      }

      const entryToInsert = {
        profile_id: user.id,
        date: data.date,
        mood: data.mood,
        title: data.title,
        content: data.content,
        ai_chats: [],
        summary: null,
        write_mode: data.write_mode,
        is_deleted: false
      }

      const { data: insertedData, error } = await this.supabase
        .from('diaries')
        .insert(entryToInsert)
        .select()
        .single()

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: insertedData as DiaryEntry, error: null }
    } catch (error) {
      return { data: null, error: 'Failed to create entry' }
    }
  }

  async updateEntry(id: string, data: UpdateDiaryEntryData): Promise<Result<DiaryEntry>> {
    try {
      const user = await this.userService.getCurrentUser()
      if (!user) {
        return { data: null, error: 'User not authenticated' }
      }

      const { data: updatedData, error } = await this.supabase
        .from('diaries')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('profile_id', user.id)
        .eq('is_deleted', false)
        .select()
        .single()

      if (error) {
        return { data: null, error: 'Entry not found or update failed' }
      }

      return { data: updatedData as DiaryEntry, error: null }
    } catch (error) {
      return { data: null, error: 'Failed to update entry' }
    }
  }

  async deleteEntry(id: string): Promise<Result<void>> {
    try {
      const user = await this.userService.getCurrentUser()
      if (!user) {
        return { data: null, error: 'User not authenticated' }
      }

      const { error } = await this.supabase
        .from('diaries')
        .update({ 
          is_deleted: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('profile_id', user.id)

      if (error) {
        return { data: null, error: 'Failed to delete entry' }
      }

      return { data: null, error: null }
    } catch (error) {
      return { data: null, error: 'Failed to delete entry' }
    }
  }

  async getEntryCountByDate(date: string): Promise<Result<number>> {
    try {
      const user = await this.userService.getCurrentUser()
      if (!user) {
        return { data: null, error: 'User not authenticated' }
      }

      const { count, error } = await this.supabase
        .from('diaries')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', user.id)
        .eq('date', date)
        .eq('is_deleted', false)

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: count || 0, error: null }
    } catch (error) {
      return { data: null, error: 'Failed to get entry count' }
    }
  }
}