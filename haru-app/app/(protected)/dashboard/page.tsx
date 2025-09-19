'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MoodCalendar } from '@/components/mood-calendar'
import { EntryTimeline } from '@/components/entry-timeline'
import { EntryViewPanel } from '@/components/entry/EntryViewPanel'
import { FloatingAddButton } from '@/components/floating-add-button'
import { GradientBackground } from '@/components/ui/gradient-background'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ConfirmModal } from '@/components/ui/confirm-modal'
import { StickyHeader } from '@/components/ui/sticky-header'
import { DashboardHeader } from '@/components/ui/dashboard-header'
import { InlineContentRenderer } from '@/components/ui/inline-content-renderer'
import { DiaryAPI } from '@/lib/diary-api'
import { DiaryEntry, DiaryEntryDisplay } from '@/lib/types'
import { useLayout } from '../layout'
import { useDiary } from '@/lib/diary-context'

export default function DashboardPage() {
  const { currentView } = useLayout()
  const router = useRouter()
  const { 
    entries, 
    loading, 
    error: loadingError, 
    loadEntries, 
    removeEntry,
    refreshEntries 
  } = useDiary()

  const [selectedDate, setSelectedDate] = useState<number>()
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth() + 1)
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear())
  const [viewingEntry, setViewingEntry] = useState<DiaryEntryDisplay | null>(null)
  const [currentEntryIndex, setCurrentEntryIndex] = useState<number>(0)
  const [isEntryPanelOpen, setIsEntryPanelOpen] = useState(false)
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean
    entry: DiaryEntryDisplay | null
  }>({ isOpen: false, entry: null })
  const [deleteAllConfirmModal, setDeleteAllConfirmModal] = useState<{
    isOpen: boolean
    isPermanent: boolean
  }>({ isOpen: false, isPermanent: false })
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    type: 'info' | 'warning' | 'danger'
  }>({ isOpen: false, title: '', message: '', type: 'info' })

  // Load entries using context (with caching)
  useEffect(() => {
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

  const handleEntryClick = (entry: DiaryEntryDisplay) => {
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

  const handleDeleteEntry = (entry: DiaryEntryDisplay) => {
    setDeleteConfirmModal({ isOpen: true, entry })
  }

  const handleConfirmDelete = async () => {
    const entry = deleteConfirmModal.entry
    if (!entry) return

    try {
      const result = await DiaryAPI.deleteEntry(entry.id)
      if (result.error) {
        showAlert('Delete Failed', `Failed to delete entry: ${result.error}`, 'danger')
        return
      }

      // Remove from context
      removeEntry(entry.id)
      
      if (viewingEntry && viewingEntry.id === entry.id) {
        handleCloseEntryPanel()
      }
    } catch (error) {
      console.error('Error deleting entry:', error)
      showAlert('Delete Failed', 'Failed to delete entry. Please try again.', 'danger')
    }
  }

  const handleCloseDeleteModal = () => {
    setDeleteConfirmModal({ isOpen: false, entry: null })
  }

  const handleDeleteAllEntries = (isPermanent: boolean = false) => {
    setDeleteAllConfirmModal({ isOpen: true, isPermanent })
  }

  const handleConfirmDeleteAll = async () => {
    const { isPermanent } = deleteAllConfirmModal

    try {
      const result = isPermanent 
        ? await DiaryAPI.permanentlyDeleteAllEntries()
        : await DiaryAPI.deleteAllEntries()
      
      if (result.error) {
        showAlert('Delete Failed', `Failed to delete all entries: ${result.error}`, 'danger')
        return
      }

      const deletedCount = result.data?.deletedCount || 0
      
      if (deletedCount === 0) {
        showAlert('No Entries', 'No entries found to delete.', 'info')
      } else {
        showAlert(
          'Success', 
          `Successfully ${isPermanent ? 'permanently ' : ''}deleted ${deletedCount} entries.`, 
          'info'
        )
        
        // Refresh entries from API
        await refreshEntries()
        
        if (viewingEntry) {
          handleCloseEntryPanel()
        }
      }
    } catch (error) {
      console.error('Error deleting all entries:', error)
      showAlert('Delete Failed', 'Failed to delete all entries. Please try again.', 'danger')
    }
  }

  const handleCloseDeleteAllModal = () => {
    setDeleteAllConfirmModal({ isOpen: false, isPermanent: false })
  }

  const showAlert = (title: string, message: string, type: 'info' | 'warning' | 'danger' = 'info') => {
    setAlertModal({ isOpen: true, title, message, type })
  }

  const handleCloseAlert = () => {
    setAlertModal({ isOpen: false, title: '', message: '', type: 'info' })
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
      showAlert(
        'Daily Limit Reached', 
        'You have already written 3 entries today. Come back tomorrow to write more!', 
        'warning'
      )
      return
    }
    
    // Navigate to write page for today
    router.push(`/write?date=${today}`)
  }

  if (loading) {
    return (
      <GradientBackground className="min-h-screen flex items-center justify-center">
        <LoadingSpinner variant="spinner" />
      </GradientBackground>
    )
  }

  if (loadingError) {
    return (
      <GradientBackground className="min-h-screen flex items-center justify-center">
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
      </GradientBackground>
    )
  }

  return (
    <GradientBackground className="min-h-screen flex relative">
      {/* Navigation Loading Overlay - Removed for instant navigation */}
      {/* Sidebar space placeholder when panel is open */}
      <div className={`
        hidden lg:block h-screen transition-all duration-300 ease-in-out flex-shrink-0
        ${isEntryPanelOpen ? '-translate-x-full opacity-0 w-0' : 'translate-x-0 opacity-100 w-0'}
      `} />

      {/* Main Content Area */}
      <div className={`
        flex-1 flex flex-col transition-all duration-300 ease-in-out
        ${isEntryPanelOpen ? 'lg:mr-[28rem]' : ''}
      `}>
        {/* Header */}
        <StickyHeader>
          <DashboardHeader 
            currentView={currentView}
            onGoToToday={handleGoToToday}
            onDeleteAllEntries={handleDeleteAllEntries}
            entriesCount={entries.length}
          />
        </StickyHeader>

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
        </div>
      </div>

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
                <div className="text-gray-700 leading-relaxed">
                  <InlineContentRenderer content={viewingEntry.content} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Add Button */}
      <FloatingAddButton onClick={handleAddNewEntry} />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmModal.isOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Delete Entry"
        message={`Are you sure you want to delete "${deleteConfirmModal.entry?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Delete All Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteAllConfirmModal.isOpen}
        onClose={handleCloseDeleteAllModal}
        onConfirm={handleConfirmDeleteAll}
        title={deleteAllConfirmModal.isPermanent ? "Permanently Delete All Entries" : "Delete All Entries"}
        message={
          deleteAllConfirmModal.isPermanent 
            ? `Are you sure you want to PERMANENTLY delete all ${entries.length} diary entries? This action CANNOT be undone and all data will be lost forever!`
            : `Are you sure you want to delete all ${entries.length} diary entries? They will be marked as deleted but can be recovered if needed.`
        }
        confirmText={deleteAllConfirmModal.isPermanent ? "Delete Forever" : "Delete All"}
        cancelText="Cancel"
        type="danger"
      />

      {/* Alert Modal */}
      <ConfirmModal
        isOpen={alertModal.isOpen}
        onClose={handleCloseAlert}
        onConfirm={handleCloseAlert}
        title={alertModal.title}
        message={alertModal.message}
        confirmText="OK"
        cancelText=""
        type={alertModal.type}
      />
    </GradientBackground>
  )
}