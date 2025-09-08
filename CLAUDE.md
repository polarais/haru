# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a journaling app called "haru" built with React, TypeScript, and Vite. The application is a wireframe design for a digital diary with mood tracking, AI reflection features, and multiple viewing modes.

## Development Commands

```bash
# Install dependencies
npm i

# Run development server (port 3000)
npm run dev

# Build for production
npm run build
```

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