interface DashboardHeaderProps {
  currentView: 'calendar' | 'timeline'
  onGoToToday: () => void
  onDeleteAllEntries?: (isPermanent?: boolean) => void
  entriesCount?: number
}

export function DashboardHeader({ 
  currentView, 
  onGoToToday,
  onDeleteAllEntries,
  entriesCount = 0
}: DashboardHeaderProps) {
  return (
    <>
      {/* Left Section */}
      <div>
        <h1 className="text-gray-800 font-medium">
          {currentView === 'calendar' ? 'Calendar' : 'Time Table'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {currentView === 'calendar' 
            ? 'Track your daily moods and memories' 
            : 'Review all your journal entries'
          }
        </p>
      </div>
      
      {/* Right Section - Actions */}
      <div className="flex items-center gap-3">
        {/* Delete All Button (only show if there are entries) */}
        {onDeleteAllEntries && entriesCount > 0 && (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onDeleteAllEntries(false)}
              className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 transition-colors text-xs"
              title="Soft delete all entries (recoverable)"
            >
              <span className="text-red-600">Delete All</span>
            </button>
            <button 
              onClick={() => onDeleteAllEntries(true)}
              className="px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 transition-colors text-xs"
              title="Permanently delete all entries (cannot be undone)"
            >
              <span className="text-red-700">Delete Forever</span>
            </button>
          </div>
        )}
        
        {/* Today Button */}
        <div className="flex flex-col items-end justify-center">
          {currentView === 'calendar' ? (
            <>
              <button 
                onClick={onGoToToday}
                className="px-4 py-2 rounded-lg bg-pink-100 hover:bg-pink-200 transition-colors mb-1"
              >
                <span className="text-pink-700">Today</span>
              </button>
              <p className="text-xs text-gray-500">
                Today is {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </p>
            </>
          ) : (
            // Invisible spacer to maintain exact same height (button height + margin + text height)
            <>
              <div className="px-4 py-2 mb-1 invisible">
                <span>Today</span>
              </div>
              <p className="text-xs text-gray-500 invisible">
                Placeholder for consistent height
              </p>
            </>
          )}
        </div>
      </div>
    </>
  )
}