'use client';

import { useState, useEffect } from 'react';
import { Avatar } from './Avatar';
import { Trophy, Crown, Medal, Award, Users, Sparkles, TrendingUp, Star, Info, Calendar, UserCheck } from 'lucide-react';
import { CollapsibleSection } from './CollapsibleSection';

interface LeaderboardUser {
  id: string;
  name: string;
  username: string;
  image: string;
  aiScore: number;
  xogsBalance: number;
  followersCount: number;
  verified: boolean;
  rank: number;
  twitterCreatedAt?: string;
}

type LeaderboardType = 'xogs' | 'twitter_age' | 'followers';

interface CurrentUserData {
  rank: number;
  xogsBalance: number;
}

export function Leaderboard() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const [currentUserBalance, setCurrentUserBalance] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<LeaderboardType>('xogs');

  useEffect(() => {
    fetchLeaderboard();
  }, [activeTab]);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/leaderboard?type=${activeTab}`);
      const data = await response.json();
      setUsers(data.users || []);
      setCurrentUserRank(data.currentUserRank || null);
      
      // If current user ranking exists, get current user's XOGS balance (only for XOGS tab)
      if (data.currentUserRank && activeTab === 'xogs') {
        const userResponse = await fetch('/api/user');
        const userData = await userResponse.json();
        setCurrentUserBalance(userData.xogsBalance || 0);
      } else {
        setCurrentUserBalance(null);
      }
    } catch (error) {
      console.error('Failed to get leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTabConfig = (type: LeaderboardType) => {
    switch (type) {
      case 'twitter_age':
        return {
          title: 'Twitter Registration Time Leaderboard',
          subtitle: 'Ranked by Twitter account registration time (earliest first)',
          icon: <Calendar className="w-8 h-8 text-white" />,
          gradient: 'from-blue-500 via-cyan-500 to-teal-500',
          bgGradient: 'from-blue-600 to-cyan-600',
          description: 'Earlier Twitter registration indicates deeper platform seniority',
        };
      case 'followers':
        return {
          title: 'Followers Count Leaderboard',
          subtitle: 'Ranked by Twitter followers count (highest to lowest)',
          icon: <UserCheck className="w-8 h-8 text-white" />,
          gradient: 'from-pink-500 via-red-500 to-orange-500',
          bgGradient: 'from-pink-600 to-red-600',
          description: 'Followers count reflects user influence and popularity on Twitter',
        };
      default:
        return {
          title: '$XOGS Balance Leaderboard',
          subtitle: 'User ranking based on $XOGS token balance',
          icon: <Trophy className="w-8 h-8 text-white" />,
          gradient: 'from-purple-500 via-pink-500 to-red-500',
          bgGradient: 'from-purple-600 to-pink-600',
          description: '$XOGS balance based on multi-dimensional evaluation including follower count, interaction quality, content value, etc.',
        };
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-500" />;
      case 3:
        return <Award className="w-5 h-5 text-orange-500" />;
      default:
        return <span className="text-lg font-bold">#{rank}</span>;
    }
  };

  const getRankBadgeStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg shadow-yellow-500/25';
      case 2:
        return 'bg-gradient-to-br from-gray-400 to-gray-600 text-white shadow-lg shadow-gray-500/25';
      case 3:
        return 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-500/25';
      default:
        return 'bg-white text-gray-700 border-2 border-gray-200';
    }
  };

  const getCardStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 border-2 border-yellow-200 shadow-xl shadow-yellow-500/10';
      case 2:
        return 'bg-gradient-to-r from-gray-50 via-slate-50 to-gray-50 border-2 border-gray-200 shadow-xl shadow-gray-500/10';
      case 3:
        return 'bg-gradient-to-r from-orange-50 via-red-50 to-pink-50 border-2 border-orange-200 shadow-xl shadow-orange-500/10';
      default:
        return 'bg-white/90 backdrop-blur-xl border border-gray-100 shadow-lg hover:shadow-xl';
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-6">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 text-center p-8">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="space-y-2">
            <div className="w-24 h-3 bg-gray-200 rounded-full animate-pulse mx-auto"></div>
            <div className="w-20 h-3 bg-gray-200 rounded-full animate-pulse mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  const currentConfig = getTabConfig(activeTab);

  return (
    <div className="w-full max-w-md mx-auto px-4 py-6 space-y-8">
      {/* Beautiful title area */}
      <div className="text-center mb-8">
        <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${currentConfig.gradient} rounded-full shadow-lg mb-4 animate-pulse`}>
          {currentConfig.icon}
        </div>
        <h1 className={`text-3xl font-bold bg-gradient-to-r ${currentConfig.bgGradient} bg-clip-text text-transparent mb-2`}>
          {currentConfig.title}
        </h1>
        <p className="text-gray-600 mb-4">{currentConfig.subtitle}</p>
        
        {/* Tab Selection */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-2 border border-gray-100 shadow-lg mb-4">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('xogs')}
              className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeTab === 'xogs'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
              }`}
            >
              <Trophy className="w-4 h-4 mx-auto mb-1" />
              $XOGS Rank
            </button>
            <button
              onClick={() => setActiveTab('twitter_age')}
              className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeTab === 'twitter_age'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <Calendar className="w-4 h-4 mx-auto mb-1" />
              Registration
            </button>
            <button
              onClick={() => setActiveTab('followers')}
              className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeTab === 'followers'
                  ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
              }`}
            >
              <UserCheck className="w-4 h-4 mx-auto mb-1" />
              Followers
            </button>
          </div>
        </div>
        
        {/* Top 50 reward notice - only show for XOGS tab */}
        {activeTab === 'xogs' && (
          <div className="bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 rounded-2xl p-4 border border-yellow-200 shadow-lg">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-6 h-6 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                <Star className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-orange-700">Special Reward</span>
            </div>
            <p className="text-sm text-orange-800 leading-relaxed">
              <strong>Top 50 users on the leaderboard will receive additional $XOGS token rewards!</strong>
            </p>
          </div>
        )}
      </div>

              {/* Current user ranking card */}
      {currentUserRank && (
        <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-3xl p-6 border-2 border-indigo-100 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/10 to-pink-400/10"></div>
          <div className="relative z-10 text-center">
            <div className="flex items-center justify-center mb-3">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full shadow-lg mr-3">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-sm font-medium text-indigo-700">Your Ranking</div>
                <div className="text-2xl font-bold text-indigo-900">#{currentUserRank}</div>
              </div>
            </div>
            
            {currentUserBalance && (
              <div className="flex items-center justify-center space-x-2 mb-3">
                <Star className="w-5 h-5 text-purple-600" />
                <span className="text-lg font-semibold text-purple-700">
                  $XOGS Balance: {currentUserBalance}
                </span>
              </div>
            )}
            
            <p className="text-indigo-600 text-sm">
              {currentUserRank <= 10 ? '🎉 You are in the top 10!' : 'Keep working hard to improve your influence!'}
            </p>
          </div>
        </div>
      )}

              {/* Leaderboard list */}
      <div className="space-y-4">
        {users.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 text-center py-12 px-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Trophy className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No ranking data available</h3>
            <p className="text-gray-600">Leaderboard is being calculated, please check back later</p>
          </div>
        ) : (
          users.map((user, index) => (
            <div
              key={user.id}
              className={`rounded-2xl p-4 transition-all duration-300 transform hover:scale-[1.02] animate-in slide-in-from-bottom-5 ${getCardStyle(user.rank)}`}
              style={{animationDelay: `${index * 100}ms`}}
            >
              <div className="flex items-center space-x-3">
                {/* Rank Badge */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${getRankBadgeStyle(user.rank)}`}>
                  {user.rank <= 3 ? getRankIcon(user.rank) : `#${user.rank}`}
                </div>

                {/* Avatar */}
                <div className="relative">
                <Avatar
                  src={user.image}
                  name={user.name}
                    size="md"
                />
                  {user.rank <= 3 && (
                    <div className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Sparkles className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </div>

                {/* User Information */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <a
                      href={`https://x.com/${user.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-gray-900 text-base hover:text-blue-600 transition-colors duration-200 cursor-pointer"
                    >
                      {user.name}
                    </a>
                    {user.verified && (
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <a
                    href={`https://x.com/${user.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200 cursor-pointer inline-block mb-1"
                  >
                    @{user.username}
                  </a>
                  {/* Only show follower count in user info if not on followers leaderboard */}
                  {activeTab !== 'followers' && (
                    <div className="flex items-center text-xs text-gray-500">
                      <Users className="w-3 h-3 mr-1" />
                      {user.followersCount?.toLocaleString() || 0} Followers
                    </div>
                  )}
                </div>

                {/* Main Info - Right aligned */}
                <div className="text-right flex-shrink-0">
                  {activeTab === 'xogs' && (
                    <>
                      <div className={`text-xl font-bold mb-1 ${
                        user.rank === 1 ? 'text-yellow-600' :
                        user.rank === 2 ? 'text-gray-600' :
                        user.rank === 3 ? 'text-orange-600' :
                        'text-indigo-600'
                      }`}>
                        {user.xogsBalance?.toLocaleString() || 0}
                      </div>
                      <div className="text-xs text-gray-500">$XOGS</div>
                    </>
                  )}
                  
                  {activeTab === 'twitter_age' && (
                    <>
                      <div className={`text-sm font-bold mb-1 ${
                        user.rank === 1 ? 'text-yellow-600' :
                        user.rank === 2 ? 'text-gray-600' :
                        user.rank === 3 ? 'text-orange-600' :
                        'text-blue-600'
                      }`}>
                        {user.twitterCreatedAt 
                          ? new Date(user.twitterCreatedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit'
                            })
                          : 'Unknown'
                        }
                      </div>
                      <div className="text-xs text-gray-500">Registration</div>
                    </>
                  )}
                  
                  {activeTab === 'followers' && (
                    <>
                      <div className={`text-xl font-bold mb-1 ${
                        user.rank === 1 ? 'text-yellow-600' :
                        user.rank === 2 ? 'text-gray-600' :
                        user.rank === 3 ? 'text-orange-600' :
                        'text-pink-600'
                      }`}>
                        {user.followersCount?.toLocaleString() || 0}
                      </div>
                      <div className="text-xs text-gray-500">Followers</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Ranking Description - Collapsible */}
      <CollapsibleSection
        title="Ranking Description"
        subtitle="Learn about leaderboard rules and scoring system - click to view details"
        icon={<Info className="h-6 w-6 text-white" />}
        variant="info"
      >
        <ul className="space-y-3">
          {activeTab === 'xogs' && [
            '$XOGS balance is based on multi-dimensional evaluation including follower count, interaction quality, content value, etc.',
            'Leaderboard updates every hour with real-time data changes',
            'Consistent activity and high-quality content help improve ranking',
            'Top 50 users will receive additional $XOGS token rewards as special incentives',
            'Top 3 users will receive special badges and premium rewards'
          ].map((item, index) => (
            <li key={index} className="flex items-start space-x-3 text-sm text-indigo-700">
              <div className="w-6 h-6 bg-indigo-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-indigo-700 text-xs font-bold">{index + 1}</span>
              </div>
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
          
          {activeTab === 'twitter_age' && [
            'Twitter registration time leaderboard ranks users by account creation date, with earliest registrations first',
            'Earlier registration indicates deeper seniority and experience on the Twitter platform',
            'This leaderboard showcases early adopters and veteran users of the platform',
            'Registration time cannot be changed and represents a fixed historical record',
            'Early users often make significant contributions to platform development'
          ].map((item, index) => (
            <li key={index} className="flex items-start space-x-3 text-sm text-blue-700">
              <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-700 text-xs font-bold">{index + 1}</span>
              </div>
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
          
          {activeTab === 'followers' && [
            'Followers count leaderboard ranks users by Twitter followers from highest to lowest',
            'Follower count reflects user influence and popularity on the Twitter platform',
            'High follower counts typically indicate stronger content distribution capabilities',
            'Follower counts change in real-time and rankings adjust accordingly',
            'Quality content and active engagement help attract more followers'
          ].map((item, index) => (
            <li key={index} className="flex items-start space-x-3 text-sm text-pink-700">
              <div className="w-6 h-6 bg-pink-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-pink-700 text-xs font-bold">{index + 1}</span>
              </div>
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </CollapsibleSection>
    </div>
  );
} 