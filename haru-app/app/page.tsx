'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function testConnection() {
      try {
        // Supabase 연결 테스트
        const { data, error } = await supabase
          .from('user_profiles')
          .select('count')
          .single()

        if (error) {
          console.log('Supabase connection error:', error.message)
          setError(error.message)
        } else {
          console.log('Supabase connected successfully!')
          setConnected(true)
        }
      } catch (err) {
        console.error('Connection test failed:', err)
        setError('Connection failed')
      } finally {
        setLoading(false)
      }
    }

    testConnection()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            💕 haru
          </h1>
          <p className="text-gray-600 mb-8">Digital emotion diary</p>
          
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700">
              Connection Status
            </h2>
            
            {loading && (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                <span className="ml-2 text-gray-600">Testing connection...</span>
              </div>
            )}
            
            {!loading && connected && (
              <div className="flex items-center justify-center text-green-600">
                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Supabase Connected!</span>
              </div>
            )}
            
            {!loading && !connected && (
              <div className="text-red-600">
                <div className="flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Connection Failed</span>
                </div>
                {error && (
                  <p className="text-sm text-gray-500 bg-red-50 p-2 rounded">
                    {error}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
