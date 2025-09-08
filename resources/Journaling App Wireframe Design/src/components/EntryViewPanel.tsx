import React, { useState } from 'react';
import { X, Maximize2, Calendar, Clock, FileText, Sparkles } from 'lucide-react';

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

interface EntryViewPanelProps {
  entry: DiaryEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onExpand: () => void;
}

export function EntryViewPanel({ entry, isOpen, onClose, onExpand }: EntryViewPanelProps) {
  const [activeTab, setActiveTab] = useState<'journal' | 'ai'>('journal');
  
  if (!entry) return null;

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
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30"
          onClick={onClose}
        />
      )}
      
      {/* Panel */}
      <div className={`
        fixed top-0 right-0 h-full w-96 bg-white shadow-2xl border-l border-gray-200 z-40
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* Header */}
        <div className="border-b border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar size={16} />
              <span>{formatDate(entry.date)}</span>
              <span>•</span>
              <span>{formatDay(entry.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onExpand}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                title="Expand to full screen"
              >
                <Maximize2 size={16} className="text-gray-600" />
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X size={16} className="text-gray-600" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{entry.mood}</span>
            <div>
              <h2 className="text-gray-800">{entry.title}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <Clock size={14} />
                <span>Added today</span>
              </div>
            </div>
          </div>

          {entry.hasPhoto && (
            <div className="mb-4">
              {entry.photoUrl ? (
                <img 
                  src={entry.photoUrl} 
                  alt="Entry photo"
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                />
              ) : (
                <div className="w-full h-32 bg-gradient-to-br from-pink-100 to-rose-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📸</span>
                </div>
              )}
            </div>
          )}

          {/* Tabs - Only show if AI reflection exists */}
          {entry.aiReflection && (
            <div className="flex border-b border-gray-200 mt-4">
              <button
                onClick={() => setActiveTab('journal')}
                className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                  activeTab === 'journal'
                    ? 'border-b-2 border-pink-500 text-pink-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <FileText size={16} />
                Journal Entry
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                  activeTab === 'ai'
                    ? 'border-b-2 border-purple-500 text-purple-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Sparkles size={16} />
                AI Reflection
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="prose prose-gray max-w-none">
            {/* Journal Content Tab */}
            {(!entry.aiReflection || activeTab === 'journal') && (
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {entry.content}
              </p>
            )}

            {/* AI Reflection Tab */}
            {entry.aiReflection && activeTab === 'ai' && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center">
                    <span className="text-white text-sm">✨</span>
                  </div>
                  <h3 className="text-purple-800 mb-0">AI Reflection</h3>
                </div>

                {/* AI Summary */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-purple-700 leading-relaxed mb-0">
                    {entry.aiReflection.summary}
                  </p>
                </div>

                {/* Chat History */}
                <div className="space-y-3">
                  {entry.aiReflection.chatHistory.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`
                          max-w-xs px-3 py-2 rounded-lg text-sm
                          ${message.type === 'user'
                            ? 'bg-purple-500 text-white rounded-br-md'
                            : 'bg-gray-100 text-gray-800 rounded-bl-md'
                          }
                        `}
                      >
                        <p className="leading-relaxed mb-0">{message.content}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-xs text-gray-400 mt-4">
                  Reflection saved on {new Date(entry.aiReflection.savedAt).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 p-6">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Created on {formatDate(entry.date)}</span>
            <span>{entry.content.length} characters</span>
          </div>
        </div>
      </div>
    </>
  );
}