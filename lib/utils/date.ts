/**
 * Formats date string in English format (e.g., "Sep 17, 2025")
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return 'Invalid Date'
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return 'Invalid Date'
  }
}

/**
 * 주어진 날짜가 오늘인지 확인합니다.
 */
export function isToday(dateString: string): boolean {
  try {
    const inputDate = new Date(dateString)
    const today = new Date()
    
    return (
      inputDate.getFullYear() === today.getFullYear() &&
      inputDate.getMonth() === today.getMonth() &&
      inputDate.getDate() === today.getDate()
    )
  } catch {
    return false
  }
}

/**
 * Returns relative date expression (Today, Yesterday, Tomorrow, or formatted date).
 */
export function getRelativeDate(dateString: string): string {
  try {
    const inputDate = new Date(dateString)
    const today = new Date()
    
    const diffInMs = inputDate.getTime() - today.getTime()
    const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) {
      return 'Today'
    } else if (diffInDays === -1) {
      return 'Yesterday'
    } else if (diffInDays === 1) {
      return 'Tomorrow'
    } else {
      return formatDate(dateString)
    }
  } catch {
    return formatDate(dateString)
  }
}