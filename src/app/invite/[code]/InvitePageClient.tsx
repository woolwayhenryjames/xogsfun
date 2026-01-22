'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Avatar } from '@/components/Avatar';
import { Sparkles, Gift, Users, TrendingUp, Star, Heart, Zap } from 'lucide-react';

interface InviterInfo {
  name: string;
  twitterUsername: string;
  image: string;
}

interface InvitePageClientProps {
  inviterInfo: InviterInfo;
  platformId: string;
}

export function InvitePageClient({ inviterInfo, platformId }: InvitePageClientProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      handleAcceptInvite();
    }
  }, [status, session]);

  const handleAcceptInvite = async () => {
    if (accepting || !session?.user || !platformId) return;

    setAccepting(true);
    try {
      const response = await fetch('/api/invite/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inviterPlatformId: platformId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        // Quick redirect to profile
        setTimeout(() => {
          router.push('/profile?invited=true');
        }, 200);
      } else {
        // Handle different error types
        if (data.alreadyInvited) {
          toast.error(data.error, { duration: 2000 });
          // Quick redirect to profile after showing error
          setTimeout(() => {
            router.push('/profile');
          }, 300);
        } else if (data.registrationTooOld) {
          // 显示简短的闪现提示
          toast('Invitations only accepted within 5 minutes of signup. You can still invite others!', {
            icon: '⏰',
            style: {
              borderRadius: '12px',
              background: '#f59e0b',
              color: '#fff',
              fontWeight: '500',
            },
            duration: 1500,
          });
          // Redirect to profile page
          setTimeout(() => {
            router.push('/profile');
          }, 800);
        } else if (data.error === 'Cannot invite yourself') {
          // Handle self-invitation case
          toast.error('Cannot invite yourself', { duration: 2000 });
          // Quick redirect to profile page
          setTimeout(() => {
            router.push('/profile');
          }, 300);
        } else {
          toast.error(data.error || 'Failed to accept invitation');
        }
      }
    } catch (error) {
      console.error('Error accepting invite:', error);
      toast.error('Network error, please try again later');
    } finally {
      setAccepting(false);
    }
  };

  const handleSignIn = () => {
    signIn('twitter', {
      callbackUrl: `/invite/${platformId}`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Dynamic background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Floating decoration elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 animate-float">
          <Sparkles className="w-6 h-6 text-indigo-400/40" />
        </div>
        <div className="absolute top-32 right-32 animate-float delay-1000">
          <Star className="w-5 h-5 text-purple-400/40" />
        </div>
        <div className="absolute bottom-32 left-32 animate-float delay-2000">
          <Heart className="w-4 h-4 text-pink-400/40" />
        </div>
        <div className="absolute bottom-20 right-20 animate-float delay-500">
          <Zap className="w-5 h-5 text-yellow-400/40" />
        </div>
      </div>

      <div className="relative z-10 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 max-w-md w-full border border-white/20 animate-in slide-in-from-bottom-5 duration-700">
        <div className="text-center">
          {/* Inviter avatar area - compact version */}
          <div className="relative flex justify-center mb-6">
            <div className="relative">
              {/* Avatar halo effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full blur-lg opacity-75 animate-pulse scale-110"></div>
              <div className="relative">
                <Avatar
                  src={inviterInfo.image}
                  name={inviterInfo.name}
                  size="lg"
                  className="border-4 border-white shadow-2xl transform hover:scale-105 transition-all duration-300"
                />
              </div>
              {/* Verification badge */}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Invitation info - compact version */}
          <div className="mb-6">
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 animate-in slide-in-from-top-3 duration-500">
              {inviterInfo.name} invites you to join
            </h1>
            <div className="flex items-center justify-center space-x-2 mb-2 animate-in slide-in-from-top-4 duration-600">
              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
              <p className="text-blue-600 font-medium text-sm">@{inviterInfo.twitterUsername}</p>
            </div>
            <p className="text-gray-600 text-sm animate-in slide-in-from-top-5 duration-700">
              <span className="font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Xogs.Fun</span> - Discover your Twitter influence value
            </p>
          </div>

          {/* Login button or processing status */}
          {status === 'loading' ? (
            <div className="flex items-center justify-center py-6 mb-6">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-purple-600 rounded-full animate-spin animate-reverse"></div>
              </div>
            </div>
          ) : status === 'authenticated' ? (
            accepting ? (
              <div className="flex flex-col items-center justify-center space-y-4 py-6 mb-6 animate-in fade-in duration-500">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Gift className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-800 mb-1">Processing invitation...</p>
                  <p className="text-sm text-gray-600">$XOGS token rewards will be allocated shortly</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 mb-6 animate-in fade-in duration-500">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-xl mb-4 animate-bounce">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-lg font-semibold text-green-600 mb-2">Invitation processed!</p>
                <p className="text-sm text-gray-600">Redirecting to your profile page...</p>
              </div>
            )
          ) : (
            <div className="space-y-4 mb-6 animate-in slide-in-from-bottom-5 duration-700">
              <button
                onClick={handleSignIn}
                className="group relative w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 flex items-center justify-center space-x-3">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  <span>Sign in with Twitter and accept invitation</span>
                </div>
              </button>
              
              {/* Description text */}
              <p className="text-sm text-gray-500 text-center">
                After signing in, you will automatically accept the invitation and receive <span className="font-semibold text-green-600">$XOGS token rewards</span> based on your AI score
              </p>
            </div>
          )}

          {/* Reward info card - compact version */}
          <div className="bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 rounded-2xl p-4 mb-6 border border-green-100/50 animate-in slide-in-from-bottom-3 duration-500">
            <div className="flex items-center justify-center mb-3">
              <Gift className="w-5 h-5 text-green-600 mr-2" />
              <h3 className="text-base font-bold text-gray-800">Exclusive Invitation Rewards</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-white/60 rounded-xl border border-green-100">
                <div className="text-lg font-bold text-green-600 mb-1">AI Score × 1</div>
                <div className="text-xs text-gray-600">Your $XOGS Reward</div>
              </div>
              <div className="text-center p-3 bg-white/60 rounded-xl border border-blue-100">
                <div className="text-lg font-bold text-blue-600 mb-1">AI Score × 2</div>
                <div className="text-xs text-gray-600">Inviter Reward</div>
              </div>
            </div>
            <div className="mt-3 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-xs text-yellow-800 text-center">
                💡 Rewards are calculated based on your AI influence score
              </p>
            </div>
          </div>

          {/* Platform features - compact version */}
          <div className="grid grid-cols-3 gap-3 mb-6 animate-in slide-in-from-bottom-4 duration-600">
            <div className="group bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-3 text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105 border border-indigo-100">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg mb-2 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div className="text-xs font-semibold text-indigo-900">AI Smart Scoring</div>
            </div>
            <div className="group bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105 border border-green-100">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg mb-2 group-hover:scale-110 transition-transform">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <div className="text-xs font-semibold text-green-900">$XOGS Token Rewards</div>
            </div>
            <div className="group bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105 border border-purple-100">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-lg mb-2 group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="text-xs font-semibold text-purple-900">Community Ranking</div>
            </div>
          </div>

          {/* Security assurance description */}
          <div className="p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-100 animate-in slide-in-from-bottom-6 duration-800 mb-4">
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-600">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Secure Login</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-300"></div>
                <span>Instant Effect</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-600"></div>
                <span>Mobile Friendly</span>
              </div>
            </div>
          </div>

          {/* Home button */}
          <button
            onClick={() => router.push('/')}
            className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white py-3 px-6 rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            🏠 Back to Home
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-reverse {
          animation-direction: reverse;
        }
      `}</style>
    </div>
  );
} 