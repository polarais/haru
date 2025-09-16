import React, { useState } from 'react';
import { Menu, X, Calendar, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MoodCalendar } from './components/MoodCalendar';
import { EntryTimeline } from './components/EntryTimeline';
import { Sidebar } from './components/Sidebar';
import { FloatingAddButton } from './components/FloatingAddButton';
import { WriteEntryPage } from './components/WriteEntryPage';
import { EntryViewPanel } from './components/EntryViewPanel';
import { FullScreenEntryView } from './components/FullScreenEntryView';
import { AIReflectionPage } from './components/AIReflectionPage';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { ResetPasswordPage } from './components/auth/ResetPasswordPage';

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

type ViewMode = 'calendar' | 'timeline';
type AppMode = 'main' | 'write' | 'fullscreen-view' | 'ai-reflection' | 'edit';
type AuthMode = 'login' | 'register' | 'reset-password';

export default function App() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isResetEmailSent, setIsResetEmailSent] = useState(false);
  
  // Existing state
  const [selectedDate, setSelectedDate] = useState<number | undefined>(undefined);
  const [currentView, setCurrentView] = useState<ViewMode>('calendar');
  const [appMode, setAppMode] = useState<AppMode>('main');
  const [writeDate, setWriteDate] = useState<number | null>(null);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null); // Add this for edit mode
  const [viewingEntry, setViewingEntry] = useState<DiaryEntry | null>(null);
  const [currentEntryIndex, setCurrentEntryIndex] = useState<number>(0); // Add this for multi-entry navigation
  const [isEntryPanelOpen, setIsEntryPanelOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [reflectionEntry, setReflectionEntry] = useState<DiaryEntry | null>(null);
  // Add calendar navigation state
  const [currentMonth, setCurrentMonth] = useState(9); // September = 9
  const [currentYear, setCurrentYear] = useState(2025);
  const [entries, setEntries] = useState<DiaryEntry[]>([
    {
      id: '1',
      date: 4,
      mood: '😊',
      title: 'Morning Gratitude',
      content: 'This morning, watching the sunlight stream through my window, I felt grateful for all the little things in life. I made my favorite coffee and sat by the window, watching the world wake up.',
      preview: 'This morning, watching the sunlight stream through my window, I felt grateful for all the little things...',
      hasPhoto: true,
      photoUrl: 'https://images.unsplash.com/photo-1728383587835-668155eca4f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWF1dGlmdWwlMjBtb3JuaW5nJTIwc3VubGlnaHQlMjB3aW5kb3clMjBjb2ZmZWV8ZW58MXx8fHwxNzU3MzEzMDk5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      id: '5',
      date: 4,
      mood: '🌟',
      title: 'Evening Reflection',
      content: 'What a beautiful day it has been! After my morning gratitude session, I spent the day working on my passion project. There\'s something magical about following your dreams.',
      preview: 'What a beautiful day it has been! After my morning gratitude session, I spent the day working...',
      hasPhoto: false
    },
    {
      id: '7',
      date: 4,
      mood: '🎵',
      title: 'Afternoon Music',
      content: 'Spent some time playing my guitar this afternoon. Music has this incredible way of expressing feelings that words sometimes can\'t capture.',
      preview: 'Spent some time playing my guitar this afternoon. Music has this incredible way of expressing feelings...',
      hasPhoto: false
    },
    {
      id: '2',
      date: 3,
      mood: '😌',
      title: 'Peaceful Evening',
      content: 'Had a quiet dinner by myself tonight. Sometimes solitude feels like the most precious gift. I spent time reading my favorite book and felt completely at peace with the world.',
      preview: 'Had a quiet dinner by myself tonight. Sometimes solitude feels like the most precious gift...',
      hasPhoto: false
    },
    {
      id: '6',
      date: 3,
      mood: '📚',
      title: 'Reading Session',
      content: 'Continued reading that fascinating novel I started yesterday. The characters feel so real, and their journey resonates with my own experiences. Books have this amazing power to transport us.',
      preview: 'Continued reading that fascinating novel I started yesterday. The characters feel so real...',
      hasPhoto: false
    },
    {
      id: '8',
      date: 3,
      mood: '☕',
      title: 'Coffee Shop Vibes',
      content: 'Discovered a new coffee shop today. The atmosphere was perfect for journaling, and I spent hours just people-watching and writing.',
      preview: 'Discovered a new coffee shop today. The atmosphere was perfect for journaling, and I spent hours...',
      hasPhoto: false
    },

    {
      id: '3',
      date: 2,
      mood: '🥰',
      title: 'Warm Meeting with Friends',
      content: 'Met with a friend after a long time and had a long conversation at a cafe. We shared updates about our lives, laughed together, and had meaningful discussions. I realized how precious these moments are.',
      preview: 'Met with a friend after a long time and had a long conversation at a cafe. We shared updates...',
      hasPhoto: false
    },
    {
      id: '4',
      date: 1,
      mood: '🤔',
      title: 'Thoughts on New Beginnings',
      content: 'As September begins, I have many thoughts. Should I try new challenges or continue on my current path? Sometimes choices are difficult, but I think the process of contemplating itself is part of growth.',
      preview: 'As September begins, I have many thoughts. Should I try new challenges or continue on my current path...',
      hasPhoto: false
    }
  ]);

  const getEntriesForDate = (date: number) => {
    return entries.filter(entry => entry.date === date);
  };

  // Auth handlers
  const handleLogin = async (email: string, password: string) => {
    setAuthLoading(true);
    setAuthError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, accept any email/password
      if (email && password) {
        setIsAuthenticated(true);
        setAuthError(null);
      } else {
        setAuthError('Please enter valid credentials');
      }
    } catch (error) {
      setAuthError('Login failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (email: string, password: string, confirmPassword: string) => {
    setAuthLoading(true);
    setAuthError(null);
    
    try {
      if (password !== confirmPassword) {
        setAuthError('Passwords do not match');
        return;
      }
      
      if (password.length < 6) {
        setAuthError('Password must be at least 6 characters');
        return;
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, accept any valid input
      setIsAuthenticated(true);
      setAuthError(null);
    } catch (error) {
      setAuthError('Registration failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleResetPassword = async (email: string) => {
    setAuthLoading(true);
    setAuthError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsResetEmailSent(true);
      setAuthError(null);
    } catch (error) {
      setAuthError('Failed to send reset email. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthMode('login');
    setAuthError(null);
    setIsResetEmailSent(false);
    // Reset app state
    setAppMode('main');
    setIsEntryPanelOpen(false);
    setViewingEntry(null);
    setSelectedDate(undefined);
  };

  const handleDateClick = (date: number) => {
    const dayEntries = getEntriesForDate(date);
    
    if (dayEntries.length === 0) {
      // If no entries exist, open the write page
      setWriteDate(date);
      setAppMode('write');
      setSelectedDate(date);
    } else {
      // For existing entries, show preview panel first
      const firstEntry = dayEntries[0];
      
      // Get all entries sorted by date (ascending - oldest first) and by ID within same date
      const sortedEntries = [...entries].sort((a, b) => {
        if (a.date !== b.date) {
          return a.date - b.date; // Sort by date ascending
        }
        return a.id.localeCompare(b.id); // Sort by ID within same date for consistency
      });
      const entryIndex = sortedEntries.findIndex(e => e.id === firstEntry.id);
      
      setViewingEntry(firstEntry);
      setCurrentEntryIndex(entryIndex !== -1 ? entryIndex : 0); // Set the correct index in full list
      setIsEntryPanelOpen(true);
      setSelectedDate(date);
    }
  };

  const handleEntryClick = (entry: DiaryEntry) => {
    // Show preview panel first, then allow editing from fullscreen view
    // Get all entries sorted by date (ascending - oldest first) and by ID within same date
    const sortedEntries = [...entries].sort((a, b) => {
      if (a.date !== b.date) {
        return a.date - b.date; // Sort by date ascending
      }
      return a.id.localeCompare(b.id); // Sort by ID within same date for consistency
    });
    const entryIndex = sortedEntries.findIndex(e => e.id === entry.id);
    
    setViewingEntry(entry);
    setCurrentEntryIndex(entryIndex !== -1 ? entryIndex : 0); // Set the correct index in full list
    setIsEntryPanelOpen(true);
    setSelectedDate(entry.date);
  };

  // Add navigation functions for multi-entry cycling - Updated to work across all entries in chronological order
  const handlePreviousEntry = () => {
    if (!viewingEntry) return;
    
    // Get all entries sorted by date (ascending - oldest first) and by ID within same date
    const sortedEntries = [...entries].sort((a, b) => {
      if (a.date !== b.date) {
        return a.date - b.date; // Sort by date ascending
      }
      return a.id.localeCompare(b.id); // Sort by ID within same date for consistency
    });
    const currentIndex = sortedEntries.findIndex(entry => entry.id === viewingEntry.id);
    
    if (currentIndex === -1) return;
    
    // Move to previous entry (or wrap to last if at beginning)
    const newIndex = currentIndex > 0 ? currentIndex - 1 : sortedEntries.length - 1;
    const newEntry = sortedEntries[newIndex];
    
    setViewingEntry(newEntry);
    setSelectedDate(newEntry.date);
    setCurrentEntryIndex(newIndex);
  };

  const handleNextEntry = () => {
    if (!viewingEntry) return;
    
    // Get all entries sorted by date (ascending - oldest first) and by ID within same date
    const sortedEntries = [...entries].sort((a, b) => {
      if (a.date !== b.date) {
        return a.date - b.date; // Sort by date ascending
      }
      return a.id.localeCompare(b.id); // Sort by ID within same date for consistency
    });
    const currentIndex = sortedEntries.findIndex(entry => entry.id === viewingEntry.id);
    
    if (currentIndex === -1) return;
    
    // Move to next entry (or wrap to first if at end)
    const newIndex = currentIndex < sortedEntries.length - 1 ? currentIndex + 1 : 0;
    const newEntry = sortedEntries[newIndex];
    
    setViewingEntry(newEntry);
    setSelectedDate(newEntry.date);
    setCurrentEntryIndex(newIndex);
  };

  const handleCloseEntryPanel = () => {
    setIsEntryPanelOpen(false);
    setViewingEntry(null);
    setSelectedDate(undefined);
    setCurrentEntryIndex(0); // Reset index when closing
  };

  const handleCloseMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  const handleExpandToFullScreen = () => {
    // Directly transition to edit mode
    if (viewingEntry) {
      setEditingEntry(viewingEntry);
      setAppMode('edit');
      setIsEntryPanelOpen(false);
    }
  };

  const handleCloseFullScreen = () => {
    setAppMode('main');
    setIsEntryPanelOpen(true);
  };

  const handleAddEntry = () => {
    // Always open write page for today (4th)
    const today = 4;
    const todayEntries = getEntriesForDate(today);
    
    // Check if today already has 3 entries
    if (todayEntries.length >= 3) {
      // Show alert and suggest writing for tomorrow
      const tomorrow = today + 1;
      const confirmed = window.confirm(
        `You've already written 3 entries for today (September ${today}). Would you like to write an entry for tomorrow (September ${tomorrow}) instead?`
      );
      
      if (confirmed) {
        setWriteDate(tomorrow);
        setAppMode('write');
        setSelectedDate(tomorrow);
      }
      return;
    }
    
    setWriteDate(today);
    setAppMode('write');
    setSelectedDate(today);
  };

  const handleSaveEntry = (newEntry: { date: number; mood: string; title: string; content: string; photoUrl?: string; photoFile?: File }) => {
    const entry: DiaryEntry = {
      id: Date.now().toString(),
      date: newEntry.date,
      mood: newEntry.mood,
      title: newEntry.title,
      content: newEntry.content,
      preview: newEntry.content.slice(0, 100) + (newEntry.content.length > 100 ? '...' : ''),
      hasPhoto: !!newEntry.photoUrl,
      photoUrl: newEntry.photoUrl,
      photoFile: newEntry.photoFile
    };

    setEntries(prev => [...prev, entry]);
    setAppMode('main');
    setWriteDate(null);
  };

  const handleReflectOnEntry = (entry: DiaryEntry) => {
    // Get the latest version of the entry from entries array (in case it has been updated with AI reflection)
    const latestEntry = entries.find(e => e.id === entry.id) || entry;
    
    setReflectionEntry(latestEntry);
    setViewingEntry(latestEntry); // Also set viewing entry for later use
    setAppMode('ai-reflection');
  };

  const handleCloseReflection = () => {
    setAppMode('main');
    setReflectionEntry(null);
  };

  // Add new handler for closing reflection to fullscreen view
  const handleCloseReflectionToFullscreen = () => {
    if (!reflectionEntry) return;
    
    // Go to edit mode instead of fullscreen view
    setAppMode('edit');
    setReflectionEntry(null);
    
    // Set up edit entry to show the entry we were reflecting on
    setEditingEntry(reflectionEntry);
    setSelectedDate(reflectionEntry.date);
    
    // Set the correct entry index for navigation
    const sortedEntries = [...entries].sort((a, b) => {
      if (a.date !== b.date) {
        return a.date - b.date;
      }
      return a.id.localeCompare(b.id);
    });
    const entryIndex = sortedEntries.findIndex(e => e.id === reflectionEntry.id);
    setCurrentEntryIndex(entryIndex !== -1 ? entryIndex : 0);
  };

  const handleSaveReflection = (reflectionData: {
    summary: string;
    chatHistory: Array<{
      id: string;
      type: 'user' | 'ai';
      content: string;
      timestamp: Date;
    }>;
  }) => {
    if (!reflectionEntry) return;

    // Update the existing entry with AI reflection instead of creating a new one
    const updatedEntry: DiaryEntry = {
      ...reflectionEntry,
      aiReflection: {
        summary: reflectionData.summary,
        chatHistory: reflectionData.chatHistory,
        savedAt: new Date()
      }
    };

    // Update the entry in the entries list
    setEntries(prev => prev.map(entry => 
      entry.id === reflectionEntry.id ? updatedEntry : entry
    ));
    
    // Return to main view after saving
    setAppMode('main');
    setReflectionEntry(null);
  };

  // Add auto-save handler for AI reflections that doesn't close the view
  const handleAutoSaveReflection = (reflectionData: {
    summary: string;
    chatHistory: Array<{
      id: string;
      type: 'user' | 'ai';
      content: string;
      timestamp: Date;
    }>;
  }) => {
    if (!reflectionEntry) return;

    // Update the existing entry with AI reflection without closing the view
    const updatedEntry: DiaryEntry = {
      ...reflectionEntry,
      aiReflection: {
        summary: reflectionData.summary,
        chatHistory: reflectionData.chatHistory,
        savedAt: new Date()
      }
    };

    // Update the entry in the entries list
    setEntries(prev => prev.map(entry => 
      entry.id === reflectionEntry.id ? updatedEntry : entry
    ));
    
    // Update the reflection entry reference to keep the session active
    setReflectionEntry(updatedEntry);
    
    // Don't change app mode - keep user in reflection mode
  };

  const handleDeleteEntry = (entryToDelete: DiaryEntry) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${entryToDelete.title}"? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    setEntries(prev => prev.filter(entry => entry.id !== entryToDelete.id));
    
    // If we're viewing this entry, close the panel
    if (viewingEntry && viewingEntry.id === entryToDelete.id) {
      setIsEntryPanelOpen(false);
      setViewingEntry(null);
      setSelectedDate(undefined);
      setCurrentEntryIndex(0);
    }
  };

  const handleCancelWrite = () => {
    setAppMode('main');
    setWriteDate(null);
  };

  const handleEditEntry = (entry: DiaryEntry) => {
    setEditingEntry(entry);
    setAppMode('edit');
    setIsEntryPanelOpen(false); // Close the panel when editing
  };

  const handleUpdateEntry = (updatedData: { date: number; mood: string; title: string; content: string; photoUrl?: string; photoFile?: File }) => {
    if (!editingEntry) return;

    const updatedEntry: DiaryEntry = {
      ...editingEntry,
      mood: updatedData.mood,
      title: updatedData.title,
      content: updatedData.content,
      preview: updatedData.content.slice(0, 100) + (updatedData.content.length > 100 ? '...' : ''),
      hasPhoto: !!updatedData.photoUrl,
      photoUrl: updatedData.photoUrl,
      photoFile: updatedData.photoFile
    };

    setEntries(prev => prev.map(entry => 
      entry.id === editingEntry.id ? updatedEntry : entry
    ));
    
    // Return to main view after updating (Notion-like behavior)
    setAppMode('main');
    setEditingEntry(null);
  };

  // Add auto-save handler for edit mode that doesn't close the editing view
  const handleAutoSaveEntry = (updatedData: { date: number; mood: string; title: string; content: string; photoUrl?: string; photoFile?: File }) => {
    if (!editingEntry) return;

    const updatedEntry: DiaryEntry = {
      ...editingEntry,
      mood: updatedData.mood,
      title: updatedData.title,
      content: updatedData.content,
      preview: updatedData.content.slice(0, 100) + (updatedData.content.length > 100 ? '...' : ''),
      hasPhoto: !!updatedData.photoUrl,
      photoUrl: updatedData.photoUrl,
      photoFile: updatedData.photoFile
    };

    setEntries(prev => prev.map(entry => 
      entry.id === editingEntry.id ? updatedEntry : entry
    ));
    
    // Update the editing entry reference to keep editing session active
    setEditingEntry(updatedEntry);
    
    // Don't change app mode - keep user in edit mode
  };

  const handleCancelEdit = () => {
    setAppMode('main');
    setEditingEntry(null);
    
    // Don't return to viewing the entry - just go back to main view (Notion-like behavior)
  };

  const handleGoToToday = () => {
    const todayMonth = 9; // September
    const todayYear = 2025;
    
    // Navigate to today's month if not already there
    if (currentMonth !== todayMonth || currentYear !== todayYear) {
      setCurrentMonth(todayMonth);
      setCurrentYear(todayYear);
    }
    
    // Just close any open panels and clear selection - don't auto-select today's date
    setIsEntryPanelOpen(false);
    setViewingEntry(null);
    setSelectedDate(undefined);
  }; 

  const handlePreviousMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    // Close any open panels when navigating months
    setIsEntryPanelOpen(false);
    setViewingEntry(null);
    setSelectedDate(undefined);
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    // Close any open panels when navigating months
    setIsEntryPanelOpen(false);
    setViewingEntry(null);
    setSelectedDate(undefined);
  };

  // Show auth screens if not authenticated
  if (!isAuthenticated) {
    if (authMode === 'login') {
      return (
        <LoginPage
          onLogin={handleLogin}
          onGoToRegister={() => {
            setAuthMode('register');
            setAuthError(null);
          }}
          onGoToResetPassword={() => {
            setAuthMode('reset-password');
            setAuthError(null);
            setIsResetEmailSent(false);
          }}
          isLoading={authLoading}
          error={authError}
        />
      );
    }

    if (authMode === 'register') {
      return (
        <RegisterPage
          onRegister={handleRegister}
          onGoToLogin={() => {
            setAuthMode('login');
            setAuthError(null);
          }}
          isLoading={authLoading}
          error={authError}
        />
      );
    }

    if (authMode === 'reset-password') {
      return (
        <ResetPasswordPage
          onResetPassword={handleResetPassword}
          onGoBack={() => {
            setAuthMode('login');
            setAuthError(null);
            setIsResetEmailSent(false);
          }}
          isLoading={authLoading}
          error={authError}
          isEmailSent={isResetEmailSent}
        />
      );
    }
  }

  if (appMode === 'write') {
    return (
      <motion.div
        key="write-page"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ 
          duration: 0.25,
          ease: "easeOut"
        }}
        className="fixed inset-0 z-50"
      >
        <WriteEntryPage
          selectedDate={writeDate}
          onSave={handleSaveEntry}
          onCancel={handleCancelWrite}
          onReflect={handleReflectOnEntry}
        />
      </motion.div>
    );
  }

  if (appMode === 'fullscreen-view' && viewingEntry) {
    return (
      <FullScreenEntryView
        entry={viewingEntry}
        onClose={handleCloseFullScreen}
        // Add navigation props for full screen view too
        currentEntryIndex={currentEntryIndex}
        totalEntries={entries.length} // Use total entries count instead of daily entries
        onPreviousEntry={handlePreviousEntry}
        onNextEntry={handleNextEntry}
        // Add onEdit back for fullscreen editing
        onEdit={handleEditEntry}
        onDelete={handleDeleteEntry}
      />
    );
  }

  // Add new handler for closing reflection to fullscreen view
  if (appMode === 'ai-reflection' && reflectionEntry) {
    return (
      <motion.div
        key="ai-reflection"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ 
          duration: 0.25,
          ease: "easeOut"
        }}
        className="fixed inset-0 z-50"
      >
        <AIReflectionPage
          entry={reflectionEntry}
          onClose={handleCloseReflectionToFullscreen}
          onSave={handleSaveReflection}
          onAutoSave={handleAutoSaveReflection}
        />
      </motion.div>
    );
  }

  if (appMode === 'edit' && editingEntry) {
    return (
      <motion.div
        key="edit-page"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ 
          duration: 0.25,
          ease: "easeOut"
        }}
        className="fixed inset-0 z-50"
      >
        <WriteEntryPage
          selectedDate={editingEntry.date}
          onSave={handleUpdateEntry}
          onCancel={handleCancelEdit}
          onReflect={handleReflectOnEntry}
          onAutoSave={handleAutoSaveEntry}
          existingEntry={{
            id: editingEntry.id,
            mood: editingEntry.mood,
            title: editingEntry.title,
            content: editingEntry.content,
            photoUrl: editingEntry.photoUrl,
            photoFile: editingEntry.photoFile
          }}
        />
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <div className="h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 flex relative overflow-hidden">
        {/* Desktop Sidebar */}
        <div className={`hidden lg:block h-screen transition-all duration-300 ease-in-out ${
          isEntryPanelOpen ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'
        }`}>
          <Sidebar 
            currentView={currentView} 
            onViewChange={setCurrentView}
            entriesCount={entries.length}
            onLogout={handleLogout}
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50" onClick={handleCloseMobileSidebar}>
            <div className="h-full w-64 bg-white" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-gray-800">Menu</h2>
                <button
                  onClick={handleCloseMobileSidebar}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <X size={16} className="text-gray-600" />
                </button>
              </div>
              <Sidebar 
                currentView={currentView} 
                onViewChange={(view) => {
                  setCurrentView(view);
                  setIsMobileSidebarOpen(false);
                }}
                entriesCount={entries.length}
                isMobile={true}
                onLogout={handleLogout}
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isEntryPanelOpen ? 'lg:-ml-64 lg:mr-[28rem]' : 'lg:ml-0'
        }`}>
          {/* Header */}
          <header className="bg-white/80 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-10">
            <div className="px-4 lg:px-6 py-4">
              {/* Desktop Header */}
              <div className="hidden lg:flex items-center justify-between">
                <div>
                  <h1 className="text-gray-800">
                    {currentView === 'calendar' ? 'Calendar' : 'Time Table'}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    {currentView === 'calendar' 
                      ? 'Track your daily moods and memories' 
                      : 'Review all your journal entries'
                    }
                  </p>
                </div>
                {/* Today Button - Only show in calendar view */}
                {currentView === 'calendar' && (
                  <div className="flex flex-col items-end">
                    <button 
                      onClick={handleGoToToday}
                      className="px-4 py-2 rounded-lg bg-pink-100 hover:bg-pink-200 transition-colors"
                    >
                      <span className="text-pink-700">Today</span>
                    </button>
                    <p className="text-xs text-gray-500 mt-1">
                      Today is Thursday, September 4, 2025
                    </p>
                  </div>
                )}
                {/* Show original date text for timeline view */}
                {currentView === 'timeline' && (
                  <div className="text-sm text-gray-500">
                    Today is Thursday, September 4, 2025
                  </div>
                )}
              </div>

              {/* Mobile Header */}
              <div className="lg:hidden">
                {/* Top Row - App Title, Today Button (if calendar), and Menu */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-rose-400 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm">💕</span>
                    </div>
                    <h1 className="text-gray-800">haru</h1>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Today Button for mobile calendar view */}
                    {currentView === 'calendar' && (
                      <button 
                        onClick={handleGoToToday}
                        className="px-3 py-1.5 rounded-lg bg-pink-100 hover:bg-pink-200 transition-colors"
                      >
                        <span className="text-pink-700 text-sm">Today</span>
                      </button>
                    )}
                    <button
                      onClick={() => setIsMobileSidebarOpen(true)}
                      className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    >
                      <Menu size={16} className="text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Mobile Tabs */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setCurrentView('calendar')}
                    className={`
                      flex-1 py-2 rounded-md flex items-center justify-center gap-2 text-sm transition-all
                      ${currentView === 'calendar' 
                        ? 'bg-white text-pink-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-800'
                      }
                    `}
                  >
                    <Calendar size={16} />
                    Calendar
                  </button>
                  <button
                    onClick={() => setCurrentView('timeline')}
                    className={`
                      flex-1 py-2 rounded-md flex items-center justify-center gap-2 text-sm transition-all
                      ${currentView === 'timeline' 
                        ? 'bg-white text-pink-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-800'
                      }
                    `}
                  >
                    <Clock size={16} />
                    Timeline
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 p-4 lg:p-6 overflow-hidden">
            {currentView === 'calendar' ? (
              <div className="max-w-4xl mx-auto h-full flex items-center justify-center">
                <div className="w-full h-full lg:h-auto">
                  <MoodCalendar 
                    onDateClick={handleDateClick}
                    onEntryClick={handleEntryClick}
                    onAddNewEntry={(date) => {
                      const dayEntries = getEntriesForDate(date);
                      if (dayEntries.length < 3) {
                        setWriteDate(date);
                        setAppMode('write');
                        setSelectedDate(date);
                      }
                    }}
                    selectedDate={selectedDate}
                    entries={entries}
                    currentMonth={currentMonth}
                    currentYear={currentYear}
                    onPreviousMonth={handlePreviousMonth}
                    onNextMonth={handleNextMonth}
                  />
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto h-full flex items-center justify-center">
                <div className="w-full h-full lg:h-auto">
                  <div className="bg-white rounded-xl p-4 lg:p-8 shadow-sm border border-gray-100 h-full lg:h-[calc(100vh-12rem)]">
                    <EntryTimeline 
                      entries={entries} 
                      onEntryClick={handleEntryClick}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Entry View Panel - Desktop */}
        <div className="hidden lg:block">
          <EntryViewPanel
            entry={viewingEntry}
            isOpen={isEntryPanelOpen}
            onClose={handleCloseEntryPanel}
            onExpand={handleExpandToFullScreen}
            // Add navigation props
            currentEntryIndex={currentEntryIndex}
            totalEntries={entries.length} // Use total entries count instead of daily entries
            onPreviousEntry={handlePreviousEntry}
            onNextEntry={handleNextEntry}
            // Remove onEdit prop - entries are edited by clicking them directly
            onDelete={handleDeleteEntry}
          />
        </div>

        {/* Entry View Panel - Mobile (Full Screen) */}
        {isEntryPanelOpen && viewingEntry && (
          <div className="lg:hidden fixed inset-0 bg-white z-50">
            <FullScreenEntryView
              entry={viewingEntry}
              onClose={handleCloseEntryPanel}
              // Add navigation props for full screen view too
              currentEntryIndex={currentEntryIndex}
              totalEntries={entries.length} // Use total entries count instead of daily entries
              onPreviousEntry={handlePreviousEntry}
              onNextEntry={handleNextEntry}
              // Add onEdit back for fullscreen editing
              onEdit={handleEditEntry}
              onDelete={handleDeleteEntry}
            />
          </div>
        )}
        
        {/* Floating Add Button */}
        <FloatingAddButton onClick={handleAddEntry} />
      </div>
    </AnimatePresence>
  );
}