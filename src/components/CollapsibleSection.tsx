'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  variant?: 'default' | 'warning' | 'info' | 'success';
  className?: string;
}

export function CollapsibleSection({
  title,
  subtitle,
  icon,
  children,
  defaultOpen = false,
  variant = 'default',
  className = ''
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200';
      case 'info':
        return 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200';
      case 'success':
        return 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200';
      default:
        return 'bg-white/90 backdrop-blur-xl border-gray-200';
    }
  };

  const getIconBgStyles = () => {
    switch (variant) {
      case 'warning':
        return 'bg-gradient-to-br from-red-500 to-orange-500';
      case 'info':
        return 'bg-gradient-to-br from-blue-500 to-indigo-600';
      case 'success':
        return 'bg-gradient-to-br from-green-500 to-emerald-600';
      default:
        return 'bg-gradient-to-br from-gray-500 to-gray-600';
    }
  };

  return (
    <div className={`apple-rounded-2xl border apple-shadow transition-all duration-300 apple-hover-lift ${getVariantStyles()} ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 text-left transition-all duration-200 hover:bg-black/5 apple-rounded-2xl apple-interactive apple-focus-ring"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {icon && (
              <div className={`w-12 h-12 apple-rounded-2xl flex items-center justify-center ${getIconBgStyles()} apple-shadow apple-hover-scale`}>
                {icon}
              </div>
            )}
            <div>
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
          <div className="transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            <ChevronDown className="h-5 w-5 text-gray-500" />
          </div>
        </div>
      </button>
      
      {/* 内容区：收起时完全不渲染 children，避免遮挡 */}
      {isOpen && (
        <div className="overflow-visible transition-all duration-300 max-h-[2000px] opacity-100">
        <div className="px-6 pb-6">
          {children}
        </div>
      </div>
      )}
    </div>
  );
} 