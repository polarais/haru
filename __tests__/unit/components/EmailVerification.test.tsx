import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: (key: string) => {
      if (key === 'email') return 'test@example.com'
      return null
    }
  })
}))

// Mock Supabase
const mockSignUp = jest.fn()
const mockVerifyOtp = jest.fn()

jest.mock('../../../haru-app/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: (...args: any[]) => mockSignUp(...args),
      verifyOtp: (...args: any[]) => mockVerifyOtp(...args),
    },
  },
}))

import { EmailVerification } from '../../../haru-app/components/auth/EmailVerification'

describe('EmailVerification Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders email verification form with correct email', () => {
    render(<EmailVerification />)
    
    expect(screen.getByText('이메일 인증')).toBeInTheDocument()
    expect(screen.getByText('test@example.com으로 전송된 인증 코드를 입력해주세요.')).toBeInTheDocument()
    
    // 6자리 입력 필드 확인
    for (let i = 0; i < 6; i++) {
      expect(screen.getByTestId(`code-input-${i}`)).toBeInTheDocument()
    }
  })

  it('allows entering 6-digit verification code', () => {
    render(<EmailVerification />)
    
    const inputs = Array.from({ length: 6 }, (_, i) => 
      screen.getByTestId(`code-input-${i}`)
    )
    
    // 각 자리수 입력
    inputs.forEach((input, index) => {
      fireEvent.change(input, { target: { value: (index + 1).toString() } })
      expect(input).toHaveValue((index + 1).toString())
    })
  })

  it('automatically focuses next input when entering digit', () => {
    render(<EmailVerification />)
    
    const firstInput = screen.getByTestId('code-input-0')
    const secondInput = screen.getByTestId('code-input-1')
    
    fireEvent.change(firstInput, { target: { value: '1' } })
    
    expect(document.activeElement).toBe(secondInput)
  })

  it('automatically focuses previous input when backspace is pressed', () => {
    render(<EmailVerification />)
    
    const firstInput = screen.getByTestId('code-input-0')
    const secondInput = screen.getByTestId('code-input-1')
    
    // 첫 번째 입력에 값 입력 (두 번째로 포커스 이동)
    fireEvent.change(firstInput, { target: { value: '1' } })
    
    // 두 번째 입력에서 백스페이스
    fireEvent.keyDown(secondInput, { key: 'Backspace' })
    
    expect(document.activeElement).toBe(firstInput)
  })

  it('enables verify button when all 6 digits are entered', () => {
    render(<EmailVerification />)
    
    const verifyButton = screen.getByTestId('verify-button')
    expect(verifyButton).toBeDisabled()
    
    // 6자리 모두 입력
    Array.from({ length: 6 }, (_, i) => {
      const input = screen.getByTestId(`code-input-${i}`)
      fireEvent.change(input, { target: { value: (i + 1).toString() } })
    })
    
    expect(verifyButton).toBeEnabled()
  })

  it('verifies code and redirects on successful verification', async () => {
    mockVerifyOtp.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
    
    render(<EmailVerification />)
    
    // 6자리 코드 입력
    Array.from({ length: 6 }, (_, i) => {
      const input = screen.getByTestId(`code-input-${i}`)
      fireEvent.change(input, { target: { value: '1' } })
    })
    
    const verifyButton = screen.getByTestId('verify-button')
    fireEvent.click(verifyButton)
    
    await waitFor(() => {
      expect(mockVerifyOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        token: '111111',
        type: 'signup'
      })
    })
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth/success')
    })
  })

  it('shows error message on verification failure', async () => {
    mockVerifyOtp.mockResolvedValue({ 
      data: null, 
      error: { message: '잘못된 인증 코드입니다.' } 
    })
    
    render(<EmailVerification />)
    
    // 6자리 코드 입력
    Array.from({ length: 6 }, (_, i) => {
      const input = screen.getByTestId(`code-input-${i}`)
      fireEvent.change(input, { target: { value: '1' } })
    })
    
    const verifyButton = screen.getByTestId('verify-button')
    fireEvent.click(verifyButton)
    
    await waitFor(() => {
      expect(screen.getByText('잘못된 인증 코드입니다.')).toBeInTheDocument()
    })
  })

  it('allows resending verification code', async () => {
    mockSignUp.mockResolvedValue({ data: {}, error: null })
    
    render(<EmailVerification />)
    
    const resendButton = screen.getByTestId('resend-button')
    fireEvent.click(resendButton)
    
    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: '', // 재전송이므로 빈 패스워드
      })
    })
    
    expect(screen.getByText('인증 코드가 다시 전송되었습니다.')).toBeInTheDocument()
  })

  it('shows countdown timer for resend button', () => {
    render(<EmailVerification />)
    
    const resendButton = screen.getByTestId('resend-button')
    fireEvent.click(resendButton)
    
    // 카운트다운이 시작되어야 함
    expect(screen.getByText(/59초 후 재전송 가능/)).toBeInTheDocument()
    expect(resendButton).toBeDisabled()
  })

  it('navigates back when back button is clicked', () => {
    render(<EmailVerification />)
    
    const backButton = screen.getByTestId('back-button')
    fireEvent.click(backButton)
    
    expect(mockPush).toHaveBeenCalledWith('/register')
  })
})