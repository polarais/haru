'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ArrowLeft, RefreshCw, Edit2, Send, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { GradientBackground } from '@/components/ui/gradient-background'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { StickyHeader } from '@/components/ui/sticky-header'
import { ReflectionHeader } from '@/components/ui/reflection-header'
import { DiaryAPI } from '@/lib/diary-api'
import { DiaryEntry, AiChatMessage } from '@/lib/types'
import { AIService, AIProvider, SummaryRequest, AIMessage } from '@/lib/ai-service'

interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
}

const summaryTemplates = [
  "You've shared a beautiful moment of gratitude and connection with simple pleasures. Your reflection shows mindfulness and appreciation for life's small joys.",
  "This entry reveals your capacity for finding peace in solitude and embracing quiet moments of self-care. You value introspection and personal space.",
  "Your writing captures the warmth of human connection and the joy of meaningful conversations. You treasure relationships and shared experiences with others.",
  "You're navigating a period of reflection about life choices and personal growth. Your thoughtful approach to decision-making shows emotional maturity."
]

const aiReflectionResponses = [
  "What you've written really resonates with me. I notice you find beauty in everyday moments - that's such a wonderful quality. What do you think draws you to appreciate these simple pleasures?",
  "Your entry shows a lot of self-awareness and emotional depth. I'm curious about what this experience taught you about yourself. How do you usually process feelings like these?",
  "There's something really peaceful about the way you describe this moment. It sounds like it was exactly what you needed. What do you think made this particular experience so meaningful?",
  "I can feel the genuine emotion in your words. It's clear this was an important moment for you. What would you like to carry forward from this experience?",
  "Your reflection shows such thoughtfulness. I'm wondering - how do these kinds of moments typically affect your mood or outlook? Do you notice any patterns?",
  "Thank you for sharing something so personal. It takes courage to be vulnerable like this. What made you want to capture this particular feeling or experience?"
]

export default function ReflectionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const entryId = searchParams.get('id')
  const entryData = searchParams.get('data')
  
  const [entry, setEntry] = useState<DiaryEntry | null>(null)
  const [summary, setSummary] = useState('')
  const [isEditingSummary, setIsEditingSummary] = useState(false)
  const [editedSummary, setEditedSummary] = useState('')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false)
  const [isLoadingSummary, setIsLoadingSummary] = useState(false)
  const [isLoadingInitialChat, setIsLoadingInitialChat] = useState(false)
  // Removed isNavigating state - no longer needed for instant navigation
  
  const chatEndRef = useRef<HTMLDivElement>(null)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'long',
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const formatDay = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { weekday: 'long' })
  }

  // Initialize AI service
  useEffect(() => {
    AIService.initialize()
  }, [])

  // Load entry data
  useEffect(() => {
    const loadEntry = async () => {
      // If entry data is passed directly (from write page)
      if (entryData) {
        try {
          const parsedEntry = JSON.parse(decodeURIComponent(entryData))
          // Convert to DiaryEntry format
          const tempEntry: DiaryEntry = {
            id: parsedEntry.id,
            profile_id: 'temp',
            date: `2025-09-${parsedEntry.date.toString().padStart(2, '0')}`,
            mood: parsedEntry.mood,
            title: parsedEntry.title,
            content: parsedEntry.content, // Keep as string since DiaryEntry.content expects string
            ai_chats: [],
            summary: '',
            write_mode: 'journal',
            is_deleted: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          
          setEntry(tempEntry)
          
          // Generate AI summary and initial message
          await generateInitialReflection(tempEntry, parsedEntry.content)
          
          return
        } catch (error) {
          console.error('Error parsing entry data:', error)
        }
      }

      // Otherwise load from database
      if (!entryId) {
        router.push('/dashboard')
        return
      }

      try {
        const result = await DiaryAPI.getEntries()
        if (result.error) throw new Error(result.error)

        const foundEntry = result.data?.find(e => e.id === entryId)
        if (!foundEntry) {
          router.push('/dashboard')
          return
        }

        setEntry(foundEntry)
        
        // Initialize AI reflection data
        if (foundEntry.ai_chats && foundEntry.ai_chats.length > 0) {
          // Load existing reflection
          setSummary(foundEntry.summary || summaryTemplates[Math.floor(Math.random() * summaryTemplates.length)])
          const existingMessages: ChatMessage[] = foundEntry.ai_chats.map((chat, index) => ({
            id: index.toString(),
            type: chat.speaker === 'user' ? 'user' : 'ai',
            content: chat.message,
            timestamp: new Date(chat.timestamp)
          }))
          setChatMessages(existingMessages)
        } else {
          // Generate new AI reflection
          await generateInitialReflection(foundEntry, foundEntry.content)
        }
        
        setEditedSummary(summary)
      } catch (error) {
        console.error('Error loading entry:', error)
        router.push('/dashboard')
      }
    }

    loadEntry()
  }, [entryId, entryData, router])

  const generateInitialReflection = async (diaryEntry: DiaryEntry, textContent: string) => {
    // Start loading states
    setIsLoadingSummary(true)
    setIsLoadingInitialChat(true)

    try {
      // Generate AI summary
      const summaryRequest: SummaryRequest = {
        content: textContent,
        mood: diaryEntry.mood,
        title: diaryEntry.title
      }
      
      const summaryResponse = await AIService.generateSummary(summaryRequest)
      if (summaryResponse.error) {
        console.error('AI summary error:', summaryResponse.error)
        // Use fallback
        const fallbackSummary = summaryTemplates[Math.floor(Math.random() * summaryTemplates.length)]
        setSummary(fallbackSummary)
        setEditedSummary(fallbackSummary)
      } else {
        setSummary(summaryResponse.content)
        setEditedSummary(summaryResponse.content)
      }
      setIsLoadingSummary(false)

      // Generate initial AI conversation
      const initialPrompt = `사용자가 다음과 같은 일기를 작성했습니다:

제목: ${diaryEntry.title}
무드: ${diaryEntry.mood}
내용: ${textContent}

이 일기에 대해 따뜻하고 공감적인 첫 메시지를 보내주세요. 사용자의 감정을 이해하고 지지하며, 깊이 있는 질문을 통해 자기 성찰을 도와주세요.`
      
      const initialMessages: AIMessage[] = [
        { role: 'user', content: initialPrompt }
      ]
      
      const initialResponse = await AIService.generateResponse(initialMessages)
      if (initialResponse.error) {
        console.error('AI initial response error:', initialResponse.error)
        // Use fallback
        const fallbackMessage = aiReflectionResponses[Math.floor(Math.random() * aiReflectionResponses.length)]
        const initialMessage: ChatMessage = {
          id: '1',
          type: 'ai',
          content: fallbackMessage,
          timestamp: new Date()
        }
        setChatMessages([initialMessage])
      } else {
        const initialMessage: ChatMessage = {
          id: '1',
          type: 'ai',
          content: initialResponse.content,
          timestamp: new Date()
        }
        setChatMessages([initialMessage])
      }
      setIsLoadingInitialChat(false)
    } catch (error) {
      console.error('Error generating initial reflection:', error)
      // Use fallback
      const newSummary = summaryTemplates[Math.floor(Math.random() * summaryTemplates.length)]
      setSummary(newSummary)
      setEditedSummary(newSummary)
      setIsLoadingSummary(false)
      
      const initialMessage: ChatMessage = {
        id: '1',
        type: 'ai',
        content: aiReflectionResponses[Math.floor(Math.random() * aiReflectionResponses.length)],
        timestamp: new Date()
      }
      setChatMessages([initialMessage])
      setIsLoadingInitialChat(false)
    }
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  // Auto-save when data changes
  useEffect(() => {
    if (!entry || !summary || chatMessages.length === 0) return
    
    const timeoutId = setTimeout(() => {
      handleAutoSave()
    }, 2000)

    return () => clearTimeout(timeoutId)
  }, [summary, chatMessages, entry])

  const handleAutoSave = async () => {
    if (!entry || isSaving) return
    
    // Skip auto-save for temporary entries (from write page)
    if (entry.id === 'temp' || entryData) {
      return
    }
    
    setIsSaving(true)
    
    try {
      const aiChats: AiChatMessage[] = chatMessages.map(msg => ({
        speaker: msg.type === 'user' ? 'user' : 'assistant',
        message: msg.content,
        timestamp: msg.timestamp.toISOString()
      }))

      const updateData = {
        date: entry.date,
        mood: entry.mood,
        title: entry.title,
        content: entry.content,
        write_mode: entry.write_mode,
        summary,
        ai_chats: aiChats
      }

      const result = await DiaryAPI.saveEntry(updateData, entry.id)
      if (result.error) {
        console.error('Auto-save failed:', result.error)
      }
    } catch (error) {
      console.error('Auto-save error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleRegenerateSummary = async () => {
    if (!entry) return
    
    try {
      const textContent = entry.content
      const summaryRequest: SummaryRequest = {
        content: textContent,
        mood: entry.mood,
        title: entry.title
      }
      
      const response = await AIService.generateSummary(summaryRequest)
      if (response.error) {
        console.error('Regenerate summary error:', response.error)
        // Use fallback
        const fallbackSummary = summaryTemplates[Math.floor(Math.random() * summaryTemplates.length)]
        setSummary(fallbackSummary)
        setEditedSummary(fallbackSummary)
      } else {
        setSummary(response.content)
        setEditedSummary(response.content)
      }
    } catch (error) {
      console.error('Error regenerating summary:', error)
      // Use fallback
      const newSummary = summaryTemplates[Math.floor(Math.random() * summaryTemplates.length)]
      setSummary(newSummary)
      setEditedSummary(newSummary)
    }
  }

  const handleEditSummary = () => {
    setIsEditingSummary(true)
    setEditedSummary(summary)
  }

  const handleSaveSummary = () => {
    setSummary(editedSummary)
    setIsEditingSummary(false)
  }

  const handleCancelEdit = () => {
    setEditedSummary(summary)
    setIsEditingSummary(false)
  }

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !entry) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, userMessage])
    setCurrentMessage('')
    setIsTyping(true)
    setIsGeneratingResponse(true)

    try {
      // Build conversation history
      const conversationHistory: AIMessage[] = [
        {
          role: 'system',
          content: `사용자가 다음과 같은 일기를 작성했습니다:

제목: ${entry.title}
무드: ${entry.mood}
내용: ${entry.content}

이 일기에 대해 대화를 나누고 있습니다. 따뜻하고 공감적인 상담사로서 사용자를 지지하고 도와주세요.`
        }
      ]

      // Add previous messages (except system message)
      chatMessages.forEach(msg => {
        conversationHistory.push({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.content
        })
      })

      // Add current user message
      conversationHistory.push({
        role: 'user',
        content: currentMessage
      })

      const response = await AIService.generateResponse(conversationHistory)
      
      if (response.error) {
        console.error('AI response error:', response.error)
        // Use fallback
        const randomResponse = aiReflectionResponses[Math.floor(Math.random() * aiReflectionResponses.length)]
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: randomResponse,
          timestamp: new Date()
        }
        setChatMessages(prev => [...prev, aiMessage])
      } else {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: response.content,
          timestamp: new Date()
        }
        setChatMessages(prev => [...prev, aiMessage])
      }
    } catch (error) {
      console.error('Error sending message:', error)
      // Use fallback
      const randomResponse = aiReflectionResponses[Math.floor(Math.random() * aiReflectionResponses.length)]
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: randomResponse,
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, aiMessage])
    } finally {
      setIsTyping(false)
      setIsGeneratingResponse(false)
    }
  }

  const handleClose = () => {
    // Background save (non-blocking)
    if (entry && (entry.id === 'temp' || entryData)) {
      // New entry - save in background
      const aiChats: AiChatMessage[] = chatMessages.map(msg => ({
        speaker: msg.type === 'user' ? 'user' : 'assistant',
        message: msg.content,
        timestamp: msg.timestamp.toISOString()
      }))

      const saveData = {
        date: entry.date,
        mood: entry.mood,
        title: entry.title,
        content: entry.content,
        summary,
        ai_chats: aiChats,
        write_mode: entry.write_mode
      }

      // Fire and forget
      DiaryAPI.saveEntry(saveData).catch(error => {
        console.error('Background save failed:', error)
      })
    } else if (entry) {
      // Existing entry - save in background
      handleAutoSave().catch(error => {
        console.error('Background save failed:', error)
      })
    }
    
    // Immediate navigation like Notion
    router.push('/dashboard')
  }

  if (!entry) {
    return null
  }

  const textContent = entry.content

  return (
    <GradientBackground variant="secondary" className="min-h-screen relative">
      {/* Navigation Loading Overlay - Removed for instant navigation */}
      {/* Header */}
      <StickyHeader>
        <ReflectionHeader 
          entry={{
            date: entry.date,
            mood: entry.mood,
            title: entry.title || '제목 없음'
          }}
          onBack={handleClose}
          isSaving={isSaving}
        />
      </StickyHeader>

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
                  {textContent}
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
                <div className="text-sm text-purple-700 leading-relaxed">
                  {isLoadingSummary ? (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner variant="spinner" />
                      <span>Reading your journal entry...</span>
                    </div>
                  ) : (
                    summary
                  )}
                </div>
              )}
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-4">
                {isLoadingInitialChat && chatMessages.length === 0 ? (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-md">
                      <LoadingSpinner variant="dots" />
                    </div>
                  </div>
                ) : (
                  chatMessages.map((message) => (
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
                  ))
                )}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-md">
                      <LoadingSpinner variant="dots" />
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
                  disabled={!currentMessage.trim() || isTyping || isGeneratingResponse}
                  className="w-12 h-12 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed
                           rounded-xl flex items-center justify-center text-white transition-colors"
                >
                  {isGeneratingResponse ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </GradientBackground>
  )
}