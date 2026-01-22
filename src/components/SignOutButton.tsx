'use client';

import { signOut } from 'next-auth/react';
import { useState } from 'react';
import { LogOut } from 'lucide-react';

interface SignOutButtonProps {
  isMobile?: boolean;
  className?: string;
}

export function SignOutButton({ isMobile = false, className = '' }: SignOutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut({
        callbackUrl: '/',
      });
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isMobile) {
    return (
      <button
        onClick={handleSignOut}
        disabled={isLoading}
        className={`klout-bottom-nav-item text-red-600 disabled:opacity-50 ${className}`}
      >
        {isLoading ? (
          <div className="klout-spinner"></div>
        ) : (
          <LogOut className="w-5 h-5" />
        )}
        <span>{isLoading ? 'Signing out' : 'Sign out'}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={isLoading}
      className={`klout-button-outline text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 disabled:opacity-50 ${className}`}
    >
      {isLoading ? (
        <div className="klout-spinner mr-2"></div>
      ) : (
        <LogOut className="w-4 h-4 mr-2" />
      )}
      {isLoading ? 'Signing out...' : 'Sign out'}
    </button>
  );
} 