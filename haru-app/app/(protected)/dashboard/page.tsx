'use client'

import { useState, useEffect } from 'react'
import { MoodCalendar } from '@/components/mood-calendar'
import { EntryTimeline } from '@/components/entry-timeline'
import { EntryViewPanel } from '@/components/entry-view-panel'
import { useLayout } from '../layout'

interface DiaryEntry {
  id: string
  date: number
  mood: string
  title: string
  content: string
  preview: string
  hasPhoto?: boolean
  photoUrl?: string
  photoFile?: File
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

export default function DashboardPage() {
  const { currentView } = useLayout()
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [selectedDate, setSelectedDate] = useState<number>()
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth() + 1)
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear())
  const [viewingEntry, setViewingEntry] = useState<DiaryEntry | null>(null)
  const [currentEntryIndex, setCurrentEntryIndex] = useState<number>(0)
  const [isEntryPanelOpen, setIsEntryPanelOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // 임시 샘플 데이터 - resources와 동일한 구조
  useEffect(() => {
    const today = new Date().getDate()
    const sampleEntries: DiaryEntry[] = [
      {
        id: '1',
        date: today,
        mood: '😊',
        title: 'Morning Gratitude',
        content: 'This morning, watching the sunlight stream through my window, I felt grateful for all the little things in life. I made my favorite coffee and sat by the window, watching the world wake up.\n\nThere\'s something magical about the early hours when everything feels fresh and full of possibilities. Today feels like it\'s going to be a good day.',
        preview: 'This morning, watching the sunlight stream through my window, I felt grateful for all the little things...',
        hasPhoto: false
      },
      {
        id: '5',
        date: today,
        mood: '🌟',
        title: 'Evening Reflection',
        content: 'What a beautiful day it has been! After my morning gratitude session, I spent the day working on my passion project. There\'s something magical about following your dreams.\n\nI feel so energized and motivated. Every small step counts.',
        preview: 'What a beautiful day it has been! After my morning gratitude session, I spent the day working...',
        hasPhoto: false
      },
      {
        id: '7',
        date: today,
        mood: '🎵',
        title: 'Afternoon Music',
        content: 'Spent some time playing my guitar this afternoon. Music has this incredible way of expressing feelings that words sometimes can\'t capture.\n\nI played some of my favorite songs and even tried writing a new melody. Music is truly therapeutic.',
        preview: 'Spent some time playing my guitar this afternoon. Music has this incredible way of expressing feelings...',
        hasPhoto: false
      },
      {
        id: '2',
        date: today - 1,
        mood: '😌',
        title: 'Peaceful Evening',
        content: 'Had a quiet dinner by myself tonight. Sometimes solitude feels like the most precious gift. I spent time reading my favorite book and felt completely at peace with the world.',
        preview: 'Had a quiet dinner by myself tonight. Sometimes solitude feels like the most precious gift...',
        hasPhoto: false,
        aiReflection: {
          summary: 'You found deep contentment in solitude and self-care. This entry reflects a healthy relationship with being alone and the value you place on quiet moments of reflection.',
          chatHistory: [
            {
              id: '1',
              type: 'user',
              content: 'I had such a peaceful evening alone. Is it weird that I enjoyed it more than going out?',
              timestamp: new Date()
            },
            {
              id: '2',
              type: 'ai',
              content: 'Not at all! Enjoying solitude is a sign of emotional maturity. It shows you\'re comfortable with yourself and can find joy in simple pleasures.',
              timestamp: new Date()
            }
          ],
          savedAt: new Date()
        }
      },
      {
        id: '6',
        date: today - 1,
        mood: '📚',
        title: 'Reading Session',
        content: 'Continued reading that fascinating novel I started yesterday. The characters feel so real, and their journey resonates with my own experiences. Books have this amazing power to transport us.',
        preview: 'Continued reading that fascinating novel I started yesterday. The characters feel so real...',
        hasPhoto: false
      },
      {
        id: '3',
        date: today - 2,
        mood: '🥰',
        title: 'Warm Meeting with Friends',
        content: 'Met with a friend after a long time and had a long conversation at a cafe. We shared updates about our lives, laughed together, and had meaningful discussions. I realized how precious these moments are.',
        preview: 'Met with a friend after a long time and had a long conversation at a cafe. We shared updates...',
        hasPhoto: false
      }
    ]
    
    setEntries(sampleEntries)
    setLoading(false)
  }, [])

  const getEntriesForDate = (date: number) => {
    return entries.filter(entry => entry.date === date)
  }

  const handleDateClick = (date: number) => {
    const dayEntries = getEntriesForDate(date)
    
    if (dayEntries.length === 0) {
      // TODO: Navigate to write page
      console.log('Add new entry for date:', date)
      setSelectedDate(date)
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
    // TODO: Navigate to full screen edit mode
    console.log('Expand to full screen:', viewingEntry)
  }

  const handleDeleteEntry = (entry: DiaryEntry) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${entry.title}"? This action cannot be undone.`
    )
    
    if (!confirmed) return

    setEntries(prev => prev.filter(e => e.id !== entry.id))
    
    if (viewingEntry && viewingEntry.id === entry.id) {
      handleCloseEntryPanel()
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">💕</span>
          </div>
          <p className="text-gray-600">Loading...</p>
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
    </div>
  )
}