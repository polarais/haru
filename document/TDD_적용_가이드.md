# haru 프로젝트 TDD 적용 가이드

## 1. 개요

haru 디지털 감정 일기 프로젝트에 Test-Driven Development (TDD)를 Claude Code가 적용하기 위한 실행 가이드입니다.
현재 테스트 환경이 전혀 구축되어 있지 않은 상태에서 Claude Code가 점진적으로 TDD를 적용할 실용적인 접근 방법을 제시합니다.

## 2. 현재 상태 분석

### 2.1 기존 코드 현황
- **테스트 파일**: 없음
- **테스트 설정**: 없음
- **테스트 도구**: 없음
- **코드 구조**: 테스트하기 어려운 구조 (높은 결합도, 사이드 이펙트 많음)

### 2.2 주요 과제
1. 테스트 인프라 구축
2. 기존 코드 리팩토링 
3. TDD 방법론 적용
4. 점진적 테스트 커버리지 향상

## 3. 테스트 기술 스택

### 3.1 핵심 도구 선정

```json
{
  "devDependencies": {
    // 테스트 프레임워크
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.1.0",
    "@testing-library/user-event": "^14.5.0",
    
    // TypeScript 지원
    "ts-jest": "^29.1.0",
    "@types/jest": "^29.5.0",
    
    // 로컬 Supabase 환경
    "supabase": "^1.110.0",
    
    // E2E 테스트 (선택)
    "@playwright/test": "^1.40.0",
    
    // 시각적 테스트 (선택)
    "@storybook/react": "^7.5.0",
    "@storybook/nextjs": "^7.5.0"
  }
}
```

### 3.2 테스트 환경 전략

**단순한 2-tier 접근법:**
- **로컬 환경**: 개발 + 모든 테스트 (단위/통합/E2E)
- **프로덕션 환경**: 실제 운영

### 3.3 테스트 설정 구조

```
haru-app/
├── jest.config.js                 # Jest 설정
├── jest.setup.js                  # 테스트 환경 설정
├── supabase/                      # 로컬 Supabase 설정
│   ├── config.toml               # Supabase 로컬 설정
│   ├── migrations/               # DB 스키마
│   └── seed.sql                  # 테스트 데이터
├── __tests__/                     # 테스트 파일들
│   ├── utils/                    # 유틸리티 테스트
│   ├── components/               # 컴포넌트 테스트
│   ├── lib/                      # 라이브러리 테스트
│   └── integration/              # 통합 테스트
└── e2e/                          # E2E 테스트
    └── playwright.config.ts
```

## 4. TDD 적용 로드맵

### Phase 1: 테스트 인프라 구축 (Week 1-2)

#### 4.1 기본 설정
```bash
# Claude Code가 실행할 의존성 설치 명령어
npm install --save-dev jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event ts-jest @types/jest

# Supabase CLI 설치 (로컬 개발환경)
npm install -g @supabase/cli

# 로컬 Supabase 초기화
supabase init
supabase start
```

#### 4.2 Jest 설정 (`jest.config.js`)
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
  collectCoverageFrom: [
    'lib/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
```

#### 4.3 테스트 환경 설정 (`jest.setup.js`)
```javascript
import '@testing-library/jest-dom'
import { server } from './__mocks__/msw-server'

// MSW 서버 설정
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// 환경 변수 모킹
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
```

### Phase 2: 유틸리티 함수 TDD 적용 (Claude Code 작업 1단계)

#### 4.4 Claude Code가 순수 함수부터 TDD 시작

**예시: 날짜 유틸리티 테스트**
```typescript
// __tests__/utils/date.test.ts
import { formatDate, isToday, getDaysInMonth } from '@/lib/utils/date'

describe('Date Utilities', () => {
  describe('formatDate', () => {
    it('should format date string correctly', () => {
      expect(formatDate('2025-09-17')).toBe('September 17, 2025')
    })
    
    it('should handle invalid date gracefully', () => {
      expect(formatDate('invalid')).toBe('Invalid Date')
    })
  })
  
  describe('isToday', () => {
    it('should return true for today date', () => {
      const today = new Date().toISOString().split('T')[0]
      expect(isToday(today)).toBe(true)
    })
    
    it('should return false for past date', () => {
      expect(isToday('2020-01-01')).toBe(false)
    })
  })
})
```

#### 4.5 타입 안전성 테스트
```typescript
// __tests__/lib/types.test.ts
import { DiaryEntry, DiaryContentBlock } from '@/lib/types'

describe('Type Definitions', () => {
  it('should validate DiaryEntry structure', () => {
    const entry: DiaryEntry = {
      id: 'test-id',
      profile_id: 'user-id',
      date: '2025-09-17',
      mood: '😊',
      title: 'Test Entry',
      content: [],
      ai_chats: [],
      write_mode: 'journal',
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    expect(entry).toBeDefined()
    expect(entry.write_mode).toMatch(/^(journal|chat)$/)
  })
})
```

### Phase 3: API 계층 TDD 적용 (Claude Code 작업 2단계)

#### 4.6 DiaryAPI 리팩토링 및 테스트

**기존 문제점:**
- 정적 메서드로만 구성
- Supabase에 강하게 결합
- 모킹이 어려움

**개선 방향:**
```typescript
// lib/diary-api.ts 리팩토링
export interface IDiaryRepository {
  getEntries(): Promise<Result<DiaryEntry[]>>
  saveEntry(data: DiaryEntryData, id?: string): Promise<Result<DiaryEntry>>
  deleteEntry(id: string): Promise<Result<void>>
}

export class DiaryRepository implements IDiaryRepository {
  constructor(private supabase: SupabaseClient) {}
  
  async getEntries(): Promise<Result<DiaryEntry[]>> {
    // 구현
  }
}

// 의존성 주입을 통한 테스트 가능한 구조
export class DiaryService {
  constructor(private repository: IDiaryRepository) {}
}
```

**테스트 예시 (로컬 Supabase 사용):**
```typescript
// __tests__/lib/diary-api.test.ts
import { DiaryRepository } from '@/lib/diary-api'
import { createClient } from '@supabase/supabase-js'

describe('DiaryRepository', () => {
  let repository: DiaryRepository
  let supabase: any
  let testUser: any
  
  beforeEach(async () => {
    // 로컬 Supabase 클라이언트 생성
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // 테스트 사용자 생성
    const { data: user } = await supabase.auth.admin.createUser({
      email: 'test@example.com',
      password: 'testpassword123',
      email_confirm: true
    })
    testUser = user.user
    
    repository = new DiaryRepository(supabase)
  })
  
  afterEach(async () => {
    // 테스트 데이터 정리
    await supabase.from('diaries').delete().eq('profile_id', testUser.id)
    await supabase.auth.admin.deleteUser(testUser.id)
  })
  
  describe('getEntries', () => {
    it('should return entries for authenticated user', async () => {
      // Given - 테스트 엔트리 생성
      const testEntry = {
        profile_id: testUser.id,
        date: '2025-09-17',
        mood: '😊',
        title: 'Test Entry',
        content: [{ type: 'text', content: 'Test content' }],
        write_mode: 'journal'
      }
      
      await supabase.from('diaries').insert(testEntry)
      
      // When
      const result = await repository.getEntries(testUser.id)
      
      // Then
      expect(result.data).toHaveLength(1)
      expect(result.data[0].title).toBe('Test Entry')
      expect(result.error).toBeNull()
    })
    
    it('should return empty array for user with no entries', async () => {
      // When
      const result = await repository.getEntries(testUser.id)
      
      // Then
      expect(result.data).toEqual([])
      expect(result.error).toBeNull()
    })
  })
})
```

### Phase 4: 컴포넌트 TDD 적용 (Claude Code 작업 3단계)

#### 4.7 Claude Code에 의한 컴포넌트 리팩토링 전략

**문제가 있는 컴포넌트 예시:**
```typescript
// 현재: 테스트하기 어려운 구조
export default function MoodCalendar() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // 복잡한 데이터 로딩 로직
    loadEntries()
  }, [])
  
  const loadEntries = async () => {
    // Supabase 직접 호출
    const result = await DiaryAPI.getEntries()
    setEntries(result.data)
  }
  
  // 복잡한 렌더링 로직...
}
```

**개선된 구조:**
```typescript
// 커스텀 훅으로 로직 분리
export function useDiaryEntries() {
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const loadEntries = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    const result = await DiaryAPI.getEntries()
    if (result.error) {
      setError(result.error)
    } else {
      setEntries(result.data || [])
    }
    setLoading(false)
  }, [])
  
  useEffect(() => {
    loadEntries()
  }, [loadEntries])
  
  return { entries, loading, error, refetch: loadEntries }
}

// 순수한 프레젠테이션 컴포넌트
export function MoodCalendar({ 
  entries, 
  onDateClick, 
  onEntryClick 
}: MoodCalendarProps) {
  // 렌더링 로직만 담당
}

// 컨테이너 컴포넌트
export default function MoodCalendarContainer() {
  const { entries, loading, error } = useDiaryEntries()
  
  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />
  
  return <MoodCalendar entries={entries} {...handlers} />
}
```

#### 4.8 컴포넌트 테스트 예시

**커스텀 훅 테스트 (로컬 Supabase 사용):**
```typescript
// __tests__/hooks/useDiaryEntries.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { useDiaryEntries } from '@/hooks/useDiaryEntries'
import { createClient } from '@supabase/supabase-js'

describe('useDiaryEntries', () => {
  let testUser: any
  let supabase: any
  
  beforeEach(async () => {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const { data: user } = await supabase.auth.admin.createUser({
      email: 'test@example.com',
      password: 'testpassword123',
      email_confirm: true
    })
    testUser = user.user
    
    // 테스트 엔트리 생성
    await supabase.from('diaries').insert({
      profile_id: testUser.id,
      date: '2025-09-17',
      mood: '😊',
      title: 'Test Entry',
      content: [{ type: 'text', content: 'Test content' }],
      write_mode: 'journal'
    })
  })
  
  afterEach(async () => {
    await supabase.from('diaries').delete().eq('profile_id', testUser.id)
    await supabase.auth.admin.deleteUser(testUser.id)
  })
  
  it('should load entries on mount', async () => {
    // When
    const { result } = renderHook(() => useDiaryEntries())
    
    // Then
    expect(result.current.loading).toBe(true)
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.entries).toHaveLength(1)
      expect(result.current.entries[0].title).toBe('Test Entry')
      expect(result.current.error).toBeNull()
    })
  })
})
```

**컴포넌트 테스트:**
```typescript
// __tests__/components/MoodCalendar.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { MoodCalendar } from '@/components/MoodCalendar'

describe('MoodCalendar', () => {
  const mockProps = {
    entries: [
      {
        id: '1',
        date: '2025-09-17',
        mood: '😊',
        title: 'Happy Day'
      }
    ],
    onDateClick: jest.fn(),
    onEntryClick: jest.fn()
  }
  
  it('should render calendar with entries', () => {
    // Given & When
    render(<MoodCalendar {...mockProps} />)
    
    // Then
    expect(screen.getByText('😊')).toBeInTheDocument()
    expect(screen.getByText('Happy Day')).toBeInTheDocument()
  })
  
  it('should call onDateClick when date is clicked', () => {
    // Given
    render(<MoodCalendar {...mockProps} />)
    
    // When
    fireEvent.click(screen.getByText('17'))
    
    // Then
    expect(mockProps.onDateClick).toHaveBeenCalledWith(17)
  })
})
```

### Phase 5: 통합 테스트 및 E2E (Claude Code 작업 4단계)

#### 4.9 통합 테스트 예시
```typescript
// __tests__/integration/diary-flow.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DiaryWritePage } from '@/app/(protected)/write/page'

describe('Diary Writing Flow', () => {
  it('should complete diary writing process', async () => {
    const user = userEvent.setup()
    
    // Given
    render(<DiaryWritePage />)
    
    // When - 기분 선택
    await user.click(screen.getByText('😊'))
    
    // When - 제목 입력
    await user.type(screen.getByPlaceholderText('Title'), 'My Happy Day')
    
    // When - 내용 입력
    await user.type(screen.getByPlaceholderText('Start writing...'), 'Today was amazing!')
    
    // When - 저장
    await user.click(screen.getByText('Save'))
    
    // Then
    await waitFor(() => {
      expect(screen.getByText('Entry saved successfully')).toBeInTheDocument()
    })
  })
})
```

#### 4.10 E2E 테스트 (Playwright)
```typescript
// e2e/diary-creation.spec.ts
import { test, expect } from '@playwright/test'

test('User can create and view diary entry', async ({ page }) => {
  // Given - 로그인된 상태
  await page.goto('/login')
  await page.fill('[data-testid=email]', 'test@example.com')
  await page.fill('[data-testid=password]', 'password123')
  await page.click('[data-testid=login-button]')
  
  // When - 일기 작성
  await page.click('[data-testid=add-entry-button]')
  await page.click('[data-testid=mood-happy]')
  await page.fill('[data-testid=title-input]', 'E2E Test Entry')
  await page.fill('[data-testid=content-textarea]', 'This is a test entry created by E2E test')
  await page.click('[data-testid=save-button]')
  
  // Then - 작성된 일기가 캘린더에 표시됨
  await expect(page.locator('[data-testid=calendar-entry]')).toContainText('E2E Test Entry')
  
  // When - 일기 클릭하여 상세 보기
  await page.click('[data-testid=calendar-entry]')
  
  // Then - 패널에 일기 내용이 표시됨
  await expect(page.locator('[data-testid=entry-panel]')).toContainText('This is a test entry')
})
```

## 5. 로컬 Supabase 테스트 전략

### 5.1 로컬 Supabase 설정
```bash
# supabase/config.toml
[db]
port = 54322
password = "your-super-secret-and-long-postgres-password"

[auth]
enabled = true
site_url = "http://localhost:3000"
additional_redirect_urls = ["https://localhost:3000"]
jwt_expiry = 3600

[studio]
port = 54323
```

### 5.2 테스트용 데이터베이스 헬퍼
```typescript
// __tests__/helpers/database.ts
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
```

### 5.2 Next.js Router 모킹
```typescript
// __mocks__/next-router.ts
import { jest } from '@jest/globals'

export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  pathname: '/',
  query: {},
  asPath: '/'
}

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/'
}))
```

### 5.3 외부 API 모킹 (AI 서비스 등)
```typescript
// __tests__/helpers/mocks.ts
export const mockAIService = {
  generateSummary: jest.fn().mockResolvedValue({
    content: 'Mock AI summary',
    error: null
  }),
  generateResponse: jest.fn().mockResolvedValue({
    content: 'Mock AI response',
    error: null
  })
}

// 테스트에서 사용
beforeEach(() => {
  jest.doMock('@/lib/ai-service', () => ({
    AIService: mockAIService
  }))
})

afterEach(() => {
  jest.clearAllMocks()
})
```

## 6. CI/CD 통합

### 6.1 GitHub Actions 설정
```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run unit tests
      run: npm run test:unit
    
    - name: Run integration tests
      run: npm run test:integration
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
    
    - name: Run E2E tests
      run: |
        npm run build
        npm run test:e2e
```

### 6.2 Package.json 스크립트
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:unit": "jest --testPathPattern=__tests__/",
    "test:integration": "jest --testPathPattern=integration/",
    "test:e2e": "playwright test",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --watchAll=false"
  }
}
```

## 7. 테스트 가이드라인

### 7.1 테스트 작성 원칙

#### **좋은 테스트의 특징:**
1. **독립성**: 다른 테스트에 의존하지 않음
2. **반복 가능성**: 같은 조건에서 항상 같은 결과
3. **명확성**: 테스트 의도가 명확히 드러남
4. **빠른 실행**: 단위 테스트는 밀리초 단위로 실행
5. **의미 있는 실패**: 실패 시 원인을 쉽게 파악 가능

#### **테스트 명명 규칙:**
```typescript
// Given-When-Then 패턴
describe('DiaryService', () => {
  describe('createEntry', () => {
    it('should create entry when valid data provided', () => {
      // Given: 유효한 데이터가 주어졌을 때
      // When: 엔트리를 생성하면
      // Then: 성공적으로 생성되어야 한다
    })
    
    it('should throw error when invalid mood provided', () => {
      // Given: 유효하지 않은 mood가 주어졌을 때
      // When: 엔트리를 생성하면
      // Then: 에러가 발생해야 한다
    })
  })
})
```

### 7.2 TDD 사이클 적용

#### **Red-Green-Refactor 사이클:**

1. **🔴 Red (실패하는 테스트 작성)**
```typescript
// 먼저 실패하는 테스트 작성
it('should format date in Korean locale', () => {
  expect(formatDateKorean('2025-09-17')).toBe('2025년 9월 17일')
})
```

2. **🟢 Green (테스트를 통과하는 최소 코드 작성)**
```typescript
// 테스트를 통과하는 최소한의 구현
export function formatDateKorean(dateString: string): string {
  return '2025년 9월 17일' // 하드코딩으로 일단 통과
}
```

3. **🔄 Refactor (코드 개선)**
```typescript
// 제대로 된 구현으로 리팩토링
export function formatDateKorean(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
```

### 7.3 커버리지 목표

- **유틸리티 함수**: 95% 이상
- **비즈니스 로직**: 90% 이상
- **컴포넌트**: 80% 이상
- **통합 테스트**: 주요 사용자 흐름 100%

## 8. Claude Code의 TDD 적용 전략

### 8.1 Claude Code 작업 우선순위

1. **우선 작업 (Claude Code 즉시 시작)**
   - 새로운 기능 개발 시 TDD 적용
   - 새로운 유틸리티 함수 작성
   - 버그 수정 시 테스트 먼저 작성

2. **다음 단계 작업**
   - 기존 코드에 테스트 추가
   - 컴포넌트 리팩토링 및 테스트 작성
   - API 계층 테스트 이행

3. **지속적 개선 작업**
   - 레거시 코드 점진적 테스트 커버리지 향상
   - E2E 테스트 시나리오 확장
   - 성능 테스트 도입

### 8.2 Claude Code TDD 작업 가이드라인

#### **Claude Code의 TDD 작업 원칙:**
- 모든 새로운 기능에 대해 테스트 먼저 작성
- Red-Green-Refactor 사이클 엄격히 준수
- 테스트 가능한 코드 구조로 리팩토링

#### **코드 작성 기준:**
- 모든 새로운 코드는 테스트와 함께 작성
- 테스트 커버리지 80% 이상 유지
- 테스트 품질: 명확성, 유지보수성 중시

#### **지속적 모니터링:**
- 각 작업 후 테스트 실행 및 커버리지 확인
- 기능 추가 시 기존 테스트 통과 도 확인
- 자동화된 CI/CD 테스트 실행

## 9. 예상 효과 및 ROI

### 9.1 단기 효과 (1-3개월)
- 🐛 **버그 감소**: 단위 테스트로 회귀 버그 방지
- 🏃 **개발 속도 향상**: 안전한 리팩토링 가능
- 📝 **코드 품질 개선**: 테스트 가능한 구조로 설계

### 9.2 중장기 효과 (6개월 이상)
- 🚀 **배포 신뢰도 향상**: 자동화된 테스트로 안전한 배포
- 🔧 **유지보수성 개선**: 명확한 스펙과 안전한 변경
- 👥 **팀 생산성 증가**: 코드에 대한 이해도 향상

### 9.3 ROI 측정 지표
- 버그 발생률 감소 (목표: 50% 감소)
- 피처 개발 속도 증가 (목표: 30% 증가)
- 코드 리뷰 시간 단축 (목표: 40% 단축)
- 배포 롤백률 감소 (목표: 80% 감소)

## 10. Claude Code TDD 작업 마무리

Claude Code에 의한 TDD 적용은 단순히 테스트를 작성하는 것이 아니라, **더 나은 코드 품질과 신뢰성을 달성하기 위한 체계적인 접근**입니다.

### 10.1 Claude Code TDD 작업의 핵심 원칙
1. **테스트 먼저 작성**: 모든 기능 구현 전 테스트 케이스 작성
2. **점진적 개발**: Red-Green-Refactor 사이클 엄격히 준수
3. **코드 품질 중시**: 리팩토링을 통한 코드 개선
4. **테스트 커버리지 유지**: 의미 있는 테스트로 80% 이상 커버리지 달성

### 10.2 Claude Code 작업 시 주의사항
- 테스트를 위한 테스트 작성 금지
- 로컬 Supabase 환경에서의 안정적인 테스트 실행
- 컴포넌트와 로직의 적절한 분리
- 외부 API (예: AI 서비스) 의존성 최소화

### 10.3 기대 효과
- 버그 발생률 현저히 감소
- 코드 리팩토링 시 안전성 보장
- 새로운 기능 추가 시 빠른 개발 속도
- 전체적인 코드 품질 향상

Claude Code가 haru 프로젝트에 TDD를 체계적으로 적용하여 더 견고하고 신뢰할 수 있는 애플리케이션을 구축하겠습니다! 🤖🚀