'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Sparkles } from 'lucide-react';

interface ExtendedUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface ExtendedSession {
  user?: ExtendedUser;
}

export default function AuthRedirectPage() {
  const { data: session, status } = useSession() as { data: ExtendedSession | null, status: string };
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      console.log('Redirecting to profile, user:', session.user.id);
      router.push('/profile');
    } else if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, session, router]);

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center animate-fade-in">
        <div className="magic-card text-center max-w-sm w-full">
          <div className="magic-icon-container w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 text-white mx-auto mb-6 animate-gentle-float">
            <Sparkles className="h-8 w-8" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/30 mx-auto mb-4"></div>
          <p className="magic-label">Checking authentication status...</p>
        </div>
      </div>
    );
  }

  // Authenticated state
  if (status === 'authenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center animate-fade-in">
        <div className="magic-card text-center max-w-sm w-full">
          <div className="magic-icon-container w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 text-white mx-auto mb-6 animate-gentle-float">
            <Sparkles className="h-8 w-8" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/30 mx-auto mb-4"></div>
          <p className="magic-label">Login successful, redirecting...</p>
        </div>
      </div>
    );
  }

  // Unauthenticated state
  return (
    <div className="min-h-screen flex items-center justify-center animate-fade-in">
      <div className="magic-card text-center max-w-sm w-full">
        <div className="magic-icon-container w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 text-white mx-auto mb-6">
          <Sparkles className="h-8 w-8" />
        </div>
        <p className="magic-label">Not authenticated, redirecting to login page...</p>
      </div>
    </div>
  );
} 