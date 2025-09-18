import { ArrowLeft } from 'lucide-react'

interface WriteHeaderProps {
  title: string
  subtitle: string
  onBack: () => void
  saveStatus?: {
    isSaving?: boolean
    hasUnsavedChanges?: boolean
    currentEntryId?: string | null
    saveError?: string | null
  }
  centerActions?: React.ReactNode // For mode toggle
  rightActions?: React.ReactNode // For reflect button
}

export function WriteHeader({ 
  title, 
  subtitle, 
  onBack, 
  saveStatus,
  centerActions,
  rightActions
}: WriteHeaderProps) {
  const { isSaving, hasUnsavedChanges, currentEntryId, saveError } = saveStatus || {}

  return (
    <div className="flex lg:grid lg:grid-cols-3 items-center gap-4">
      {/* Left Section - Back Button & Title */}
      <div className="flex items-center gap-3 flex-1 lg:flex-none">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-gray-800">{title}</h1>
          <p className="text-sm text-gray-500 hidden sm:block">{subtitle}</p>
        </div>
        {/* Save status indicator - Notion style (subtle) */}
        <div className="flex items-center gap-2">
          {isSaving && (
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" title="Saving..." />
          )}
          {!hasUnsavedChanges && !isSaving && currentEntryId && (
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full opacity-50" title="Saved" />
          )}
          {saveError && (
            <div className="flex items-center gap-1 text-xs text-red-500" title={saveError}>
              <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
              <span className="hidden sm:inline">Save failed</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Center Section - Mode Toggle (Always render to maintain grid) */}
      <div className="hidden lg:flex justify-center">
        {centerActions}
      </div>
      
      {/* Right Section - Actions (Always render to maintain grid) */}
      <div className="hidden lg:flex justify-end">
        {rightActions}
      </div>
    </div>
  )
}