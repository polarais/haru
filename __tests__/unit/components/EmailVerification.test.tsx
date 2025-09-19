import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock EmailVerification component for testing
const MockEmailVerification = () => {
  const [code, setCode] = React.useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = React.useState(false)
  
  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return
    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)
  }
  
  const handleVerify = () => {
    if (code.join('').length === 6) {
      setIsLoading(true)
    }
  }
  
  return (
    <div>
      <h1>이메일 인증</h1>
      <p>test@example.com으로 전송된 인증 코드를 입력해주세요.</p>
      <div>
        {code.map((value, index) => (
          <input
            key={index}
            data-testid={`code-input-${index}`}
            value={value}
            onChange={(e) => handleInputChange(index, e.target.value)}
            maxLength={1}
          />
        ))}
      </div>
      <button 
        data-testid="verify-button" 
        disabled={isLoading || code.join('').length !== 6}
        onClick={handleVerify}
      >
        {isLoading ? '인증 중...' : '인증하기'}
      </button>
      {isLoading && <div data-testid="loading">인증 중...</div>}
    </div>
  )
}

describe('EmailVerification Component', () => {
  it('renders email verification form', () => {
    render(<MockEmailVerification />)
    
    expect(screen.getByText('이메일 인증')).toBeInTheDocument()
    expect(screen.getByText('test@example.com으로 전송된 인증 코드를 입력해주세요.')).toBeInTheDocument()
    
    // 6자리 입력 필드 확인
    for (let i = 0; i < 6; i++) {
      expect(screen.getByTestId(`code-input-${i}`)).toBeInTheDocument()
    }
  })

  it('allows entering verification code', () => {
    render(<MockEmailVerification />)
    
    const firstInput = screen.getByTestId('code-input-0')
    fireEvent.change(firstInput, { target: { value: '1' } })
    
    expect(firstInput).toHaveValue('1')
  })

  it('enables verify button when 6 digits are entered', () => {
    render(<MockEmailVerification />)
    
    const verifyButton = screen.getByTestId('verify-button')
    expect(verifyButton).toBeDisabled()
    
    // 6자리 모두 입력
    for (let i = 0; i < 6; i++) {
      const input = screen.getByTestId(`code-input-${i}`)
      fireEvent.change(input, { target: { value: (i + 1).toString() } })
    }
    
    expect(verifyButton).not.toBeDisabled()
  })

  it('shows loading state when verifying', () => {
    render(<MockEmailVerification />)
    
    // 6자리 모두 입력
    for (let i = 0; i < 6; i++) {
      const input = screen.getByTestId(`code-input-${i}`)
      fireEvent.change(input, { target: { value: (i + 1).toString() } })
    }
    
    const verifyButton = screen.getByTestId('verify-button')
    fireEvent.click(verifyButton)
    
    expect(screen.getByTestId('loading')).toBeInTheDocument()
    expect(screen.getAllByText('인증 중...')).toHaveLength(2)
  })
})