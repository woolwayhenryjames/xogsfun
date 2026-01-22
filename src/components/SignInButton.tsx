'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';

export function SignInButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      await signIn('twitter', {
        callbackUrl: '/auth/redirect',
      });
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSignIn}
      disabled={isLoading}
      className="w-full magic-button group relative overflow-hidden"
    >
              {/* Content */}
      <div className="relative flex items-center justify-center space-x-3 z-10">
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white/60">
            </div>
            <span className="font-medium">Signing in...</span>
          </>
        ) : (
          <>
            <div className="magic-icon-container h-6 w-6 bg-white/20 group-hover:scale-110 transition-transform duration-300">
            <svg
                className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            </div>
            <span className="font-medium">Sign in with Twitter</span>
          </>
        )}
      </div>
    </button>
  );
} 