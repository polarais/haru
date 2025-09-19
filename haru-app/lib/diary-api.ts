import { supabase } from './supabase'
import { DiaryEntry, DiaryEntryInsert, DiaryEntryUpdate, DiaryContentBlock, AiChatMessage, ApiResponse, SaveEntryResponse, EntryPhoto } from './types'

export class DiaryAPI {
  /**
   * Get all diary entries for the current user
   */
  static async getEntries(): Promise<ApiResponse<DiaryEntry[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('diaries')
        .select('*')
        .eq('profile_id', user.id)
        .eq('is_deleted', false)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error

      return { data: data || [] }
    } catch (error) {
      console.error('Error fetching entries:', error)
      return { error: error instanceof Error ? error.message : 'Failed to fetch entries' }
    }
  }

  /**
   * Get entries for a specific date
   */
  static async getEntriesForDate(date: string): Promise<ApiResponse<DiaryEntry[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('diaries')
        .select('*')
        .eq('profile_id', user.id)
        .eq('date', date)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })

      if (error) throw error

      return { data: data || [] }
    } catch (error) {
      console.error('Error fetching entries for date:', error)
      return { error: error instanceof Error ? error.message : 'Failed to fetch entries' }
    }
  }

  /**
   * Save or update a diary entry (upsert by date + title combination)
   */
  static async saveEntry(entry: DiaryEntryInsert, entryId?: string): Promise<ApiResponse<SaveEntryResponse>> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Ensure user profile exists
      await this.ensureUserProfile(user.id)

      const entryData = {
        ...entry,
        profile_id: user.id
      }

      let result
      if (entryId) {
        // Update existing entry
        const { data, error } = await supabase
          .from('diaries')
          .update(entryData)
          .eq('id', entryId)
          .eq('profile_id', user.id)
          .select('id, updated_at')
          .single()

        if (error) throw error
        result = data
      } else {
        // Check how many entries exist for this date (max 3 per day)
        const { data: existingEntries, error: countError } = await supabase
          .from('diaries')
          .select('id')
          .eq('profile_id', user.id)
          .eq('date', entry.date)
          .eq('is_deleted', false)

        if (countError) throw countError

        if (existingEntries && existingEntries.length >= 3) {
          throw new Error('Maximum 3 entries per day allowed')
        }

        // Create new entry (always create, never update in this flow)
        const { data, error } = await supabase
          .from('diaries')
          .insert(entryData)
          .select('id, updated_at')
          .single()

        if (error) throw error
        result = data
      }

      return { data: result }
    } catch (error) {
      console.error('Error saving entry:', error)
      return { error: error instanceof Error ? error.message : 'Failed to save entry' }
    }
  }

  /**
   * Delete a diary entry (soft delete)
   */
  static async deleteEntry(entryId: string): Promise<ApiResponse<boolean>> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('diaries')
        .update({ is_deleted: true })
        .eq('id', entryId)
        .eq('profile_id', user.id)

      if (error) throw error

      return { data: true }
    } catch (error) {
      console.error('Error deleting entry:', error)
      return { error: error instanceof Error ? error.message : 'Failed to delete entry' }
    }
  }

  /**
   * Delete all diary entries for the current user (soft delete)
   */
  static async deleteAllEntries(): Promise<ApiResponse<{ deletedCount: number }>> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // First, get count of entries that will be deleted
      const { data: existingEntries, error: countError } = await supabase
        .from('diaries')
        .select('id')
        .eq('profile_id', user.id)
        .eq('is_deleted', false)

      if (countError) throw countError

      const deletedCount = existingEntries?.length || 0

      if (deletedCount === 0) {
        return { data: { deletedCount: 0 } }
      }

      // Perform bulk soft delete
      const { error } = await supabase
        .from('diaries')
        .update({ is_deleted: true })
        .eq('profile_id', user.id)
        .eq('is_deleted', false)

      if (error) throw error

      return { data: { deletedCount } }
    } catch (error) {
      console.error('Error deleting all entries:', error)
      return { error: error instanceof Error ? error.message : 'Failed to delete all entries' }
    }
  }

  /**
   * Permanently delete all diary entries for the current user (hard delete)
   * WARNING: This action cannot be undone!
   */
  static async permanentlyDeleteAllEntries(): Promise<ApiResponse<{ deletedCount: number }>> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // First, get count of entries that will be deleted
      const { data: existingEntries, error: countError } = await supabase
        .from('diaries')
        .select('id')
        .eq('profile_id', user.id)

      if (countError) throw countError

      const deletedCount = existingEntries?.length || 0

      if (deletedCount === 0) {
        return { data: { deletedCount: 0 } }
      }

      // Perform bulk hard delete
      const { error } = await supabase
        .from('diaries')
        .delete()
        .eq('profile_id', user.id)

      if (error) throw error

      return { data: { deletedCount } }
    } catch (error) {
      console.error('Error permanently deleting all entries:', error)
      return { error: error instanceof Error ? error.message : 'Failed to permanently delete all entries' }
    }
  }

  /**
   * Upload image to Supabase Storage and return URL
   */
  static async uploadImage(file: File, entryId: string): Promise<ApiResponse<string>> {
    try {
      console.log('Starting image upload:', { fileName: file.name, fileSize: file.size, entryId })
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Validate file
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size too large. Maximum size is 10MB.')
      }

      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image')
      }

      // Generate unique filename with date and random string
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${user.id}/${entryId}/${fileName}`

      console.log('Uploading to path:', filePath)

      // Skip bucket check for now and try direct upload
      console.log('Attempting direct upload to diary-photos bucket...')

      const { data, error } = await supabase.storage
        .from('diary-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Upload error:', error)
        throw error
      }

      console.log('Upload successful:', data)

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('diary-photos')
        .getPublicUrl(data.path)

      console.log('Public URL generated:', publicUrlData.publicUrl)

      return { data: publicUrlData.publicUrl }
    } catch (error) {
      console.error('Error uploading image:', error)
      return { error: error instanceof Error ? error.message : 'Failed to upload image' }
    }
  }

  /**
   * Helper: Ensure user profile exists
   */
  private static async ensureUserProfile(userId: string): Promise<void> {
    try {
      const { data: existing } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle()

      if (!existing) {
        const { error } = await supabase
          .from('user_profiles')
          .upsert({
            id: userId,
            email_confirmed: true,
            theme_preference: 'pink',
            auto_save_enabled: true,
            auto_save_interval: 30
          }, {
            onConflict: 'id'
          })

        if (error && error.code !== '23505') { // 23505 is unique violation - ignore if profile already exists
          console.error('Error creating user profile:', error)
          // Still don't throw to allow the main operation to continue
        }
      }
    } catch (error) {
      console.error('Error in ensureUserProfile:', error)
      // Don't throw - this is a helper function that shouldn't break the main flow
    }
  }

  /**
   * Save photos for an entry with position indexes
   */
  static async saveEntryPhotos(entryId: string, photos: Array<{ file?: File, url?: string, caption?: string, positionIndex: number }>): Promise<ApiResponse<EntryPhoto[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const savedPhotos: EntryPhoto[] = []

      for (const photo of photos) {
        let photoUrl = photo.url
        
        // Upload file if provided
        if (photo.file) {
          const uploadResult = await this.uploadImage(photo.file, entryId)
          if (uploadResult.error) {
            throw new Error(`Failed to upload photo: ${uploadResult.error}`)
          }
          photoUrl = uploadResult.data!
        }

        if (photoUrl) {
          // Save photo record to database
          const { data, error } = await supabase
            .from('entry_photos')
            .insert({
              entry_id: entryId,
              storage_path: photoUrl,
              caption: photo.caption,
              position_index: photo.positionIndex
            })
            .select()
            .single()

          if (error) throw error
          savedPhotos.push(data)
        }
      }

      return { data: savedPhotos }
    } catch (error) {
      console.error('Error saving entry photos:', error)
      return { error: error instanceof Error ? error.message : 'Failed to save photos' }
    }
  }

  /**
   * Get photos for an entry
   */
  static async getEntryPhotos(entryId: string): Promise<ApiResponse<EntryPhoto[]>> {
    try {
      const { data, error } = await supabase
        .from('entry_photos')
        .select('*')
        .eq('entry_id', entryId)
        .order('position_index', { ascending: true })

      if (error) throw error

      return { data: data || [] }
    } catch (error) {
      console.error('Error fetching entry photos:', error)
      return { error: error instanceof Error ? error.message : 'Failed to fetch photos' }
    }
  }

  /**
   * Helper: Parse text content with photo markers [PHOTO:1] and replace with actual photos
   */
  static parseContentWithPhotos(content: string, photos: EntryPhoto[]): string {
    let parsedContent = content
    
    // Sort photos by position index
    const sortedPhotos = [...photos].sort((a, b) => a.position_index - b.position_index)
    
    // Replace photo markers with actual photo URLs
    sortedPhotos.forEach((photo, index) => {
      const marker = `[PHOTO:${index + 1}]`
      const photoHtml = `<img src="${photo.storage_path}" alt="${photo.caption || 'Photo'}" class="inline-photo" />`
      parsedContent = parsedContent.replace(marker, photoHtml)
    })
    
    return parsedContent
  }

  /**
   * Helper: Insert photo marker at cursor position in text
   */
  static insertPhotoMarker(content: string, cursorPosition: number, photoIndex: number): string {
    const marker = `[PHOTO:${photoIndex}]`
    return content.slice(0, cursorPosition) + marker + content.slice(cursorPosition)
  }

  /**
   * Helper: Extract photo markers from text and return clean text + positions
   */
  static extractPhotoMarkers(content: string): { cleanText: string; photoPositions: Array<{ marker: string; position: number }> } {
    const photoMarkerRegex = /\[PHOTO:(\d+)\]/g
    const photoPositions: Array<{ marker: string; position: number }> = []
    let match
    
    while ((match = photoMarkerRegex.exec(content)) !== null) {
      photoPositions.push({
        marker: match[0],
        position: match.index
      })
    }
    
    // Remove markers from text
    const cleanText = content.replace(photoMarkerRegex, '')
    
    return { cleanText, photoPositions }
  }

  /**
   * Legacy helpers for backward compatibility
   */
  static textAndPhotoToContent(text: string, photoUrl?: string, photoCaption?: string): DiaryContentBlock[] {
    const blocks: DiaryContentBlock[] = []

    if (text.trim()) {
      const paragraphs = text.split('\n\n').filter(p => p.trim())
      paragraphs.forEach(paragraph => {
        blocks.push({
          type: 'paragraph',
          text: paragraph.trim()
        })
      })
    }

    if (photoUrl) {
      blocks.push({
        type: 'image',
        url: photoUrl,
        caption: photoCaption
      })
    }

    return blocks
  }

  static contentToText(content: DiaryContentBlock[] | string): string {
    if (typeof content === 'string') {
      return content
    }
    return content
      .filter(block => block.type === 'paragraph')
      .map(block => block.text)
      .join('\n\n')
  }

  static contentHasPhotos(content: DiaryContentBlock[] | EntryPhoto[]): boolean {
    if (Array.isArray(content) && content.length > 0) {
      if ('type' in content[0]) {
        return (content as DiaryContentBlock[]).some(block => block.type === 'image')
      } else {
        return (content as EntryPhoto[]).length > 0
      }
    }
    return false
  }

  static getFirstPhotoUrl(content: DiaryContentBlock[] | EntryPhoto[]): string | undefined {
    if (Array.isArray(content) && content.length > 0) {
      if ('type' in content[0]) {
        const imageBlock = (content as DiaryContentBlock[]).find(block => block.type === 'image')
        return imageBlock?.url
      } else {
        const firstPhoto = (content as EntryPhoto[])[0]
        return firstPhoto?.storage_path
      }
    }
    return undefined
  }
}