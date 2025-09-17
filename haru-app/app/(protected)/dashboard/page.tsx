'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MoodCalendar } from '@/components/mood-calendar'
import { EntryTimeline } from '@/components/entry-timeline'
import { EntryViewPanel } from '@/components/entry-view-panel'
import { FloatingAddButton } from '@/components/floating-add-button'
import { DiaryAPI } from '@/lib/diary-api'
import { DiaryEntry, DiaryEntryDisplay } from '@/lib/types'
import { useLayout } from '../layout'

export default function DashboardPage() {
  const { currentView } = useLayout()
  const router = useRouter()
  const [entries, setEntries] = useState<DiaryEntryDisplay[]>([])
  const [selectedDate, setSelectedDate] = useState<number>()
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth() + 1)
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear())
  const [viewingEntry, setViewingEntry] = useState<DiaryEntryDisplay | null>(null)
  const [currentEntryIndex, setCurrentEntryIndex] = useState<number>(0)
  const [isEntryPanelOpen, setIsEntryPanelOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingError, setLoadingError] = useState<string | null>(null)

  // Load real diary entries from Supabase
  useEffect(() => {
    const loadEntries = async () => {
      try {
        setLoading(true)
        setLoadingError(null)
        
        const result = await DiaryAPI.getEntries()
        if (result.error) {
          throw new Error(result.error)
        }

        // Convert DiaryEntry to DiaryEntryDisplay for UI
        const displayEntries: DiaryEntryDisplay[] = (result.data || []).map(entry => {
          const entryDate = new Date(entry.date)
          const textContent = DiaryAPI.contentToText(entry.content)
          
          return {
            id: entry.id,
            date: entryDate.getDate(),
            mood: entry.mood,
            title: entry.title || 'Untitled Entry',
            content: textContent,
            preview: textContent.length > 100 ? textContent.substring(0, 100) + '...' : textContent,
            hasPhoto: DiaryAPI.contentHasPhotos(entry.content),
            photoUrl: DiaryAPI.getFirstPhotoUrl(entry.content),
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
        })

        setEntries(displayEntries)
      } catch (error) {
        console.error('Error loading entries:', error)
        setLoadingError(error instanceof Error ? error.message : 'Failed to load entries')
      } finally {
        setLoading(false)
      }
    }

    loadEntries()
  }, [])

  const getEntriesForDate = (date: number) => {
    return entries.filter(entry => entry.date === date)
  }

  const handleDateClick = (date: number) => {
    const dayEntries = getEntriesForDate(date)
    
    if (dayEntries.length === 0) {
      // Navigate to write page with selected date
      router.push(`/write?date=${date}`)
    } else {
      // Show first entry in panel
      const firstEntry = dayEntries[0]
      
      // Get all entries sorted by date and ID
      const sortedEntries = [...entries].sort((a, b) => {
        if (a.date !== b.date) {
          return a.date - b.date
        }
        return a.id.localeCompare(b.id)
      })
      const entryIndex = sortedEntries.findIndex(e => e.id === firstEntry.id)
      
      setViewingEntry(firstEntry)
      setCurrentEntryIndex(entryIndex !== -1 ? entryIndex : 0)
      setIsEntryPanelOpen(true)
      setSelectedDate(date)
    }
  }

  const handleEntryClick = (entry: DiaryEntry) => {
    // Get all entries sorted by date and ID
    const sortedEntries = [...entries].sort((a, b) => {
      if (a.date !== b.date) {
        return a.date - b.date
      }
      return a.id.localeCompare(b.id)
    })
    const entryIndex = sortedEntries.findIndex(e => e.id === entry.id)
    
    setViewingEntry(entry)
    setCurrentEntryIndex(entryIndex !== -1 ? entryIndex : 0)
    setIsEntryPanelOpen(true)
    setSelectedDate(entry.date)
  }

  const handlePreviousEntry = () => {
    if (!viewingEntry) return
    
    const sortedEntries = [...entries].sort((a, b) => {
      if (a.date !== b.date) {
        return a.date - b.date
      }
      return a.id.localeCompare(b.id)
    })
    const currentIndex = sortedEntries.findIndex(entry => entry.id === viewingEntry.id)
    
    if (currentIndex === -1) return
    
    const newIndex = currentIndex > 0 ? currentIndex - 1 : sortedEntries.length - 1
    const newEntry = sortedEntries[newIndex]
    
    setViewingEntry(newEntry)
    setSelectedDate(newEntry.date)
    setCurrentEntryIndex(newIndex)
  }

  const handleNextEntry = () => {
    if (!viewingEntry) return
    
    const sortedEntries = [...entries].sort((a, b) => {
      if (a.date !== b.date) {
        return a.date - b.date
      }
      return a.id.localeCompare(b.id)
    })
    const currentIndex = sortedEntries.findIndex(entry => entry.id === viewingEntry.id)
    
    if (currentIndex === -1) return
    
    const newIndex = currentIndex < sortedEntries.length - 1 ? currentIndex + 1 : 0
    const newEntry = sortedEntries[newIndex]
    
    setViewingEntry(newEntry)
    setSelectedDate(newEntry.date)
    setCurrentEntryIndex(newIndex)
  }

  const handleCloseEntryPanel = () => {
    setIsEntryPanelOpen(false)
    setViewingEntry(null)
    setSelectedDate(undefined)
    setCurrentEntryIndex(0)
  }

  const handleExpandToFullScreen = () => {
    if (viewingEntry) {
      router.push(`/write?id=${viewingEntry.id}&date=${viewingEntry.date}`)
    }
  }

  const handleDeleteEntry = async (entry: DiaryEntryDisplay) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${entry.title}"? This action cannot be undone.`
    )
    
    if (!confirmed) return

    try {
      const result = await DiaryAPI.deleteEntry(entry.id)
      if (result.error) {
        alert(`Failed to delete entry: ${result.error}`)
        return
      }

      // Remove from local state
      setEntries(prev => prev.filter(e => e.id !== entry.id))
      
      if (viewingEntry && viewingEntry.id === entry.id) {
        handleCloseEntryPanel()
      }
    } catch (error) {
      console.error('Error deleting entry:', error)
      alert('Failed to delete entry. Please try again.')
    }
  }

  const handlePreviousMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
    // Close panel when navigating months
    setIsEntryPanelOpen(false)
    setViewingEntry(null)
    setSelectedDate(undefined)
  }

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
    // Close panel when navigating months
    setIsEntryPanelOpen(false)
    setViewingEntry(null)
    setSelectedDate(undefined)
  }

  const handleGoToToday = () => {
    const today = new Date()
    const todayMonth = today.getMonth() + 1
    const todayYear = today.getFullYear()
    
    if (currentMonth !== todayMonth || currentYear !== todayYear) {
      setCurrentMonth(todayMonth)
      setCurrentYear(todayYear)
    }
    
    setIsEntryPanelOpen(false)
    setViewingEntry(null)
    setSelectedDate(undefined)
  }

  const handleAddNewEntry = () => {
    const today = new Date().getDate()
    const todayEntries = getEntriesForDate(today)
    
    // Check if user has already written 3 entries today
    if (todayEntries.length >= 3) {
      alert('You have already written 3 entries today. Come back tomorrow to write more!')
      return
    }
    
    // Navigate to write page for today
    router.push(`/write?date=${today}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">💕</span>
          </div>
          <p className="text-gray-600">Loading your entries...</p>
        </div>
      </div>
    )
  }

  if (loadingError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">⚠️</span>
          </div>
          <p className="text-red-600 mb-4">{loadingError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 flex flex-col relative">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-10">
        <div className="px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-gray-800 font-medium">
                {currentView === 'calendar' ? 'Calendar' : 'Time Table'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {currentView === 'calendar' 
                  ? 'Track your daily moods and memories' 
                  : 'Review all your journal entries'
                }
              </p>
            </div>
            {/* Today Button - Only show in calendar view */}
            {currentView === 'calendar' && (
              <div className="flex flex-col items-end">
                <button 
                  onClick={handleGoToToday}
                  className="px-4 py-2 rounded-lg bg-pink-100 hover:bg-pink-200 transition-colors"
                >
                  <span className="text-pink-700">Today</span>
                </button>
                <p className="text-xs text-gray-500 mt-1">
                  Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-1 p-4 lg:p-6 overflow-hidden relative">
        {currentView === 'calendar' ? (
          <div className="max-w-4xl mx-auto h-full flex items-center justify-center">
            <div className="w-full h-full lg:h-auto">
              <MoodCalendar 
                onDateClick={handleDateClick}
                onEntryClick={handleEntryClick}
                onAddNewEntry={handleDateClick}
                selectedDate={selectedDate}
                entries={entries}
                currentMonth={currentMonth}
                currentYear={currentYear}
                onPreviousMonth={handlePreviousMonth}
                onNextMonth={handleNextMonth}
              />
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto h-full flex items-center justify-center">
            <div className="w-full h-full lg:h-auto">
              <div className="bg-white rounded-xl p-4 lg:p-8 shadow-sm border border-gray-100 h-full lg:h-[calc(100vh-12rem)]">
                <EntryTimeline 
                  entries={entries} 
                  onEntryClick={handleEntryClick}
                />
              </div>
            </div>
          </div>
        )}

        {/* Entry View Panel - Desktop */}
        <div className="hidden lg:block">
          <EntryViewPanel
            entry={viewingEntry}
            isOpen={isEntryPanelOpen}
            onClose={handleCloseEntryPanel}
            onExpand={handleExpandToFullScreen}
            currentEntryIndex={currentEntryIndex}
            totalEntries={entries.length}
            onPreviousEntry={handlePreviousEntry}
            onNextEntry={handleNextEntry}
            onDelete={handleDeleteEntry}
          />
        </div>

        {/* Entry View Panel - Mobile (Full Screen) */}
        {isEntryPanelOpen && viewingEntry && (
          <div className="lg:hidden fixed inset-0 bg-white z-50">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-800">Entry Details</h2>
                <button
                  onClick={handleCloseEntryPanel}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <span className="text-gray-600">×</span>
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                {/* Mobile entry content would go here */}
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{viewingEntry.mood}</span>
                    <div>
                      <h3 className="text-lg font-medium text-gray-800">{viewingEntry.title}</h3>
                      <p className="text-sm text-gray-500">Created today</p>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {viewingEntry.content}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <FloatingAddButton onClick={handleAddNewEntry} />
    </div>
  )
}