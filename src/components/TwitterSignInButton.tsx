'use client';

import { signIn } from 'next-auth/react';
import { Twitter, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';

interface TwitterSignInButtonProps {
  className?: string;
  text?: string;
}

export function TwitterSignInButton({
  className,
  text = "Sign in with Twitter"
}: TwitterSignInButtonProps) {
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
      className={cn(
        "apple-button",
        "relative overflow-hidden",
        "apple-shadow",
        "apple-hover-lift",
        "apple-focus-ring",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        className
      )}
    >
      <div className="flex items-center justify-center gap-3">
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Twitter className="h-5 w-5" />
        )}
        <span className="font-semibold">
          {isLoading ? "Connecting..." : text}
        </span>
      </div>
    </button>
  );
} 