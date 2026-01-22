'use client';

import { useState } from 'react';
import { Wallet } from 'lucide-react';
import toast from 'react-hot-toast';

interface WithdrawButtonProps {
  className?: string;
}

export function WithdrawButton({ className = '' }: WithdrawButtonProps) {
  const [isClicked, setIsClicked] = useState(false);

  const handleWithdraw = async () => {
    if (isClicked) return;

    setIsClicked(true);
    
    // 显示 coming soon 提示
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
    
    // 延迟重置按钮状态
    setTimeout(() => {
      setIsClicked(false);
    }, 2000);
  };

  return (
    <button
      onClick={handleWithdraw}
      disabled={isClicked}
      className={`
        inline-flex items-center gap-2 px-4 py-2 
        text-sm font-medium text-white
        bg-gradient-to-r from-blue-500 to-purple-600
        hover:from-blue-600 hover:to-purple-700
        border-0 rounded-lg shadow-lg hover:shadow-xl
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        transform hover:scale-105 active:scale-95
        ${className}
      `}
      title="Withdraw $XOGS tokens"
    >
      <Wallet 
        className={`w-4 h-4 ${isClicked ? 'animate-pulse' : ''}`} 
      />
      {isClicked ? 'Processing...' : 'Withdraw Now'}
    </button>
  );
} 