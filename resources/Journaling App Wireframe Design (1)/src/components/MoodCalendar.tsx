import React, { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'; // Add navigation icons

interface CalendarDay {
  date: number;
  moods: string[];
  entryCount: number;
  isToday?: boolean;
}

interface DiaryEntry {
  id: string;
  date: number;
  mood: string;
  title: string;
  content: string;
  preview: string;
  hasPhoto?: boolean;
}

interface MoodCalendarProps {
  onDateClick: (date: number) => void;
  onEntryClick: (entry: DiaryEntry) => void;
  onAddNewEntry: (date: number) => void;
  selectedDate?: number;
  entries: DiaryEntry[];
  currentMonth: number;
  currentYear: number;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

export function MoodCalendar({ onDateClick, onEntryClick, onAddNewEntry, selectedDate, entries, currentMonth, currentYear, onPreviousMonth, onNextMonth }: MoodCalendarProps) {
  // Remove dropdownOpen state since we're not using dropdown anymore
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const startDay = new Date(currentYear, currentMonth - 1, 1).getDay(); // Sunday = 0, Monday = 1, etc.
  
  const calendarDays: CalendarDay[] = [];
  
  // Generate calendar days with actual entry data
  for (let i = 1; i <= daysInMonth; i++) {
    // Check if this is today (September 4, 2025)
    const isToday = currentMonth === 9 && currentYear === 2025 && i === 4;
    // Only show entries for the current month being displayed
    const dayEntries = currentMonth === 9 && currentYear === 2025 
      ? entries.filter(entry => entry.date === i)
      : []; // Show empty for other months for now
    const moods = dayEntries.map(entry => entry.mood);
    
    calendarDays.push({
      date: i,
      moods,
      entryCount: dayEntries.length,
      isToday
    });
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Add empty cells for days before the month starts
  const emptyCells = Array(startDay).fill(null);

  const getEntriesForDate = (date: number) => {
    return entries.filter(entry => entry.date === date);
  };

  const handleCellClick = (date: number, event: React.MouseEvent) => {
    // Simplified: always use onDateClick, which will handle all cases
    onDateClick(date);
  };

  const handleAddNew = (date: number, event: React.MouseEvent) => {
    const dayEntries = getEntriesForDate(date);
    
    // Check if already at maximum entries (3)
    if (dayEntries.length >= 3) {
      return; // Don't allow more than 3 entries
    }
    
    event.stopPropagation();
    onAddNewEntry(date);
  };

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
          
          <h3 className="text-gray-800">{monthNames[currentMonth - 1]} {currentYear}</h3>
          
          <button 
            onClick={onNextMonth}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <ChevronRight size={16} className="text-gray-600" />
          </button>
        </div>
        <p className="text-xs text-gray-500 text-center hidden lg:block">Click on any date to add or view your thoughts</p>
      </div>
      
      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-1 lg:gap-2 mb-3">
        {weekDays.map(day => (
          <div key={day} className="text-center text-gray-500 py-2 text-xs lg:text-sm">
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{day[0]}</span>
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 lg:gap-2 relative flex-1">
        {/* Empty cells for days before month starts */}
        {emptyCells.map((_, index) => (
          <div key={`empty-${index}`} className="h-20 lg:h-20"></div>
        ))}
        
        {/* Calendar days */}
        {calendarDays.map(day => (
          <div key={day.date} className="relative">
            <button
              onClick={(e) => handleCellClick(day.date, e)}
              className={`
                h-20 lg:h-20 w-full rounded-lg lg:rounded-xl p-1 lg:p-2 transition-all duration-200 flex flex-col items-center justify-center relative
                hover:bg-pink-50 hover:scale-105 group active:scale-95
                ${selectedDate === day.date ? 'bg-pink-100 ring-2 ring-pink-300 scale-105' : ''}
                ${day.isToday ? 'bg-gradient-to-br from-pink-200 to-rose-200 shadow-md' : 'bg-gray-50'}
              `}
            >
              <span className="text-sm lg:text-sm text-gray-700 group-hover:text-pink-600 transition-colors">{day.date}</span>
              
              {/* Show all moods (max 3) */}
              {day.moods.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-0.5 mt-1 max-w-full">
                  {day.moods.length === 1 ? (
                    <span className="text-2xl lg:text-3xl leading-none">{day.moods[0]}</span>
                  ) : day.moods.length === 2 ? (
                    <>
                      <span className="text-xl lg:text-xl leading-none">{day.moods[0]}</span>
                      <span className="text-xl lg:text-xl leading-none">{day.moods[1]}</span>
                    </>
                  ) : (
                    // For 3 entries, show all 3
                    <>
                      <span className="text-base lg:text-lg leading-none">{day.moods[0]}</span>
                      <span className="text-base lg:text-lg leading-none">{day.moods[1]}</span>
                      <span className="text-base lg:text-lg leading-none">{day.moods[2]}</span>
                    </>
                  )}
                </div>
              )}
              
              {/* Today indicator */}
              {day.isToday && (
                <div className="absolute -top-1 -right-1 w-2 lg:w-2.5 h-2 lg:h-2.5 bg-pink-400 rounded-full animate-pulse"></div>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}