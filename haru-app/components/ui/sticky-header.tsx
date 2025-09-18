import { cn } from '@/lib/utils'

interface StickyHeaderProps {
  variant?: 'default' | 'reflection'
  children: React.ReactNode
  className?: string
}

export function StickyHeader({ 
  variant = 'default', 
  children, 
  className 
}: StickyHeaderProps) {
  return (
    <header className={cn(
      "bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10",
      variant === 'reflection' ? "bg-white/90 border-gray-200 z-20" : "border-pink-100",
      className
    )}>
      <div className={cn(
        "py-4",
        variant === 'reflection' ? "max-w-7xl mx-auto px-6" : "px-4 lg:px-6"
      )}>
        <div className="flex items-center justify-between min-h-[3rem]">
          {children}
        </div>
      </div>
    </header>
  )
}