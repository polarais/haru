'use client'

import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AuthSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-white" size={40} />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">환영합니다!</h1>
        <p className="text-gray-600 mb-8">
          이메일 인증이 완료되었습니다.<br />
          이제 haru에서 일상을 기록해보세요.
        </p>

        {/* Action Buttons */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="space-y-4">
            <Link href="/dashboard" className="block">
              <Button 
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
              >
                시작하기
              </Button>
            </Link>
            
            <p className="text-sm text-gray-500">
              이제 일기를 작성하고 AI와 대화할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}