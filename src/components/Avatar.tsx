'use client';

import { cn } from '@/lib/utils';
import { User } from 'lucide-react';
import { useState } from 'react';

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24'
};

const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
};

const textSizes = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-xl'
};

export function Avatar({ 
  src, 
  name, 
  size = 'md', 
  className 
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  
  const initials = name
    ? name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '';

  const handleImageError = () => {
    setImageError(true);
  };

  const shouldShowImage = src && !imageError;

  return (
    <div
      className={cn(
        'apple-avatar',
        'relative inline-flex items-center justify-center',
        'bg-gradient-to-br from-blue-500 to-purple-600',
        'text-white font-semibold',
        'apple-rounded-2xl',
        'apple-shadow',
        'apple-hover-scale',
        'overflow-hidden',
        'ring-2 ring-white/20',
        sizeClasses[size],
        className
      )}
    >
      {shouldShowImage ? (
        <img
          src={src}
          alt={name || 'User Avatar'}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
      ) : initials ? (
        <span className={cn('font-semibold', textSizes[size])}>
          {initials}
        </span>
      ) : (
        <User className={cn('text-white/80', iconSizes[size])} />
      )}
    </div>
  );
} 