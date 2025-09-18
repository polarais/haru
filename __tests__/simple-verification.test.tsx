import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Simple test component
function EmailVerificationSimple({ email }: { email: string }) {
  return (
    <div>
      <h1>이메일 인증</h1>
      <p>{email}으로 전송된 인증 코드를 입력해주세요.</p>
      {[0, 1, 2, 3, 4, 5].map(i => (
        <input key={i} data-testid={`code-input-${i}`} maxLength={1} />
      ))}
      <button data-testid="verify-button" disabled>인증하기</button>
    </div>
  )
}

describe('EmailVerification Simple Test', () => {
  it('renders basic elements', () => {
    render(<EmailVerificationSimple email="test@example.com" />)
    
    expect(screen.getByText('이메일 인증')).toBeInTheDocument()
    expect(screen.getByText('test@example.com으로 전송된 인증 코드를 입력해주세요.')).toBeInTheDocument()
    
    for (let i = 0; i < 6; i++) {
      expect(screen.getByTestId(`code-input-${i}`)).toBeInTheDocument()
    }
    
    expect(screen.getByTestId('verify-button')).toBeInTheDocument()
  })
})