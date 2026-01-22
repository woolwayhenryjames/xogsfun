'use client'

import { signIn, getSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link';
import { Sparkles, Twitter } from 'lucide-react';
import { XLogoMinimal } from '@/components/XLogo';
import { BottomNavigation } from '@/components/BottomNavigation';

export default function SignIn() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Check if already logged in
    getSession().then(session => {
      if (session) {
        router.push('/')
      }
    })
  }, [router])

  const handleTwitterSignIn = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const result = await signIn('twitter', {
        callbackUrl: '/',
        redirect: false,
      })
      
      if (result?.error) {
        setError('Login failed: ' + result.error)
      } else if (result?.url) {
        // Redirect to Twitter authorization page
        window.location.href = result.url
      }
    } catch (err) {
      setError('Unknown error occurred')
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pb-32 apple-fade-in">
      {/* Apple-style top navigation */}
      <nav className="apple-nav">
        <div className="flex items-center justify-between">
          <div className="apple-nav-brand">
            <XLogoMinimal className="w-10 h-10" />
            <span>Sign In</span>
          </div>
          
        <Link 
          href="/" 
            className="apple-button-outline px-4 py-2 text-sm"
        >
          Back to Home
        </Link>
        </div>
      </nav>

      <div className="px-6 py-12 max-w-md mx-auto">
        {/* Sign In Card */}
        <div className="apple-card text-center apple-scale-in">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Sparkles className="h-8 w-8 text-white" />
            </div>
            
          <h1 className="apple-title mb-4">Welcome Back</h1>
            
          <p className="apple-body-large text-center mb-8">
              Sign in with your Twitter account to start your data analysis journey
            </p>

          {/* Error Message */}
          {error && (
            <div className="apple-card bg-red-50 border-red-200 mb-6">
              <div className="text-sm text-red-700">{error}</div>
          </div>
          )}

          {/* Sign In Button */}
          <button
            onClick={handleTwitterSignIn}
            disabled={isLoading}
            className="apple-button w-full py-4 text-lg mb-6 flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Twitter className="w-5 h-5" />
            )}
            {isLoading ? 'Signing in...' : 'Sign in with Twitter'}
          </button>
            
            {/* Security Notice */}
            <div className="text-center space-y-2">
            <p className="apple-caption">🔒 Secure OAuth 2.0 Authentication</p>
            <p className="apple-caption">We don't store your password</p>
          </div>
        </div>

        {/* Bottom Information */}
        <div className="apple-card bg-gray-50 text-center mt-8">
          <p className="apple-caption">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>

      {/* Apple-style fixed bottom navigation */}
      <BottomNavigation />
    </div>
  );
} 