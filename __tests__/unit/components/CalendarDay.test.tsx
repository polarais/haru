import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { CalendarDay } from '@/components/calendar/CalendarDay'
import { DiaryEntryDisplay } from '@/lib/types/components'

describe('CalendarDay', () => {
  const mockOnDateClick = jest.fn()
  const mockOnEntryClick = jest.fn()

  const mockEntry: DiaryEntryDisplay = {
    id: '1',
    date: 17,
    mood: '😊',
    title: 'Happy Day',
    content: 'Today was a great day!',
    preview: 'Today was a great day!',
    hasPhoto: false
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render date number', () => {
      render(
        <CalendarDay
          date={17}
          entries={[]}
          isSelected={false}
          onDateClick={mockOnDateClick}
          onEntryClick={mockOnEntryClick}
        />
      )

      expect(screen.getByText('17')).toBeInTheDocument()
    })

    it('should render with calendar-day test id', () => {
      render(
        <CalendarDay
          date={17}
          entries={[]}
          isSelected={false}
          onDateClick={mockOnDateClick}
          onEntryClick={mockOnEntryClick}
        />
      )

      expect(screen.getByTestId('calendar-day')).toBeInTheDocument()
    })
  })

  describe('Entry Display', () => {
    it('should display mood emoji when entry exists', () => {
      render(
        <CalendarDay
          date={17}
          entries={[mockEntry]}
          isSelected={false}
          onDateClick={mockOnDateClick}
          onEntryClick={mockOnEntryClick}
        />
      )

      expect(screen.getByText('😊')).toBeInTheDocument()
    })

    it('should display multiple mood emojis for multiple entries', () => {
      const multipleEntries: DiaryEntryDisplay[] = [
        { ...mockEntry, id: '1', mood: '😊' },
        { ...mockEntry, id: '2', mood: '😢' },
        { ...mockEntry, id: '3', mood: '🎉' }
      ]

      render(
        <CalendarDay
          date={17}
          entries={multipleEntries}
          isSelected={false}
          onDateClick={mockOnDateClick}
          onEntryClick={mockOnEntryClick}
        />
      )

      expect(screen.getByText('😊')).toBeInTheDocument()
      expect(screen.getByText('😢')).toBeInTheDocument()
      expect(screen.getByText('🎉')).toBeInTheDocument()
    })

    it('should not display mood emojis when no entries', () => {
      render(
        <CalendarDay
          date={17}
          entries={[]}
          isSelected={false}
          onDateClick={mockOnDateClick}
          onEntryClick={mockOnEntryClick}
        />
      )

      // 숫자만 있고 이모지는 없어야 함
      expect(screen.getByText('17')).toBeInTheDocument()
      expect(screen.queryByText('😊')).not.toBeInTheDocument()
    })
  })

  describe('Selection State', () => {
    it('should apply selected styles when isSelected is true', () => {
      render(
        <CalendarDay
          date={17}
          entries={[]}
          isSelected={true}
          onDateClick={mockOnDateClick}
          onEntryClick={mockOnEntryClick}
        />
      )

      const dayElement = screen.getByTestId('calendar-day')
      expect(dayElement).toHaveClass('ring-2', 'ring-pink-500')
    })

    it('should not apply selected styles when isSelected is false', () => {
      render(
        <CalendarDay
          date={17}
          entries={[]}
          isSelected={false}
          onDateClick={mockOnDateClick}
          onEntryClick={mockOnEntryClick}
        />
      )

      const dayElement = screen.getByTestId('calendar-day')
      expect(dayElement).not.toHaveClass('ring-2', 'ring-pink-500')
    })
  })

  describe('Click Interactions', () => {
    it('should call onDateClick when date area is clicked', () => {
      render(
        <CalendarDay
          date={17}
          entries={[]}
          isSelected={false}
          onDateClick={mockOnDateClick}
          onEntryClick={mockOnEntryClick}
        />
      )

      fireEvent.click(screen.getByText('17'))
      expect(mockOnDateClick).toHaveBeenCalledWith(17)
    })

    it('should call onEntryClick when mood emoji is clicked', () => {
      render(
        <CalendarDay
          date={17}
          entries={[mockEntry]}
          isSelected={false}
          onDateClick={mockOnDateClick}
          onEntryClick={mockOnEntryClick}
        />
      )

      fireEvent.click(screen.getByText('😊'))
      expect(mockOnEntryClick).toHaveBeenCalledWith(mockEntry)
    })

    it('should call onEntryClick with correct entry when multiple entries exist', () => {
      const entries: DiaryEntryDisplay[] = [
        { ...mockEntry, id: '1', mood: '😊' },
        { ...mockEntry, id: '2', mood: '😢' }
      ]

      render(
        <CalendarDay
          date={17}
          entries={entries}
          isSelected={false}
          onDateClick={mockOnDateClick}
          onEntryClick={mockOnEntryClick}
        />
      )

      fireEvent.click(screen.getByText('😢'))
      expect(mockOnEntryClick).toHaveBeenCalledWith(entries[1])
    })
  })

  describe('Accessibility', () => {
    it('should have proper accessibility attributes', () => {
      render(
        <CalendarDay
          date={17}
          entries={[mockEntry]}
          isSelected={true}
          onDateClick={mockOnDateClick}
          onEntryClick={mockOnEntryClick}
        />
      )

      const dayElement = screen.getByTestId('calendar-day')
      expect(dayElement).toHaveAttribute('role', 'button')
      expect(dayElement).toHaveAttribute('aria-selected', 'true')
      expect(dayElement).toHaveAttribute('aria-label', 'Day 17 with 1 entry')
    })

    it('should support keyboard navigation', () => {
      render(
        <CalendarDay
          date={17}
          entries={[]}
          isSelected={false}
          onDateClick={mockOnDateClick}
          onEntryClick={mockOnEntryClick}
        />
      )

      const dayElement = screen.getByTestId('calendar-day')
      
      // Enter 키 테스트
      fireEvent.keyDown(dayElement, { key: 'Enter', code: 'Enter' })
      expect(mockOnDateClick).toHaveBeenCalledWith(17)

      // Space 키 테스트
      fireEvent.keyDown(dayElement, { key: ' ', code: 'Space' })
      expect(mockOnDateClick).toHaveBeenCalledWith(17)
    })
  })

  describe('Visual States', () => {
    it('should show today indicator when date is today', () => {
      const today = new Date().getDate()
      
      render(
        <CalendarDay
          date={today}
          entries={[]}
          isSelected={false}
          onDateClick={mockOnDateClick}
          onEntryClick={mockOnEntryClick}
        />
      )

      const dayElement = screen.getByTestId('calendar-day')
      expect(dayElement).toHaveClass('bg-pink-50') // 오늘 표시 스타일
    })

    it('should limit emoji display to maximum 3 entries', () => {
      const manyEntries: DiaryEntryDisplay[] = [
        { ...mockEntry, id: '1', mood: '😊' },
        { ...mockEntry, id: '2', mood: '😢' },
        { ...mockEntry, id: '3', mood: '🎉' },
        { ...mockEntry, id: '4', mood: '😴' },
        { ...mockEntry, id: '5', mood: '🤔' }
      ]

      render(
        <CalendarDay
          date={17}
          entries={manyEntries}
          isSelected={false}
          onDateClick={mockOnDateClick}
          onEntryClick={mockOnEntryClick}
        />
      )

      // 처음 3개만 표시되어야 함
      expect(screen.getByText('😊')).toBeInTheDocument()
      expect(screen.getByText('😢')).toBeInTheDocument()
      expect(screen.getByText('🎉')).toBeInTheDocument()
      
      // 4번째, 5번째는 표시되지 않아야 함
      expect(screen.queryByText('😴')).not.toBeInTheDocument()
      expect(screen.queryByText('🤔')).not.toBeInTheDocument()
      
      // "더보기" 표시가 있어야 함
      expect(screen.getByText('+2')).toBeInTheDocument()
    })
  })
})