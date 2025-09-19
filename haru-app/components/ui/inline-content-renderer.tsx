import React from 'react'
import { EntryPhoto } from '@/lib/types'

interface InlineContentRendererProps {
  content: string | null | undefined
  photos?: EntryPhoto[]
  className?: string
}

export function InlineContentRenderer({ content, photos = [], className = "" }: InlineContentRendererProps) {
  // Parse content and replace photo markers with actual photos or placeholders
  const renderContent = () => {
    // Ensure content is a string and handle null/undefined cases
    const textContent = typeof content === 'string' ? content : String(content || '')
    const parts = textContent.split(/(\[PHOTO:\d+\])/g)
    
    return parts.map((part, index) => {
      const photoMatch = part.match(/\[PHOTO:(\d+)\]/)
      
      if (photoMatch) {
        const photoIndex = parseInt(photoMatch[1]) - 1 // Convert to 0-based index
        const photo = photos.find(p => p.position_index === photoIndex)
        
        if (photo) {
          return (
            <div key={index} className="my-4 block">
              <img 
                src={photo.storage_path} 
                alt={photo.caption || `Photo ${photoIndex + 1}`}
                className="max-w-full h-auto rounded-lg border border-gray-200 shadow-sm"
              />
              {photo.caption && (
                <p className="text-sm text-gray-500 mt-2 italic">{photo.caption}</p>
              )}
            </div>
          )
        } else {
          // Show placeholder if photo not found
          return (
            <div 
              key={index} 
              className="inline-block bg-blue-50 border border-blue-200 rounded px-2 py-1 mx-1 text-blue-600 text-sm"
            >
              📷 Photo {photoIndex + 1}
            </div>
          )
        }
      }
      
      return <span key={index}>{part}</span>
    })
  }

  return (
    <div className={`whitespace-pre-wrap ${className}`}>
      {renderContent()}
    </div>
  )
}