'use client';

import { Coins, Gift, Zap, AlertTriangle } from 'lucide-react';
import { TwitterSignInButton } from '../components/TwitterSignInButton';
import { BottomNavigation } from '../components/BottomNavigation';
import { useSession } from 'next-auth/react';
import { UserDropdown } from '../components/UserDropdown';
import { CollapsibleSection } from '../components/CollapsibleSection';
import { XLogoMinimal, XLogo, XLogoHero } from '../components/XLogo';
import { WithdrawButton } from '../components/WithdrawButton';
import { TwitterFooterLink } from '../components/TwitterFooterLink';
import { SponsorCard } from '../components/SponsorCard';

import { useTranslator } from '@/lib/i18n';
import { useState, useEffect } from 'react';

interface UserData {
  aiScore: number;
  xogsBalance: number;
  name?: string;
  twitterUsername?: string;
}

export default function HomePage() {
  const { data: session } = useSession();
  const { t, isLoading } = useTranslator();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoadingUserData, setIsLoadingUserData] = useState(false);

  // Get user data and sync balance
  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user?.id) return;

      try {
        setIsLoadingUserData(true);

        // 1. 首先获取用户数据
        const response = await fetch('/api/user');
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        }
      } catch (error) {
        // Silently handle error
      } finally {
        setIsLoadingUserData(false);
      }
    };

    fetchUserData();
  }, [session?.user?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Calculate display data: show real data if user is logged in and has data; otherwise show example description
  const displayAiScore = userData?.aiScore;
  const displayXogsBalance = userData?.xogsBalance;



  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 apple-fade-in pb-40">
      {/* Apple-style top navigation */}
      <nav className="apple-nav">
        <div className="flex items-center justify-between">
          <div className="apple-nav-brand">
            <XLogoMinimal className="w-10 h-10" />
            <span>Xogs.Fun</span>
          </div>
          <div className="flex items-center space-x-3">
            {session?.user ? (
              <UserDropdown />
            ) : (
              <TwitterSignInButton className="px-4 py-2 text-sm" />
            )}
          </div>
        </div>
      </nav>

      <div className="px-6 py-12 max-w-md mx-auto">


        {/* Protocol label */}
        <div className="text-center mb-8 apple-slide-up">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 px-4 py-2 rounded-full border border-purple-200 shadow-sm">
            <Zap className="h-4 w-4" />
            <span className="text-sm font-medium">Solana-Based CryptoTwitter AI Scoring</span>
          </div>
        </div>

        {/* Hero area - Apple style */}
        <div className="text-center mb-16 apple-slide-up">
          <div className="w-24 h-24 mx-auto mb-8 apple-pulse">
            <XLogoMinimal className="w-full h-full" textSize="text-3xl" />
          </div>

          <div className="space-y-4">
            {!session?.user ? (
              <TwitterSignInButton
                className="apple-button w-full py-3 text-base"
                text={t('auth.connectTwitter')}
              />
            ) : null}
          </div>
        </div>

        {/* Token Balance Card - display real data or description */}
        <div className="apple-score-card mb-16 apple-scale-in apple-float apple-shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          {isLoadingUserData || (session?.user && !userData) ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-yellow-600 border-t-transparent apple-rounded-full animate-spin mx-auto mb-3"></div>
              <div className="apple-score-label text-yellow-800 apple-shimmer">Loading Token Balance...</div>
            </div>
          ) : session?.user && userData ? (
            <>
              <div className="flex items-center justify-center mb-3">
                <Coins className="h-8 w-8 text-yellow-600 mr-2" />
                <div className="apple-score-number text-yellow-600">
                  {(displayXogsBalance || 0).toLocaleString()}
                </div>
                <span className="text-2xl font-bold text-yellow-600 ml-1">$XOGS</span>
              </div>
              <div className="apple-score-label text-yellow-800">
                My $XOGS Allocation
              </div>
              <p className="text-sm opacity-75 mt-3 text-yellow-700">
                CryptoTwitter AI Score: {displayAiScore || 0}
              </p>
              {/* 按钮区域 */}
              <div className="mt-4 flex items-center justify-center gap-3">
                <WithdrawButton
                  className="text-xs"
                />
                <a
                  href="/xogs"
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-orange-700 bg-orange-100 hover:bg-orange-200 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                >
                  <Coins className="w-4 h-4" />
                  View Records
                </a>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center mb-3">
                <Coins className="h-8 w-8 text-yellow-600 mr-2" />
                <div className="text-3xl font-bold text-yellow-600">AI Score × 10</div>
              </div>
              <div className="apple-score-label text-yellow-800">
                Connect to View Your $XOGS Allocation
              </div>
              <p className="text-sm opacity-75 mt-3 text-yellow-700">
                Connect your Twitter to discover your CryptoTwitter influence score
              </p>
            </>
          )}
        </div>

        {/* Quick Access Cards - 新增功能入口 */}
        {session?.user && (
          <div className="mb-8 apple-slide-up">
            <div className="grid grid-cols-1 gap-4 mb-4">
              {/* TASK 入口 */}
              <a
                href="/task"
                className="group bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-lg font-bold text-blue-900 mb-1">TASK</h3>
                    <p className="text-xs text-blue-700 opacity-80">Complete tasks & earn rewards</p>
                  </div>
                  <div className="text-blue-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </a>

              {/* AI Tweet 入口 - Temporarily hidden */}
              {false && (
                <a
                  href="/infofi"
                  className="group bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <div className="flex items-center justify-center mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-purple-900 mb-1">AI Tweet</h3>
                    <p className="text-xs text-purple-700 opacity-80">Generate AI-powered tweets</p>
                  </div>
                </a>
              )}
            </div>

            {/* Solana Wallet Entry - Hidden for testing */}
            {/* <div className="grid grid-cols-1 gap-4">
              <a 
                href="/solana"
                className="group bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-6 border border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-lg font-bold text-orange-900 mb-1">Solana Wallet</h3>
                    <p className="text-xs text-orange-700 opacity-80">Connect Phantom Wallet to receive rewards</p>
                  </div>
                  <div className="text-orange-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </a>
            </div> */}
          </div>
        )}

        {/* Project Introduction - Collapsible */}
        <div className="mb-8 apple-slide-up">
          <CollapsibleSection
            title="About CryptoTwitter AI Scoring"
            icon={<Zap className="h-6 w-6 text-white" />}
            variant="default"
          >
            <div className="space-y-6 text-sm text-gray-700">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-5 border border-purple-200">
                <h4 className="font-bold text-purple-900 mb-3 text-base">🐦 CryptoTwitter AI Scoring System</h4>
                <p className="leading-relaxed text-purple-800">
                  XOGS is a sophisticated AI-powered platform that evaluates Twitter accounts within the crypto ecosystem. Our advanced algorithms analyze engagement quality, follower authenticity, content relevance, and community influence to generate comprehensive crypto-focused Twitter scores.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    🤖 Crypto-Focused AI Analysis
                  </h4>
                  <p className="text-blue-800 text-xs leading-relaxed">
                    Specialized machine learning models trained on crypto Twitter data to evaluate account credibility, community engagement, and influence within the cryptocurrency space.
                  </p>
                </div>

                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                    ⚡ Solana Blockchain Integration
                  </h4>
                  <p className="text-green-800 text-xs leading-relaxed">
                    Built on Solana for fast, low-cost transactions. Scores and rewards are processed on-chain, ensuring transparency and decentralization of the scoring system.
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-4 border border-orange-200">
                <h4 className="font-semibold text-orange-900 mb-2">🪙 $XOGS Token Rewards</h4>
                <p className="text-orange-800 text-sm leading-relaxed">
                  Earn $XOGS tokens based on your CryptoTwitter influence score. Higher-quality crypto Twitter accounts receive larger token allocations. Tokens can be used for platform governance and premium features.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">How CryptoTwitter Scoring Works:</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Connect Twitter account
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    AI analyzes crypto relevance
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Generate influence score
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    Receive $XOGS tokens
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleSection>
        </div>

        {/* Token Acquisition Rules - Collapsible */}
        <div className="mb-8 apple-slide-up">
          <CollapsibleSection
            title={t('home.tokenAcquisition')}
            icon={<Gift className="h-6 w-6 text-white" />}
            variant="info"
          >
            <div className="space-y-3 text-sm text-gray-700">
              <p>• <strong>{t('home.initialRewardRule')}</strong></p>
              <p>• <strong>{t('home.inviteRewardRule')}</strong></p>
              <p>• <strong>{t('home.taskRewardRule')}</strong></p>
              <p>• <strong>{t('home.withdrawRule')}</strong></p>
            </div>
          </CollapsibleSection>
        </div>

        {/* Security Warning - Collapsible */}
        <div className="mb-8 apple-slide-up">
          <CollapsibleSection
            title={t('home.securityWarning')}
            icon={<AlertTriangle className="h-6 w-6 text-white" />}
            variant="warning"
          >
            <div className="space-y-3 text-sm text-red-700 bg-white/50 rounded-xl p-4">
              <p className="font-semibold">🚨 <strong>{t('home.noOfficialContract')}</strong></p>
              <p>• {t('home.fakeTokenWarning')}</p>
              <p>• {t('home.dontBuyFake')}</p>
              <p>• {t('home.officialAnnouncement')}</p>
              <p>• {t('home.protectAssets')}</p>
            </div>
          </CollapsibleSection>
        </div>

        {/* Sponsor Card - Hidden */}
        <div className="mb-8 apple-slide-up">
          <SponsorCard />
        </div>

        {/* Twitter Footer Link */}
        <TwitterFooterLink />
      </div>

      {/* Apple-style fixed bottom navigation */}
      <BottomNavigation />
    </div>
  );
}
