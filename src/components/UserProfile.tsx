'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Avatar } from './Avatar';
import { RefreshCw, Star, Users, DollarSign, MapPin, Link as LinkIcon, Calendar, Globe, CheckCircle, Coins, ArrowUpRight, AlertTriangle } from 'lucide-react';
import { CollapsibleSection } from './CollapsibleSection';
import toast from 'react-hot-toast';
import { useDebounce } from '@/lib/debounce';
import { SponsorCard } from './SponsorCard';

interface UserData {
  id: string;
  twitterId: string | null;
  name: string | null;
  username: string | null;
  twitterUsername: string | null;
  email: string | null;
  image: string | null;
  profileImageUrl: string | null;
  description: string | null;
  url: string | null;
  location: string | null;
  followersCount: number | null;
  friendsCount: number | null;
  statusesCount: number | null;
  verified: boolean | null;
  twitterCreatedAt: Date | null;
  lang: string | null;
  xogsBalance: number;
  aiScore: number;
  platformId: number;
  inviterId: string | null;
  inviteCode: string | null;
  createdAt: Date;
  updatedAt: Date;
  rank: number | null;
}

export function UserProfile() {
  const { data: session } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingFollowers, setIsUpdatingFollowers] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string>('');
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  // 随机选择显示域名
  const [displayDomain, setDisplayDomain] = useState('');
  
  useEffect(() => {
    // 组件加载时随机选择一个域名用于显示
    const domains = [
      'https://x.hmvy.com',
      'https://x.ptvu.com', 
      'https://x.mdvu.com'
    ];
    const randomDomain = domains[Math.floor(Math.random() * domains.length)];
    setDisplayDomain(randomDomain);
  }, []);

  useEffect(() => {
    if (session) {
      fetchUserData();
    }
  }, [session]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user');
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 使用防抖优化刷新功能，防止频繁点击
  const debouncedRefreshUserData = useDebounce(async () => {
    setIsUpdatingFollowers(true);
    setUpdateMessage('⏳ Refreshing data...');
    
    try {
      const response = await fetch('/api/refresh-user-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setUpdateMessage('✅ ' + result.message);
        setLastUpdateTime(new Date());
        // Refresh user data
        await fetchUserData();
      } else {
        setUpdateMessage('❌ ' + (result.error || 'Refresh failed'));
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      setUpdateMessage('❌ Network error, please try again later');
    } finally {
      setIsUpdatingFollowers(false);
    }
  }, 2000); // 2秒防抖

  const refreshUserData = () => {
    debouncedRefreshUserData();
  };

  const handleWithdraw = () => {
    // 显示简短的 coming soon 提示
    toast('🚀 Coming Soon!', {
      icon: '⏳',
      style: {
        borderRadius: '12px',
        background: '#667eea',
        color: '#fff',
        fontWeight: '500',
      },
      duration: 2000,
    });
  };

  const copyInviteLink = async (platformId: number) => {
    // 随机选择域名
    const domains = [
      'https://x.hmvy.com',
      'https://x.ptvu.com', 
      'https://x.mdvu.com'
    ];
    const randomDomain = domains[Math.floor(Math.random() * domains.length)];
    const inviteUrl = `${randomDomain}/invite/${platformId}`;
    
    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast.success('🎉 Invite link copied!', {
        style: {
          borderRadius: '12px',
          background: '#10b981',
          color: '#fff',
          fontWeight: '500',
        },
        duration: 2000,
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy link', {
        style: {
          borderRadius: '12px',
          background: '#ef4444',
          color: '#fff',
          fontWeight: '500',
        },
        duration: 2000,
      });
    }
  };

  const shareToTwitter = (platformId: number) => {
    // 随机选择域名
    const domains = [
      'https://x.hmvy.com',
      'https://x.ptvu.com', 
      'https://x.mdvu.com'
    ];
    const randomDomain = domains[Math.floor(Math.random() * domains.length)];
    const inviteUrl = `${randomDomain}/invite/${platformId}`;
    
    // 预设10条英语文案
    const tweetTexts = [
      `🚀 Join me on XOGS - the ultimate CryptoTwitter AI scoring platform! Get your influence evaluated and earn $XOGS tokens. Use my invite link: ${inviteUrl} #XOGS #CryptoTwitter #AI`,
      `🤖 Discover your CryptoTwitter influence score with XOGS! Multi-dimensional AI evaluation + $XOGS token rewards. Join now: ${inviteUrl} #XOGS #CryptoInfluence #TGE`,
      `⭐ Want to know your real impact on CryptoTwitter? XOGS uses advanced AI to score your influence and rewards you with $XOGS tokens! ${inviteUrl} #XOGS #CryptoAnalytics`,
      `🎯 XOGS is revolutionizing how we measure CryptoTwitter influence! Get scored by AI, earn $XOGS tokens, and prepare for TGE. Join me: ${inviteUrl} #XOGS #CryptoRewards`,
      `💎 Just discovered XOGS - the smartest way to evaluate CryptoTwitter influence! AI-powered scoring + token rewards. Don't miss out: ${inviteUrl} #XOGS #CryptoAI`,
      `🔥 XOGS is the future of CryptoTwitter analytics! Get your AI influence score and earn $XOGS tokens before TGE. Join the revolution: ${inviteUrl} #XOGS #TGEComingSoon`,
      `📊 Finally, a platform that truly understands CryptoTwitter influence! XOGS uses multi-dimensional AI scoring + rewards $XOGS tokens. Check it out: ${inviteUrl} #XOGS`,
      `🌟 Ready to unlock your CryptoTwitter potential? XOGS provides AI-powered influence scoring and $XOGS token rewards. Get started: ${inviteUrl} #XOGS #CryptoInfluencer`,
      `🚀 XOGS is changing the game for CryptoTwitter! Advanced AI scoring, token rewards, and TGE coming soon. Join the community: ${inviteUrl} #XOGS #CryptoFuture`,
      `💰 Earn $XOGS tokens while discovering your true CryptoTwitter influence! AI-powered platform with amazing rewards. Join me: ${inviteUrl} #XOGS #CryptoEarnings`
    ];
    
    // 随机选择一条文案
    const randomText = tweetTexts[Math.floor(Math.random() * tweetTexts.length)];
    
    // 构建Twitter分享URL
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(randomText)}`;
    
    // 在新窗口打开Twitter分享
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
    
    // 显示分享成功提示
    toast.success('🐦 Opening Twitter to share!', {
      style: {
        borderRadius: '12px',
        background: '#1da1f2',
        color: '#fff',
        fontWeight: '500',
      },
      duration: 2000,
    });
  };

  const formatUpdateTime = (time: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just updated';
    if (diffMins < 60) return `Updated ${diffMins} minutes ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Updated ${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `Updated ${diffDays} days ago`;
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'Unknown';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const canUpdate = !isUpdatingFollowers;

  if (isLoading) {
    return (
      <div className="space-y-6 apple-fade-in">
        <div className="apple-card">
          <div className="animate-pulse">
            <div className="w-24 h-24 bg-gray-200 rounded-2xl mx-auto mb-4"></div>
            <div className="h-6 bg-gray-200 rounded-lg mb-2"></div>
            <div className="h-4 bg-gray-200 rounded-lg w-2/3 mx-auto"></div>
          </div>
        </div>
        <div className="apple-grid-2">
          <div className="apple-card">
            <div className="animate-pulse h-16 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="apple-card">
            <div className="animate-pulse h-16 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="apple-card text-center">
        <p className="apple-body text-gray-500">Unable to load user data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 apple-fade-in">
      {/* $XOGS Balance Card - 移到最前面 */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl shadow-xl border border-orange-100 p-6 apple-slide-up">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Coins className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-900 mb-1">
              {userData.xogsBalance?.toLocaleString() || 0}
            </div>
            <div className="text-sm font-medium text-orange-600">$XOGS Balance</div>
          </div>
        </div>
        
        {/* 按钮区域 */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={handleWithdraw}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl text-sm font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <ArrowUpRight className="w-4 h-4" />
            <div className="flex flex-col items-center">
              <span className="text-xs">Coming Soon</span>
              <span>Withdraw</span>
            </div>
          </button>
          <a 
            href="/xogs"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl text-sm font-medium hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Coins className="w-4 h-4" />
            <div className="flex flex-col items-center">
              <span className="text-xs">Financial</span>
              <span>Records</span>
            </div>
          </a>
        </div>
        
        <div className="text-xs text-orange-700/70">
          Get more $XOGS tokens by inviting friends and improving AI score
        </div>
      </div>

      {/* Sponsor Card - Hidden */}
      <SponsorCard />

      {/* Invite Link Card - 移到$XOGS Balance和What's Next中间 */}
      {userData.platformId && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl shadow-xl border border-indigo-100 p-6 apple-slide-up">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Invite Friends</h3>
              <p className="text-sm text-gray-600">Share your unique invitation link</p>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-indigo-100/50 mb-4">
            <div className="text-xs text-indigo-600 font-medium mb-2">Your Invite Link:</div>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 text-sm font-mono bg-indigo-50 px-3 py-2 rounded-lg text-indigo-700 truncate">
                {`${displayDomain}/invite/${userData.platformId}`}
              </div>
              <button
                onClick={() => copyInviteLink(userData.platformId)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-medium hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </button>
            </div>
            <button
              onClick={() => shareToTwitter(userData.platformId)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-sky-500 text-white rounded-xl text-sm font-medium hover:from-blue-600 hover:to-sky-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
              Share on Twitter
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-white/60 rounded-xl border border-indigo-100">
              <div className="text-lg font-bold text-indigo-600 mb-1">AI Score × 1</div>
              <div className="text-xs text-gray-600">Friend's Reward</div>
            </div>
            <div className="text-center p-3 bg-white/60 rounded-xl border border-purple-100">
              <div className="text-lg font-bold text-purple-600 mb-1">AI Score × 2</div>
              <div className="text-xs text-gray-600">Your Reward</div>
            </div>
          </div>
        </div>
      )}

      {/* User Guide Card - What to do next - 折叠版本 */}
      <div className="apple-slide-up">
        <CollapsibleSection
          title="What's Next?"
          subtitle="Your journey continues here - click to view next steps"
          icon={<svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>}
          variant="success"
        >
          <div className="bg-white/50 rounded-xl p-5">
            <p className="text-sm text-emerald-800 leading-relaxed mb-4">
              🎉 <strong>Congratulations!</strong> You have successfully claimed your tokens. Here's what you can do next:
            </p>
            <div className="space-y-3 text-sm text-emerald-700">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>Wait for TGE:</strong> After our Token Generation Event (TGE), you can return to this page to withdraw your $XOGS tokens to your SOL wallet</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>Earn More:</strong> Share your invitation link to earn more $XOGS tokens - you get 2x your friend's AI score as bonus!</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>Stay Updated:</strong> Follow our official Twitter <a href="https://x.com/xogsfun" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-800 font-semibold underline">@xogsfun</a> for the latest news and announcements</span>
              </div>
            </div>
          </div>
        </CollapsibleSection>
      </div>

      {/* AI Score Card - 移到第二位 */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl shadow-xl border-2 border-blue-100 p-6 apple-slide-up relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-400/10 to-blue-400/10 rounded-full -ml-12 -mb-12"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Star className="h-8 w-8 text-white" />
            </div>
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
                {userData.aiScore || 0}
              </div>
              <div className="text-sm font-semibold text-blue-700">CryptoTwitter AI Score</div>
              <div className="text-xs text-blue-600 opacity-75">Multi-dimensional influence evaluation</div>
            </div>
          </div>
          <a 
            href="/ai-score"
            className="group relative px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
            <div className="relative z-10 flex items-center gap-2">
              <span>View Details</span>
              <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </a>
        </div>
      </div>

      {/* User Basic Information Card - 移到第三位 */}
      <div className="apple-card text-center apple-scale-in">
        <Avatar
          src={userData.image || userData.profileImageUrl}
          name={userData.name}
          size="xl"
          className="mx-auto mb-6"
        />
        
        <div className="flex items-center justify-center gap-2 mb-2">
          <h2 className="apple-subheading">
            {userData.name || 'Unknown User'}
          </h2>
          {userData.verified && (
            <CheckCircle className="w-5 h-5 text-blue-500" />
          )}
        </div>
        
        <p className="apple-caption mb-4">
          {userData.username || userData.twitterUsername || 'qkfdcom'}
        </p>

        {userData.description && (
          <p className="apple-body text-gray-600 mb-4 text-left">
            {userData.description}
          </p>
        )}

        {/* User Detailed Information - Optimized Layout */}
        <div className="space-y-3 text-left">
          {userData.location && (
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500 font-medium">Location</div>
                <div className="text-sm font-semibold text-gray-900 truncate">{userData.location}</div>
              </div>
            </div>
          )}
          
          {userData.url && (
            <div className="flex items-center gap-3 bg-blue-50 rounded-xl p-3 border border-blue-100">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <LinkIcon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-blue-500 font-medium">Website</div>
                <a href={userData.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-blue-600 hover:text-blue-700 truncate block">
                  {userData.url.replace(/^https?:\/\//, '')}
                </a>
              </div>
            </div>
          )}
          
          {userData.twitterCreatedAt && (
            <div className="flex items-center gap-3 bg-purple-50 rounded-xl p-3 border border-purple-100">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-purple-500 font-medium">Twitter Joined</div>
                <div className="text-sm font-semibold text-purple-900">{formatDate(userData.twitterCreatedAt)}</div>
              </div>
            </div>
          )}
          
          {userData.lang && (
            <div className="flex items-center gap-3 bg-green-50 rounded-xl p-3 border border-green-100">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Globe className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-green-500 font-medium">Language</div>
                <div className="text-sm font-semibold text-green-900">{userData.lang.toUpperCase()}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Statistics Grid - Enhanced Version */}
      <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-bottom-3 duration-500">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-100 p-4 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {userData.followersCount?.toLocaleString() || '0'}
          </div>
          <div className="text-xs text-gray-500 font-medium">Followers</div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-100 p-4 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {userData.friendsCount?.toLocaleString() || '0'}
          </div>
          <div className="text-xs text-gray-500 font-medium">Following</div>
        </div>
      </div>
      
      {/* More Statistics */}
      <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-100 p-4 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {userData.statusesCount?.toLocaleString() || '0'}
          </div>
          <div className="text-xs text-gray-500 font-medium">Tweets</div>
        </div>
        
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-100 p-4 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <CheckCircle className="h-6 w-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {userData.verified ? 'Verified' : 'Unverified'}
          </div>
          <div className="text-xs text-gray-500 font-medium">Verification Status</div>
        </div>
      </div>

      {/* Security Notice - Collapsible */}
      <div className="apple-slide-up">
        <CollapsibleSection
          title="Security Notice"
          subtitle="Important security information - click to view details"
          icon={<AlertTriangle className="h-6 w-6 text-white" />}
          variant="warning"
        >
          <div className="space-y-3 text-sm text-red-700 bg-white/50 rounded-xl p-4">
            <p className="font-semibold">🚨 Important Warning</p>
            <p>• <strong>We have not yet released an official token contract</strong></p>
            <p>• All "$XOGS" tokens on the market are fake</p>
            <p>• Do not purchase any tokens not officially confirmed</p>
            <p>• Official announcements will be made through verified channels only</p>
            <p>• Please protect your assets and avoid scams</p>
          </div>
        </CollapsibleSection>
      </div>



      {/* Account Information - Enhanced */}
      <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-3xl shadow-xl border border-gray-100 p-6 apple-slide-up">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-slate-700 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Account Information</h3>
            <p className="text-sm text-gray-600">Platform and registration details</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                </div>
                <span className="font-medium text-gray-900">Platform ID</span>
              </div>
              <span className="text-sm font-mono bg-gray-100 px-3 py-1 rounded-lg text-gray-700">{userData.platformId}</span>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </div>
                <span className="font-medium text-gray-900">Twitter ID</span>
              </div>
              <span className="text-sm font-mono bg-gray-100 px-3 py-1 rounded-lg text-gray-700">{userData.twitterId || 'Unknown'}</span>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-green-600" />
                </div>
                <span className="font-medium text-gray-900">Registration Date</span>
              </div>
              <span className="text-sm text-gray-600">{formatDate(userData.createdAt)}</span>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <RefreshCw className="w-4 h-4 text-purple-600" />
                </div>
                <span className="font-medium text-gray-900">Last Updated</span>
              </div>
              <span className="text-sm text-gray-600">{formatDate(userData.updatedAt)}</span>
            </div>
          </div>

          {userData.inviteCode && (
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-900">Invite Code</span>
                </div>
                <span className="text-sm font-mono bg-orange-100 px-3 py-1 rounded-lg text-orange-700 font-semibold">{userData.inviteCode}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Message */}
      {updateMessage && (
        <div className={`apple-card apple-scale-in ${
          updateMessage.startsWith('✅') 
            ? 'bg-green-50 border-green-200 text-green-700'
            : updateMessage.startsWith('⏳') || updateMessage.startsWith('📊')
            ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
            : updateMessage.startsWith('🚀')
            ? 'bg-blue-50 border-blue-200 text-blue-700'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <p className="text-center apple-body whitespace-pre-line">
            {updateMessage}
          </p>
        </div>
      )}

      {/* Last Update Time */}
      {lastUpdateTime && (
        <div className="text-center apple-caption">
          {formatUpdateTime(lastUpdateTime)}
        </div>
      )}
    </div>
  );
} 