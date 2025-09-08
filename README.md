# haru - 디지털 감정 일기

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

haru는 일상의 감정을 기록하고 AI와 함께 성찰하는 디지털 일기 애플리케이션입니다.

## 주요 기능

- 📅 **감정 캘린더**: 한 달의 감정 변화를 한눈에
- ✍️ **다양한 작성 모드**: 전통적 일기와 AI 대화형 일기
- 🤖 **AI 성찰**: 작성한 일기에 대한 AI의 인사이트와 대화
- 📸 **사진 첨부**: 소중한 순간을 사진과 함께 기록
- 🎨 **미니멀 디자인**: 따뜻한 핑크톤의 감성적인 UI

## 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Supabase
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod
- **AI Integration**: Vercel AI SDK
- **Deployment**: Vercel

## 문서

- [제품 선언서](./document/제품_선언서.md)
- [요건 정의서](./document/요건_정의서.md)
- [개발 가이드](./CLAUDE.md)

## 프로젝트 구조

```
haru/
├── document/          # 프로젝트 문서
├── resources/         # Figma 디자인 리소스
└── (추후 추가될 소스 코드 디렉토리)
```

## 시작하기

프로젝트는 현재 기획 및 설계 단계입니다. 

### 개발 환경 설정 (예정)

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local

# 개발 서버 실행
npm run dev
```

## 기여하기

이슈와 PR은 언제나 환영합니다!

## 라이선스

MIT License