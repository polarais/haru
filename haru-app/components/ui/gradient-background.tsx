import { cn } from '@/lib/utils'

export type GradientVariant = 
  | 'primary'      // from-pink-50 via-rose-50 to-orange-50
  | 'secondary'    // from-gray-50 to-pink-50
  | 'brand'        // from-pink-400 to-rose-400
  | 'ai'           // from-purple-400 to-indigo-400
  | 'accent'       // from-purple-500 to-indigo-500

interface GradientBackgroundProps {
  variant?: GradientVariant
  className?: string
  children?: React.ReactNode
}

const gradientVariants = {
  primary: 'bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50',
  secondary: 'bg-gradient-to-br from-gray-50 to-pink-50',
  brand: 'bg-gradient-to-r from-pink-400 to-rose-400',
  ai: 'bg-gradient-to-r from-purple-400 to-indigo-400',
  accent: 'bg-gradient-to-r from-purple-500 to-indigo-500'
}

export function GradientBackground({ 
  variant = 'primary', 
  className, 
  children 
}: GradientBackgroundProps) {
  return (
    <div className={cn(gradientVariants[variant], className)}>
      {children}
    </div>
  )
}