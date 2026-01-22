'use client';

import { useState } from 'react';
import { RefreshCw, Zap } from 'lucide-react';

interface RefreshDataButtonProps {
  className?: string;
  onRefreshComplete?: (message: string) => void;
}

export function RefreshDataButton({ className = '', onRefreshComplete }: RefreshDataButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSyncingBalance, setIsSyncingBalance] = useState(false);

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    
    try {
      const response = await fetch('/api/refresh-user-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (response.ok) {
        onRefreshComplete?.('✅ ' + result.message);
      } else {
        onRefreshComplete?.('❌ ' + (result.error || 'Data refresh failed'));
      }
    } catch (error) {
      console.error('刷新用户数据失败:', error);
      onRefreshComplete?.('❌ Network error, please try again later');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSyncBalance = async () => {
    setIsSyncingBalance(true);
    
    try {
      const response = await fetch('/api/user/sync-balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        onRefreshComplete?.('💰 ' + result.message);
      } else {
        onRefreshComplete?.('❌ ' + (result.error || 'Balance sync failed'));
      }
    } catch (error) {
      console.error('同步余额失败:', error);
      onRefreshComplete?.('❌ Network error, please try again later');
    } finally {
      setIsSyncingBalance(false);
    }
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <button
        onClick={handleRefreshData}
        disabled={isRefreshing}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:bg-blue-400 transition-colors duration-200 shadow-lg hover:shadow-xl"
      >
        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
      </button>
      
      <button
        onClick={handleSyncBalance}
        disabled={isSyncingBalance}
        className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl text-sm font-medium hover:bg-orange-700 disabled:bg-orange-400 transition-colors duration-200 shadow-lg hover:shadow-xl"
      >
        <Zap className={`w-4 h-4 ${isSyncingBalance ? 'animate-pulse' : ''}`} />
        {isSyncingBalance ? 'Syncing...' : 'Sync Balance'}
      </button>
    </div>
  );
} 