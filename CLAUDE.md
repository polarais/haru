# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a journaling app called "haru" built with React, TypeScript, and Vite. The application is a wireframe design for a digital diary with mood tracking, AI reflection features, and multiple viewing modes.

## Development Commands

```bash
# Install dependencies
npm i

# Run development server (ALWAYS use port 3000)
npm run dev
# Note: If port 3000 is in use, stop other processes first
# NEVER use other ports - development server must run on port 3000

# Build for production
npm run build
```

## Development Server Rules

**CRITICAL**: The development server MUST ALWAYS run on port 3000.
- Use `lsof -ti:3000 | xargs kill -9` to clear port 3000 if needed
- Use `PORT=3000 npm run dev` to force port 3000
- Never accept alternative ports like 3001, 3002, etc.

## Architecture

### Core Application Structure
- **Main App Component**: `src/App.tsx` manages the entire application state and routing between different modes
- **Component-based Architecture**: All UI components are in `src/components/`
- **UI Library**: Uses shadcn/ui components stored in `src/components/ui/`
- **Styling**: Tailwind CSS with custom utility function `cn()` for className merging
- **State Management**: Local React state with useState hooks

### Key Application Modes
1. **main**: Default view showing calendar or timeline
2. **write**: Entry writing interface  
3. **fullscreen-view**: Expanded view for reading entries
4. **ai-reflection**: AI-powered reflection and chat interface

### Data Model
The core data structure is the `DiaryEntry` interface:
- `id`, `date`, `mood`, `title`, `content`, `preview`
- Optional: `hasPhoto`, `photoUrl`, `photoFile`
- Optional: `aiReflection` with chat history

### Component Organization
- **Page Components**: `WriteEntryPage`, `AIReflectionPage`, `FullScreenEntryView`
- **Feature Components**: `MoodCalendar`, `EntryTimeline`, `Sidebar`, `EntryViewPanel`
- **UI Components**: Radix UI primitives wrapped with Tailwind styling in `src/components/ui/`

### Path Aliasing
The project uses `@` alias for `src/` directory (configured in vite.config.ts)

## Key Implementation Details

### Date Handling
- Currently using simple number representation for dates (e.g., 4 for September 4th)
- Today is hardcoded as September 4, 2025

### Entry Limits
- Maximum 3 entries per day
- Automatic prompt to write for next day if limit reached

### Mobile Support  
- Responsive design with different layouts for desktop/mobile
- Mobile sidebar overlay
- Full-screen entry view on mobile

### Dependencies
- React 18.3.1
- Vite 6.3.5
- Radix UI components for accessible UI primitives
- Tailwind CSS with class-variance-authority
- lucide-react for icons

## Pre-Work Requirements

**MANDATORY**: Before starting any development task, you MUST review all documents in `/Users/hyeonjikim/Development/haru/document/` to understand:
- Product vision and core values
- Technical requirements and constraints
- Database structure design
- TDD methodology requirements
- Development workflow and testing strategies

### Document Review Checklist
- [ ] 제품_선언서.md - Product vision, core values, and target users
- [ ] 요건_정의서.md - Functional requirements, screen flows, and data schema
- [ ] 데이터베이스_구조_간소화.md - Database design (2-table architecture)
- [ ] TDD_구현_플랜.md - TDD implementation strategy
- [ ] TDD_적용_가이드.md - TDD application guidelines

## Product Vision & Core Values

Based on 제품_선언서.md, this project embodies:

### Core Values
- **단순함 (Simplicity)**: Clean, non-complex interface focused on writing essence
- **감정 중심 (Emotion-Centered)**: Visual tracking of daily moods and emotional changes
- **개인화된 대화 (Personalized Dialogue)**: Customized self-reflection through AI conversation
- **프라이버시 (Privacy)**: Safe protection of personal stories

### Key Features Implementation Priority
1. **Emotion Recording & Tracking**: 10 basic mood emojis + custom emojis, mood calendar
2. **Dual Writing Modes**: Journal (traditional) ↔ AI Chat (conversational), seamless switching
3. **AI Features**: Auto-summary, AI dialogue, timeline summary display
4. **View Modes**: Calendar view, timeline view, detailed view, fullscreen view
5. **User Experience**: Auto-save, intuitive navigation, responsive design

## Database Architecture (Simplified)

Based on 데이터베이스_구조_간소화.md, the project uses a **2-table architecture**:

### Core Tables
1. **user_profiles**: User settings and preferences (extends Supabase Auth)
2. **diaries**: All diary entries with JSONB fields for flexibility

### Key Design Principles
- **Simplicity**: Only 2 core tables for all functionality
- **Flexibility**: JSONB fields (`content`, `ai_chats`) for schema-less expansion
- **Security**: Row Level Security (RLS) for data isolation
- **Performance**: Strategic indexing for fast queries

### Data Constraints
- Maximum 3 entries per day per user
- Content stored as JSONB array with paragraph/image blocks
- AI chats stored as JSONB array with speaker/message/timestamp
- PostgreSQL (Supabase) with triggers for updated_at fields

## TDD Requirements

**CRITICAL**: This project follows Test-Driven Development with comprehensive test coverage.

### TDD Methodology (from TDD_적용_가이드.md)
- **Red-Green-Refactor Cycle**: Write failing test → Minimal implementation → Refactor
- **Test-First Development**: All new features must start with tests
- **Coverage Targets**: 95% utilities, 90% business logic, 80% components

### Test Infrastructure
- **Framework**: Jest + React Testing Library + Playwright (E2E)
- **Local Supabase**: Required for integration tests
- **Test Categories**: Unit, Integration, E2E
- **Mocking Strategy**: Next.js Router, AI services, external APIs

### Testing Workflow
1. **Before any coding**: Write failing tests first
2. **Implementation**: Write minimal code to pass tests
3. **Refactoring**: Improve code while keeping tests green
4. **Verification**: All tests must pass before commits

## Technical Requirements

Based on 요건_정의서.md:

### Performance Requirements
- Initial loading: < 3 seconds
- Diary saving: < 2 seconds  
- AI response start: < 1 second
- Image upload: < 5MB, < 10 seconds

### Screen Flow Implementation
- **Authentication Flow**: Email signup → verification → code input → completion
- **Main Navigation**: Calendar ↔ Timeline views with seamless transitions
- **Writing Flow**: Dual modes (Journal/AI Chat) with instant switching
- **AI Reflection**: Post-writing AI dialogue integration

### Business Constraints
- Daily entry limit: 3 entries maximum
- Image file size: 5MB maximum
- Auto-save: Notion-style immediate persistence

## Development Standards

### Code Quality
- **Component Architecture**: Separate presentation from logic (custom hooks)
- **State Management**: Local React state with Context for global data
- **Type Safety**: Strict TypeScript with proper interfaces
- **Error Handling**: Comprehensive error boundaries and user feedback

### UX/UI Standards  
- **Design System**: Pink-tone warm UI with shadcn/ui components
- **Responsive**: Desktop-first with mobile considerations
- **Navigation**: Instant Notion-style transitions without loading states
- **Accessibility**: Full keyboard support and screen reader compatibility

### Development Workflow
1. **Pre-work**: Review all `/document` files for context
2. **Planning**: Use TodoWrite for task breakdown and tracking
3. **TDD Cycle**: Red → Green → Refactor for all new features
4. **Testing**: Run full test suite before any commits
5. **Integration**: Ensure compatibility with existing codebase patterns

## Security & Privacy

### Data Protection
- **Authentication**: Supabase Auth with email verification
- **Data Isolation**: RLS policies for user data separation
- **File Storage**: Supabase Storage with access controls
- **API Security**: All communications over HTTPS

### Privacy-First Design
- **Local-First**: Data cached locally with 30-second freshness
- **Minimal Data**: Only essential information collected
- **User Control**: Full data deletion and export capabilities

## Integration Points

### AI Services
- **Provider Agnostic**: Support for multiple AI providers
- **Edge Functions**: Low-latency AI responses
- **Error Handling**: Graceful degradation when AI unavailable

### External Services
- **Supabase**: Database, Auth, Storage integration
- **Vercel**: Deployment and Edge Functions
- **Image Processing**: Optimization and CDN delivery

This comprehensive foundation ensures all development work aligns with the project's vision, technical requirements, and quality standards.