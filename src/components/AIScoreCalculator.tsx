'use client';

import { useState } from 'react';
import { Loader2, Calculator, RefreshCw, CheckCircle, AlertCircle, Star, TrendingUp, Users, Clock, Shield } from 'lucide-react';
import { XLogo } from './XLogo';
import { CollapsibleSection } from './CollapsibleSection';

interface ScoreBreakdown {
  score: number;
  details: string;
}

interface ScoreCalculation {
  registrationAge: number;
  followersScore: number;
  followingRatio: number;
  tweetsScore: number;
  verificationScore: number;
  totalScore: number;
  breakdown: {
    registrationAge: ScoreBreakdown;
    followers: ScoreBreakdown;
    followingRatio: ScoreBreakdown;
    tweets: ScoreBreakdown;
    verification: ScoreBreakdown;
  };
}

interface AIScoreData {
  currentScore: number | null;
  calculatedScore: number;
  calculation: ScoreCalculation;
  needsUpdate: boolean;
}

export default function AIScoreCalculator() {
  const [scoreData, setScoreData] = useState<AIScoreData | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch score calculation
  const fetchScoreCalculation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/calculate-ai-score', {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch score calculation');
      }
      
      const data = await response.json();
      setScoreData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch score');
    } finally {
      setLoading(false);
    }
  };

  // Update AI score
  const updateAIScore = async () => {
    setUpdating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/calculate-ai-score', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to update score');
      }
      
      const data = await response.json();
      
      // Fetch latest data
      await fetchScoreCalculation();
      
      // Show success message
      alert(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update score');
    } finally {
      setUpdating(false);
    }
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreGradient = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'from-green-500 to-emerald-600';
    if (percentage >= 60) return 'from-blue-500 to-indigo-600';
    if (percentage >= 40) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };

  const getBadgeColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (percentage >= 60) return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 56) return { label: 'Excellent', color: 'text-green-600' };
    if (score >= 42) return { label: 'Good', color: 'text-blue-600' };
    if (score >= 28) return { label: 'Average', color: 'text-yellow-600' };
    return { label: 'Needs Improvement', color: 'text-red-600' };
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 rounded-full shadow-xl mb-4">
          <Star className="w-10 h-10 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            AI Influence Score
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive influence assessment based on your Twitter data and engagement metrics
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={fetchScoreCalculation}
            disabled={loading}
            className="group relative overflow-hidden bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 flex items-center justify-center gap-3">
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Calculator className="w-5 h-5" />
              )}
              {loading ? 'Calculating...' : 'Calculate Score'}
            </div>
          </button>
          
          {scoreData?.needsUpdate && (
            <button
              onClick={updateAIScore}
              disabled={updating}
              className="group relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10 flex items-center justify-center gap-3">
                {updating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <RefreshCw className="w-5 h-5" />
                )}
                {updating ? 'Updating...' : 'Update Score'}
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 text-red-700">
            <AlertCircle className="w-6 h-6 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Score Overview */}
      {scoreData && (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <XLogo className="w-6 h-6 text-white" size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Score Overview</h3>
                <p className="text-gray-600">Total possible score: 70 points</p>
              </div>
            </div>
            {scoreData.needsUpdate ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 text-sm font-medium rounded-full border border-red-200">
                <AlertCircle className="w-4 h-4" />
                Needs Update
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 text-sm font-medium rounded-full border border-green-200">
                <CheckCircle className="w-4 h-4" />
                Up to Date
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Current Database Score */}
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-600 mb-2">Current Database Score</div>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {scoreData.currentScore ?? 'Not Set'}
                </div>
                <div className="text-sm text-gray-500">Stored in system</div>
              </div>
            </div>
            
            {/* Real-time Calculated Score */}
            <div className={`bg-gradient-to-br ${getScoreGradient(scoreData.calculatedScore, 70)} rounded-2xl p-6 text-white shadow-xl`}>
              <div className="text-center">
                <div className="text-sm font-medium text-white/90 mb-2">Real-time Calculated Score</div>
                <div className="text-4xl font-bold mb-2">
                  {scoreData.calculatedScore}
                </div>
                <div className="text-sm text-white/80">
                  {getScoreLabel(scoreData.calculatedScore).label}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Score Breakdown */}
      {scoreData?.calculation && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Score Breakdown</h3>
            <p className="text-gray-600">Detailed analysis of each scoring component</p>
          </div>
          
          {/* Horizontal Layout for Score Breakdown */}
          <div className="space-y-4">
            {/* Top Row: Total Score (Large) */}
            <div className={`bg-gradient-to-br ${getScoreGradient(scoreData.calculation.totalScore, 70)} rounded-3xl shadow-2xl border-0 p-6 text-white transform hover:scale-[1.02] transition-all duration-300`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <Star className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-white mb-1">Total Score</h4>
                    <div className="text-lg font-medium text-white/90">
                      {getScoreLabel(scoreData.calculation.totalScore).label}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-bold text-white mb-2">
                    {scoreData.calculation.totalScore}
                  </div>
                  <div className="text-lg text-white/80">out of 70</div>
                </div>
              </div>
              <div className="mt-4 w-full bg-white/20 rounded-full h-4">
                <div 
                  className="bg-white h-4 rounded-full transition-all duration-500"
                  style={{ width: `${(scoreData.calculation.totalScore / 70) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Score Breakdown in Horizontal Layout */}
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {/* Account Age */}
              <div className="bg-white/90 backdrop-blur-xl rounded-xl shadow-lg border border-gray-100 p-4 hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex-shrink-0 w-40">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Account Age</h4>
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {scoreData.calculation.breakdown.registrationAge.score}
                  </div>
                  <div className="text-xs text-gray-500 mb-3">out of 15</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${(scoreData.calculation.breakdown.registrationAge.score / 15) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                    {scoreData.calculation.breakdown.registrationAge.details}
                  </p>
                </div>
              </div>

              {/* Followers */}
              <div className="bg-white/90 backdrop-blur-xl rounded-xl shadow-lg border border-gray-100 p-4 hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex-shrink-0 w-40">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Followers</h4>
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {scoreData.calculation.breakdown.followers.score}
                  </div>
                  <div className="text-xs text-gray-500 mb-3">out of 40</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${(scoreData.calculation.breakdown.followers.score / 40) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                    {scoreData.calculation.breakdown.followers.details}
                  </p>
                </div>
              </div>

              {/* Following Ratio */}
              <div className="bg-white/90 backdrop-blur-xl rounded-xl shadow-lg border border-gray-100 p-4 hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex-shrink-0 w-40">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Following Ratio</h4>
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {scoreData.calculation.breakdown.followingRatio.score}
                  </div>
                  <div className="text-xs text-gray-500 mb-3">out of 5</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${(scoreData.calculation.breakdown.followingRatio.score / 5) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                    {scoreData.calculation.breakdown.followingRatio.details}
                  </p>
                </div>
              </div>

              {/* Tweet Activity */}
              <div className="bg-white/90 backdrop-blur-xl rounded-xl shadow-lg border border-gray-100 p-4 hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex-shrink-0 w-40">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Tweet Activity</h4>
                  <div className="text-2xl font-bold text-orange-600 mb-1">
                    {scoreData.calculation.breakdown.tweets.score}
                  </div>
                  <div className="text-xs text-gray-500 mb-3">out of 5</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${(scoreData.calculation.breakdown.tweets.score / 5) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                    {scoreData.calculation.breakdown.tweets.details}
                  </p>
                </div>
              </div>

              {/* Verification Status */}
              <div className="bg-white/90 backdrop-blur-xl rounded-xl shadow-lg border border-gray-100 p-4 hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex-shrink-0 w-40">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Verification</h4>
                  <div className="text-2xl font-bold text-indigo-600 mb-1">
                    {scoreData.calculation.breakdown.verification.score}
                  </div>
                  <div className="text-xs text-gray-500 mb-3">out of 5</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-blue-600 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${(scoreData.calculation.breakdown.verification.score / 5) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                    {scoreData.calculation.breakdown.verification.details}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scoring Algorithm Explanation - Collapsible */}
      <CollapsibleSection
        title="Scoring Algorithm"
        subtitle="Understand how AI influence score is calculated - click to view details"
        icon={<Calculator className="w-6 w-6 text-white" />}
        variant="info"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-white/80 backdrop-blur-xl rounded-xl p-4 border border-white/50">
              <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                1. Account Age (Max 15 points)
              </h4>
              <p className="text-xs text-gray-700 leading-relaxed">
                (Current year - Registration year) × 1.5 points, capped at 15 points
              </p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-xl rounded-xl p-4 border border-white/50">
              <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-2 text-sm">
                <Users className="w-4 h-4" />
                2. Follower Count (Max 40 points)
              </h4>
              <ul className="text-xs text-gray-700 space-y-1 leading-relaxed">
                <li>• &lt;10K: Followers ÷ 10K × 10 points</li>
                <li>• 10K-100K: 10 + (Followers - 10K) ÷ 90K × 15 points</li>
                <li>• 100K-1M: 25 + (Followers - 100K) ÷ 900K × 10 points</li>
                <li>• &gt;1M: 35 + ((Followers - 1M) ÷ 1M × 5), max 40 points</li>
              </ul>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-xl p-4 border border-white/50">
              <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4" />
                3. Following/Followers Ratio (Max 5 points)
              </h4>
              <p className="text-xs text-gray-700 leading-relaxed">
                Optimal ratio between 0.1-2 gets full points. Points deducted based on log10 distance from optimal range.
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white/80 backdrop-blur-xl rounded-xl p-4 border border-white/50">
              <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4" />
                4. Tweet Activity (Max 5 points)
              </h4>
              <ul className="text-xs text-gray-700 space-y-1 leading-relaxed">
                <li>• 50-365 tweets per year: Full points</li>
                <li>• &lt;50 tweets: Proportional scoring</li>
                <li>• &gt;365 tweets: -5 points per 1000 excess tweets</li>
              </ul>
            </div>
            
            <div className="bg-white/80 backdrop-blur-xl rounded-xl p-4 border border-white/50">
              <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4" />
                5. Verification Status (Max 5 points)
              </h4>
              <p className="text-xs text-gray-700 leading-relaxed">
                Verified accounts (blue checkmark or other verification) receive 5 points, unverified accounts receive 0 points.
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-4 text-white">
              <h4 className="font-bold text-white mb-2 flex items-center gap-2 text-sm">
                <Star className="w-4 h-4" />
                Score Levels
              </h4>
              <ul className="text-xs text-blue-100 space-y-1 leading-relaxed">
                <li>• 56-70 points: Excellent Influence</li>
                <li>• 42-55 points: Good Influence</li>
                <li>• 28-41 points: Average Influence</li>
                <li>• 0-27 points: Needs Improvement</li>
              </ul>
            </div>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
} 