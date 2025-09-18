'use client'

import { EntryViewPanelProps } from '@/lib/types'
import { cn } from '@/lib/utils'
import { X, Maximize2, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { useEffect } from 'react'

export function EntryViewPanel({
  entry,
  isOpen,
  onClose,
  onExpand,
  currentEntryIndex,
  totalEntries,
  onPreviousEntry,
  onNextEntry,
  onDelete
}: EntryViewPanelProps) {
  // Don't render if panel is closed or no entry
  if (!isOpen || !entry) {
    return null
  }

  const isFirstEntry = currentEntryIndex === 0
  const isLastEntry = currentEntryIndex === totalEntries - 1
  const navigationText = `${currentEntryIndex + 1} / ${totalEntries}`

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return

      switch (event.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          if (!isFirstEntry) {
            onPreviousEntry()
          }
          break
        case 'ArrowRight':
          if (!isLastEntry) {
            onNextEntry()
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isFirstEntry, isLastEntry, onClose, onPreviousEntry, onNextEntry])

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    // Hide broken image on error
    event.currentTarget.style.display = 'none'
  }

  return (
    <div
      data-testid="entry-view-panel"
      role="dialog"
      aria-label="Entry details"
      className={cn(
        'fixed right-0 top-0 h-full bg-white shadow-2xl z-50',
        'w-full lg:w-96',
        'transform transition-transform duration-300 ease-in-out',
        'translate-x-0',
        'border-l border-gray-200'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="text-2xl">{entry.mood}</div>
          <div className="text-lg font-medium text-gray-600">
            {entry.date}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onExpand}
            aria-label="Expand to fullscreen"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Maximize2 size={18} />
          </button>
          
          <button
            onClick={onClose}
            onKeyDown={(e) => e.key === 'Enter' && onClose()}
            aria-label="Close panel"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <button
          onClick={onPreviousEntry}
          disabled={isFirstEntry}
          aria-label="Previous entry"
          className={cn(
            'p-2 rounded-lg transition-colors',
            {
              'text-gray-300 cursor-not-allowed': isFirstEntry,
              'text-gray-600 hover:text-gray-800 hover:bg-gray-100': !isFirstEntry
            }
          )}
        >
          <ChevronLeft size={18} />
        </button>

        <span className="text-sm text-gray-500 font-medium">
          {navigationText}
        </span>

        <button
          onClick={onNextEntry}
          disabled={isLastEntry}
          aria-label="Next entry"
          className={cn(
            'p-2 rounded-lg transition-colors',
            {
              'text-gray-300 cursor-not-allowed': isLastEntry,
              'text-gray-600 hover:text-gray-800 hover:bg-gray-100': !isLastEntry
            }
          )}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Content */}
      <div 
        data-testid="entry-content"
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {/* Title */}
        <h2 
          data-testid="entry-title"
          className="text-xl font-semibold text-gray-900 truncate"
        >
          {entry.title}
        </h2>

        {/* Photo */}
        {entry.hasPhoto && entry.photoUrl && (
          <div className="w-full">
            <img
              src={entry.photoUrl}
              alt="Entry photo"
              onError={handleImageError}
              className="w-full h-auto rounded-lg object-cover max-h-64"
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {entry.content}
          </p>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => onDelete(entry)}
          aria-label="Delete entry"
          className="flex items-center space-x-2 w-full p-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 size={16} />
          <span className="text-sm font-medium">Delete Entry</span>
        </button>
      </div>
    </div>
  )
}