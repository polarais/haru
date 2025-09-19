import { ArrowLeft } from 'lucide-react'

interface ReflectionHeaderProps {
  entry: {
    date: string
    mood: string
    title: string
  }
  onBack: () => void
  isSaving?: boolean
}

export function ReflectionHeader({ 
  entry, 
  onBack, 
  isSaving 
}: ReflectionHeaderProps) {
  const formatDate = (dateString: string | number) => {
    if (typeof dateString === 'string') {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        month: 'long',
        day: 'numeric', 
        year: 'numeric' 
      })
    } else {
      // Legacy number format
      const today = new Date()
      return today.toLocaleDateString('en-US', { 
        month: 'long',
        day: 'numeric', 
        year: 'numeric' 
      })
    }
  }

  const formatDay = (dateString: string | number) => {
    if (typeof dateString === 'string') {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { weekday: 'long' })
    } else {
      // Legacy number format
      const today = new Date()
      const currentDate = new Date(today.getFullYear(), today.getMonth(), dateString)
      return currentDate.toLocaleDateString('en-US', { weekday: 'long' })
    }
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-gray-800">AI Reflection</h1>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span>{formatDate(entry.date)} • {formatDay(entry.date)}</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <span className="text-lg">{entry.mood}</span>
              <span>{entry.title}</span>
            </div>
            {isSaving && (
              <>
                <span>•</span>
                <span className="text-blue-600">Saving...</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}