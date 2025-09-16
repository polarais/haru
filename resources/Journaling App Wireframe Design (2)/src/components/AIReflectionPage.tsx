import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Edit2, Send, X } from 'lucide-react';

interface DiaryEntry {
  id: string;
  date: number;
  mood: string;
  title: string;
  content: string;
  preview: string;
  hasPhoto?: boolean;
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

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface AIReflectionPageProps {
  entry: DiaryEntry;
  onClose: () => void;
  onSave: (reflectionData: {
    summary: string;
    chatHistory: ChatMessage[];
  }) => void;
  // Add auto-save handler
  onAutoSave?: (reflectionData: {
    summary: string;
    chatHistory: ChatMessage[];
  }) => void;
}

const summaryTemplates = [
  "You've shared a beautiful moment of gratitude and connection with simple pleasures. Your reflection shows mindfulness and appreciation for life's small joys.",
  "This entry reveals your capacity for finding peace in solitude and embracing quiet moments of self-care. You value introspection and personal space.",
  "Your writing captures the warmth of human connection and the joy of meaningful conversations. You treasure relationships and shared experiences with others.",
  "You're navigating a period of reflection about life choices and personal growth. Your thoughtful approach to decision-making shows emotional maturity."
];

const aiReflectionResponses = [
  "What you've written really resonates with me. I notice you find beauty in everyday moments - that's such a wonderful quality. What do you think draws you to appreciate these simple pleasures?",
  "Your entry shows a lot of self-awareness and emotional depth. I'm curious about what this experience taught you about yourself. How do you usually process feelings like these?",
  "There's something really peaceful about the way you describe this moment. It sounds like it was exactly what you needed. What do you think made this particular experience so meaningful?",
  "I can feel the genuine emotion in your words. It's clear this was an important moment for you. What would you like to carry forward from this experience?",
  "Your reflection shows such thoughtfulness. I'm wondering - how do these kinds of moments typically affect your mood or outlook? Do you notice any patterns?",
  "Thank you for sharing something so personal. It takes courage to be vulnerable like this. What made you want to capture this particular feeling or experience?"
];

export function AIReflectionPage({ entry, onClose, onSave, onAutoSave }: AIReflectionPageProps) {
  const [summary, setSummary] = useState(
    entry.aiReflection?.summary || summaryTemplates[Math.floor(Math.random() * summaryTemplates.length)]
  );
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [editedSummary, setEditedSummary] = useState(summary);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(
    entry.aiReflection?.chatHistory || [
      {
        id: '1',
        type: 'ai',
        content: aiReflectionResponses[Math.floor(Math.random() * aiReflectionResponses.length)],
        timestamp: new Date()
      }
    ]
  );
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSaved, setIsSaved] = useState(!!entry.aiReflection);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const formatDate = (date: number) => {
    return `September ${date}, 2025`;
  };

  const formatDay = (date: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayIndex = date % 7;
    return days[dayIndex === 0 ? 6 : dayIndex - 1];
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Auto-save when data changes (Notion-like behavior)
  useEffect(() => {
    // Don't auto-save immediately on mount
    if (!summary || chatMessages.length === 0) return;
    
    const timeoutId = setTimeout(() => {
      if (onAutoSave) {
        onAutoSave({
          summary,
          chatHistory: chatMessages
        });
      }
    }, 2000); // Auto-save after 2 seconds of no changes

    return () => clearTimeout(timeoutId);
  }, [summary, chatMessages, onAutoSave]);

  const handleRegenerateSummary = () => {
    const newSummary = summaryTemplates[Math.floor(Math.random() * summaryTemplates.length)];
    setSummary(newSummary);
    setEditedSummary(newSummary);
  };

  const handleEditSummary = () => {
    setIsEditingSummary(true);
    setEditedSummary(summary);
  };

  const handleSaveSummary = () => {
    setSummary(editedSummary);
    setIsEditingSummary(false);
  };

  const handleCancelEdit = () => {
    setEditedSummary(summary);
    setIsEditingSummary(false);
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const randomResponse = aiReflectionResponses[Math.floor(Math.random() * aiReflectionResponses.length)];
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: randomResponse,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const handleClose = () => {
    // Auto-save before closing
    onSave({
      summary,
      chatHistory: chatMessages
    });
    onClose();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleClose}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div>
                <h1 className="text-gray-800">AI Reflection</h1>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span>{formatDate(entry.date)} • {formatDay(entry.date)}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <span className="text-lg">{entry.mood}</span>
                    <span>{entry.title}</span>
                  </div>
                  {entry.aiReflection && (
                    <>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Split View */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-2 gap-6 h-[calc(100vh-8rem)]">
          {/* Left Side - Journal Entry */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{entry.mood}</span>
                <h2 className="text-gray-800">{entry.title}</h2>
              </div>
              <div className="text-sm text-gray-500">
                {formatDate(entry.date)} • {formatDay(entry.date)}
              </div>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
                  {entry.content}
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - AI Reflection */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col relative">
            {/* Small X button in top-right corner */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md z-10 group"
              title="Close reflection"
            >
              <X size={16} className="text-gray-600 group-hover:text-red-500 transition-colors" />
            </button>

            {/* AI Summary Card */}
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-indigo-50">
              <div className="flex items-start justify-between mb-3 pr-8">
                <h3 className="text-purple-800">AI Summary</h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleRegenerateSummary}
                    disabled={isEditingSummary}
                    className="w-8 h-8 rounded-lg bg-white/80 hover:bg-white flex items-center justify-center transition-colors disabled:opacity-50"
                    title="Regenerate summary"
                  >
                    <RefreshCw size={14} className="text-purple-600" />
                  </button>
                  {!isEditingSummary ? (
                    <button
                      onClick={handleEditSummary}
                      className="w-8 h-8 rounded-lg bg-white/80 hover:bg-white flex items-center justify-center transition-colors"
                      title="Edit summary"
                    >
                      <Edit2 size={14} className="text-purple-600" />
                    </button>
                  ) : (
                    <div className="flex gap-1">
                      <button
                        onClick={handleSaveSummary}
                        className="px-3 py-1 bg-purple-600 text-white text-xs rounded-md hover:bg-purple-700 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded-md hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {isEditingSummary ? (
                <textarea
                  value={editedSummary}
                  onChange={(e) => setEditedSummary(e.target.value)}
                  className="w-full h-20 p-3 border border-purple-200 rounded-lg text-sm text-purple-700 bg-white/80 resize-none focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
              ) : (
                <p className="text-sm text-purple-700 leading-relaxed">
                  {summary}
                </p>
              )}
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-4">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`
                        max-w-xs lg:max-w-md px-4 py-3 rounded-2xl
                        ${message.type === 'user'
                          ? 'bg-purple-500 text-white rounded-br-md'
                          : 'bg-gray-100 text-gray-800 rounded-bl-md'
                        }
                      `}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-md">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </div>
            
            {/* Chat Input */}
            <div className="p-4 border-t border-gray-100">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Share your thoughts about this reflection..."
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border-none outline-none focus:bg-gray-100 transition-colors text-sm"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!currentMessage.trim() || isTyping}
                  className="w-12 h-12 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed
                           rounded-xl flex items-center justify-center text-white transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}