'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { DiaryAPI } from './diary-api'
import { DiaryEntry, DiaryEntryDisplay } from './types'

interface DiaryContextType {
  entries: DiaryEntryDisplay[]
  loading: boolean
  error: string | null
  loadEntries: () => Promise<void>
  addEntry: (entry: DiaryEntryDisplay) => void
  updateEntry: (id: string, updates: Partial<DiaryEntryDisplay>) => void
  removeEntry: (id: string) => void
  refreshEntries: () => Promise<void>
  lastLoaded: Date | null
}

const DiaryContext = createContext<DiaryContextType | undefined>(undefined)

interface DiaryProviderProps {
  children: ReactNode
}

export function DiaryProvider({ children }: DiaryProviderProps) {
  const [entries, setEntries] = useState<DiaryEntryDisplay[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastLoaded, setLastLoaded] = useState<Date | null>(null)

  const convertToDisplayEntry = useCallback((entry: DiaryEntry): DiaryEntryDisplay => {
    const entryDate = new Date(entry.date)
    const textContent = typeof entry.content === 'string' ? entry.content : String(entry.content || '') // Safe conversion
    
    return {
      id: entry.id,
      date: entryDate.getDate(),
      mood: entry.mood,
      title: entry.title || '',
      content: textContent,
      preview: textContent.length > 100 ? textContent.substring(0, 100) + '...' : textContent,
      hasPhoto: !!(entry.photos && entry.photos.length > 0),
      photoUrl: entry.photos && entry.photos.length > 0 ? entry.photos[0].storage_path : undefined,
      aiReflection: entry.ai_chats && entry.ai_chats.length > 0 ? {
        summary: entry.summary || 'AI conversation available',
        chatHistory: entry.ai_chats.map((chat, index) => ({
          id: index.toString(),
          type: chat.speaker === 'user' ? 'user' : 'ai',
          content: chat.message,
          timestamp: new Date(chat.timestamp)
        })),
        savedAt: new Date(entry.updated_at)
      } : undefined
    }
  }, [])

  const loadEntries = useCallback(async () => {
    // Skip loading if data is fresh (loaded within last 30 seconds)
    if (lastLoaded && Date.now() - lastLoaded.getTime() < 30000 && entries.length > 0) {
      console.log('Using cached entries, skipping API call')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const result = await DiaryAPI.getEntries()
      if (result.error) {
        throw new Error(result.error)
      }

      const displayEntries = (result.data || []).map(convertToDisplayEntry)
      setEntries(displayEntries)
      setLastLoaded(new Date())
      
      console.log('Loaded entries from API:', displayEntries.length)
    } catch (err) {
      console.error('Error loading entries:', err)
      setError(err instanceof Error ? err.message : 'Failed to load entries')
    } finally {
      setLoading(false)
    }
  }, [lastLoaded, entries.length, convertToDisplayEntry])

  const refreshEntries = useCallback(async () => {
    setLastLoaded(null) // Force refresh
    await loadEntries()
  }, [loadEntries])

  const addEntry = useCallback((entry: DiaryEntryDisplay) => {
    setEntries(prev => {
      // Check if entry already exists
      const exists = prev.some(e => e.id === entry.id)
      if (exists) {
        // Update existing entry
        return prev.map(e => e.id === entry.id ? entry : e)
      }
      // Add new entry at the beginning (most recent first)
      return [entry, ...prev]
    })
    console.log('Added/Updated entry in cache:', entry.id)
  }, [])

  const updateEntry = useCallback((id: string, updates: Partial<DiaryEntryDisplay>) => {
    setEntries(prev => 
      prev.map(entry => 
        entry.id === id ? { ...entry, ...updates } : entry
      )
    )
    console.log('Updated entry in cache:', id)
  }, [])

  const removeEntry = useCallback((id: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== id))
    console.log('Removed entry from cache:', id)
  }, [])

  const value: DiaryContextType = {
    entries,
    loading,
    error,
    loadEntries,
    addEntry,
    updateEntry,
    removeEntry,
    refreshEntries,
    lastLoaded
  }

  return (
    <DiaryContext.Provider value={value}>
      {children}
    </DiaryContext.Provider>
  )
}

export function useDiary() {
  const context = useContext(DiaryContext)
  if (context === undefined) {
    throw new Error('useDiary must be used within a DiaryProvider')
  }
  return context
}