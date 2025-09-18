'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const [resendCountdown, setResendCountdown] = useState(0)
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Countdown timer for resend button
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (resendCountdown > 0) {
      timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1)
      }, 1000)
    }
    return () => clearTimeout(timer)
  }, [resendCountdown])

  const handleInputChange = (index: number, value: string) => {
    // Only allow single digit
    if (value.length > 1) return
    
    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)
    
    // Auto-focus next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace to focus previous input
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify = async () => {
    const verificationCode = code.join('')
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: verificationCode,
        type: 'signup'
      })

      if (error) {
        setError(error.message)
      } else {
        router.push('/auth/success')
      }
    } catch (err) {
      console.error('Verification error:', err)
      setError('인증 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResendLoading(true)
    setError('')
    setResendMessage('')

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password: '', // 재전송이므로 빈 패스워드
      })

      if (error) {
        setError(error.message)
      } else {
        setResendMessage('인증 코드가 다시 전송되었습니다.')
        setResendCountdown(60) // Start 60 second countdown
      }
    } catch (err) {
      console.error('Resend error:', err)
      setError('코드 재전송 중 오류가 발생했습니다.')
    } finally {
      setResendLoading(false)
    }
  }

  const handleBack = () => {
    router.push('/register')
  }

  const isCodeComplete = code.every(digit => digit.length === 1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button 
          onClick={handleBack}
          data-testid="back-button"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="text-sm">회원가입으로 돌아가기</span>
        </button>

        {/* Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">📧</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">이메일 인증</h1>
          <p className="text-sm text-gray-600">
            {email}으로 전송된 인증 코드를 입력해주세요.
          </p>
        </div>

        {/* Verification Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            {resendMessage && (
              <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
                {resendMessage}
              </div>
            )}
            
            {/* Code Input Fields */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">인증 코드 (6자리)</label>
              <div className="flex gap-2 justify-center">
                {code.map((digit, index) => (
                  <Input
                    key={index}
                    ref={el => { inputRefs.current[index] = el }}
                    data-testid={`code-input-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleInputChange(index, e.target.value)}
                    onKeyDown={e => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-lg font-medium border-gray-300 focus:border-pink-400 focus:ring-pink-400"
                    disabled={loading}
                  />
                ))}
              </div>
            </div>

            {/* Verify Button */}
            <Button 
              onClick={handleVerify}
              data-testid="verify-button"
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
              disabled={!isCodeComplete || loading}
            >
              {loading ? '인증 중...' : '인증하기'}
            </Button>

            {/* Resend Button */}
            <div className="text-center">
              <button
                onClick={handleResend}
                data-testid="resend-button"
                disabled={resendLoading || resendCountdown > 0}
                className="text-sm text-pink-600 hover:text-pink-500 hover:underline disabled:text-gray-400 disabled:no-underline"
              >
                {resendCountdown > 0 
                  ? `${resendCountdown}초 후 재전송 가능`
                  : resendLoading 
                    ? '전송 중...' 
                    : '인증 코드 재전송'
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}