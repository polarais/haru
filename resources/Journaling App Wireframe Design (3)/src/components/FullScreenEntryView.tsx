import React, { useState } from 'react';
import { ArrowLeft, Calendar, Clock, Camera, FileText, Sparkles, ChevronLeft, ChevronRight, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

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

interface FullScreenEntryViewProps {
  entry: DiaryEntry;
  onClose: () => void;
  // Add navigation props (optional since not all full screen views have navigation)
  currentEntryIndex?: number;
  totalEntries?: number;
  onPreviousEntry?: () => void;
  onNextEntry?: () => void;
  // Add onEdit back for fullscreen editing
  onEdit?: (entry: DiaryEntry) => void;
  onDelete?: (entry: DiaryEntry) => void;
}

export function FullScreenEntryView({ entry, onClose, currentEntryIndex, totalEntries, onPreviousEntry, onNextEntry, onEdit, onDelete }: FullScreenEntryViewProps) {
  const [activeTab, setActiveTab] = useState<'journal' | 'ai'>('journal');
  
  const formatDate = (date: number) => {
    return `September ${date}, 2025`;
  };

  const formatDay = (date: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    // September 2025 starts on Monday (1st = Monday)
    const dayIndex = date % 7;
    return days[dayIndex === 0 ? 6 : dayIndex - 1];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-4">
          <div className="flex lg:grid lg:grid-cols-3 items-center gap-4">
            {/* Left Section - Back Button, Mood & Title */}
            <div className="flex items-center gap-3 lg:gap-4 min-w-0 flex-1 lg:flex-none">
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors flex-shrink-0"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div className="flex items-center gap-3 min-w-0 flex-1 lg:flex-none">
                <span className="text-2xl lg:text-3xl flex-shrink-0">{entry.mood}</span>
                <div className="min-w-0 flex-1 lg:flex-none">
                  <h1 className="text-gray-800 truncate text-base lg:text-lg">{entry.title}</h1>
                  <div className="flex items-center gap-2 lg:gap-3 text-xs lg:text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} className="lg:w-[14px] lg:h-[14px]" />
                      <span className="hidden sm:inline">{formatDate(entry.date)} • {formatDay(entry.date)}</span>
                      <span className="sm:hidden">{formatDate(entry.date)}</span>
                    </div>
                    {entry.aiReflection && (
                      <>
                        <span className="hidden sm:inline">•</span>
                        <span className="text-purple-600 hidden sm:inline">AI Reflection included</span>
                        <span className="text-purple-600 sm:hidden">AI</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {/* Menu dropdown - Only show if handlers are provided */}
              {(onEdit || onDelete) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors flex-shrink-0 lg:hidden">
                      <MoreHorizontal size={16} className="text-gray-500" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-32">
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(entry)} className="flex items-center gap-2">
                        <Edit size={14} />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem 
                        onClick={() => onDelete(entry)} 
                        className="flex items-center gap-2 text-red-600 focus:text-red-600 focus:bg-red-50"
                      >
                        <Trash2 size={14} />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            
            {/* Center Section - Empty now */}
            <div className="hidden lg:flex justify-center">
            </div>
            
            {/* Right Section - Menu only */}
            <div className="flex justify-end lg:justify-end items-center gap-2">
              {/* Menu dropdown for desktop - Only show if handlers are provided */}
              {(onEdit || onDelete) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors flex-shrink-0 hidden lg:flex">
                      <MoreHorizontal size={16} className="text-gray-500" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-32">
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(entry)} className="flex items-center gap-2">
                        <Edit size={14} />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem 
                        onClick={() => onDelete(entry)} 
                        className="flex items-center gap-2 text-red-600 focus:text-red-600 focus:bg-red-50"
                      >
                        <Trash2 size={14} />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4 lg:p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Tabs - Only show if AI reflection exists */}
          {entry.aiReflection && (
            <div className="border-b border-gray-200">
              <div className="flex px-4 lg:px-12 pt-4 lg:pt-8">
                <button
                  onClick={() => setActiveTab('journal')}
                  className={`flex items-center gap-2 px-3 lg:px-4 py-2 lg:py-3 text-sm transition-colors ${
                    activeTab === 'journal'
                      ? 'border-b-2 border-pink-500 text-pink-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <FileText size={14} className="lg:w-4 lg:h-4" />
                  <span className="hidden sm:inline">Journal Entry</span>
                  <span className="sm:hidden">Journal</span>
                </button>
                <button
                  onClick={() => setActiveTab('ai')}
                  className={`flex items-center gap-2 px-3 lg:px-4 py-2 lg:py-3 text-sm transition-colors ${
                    activeTab === 'ai'
                      ? 'border-b-2 border-purple-500 text-purple-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Sparkles size={14} className="lg:w-4 lg:h-4" />
                  <span className="hidden sm:inline">AI Reflection</span>
                  <span className="sm:hidden">AI</span>
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-4 lg:p-12">
            {entry.hasPhoto && (
              <div className="mb-6 lg:mb-8">
                {entry.photoUrl ? (
                  <img 
                    src={entry.photoUrl} 
                    alt="Entry photo"
                    className="w-full h-48 lg:h-64 object-cover rounded-xl border border-gray-200"
                  />
                ) : (
                  <div className="w-full h-48 lg:h-64 bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <Camera size={32} className="lg:w-12 lg:h-12 text-pink-400 mx-auto mb-2" />
                      <p className="text-pink-600 text-sm lg:text-base">Photo attached</p>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="prose prose-gray max-w-none">
              {/* Journal Content Tab */}
              {(!entry.aiReflection || activeTab === 'journal') && (
                <div 
                  className={`text-gray-800 leading-relaxed whitespace-pre-wrap text-base lg:text-lg ${
                    onEdit ? 'cursor-pointer hover:bg-gray-50 rounded-lg p-4 -m-4 transition-colors' : ''
                  }`}
                  onClick={onEdit ? () => onEdit(entry) : undefined}
                  title={onEdit ? "Click to edit" : undefined}
                >
                  {entry.content}
                </div>
              )}

              {/* AI Reflection Tab */}
              {entry.aiReflection && activeTab === 'ai' && (
                <div>
                  <div className="flex items-center gap-3 mb-4 lg:mb-6">
                    <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center">
                      <span className="text-white text-sm lg:text-lg">✨</span>
                    </div>
                    <h3 className="text-lg lg:text-xl text-purple-800 mb-0">AI Reflection</h3>
                  </div>

                  {/* AI Summary */}
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 lg:p-6 mb-4 lg:mb-6">
                    <p className="text-purple-700 leading-relaxed text-sm lg:text-lg mb-0">
                      {entry.aiReflection.summary}
                    </p>
                  </div>

                  {/* Chat History */}
                  <div className="space-y-3 lg:space-y-4">
                    {entry.aiReflection.chatHistory.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`
                            max-w-[85%] sm:max-w-lg lg:max-w-2xl px-3 lg:px-4 py-2 lg:py-3 rounded-2xl
                            ${message.type === 'user'
                              ? 'bg-purple-500 text-white rounded-br-md'
                              : 'bg-gray-100 text-gray-800 rounded-bl-md'
                            }
                          `}
                        >
                          <p className="leading-relaxed mb-0 text-sm lg:text-base">{message.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-xs lg:text-sm text-gray-400 mt-4 lg:mt-6 text-center">
                    Reflection saved on {new Date(entry.aiReflection.savedAt).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Footer */}
          <div className="border-t border-gray-100 px-4 lg:px-12 py-4 lg:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 lg:gap-4 text-xs lg:text-sm text-gray-500">
              <div className="flex items-center gap-2 lg:gap-4 flex-wrap">
                <span>Created on {formatDate(entry.date)}</span>
                <span className="hidden sm:inline">•</span>
                <span>{entry.content.length} characters</span>
                {entry.aiReflection && (
                  <>
                    <span className="hidden sm:inline">•</span>
                    <span className="text-purple-600">
                      {entry.aiReflection.chatHistory.length} reflection messages
                    </span>
                  </>
                )}
              </div>
              <div className="text-xs">
                Entry #{entry.id}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}