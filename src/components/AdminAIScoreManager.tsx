'use client';

import { useState, useEffect } from 'react';
import { Loader2, RefreshCw, Users, TrendingUp, AlertCircle, CheckCircle, DollarSign, Coins } from 'lucide-react';

interface AIScoreStats {
  totalUsers: number;
  usersWithTwitterData: number;
  usersWithAIScore: number;
  needsUpdate: number;
  lastUpdated: string;
}

interface BatchUpdateResult {
  success: boolean;
  message: string;
  updated: number;
  failed: number;
  timestamp: string;
}

interface XogsUpdateResult {
  success: boolean;
  message: string;
  totalUsers: number;
  updatedUsers: number;
  updateDetails: Array<{
    user: string;
    aiScore: number;
    oldBalance: number;
    newBalance: number;
    breakdown: {
      baseXogs: number;
      inviteRewards: number;
      inviterRewards: number;
      inviteeRewards: number;
    };
  }>;
}

export default function AdminAIScoreManager() {
  const [stats, setStats] = useState<AIScoreStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updatingXogs, setUpdatingXogs] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<BatchUpdateResult | null>(null);
  const [lastXogsResult, setLastXogsResult] = useState<XogsUpdateResult | null>(null);

      // Get statistics
  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/batch-update-ai-scores', {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error('Failed to get statistics');
      }
      
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get statistics');
    } finally {
      setLoading(false);
    }
  };

  // Batch update AI scores
  const batchUpdateScores = async () => {
    setUpdating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/batch-update-ai-scores', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Batch update failed');
      }
      
      const data = await response.json();
      setLastResult(data);
      
      // Refresh statistics after update
      await fetchStats();
      
      alert(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Batch update failed');
    } finally {
      setUpdating(false);
    }
  };

  // Batch update Xogs balance
  const batchUpdateXogs = async () => {
    setUpdatingXogs(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/recalculate-xogs-balance', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Batch update Xogs balance failed');
      }
      
      const data = await response.json();
      setLastXogsResult(data);
      
      alert(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Batch update Xogs balance failed');
    } finally {
      setUpdatingXogs(false);
    }
  };

  // Get statistics on page load
  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header operation area */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
                  <h3 className="text-xl font-bold">AI Score & $XOGS Management</h3>
        <p className="text-gray-600">Manage and batch update user AI scores and $XOGS balances</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={fetchStats}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Refresh Stats
          </button>
          
          <button
            onClick={batchUpdateScores}
            disabled={updating || !stats}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {updating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <TrendingUp className="w-4 h-4" />
            )}
            Update AI Scores
          </button>

          <button
            onClick={batchUpdateXogs}
            disabled={updatingXogs}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {updatingXogs ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Coins className="w-4 h-4" />
            )}
            Sync $XOGS Balance
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="border border-red-200 bg-red-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6">
          <div className="apple-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <div className="text-sm text-gray-600">Total Users</div>
              </div>
            </div>
          </div>

          <div className="apple-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.usersWithTwitterData}</div>
                <div className="text-sm text-gray-600">With Twitter Data</div>
              </div>
            </div>
          </div>

          <div className="apple-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.usersWithAIScore}</div>
                <div className="text-sm text-gray-600">With AI Score</div>
              </div>
            </div>
          </div>

          <div className="apple-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.needsUpdate}</div>
                <div className="text-sm text-gray-600">Needs Update</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Score Update Results */}
      {lastResult && (
        <div className="apple-card bg-green-50 border-green-200">
          <h4 className="font-semibold text-green-800 mb-2">AI Score Update Results</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Update Time:</span>
              <span>{new Date(lastResult.timestamp).toLocaleString('zh-CN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Successfully Updated:</span>
              <span className="text-green-600 font-medium">{lastResult.updated} users</span>
            </div>
            <div className="flex justify-between">
              <span>Update Failed:</span>
              <span className="text-red-600 font-medium">{lastResult.failed} users</span>
            </div>
          </div>
        </div>
      )}

      {/* Xogs Balance Update Results */}
      {lastXogsResult && (
        <div className="apple-card bg-blue-50 border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            $XOGS Balance Sync Results
          </h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Total Users:</span>
              <span>{lastXogsResult.totalUsers}</span>
            </div>
            <div className="flex justify-between">
              <span>Updated:</span>
              <span className="text-blue-600 font-medium">{lastXogsResult.updatedUsers} users</span>
            </div>
            
            {/* Show Update Details */}
            {lastXogsResult.updateDetails && lastXogsResult.updateDetails.length > 0 && (
              <div className="mt-4">
                                  <div className="font-medium text-blue-800 mb-2">Update Details:</div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {lastXogsResult.updateDetails.map((detail, index) => (
                    <div key={index} className="bg-white p-3 rounded border">
                      <div className="font-medium text-gray-800">{detail.user}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        AI Score: {detail.aiScore} | 
                        Balance: {detail.oldBalance} → {detail.newBalance} | 
                        Base: {detail.breakdown.baseXogs} | 
                        Invite Rewards: {detail.breakdown.inviteRewards}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
              {lastXogsResult.message}
            </div>
          </div>
        </div>
      )}

      {/* Operation Instructions */}
      <div className="apple-card bg-blue-50 border-blue-200">
        <h4 className="font-semibold text-blue-800 mb-2">Operation Instructions</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>Refresh Stats</strong>: Get the latest user and AI score statistics</li>
          <li>• <strong>Update AI Scores</strong>: Recalculate AI scores for all users with Twitter data</li>
                      <li>• <strong>Sync $XOGS Balance</strong>: Recalculate all users' $XOGS balances based on AI scores and invite rewards</li>
          <li>• <strong>Smart Update</strong>: Only update database when data changes</li>
          <li>• <strong>New Invite Rules</strong>: Inviter gets invitee's AI Score × 2, invitee gets own AI Score × 1</li>
        </ul>
      </div>

      {/* System Status */}
      <div className="apple-card">
        <h4 className="font-semibold mb-3">System Status</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span>Auto Scoring System</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Running</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Auto Update on Login</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Enabled</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Auto Reward Calculation on Invite</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Enabled</span>
          </div>
          <div className="flex items-center justify-between">
            <span>$XOGS Balance Pre-calculation</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Optimized</span>
          </div>
          {stats && (
            <div className="flex items-center justify-between">
              <span>Coverage</span>
              <span className="text-sm">
                {stats.usersWithTwitterData > 0 
                  ? Math.round((stats.usersWithAIScore / stats.usersWithTwitterData) * 100)
                  : 0
                }% ({stats.usersWithAIScore}/{stats.usersWithTwitterData})
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 