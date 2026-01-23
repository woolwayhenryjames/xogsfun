'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Sparkles, Send, RefreshCw, MessageSquare, Zap, Edit3, ExternalLink, Wand2, Bot, Trophy, Clock, CheckCircle, AlertCircle, XCircle, Copy, Heart, Repeat2, Eye, TrendingUp, Stars, Palette, Lightbulb, Target, Rocket, Users, Award, BarChart3, Activity, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { BottomNavigation } from '../../components/BottomNavigation';
import { UserDropdown } from '../../components/UserDropdown';
import { TwitterSignInButton } from '../../components/TwitterSignInButton';
import { XLogoMinimal } from '../../components/XLogo';
import { TwitterFooterLink } from '../../components/TwitterFooterLink';
import { CollapsibleSection } from '../../components/CollapsibleSection';

interface TweetRecord {
  id: string;
  content: string;
  tweetId: string | null;
  tweetUrl: string | null;
  sponsor: string;
  status: string;
  createdAt: string;
  publishedAt: string | null;
  errorMessage: string | null;
}

interface TweetTemplate {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  color: string;
}

export default function InfofiPage() {
  const { data: session, status } = useSession();
  const [generatedTweet, setGeneratedTweet] = useState('');
  const [editedTweet, setEditedTweet] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [tweetHistory, setTweetHistory] = useState<TweetRecord[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'generate' | 'history' | 'analytics'>('generate');
  const [partners, setPartners] = useState<Array<{ id: string, name: string, description: string }>>([]);
  const [tweetStats, setTweetStats] = useState({
    totalTweets: 0,
    successfulTweets: 0,
    failedTweets: 0,
    favoriteSponsors: [] as string[]
  });
  const [twitterTokenStatus, setTwitterTokenStatus] = useState<{
    hasAccessToken: boolean;
    tokenExpired: boolean;
    canTweet: boolean;
    needsReconnect: boolean;
  } | null>(null);
  const [accessCheck, setAccessCheck] = useState<{
    isChecking: boolean;
    hasAccess: boolean;
    userRank: number | null;
    currentScore: number;
    message: string;
  }>({
    isChecking: true,
    hasAccess: false,
    userRank: null,
    currentScore: 0,
    message: ''
  });
  const [dailyStatus, setDailyStatus] = useState<{
    hasUsedThisMonth: boolean;
    canUseThisMonth: boolean;
    expectedReward: number;
    daysUntilReset: number;
    monthlyTweet: any | null;
    userAiScore: number;
    resetType: string;
  } | null>(null);
  const [generationStatus, setGenerationStatus] = useState<{
    usedGenerations: number;
    maxGenerations: number;
    remainingGenerations: number;
    canGenerate: boolean;
    usedPublications: number;
    maxPublications: number;
    remainingPublications: number;
    canPublish: boolean;
    hoursUntilReset: number;
    daysUntilReset: number;
    todayStats: {
      generated: number;
      maxGenerations: number;
    };
    monthlyStats: {
      published: number;
      maxPublications: number;
    };
  } | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);

  // 推文模板
  const tweetTemplates: TweetTemplate[] = [
    {
      id: 'promotional',
      title: '🚀 Promotional',
      description: 'Highlight key features and benefits',
      icon: '🎯',
      category: 'marketing',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'educational',
      title: '📚 Educational',
      description: 'Explain technology and concepts',
      icon: '💡',
      category: 'education',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'community',
      title: '👥 Community',
      description: 'Build community engagement',
      icon: '🤝',
      category: 'social',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'news',
      title: '📰 News & Updates',
      description: 'Share latest developments',
      icon: '⚡',
      category: 'news',
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'question',
      title: '❓ Interactive',
      description: 'Ask questions and polls',
      icon: '🗳️',
      category: 'engagement',
      color: 'from-indigo-500 to-purple-500'
    }
  ];

  // 检查用户是否已登录
  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user) {
      redirect('/');
    }
  }, [session, status]);

  // 检查InfoFi访问权限
  useEffect(() => {
    const checkAccess = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch('/api/user/check-infofi-access');
          const data = await response.json();

          setAccessCheck({
            isChecking: false,
            hasAccess: data.hasAccess,
            userRank: data.userRank,
            currentScore: data.currentScore,
            message: data.message
          });

          // 如果没有权限，3秒后跳转到首页
          if (!data.hasAccess) {
            setTimeout(() => {
              redirect('/');
            }, 3000);
          }
        } catch (error) {
          console.error('Error checking access:', error);
          setAccessCheck({
            isChecking: false,
            hasAccess: false,
            userRank: null,
            currentScore: 0,
            message: 'Error checking access permissions'
          });
        }
      }
    };

    if (session?.user) {
      checkAccess();
    }
  }, [session?.user]);

  // 获取合作方列表
  const fetchPartners = async (showToast = false) => {
    try {
      const response = await fetch('/api/partners', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPartners(data.partners || []);
      // 如果有合作方且当前没有选中，默认选择第一个
      if (data.partners && data.partners.length > 0 && !selectedSponsor) {
        setSelectedSponsor(data.partners[0].name);
      }
      // 显示刷新成功消息
      if (showToast) {
        toast.success(`🔄 Partners refreshed! Found ${data.partners?.length || 0} partners`, {
          style: {
            borderRadius: '12px',
            background: '#059669',
            color: '#fff',
          },
        });
      }
    } catch (error) {
      console.error('Error fetching partners:', error);
      // 如果获取失败，使用默认值
      const defaultPartners = [
        { id: '1', name: 'UXUY', description: '🚀 UXUY - Gas-free Trading Platform' },
        { id: '2', name: 'XOGS', description: '💎 XOGS - CryptoTwitter AI Scoring' }
      ];
      setPartners(defaultPartners);
      if (!selectedSponsor) {
        setSelectedSponsor('UXUY');
      }
      if (showToast) {
        toast.error('Failed to refresh partners, using defaults', {
          style: {
            borderRadius: '12px',
            background: '#dc2626',
            color: '#fff',
          },
        });
      }
    }
  };

  // 页面加载时获取推文历史、统计数据和每日状态
  useEffect(() => {
    fetchPartners();
    fetchTweetHistory();
    checkTwitterTokenStatus();
    fetchDailyStatus();
    fetchGenerationStatus();

    // 检查是否刚从重连返回
    if (typeof window !== 'undefined') {
      const returnUrl = localStorage.getItem('authReturnUrl');
      if (returnUrl === '/infofi') {
        localStorage.removeItem('authReturnUrl');
        // 显示重连成功消息
        setTimeout(() => {
          toast.success('Twitter reconnected successfully!', {
            style: {
              borderRadius: '12px',
              background: '#10b981',
              color: '#fff',
            }
          });
          // 重新检查token状态
          checkTwitterTokenStatus();
        }, 1000);
      }
    }
  }, []);

  // 监听页面焦点事件，当用户回到页面时刷新合作伙伴数据
  useEffect(() => {
    const handleFocus = () => {
      // 页面获得焦点时重新获取合作伙伴数据
      fetchPartners();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // 检查session变化（用户登录/重连后）
  useEffect(() => {
    if (session?.user && status === 'authenticated') {
      checkTwitterTokenStatus();
    }
  }, [session, status]);

  // 获取每日使用状态
  const fetchDailyStatus = async () => {
    try {
      const response = await fetch('/api/infofi/daily-status');
      if (response.ok) {
        const data = await response.json();
        setDailyStatus(data);
      }
    } catch (error) {
      console.error('Error fetching daily status:', error);
    }
  };

  // 获取生成状态
  const fetchGenerationStatus = async () => {
    try {
      const response = await fetch('/api/infofi/generation-status');
      if (response.ok) {
        const data = await response.json();
        setGenerationStatus(data);
      }
    } catch (error) {
      console.error('Error fetching generation status:', error);
    }
  };

  // 处理Twitter重连
  const handleTwitterReconnect = async () => {
    try {
      setIsReconnecting(true);

      toast.loading('Redirecting to Twitter authentication...', {
        id: 'reconnect-toast',
        duration: 3000,
        style: {
          borderRadius: '12px',
          background: '#1da1f2',
          color: '#fff',
        }
      });

      // 在localStorage中存储返回URL
      if (typeof window !== 'undefined') {
        localStorage.setItem('authReturnUrl', '/infofi');
      }

      // 启动Twitter重新认证
      await signIn('twitter', {
        callbackUrl: `${window.location.origin}/infofi`,
        redirect: true
      });

    } catch (error) {
      console.error('Error during Twitter reconnection:', error);
      toast.error('Failed to initiate Twitter authentication', {
        style: {
          borderRadius: '12px',
          background: '#dc2626',
          color: '#fff',
        }
      });
    } finally {
      setIsReconnecting(false);
    }
  };

  // 检查Twitter token状态
  const checkTwitterTokenStatus = async () => {
    try {
      const response = await fetch('/api/twitter-status');
      if (response.ok) {
        const data = await response.json();
        setTwitterTokenStatus(data.twitterToken);
      }
    } catch (error) {
      console.error('Error checking Twitter token status:', error);
    }
  };

  // 计算统计数据
  useEffect(() => {
    if (tweetHistory.length > 0) {
      const stats = {
        totalTweets: tweetHistory.length,
        successfulTweets: tweetHistory.filter(t => t.status === 'published').length,
        failedTweets: tweetHistory.filter(t => t.status === 'failed').length,
        favoriteSponsors: [...new Set(tweetHistory.map(t => t.sponsor))]
      };
      setTweetStats(stats);
    }
  }, [tweetHistory]);

  const fetchTweetHistory = async () => {
    try {
      const response = await fetch('/api/infofi/tweets');
      if (response.ok) {
        const tweets = await response.json();
        setTweetHistory(tweets);
      }
    } catch (error) {
      console.error('Error fetching tweet history:', error);
    }
  };

  const generateTweet = async () => {
    if (!selectedSponsor) {
      toast.error('Please select a sponsor first');
      return;
    }

    // 用户可以不选择提示词或风格，也能直接生成文案
    // 移除强制选择验证，允许使用默认设置生成

    // 检查token状态
    if (twitterTokenStatus?.needsReconnect) {
      toast.error('Twitter access token expired. Please reconnect your account.');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/infofi/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sponsor: selectedSponsor,
          template: selectedTemplate || null,
          customPrompt: customPrompt.trim() || null
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setGeneratedTweet(data.content);
        setEditedTweet(data.content);
        setIsEditing(false);
        setShowPreview(true);

        // 显示生成成功信息，包含剩余次数
        toast.success(`🤖 AI tweet generated! ${data.remainingGenerations} generations left today`, {
          icon: '✨',
          style: {
            borderRadius: '12px',
            background: '#10b981',
            color: '#fff',
          },
        });

        // 刷新生成状态
        fetchGenerationStatus();
      } else {
        // 处理生成限制错误
        if (data.generationLimitReached) {
          toast.error(`Daily generation limit reached (${data.maxGenerations}/day)! Try again in ${data.hoursUntilReset} hours.`, {
            duration: 6000,
            style: {
              borderRadius: '12px',
              background: '#dc2626',
              color: '#fff',
            }
          });
        } else {
          toast.error(data.error || 'Failed to generate tweet');
        }
      }
    } catch (error) {
      console.error('Error generating tweet:', error);
      toast.error('Network error while generating tweet');
    } finally {
      setIsGenerating(false);
    }
  };

  const publishTweet = async () => {
    const contentToPublish = isEditing ? editedTweet : generatedTweet;

    if (!contentToPublish.trim()) {
      toast.error('Please generate or edit tweet content first');
      return;
    }

    if (contentToPublish.length > 280) {
      toast.error('Tweet content exceeds 280 characters limit');
      return;
    }

    // 检查token状态
    if (twitterTokenStatus?.needsReconnect) {
      toast.error('Twitter access token expired. Please reconnect your account.');
      return;
    }

    setIsPublishing(true);
    try {
      const response = await fetch('/api/infofi/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: contentToPublish,
          sponsor: selectedSponsor
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Show success message with reward info
        if (data.reward?.amount > 0) {
          toast.success(`🚀 Tweet published! Earned ${data.reward.amount} $XOGS!`, {
            icon: '🎉',
            style: {
              borderRadius: '12px',
              background: '#3b82f6',
              color: '#fff',
            },
            duration: 6000,
          });

          setTimeout(() => {
            toast.success(`💰 Reward: ${data.reward.calculation}`, {
              duration: 5000,
              style: {
                borderRadius: '12px',
                background: '#059669',
                color: '#fff',
              }
            });
          }, 1500);
        } else {
          toast.success('🚀 Tweet published successfully!', {
            icon: '🎉',
            style: {
              borderRadius: '12px',
              background: '#3b82f6',
              color: '#fff',
            },
            duration: 4000,
          });
        }

        if (data.tweetUrl) {
          setTimeout(() => {
            toast.success('🔗 Tweet published! Click to view', {
              duration: 5000,
              style: {
                borderRadius: '12px',
                background: '#059669',
                color: '#fff',
                cursor: 'pointer'
              }
            });
          }, 2500);
        }

        setGeneratedTweet('');
        setEditedTweet('');
        setIsEditing(false);
        setShowPreview(false);
        fetchTweetHistory(); // 刷新历史记录
        fetchDailyStatus(); // 刷新每日状态
        fetchGenerationStatus(); // 刷新生成状态
      } else {
        // Handle monthly limit reached
        if (data.monthlyLimitReached) {
          toast.error(`Monthly limit reached! Try again in ${data.daysUntilReset} days.`, {
            duration: 6000,
            style: {
              borderRadius: '12px',
              background: '#dc2626',
              color: '#fff',
            }
          });
        } else if (data.error?.includes('access token expired')) {
          checkTwitterTokenStatus();
          toast.error(data.error || 'Failed to publish tweet');
        } else {
          toast.error(data.error || 'Failed to publish tweet');
        }
      }
    } catch (error) {
      console.error('Error publishing tweet:', error);
      toast.error('Network error while publishing tweet');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleEditToggle = () => {
    if (!isEditing) {
      setEditedTweet(generatedTweet);
    }
    setIsEditing(!isEditing);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('📋 Copied to clipboard!', {
      style: {
        borderRadius: '12px',
        background: '#6366f1',
        color: '#fff',
      },
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="h-3 w-3" />;
      case 'failed':
        return <XCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (status === 'loading' || accessCheck.isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 relative mx-auto mb-8">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 animate-spin opacity-20"></div>
            <div className="absolute inset-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 animate-pulse flex items-center justify-center shadow-2xl">
              <Bot className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-xl font-bold text-gray-800">
              {accessCheck.isChecking ? 'Checking Access' : 'Loading INFOFI'}
            </p>
            <p className="text-gray-600">
              {accessCheck.isChecking ? 'Verifying permissions...' : 'AI Tweet Studio'}
            </p>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 如果没有访问权限，显示权限不足页面
  if (!accessCheck.hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <div className="max-w-md mx-auto px-6 text-center">
          <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-2xl">
            <Trophy className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            InfoFi Elite Only
          </h1>
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-gray-100/50 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-gray-900">InfoFi Elite</h3>
                <p className="text-sm text-gray-600">AI Tweet Studio for Top 1000 Users</p>
              </div>
            </div>
            <div className="space-y-3 text-sm text-gray-700">
              <p><strong>Access Requirement:</strong> Top 1000 AI Score Ranking</p>
              <p><strong>Your Current Rank:</strong> #{accessCheck.userRank || 'N/A'}</p>
              <p><strong>Your AI Score:</strong> {accessCheck.currentScore || 0}</p>
              <p><strong>Required Rank:</strong> ≤ 1000</p>
              <p className="text-gray-600">{accessCheck.message}</p>
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-gray-600">
              InfoFi Elite is exclusively available to our top 1000 users by AI Score. Improve your score to gain access!
            </p>
            <div className="flex gap-3">
              <a
                href="/ai-score"
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
              >
                Check AI Score
              </a>
              <a
                href="/"
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-200"
              >
                Back to Home
              </a>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-6">
            Redirecting to home page in 3 seconds...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 apple-fade-in pb-32">
      {/* Enhanced top navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100/50 shadow-lg">
        <div className="max-w-md mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">INFOFI ELITE</span>
                <p className="text-xs text-gray-500 font-medium">AI Tweet Studio • Top 1000 Only</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {session?.user ? (
                <UserDropdown />
              ) : (
                <TwitterSignInButton className="px-4 py-2 text-sm" />
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-md mx-auto px-6 py-8 space-y-8">
        {/* Enhanced Hero Section */}
        <div className="text-center apple-slide-up">
          <div className="relative mb-8">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 flex items-center justify-center apple-float shadow-2xl">
              <Bot className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center animate-bounce shadow-lg">
              <Stars className="w-4 h-4 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            InfoFi Elite Studio
          </h1>
          <p className="text-gray-600 leading-relaxed text-lg">
            Generate <span className="font-semibold text-purple-600">unlimited viral tweets</span> with advanced AI
          </p>
          {accessCheck.userRank && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-100 to-purple-100 border border-yellow-200 rounded-full">
              <Trophy className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-bold text-purple-800">
                Elite User • Rank #{accessCheck.userRank} • Monthly Publication
              </span>
              <Sparkles className="w-4 h-4 text-purple-600" />
            </div>
          )}
        </div>

        {/* Enhanced Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/50 p-1">
          <div className="flex rounded-xl bg-gray-50/50">
            {[
              { key: 'generate', label: 'Generate', icon: Wand2 },
              { key: 'history', label: 'History', icon: MessageSquare },
              { key: 'analytics', label: 'Analytics', icon: BarChart3 },
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex-1 flex items-center justify-center py-3 px-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${activeTab === tab.key
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-white/60'
                    }`}
                >
                  <IconComponent className={`w-4 h-4 mr-2 ${activeTab === tab.key ? 'animate-pulse' : ''}`} />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Generate Tab */}
        {activeTab === 'generate' && (
          <div className="space-y-6">
            {/* Daily Usage Status Card */}
            {generationStatus && (
              <div className="rounded-3xl shadow-xl border p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mr-4 shadow-lg bg-gradient-to-r from-blue-500 to-purple-600">
                      <Activity className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Daily Usage Status</h3>
                      <p className="text-sm text-gray-600">
                        Generation & Publication Limits
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {generationStatus.remainingGenerations}/{generationStatus.maxGenerations}
                    </div>
                    <div className="text-xs text-gray-500 font-medium">Gen Left</div>
                  </div>
                </div>

                {/* 分离的生成和发布状态 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className={`rounded-2xl p-4 border-2 ${generationStatus.canGenerate
                      ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200'
                      : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'
                    }`}>
                    <div className="flex items-center justify-between mb-2">
                      <Sparkles className={`h-5 w-5 ${generationStatus.canGenerate ? 'text-emerald-600' : 'text-gray-400'}`} />
                      <span className={`text-lg font-bold ${generationStatus.canGenerate ? 'text-emerald-600' : 'text-gray-400'}`}>
                        {generationStatus.remainingGenerations}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-gray-700">AI Generation</div>
                    <div className="text-xs text-gray-500">
                      {generationStatus.usedGenerations}/{generationStatus.maxGenerations} used
                    </div>
                  </div>

                  <div className={`rounded-2xl p-4 border-2 ${generationStatus.canPublish
                      ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200'
                      : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'
                    }`}>
                    <div className="flex items-center justify-between mb-2">
                      <Send className={`h-5 w-5 ${generationStatus.canPublish ? 'text-blue-600' : 'text-gray-400'}`} />
                      <span className={`text-lg font-bold ${generationStatus.canPublish ? 'text-blue-600' : 'text-gray-400'}`}>
                        {generationStatus.remainingPublications}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-gray-700">Publication</div>
                    <div className="text-xs text-gray-500">
                      {generationStatus.usedPublications}/{generationStatus.maxPublications} used
                    </div>
                  </div>
                </div>
              </div>
            )}

            {dailyStatus?.canUseThisMonth ? (
              <div className="bg-white/80 rounded-2xl p-4 border border-emerald-200/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Expected Reward</p>
                    <p className="text-xs text-gray-500">AI Score × 5 multiplier</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-600">
                      {dailyStatus?.expectedReward} <span className="text-sm font-medium text-gray-500">$XOGS</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {dailyStatus?.userAiScore} × 5 = {dailyStatus?.expectedReward}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/80 rounded-2xl p-4 border border-orange-200/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Next Available</p>
                    <p className="text-xs text-gray-500">Monthly limit resets on 1st day of next month</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-orange-600">
                      {dailyStatus?.daysUntilReset || 0}天
                    </div>
                    <div className="text-xs text-gray-500">Until reset</div>
                  </div>
                </div>
                {dailyStatus?.monthlyTweet && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-600 mb-2">This month's reward earned:</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-600">
                        +{dailyStatus?.monthlyTweet.rewardEarned} $XOGS
                      </span>
                      {dailyStatus?.monthlyTweet.tweetUrl && (
                        <a
                          href={dailyStatus?.monthlyTweet.tweetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View Tweet
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Enhanced Sponsor Selection */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mr-4 shadow-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Select Partner</h3>
                <p className="text-sm text-gray-600">Choose your collaboration partner</p>
              </div>
            </div>
            <button
              onClick={() => fetchPartners(true)}
              className="p-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
              title="Refresh partners"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
          <div className="relative">
            <select
              value={selectedSponsor}
              onChange={(e) => setSelectedSponsor(e.target.value)}
              className="w-full p-4 border-2 border-blue-200 rounded-2xl bg-white/80 text-gray-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all duration-200 font-medium appearance-none text-lg shadow-sm"
            >
              {partners.length > 0 ? (
                partners.map((partner) => (
                  <option key={partner.id} value={partner.name}>
                    {partner.name}
                  </option>
                ))
              ) : (
                <>
                  <option value="UXUY">UXUY</option>
                  <option value="XOGS">XOGS</option>
                </>
              )}
            </select>
            <div className="absolute right-16 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <div className="w-3 h-3 border-r-2 border-b-2 border-blue-600 transform rotate-45"></div>
            </div>
          </div>
        </div>

        {/* Tweet Style Selection - 折叠卡片形式 */}
        <CollapsibleSection
          title="Tweet Style"
          subtitle={selectedTemplate
            ? `Selected: ${tweetTemplates.find(t => t.id === selectedTemplate)?.title || 'None'}`
            : "Choose your content style"
          }
          icon={<Palette className="h-6 w-6 text-white" />}
          defaultOpen={false}
          variant="info"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {tweetTemplates.map((template) => (
                <label
                  key={template.id}
                  className={`group flex items-center p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer transform hover:scale-[1.02] hover:shadow-lg ${selectedTemplate === template.id
                      ? 'border-purple-500 bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 shadow-lg'
                      : 'border-gray-200 bg-white/80 hover:border-purple-300 hover:bg-purple-50/50'
                    }`}
                >
                  <input
                    type="radio"
                    name="tweetStyle"
                    value={template.id}
                    checked={selectedTemplate === template.id}
                    onChange={(e) => {
                      setSelectedTemplate(e.target.value);
                      setCustomPrompt(''); // 清空自定义提示词
                    }}
                    className="mr-4 h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300"
                  />
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-3xl">{template.icon}</div>
                    <div className="flex-1">
                      <div className="text-lg font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                        {template.title}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">{template.description}</div>
                    </div>
                    {selectedTemplate === template.id && (
                      <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
        </CollapsibleSection>

        {/* Custom Prompt - 折叠卡片形式 */}
        <CollapsibleSection
          title="Custom Prompt"
          subtitle={customPrompt.trim()
            ? `Custom: ${customPrompt.slice(0, 50)}${customPrompt.length > 50 ? '...' : ''}`
            : "Write your own creative instructions"
          }
          icon={<Lightbulb className="h-6 w-6 text-white" />}
          defaultOpen={false}
          variant="success"
        >
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-6 border border-indigo-200/50 shadow-inner">
              <textarea
                value={customPrompt}
                onChange={(e) => {
                  setCustomPrompt(e.target.value);
                  if (e.target.value.trim()) {
                    setSelectedTemplate(''); // 清空模板选择
                  }
                }}
                rows={4}
                placeholder="Write a tweet about the latest AI breakthroughs, make it concise and engaging, include technical details but not too complex..."
                className="w-full p-4 border-2 border-indigo-200 rounded-xl text-sm text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/90 placeholder-gray-400 resize-none transition-all duration-200"
              />
              <div className="flex items-center justify-between mt-4">
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <span className={`inline-block w-2 h-2 rounded-full ${customPrompt.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                  {customPrompt.length > 0 ? `${customPrompt.length} characters` : 'Enter your custom instructions in English'}
                </div>
                {customPrompt.length > 0 && (
                  <button
                    onClick={() => setCustomPrompt('')}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium px-3 py-1 rounded-full bg-white/80 hover:bg-white transition-all duration-200"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Twitter Token Status Warning */}
        {twitterTokenStatus?.needsReconnect && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <WifiOff className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-red-800">
                  Twitter Connection Required
                </h3>
                <p className="text-xs text-red-600 mt-1">
                  Your Twitter access token has expired. Please reconnect to publish tweets.
                </p>
              </div>
              <button
                onClick={handleTwitterReconnect}
                disabled={isReconnecting}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-medium rounded-xl hover:from-red-600 hover:to-orange-600 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 relative z-10"
                style={{ pointerEvents: 'auto' }}
              >
                {isReconnecting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4" />
                    <span>Reconnect</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* AI Generator & Publish Buttons - 移动到Select Partner和Tweet Style之间 */}
        <div className="space-y-6">
          {/* AI Generator */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100/50 p-6">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center mr-4 shadow-lg">
                <Wand2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">AI Generator</h3>
                <p className="text-sm text-gray-600">Powered by Grok-3 AI technology</p>
              </div>
            </div>
            <button
              onClick={generateTweet}
              disabled={isGenerating || twitterTokenStatus?.needsReconnect || (generationStatus ? !generationStatus.canGenerate : false)}
              className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 text-white py-5 rounded-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-lg"
            >
              {isGenerating ? (
                <>
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Creating Magic...</span>
                </>
              ) : generationStatus && !generationStatus.canGenerate ? (
                <>
                  <Clock className="h-6 w-6" />
                  <span>Generation Limit Reached ({generationStatus.maxGenerations}/day)</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-6 w-6" />
                  <span>Generate AI Tweet {generationStatus ? `(${generationStatus.remainingGenerations}/${generationStatus.maxGenerations} left)` : ''}</span>
                </>
              )}
            </button>
          </div>

          {/* Publish Button */}
          {(generatedTweet || editedTweet) && (
            <div className="apple-slide-up">
              <button
                onClick={publishTweet}
                disabled={isPublishing || twitterTokenStatus?.needsReconnect || (generationStatus ? !generationStatus.canPublish : false) || (isEditing ? editedTweet : generatedTweet).length > 260}
                className={`w-full py-5 rounded-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-lg ${(isEditing ? editedTweet : generatedTweet).length > 260
                    ? 'bg-gradient-to-r from-red-400 to-red-500 text-white'
                    : generationStatus && !generationStatus.canPublish
                      ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                      : 'bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 text-white'
                  }`}
              >
                {isPublishing ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Publishing to Twitter...</span>
                  </>
                ) : (isEditing ? editedTweet : generatedTweet).length > 260 ? (
                  <>
                    <AlertTriangle className="h-6 w-6" />
                    <span>Tweet too long ({(isEditing ? editedTweet : generatedTweet).length}/260)</span>
                  </>
                ) : generationStatus && !generationStatus.canPublish ? (
                  <>
                    <Clock className="h-6 w-6" />
                    <span>Daily Limit Reached</span>
                  </>
                ) : (
                  <>
                    <Send className="h-6 w-6" />
                    <span>🚀 Publish & Earn Rewards</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Generated Tweet Preview */}
        {(generatedTweet || editedTweet) && (
          <div className="apple-slide-up">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100/50 p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">AI Assistant</span>
                    <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">Generated content</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-4 border border-gray-200/50">
                <p className="text-gray-800 leading-relaxed font-medium text-base break-words whitespace-pre-wrap">
                  {isEditing ? editedTweet : generatedTweet}
                </p>

                {/* Character count */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200/50">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${(isEditing ? editedTweet : generatedTweet).length <= 260
                        ? 'bg-green-500'
                        : (isEditing ? editedTweet : generatedTweet).length <= 280
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}></div>
                    <span className={`text-sm font-medium ${(isEditing ? editedTweet : generatedTweet).length <= 260
                        ? 'text-green-600'
                        : (isEditing ? editedTweet : generatedTweet).length <= 280
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }`}>
                      {(isEditing ? editedTweet : generatedTweet).length}/280
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(isEditing ? editedTweet : generatedTweet)}
                      className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                      title="Copy to clipboard"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(!isEditing);
                        if (!isEditing) {
                          setEditedTweet(generatedTweet);
                        }
                      }}
                      className="p-2 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 hover:text-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
                      title="Edit tweet"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Mode */}
            {isEditing && (
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100/50 p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                    <Edit3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="font-bold text-gray-900">Edit Your Tweet</span>
                    <p className="text-sm text-gray-500">Customize the generated content</p>
                  </div>
                </div>

                <textarea
                  value={editedTweet}
                  onChange={(e) => setEditedTweet(e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-2xl bg-white/80 text-gray-900 focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none transition-all duration-200 font-medium resize-none"
                  rows={4}
                  placeholder="Edit your tweet..."
                />

                <div className="flex items-center justify-between mt-3">
                  <span className={`text-sm font-medium ${editedTweet.length <= 260
                      ? 'text-green-600'
                      : editedTweet.length <= 280
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}>
                    {editedTweet.length}/280 characters
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setGeneratedTweet(editedTweet); // 保存编辑内容
                        setIsEditing(false);
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-700 font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setGeneratedTweet(editedTweet); // 保存编辑内容
                        setIsEditing(false);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-gray-600 to-gray-700 flex items-center justify-center mr-4 shadow-lg">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Tweet History</h3>
                    <p className="text-sm text-gray-600">Your published content</p>
                  </div>
                </div>
                <button
                  onClick={fetchTweetHistory}
                  className="p-3 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-700 transition-all duration-200 shadow-sm hover:shadow-md"
                  title="Refresh history"
                >
                  <RefreshCw className="h-5 w-5" />
                </button>
              </div>

              {tweetHistory.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
                    <MessageSquare className="h-10 w-10 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium mb-2 text-lg">No tweets published yet</p>
                  <p className="text-gray-400">Generate and publish your first AI tweet!</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {tweetHistory.map((tweet) => (
                    <div key={tweet.id} className="bg-gradient-to-r from-white to-gray-50 rounded-2xl p-5 border border-gray-100 hover:border-gray-200 transition-all duration-200 hover:shadow-md">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-purple-600 bg-purple-100 px-3 py-1 rounded-full border border-purple-200">
                            {tweet.sponsor}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full border font-medium ${getStatusColor(tweet.status)}`}>
                            {getStatusIcon(tweet.status)}
                            {tweet.status}
                          </div>
                          {tweet.tweetUrl && (
                            <a
                              href={tweet.tweetUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                              title="View on Twitter"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-700 mb-4 leading-relaxed font-medium">{tweet.content}</p>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>{formatDate(tweet.createdAt)}</span>
                        <button
                          onClick={() => copyToClipboard(tweet.content)}
                          className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                        >
                          <Copy className="h-3 w-3" />
                          Copy
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100/50 p-6">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center mr-4 shadow-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Analytics</h3>
                  <p className="text-sm text-gray-600">Your tweet performance</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 border border-blue-200/50">
                  <div className="flex items-center justify-between mb-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    <div className="text-2xl font-bold text-blue-600">{tweetStats.totalTweets}</div>
                  </div>
                  <div className="text-sm text-blue-800 font-medium">Total Tweets</div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-200/50">
                  <div className="flex items-center justify-between mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div className="text-2xl font-bold text-green-600">{tweetStats.successfulTweets}</div>
                  </div>
                  <div className="text-sm text-green-800 font-medium">Published</div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200/50">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <div className="text-2xl font-bold text-purple-600">
                      {tweetStats.totalTweets > 0 ? Math.round((tweetStats.successfulTweets / tweetStats.totalTweets) * 100) : 0}%
                    </div>
                  </div>
                  <div className="text-sm text-purple-800 font-medium">Success Rate</div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-4 border border-orange-200/50">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="h-5 w-5 text-orange-600" />
                    <div className="text-2xl font-bold text-orange-600">{tweetStats.favoriteSponsors.length}</div>
                  </div>
                  <div className="text-sm text-orange-800 font-medium">Partners</div>
                </div>
              </div>

              {tweetStats.totalTweets > 0 && (
                <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-4 border border-gray-200/50">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-500" />
                    Performance Insights
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Success Rate</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                            style={{ width: `${tweetStats.totalTweets > 0 ? (tweetStats.successfulTweets / tweetStats.totalTweets) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span className="font-medium text-gray-900">
                          {tweetStats.totalTweets > 0 ? Math.round((tweetStats.successfulTweets / tweetStats.totalTweets) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Active Partners</span>
                      <span className="font-medium text-gray-900">{tweetStats.favoriteSponsors.join(', ')}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Twitter Footer Link */}
        <TwitterFooterLink />
      </div>

      {/* Apple-style fixed bottom navigation */}
      <BottomNavigation />
    </div>
  );
} 