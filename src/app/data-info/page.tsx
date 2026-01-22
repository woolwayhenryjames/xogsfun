'use client';

import { Info, Twitter, Database, RefreshCw, AlertCircle, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { BottomNavigation } from '@/components/BottomNavigation';
import { UserDropdown } from '@/components/UserDropdown';
import { TwitterSignInButton } from '@/components/TwitterSignInButton';
import { useSession } from 'next-auth/react';

export default function DataInfoPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pb-32 apple-fade-in">
      {/* Apple-style top navigation */}
      <nav className="apple-nav">
        <div className="flex items-center justify-between">
          <div className="apple-nav-brand">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Info className="h-5 w-5 text-white" />
            </div>
            <span>Data Info</span>
          </div>
          
          {session?.user ? (
            <UserDropdown />
          ) : (
            <TwitterSignInButton />
          )}
        </div>
      </nav>

      <div className="px-6 py-8 max-w-md mx-auto">
        {/* Title */}
        <div className="apple-card mb-6 apple-slide-up">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Info className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="apple-heading">Data Information</h1>
              <p className="apple-body text-gray-600">Understand data sources and accuracy</p>
            </div>
          </div>
        </div>

        {/* Data Sources */}
        <div className="apple-card mb-6 apple-slide-up">
          <h2 className="apple-subheading mb-4">📊 Data Sources</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Twitter className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="apple-feature-title">Official Twitter Data</h3>
                <p className="apple-body text-gray-600">
                  Real data obtained through Twitter OAuth 2.0 when users log in, including:
                </p>
                <ul className="apple-caption text-gray-500 mt-2 space-y-1">
                  <li>• Username, avatar, verification status</li>
                  <li>• Follower count, following count</li>
                  <li>• Tweet count, account creation time</li>
                  <li>• Bio, location, website</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Data Accuracy */}
        <div className="apple-card mb-6 apple-slide-up">
          <h2 className="apple-subheading mb-4">✅ Data Accuracy</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <Database className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="apple-feature-title">Real Data Guarantee</h3>
                <p className="apple-body text-gray-600">
                  All displayed data is real data obtained from Twitter's official API, containing no false or simulated information.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Limitations */}
        <div className="apple-card mb-6 bg-yellow-50 border-yellow-200 apple-slide-up">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="apple-subheading text-yellow-900">⚠️ Current Limitations</h2>
            </div>
          </div>
          <div className="space-y-3 text-yellow-800">
            <div>
              <h3 className="font-semibold mb-1">Data Update Frequency</h3>
              <p className="apple-body">
                Due to Twitter API technical limitations, data is only updated when users log in and cannot sync the latest data in real-time.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Refresh Data Function</h3>
              <p className="apple-body">
                The "Refresh Data" button currently can only display stored real data and cannot fetch the latest data from Twitter.
              </p>
            </div>
          </div>
        </div>

        {/* AI Score Description */}
        <div className="apple-card mb-6 apple-slide-up">
          <h2 className="apple-subheading mb-4">🤖 AI Influence Score</h2>
          <div className="space-y-3">
            <p className="apple-body text-gray-600">
              AI scores are calculated based on the following real data:
            </p>
            <ul className="apple-body text-gray-600 space-y-1">
              <li>• <strong>Follower Count</strong> (highest weight)</li>
              <li>• <strong>Tweet Count</strong> (content activity)</li>
              <li>• <strong>Following Count</strong> (social activity)</li>
              <li>• <strong>Verification Status</strong> (bonus points)</li>
            </ul>
            <div className="bg-blue-50 rounded-lg p-3 mt-3">
              <p className="apple-caption text-blue-700">
                Score range: 10-100 points, completely based on real Twitter data calculation
              </p>
            </div>
          </div>
        </div>

        {/* Future Improvements */}
        <div className="apple-card mb-6 apple-slide-up">
          <h2 className="apple-subheading mb-4">🚀 Future Improvements</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <RefreshCw className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="apple-feature-title">Real-time Data Sync</h3>
                <p className="apple-body text-gray-600">
                  We are developing better data synchronization mechanisms and will support regular automatic updates of user data in the future.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="apple-card apple-slide-up">
          <Link 
            href="/profile" 
            className="apple-button w-full text-center"
          >
            Back to Profile
          </Link>
        </div>
      </div>

      {/* Apple-style fixed bottom navigation */}
      <BottomNavigation />
    </div>
  );
} 