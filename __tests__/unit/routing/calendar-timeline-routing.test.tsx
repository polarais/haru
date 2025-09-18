import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

// Mock Next.js router
const mockPush = jest.fn()
const mockPathname = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => mockPathname(),
  useSearchParams: () => new URLSearchParams(),
}))

// Mock Supabase
jest.mock('../../../haru-app/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn().mockResolvedValue({ 
        data: { user: { id: 'test-user' } }, 
        error: null 
      }),
    },
  },
}))

// Mock diary API
jest.mock('../../../haru-app/lib/diary-api', () => ({
  DiaryAPI: {
    getEntries: jest.fn().mockResolvedValue({
      data: [
        {
          id: '1',
          profile_id: 'test-user',
          date: '2025-09-04',
          mood: '😊', // Use actual emoji like in the app
          title: 'Test Entry',
          content: [{ type: 'paragraph', text: 'Test content' }],
          ai_chats: [],
          summary: 'Test preview',
          write_mode: 'journal',
          is_deleted: false,
          created_at: '2025-09-04T00:00:00Z',
          updated_at: '2025-09-04T00:00:00Z'
        }
      ],
      error: null
    })
  }
}))

describe('Calendar and Timeline Routing', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('/calendar route', () => {
    it('should render calendar view at /calendar', async () => {
      mockPathname.mockReturnValue('/calendar')
      
      const CalendarPage = require('../../../haru-app/app/(protected)/calendar/page.tsx').default
      render(<CalendarPage />)
      
      // Calendar view should show month navigation
      expect(screen.getByTestId('calendar-view')).toBeInTheDocument()
      expect(screen.getByTestId('month-navigation')).toBeInTheDocument()
      
      // Should show calendar grid with days
      expect(screen.getByTestId('mood-calendar-grid')).toBeInTheDocument()
    })

    it('should display entries in calendar format', async () => {
      mockPathname.mockReturnValue('/calendar')
      
      const CalendarPage = require('../../../haru-app/app/(protected)/calendar/page.tsx').default
      render(<CalendarPage />)
      
      // Should show calendar days with mood indicators
      await screen.findByTestId('calendar-day-4') // September 4th
      expect(screen.getByTestId('mood-indicator-😊')).toBeInTheDocument()
    })

    it('should navigate to timeline when timeline button clicked', async () => {
      mockPathname.mockReturnValue('/calendar')
      
      const CalendarPage = require('../../../haru-app/app/(protected)/calendar/page.tsx').default
      const user = userEvent.setup()
      render(<CalendarPage />)
      
      const timelineButton = screen.getByTestId('switch-to-timeline')
      await user.click(timelineButton)
      
      expect(mockPush).toHaveBeenCalledWith('/timeline')
    })
  })

  describe('/timeline route', () => {
    it('should render timeline view at /timeline', async () => {
      mockPathname.mockReturnValue('/timeline')
      
      const TimelinePage = require('../../../haru-app/app/(protected)/timeline/page.tsx').default
      render(<TimelinePage />)
      
      // Timeline view should show chronological list
      expect(screen.getByTestId('timeline-view')).toBeInTheDocument()
      expect(screen.getByTestId('entries-list')).toBeInTheDocument()
    })

    it('should display entries in chronological order', async () => {
      mockPathname.mockReturnValue('/timeline')
      
      const TimelinePage = require('../../../haru-app/app/(protected)/timeline/page.tsx').default
      render(<TimelinePage />)
      
      // Should show entries as timeline items
      await screen.findByTestId('timeline-entry-1')
      expect(screen.getByText('Test Entry')).toBeInTheDocument()
      expect(screen.getByText('Test preview')).toBeInTheDocument()
    })

    it('should navigate to calendar when calendar button clicked', async () => {
      mockPathname.mockReturnValue('/timeline')
      
      const TimelinePage = require('../../../haru-app/app/(protected)/timeline/page.tsx').default
      const user = userEvent.setup()
      render(<TimelinePage />)
      
      const calendarButton = screen.getByTestId('switch-to-calendar')
      await user.click(calendarButton)
      
      expect(mockPush).toHaveBeenCalledWith('/calendar')
    })
  })

  describe('Navigation between views', () => {
    it('should maintain state when switching between calendar and timeline', async () => {
      // Test that data persists when navigating between views
      mockPathname.mockReturnValue('/calendar')
      
      const CalendarPage = require('../../../haru-app/app/(protected)/calendar/page.tsx').default
      const { rerender } = render(<CalendarPage />)
      
      // Wait for data to load
      await screen.findByTestId('calendar-day-4')
      
      // Switch to timeline
      mockPathname.mockReturnValue('/timeline')
      const TimelinePage = require('../../../haru-app/app/(protected)/timeline/page.tsx').default
      rerender(<TimelinePage />)
      
      // Should still have the same data
      await screen.findByTestId('timeline-entry-1')
      expect(screen.getByText('Test Entry')).toBeInTheDocument()
    })

    it('should show active state for current route in navigation', () => {
      mockPathname.mockReturnValue('/calendar')
      
      const CalendarPage = require('../../../haru-app/app/(protected)/calendar/page.tsx').default
      render(<CalendarPage />)
      
      // Calendar navigation should be active
      expect(screen.getByTestId('nav-calendar')).toHaveClass('active')
    })
  })

  describe('URL structure', () => {
    it('should have correct URL patterns', () => {
      // Test that routes are properly structured
      expect('/calendar').toMatch(/^\/calendar$/)
      expect('/timeline').toMatch(/^\/timeline$/)
      
      // Should not match dashboard route
      expect('/calendar').not.toMatch(/dashboard/)
      expect('/timeline').not.toMatch(/dashboard/)
    })

    it('should redirect from /dashboard to /calendar by default', () => {
      mockPathname.mockReturnValue('/dashboard')
      
      // Dashboard should redirect to calendar
      expect(mockPush).toHaveBeenCalledWith('/calendar')
    })
  })
})