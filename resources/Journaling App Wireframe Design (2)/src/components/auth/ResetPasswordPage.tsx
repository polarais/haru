import React, { useState } from 'react';
import { ArrowLeft, Mail } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface ResetPasswordPageProps {
  onResetPassword: (email: string) => void;
  onGoBack: () => void;
  isLoading?: boolean;
  error?: string;
  isEmailSent?: boolean;
}

export function ResetPasswordPage({ onResetPassword, onGoBack, isLoading, error, isEmailSent }: ResetPasswordPageProps) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onResetPassword(email);
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mail className="text-white" size={24} />
            </div>
            <h1 className="text-gray-800 mb-2">Check your email</h1>
            <p className="text-sm text-gray-600">
              We've sent a password reset link to <span className="font-medium">{email}</span>
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                If you don't see the email, check your spam folder or try again with a different email address.
              </p>
              
              <Button 
                onClick={onGoBack}
                variant="outline"
                className="w-full"
              >
                Back to Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={onGoBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
          disabled={isLoading}
        >
          <ArrowLeft size={16} />
          <span className="text-sm">Back to Sign In</span>
        </button>

        {/* Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Mail className="text-white" size={24} />
          </div>
          <h1 className="text-gray-800 mb-2">Reset your password</h1>
          <p className="text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        {/* Reset Form */}
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

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
              disabled={isLoading || !email}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}