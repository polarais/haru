import { cn } from '@/lib/utils'

export type LoadingSpinnerVariant = 
  | 'page'      // 페이지 로딩 - 브랜드 아이콘 + 텍스트
  | 'spinner'   // 일반 스피너 - 동그란 회전
  | 'dots'      // 채팅 타이핑 - 점 3개 애니메이션

interface LoadingSpinnerProps {
  variant?: LoadingSpinnerVariant
  text?: string
  className?: string
}

export function LoadingSpinner({ 
  variant = 'page', 
  text,
  className 
}: LoadingSpinnerProps) {
  
  if (variant === 'spinner') {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <div className="w-6 h-6 border-2 border-gray-300 border-t-pink-500 rounded-full animate-spin"></div>
        {text && <span className="ml-2 text-gray-600">{text}</span>}
      </div>
    )
  }

  if (variant === 'dots') {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
      </div>
    )
  }

  // Default 'page' variant
  return (
    <div className={cn("text-center", className)}>
      <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <span className="text-white text-2xl">💕</span>
      </div>
      <p className="text-gray-600">{text || 'Loading...'}</p>
    </div>
  )
}