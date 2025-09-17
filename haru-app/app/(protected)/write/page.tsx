'use client'

import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, MessageCircle, Edit3, Send, Camera, Plus, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DiaryAPI } from '@/lib/diary-api'
import { DiaryContentBlock, AiChatMessage } from '@/lib/types'

interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
}

type WriteMode = 'journal' | 'chat'

const moodEmojis = ['😊', '😌', '🥰', '🤔', '😔', '😴', '😤', '🤩', '😰', '😭']

const aiResponses = [
  "That sounds really meaningful. How did that make you feel?",
  "I can sense the emotion in your words. What was going through your mind at that moment?",
  "It's beautiful how you notice these small details. What does this experience tell you about yourself?",
  "Thank you for sharing that with me. What would you like to explore more about this feeling?",
  "That's a really thoughtful observation. How do you think this might influence your future choices?",
  "I appreciate your honesty. What other thoughts came up for you during this time?",
  "It sounds like this was an important moment. What made it stand out to you?",
  "Your reflection shows a lot of self-awareness. What patterns do you notice in your experiences?"
]

export default function WriteEntryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedDate = searchParams.get('date') ? parseInt(searchParams.get('date')!) : new Date().getDate()
  const editingEntryId = searchParams.get('id') // For editing existing entries

  const [writeMode, setWriteMode] = useState<WriteMode>('journal')
  const [selectedMood, setSelectedMood] = useState<string>('')
  const [title, setTitle] = useState<string>('')
  const [content, setContent] = useState<string>('')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hi there! I'm here to help you reflect on your day. How are you feeling right now?",
      timestamp: new Date()
    }
  ])
  const [currentMessage, setCurrentMessage] = useState<string>('')
  const [isTyping, setIsTyping] = useState(false)
  const [customEmoji, setCustomEmoji] = useState<string>('')
  const [showCustomEmojiInput, setShowCustomEmojiInput] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatDate = (date: number) => {
    const today = new Date()
    const month = today.toLocaleDateString('en-US', { month: 'long' })
    const weekday = today.toLocaleDateString('en-US', { weekday: 'long' })
    const year = today.getFullYear()
    return `${weekday}, ${month} ${date}, ${year}`
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  // Load existing entry if editing
  useEffect(() => {
    const loadEntry = async () => {
      if (!editingEntryId) return

      try {
        const result = await DiaryAPI.getEntries()
        if (result.error) {
          console.error('Error loading entries:', result.error)
          return
        }

        const entry = result.data?.find(e => e.id === editingEntryId)
        if (!entry) {
          console.error('Entry not found:', editingEntryId)
          return
        }

        // Load entry data
        setCurrentEntryId(entry.id)
        setSelectedMood(entry.mood)
        setTitle(entry.title || '')
        setWriteMode(entry.write_mode)

        // Convert content blocks back to text and photo
        const textContent = DiaryAPI.contentToText(entry.content)
        setContent(textContent)

        const photoUrl = DiaryAPI.getFirstPhotoUrl(entry.content)
        if (photoUrl) {
          setSelectedPhoto(photoUrl)
        }

        // Convert AI chats back to chat messages
        if (entry.ai_chats && entry.ai_chats.length > 0) {
          const chatMessages: ChatMessage[] = entry.ai_chats.map((chat, index) => ({
            id: index.toString(),
            type: chat.speaker === 'user' ? 'user' : 'ai',
            content: chat.message,
            timestamp: new Date(chat.timestamp)
          }))
          setChatMessages(chatMessages)
          setWriteMode('chat')
        }

        // Mark as not having unsaved changes since we just loaded
        setHasUnsavedChanges(false)
      } catch (error) {
        console.error('Error loading entry:', error)
        setSaveError('Failed to load entry')
      }
    }

    loadEntry()
  }, [editingEntryId])

  // Auto-save functionality (Notion-style)
  useEffect(() => {
    if (!selectedMood || (!content.trim() && writeMode === 'journal')) {
      setHasUnsavedChanges(false)
      return
    }

    setHasUnsavedChanges(true)

    const timeoutId = setTimeout(() => {
      handleAutoSave()
      setHasUnsavedChanges(false)
    }, 2000) // Save after 2 seconds of no typing

    return () => clearTimeout(timeoutId)
  }, [selectedMood, title, content, selectedPhoto, photoFile, writeMode, chatMessages])

  const handleAutoSave = async () => {
    if (isSaving) return false // Prevent duplicate saves
    
    let finalContent = content
    let finalTitle = title

    if (writeMode === 'chat') {
      const userMessages = chatMessages
        .filter(msg => msg.type === 'user')
        .map(msg => msg.content)
        .join(' ')
      
      finalContent = userMessages || 'Reflected through AI conversation'
      finalTitle = title || 'AI Reflection Session'
    }

    if (!selectedMood || (!finalContent.trim() && writeMode === 'journal')) {
      return false
    }

    setIsSaving(true)
    setSaveError(null)

    try {
      // Upload photo first if there's a new photo file
      let photoUrl = selectedPhoto
      if (photoFile && currentEntryId) {
        const uploadResult = await DiaryAPI.uploadImage(photoFile, currentEntryId)
        if (uploadResult.error) {
          throw new Error(uploadResult.error)
        }
        photoUrl = uploadResult.data
        setSelectedPhoto(photoUrl)
      }

      // Convert content to JSONB format
      const contentBlocks = DiaryAPI.textAndPhotoToContent(finalContent, photoUrl)
      
      // Convert chat messages to JSONB format
      const aiChats: AiChatMessage[] = chatMessages.map(msg => ({
        speaker: msg.type === 'user' ? 'user' : 'assistant',
        message: msg.content,
        timestamp: msg.timestamp.toISOString()
      }))

      // Prepare diary entry data
      const entryData = {
        date: `2025-09-${selectedDate.toString().padStart(2, '0')}`, // Convert to YYYY-MM-DD format
        mood: selectedMood,
        title: finalTitle || `Entry for ${formatDate(selectedDate)}`,
        content: contentBlocks,
        ai_chats: aiChats,
        write_mode: writeMode
      }

      const result = await DiaryAPI.saveEntry(entryData, currentEntryId || undefined)
      
      if (result.error) {
        throw new Error(result.error)
      }

      // Update entry ID if this is a new entry
      if (!currentEntryId && result.data) {
        setCurrentEntryId(result.data.id)
        
        // If we have a photo file but couldn't upload it earlier, try now
        if (photoFile && !photoUrl) {
          const uploadResult = await DiaryAPI.uploadImage(photoFile, result.data.id)
          if (uploadResult.data) {
            const updatedContentBlocks = DiaryAPI.textAndPhotoToContent(finalContent, uploadResult.data)
            await DiaryAPI.saveEntry({ 
              ...entryData, 
              content: updatedContentBlocks 
            }, result.data.id)
            setSelectedPhoto(uploadResult.data)
          }
        }
      }

      setHasUnsavedChanges(false)
      console.log('Entry saved successfully:', result.data)
      return true
    } catch (error) {
      console.error('Error saving entry:', error)
      setSaveError(error instanceof Error ? error.message : 'Failed to save entry')
      setHasUnsavedChanges(true)
      return false
    } finally {
      setIsSaving(false)
    }
  }

  const handleBackButton = async () => {
    // Auto-save before going back
    if (selectedMood && ((writeMode === 'journal' && content.trim()) || writeMode === 'chat')) {
      await handleAutoSave()
    }
    router.push('/dashboard')
  }

  const handleModeSwitch = (newMode: WriteMode) => {
    if (newMode === writeMode) return
    
    if (writeMode === 'journal' && newMode === 'chat') {
      // Transfer journal content to chat
      if (content.trim()) {
        let journalContent = content.trim()
        if (title.trim()) {
          journalContent = `${title.trim()}\n\n${journalContent}`
        }
        
        setCurrentMessage(journalContent)
        
        setChatMessages([
          {
            id: '1',
            type: 'ai',
            content: "Hi there! I can see you've started writing something. I'd love to help you reflect on these thoughts. Feel free to share when you're ready!",
            timestamp: new Date()
          }
        ])
      } else {
        setChatMessages([
          {
            id: '1',
            type: 'ai',
            content: "Hi there! I'm here to help you reflect on your day. How are you feeling right now?",
            timestamp: new Date()
          }
        ])
      }
    } else if (writeMode === 'chat' && newMode === 'journal') {
      // Transfer chat content to journal
      const userMessages = chatMessages
        .filter(msg => msg.type === 'user')
        .map(msg => msg.content)
      
      if (userMessages.length > 0) {
        const combinedContent = userMessages.join('\n\n')
        setContent(combinedContent)
        
        if (!title.trim() && combinedContent) {
          const firstLine = combinedContent.split('\n')[0]
          if (firstLine.length > 50) {
            setTitle(firstLine.substring(0, 50) + '...')
          } else {
            setTitle(firstLine)
          }
        }
      }
      
      if (currentMessage.trim()) {
        const userMessages = chatMessages
          .filter(msg => msg.type === 'user')
          .map(msg => msg.content)
        const existingContent = content || userMessages.join('\n\n') || ''
        const newContent = existingContent ? `${existingContent}\n\n${currentMessage}` : currentMessage
        setContent(newContent)
        setCurrentMessage('')
      }
    }
    
    setWriteMode(newMode)
  }

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, userMessage])
    setCurrentMessage('')
    setIsTyping(true)

    // Simulate AI response delay
    setTimeout(() => {
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)]
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: randomResponse,
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, aiMessage])
      setIsTyping(false)
    }, 1000 + Math.random() * 2000)
  }

  const handleReflect = () => {
    if (!selectedMood || !content.trim() || writeMode !== 'journal') {
      return
    }

    // Create current entry object with unsaved data
    const currentEntryData = {
      id: currentEntryId || 'temp',
      date: selectedDate,
      mood: selectedMood,
      title: title || `Entry for ${formatDate(selectedDate)}`,
      content: content,
      preview: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
      hasPhoto: !!selectedPhoto,
      photoUrl: selectedPhoto
    }

    // Pass entry data to reflection mode
    router.push(`/reflection?data=${encodeURIComponent(JSON.stringify(currentEntryData))}`)
  }

  const handleAddCustomEmoji = () => {
    if (customEmoji.trim()) {
      setSelectedMood(customEmoji.trim())
      setCustomEmoji('')
      setShowCustomEmojiInput(false)
    }
  }

  const handleCustomEmojiKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddCustomEmoji()
    } else if (e.key === 'Escape') {
      setShowCustomEmojiInput(false)
      setCustomEmoji('')
    }
  }

  const handlePhotoClick = () => {
    fileInputRef.current?.click()
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.')
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        alert('Image size should be less than 10MB.')
        return
      }

      setPhotoFile(file)
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedPhoto(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemovePhoto = () => {
    setSelectedPhoto(null)
    setPhotoFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-pink-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-10">
        <div className="px-4 lg:px-6 py-4">
          <div className="flex lg:grid lg:grid-cols-3 items-center gap-4">
            {/* Left Section - Back Button & Title */}
            <div className="flex items-center gap-3 flex-1 lg:flex-none">
              <button
                onClick={handleBackButton}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div>
                <h1 className="text-gray-800">{editingEntryId ? 'Edit Entry' : 'New Entry'}</h1>
                <p className="text-sm text-gray-500 hidden sm:block">{formatDate(selectedDate)}</p>
              </div>
              {/* Save status indicator - Notion style (subtle) */}
              <div className="flex items-center gap-2">
                {isSaving && (
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" title="Saving..." />
                )}
                {!hasUnsavedChanges && !isSaving && currentEntryId && (
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full opacity-50" title="Saved" />
                )}
                {saveError && (
                  <div className="flex items-center gap-1 text-xs text-red-500" title={saveError}>
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                    <span className="hidden sm:inline">Save failed</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Center Section - Mode Toggle */}
            <div className="hidden lg:flex justify-center">
              <div className="bg-gray-100 rounded-lg p-1 flex">
                <button
                  onClick={() => handleModeSwitch('journal')}
                  className={`
                    px-6 py-2 rounded-md flex items-center gap-2 text-sm transition-all
                    ${writeMode === 'journal' 
                      ? 'bg-white text-gray-800 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                    }
                  `}
                >
                  <Edit3 size={16} />
                  Journal
                </button>
                <button
                  onClick={() => handleModeSwitch('chat')}
                  className={`
                    px-6 py-2 rounded-md flex items-center gap-2 text-sm transition-all
                    ${writeMode === 'chat' 
                      ? 'bg-white text-gray-800 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                    }
                  `}
                >
                  <MessageCircle size={16} />
                  AI Chat
                </button>
              </div>
            </div>
            
            {/* Right Section - Reflect Button */}
            <div className="hidden lg:flex justify-end gap-4">
              {writeMode === 'journal' && (
                <button
                  onClick={handleReflect}
                  disabled={!selectedMood || !content.trim()}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg 
                           hover:from-purple-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed
                           transition-all duration-200"
                >
                  {isSaving ? 'Saving...' : 'Reflect with AI'}
                </button>
              )}
            </div>
          </div>

          {/* Mobile Mode Toggle */}
          <div className="lg:hidden mt-4">
            <div className="bg-gray-100 rounded-lg p-1 flex">
              <button
                onClick={() => handleModeSwitch('journal')}
                className={`
                  flex-1 py-2 rounded-md flex items-center justify-center gap-2 text-sm transition-all
                  ${writeMode === 'journal' 
                    ? 'bg-white text-gray-800 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                  }
                `}
              >
                <Edit3 size={16} />
                Journal
              </button>
              <button
                onClick={() => handleModeSwitch('chat')}
                className={`
                  flex-1 py-2 rounded-md flex items-center justify-center gap-2 text-sm transition-all
                  ${writeMode === 'chat' 
                    ? 'bg-white text-gray-800 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                  }
                `}
              >
                <MessageCircle size={16} />
                AI Chat
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-6 overflow-hidden">
        <div className="max-w-4xl mx-auto h-full flex items-center justify-center">
          <div className="w-full h-full lg:h-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
              {/* Mood Selection - Optional */}
              <div className="p-4 lg:p-6 border-b border-gray-50">
                <h2 className="text-sm font-medium text-gray-700 mb-3">How are you feeling?</h2>
                <div className="grid grid-cols-5 sm:flex gap-2 lg:gap-3 relative">
                  {moodEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setSelectedMood(emoji)}
                      className={`
                        w-10 h-10 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center text-lg lg:text-xl transition-all
                        ${selectedMood === emoji 
                          ? 'bg-pink-50 ring-1 ring-pink-200' 
                          : 'bg-gray-50 hover:bg-gray-100 active:scale-95'
                        }
                      `}
                    >
                      {emoji}
                    </button>
                  ))}
                  
                  {/* Custom Emoji Add Button - Desktop Only */}
                  <div className="hidden lg:block relative">
                    {showCustomEmojiInput ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={customEmoji}
                          onChange={(e) => setCustomEmoji(e.target.value)}
                          onKeyDown={handleCustomEmojiKeyPress}
                          onBlur={() => {
                            if (!customEmoji.trim()) {
                              setShowCustomEmojiInput(false)
                            }
                          }}
                          placeholder="😊"
                          maxLength={2}
                          className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-gray-50 border-1 border-dashed border-gray-300 
                                   text-center text-lg lg:text-xl outline-none focus:border-gray-400"
                          autoFocus
                        />
                        <button
                          onClick={handleAddCustomEmoji}
                          disabled={!customEmoji.trim()}
                          className="w-8 h-8 rounded-lg bg-pink-500 hover:bg-pink-600 disabled:opacity-50 
                                   flex items-center justify-center text-white transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowCustomEmojiInput(true)}
                        className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-gray-50 border-1 border-dashed border-gray-200 
                                 hover:border-gray-300 hover:bg-gray-100 flex items-center justify-center transition-all
                                 active:scale-95 group"
                      >
                        <Plus size={16} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Writing Area */}
              {writeMode === 'journal' ? (
                <div className="flex-1 p-4 lg:p-8 flex flex-col overflow-hidden">
                  {/* Title Input */}
                  <input
                    type="text"
                    placeholder="Title (optional)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-lg lg:text-xl placeholder:text-gray-300 border-none outline-none bg-transparent mb-6 flex-shrink-0 font-medium"
                  />
                  
                  {/* Content Textarea */}
                  <textarea
                    ref={textareaRef}
                    placeholder="Start writing..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full flex-1 placeholder:text-gray-400 border-none outline-none bg-transparent resize-none leading-relaxed overflow-y-auto"
                    style={{ fontFamily: 'inherit' }}
                  />
                  
                  {/* Photo Preview */}
                  {selectedPhoto && (
                    <div className="mt-6 pt-6 border-t border-gray-100 flex-shrink-0">
                      <div className="relative inline-block">
                        <img 
                          src={selectedPhoto} 
                          alt="Selected photo"
                          className="w-32 h-32 lg:w-40 lg:h-40 object-cover rounded-xl border border-gray-200"
                        />
                        <button
                          onClick={handleRemovePhoto}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full 
                                   flex items-center justify-center transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Toolbar */}
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100 flex-shrink-0">
                    <button 
                      onClick={handlePhotoClick}
                      className="flex items-center gap-2 px-3 lg:px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Camera size={18} />
                      <span className="hidden sm:inline">
                        {selectedPhoto ? 'Change Photo' : 'Add Photo'}
                      </span>
                    </button>
                    <div className="text-sm text-gray-400">
                      {content.length} characters
                    </div>
                  </div>

                  {/* Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />

                  {/* Mobile Reflect Button */}
                  <div className="lg:hidden mt-6 pt-6 border-t border-gray-100 flex gap-3 flex-shrink-0">
                    <button
                      onClick={handleReflect}
                      disabled={!content.trim() && !selectedPhoto}
                      className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl 
                               hover:from-purple-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed
                               transition-all duration-200 text-lg font-medium flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={20} />
                      {isSaving ? 'Saving...' : 'Reflect with AI'}
                    </button>
                  </div>
                </div>
              ) : (
                /* Chat Interface */
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Chat Messages */}
                  <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
                    <div className="space-y-4">
                      {chatMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`
                              max-w-[85%] sm:max-w-xs lg:max-w-md px-3 lg:px-4 py-2 lg:py-3 rounded-2xl
                              ${message.type === 'user'
                                ? 'bg-pink-500 text-white rounded-br-md'
                                : 'bg-gray-100 text-gray-800 rounded-bl-md'
                              }
                            `}
                          >
                            <p className="leading-relaxed text-sm lg:text-base">{message.content}</p>
                          </div>
                        </div>
                      ))}
                      
                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="bg-gray-100 px-3 lg:px-4 py-2 lg:py-3 rounded-2xl rounded-bl-md">
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
                  <div className="p-3 lg:p-4 border-t border-gray-100 flex-shrink-0">
                    <div className="flex gap-2 lg:gap-3">
                      <input
                        type="text"
                        placeholder="Share what's on your mind..."
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="flex-1 px-3 lg:px-4 py-2 lg:py-3 bg-gray-50 rounded-xl border-none outline-none focus:bg-gray-100 transition-colors text-sm lg:text-base"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!currentMessage.trim() || isTyping}
                        className="w-10 h-10 lg:w-12 lg:h-12 bg-pink-500 hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed
                                 rounded-xl flex items-center justify-center text-white transition-colors"
                      >
                        <Send size={16} className="lg:w-[18px] lg:h-[18px]" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}