'use client'

import { useEffect, useState, createContext, useContext } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/sidebar'
import { useIsMobile } from '@/hooks/use-mobile'
import { PanelLeftIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ViewMode = 'calendar' | 'timeline'

interface LayoutContextType {
  currentView: ViewMode
  setCurrentView: (view: ViewMode) => void
}

const LayoutContext = createContext<LayoutContextType | null>(null)

export function useLayout() {
  const context = useContext(LayoutContext)
  if (!context) {
    throw new Error('useLayout must be used within ProtectedLayout')
  }
  return context
}

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentView, setCurrentView] = useState<ViewMode>('calendar')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [entriesCount] = useState(5) // 임시 값, 나중에 실제 데이터로 교체
  const router = useRouter()
  const pathname = usePathname()
  const isMobile = useIsMobile()

  // Check if current page should hide sidebar (write or reflection pages)
  const shouldHideSidebar = pathname === '/write' || pathname === '/reflection'

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        setIsAuthenticated(true)
      } else {
        router.push('/login')
      }
      setIsLoading(false)
    }

    checkAuth()

    // Auth state change 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setIsAuthenticated(false)
        router.push('/login')
      } else if (event === 'SIGNED_IN') {
        setIsAuthenticated(true)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">💕</span>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <LayoutContext.Provider value={{ currentView, setCurrentView }}>
      <div className="flex min-h-screen bg-gray-50">
        {/* Desktop Sidebar - Hide on write/reflection pages */}
        {!isMobile && !shouldHideSidebar && (
          <Sidebar 
            currentView={currentView}
            onViewChange={setCurrentView}
            entriesCount={entriesCount}
          />
        )}

        {/* Mobile Header - Hide on write/reflection pages */}
        {isMobile && !shouldHideSidebar && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-pink-100 px-4 py-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(true)}
                className="shrink-0"
              >
                <PanelLeftIcon size={20} />
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-rose-400 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">💕</span>
                </div>
                <h1 className="text-gray-800 font-medium">haru.</h1>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Sidebar Overlay - Hide on write/reflection pages */}
        {isMobile && !shouldHideSidebar && mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div 
              className="flex-1 bg-black/20"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Sidebar */}
            <div className="w-80 bg-white shadow-xl">
              <div className="p-4 border-b border-pink-100">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              <Sidebar 
                currentView={currentView}
                onViewChange={(view) => {
                  setCurrentView(view)
                  setMobileMenuOpen(false)
                }}
                entriesCount={entriesCount}
                isMobile={true}
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className={`flex-1 ${isMobile && !shouldHideSidebar ? 'pt-16' : ''}`}>
          {children}
        </main>
      </div>
    </LayoutContext.Provider>
  )
}