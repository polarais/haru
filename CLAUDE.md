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

## Testing Requirements

**CRITICAL**: This project uses Test-Driven Development (TDD) with comprehensive test coverage.

### TDD Test Execution
- **ALWAYS run TDD tests after any code modification**: `npm test`
- All 135+ tests must pass before considering any task complete
- Tests are located in `__tests__/` directory (root level, not haru-app/)
- Never commit or deploy changes that break existing tests

### Test Categories
- **Unit Tests**: Component testing (CalendarDay, MoodCalendarGrid, EntryViewPanel)
- **Integration Tests**: Calendar-entry interactions
- **Utility Tests**: Date/calendar utility functions
- **Repository Tests**: Data layer testing (Supabase integration)

### Development Workflow
1. Make code changes
2. Run `npm test` to verify all tests pass
3. Only proceed if all tests are green
4. Commit changes only after test verification