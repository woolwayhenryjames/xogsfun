'use client';

export function TwitterFooterLink() {
  return (
    <div className="flex justify-center py-6 mt-8">
      <a
        href="https://x.com/xogsfun"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors duration-200 text-sm"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
        <span>Follow @xogsfun</span>
      </a>
    </div>
  );
} 