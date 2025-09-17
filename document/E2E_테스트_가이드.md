# E2E 테스트 가이드

## 개요
Haru 프로젝트의 End-to-End (E2E) 테스트 설정 및 사용 가이드입니다.

## 설정 완료된 항목

### 1. 테스트 프레임워크 설치
- ✅ Playwright 설치 완료 (`@playwright/test`)
- ✅ 브라우저 바이너리 설치 완료 (Chromium, Firefox, WebKit)
- ✅ 설정 파일 생성 (`playwright.config.ts`)

### 2. E2E 테스트 구조
```
__tests__/e2e/
├── basic.spec.ts                  # 기본 페이지 로드 테스트
├── app-navigation.spec.ts         # 앱 네비게이션 테스트
├── diary-entry.spec.ts           # 일기 엔트리 기능 테스트
└── ai-reflection.spec.ts         # AI 리플렉션 기능 테스트
```

### 3. NPM 스크립트 추가
```json
{
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "test:e2e:debug": "playwright test --debug"
}
```

## 테스트 시나리오

### 1. 기본 기능 테스트 (`basic.spec.ts`)
- [x] 홈페이지 로드 확인
- [x] 기본 요소 렌더링 확인
- [x] 스크린샷 캡처

### 2. 앱 네비게이션 테스트 (`app-navigation.spec.ts`)
- [x] 메인 페이지에서 캘린더 표시 확인
- [x] 사이드바 가시성 확인
- [x] 글쓰기 페이지로 네비게이션
- [x] 글쓰기 페이지에서 사이드바 숨김 확인
- [x] 뒤로가기 기능
- [x] 캘린더/타임라인 뷰 토글
- [x] 모바일 반응형 디자인

### 3. 일기 엔트리 관리 테스트 (`diary-entry.spec.ts`)
- [x] 새 일기 엔트리 생성
- [x] 캘린더에서 일기 엔트리 보기
- [x] 엔트리 패널에서 네비게이션
- [x] 엔트리 패널 닫기
- [x] 키보드 네비게이션
- [x] 전체화면 확장

### 4. AI 리플렉션 테스트 (`ai-reflection.spec.ts`)
- [x] AI 리플렉션 페이지 네비게이션
- [x] 채팅 인터페이스 표시
- [x] AI에게 메시지 전송
- [x] Enter 키로 메시지 전송
- [x] 뒤로가기 기능
- [x] 세션 중 채팅 히스토리 유지

### 5. 완전한 사용자 여정 테스트 (`complete-user-journey.spec.ts`)
- [x] 일기 생성부터 삭제까지 전체 라이프사이클
- [x] 복수 엔트리 생성 및 관리 워크플로
- [x] AI 리플렉션 완전 경험
- [x] 복잡한 사용자 시나리오 처리
- [x] 브라우저 세션 간 데이터 일관성
- [x] 모바일 사용자 경험 최적화

### 6. 크로스 브라우저 호환성 테스트 (`cross-browser-compatibility.spec.ts`)
- [x] 다양한 브라우저에서 일관된 기능성
- [x] 키보드 네비게이션 호환성
- [x] 뷰포트 변경에 대한 일관된 응답
- [x] 모바일 브라우저 터치 이벤트

### 7. 성능 및 접근성 테스트 (`performance-accessibility.spec.ts`)
- [x] 페이지 로드 성능 벤치마크
- [x] 장애인 접근성 준수
- [x] 대용량 데이터셋 효율적 처리
- [x] 스트레스 조건 하 성능 유지

### 8. 포괄적 사용자 플로우 테스트 (`comprehensive-user-flows.spec.ts`)
- [x] 페이지 객체 모델을 사용한 구조화된 테스트
- [x] 실제 사용자 데이터를 사용한 시나리오
- [x] 성능 측정이 포함된 테스트
- [x] 에러 복구 시나리오
- [x] 접근성 검증

## 실행 방법

### 전제조건
1. Next.js 앱이 정상적으로 빌드되어야 함
2. 테스트 데이터가 준비되어야 함
3. 로컬 서버가 실행 가능해야 함

### 테스트 실행
```bash
# 모든 E2E 테스트 실행
npm run test:e2e

# UI 모드로 테스트 실행
npm run test:e2e:ui

# 디버그 모드로 테스트 실행
npm run test:e2e:debug

# 특정 브라우저에서만 실행
npx playwright test --project=chromium

# 특정 테스트 파일 실행
npx playwright test __tests__/e2e/basic.spec.ts
```

## 현재 상태 및 다음 단계

### ✅ 완료된 작업
- Playwright 설정 및 구성
- E2E 테스트 시나리오 작성
- 브라우저별 테스트 설정 (Chrome, Firefox, Safari, Mobile)
- 테스트 자동화를 위한 dev server 연동

### 🔄 현재 차단 요소
- Next.js 앱 빌드 에러로 인한 서버 실행 불가
- 타입 에러 및 컴포넌트 import 문제 해결 필요

### 📋 다음 단계 (앱 수정 후 실행 가능)
1. Next.js 앱의 빌드 에러 수정
2. 테스트 데이터 준비
3. E2E 테스트 실행 및 결과 확인
4. 실패하는 테스트 케이스 수정
5. CI/CD 파이프라인에 E2E 테스트 통합

## 테스트 설정 상세

### Playwright 설정 (`playwright.config.ts`)
```typescript
export default defineConfig({
  testDir: './__tests__/e2e',
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
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ],
  webServer: {
    command: 'cd haru-app && npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
```

## 모범 사례

### 1. 테스트 작성 가이드
- `data-testid` 속성을 사용하여 요소 선택
- 의미있는 테스트 이름과 설명 작성
- 테스트 간 독립성 보장
- 적절한 대기 조건 사용 (`waitFor`, `toBeVisible`)

### 2. 디버깅
- `--headed` 옵션으로 브라우저 창 표시
- `page.screenshot()` 으로 스크린샷 캡처
- `page.pause()` 로 디버깅 중단점 설정

### 3. 성능 고려사항
- 병렬 실행으로 테스트 속도 향상
- CI 환경에서는 retry 설정
- 헤드리스 모드로 실행 시간 단축