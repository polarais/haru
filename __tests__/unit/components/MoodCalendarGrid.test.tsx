import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { MoodCalendarGrid } from '@/components/calendar/MoodCalendarGrid'
import { DiaryEntryDisplay } from '@/lib/types/components'

describe('MoodCalendarGrid', () => {
  const mockOnDateClick = jest.fn()
  const mockOnEntryClick = jest.fn()

  const mockEntries: DiaryEntryDisplay[] = [
    {
      id: '1',
      date: 17,
      mood: '😊',
      title: 'Happy Day',
      content: 'Great day today!',
      preview: 'Great day today!',
      hasPhoto: false
    },
    {
      id: '2',
      date: 17,
      mood: '🎉',
      title: 'Celebration',
      content: 'Party time!',
      preview: 'Party time!',
      hasPhoto: true,
      photoUrl: 'https://example.com/photo.jpg'
    },
    {
      id: '3',
      date: 25,
      mood: '😢',
      title: 'Sad Day',
      content: 'Not a good day',
      preview: 'Not a good day',
      hasPhoto: false
    }
  ]

  const defaultProps = {
    currentMonth: 9, // September
    currentYear: 2025,
    entries: mockEntries,
    selectedDate: undefined,
    onDateClick: mockOnDateClick,
    onEntryClick: mockOnEntryClick
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Calendar Structure', () => {
    it('should render weekday headers', () => {
      render(<MoodCalendarGrid {...defaultProps} />)

      expect(screen.getByText('일')).toBeInTheDocument()
      expect(screen.getByText('월')).toBeInTheDocument()
      expect(screen.getByText('화')).toBeInTheDocument()
      expect(screen.getByText('수')).toBeInTheDocument()
      expect(screen.getByText('목')).toBeInTheDocument()
      expect(screen.getByText('금')).toBeInTheDocument()
      expect(screen.getByText('토')).toBeInTheDocument()
    })

    it('should render all days of the month', () => {
      render(<MoodCalendarGrid {...defaultProps} />)

      // September 2025 has 30 days
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('15')).toBeInTheDocument()
      expect(screen.getByText('30')).toBeInTheDocument()
      
      // Should not show day 31 for September
      expect(screen.queryByText('31')).not.toBeInTheDocument()
    })

    it('should render calendar with 7 columns grid', () => {
      render(<MoodCalendarGrid {...defaultProps} />)

      const calendarGrid = screen.getByTestId('calendar-grid')
      expect(calendarGrid).toHaveClass('grid-cols-7')
    })

    it('should render proper number of empty cells for month start', () => {
      // September 2025 starts on Monday (day 1), so should have 1 empty cell
      render(<MoodCalendarGrid {...defaultProps} />)

      const emptyCells = screen.getAllByTestId('empty-cell')
      expect(emptyCells).toHaveLength(1) // September 1, 2025 starts on Monday
    })
  })

  describe('Entry Display', () => {
    it('should display entries on correct dates', () => {
      render(<MoodCalendarGrid {...defaultProps} />)

      // Date 17 should have 2 entries
      const date17Cell = screen.getByText('17').closest('[data-testid="calendar-day"]')
      expect(date17Cell).toContainElement(screen.getByText('😊'))
      expect(date17Cell).toContainElement(screen.getByText('🎉'))

      // Date 25 should have 1 entry
      const date25Cell = screen.getByText('25').closest('[data-testid="calendar-day"]')
      expect(date25Cell).toContainElement(screen.getByText('😢'))
    })

    it('should not display entries on dates without entries', () => {
      render(<MoodCalendarGrid {...defaultProps} />)

      // Date 1 should have no entries
      const date1Cell = screen.getByText('1').closest('[data-testid="calendar-day"]')
      expect(date1Cell).not.toContainElement(screen.queryByText('😊'))
      expect(date1Cell).not.toContainElement(screen.queryByText('😢'))
    })
  })

  describe('Selection State', () => {
    it('should highlight selected date', () => {
      render(<MoodCalendarGrid {...defaultProps} selectedDate={17} />)

      const selectedCell = screen.getByText('17').closest('[data-testid="calendar-day"]')
      expect(selectedCell).toHaveClass('ring-2', 'ring-pink-500')
    })

    it('should not highlight any date when no selection', () => {
      render(<MoodCalendarGrid {...defaultProps} selectedDate={undefined} />)

      const allCells = screen.getAllByTestId('calendar-day')
      allCells.forEach(cell => {
        expect(cell).not.toHaveClass('ring-2', 'ring-pink-500')
      })
    })
  })

  describe('Interactions', () => {
    it('should call onDateClick when date is clicked', () => {
      render(<MoodCalendarGrid {...defaultProps} />)

      fireEvent.click(screen.getByText('15'))
      expect(mockOnDateClick).toHaveBeenCalledWith(15)
    })

    it('should call onEntryClick when entry mood is clicked', () => {
      render(<MoodCalendarGrid {...defaultProps} />)

      fireEvent.click(screen.getByText('😊'))
      expect(mockOnEntryClick).toHaveBeenCalledWith(mockEntries[0])
    })

    it('should call onDateClick for empty dates', () => {
      render(<MoodCalendarGrid {...defaultProps} />)

      // Click on date 5 which has no entries
      fireEvent.click(screen.getByText('5'))
      expect(mockOnDateClick).toHaveBeenCalledWith(5)
    })
  })

  describe('Different Months', () => {
    it('should render February correctly (28 days)', () => {
      render(
        <MoodCalendarGrid 
          {...defaultProps} 
          currentMonth={2} 
          currentYear={2025} 
          entries={[]}
        />
      )

      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('28')).toBeInTheDocument()
      expect(screen.queryByText('29')).not.toBeInTheDocument()
    })

    it('should render leap year February correctly (29 days)', () => {
      render(
        <MoodCalendarGrid 
          {...defaultProps} 
          currentMonth={2} 
          currentYear={2024} // 2024 is a leap year
          entries={[]}
        />
      )

      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('29')).toBeInTheDocument()
      expect(screen.queryByText('30')).not.toBeInTheDocument()
    })

    it('should render December correctly (31 days)', () => {
      render(
        <MoodCalendarGrid 
          {...defaultProps} 
          currentMonth={12} 
          currentYear={2025}
          entries={[]}
        />
      )

      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('31')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      render(<MoodCalendarGrid {...defaultProps} />)

      const calendarGrid = screen.getByTestId('calendar-grid')
      expect(calendarGrid).toHaveAttribute('role', 'grid')
      expect(calendarGrid).toHaveAttribute('aria-label', 'Calendar for September 2025')
    })

    it('should have proper weekday headers with column headers role', () => {
      render(<MoodCalendarGrid {...defaultProps} />)

      const sundayHeader = screen.getByText('일')
      expect(sundayHeader).toHaveAttribute('role', 'columnheader')
    })
  })

  describe('Performance', () => {
    it('should handle large number of entries efficiently', () => {
      const manyEntries: DiaryEntryDisplay[] = Array.from({ length: 100 }, (_, i) => ({
        id: `entry-${i}`,
        date: (i % 30) + 1, // Distribute across month
        mood: '😊',
        title: `Entry ${i}`,
        content: `Content ${i}`,
        preview: `Preview ${i}`,
        hasPhoto: false
      }))

      const startTime = performance.now()
      render(<MoodCalendarGrid {...defaultProps} entries={manyEntries} />)
      const endTime = performance.now()

      // Should render in reasonable time (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty entries array', () => {
      render(<MoodCalendarGrid {...defaultProps} entries={[]} />)

      // Should still render all dates without errors
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('30')).toBeInTheDocument()
    })

    it('should handle entries with date outside month range', () => {
      const invalidEntries: DiaryEntryDisplay[] = [
        {
          id: '1',
          date: 32, // Invalid date for any month
          mood: '😊',
          title: 'Invalid',
          content: 'Should not show',
          preview: 'Should not show',
          hasPhoto: false
        }
      ]

      render(<MoodCalendarGrid {...defaultProps} entries={invalidEntries} />)

      // Should render without errors and not show the invalid entry
      expect(screen.queryByText('😊')).not.toBeInTheDocument()
    })
  })
})