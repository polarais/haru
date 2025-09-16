# haru - Development Plan

## 현재 구현 상태

### ✅ 완료된 기능
- **인증 시스템 (Phase 1)**
  - 로그인 페이지 (데모용 - 모든 이메일/비밀번호 허용)
  - 회원가입 페이지 
  - 비밀번호 재설정 페이지
  - 로그아웃 기능

- **일기 작성 (Phase 1-2)**
  - Journal 모드 (기본 일기 작성)
  - AI Chat 모드 (AI와 대화하며 작성)
  - 모드 간 전환 기능
  - 사진 첨부 기능
  - 커스텀 이모지 추가

- **일기 조회 (Phase 1)**
  - 캘린더 뷰 (월별 감정 표시)
  - 타임라인 뷰 (일기 목록)
  - 일기 상세보기 패널
  - 전체화면 보기
  - 일기 간 네비게이션 (전체 일기 순서대로)

- **일기 관리 (Phase 1)**
  - 일기 편집 (별도 편집 페이지)
  - 일기 삭제
  - 하루 최대 3개 제한

- **AI 기능 (Phase 2)**
  - AI 성찰 페이지 (일기 기반 AI 대화)
  - AI 요약 생성
  - AI 대화 저장

## 향후 개발 계획

### Phase 3 (Advanced Features)
- [ ] **실시간 자동 저장**
  - 노션 스타일 인라인 편집
  - 타이핑 중 자동 저장
  
- [ ] **인라인 편집**
  - 일기 패널에서 바로 편집 가능
  - 전체화면에서 바로 편집 가능
  
- [ ] **검색 기능**
  - 키워드로 일기 검색
  - 기분별 필터링
  - 날짜 범위 검색

- [ ] **데이터 관리**
  - 데이터 내보내기 (JSON, PDF)
  - 데이터 백업 기능
  - 일기 통계 (감정 패턴 분석)

### Phase 4 (Production Ready)
- [ ] **Supabase 연동**
  - 실제 사용자 인증
  - 데이터베이스 연동
  - 파일 업로드 (이미지)
  - Row Level Security 설정

- [ ] **성능 최적화**
  - 이미지 최적화
  - 무한 스크롤 (타임라인)
  - 캐싱 전략

- [ ] **추가 기능**
  - 다크 모드
  - 테마 커스터마이징
  - 푸시 알림 (일기 작성 리마인더)
  - 모바일 최적화

## 화면 전이 플로우 (현재 구현)

```
시작 → 인증 확인
├─ 비로그인 → 로그인 화면
│  ├─ 회원가입 → 회원가입 화면 → 로그인 화면
│  └─ 비밀번호 재설정 → 재설정 화면 → 로그인 화면
└─ 로그인됨 → 메인 화면 (캘린더 뷰)
   ├─ 캘린더 ↔ 타임라인 전환
   ├─ 날짜 클릭 → 일기 작성 OR 일기 패널
   ├─ + 버튼 → 일기 작성 (하루 3개 제한)
   ├─ 일기 패널 → 편집/삭제/전체화면/네비게이션
   ├─ 일기 작성 → Journal/AI Chat 모드 → AI 성찰 (선택)
   └─ 사이드바 → 로그아웃
```

## 기술 스택

### Frontend
- **React 18** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **Tailwind CSS v4** - 스타일링
- **Lucide React** - 아이콘
- **ShadCN/UI** - UI 컴포넌트

### Backend (예정 - Phase 4)
- **Supabase** - 백엔드 서비스
  - PostgreSQL 데이터베이스
  - 사용자 인증
  - 파일 스토리지
  - Row Level Security

### 배포 (예정)
- **Vercel** - 프론트엔드 배포
- **Supabase** - 백엔드 호스팅

## 데이터 구조 (현재 - 로컬 State)

```typescript
interface DiaryEntry {
  id: string;
  date: number;
  mood: string;
  title: string;
  content: string;
  preview: string;
  hasPhoto?: boolean;
  photoUrl?: string;
  photoFile?: File;
  aiReflection?: {
    summary: string;
    chatHistory: Array<{
      id: string;
      type: 'user' | 'ai';
      content: string;
      timestamp: Date;
    }>;
    savedAt: Date;
  };
}
```

## 주요 컴포넌트

### 인증 관련
- `LoginPage` - 로그인 화면
- `RegisterPage` - 회원가입 화면  
- `ResetPasswordPage` - 비밀번호 재설정

### 메인 화면
- `App` - 메인 앱 컨테이너
- `Sidebar` - 네비게이션 사이드바
- `MoodCalendar` - 감정 캘린더
- `EntryTimeline` - 일기 타임라인

### 일기 관련
- `WriteEntryPage` - 일기 작성 (Journal/AI Chat)
- `EntryViewPanel` - 일기 상세보기 패널
- `FullScreenEntryView` - 일기 전체화면
- `AIReflectionPage` - AI 성찰 대화

### UI 컴포넌트
- `FloatingAddButton` - 일기 추가 버튼
- `/components/ui/*` - ShadCN UI 컴포넌트들

## 다음 우선순위

1. **Phase 3 기능 구현**
   - 실시간 자동 저장
   - 인라인 편집
   - 검색 기능

2. **Supabase 연동 준비**
   - 데이터베이스 스키마 설계
   - API 계층 추가
   - 환경변수 설정

3. **사용자 경험 개선**
   - 로딩 상태 개선
   - 에러 처리 강화
   - 반응형 디자인 완성