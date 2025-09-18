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
        <div className="relative">
          {/* Background circle */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-100 to-rose-100" />
          {/* Spinning border */}
          <svg className="absolute inset-0 w-10 h-10 animate-spin" viewBox="0 0 40 40">
            <circle
              cx="20"
              cy="20"
              r="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-gray-200"
            />
            <circle
              cx="20"
              cy="20"
              r="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray="90 90"
              strokeLinecap="round"
              className="text-pink-500"
            />
          </svg>
        </div>
        {text && <span className="ml-3 text-gray-600 font-medium">{text}</span>}
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