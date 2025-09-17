import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useState } from 'react'
import { MoodCalendarGrid } from '@/components/calendar/MoodCalendarGrid'
import { EntryViewPanel } from '@/components/entry/EntryViewPanel'
import { DiaryEntryDisplay } from '@/lib/types/components'

// Mock data for integration tests
const mockEntries: DiaryEntryDisplay[] = [
  {
    id: 'entry-1',
    date: 17,
    mood: '😊',
    title: 'Great Day',
    content: 'Today was amazing! I accomplished so much.',
    preview: 'Today was amazing!',
    hasPhoto: true,
    photoUrl: 'https://example.com/photo1.jpg'
  },
  {
    id: 'entry-2',
    date: 17,
    mood: '🎉',
    title: 'Party Time',
    content: 'Had a wonderful celebration with friends.',
    preview: 'Had a wonderful celebration',
    hasPhoto: false
  },
  {
    id: 'entry-3',
    date: 25,
    mood: '😢',
    title: 'Difficult Day',
    content: 'Today was challenging but I learned something.',
    preview: 'Today was challenging',
    hasPhoto: false
  }
]

// Integration component that combines calendar and entry panel
function CalendarWithEntryPanel() {
  const [selectedDate, setSelectedDate] = useState<number | undefined>()
  const [currentEntryIndex, setCurrentEntryIndex] = useState(0)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [entries] = useState(mockEntries)

  const handleDateClick = (date: number) => {
    setSelectedDate(date)
    const dateEntries = entries.filter(entry => entry.date === date)
    if (dateEntries.length > 0) {
      setCurrentEntryIndex(0)
      setIsPanelOpen(true)
    }
  }

  const handleEntryClick = (entry: DiaryEntryDisplay) => {
    setSelectedDate(entry.date)
    const allEntries = entries.filter(e => e.date === entry.date)
    const index = allEntries.findIndex(e => e.id === entry.id)
    setCurrentEntryIndex(index)
    setIsPanelOpen(true)
  }

  const handlePanelClose = () => {
    setIsPanelOpen(false)
  }

  const handlePreviousEntry = () => {
    if (selectedDate) {
      const dateEntries = entries.filter(entry => entry.date === selectedDate)
      const newIndex = Math.max(0, currentEntryIndex - 1)
      setCurrentEntryIndex(newIndex)
    }
  }

  const handleNextEntry = () => {
    if (selectedDate) {
      const dateEntries = entries.filter(entry => entry.date === selectedDate)
      const newIndex = Math.min(dateEntries.length - 1, currentEntryIndex + 1)
      setCurrentEntryIndex(newIndex)
    }
  }

  const handleExpand = () => {
    // Mock expand functionality
    console.log('Expanding to fullscreen')
  }

  const handleDelete = (entryId: string) => {
    // Mock delete functionality
    console.log('Deleting entry:', entryId)
  }

  const currentDateEntries = selectedDate 
    ? entries.filter(entry => entry.date === selectedDate)
    : []
  
  const currentEntry = currentDateEntries[currentEntryIndex] || null

  return (
    <div className="flex h-screen">
      <div className="flex-1 p-4">
        <MoodCalendarGrid
          currentMonth={9}
          currentYear={2025}
          entries={entries}
          selectedDate={selectedDate}
          onDateClick={handleDateClick}
          onEntryClick={handleEntryClick}
        />
      </div>
      
      <EntryViewPanel
        entry={currentEntry}
        isOpen={isPanelOpen}
        onClose={handlePanelClose}
        onExpand={handleExpand}
        currentEntryIndex={currentEntryIndex}
        totalEntries={currentDateEntries.length}
        onPreviousEntry={handlePreviousEntry}
        onNextEntry={handleNextEntry}
        onDelete={handleDelete}
      />
    </div>
  )
}

describe('Calendar-Entry Integration', () => {
  describe('Calendar to Entry Panel Flow', () => {
    it('should open entry panel when clicking on date with entries', async () => {
      render(<CalendarWithEntryPanel />)

      // Initially panel should not be visible
      expect(screen.queryByTestId('entry-view-panel')).not.toBeInTheDocument()

      // Click on date 17 which has entries
      fireEvent.click(screen.getByText('17'))

      // Panel should open with first entry
      await waitFor(() => {
        expect(screen.getByTestId('entry-view-panel')).toBeInTheDocument()
      })

      expect(screen.getByText('Great Day')).toBeInTheDocument()
      expect(screen.getByText('1 / 2')).toBeInTheDocument() // Navigation info
    })

    it('should not open panel when clicking on date without entries', () => {
      render(<CalendarWithEntryPanel />)

      // Click on date 5 which has no entries
      fireEvent.click(screen.getByText('5'))

      // Panel should not open
      expect(screen.queryByTestId('entry-view-panel')).not.toBeInTheDocument()
    })

    it('should open panel with correct entry when clicking on mood emoji', async () => {
      render(<CalendarWithEntryPanel />)

      // Click on the party emoji (second entry on date 17)
      fireEvent.click(screen.getByText('🎉'))

      // Panel should open with the party entry
      await waitFor(() => {
        expect(screen.getByTestId('entry-view-panel')).toBeInTheDocument()
      })

      expect(screen.getByText('Party Time')).toBeInTheDocument()
      expect(screen.getByText('2 / 2')).toBeInTheDocument() // Should be second entry
    })
  })

  describe('Entry Panel Navigation', () => {
    it('should navigate between entries on same date', async () => {
      render(<CalendarWithEntryPanel />)

      // Open panel with date 17 (has 2 entries)
      fireEvent.click(screen.getByText('17'))

      await waitFor(() => {
        expect(screen.getByTestId('entry-view-panel')).toBeInTheDocument()
      })

      // Should start with first entry
      expect(screen.getByText('Great Day')).toBeInTheDocument()
      expect(screen.getByText('1 / 2')).toBeInTheDocument()

      // Click next button
      fireEvent.click(screen.getByLabelText('Next entry'))

      // Should show second entry
      expect(screen.getByText('Party Time')).toBeInTheDocument()
      expect(screen.getByText('2 / 2')).toBeInTheDocument()

      // Click previous button
      fireEvent.click(screen.getByLabelText('Previous entry'))

      // Should be back to first entry
      expect(screen.getByText('Great Day')).toBeInTheDocument()
      expect(screen.getByText('1 / 2')).toBeInTheDocument()
    })

    it('should disable navigation buttons at boundaries', async () => {
      render(<CalendarWithEntryPanel />)

      // Open panel with date 17
      fireEvent.click(screen.getByText('17'))

      await waitFor(() => {
        expect(screen.getByTestId('entry-view-panel')).toBeInTheDocument()
      })

      // At first entry, previous should be disabled
      expect(screen.getByLabelText('Previous entry')).toBeDisabled()
      expect(screen.getByLabelText('Next entry')).not.toBeDisabled()

      // Go to last entry
      fireEvent.click(screen.getByLabelText('Next entry'))

      // At last entry, next should be disabled
      expect(screen.getByLabelText('Next entry')).toBeDisabled()
      expect(screen.getByLabelText('Previous entry')).not.toBeDisabled()
    })
  })

  describe('Panel Close and State Management', () => {
    it('should close panel and maintain calendar state', async () => {
      render(<CalendarWithEntryPanel />)

      // Open panel
      fireEvent.click(screen.getByText('17'))

      await waitFor(() => {
        expect(screen.getByTestId('entry-view-panel')).toBeInTheDocument()
      })

      // Close panel
      fireEvent.click(screen.getByLabelText('Close panel'))

      // Panel should be closed
      expect(screen.queryByTestId('entry-view-panel')).not.toBeInTheDocument()

      // Calendar should still show selected date (if implemented)
      const date17Cell = screen.getByText('17').closest('[data-testid="calendar-day"]')
      expect(date17Cell).toBeInTheDocument()
    })

    it('should close panel with Escape key', async () => {
      render(<CalendarWithEntryPanel />)

      // Open panel
      fireEvent.click(screen.getByText('17'))

      await waitFor(() => {
        expect(screen.getByTestId('entry-view-panel')).toBeInTheDocument()
      })

      // Press Escape
      fireEvent.keyDown(screen.getByTestId('entry-view-panel'), { key: 'Escape' })

      // Panel should close
      expect(screen.queryByTestId('entry-view-panel')).not.toBeInTheDocument()
    })
  })

  describe('Keyboard Navigation Integration', () => {
    it('should support arrow key navigation in panel', async () => {
      render(<CalendarWithEntryPanel />)

      // Open panel with date 17
      fireEvent.click(screen.getByText('17'))

      await waitFor(() => {
        expect(screen.getByTestId('entry-view-panel')).toBeInTheDocument()
      })

      const panel = screen.getByTestId('entry-view-panel')

      // Use right arrow to go to next entry
      fireEvent.keyDown(panel, { key: 'ArrowRight' })
      expect(screen.getByText('Party Time')).toBeInTheDocument()

      // Use left arrow to go back
      fireEvent.keyDown(panel, { key: 'ArrowLeft' })
      expect(screen.getByText('Great Day')).toBeInTheDocument()
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle entry deletion gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      render(<CalendarWithEntryPanel />)

      // Open panel
      fireEvent.click(screen.getByText('17'))

      await waitFor(() => {
        expect(screen.getByTestId('entry-view-panel')).toBeInTheDocument()
      })

      // Click delete button
      fireEvent.click(screen.getByLabelText('Delete entry'))

      // Should call delete function
      expect(consoleSpy).toHaveBeenCalledWith('Deleting entry:', 'entry-1')

      consoleSpy.mockRestore()
    })

    it('should handle expand functionality', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      render(<CalendarWithEntryPanel />)

      // Open panel
      fireEvent.click(screen.getByText('17'))

      await waitFor(() => {
        expect(screen.getByTestId('entry-view-panel')).toBeInTheDocument()
      })

      // Click expand button
      fireEvent.click(screen.getByLabelText('Expand to fullscreen'))

      // Should call expand function
      expect(consoleSpy).toHaveBeenCalledWith('Expanding to fullscreen')

      consoleSpy.mockRestore()
    })
  })

  describe('Performance and Rendering', () => {
    it('should render calendar and panel together efficiently', () => {
      const startTime = performance.now()
      
      render(<CalendarWithEntryPanel />)
      
      const endTime = performance.now()
      
      // Should render quickly (less than 50ms)
      expect(endTime - startTime).toBeLessThan(50)
      
      // Both components should be present
      expect(screen.getByTestId('calendar-grid')).toBeInTheDocument()
      // Panel not visible initially
      expect(screen.queryByTestId('entry-view-panel')).not.toBeInTheDocument()
    })
  })
})