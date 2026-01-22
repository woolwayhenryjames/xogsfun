import { useState, useEffect } from 'react';

// Supported languages
export const locales = {
  en: 'English'
} as const;

export type Locale = keyof typeof locales;

// Default language
export const defaultLocale: Locale = 'en';

// Language storage key
const LOCALE_STORAGE_KEY = 'xogs-locale';

// Get browser language
export function getBrowserLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale;
  
  const browserLang = navigator.language.split('-')[0];
  return (browserLang in locales) ? browserLang as Locale : defaultLocale;
}

// Get current language
export function getCurrentLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale;
  
  const storedLocale = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (storedLocale && storedLocale in locales) {
    return storedLocale as Locale;
  }
  
  return getBrowserLocale();
}

// Set language
export function setLocale(locale: Locale): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  window.dispatchEvent(new CustomEvent('localeChange', { detail: locale }));
}

// Language hook
export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  useEffect(() => {
    // Initialize language
    setLocaleState(getCurrentLocale());

    // Listen for language changes
    const handleLocaleChange = (event: CustomEvent<Locale>) => {
      setLocaleState(event.detail);
    };

    window.addEventListener('localeChange', handleLocaleChange as EventListener);
    
    return () => {
      window.removeEventListener('localeChange', handleLocaleChange as EventListener);
    };
  }, []);

  const changeLocale = (newLocale: Locale) => {
    setLocale(newLocale);
  };

  return { locale, changeLocale };
}

// Translation function
export function createTranslator(locale: Locale) {
  let messages: any = {};

  // Dynamically import translation files
  const loadMessages = async () => {
    try {
      const response = await fetch(`/locales/${locale}.json`);
      messages = await response.json();
    } catch (error) {
      console.error('Failed to load messages:', error);
      // 加载默认语言
      if (locale !== defaultLocale) {
        const response = await fetch(`/locales/${defaultLocale}.json`);
        messages = await response.json();
      }
    }
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value = messages;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }
    
    if (typeof value !== 'string') {
      return key; // 返回key作为fallback
    }
    
    // 处理参数替换
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match;
      });
    }
    
    return value;
  };

  return { t, loadMessages };
}

// 翻译hook
export function useTranslator() {
  const { locale } = useLocale();
  const [messages, setMessages] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMessages = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/locales/${locale}.json`);
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error('Failed to load messages:', error);
        // 加载默认语言
        if (locale !== defaultLocale) {
          try {
            const response = await fetch(`/locales/${defaultLocale}.json`);
            const data = await response.json();
            setMessages(data);
          } catch (fallbackError) {
            console.error('Failed to load fallback messages:', fallbackError);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [locale]);

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value = messages;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }
    
    if (typeof value !== 'string') {
      return key; // 返回key作为fallback
    }
    
    // 处理参数替换
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match;
      });
    }
    
    return value;
  };

  return { t, locale, isLoading };
} 