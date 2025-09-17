'use client'

import { useState } from 'react'
import { formatDate, isToday, getRelativeDate } from '@/lib/utils/date'

export default function TestUtilsPage() {
  const [testDate, setTestDate] = useState('2025-09-17')
  
  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">TDD로 만든 날짜 유틸리티 테스트</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              날짜 입력
            </label>
            <input
              type="date"
              value={testDate}
              onChange={(e) => setTestDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="bg-gray-100 rounded-lg p-4 space-y-2">
            <h2 className="font-semibold mb-2">결과:</h2>
            <p><strong>English format:</strong> {formatDate(testDate)}</p>
            <p><strong>오늘인가요?</strong> {isToday(testDate) ? '네, 오늘입니다! 🎉' : '아니요'}</p>
            <p><strong>상대적 날짜:</strong> {getRelativeDate(testDate)}</p>
          </div>
          
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">빠른 테스트:</h3>
            <div className="space-x-2">
              <button 
                onClick={() => setTestDate(new Date().toISOString().split('T')[0])}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                오늘
              </button>
              <button 
                onClick={() => {
                  const yesterday = new Date()
                  yesterday.setDate(yesterday.getDate() - 1)
                  setTestDate(yesterday.toISOString().split('T')[0])
                }}
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                어제
              </button>
              <button 
                onClick={() => {
                  const tomorrow = new Date()
                  tomorrow.setDate(tomorrow.getDate() + 1)
                  setTestDate(tomorrow.toISOString().split('T')[0])
                }}
                className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                내일
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}