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
    <div className="flex items-center justify-between w-full">
      {/* Left Section - Back Button & Title */}
      <div className="flex items-center gap-3">
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
      </div>
      
      {/* Center Section - Mode Toggle */}
      <div className="absolute left-1/2 transform -translate-x-1/2 hidden lg:block">
        {centerActions}
      </div>
      
      {/* Right Section - Actions */}
      <div className="hidden lg:block">
        {rightActions}
      </div>
    </div>
  )
}