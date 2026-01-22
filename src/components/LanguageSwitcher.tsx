'use client';

import { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useLocale, locales, type Locale } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export function LanguageSwitcher() {
  const { locale, changeLocale } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click outside to close dropdown menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageChange = (newLocale: Locale) => {
    changeLocale(newLocale);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1.5 px-2 py-1.5 rounded-lg bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-200 border border-gray-200/60 shadow-sm hover:shadow-md"
      >
        <Globe className="w-3.5 h-3.5 text-gray-500" />
        <span className="text-xs font-medium text-gray-600">
          {locales[locale]}
        </span>
        <ChevronDown 
          className={cn(
            "w-3 h-3 text-gray-400 transition-transform duration-200",
            isOpen && "transform rotate-180"
          )} 
        />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1.5 right-0 bg-white rounded-lg shadow-lg border border-gray-200/60 overflow-hidden z-50 min-w-[100px]">
          {Object.entries(locales).map(([key, name]) => (
            <button
              key={key}
              onClick={() => handleLanguageChange(key as Locale)}
              className={cn(
                "w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors duration-150 flex items-center space-x-2",
                locale === key && "bg-blue-50 text-blue-600 font-medium"
              )}
            >
              <span>{name}</span>
              {locale === key && (
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full ml-auto" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 