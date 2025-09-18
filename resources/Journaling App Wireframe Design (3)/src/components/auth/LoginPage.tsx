import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface LoginPageProps {
  onLogin: (email: string, password: string) => void;
  onGoToRegister: () => void;
  onGoToResetPassword: () => void;
  isLoading?: boolean;
  error?: string;
}

export function LoginPage({ onLogin, onGoToRegister, onGoToResetPassword, isLoading, error }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">💕</span>
          </div>
          <h1 className="text-gray-800 mb-2">Welcome back to haru</h1>
          <p className="text-sm text-gray-600">Sign in to continue your emotional journey</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 space-y-3">
            <button
              onClick={onGoToResetPassword}
              className="w-full text-sm text-pink-600 hover:text-pink-700 transition-colors"
              disabled={isLoading}
            >
              Forgot your password?
            </button>
            
            <div className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={onGoToRegister}
                className="text-pink-600 hover:text-pink-700 transition-colors"
                disabled={isLoading}
              >
                Sign up
              </button>
            </div>
          </div>
        </div>

        {/* Demo Login */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Demo: Use any email/password to continue
          </p>
        </div>
      </div>
    </div>
  );
}