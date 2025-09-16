'use client'

import { Calendar, Clock, LogOut, User } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

type ViewMode = 'calendar' | 'timeline'

interface SidebarProps {
  currentView: ViewMode
  onViewChange: (view: ViewMode) => void
  entriesCount: number
  isMobile?: boolean
}

export function Sidebar({ currentView, onViewChange, entriesCount }: SidebarProps) {
  const isMobile = useIsMobile()
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string>('demo@haru.app')

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setUserEmail(user.email)
      }
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error logging out:', error)
    } else {
      router.push('/login')
    }
  }

  const menuItems = [
    {
      id: 'calendar' as ViewMode,
      label: 'Calendar',
      icon: Calendar,
      description: 'Monthly mood view'
    },
    {
      id: 'timeline' as ViewMode,
      label: 'Time Table',
      icon: Clock,
      description: `${entriesCount} entries this month`
    }
  ]

  return (
    <div className={`${isMobile ? 'w-full h-full' : 'w-72 h-screen'} bg-white ${!isMobile ? 'border-r border-pink-100' : ''} flex flex-col`}>
      {/* App Header */}
      {!isMobile && (
        <div className="p-6 border-b border-pink-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-rose-400 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">💕</span>
            </div>
            <h1 className="text-gray-800">haru.</h1>
          </div>
          <p className="text-sm text-gray-500">Your personal emotional companion</p>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`
                  w-full p-4 rounded-xl text-left transition-all duration-200 group
                  ${isActive 
                    ? 'bg-gradient-to-r from-pink-100 to-rose-100 border-2 border-pink-200 shadow-sm' 
                    : 'bg-gray-50 hover:bg-pink-50 border-2 border-transparent hover:border-pink-100'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center transition-colors
                    ${isActive 
                      ? 'bg-gradient-to-r from-pink-400 to-rose-400 text-white' 
                      : 'bg-white text-gray-600 group-hover:bg-pink-100 group-hover:text-pink-600'
                    }
                  `}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`
                      transition-colors
                      ${isActive ? 'text-pink-700' : 'text-gray-700 group-hover:text-pink-600'}
                    `}>
                      {item.label}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Bottom Section */}
      {!isMobile && (
        <div className="p-6 space-y-4">
          {/* Motivation */}
          <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">✨</span>
              <h4 className="text-gray-700">Keep journaling!</h4>
            </div>
            <p className="text-sm text-gray-600">
              You've written {entriesCount} entries this month. Every thought matters.
            </p>
          </div>
          
          {/* Divider */}
          <div className="border-t border-pink-100 -mx-6"></div>
          
          {/* User Profile */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700 truncate">User</p>
              <p className="text-xs text-gray-500">{userEmail}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-6 h-6 rounded hover:bg-gray-200 flex items-center justify-center transition-colors"
              title="Sign out"
            >
              <LogOut size={14} className="text-gray-500" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}