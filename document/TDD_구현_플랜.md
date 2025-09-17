# haru 프로젝트 TDD 구현 실행 플랜 (Claude Code 작업용)

## 🎯 Phase 1: 테스트 인프라 구축 (Claude Code 작업 1단계)

### 1.1 Claude Code가 수행할 의존성 설치 및 기본 설정

```bash
# Claude Code가 haru-app 디렉토리에서 실행할 명령어
cd haru-app

# 테스트 관련 의존성 설치
npm install --save-dev \
  jest@29.7.0 \
  jest-environment-jsdom@29.7.0 \
  @testing-library/react@14.0.0 \
  @testing-library/jest-dom@6.1.0 \
  @testing-library/user-event@14.5.0 \
  ts-jest@29.1.0 \
  @types/jest@29.5.0

# Supabase CLI 설치 (로컬 개발환경)
npm install -g @supabase/cli

# 로컬 Supabase 초기화
supabase init
supabase start
```

### 1.2 설정 파일 생성

#### `jest.config.js`
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: [
    '**/__tests__/**/*.(test|spec).(js|jsx|ts|tsx)',
    '**/*.(test|spec).(js|jsx|ts|tsx)'
  ],
  collectCoverageFrom: [
    'lib/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
  ],
  coverageThreshold: {
    global: {
      branches: 50, // 초기 목표를 낮게 설정
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
```

#### `jest.setup.js`
```javascript
import '@testing-library/jest-dom'

// 로컬 Supabase 환경 변수 설정
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
process.env.OPENAI_API_KEY = 'test-openai-key'
process.env.GOOGLE_GENERATIVE_AI_API_KEY = 'test-gemini-key'

// 테스트 전 데이터베이스 초기화
beforeEach(async () => {
  const { createClient } = require('@supabase/supabase-js')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  
  // 테스트용 데이터 정리
  await supabase.from('diaries').delete().neq('id', '')
})

// Next.js Image 컴포넌트 모킹
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    return <img {...props} />
  },
}))
```

#### `__tests__/helpers/database.ts`
```typescript
// 로컬 Supabase 테스트 헬퍼
import { createClient } from '@supabase/supabase-js'

export const createTestSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export const createTestUser = async (supabase: any, email = 'test@example.com') => {
  const { data: user, error } = await supabase.auth.admin.createUser({
    email,
    password: 'testpassword123',
    email_confirm: true
  })
  
  if (error) throw error
  return user.user
}

export const cleanupTestUser = async (supabase: any, userId: string) => {
  await supabase.from('diaries').delete().eq('profile_id', userId)
  await supabase.auth.admin.deleteUser(userId)
}

export const createTestEntry = async (supabase: any, userId: string, entryData = {}) => {
  const defaultEntry = {
    profile_id: userId,
    date: '2025-09-17',
    mood: '😊',
    title: 'Test Entry',
    content: [{ type: 'text', content: 'Test content' }],
    write_mode: 'journal',
    ...entryData
  }
  
  const { data, error } = await supabase.from('diaries').insert(defaultEntry).select().single()
  if (error) throw error
  return data
}
```

### 1.3 Package.json 스크립트 추가

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --watchAll=false",
    "test:unit": "jest --testPathPattern=__tests__/unit",
    "test:integration": "jest --testPathPattern=__tests__/integration"
  }
}
```

## 🧪 Phase 2: 유틸리티 함수 TDD 적용 (Claude Code 작업 2단계)

### 2.1 Claude Code가 TDD로 개발할 새로운 유틸리티 함수

#### Claude Code가 작성할 날짜 유틸리티 테스트
```typescript
// __tests__/unit/utils/date.test.ts
import { formatDateKorean, isToday, getRelativeDate } from '@/lib/utils/date'

describe('Date Utilities', () => {
  describe('formatDateKorean', () => {
    it('should format date string in Korean', () => {
      expect(formatDateKorean('2025-09-17')).toBe('2025년 9월 17일')
    })
    
    it('should handle invalid date', () => {
      expect(formatDateKorean('invalid')).toBe('유효하지 않은 날짜')
    })
  })
  
  describe('isToday', () => {
    it('should return true for today', () => {
      const today = new Date().toISOString().split('T')[0]
      expect(isToday(today)).toBe(true)
    })
    
    it('should return false for yesterday', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]
      expect(isToday(yesterdayStr)).toBe(false)
    })
  })
  
  describe('getRelativeDate', () => {
    it('should return "오늘" for today', () => {
      const today = new Date().toISOString().split('T')[0]
      expect(getRelativeDate(today)).toBe('오늘')
    })
    
    it('should return "어제" for yesterday', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]
      expect(getRelativeDate(yesterdayStr)).toBe('어제')
    })
  })
})
```

#### 날짜 유틸리티 구현
```typescript
// lib/utils/date.ts
export function formatDateKorean(dateString: string): string {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return '유효하지 않은 날짜'
    }
    
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return '유효하지 않은 날짜'
  }
}

export function isToday(dateString: string): boolean {
  const today = new Date().toISOString().split('T')[0]
  return dateString === today
}

export function getRelativeDate(dateString: string): string {
  const today = new Date()
  const date = new Date(dateString)
  const diffTime = today.getTime() - date.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return '오늘'
  if (diffDays === 1) return '어제'
  if (diffDays === 2) return '그저께'
  if (diffDays < 7) return `${diffDays}일 전`
  
  return formatDateKorean(dateString)
}
```

### 2.2 Claude Code가 추가할 기존 유틸리티 함수 테스트

#### utils.ts 테스트
```typescript
// __tests__/unit/utils/utils.test.ts
import { cn } from '@/lib/utils'

describe('Utils', () => {
  describe('cn (className utility)', () => {
    it('should merge classnames correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
    })
    
    it('should handle conditional classes', () => {
      expect(cn('base', true && 'conditional', false && 'hidden')).toBe('base conditional')
    })
    
    it('should handle empty input', () => {
      expect(cn()).toBe('')
    })
  })
})
```

## 🔧 Phase 3: API 계층 리팩토링 및 TDD (Claude Code 작업 3단계)

### 3.1 Claude Code가 수행할 DiaryAPI 의존성 주입 패턴 리팩토링

#### Claude Code가 분석한 기존 코드 문제점
```typescript
// 현재 DiaryAPI.ts - 테스트하기 어려운 구조
export class DiaryAPI {
  static async getEntries(): Promise<Result<DiaryEntry[]>> {
    const { data: { user } } = await supabase.auth.getUser() // 직접 의존
    // ...
  }
}
```

#### Claude Code가 설계할 개선된 구조
```typescript
// lib/repositories/diary-repository.ts
export interface IDiaryRepository {
  getEntries(): Promise<Result<DiaryEntry[]>>
  getEntriesForDate(date: string): Promise<Result<DiaryEntry[]>>
  saveEntry(data: DiaryEntryData, id?: string): Promise<Result<DiaryEntry>>
  deleteEntry(id: string): Promise<Result<void>>
  uploadImage(file: File, entryId: string): Promise<Result<string>>
}

export class SupabaseDiaryRepository implements IDiaryRepository {
  constructor(
    private supabase: SupabaseClient,
    private userService: IUserService
  ) {}
  
  async getEntries(): Promise<Result<DiaryEntry[]>> {
    const user = await this.userService.getCurrentUser()
    if (!user) {
      return { data: null, error: 'User not authenticated' }
    }
    
    const { data, error } = await this.supabase
      .from('diaries')
      .select('*')
      .eq('profile_id', user.id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
    
    return { data, error: error?.message || null }
  }
}
```

#### Repository 테스트 (로컬 Supabase 사용)
```typescript
// __tests__/unit/repositories/diary-repository.test.ts
import { SupabaseDiaryRepository } from '@/lib/repositories/diary-repository'
import { createTestSupabaseClient, createTestUser, cleanupTestUser, createTestEntry } from '@/__tests__/helpers/database'

describe('SupabaseDiaryRepository', () => {
  let repository: SupabaseDiaryRepository
  let supabase: any
  let testUser: any
  
  beforeEach(async () => {
    supabase = createTestSupabaseClient()
    testUser = await createTestUser(supabase)
    
    const mockUserService = {
      getCurrentUser: jest.fn().mockResolvedValue(testUser)
    }
    repository = new SupabaseDiaryRepository(supabase, mockUserService)
  })
  
  afterEach(async () => {
    await cleanupTestUser(supabase, testUser.id)
  })
  
  describe('getEntries', () => {
    it('should return entries for authenticated user', async () => {
      // Given - 테스트 엔트리 생성
      await createTestEntry(supabase, testUser.id, { title: 'Entry 1', mood: '😊' })
      await createTestEntry(supabase, testUser.id, { title: 'Entry 2', mood: '😢' })
      
      // When
      const result = await repository.getEntries()
      
      // Then
      expect(result.data).toHaveLength(2)
      expect(result.data[0].title).toBe('Entry 2') // 최신순 정렬
      expect(result.data[1].title).toBe('Entry 1')
      expect(result.error).toBeNull()
    })
    
    it('should return empty array when user has no entries', async () => {
      // When
      const result = await repository.getEntries()
      
      // Then
      expect(result.data).toEqual([])
      expect(result.error).toBeNull()
    })
    
    it('should only return entries for authenticated user', async () => {
      // Given - 다른 사용자의 엔트리 생성
      const otherUser = await createTestUser(supabase, 'other@example.com')
      await createTestEntry(supabase, otherUser.id, { title: 'Other Entry' })
      await createTestEntry(supabase, testUser.id, { title: 'My Entry' })
      
      // When
      const result = await repository.getEntries()
      
      // Then
      expect(result.data).toHaveLength(1)
      expect(result.data[0].title).toBe('My Entry')
      
      // Cleanup
      await cleanupTestUser(supabase, otherUser.id)
    })
  })
})
```

### 3.2 Service 계층 도입

#### DiaryService 설계
```typescript
// lib/services/diary-service.ts
export class DiaryService {
  constructor(private repository: IDiaryRepository) {}
  
  async getEntriesForDisplay(): Promise<Result<DiaryEntryDisplay[]>> {
    const result = await this.repository.getEntries()
    if (result.error) return result
    
    const displayEntries = result.data?.map(this.convertToDisplayEntry) || []
    return { data: displayEntries, error: null }
  }
  
  private convertToDisplayEntry(entry: DiaryEntry): DiaryEntryDisplay {
    const entryDate = new Date(entry.date)
    const textContent = this.contentToText(entry.content)
    
    return {
      id: entry.id,
      date: entryDate.getDate(),
      mood: entry.mood,
      title: entry.title || 'Untitled Entry',
      content: textContent,
      preview: textContent.length > 100 ? textContent.substring(0, 100) + '...' : textContent,
      hasPhoto: this.contentHasPhotos(entry.content),
      photoUrl: this.getFirstPhotoUrl(entry.content),
      aiReflection: this.convertAiReflection(entry)
    }
  }
}
```

#### DiaryService 테스트
```typescript
// __tests__/unit/services/diary-service.test.ts
import { DiaryService } from '@/lib/services/diary-service'

describe('DiaryService', () => {
  let service: DiaryService
  let mockRepository: any
  
  beforeEach(() => {
    mockRepository = {
      getEntries: jest.fn(),
      saveEntry: jest.fn(),
      deleteEntry: jest.fn()
    }
    service = new DiaryService(mockRepository)
  })
  
  describe('getEntriesForDisplay', () => {
    it('should convert diary entries to display format', async () => {
      // Given
      const mockEntries = [{
        id: '1',
        date: '2025-09-17',
        mood: '😊',
        title: 'Test Entry',
        content: [{ type: 'paragraph', text: 'Hello world' }]
      }]
      
      mockRepository.getEntries.mockResolvedValue({
        data: mockEntries,
        error: null
      })
      
      // When
      const result = await service.getEntriesForDisplay()
      
      // Then
      expect(result.data).toHaveLength(1)
      expect(result.data[0]).toMatchObject({
        id: '1',
        date: 17,
        mood: '😊',
        title: 'Test Entry',
        content: 'Hello world',
        preview: 'Hello world',
        hasPhoto: false
      })
    })
  })
})
```

## 🎨 Phase 4: 컴포넌트 TDD 적용 (Claude Code 작업 4단계)

### 4.1 Claude Code가 추출할 커스텀 훅 및 테스트

#### Claude Code가 작성할 useDiaryEntries 훅
```typescript
// hooks/useDiaryEntries.ts
export function useDiaryEntries() {
  const [entries, setEntries] = useState<DiaryEntryDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const diaryService = useMemo(() => new DiaryService(new SupabaseDiaryRepository(supabase, userService)), [])
  
  const loadEntries = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    const result = await diaryService.getEntriesForDisplay()
    if (result.error) {
      setError(result.error)
    } else {
      setEntries(result.data || [])
    }
    setLoading(false)
  }, [diaryService])
  
  useEffect(() => {
    loadEntries()
  }, [loadEntries])
  
  return {
    entries,
    loading,
    error,
    refetch: loadEntries
  }
}
```

#### Claude Code가 작성할 커스텀 훅 테스트
```typescript
// __tests__/unit/hooks/useDiaryEntries.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { useDiaryEntries } from '@/hooks/useDiaryEntries'

// DiaryService 모킹
jest.mock('@/lib/services/diary-service')

describe('useDiaryEntries', () => {
  let mockDiaryService: any
  
  beforeEach(() => {
    mockDiaryService = {
      getEntriesForDisplay: jest.fn()
    }
    ;(DiaryService as jest.Mock).mockImplementation(() => mockDiaryService)
  })
  
  it('should load entries on mount', async () => {
    // Given
    const mockEntries = [
      { id: '1', title: 'Entry 1' },
      { id: '2', title: 'Entry 2' }
    ]
    mockDiaryService.getEntriesForDisplay.mockResolvedValue({
      data: mockEntries,
      error: null
    })
    
    // When
    const { result } = renderHook(() => useDiaryEntries())
    
    // Then
    expect(result.current.loading).toBe(true)
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.entries).toEqual(mockEntries)
      expect(result.current.error).toBeNull()
    })
  })
  
  it('should handle error when loading fails', async () => {
    // Given
    const errorMessage = 'Failed to load entries'
    mockDiaryService.getEntriesForDisplay.mockResolvedValue({
      data: null,
      error: errorMessage
    })
    
    // When
    const { result } = renderHook(() => useDiaryEntries())
    
    // Then
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.entries).toEqual([])
      expect(result.current.error).toBe(errorMessage)
    })
  })
})
```

### 4.2 Claude Code가 수행할 MoodCalendar 컴포넌트 리팩토링

#### Claude Code가 분리할 프레젠테이션 컴포넌트
```typescript
// components/MoodCalendar/MoodCalendarGrid.tsx
interface MoodCalendarGridProps {
  currentMonth: number
  currentYear: number
  entries: DiaryEntryDisplay[]
  selectedDate?: number
  onDateClick: (date: number) => void
  onEntryClick: (entry: DiaryEntryDisplay) => void
}

export function MoodCalendarGrid({
  currentMonth,
  currentYear,
  entries,
  selectedDate,
  onDateClick,
  onEntryClick
}: MoodCalendarGridProps) {
  const daysInMonth = getDaysInMonth(currentMonth, currentYear)
  const firstDayOfWeek = getFirstDayOfWeek(currentMonth, currentYear)
  
  return (
    <div className="grid grid-cols-7 gap-1">
      {/* 요일 헤더 */}
      {WEEKDAYS.map(day => (
        <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
          {day}
        </div>
      ))}
      
      {/* 빈 셀들 */}
      {Array.from({ length: firstDayOfWeek }).map((_, index) => (
        <div key={`empty-${index}`} className="h-16" />
      ))}
      
      {/* 날짜 셀들 */}
      {Array.from({ length: daysInMonth }).map((_, index) => {
        const date = index + 1
        const dayEntries = getEntriesForDate(entries, date)
        
        return (
          <CalendarDay
            key={date}
            date={date}
            entries={dayEntries}
            isSelected={selectedDate === date}
            onDateClick={onDateClick}
            onEntryClick={onEntryClick}
          />
        )
      })}
    </div>
  )
}
```

#### Claude Code가 작성할 컴포넌트 테스트
```typescript
// __tests__/unit/components/MoodCalendar.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { MoodCalendarGrid } from '@/components/MoodCalendar/MoodCalendarGrid'

describe('MoodCalendarGrid', () => {
  const mockProps = {
    currentMonth: 9,
    currentYear: 2025,
    entries: [
      {
        id: '1',
        date: 17,
        mood: '😊',
        title: 'Happy Day',
        content: 'Great day today!'
      }
    ],
    selectedDate: 17,
    onDateClick: jest.fn(),
    onEntryClick: jest.fn()
  }
  
  it('should render calendar grid with correct month', () => {
    render(<MoodCalendarGrid {...mockProps} />)
    
    // 요일 헤더 확인
    expect(screen.getByText('일')).toBeInTheDocument()
    expect(screen.getByText('월')).toBeInTheDocument()
    expect(screen.getByText('화')).toBeInTheDocument()
    
    // 날짜 확인
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('17')).toBeInTheDocument()
    expect(screen.getByText('30')).toBeInTheDocument()
  })
  
  it('should display entry mood on correct date', () => {
    render(<MoodCalendarGrid {...mockProps} />)
    
    // 17일에 😊 이모지가 표시되어야 함
    const date17 = screen.getByText('17').closest('[data-testid="calendar-day"]')
    expect(date17).toContainElement(screen.getByText('😊'))
  })
  
  it('should call onDateClick when date is clicked', () => {
    render(<MoodCalendarGrid {...mockProps} />)
    
    fireEvent.click(screen.getByText('15'))
    
    expect(mockProps.onDateClick).toHaveBeenCalledWith(15)
  })
  
  it('should call onEntryClick when entry is clicked', () => {
    render(<MoodCalendarGrid {...mockProps} />)
    
    fireEvent.click(screen.getByText('😊'))
    
    expect(mockProps.onEntryClick).toHaveBeenCalledWith(mockProps.entries[0])
  })
  
  it('should highlight selected date', () => {
    render(<MoodCalendarGrid {...mockProps} />)
    
    const selectedDay = screen.getByText('17').closest('[data-testid="calendar-day"]')
    expect(selectedDay).toHaveClass('ring-2', 'ring-pink-500') // 선택된 날짜 스타일
  })
})
```

### 4.3 EntryViewPanel 컴포넌트 테스트

```typescript
// __tests__/unit/components/EntryViewPanel.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { EntryViewPanel } from '@/components/entry-view-panel'

describe('EntryViewPanel', () => {
  const mockEntry = {
    id: '1',
    date: 17,
    mood: '😊',
    title: 'Test Entry',
    content: 'This is test content',
    preview: 'This is test content',
    hasPhoto: false
  }
  
  const mockProps = {
    entry: mockEntry,
    isOpen: true,
    onClose: jest.fn(),
    onExpand: jest.fn(),
    currentEntryIndex: 0,
    totalEntries: 5,
    onPreviousEntry: jest.fn(),
    onNextEntry: jest.fn(),
    onDelete: jest.fn()
  }
  
  beforeEach(() => {
    jest.clearAllMocks()
  })
  
  it('should render entry details when panel is open', () => {
    render(<EntryViewPanel {...mockProps} />)
    
    expect(screen.getByText('😊')).toBeInTheDocument()
    expect(screen.getByText('Test Entry')).toBeInTheDocument()
    expect(screen.getByText('This is test content')).toBeInTheDocument()
  })
  
  it('should not render when panel is closed', () => {
    render(<EntryViewPanel {...mockProps} isOpen={false} />)
    
    expect(screen.queryByText('Test Entry')).not.toBeInTheDocument()
  })
  
  it('should call onClose when close button is clicked', () => {
    render(<EntryViewPanel {...mockProps} />)
    
    fireEvent.click(screen.getByLabelText('Close panel'))
    
    expect(mockProps.onClose).toHaveBeenCalled()
  })
  
  it('should call onExpand when expand button is clicked', () => {
    render(<EntryViewPanel {...mockProps} />)
    
    fireEvent.click(screen.getByLabelText('Expand to full screen'))
    
    expect(mockProps.onExpand).toHaveBeenCalled()
  })
  
  it('should show navigation controls when multiple entries exist', () => {
    render(<EntryViewPanel {...mockProps} />)
    
    expect(screen.getByText('Previous')).toBeInTheDocument()
    expect(screen.getByText('Next')).toBeInTheDocument()
    expect(screen.getByText('1 of 5')).toBeInTheDocument()
  })
  
  it('should disable previous button when at first entry', () => {
    render(<EntryViewPanel {...mockProps} currentEntryIndex={0} />)
    
    const prevButton = screen.getByText('Previous')
    expect(prevButton).toBeDisabled()
  })
  
  it('should disable next button when at last entry', () => {
    render(<EntryViewPanel {...mockProps} currentEntryIndex={4} totalEntries={5} />)
    
    const nextButton = screen.getByText('Next')
    expect(nextButton).toBeDisabled()
  })
})
```

## 🚀 Phase 5: 통합 테스트 및 E2E (Claude Code 작업 5단계)

### 5.1 Claude Code가 작성할 통합 테스트

#### Claude Code가 작성할 일기 작성 플로우 통합 테스트
```typescript
// __tests__/integration/diary-creation-flow.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DiaryCreationFlow } from '@/components/DiaryCreationFlow'

describe('Diary Creation Flow Integration', () => {
  it('should complete entire diary creation process', async () => {
    const user = userEvent.setup()
    
    render(<DiaryCreationFlow />)
    
    // 기분 선택
    await user.click(screen.getByTestId('mood-happy'))
    expect(screen.getByTestId('selected-mood')).toHaveTextContent('😊')
    
    // 제목 입력
    await user.type(screen.getByPlaceholderText('Title (optional)'), 'Integration Test Entry')
    
    // 내용 입력
    await user.type(
      screen.getByPlaceholderText('Start writing...'),
      'This is an integration test for diary creation.'
    )
    
    // 자동 저장 확인
    await waitFor(() => {
      expect(screen.getByTestId('save-indicator')).toHaveTextContent('Saved')
    }, { timeout: 3000 })
    
    // AI 리플렉션 버튼 활성화 확인
    const reflectButton = screen.getByText('Reflect with AI')
    expect(reflectButton).not.toBeDisabled()
    
    // AI 리플렉션 클릭
    await user.click(reflectButton)
    
    // AI 리플렉션 페이지로 이동 확인
    await waitFor(() => {
      expect(screen.getByText('AI Reflection')).toBeInTheDocument()
    })
  })
})
```

### 5.2 E2E 테스트 (Playwright)

#### Playwright 설정
```bash
npm install --save-dev @playwright/test
npx playwright install
```

#### `playwright.config.ts`
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

#### Claude Code가 작성할 E2E 테스트 시나리오
```typescript
// e2e/diary-full-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Diary Application', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인
    await page.goto('/login')
    await page.fill('[data-testid=email-input]', 'test@example.com')
    await page.fill('[data-testid=password-input]', 'password123')
    await page.click('[data-testid=login-button]')
    await page.waitForURL('/dashboard')
  })
  
  test('User can create, view, and delete diary entry', async ({ page }) => {
    // 새 일기 작성
    await page.click('[data-testid=add-entry-button]')
    await page.waitForURL('/write*')
    
    // 기분 선택
    await page.click('[data-testid=mood-selector-happy]')
    
    // 제목 및 내용 입력
    await page.fill('[data-testid=title-input]', 'E2E Test Entry')
    await page.fill('[data-testid=content-textarea]', 'This entry was created by E2E test automation.')
    
    // 자동 저장 대기
    await expect(page.locator('[data-testid=save-status]')).toContainText('Saved')
    
    // 대시보드로 돌아가기
    await page.click('[data-testid=back-button]')
    await page.waitForURL('/dashboard')
    
    // 작성된 일기가 캘린더에 표시되는지 확인
    await expect(page.locator('[data-testid=calendar-entry]').first()).toContainText('E2E Test Entry')
    
    // 일기 클릭하여 패널 열기
    await page.click('[data-testid=calendar-entry]')
    await expect(page.locator('[data-testid=entry-panel]')).toBeVisible()
    await expect(page.locator('[data-testid=entry-panel]')).toContainText('This entry was created by E2E test')
    
    // 일기 삭제
    await page.click('[data-testid=entry-options-menu]')
    await page.click('[data-testid=delete-entry-option]')
    await page.click('[data-testid=confirm-delete-button]')
    
    // 삭제된 일기가 더 이상 표시되지 않는지 확인
    await expect(page.locator('[data-testid=calendar-entry]')).not.toContainText('E2E Test Entry')
  })
  
  test('User can use AI reflection feature', async ({ page }) => {
    // 일기 작성
    await page.click('[data-testid=add-entry-button]')
    await page.click('[data-testid=mood-selector-happy]')
    await page.fill('[data-testid=title-input]', 'AI Reflection Test')
    await page.fill('[data-testid=content-textarea]', 'Today I learned something valuable about testing.')
    
    // AI 리플렉션 버튼 클릭
    await page.click('[data-testid=reflect-button]')
    await page.waitForURL('/reflection*')
    
    // AI 요약이 생성되는지 확인
    await expect(page.locator('[data-testid=ai-summary]')).toBeVisible()
    
    // AI와 대화
    await page.fill('[data-testid=chat-input]', 'What can I learn from this experience?')
    await page.click('[data-testid=send-message-button]')
    
    // AI 응답 확인
    await expect(page.locator('[data-testid=ai-message]').last()).toBeVisible()
    
    // 리플렉션 저장하고 돌아가기
    await page.click('[data-testid=close-reflection-button]')
    await page.waitForURL('/dashboard')
  })
})
```

## 📊 CI/CD 통합 및 자동화 (Claude Code 설정)

### Claude Code가 설정할 GitHub Actions 워크플로우
```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: 'haru-app/package-lock.json'
    
    - name: Install dependencies
      run: |
        cd haru-app
        npm ci
    
    - name: Run unit tests
      run: |
        cd haru-app
        npm run test:ci
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./haru-app/coverage/lcov.info
        directory: ./haru-app
        flags: unittests
        name: haru-coverage
        fail_ci_if_error: true

  e2e-tests:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: 'haru-app/package-lock.json'
    
    - name: Install dependencies
      run: |
        cd haru-app
        npm ci
    
    - name: Install Playwright
      run: |
        cd haru-app
        npx playwright install --with-deps
    
    - name: Build application
      run: |
        cd haru-app
        npm run build
    
    - name: Run E2E tests
      run: |
        cd haru-app
        npm run test:e2e
    
    - name: Upload E2E artifacts
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: playwright-report
        path: haru-app/playwright-report/
        retention-days: 30
```

## 📈 Claude Code TDD 작업 진행 모니터링

### Claude Code의 테스트 커버리지 목표
- **2단계 완료**: 유틸리티 함수 90% 커버리지
- **3단계 완료**: API 계층 80% 커버리지  
- **4단계 완료**: 컴포넌트 70% 커버리지
- **5단계 완료**: 전체 75% 커버리지

### 품질 게이트
```javascript
// jest.config.js 커버리지 임계값 점진적 증가
coverageThreshold: {
  global: {
    branches: 75, // 최종 목표
    functions: 80,
    lines: 80,
    statements: 80,
  },
  './lib/utils/': {
    branches: 90,
    functions: 95,
    lines: 95,
    statements: 95,
  }
}
```

### Claude Code 작업 체크리스트
- [ ] 새로운 기능은 TDD 사이클로 구현되었는가?
- [ ] 테스트 커버리지가 목표치를 달성했는가?
- [ ] 모든 테스트가 의미 있고 유지보수 가능한가?
- [ ] Red-Green-Refactor 사이클이 제대로 준수되었는가?
- [ ] 로컬 Supabase 테스트 환경이 안정적으로 작동하는가?
- [ ] E2E 테스트가 주요 사용자 시나리오를 커버하는가?
- [ ] CI/CD 파이프라인이 안정적으로 작동하는가?

Claude Code가 이 플랜을 체계적으로 실행하여 haru 프로젝트에 TDD를 성공적으로 도입하고, 코드 품질과 개발 효율성을 크게 향상시키겠습니다! 🤖🚀

## Claude Code TDD 작업 완료 목표
- **견고한 테스트 기반**: 80% 이상의 의미 있는 테스트 커버리지
- **안정적인 리팩토링**: 테스트로 보장되는 안전한 코드 개선
- **빠른 개발 속도**: 새로운 기능 추가 시 신뢰할 수 있는 테스트 환경
- **버그 감소**: 회귀 버그 방지를 위한 포괄적인 테스트 스위트