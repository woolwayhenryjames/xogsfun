'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Avatar } from './Avatar';
import { Gift, Share2, Copy, Users, Award, Calendar, Sparkles, BookOpen } from 'lucide-react';
import { useTranslator } from '../lib/i18n';
import { CollapsibleSection } from './CollapsibleSection';

interface ExtendedUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface ExtendedSession {
  user?: ExtendedUser;
}

interface InviteData {
  inviteCode: string;
  inviteLink: string;
  invitesSent: Array<{
    id: string;
    invitee: {
      name: string;
      twitterUsername: string;
      image: string;
    };
    reward: number;
    createdAt: string;
  }>;
  totalReward: number;
  inviteCount: number;
}

export function InviteSystem() {
  const { data: session } = useSession() as { data: ExtendedSession | null };
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'invite' | 'sent'>('invite');
  const [isGenerating, setIsGenerating] = useState(false);
  const { t, isLoading: isTranslatorLoading } = useTranslator();

  useEffect(() => {
    if (session?.user?.id) {
      fetchInviteData();
    }
  }, [session]);

  const fetchInviteData = async () => {
    try {
      const response = await fetch('/api/invite');
      const data = await response.json();
      setInviteData(data);
    } catch (error) {
      console.error('Failed to fetch invite data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateInviteCode = async () => {
    try {
      setIsGenerating(true);
      const response = await fetch('/api/invite/generate', {
        method: 'POST',
      });
      const data = await response.json();

      if (response.ok) {
        setInviteData(prev => prev ? { ...prev, inviteCode: data.inviteCode, inviteLink: data.inviteLink } : null);
        toast.success(t('invite.codeGenerated'));
      } else {
        toast.error(data.error || 'Failed to generate invite code');
      }
    } catch (error) {
      toast.error('Network error, please try again later');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyInviteLink = () => {
    if (inviteData?.inviteLink) {
      navigator.clipboard.writeText(inviteData.inviteLink);
      toast.success(t('invite.linkCopied'));
    }
  };

  const shareInviteLink = () => {
    if (inviteData?.inviteLink) {
      const text = `Join Xogs.Fun and discover your Twitter account value! Register using my invite link: ${inviteData.inviteLink}`;

      // Open Twitter share directly with proper URL encoding
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(inviteData.inviteLink)}`;
      window.open(twitterUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (isLoading || isTranslatorLoading) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-6">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 text-center p-8">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="space-y-2">
            <div className="w-20 h-3 bg-gray-200 rounded-full animate-pulse mx-auto"></div>
            <div className="w-16 h-3 bg-gray-200 rounded-full animate-pulse mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto px-4 py-6 space-y-8">
      {/* Beautiful Welcome Area */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full shadow-lg mb-4 animate-pulse">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
          {t('invite.title')}
        </h1>
        <p className="text-gray-600">{t('invite.subtitle')}</p>
      </div>

      {/* Beautiful Statistics Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="group relative bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-6 h-6 text-blue-100" />
              <div className="w-2 h-2 bg-blue-300 rounded-full animate-ping"></div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{inviteData?.inviteCount || 0}</div>
            <div className="text-blue-100 text-sm">{t('invite.inviteSuccessfully')}</div>
          </div>
        </div>

        <div className="group relative bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-6 h-6 text-emerald-100" />
              <div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse"></div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{inviteData?.totalReward || 0}</div>
            <div className="text-emerald-100 text-sm">{t('invite.earnedPoints')}</div>
          </div>
        </div>
      </div>

      {/* Beautiful Tab Navigation */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 p-2">
        <nav className="flex rounded-xl bg-gray-50/50">
          {[
            { key: 'invite', label: t('common.invite'), icon: Gift },
            { key: 'sent', label: t('invite.inviteRecord'), icon: Share2 },
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 flex flex-col items-center justify-center py-4 px-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${activeTab === tab.key
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-white/60'
                  }`}
              >
                <IconComponent className={`w-5 h-5 mb-2 ${activeTab === tab.key ? 'animate-pulse' : ''}`} />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'invite' && (
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {!inviteData?.inviteCode ? (
            <div className="text-center py-12 px-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full shadow-lg mb-6 animate-bounce">
                <Gift className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('invite.generateCode')}</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                {t('invite.generateDescription')}
              </p>
              <button
                onClick={generateInviteCode}
                disabled={isGenerating}
                className="relative group bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 flex items-center justify-center space-x-2">
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{t('invite.generating')}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>{t('invite.generateButton')}</span>
                    </>
                  )}
                </div>
              </button>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Invite Code Area */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-5 border border-gray-200">
                <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Gift className="w-4 h-4 mr-2 text-indigo-600" />
                  {t('invite.yourInviteCode')}
                </label>
                <div className="flex items-center gap-3 w-full">
                  <input
                    type="text"
                    value={inviteData.inviteCode}
                    readOnly
                    className="flex-1 min-w-0 bg-white border border-gray-300 rounded-xl px-4 py-3 font-mono text-sm font-medium text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(inviteData.inviteCode);
                      toast.success(t('invite.codeCopied'));
                    }}
                    className="flex-shrink-0 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 p-3 rounded-xl transition-colors shadow-sm"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Invite Link Area */}
              <div className="bg-gradient-to-r from-gray-50 to-green-50 rounded-2xl p-5 border border-gray-200">
                <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Share2 className="w-4 h-4 mr-2 text-green-600" />
                  {t('invite.inviteLink')}
                </label>
                <div className="flex items-center gap-3 w-full">
                  <input
                    type="text"
                    value={inviteData.inviteLink}
                    readOnly
                    className="flex-1 min-w-0 bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
                  />
                  <button
                    onClick={copyInviteLink}
                    className="flex-shrink-0 bg-green-100 hover:bg-green-200 text-green-700 p-3 rounded-xl transition-colors shadow-sm"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Share Button Area */}
              <div className="space-y-3">
                <button
                  onClick={shareInviteLink}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 flex items-center justify-center space-x-3">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                    <span>{t('invite.shareToTwitter')}</span>
                  </div>
                </button>
              </div>

              {/* Reward Rules - Collapsible */}
              <CollapsibleSection
                title={t('invite.inviteRules')}
                subtitle="Learn about invitation reward system - click to view details"
                icon={<Award className="h-6 w-6 text-white" />}
                variant="info"
              >
                <ul className="space-y-3">
                  {[
                    t('invite.rule1'),
                    t('invite.rule2'),
                    t('invite.rule3')
                  ].map((rule, index) => (
                    <li key={index} className="flex items-start space-x-3 text-sm text-indigo-700">
                      <div className="w-6 h-6 bg-indigo-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-indigo-700 text-xs font-bold">{index + 1}</span>
                      </div>
                      <span className="leading-relaxed">{rule}</span>
                    </li>
                  ))}
                </ul>
              </CollapsibleSection>
            </div>
          )}
        </div>
      )}

      {activeTab === 'sent' && (
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 p-6">
          <div className="flex items-center mb-6">
            <Share2 className="w-6 h-6 text-indigo-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">{t('invite.myInviteRecords')}</h2>
          </div>
          {!inviteData || inviteData.invitesSent.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Share2 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('invite.noInviteRecords')}</h3>
              <p className="text-gray-600">{t('invite.inviteFriends')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {inviteData.invitesSent.map((invite, index) => (
                <div key={invite.id} className={`bg-gradient-to-r from-gray-50 to-green-50 rounded-2xl p-4 border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] animate-in slide-in-from-right-5`} style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 min-w-0 flex-1">
                      <Avatar
                        src={invite.invitee.image}
                        name={invite.invitee.name}
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-gray-900 truncate">{invite.invitee.name}</div>
                        <div className="text-sm text-gray-600 truncate flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                          </svg>
                          {invite.invitee.twitterUsername}
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="flex items-center text-green-600 font-bold mb-1">
                        <Award className="w-4 h-4 mr-1" />
                        +{invite.reward}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(invite.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 