import React from 'react';

interface XLogoProps {
  className?: string;
  size?: number;
}

export function XLogo({ className = "h-8 w-8", size = 32 }: XLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="xogsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#667eea" />
          <stop offset="50%" stopColor="#764ba2" />
          <stop offset="100%" stopColor="#f093fb" />
        </linearGradient>
        <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </linearGradient>
      </defs>
      
      {/* Background rounded rectangle */}
      <rect
        x="1"
        y="1"
        width="30"
        height="30"
        rx="8"
        fill="url(#xogsGradient)"
        stroke="rgba(255, 255, 255, 0.2)"
        strokeWidth="0.5"
      />
      
      {/* Xogs text */}
      <g transform="translate(16, 16)">
        {/* X */}
        <g transform="translate(-12, -4)">
        <path
            d="M0 0 L4 4 M4 0 L0 4"
            stroke="url(#textGradient)"
            strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        </g>
        
        {/* o */}
        <g transform="translate(-4, -4)">
          <circle
            cx="2"
            cy="2"
            r="2"
            fill="none"
            stroke="url(#textGradient)"
            strokeWidth="1.5"
          />
        </g>
        
        {/* g - 正常小写设计 */}
        <g transform="translate(4, -4)">
        <path
            d="M4 0 A2 2 0 0 0 0 2 A2 2 0 0 0 2 4 A2 2 0 0 0 4 2 L4 6"
            fill="none"
            stroke="url(#textGradient)"
            strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        </g>
        
        {/* s */}
        <g transform="translate(12, -4)">
          <path
            d="M4 0 A2 2 0 0 0 2 0 A1 1 0 0 0 1 1 A1 1 0 0 0 2 2 L3 2 A1 1 0 0 1 4 3 A1 1 0 0 1 3 4 A2 2 0 0 1 1 4"
            fill="none"
            stroke="url(#textGradient)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </g>
      
      {/* Subtle glow effect */}
      <rect
        x="1"
        y="1"
        width="30"
        height="30"
        rx="8"
        fill="none"
        stroke="rgba(255, 255, 255, 0.1)"
        strokeWidth="1"
      />
    </svg>
  );
}

// Minimal version with stylized Xogs
export function XLogoMinimal({ className = "h-8 w-8", textSize = "text-xs" }: { className?: string; textSize?: string }) {
  return (
    <div className={`${className} relative flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-xl shadow-lg overflow-hidden`}>
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
      
      {/* Xogs letters */}
      <div className={`relative z-10 text-white font-bold ${textSize} tracking-tight`}>
        Xogs
      </div>
    </div>
  );
}

// Brand version with modern Xogs styling
export function XLogoBrand({ className = "h-8 w-8", size = 32 }: { className?: string; size?: number }) {
  return (
      <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="brandXogsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="50%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
        <linearGradient id="brandTextGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F8FAFC" />
        </linearGradient>
      </defs>
      
      {/* Background */}
      <rect
        x="2"
        y="2"
        width="28"
        height="28"
        rx="6"
        fill="url(#brandXogsGradient)"
        stroke="rgba(255, 255, 255, 0.2)"
        strokeWidth="0.5"
      />
      
      {/* Xogs text - larger and more prominent */}
      <g>
        {/* X */}
        <g transform="translate(6, 12)">
          <path
            d="M0 0 L4 4 M4 0 L0 4"
            stroke="url(#brandTextGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        
        {/* o */}
        <g transform="translate(11, 12)">
          <circle
            cx="2"
            cy="2"
            r="2"
            fill="none"
            stroke="url(#brandTextGradient)"
            strokeWidth="2"
          />
        </g>
        
        {/* g - 正常小写设计 */}
        <g transform="translate(16, 12)">
          <path
            d="M4 0 A2 2 0 0 0 0 2 A2 2 0 0 0 2 4 A2 2 0 0 0 4 2 L4 6"
            fill="none"
            stroke="url(#brandTextGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        
        {/* s */}
        <g transform="translate(21, 12)">
        <path
            d="M4 0 A2 2 0 0 0 2 0 A1 1 0 0 0 1 1 A1 1 0 0 0 2 2 L3 2 A1 1 0 0 1 4 3 A1 1 0 0 1 3 4 A2 2 0 0 1 1 4"
            fill="none"
            stroke="url(#brandTextGradient)"
            strokeWidth="2"
          strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </g>
      
      {/* Accent dot */}
      <circle
        cx="26"
        cy="8"
        r="1.5"
        fill="rgba(255, 255, 255, 0.4)"
        />
      </svg>
  );
}

// Large version for hero sections
export function XLogoHero({ className = "h-16 w-16", size = 64 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="heroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#667eea" />
          <stop offset="25%" stopColor="#764ba2" />
          <stop offset="75%" stopColor="#f093fb" />
          <stop offset="100%" stopColor="#f5576c" />
        </linearGradient>
        <linearGradient id="heroTextGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Background with glow */}
      <rect
        x="4"
        y="4"
        width="56"
        height="56"
        rx="16"
        fill="url(#heroGradient)"
        stroke="rgba(255, 255, 255, 0.3)"
        strokeWidth="1"
        filter="url(#glow)"
      />
      
      {/* Xogs text - large and bold */}
      <g transform="translate(32, 32)">
        {/* X */}
        <g transform="translate(-20, -6)">
          <path
            d="M0 0 L8 8 M8 0 L0 8"
            stroke="url(#heroTextGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        
        {/* o */}
        <g transform="translate(-6, -6)">
          <circle
            cx="4"
            cy="4"
            r="4"
            fill="none"
            stroke="url(#heroTextGradient)"
            strokeWidth="3"
          />
        </g>
        
        {/* g - 正常小写设计 */}
        <g transform="translate(6, -6)">
          <path
            d="M8 0 A4 4 0 0 0 0 4 A4 4 0 0 0 4 8 A4 4 0 0 0 8 4 L8 12"
            fill="none"
            stroke="url(#heroTextGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        
        {/* s */}
        <g transform="translate(18, -6)">
          <path
            d="M8 0 A4 4 0 0 0 4 0 A2 2 0 0 0 2 2 A2 2 0 0 0 4 4 L6 4 A2 2 0 0 1 8 6 A2 2 0 0 1 6 8 A4 4 0 0 1 2 8"
            fill="none"
            stroke="url(#heroTextGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </g>
      
      {/* Corner accents */}
      <circle cx="52" cy="12" r="2" fill="rgba(255, 255, 255, 0.3)" />
      <circle cx="12" cy="52" r="2" fill="rgba(255, 255, 255, 0.3)" />
    </svg>
  );
} 