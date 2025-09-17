import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { EntryViewPanel } from '@/components/entry/EntryViewPanel'
import { DiaryEntryDisplay } from '@/lib/types/components'

describe('EntryViewPanel', () => {
  const mockOnClose = jest.fn()
  const mockOnExpand = jest.fn()
  const mockOnPreviousEntry = jest.fn()
  const mockOnNextEntry = jest.fn()
  const mockOnDelete = jest.fn()

  const mockEntry: DiaryEntryDisplay = {
    id: 'entry-1',
    date: 17,
    mood: '😊',
    title: 'Great Day',
    content: 'Today was an amazing day! I accomplished so much and felt really productive. The weather was perfect and I spent time with friends.',
    preview: 'Today was an amazing day! I accomplished so much...',
    hasPhoto: true,
    photoUrl: 'https://example.com/photo.jpg'
  }

  const defaultProps = {
    entry: mockEntry,
    isOpen: true,
    onClose: mockOnClose,
    onExpand: mockOnExpand,
    currentEntryIndex: 2,
    totalEntries: 5,
    onPreviousEntry: mockOnPreviousEntry,
    onNextEntry: mockOnNextEntry,
    onDelete: mockOnDelete
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Panel Visibility', () => {
    it('should render when panel is open', () => {
      render(<EntryViewPanel {...defaultProps} />)

      expect(screen.getByTestId('entry-view-panel')).toBeInTheDocument()
    })

    it('should not render when panel is closed', () => {
      render(<EntryViewPanel {...defaultProps} isOpen={false} />)

      expect(screen.queryByTestId('entry-view-panel')).not.toBeInTheDocument()
    })

    it('should not render when entry is null', () => {
      render(<EntryViewPanel {...defaultProps} entry={null} />)

      expect(screen.queryByTestId('entry-view-panel')).not.toBeInTheDocument()
    })
  })

  describe('Entry Content Display', () => {
    it('should display entry mood emoji', () => {
      render(<EntryViewPanel {...defaultProps} />)

      expect(screen.getByText('😊')).toBeInTheDocument()
    })

    it('should display entry title', () => {
      render(<EntryViewPanel {...defaultProps} />)

      expect(screen.getByText('Great Day')).toBeInTheDocument()
    })

    it('should display entry content', () => {
      render(<EntryViewPanel {...defaultProps} />)

      expect(screen.getByText(/Today was an amazing day!/)).toBeInTheDocument()
    })

    it('should display date information', () => {
      render(<EntryViewPanel {...defaultProps} />)

      expect(screen.getByText('17')).toBeInTheDocument()
    })

    it('should display photo when hasPhoto is true', () => {
      render(<EntryViewPanel {...defaultProps} />)

      const photoElement = screen.getByAltText('Entry photo')
      expect(photoElement).toBeInTheDocument()
      expect(photoElement).toHaveAttribute('src', 'https://example.com/photo.jpg')
    })

    it('should not display photo when hasPhoto is false', () => {
      const entryWithoutPhoto = { ...mockEntry, hasPhoto: false, photoUrl: undefined }
      render(<EntryViewPanel {...defaultProps} entry={entryWithoutPhoto} />)

      expect(screen.queryByAltText('Entry photo')).not.toBeInTheDocument()
    })

    it('should display "Untitled" when title is missing', () => {
      const entryWithoutTitle = { ...mockEntry, title: undefined }
      render(<EntryViewPanel {...defaultProps} entry={entryWithoutTitle} />)

      expect(screen.getByText('Untitled')).toBeInTheDocument()
    })
  })

  describe('Navigation Controls', () => {
    it('should display navigation info (current/total)', () => {
      render(<EntryViewPanel {...defaultProps} />)

      expect(screen.getByText('3 / 5')).toBeInTheDocument()
    })

    it('should call onPreviousEntry when previous button is clicked', () => {
      render(<EntryViewPanel {...defaultProps} />)

      fireEvent.click(screen.getByLabelText('Previous entry'))
      expect(mockOnPreviousEntry).toHaveBeenCalled()
    })

    it('should call onNextEntry when next button is clicked', () => {
      render(<EntryViewPanel {...defaultProps} />)

      fireEvent.click(screen.getByLabelText('Next entry'))
      expect(mockOnNextEntry).toHaveBeenCalled()
    })

    it('should disable previous button when at first entry', () => {
      render(<EntryViewPanel {...defaultProps} currentEntryIndex={0} />)

      expect(screen.getByLabelText('Previous entry')).toBeDisabled()
    })

    it('should disable next button when at last entry', () => {
      render(<EntryViewPanel {...defaultProps} currentEntryIndex={4} totalEntries={5} />)

      expect(screen.getByLabelText('Next entry')).toBeDisabled()
    })

    it('should show correct navigation for single entry', () => {
      render(<EntryViewPanel {...defaultProps} currentEntryIndex={0} totalEntries={1} />)

      expect(screen.getByText('1 / 1')).toBeInTheDocument()
      expect(screen.getByLabelText('Previous entry')).toBeDisabled()
      expect(screen.getByLabelText('Next entry')).toBeDisabled()
    })
  })

  describe('Action Buttons', () => {
    it('should call onClose when close button is clicked', () => {
      render(<EntryViewPanel {...defaultProps} />)

      fireEvent.click(screen.getByLabelText('Close panel'))
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should call onExpand when expand button is clicked', () => {
      render(<EntryViewPanel {...defaultProps} />)

      fireEvent.click(screen.getByLabelText('Expand to fullscreen'))
      expect(mockOnExpand).toHaveBeenCalled()
    })

    it('should call onDelete when delete button is clicked', () => {
      render(<EntryViewPanel {...defaultProps} />)

      fireEvent.click(screen.getByLabelText('Delete entry'))
      expect(mockOnDelete).toHaveBeenCalledWith('entry-1')
    })
  })

  describe('Panel Animation Classes', () => {
    it('should have slide-in animation classes when open', () => {
      render(<EntryViewPanel {...defaultProps} />)

      const panel = screen.getByTestId('entry-view-panel')
      expect(panel).toHaveClass('translate-x-0')
    })

    it('should be positioned on the right side', () => {
      render(<EntryViewPanel {...defaultProps} />)

      const panel = screen.getByTestId('entry-view-panel')
      expect(panel).toHaveClass('fixed', 'right-0')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<EntryViewPanel {...defaultProps} />)

      const panel = screen.getByTestId('entry-view-panel')
      expect(panel).toHaveAttribute('role', 'dialog')
      expect(panel).toHaveAttribute('aria-label', 'Entry details')
    })

    it('should support keyboard navigation for close button', () => {
      render(<EntryViewPanel {...defaultProps} />)

      const closeButton = screen.getByLabelText('Close panel')
      closeButton.focus()
      
      fireEvent.keyDown(closeButton, { key: 'Enter' })
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should support Escape key to close panel', () => {
      render(<EntryViewPanel {...defaultProps} />)

      const panel = screen.getByTestId('entry-view-panel')
      fireEvent.keyDown(panel, { key: 'Escape' })
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should support arrow keys for navigation', () => {
      render(<EntryViewPanel {...defaultProps} />)

      const panel = screen.getByTestId('entry-view-panel')
      
      // Left arrow for previous
      fireEvent.keyDown(panel, { key: 'ArrowLeft' })
      expect(mockOnPreviousEntry).toHaveBeenCalled()
      
      // Right arrow for next
      fireEvent.keyDown(panel, { key: 'ArrowRight' })
      expect(mockOnNextEntry).toHaveBeenCalled()
    })
  })

  describe('Content Overflow', () => {
    it('should handle very long content with scrolling', () => {
      const longContent = 'A'.repeat(2000) // Very long content
      const entryWithLongContent = { ...mockEntry, content: longContent }
      
      render(<EntryViewPanel {...defaultProps} entry={entryWithLongContent} />)

      const contentArea = screen.getByTestId('entry-content')
      expect(contentArea).toHaveClass('overflow-y-auto')
    })

    it('should handle very long title with ellipsis', () => {
      const longTitle = 'This is a very long title that should be truncated with ellipsis'
      const entryWithLongTitle = { ...mockEntry, title: longTitle }
      
      render(<EntryViewPanel {...defaultProps} entry={entryWithLongTitle} />)

      const titleElement = screen.getByTestId('entry-title')
      expect(titleElement).toHaveClass('truncate')
    })
  })

  describe('Loading and Error States', () => {
    it('should handle missing photo gracefully', () => {
      const entryWithBrokenPhoto = { 
        ...mockEntry, 
        hasPhoto: true, 
        photoUrl: 'https://broken-url.com/missing.jpg' 
      }
      
      render(<EntryViewPanel {...defaultProps} entry={entryWithBrokenPhoto} />)

      const photoElement = screen.getByAltText('Entry photo')
      expect(photoElement).toBeInTheDocument()
      
      // Simulate image load error
      fireEvent.error(photoElement)
      
      // Should still render without crashing
      expect(screen.getByTestId('entry-view-panel')).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('should have responsive width classes', () => {
      render(<EntryViewPanel {...defaultProps} />)

      const panel = screen.getByTestId('entry-view-panel')
      expect(panel).toHaveClass('w-full', 'lg:w-96') // Full width on mobile, fixed on desktop
    })

    it('should have proper mobile layout', () => {
      render(<EntryViewPanel {...defaultProps} />)

      const panel = screen.getByTestId('entry-view-panel')
      expect(panel).toHaveClass('h-full') // Full height on mobile
    })
  })
})