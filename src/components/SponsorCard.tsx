'use client';

import { ArrowUpRight, Heart, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export function SponsorCard() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUXUYExpanded, setIsUXUYExpanded] = useState(false);
  
  const handleUXUYClick = () => {
    window.open('https://uxuy.com/join/B0T2un0E4Qv', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl shadow-xl border border-emerald-100 p-6 apple-slide-up">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Heart className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Our Amazing Sponsors</h3>
          <p className="text-sm text-gray-600">Partnership & Token Distribution</p>
        </div>
      </div>
      
      {/* Collapsible Info Section */}
      <div className="mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-3 bg-white/50 hover:bg-white/70 rounded-2xl border border-emerald-100/50 transition-all duration-200"
        >
          <span className="text-sm font-medium text-emerald-700">Partnership Details</span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-emerald-600" />
          ) : (
            <ChevronDown className="w-4 h-4 text-emerald-600" />
          )}
        </button>
        
        {isExpanded && (
          <div className="mt-2 bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-emerald-100/50 animate-in slide-in-from-top-2 duration-200">
            <p className="text-sm text-emerald-700 leading-relaxed mb-3">
              We partner with leading platforms for future $XOGS token distribution. Early registration through our referral links gives you priority access to exclusive benefits and rewards.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-600">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span>Register early • Get priority access • Earn exclusive rewards</span>
            </div>
          </div>
        )}
      </div>

      {/* UXUY Advertisement */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg">
        {/* Header section - always visible */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center overflow-hidden">
              <img 
                src="https://pbs.twimg.com/profile_images/1940025769142460417/Mjp_BRkv_normal.jpg"
                alt="UXUY Logo"
                className="w-8 h-8 rounded-lg object-cover"
              />
            </div>
            <div>
              <h4 className="text-lg font-bold">UXUY</h4>
              <p className="text-sm opacity-90">Crypto Trading Platform</p>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsUXUYExpanded(!isUXUYExpanded);
            }}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            {isUXUYExpanded ? (
              <ChevronUp className="w-5 h-5 opacity-75" />
            ) : (
              <ChevronDown className="w-5 h-5 opacity-75" />
            )}
          </button>
        </div>
        
        {/* Collapsible description */}
        {isUXUYExpanded && (
          <div className="mb-3 animate-in slide-in-from-top-2 duration-200">
            <p className="text-sm leading-relaxed opacity-95 mb-3 whitespace-pre-line">
✨ UXUY, proud XOGS sponsor, launches Hyperion (RION) Alpha Draw!  
🕒 July 17, 12:00 UTC - July 21, 12:00 UTC  
🌐 Join via site/link (new or OG users)!  
💸 Trade 100U $RION for 1 draw, 100% win 0.5+ USDT (instant)!  
🏆 Earn XOGS token rewards (distributed later)!  
🚀 INFOFI drops soon—UXUY leads with massive rewards!
            </p>
            <div className="bg-white/10 rounded-lg p-3 border border-white/20">
              <p className="text-xs leading-relaxed opacity-90">
                🎁 <strong>Exclusive Bonus:</strong> We will distribute additional rewards to users who register through this link in the future. Stay tuned for exciting benefits!
              </p>
            </div>
          </div>
        )}
        
        {/* Action button */}
        <button
          onClick={handleUXUYClick}
          className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-bold rounded-xl p-4 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl group"
        >
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm font-bold">Join Now & Earn Extra Rewards</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 transition-all" />
          </div>
        </button>
      </div>
    </div>
  );
} 