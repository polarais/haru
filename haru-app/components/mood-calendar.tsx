'use client'

import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MoodCalendarGrid } from './calendar/MoodCalendarGrid'

// Interface moved to @/lib/types
import { DiaryEntryDisplay } from '@/lib/types'

interface MoodCalendarProps {
  onDateClick: (date: number) => void
  onEntryClick: (entry: DiaryEntryDisplay) => void
  onAddNewEntry: (date: number) => void
  selectedDate?: number
  entries: DiaryEntryDisplay[]
  currentMonth: number
  currentYear: number
  onPreviousMonth: () => void
  onNextMonth: () => void
}

export function MoodCalendar({ 
  onDateClick, 
  onEntryClick, 
  onAddNewEntry, 
  selectedDate, 
  entries, 
  currentMonth, 
  currentYear, 
  onPreviousMonth, 
  onNextMonth 
}: MoodCalendarProps) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6 h-full lg:h-auto flex flex-col">
      {/* Calendar Header with Navigation */}
      <div className="mb-4 lg:mb-4">
        <div className="flex items-center justify-between mb-2">
          <button 
            onClick={onPreviousMonth}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <ChevronLeft size={16} className="text-gray-600" />
          </button>
          
          <h3 className="text-gray-800 font-medium">{monthNames[currentMonth - 1]} {currentYear}</h3>
          
          <button 
            onClick={onNextMonth}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <ChevronRight size={16} className="text-gray-600" />
          </button>
        </div>
        <p className="text-xs text-gray-500 text-center hidden lg:block">Click on any date to add or view your thoughts</p>
      </div>
      
      {/* TDD Calendar Grid */}
      <div className="flex-1">
        <MoodCalendarGrid
          currentMonth={currentMonth}
          currentYear={currentYear}
          entries={entries}
          selectedDate={selectedDate}
          onDateClick={onDateClick}
          onEntryClick={onEntryClick}
        />
      </div>
    </div>
  )
}