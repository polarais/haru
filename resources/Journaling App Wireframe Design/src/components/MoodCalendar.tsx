import React, { useState } from 'react';
import { ChevronDown, Plus } from 'lucide-react';

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
}

export function MoodCalendar({ onDateClick, onEntryClick, onAddNewEntry, selectedDate, entries }: MoodCalendarProps) {
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  
  // Mock data for the current month
  const currentMonth = "September 2025";
  const daysInMonth = 30;
  const startDay = 1; // Sunday = 0, Monday = 1, etc.
  
  const calendarDays: CalendarDay[] = [];
  
  // Generate calendar days with actual entry data
  for (let i = 1; i <= daysInMonth; i++) {
    const isToday = i === 4; // Mock today as 4th
    const dayEntries = entries.filter(entry => entry.date === i);
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
    const dayEntries = getEntriesForDate(date);
    
    if (dayEntries.length === 0) {
      // No entries, create new
      onDateClick(date);
    } else if (dayEntries.length === 1) {
      // One entry, open directly
      onEntryClick(dayEntries[0]);
    } else {
      // Multiple entries, show dropdown
      event.stopPropagation();
      setDropdownOpen(dropdownOpen === date ? null : date);
    }
  };

  const handleEntrySelect = (entry: DiaryEntry) => {
    onEntryClick(entry);
    setDropdownOpen(null);
  };

  const handleAddNew = (date: number, event: React.MouseEvent) => {
    const dayEntries = getEntriesForDate(date);
    
    // Check if already at maximum entries (3)
    if (dayEntries.length >= 3) {
      return; // Don't allow more than 3 entries
    }
    
    event.stopPropagation();
    onAddNewEntry(date);
    setDropdownOpen(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6 h-full lg:h-auto flex flex-col">
      <div className="mb-4 lg:mb-4 text-center">
        <h3 className="text-gray-800">{currentMonth}</h3>
        <p className="text-xs text-gray-500 mt-1 hidden lg:block">Click on any date to add or view your thoughts</p>
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
                    <span className="text-xl lg:text-2xl leading-none">{day.moods[0]}</span>
                  ) : day.moods.length === 2 ? (
                    <>
                      <span className="text-lg lg:text-lg leading-none">{day.moods[0]}</span>
                      <span className="text-lg lg:text-lg leading-none">{day.moods[1]}</span>
                    </>
                  ) : (
                    // For 3 entries, show all 3
                    <>
                      <span className="text-sm lg:text-sm leading-none">{day.moods[0]}</span>
                      <span className="text-sm lg:text-sm leading-none">{day.moods[1]}</span>
                      <span className="text-sm lg:text-sm leading-none">{day.moods[2]}</span>
                    </>
                  )}
                </div>
              )}
              
              {/* Today indicator */}
              {day.isToday && (
                <div className="absolute -top-1 -right-1 w-2 lg:w-2.5 h-2 lg:h-2.5 bg-pink-400 rounded-full animate-pulse"></div>
              )}
            </button>

            {/* Dropdown for multiple entries */}
            {dropdownOpen === day.date && day.entryCount > 1 && (
              <div className="absolute top-full left-0 z-50 mt-1 w-64 lg:w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                <div className="px-3 py-2 text-sm text-gray-600 border-b border-gray-100">
                  {day.entryCount} entries on {day.date}
                </div>
                
                {getEntriesForDate(day.date).map((entry, index) => (
                  <button
                    key={entry.id}
                    onClick={() => handleEntrySelect(entry)}
                    className="w-full px-3 py-2 text-left hover:bg-pink-50 flex items-start gap-3 active:bg-pink-100"
                  >
                    <span className="text-lg flex-shrink-0 mt-0.5">{entry.mood}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">{entry.title}</div>
                      <div className="text-xs text-gray-500 truncate">{entry.preview}</div>
                    </div>
                  </button>
                ))}
                
                {/* Only show add new option if less than 3 entries */}
                {day.entryCount < 3 && (
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={(e) => handleAddNew(day.date, e)}
                      className="w-full px-3 py-2 text-left hover:bg-pink-50 active:bg-pink-100 flex items-center gap-3 text-pink-600"
                    >
                      <Plus className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">Add new entry</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        
        {/* Click outside to close dropdown */}
        {dropdownOpen && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setDropdownOpen(null)}
          />
        )}
      </div>
    </div>
  );
}