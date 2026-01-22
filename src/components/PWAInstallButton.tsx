'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function PWAInstallButton() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }
    };

    // Listen for PWA events
    const handleInstallable = () => {
      setIsInstallable(true);
      // Show banner after a delay
      setTimeout(() => setShowBanner(true), 3000);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setShowBanner(false);
    };

    checkIfInstalled();
    window.addEventListener('pwa-installable', handleInstallable);
    window.addEventListener('pwa-installed', handleInstalled);

    return () => {
      window.removeEventListener('pwa-installable', handleInstallable);
      window.removeEventListener('pwa-installed', handleInstalled);
    };
  }, []);

  const handleInstallClick = () => {
    window.dispatchEvent(new CustomEvent('pwa-install-click'));
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Don't show again for this session
    sessionStorage.setItem('pwa-banner-dismissed', 'true');
  };

  // Don't show if already installed or not installable
  if (isInstalled || !isInstallable) {
    return null;
  }

  // Check if user has dismissed the banner in this session
  if (typeof window !== 'undefined' && sessionStorage.getItem('pwa-banner-dismissed')) {
    return null;
  }

  return (
    <>
      {/* Install Banner */}
      {showBanner && (
        <div className="fixed top-4 left-4 right-4 z-50 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl shadow-lg p-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">Install XOGS App</p>
                <p className="text-xs opacity-90">Get the full experience</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleInstallClick}
                className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-xs font-medium transition-colors"
              >
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Install Button (always available when installable) */}
      <button
        onClick={handleInstallClick}
        className="fixed bottom-20 right-4 z-40 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
        title="Install XOGS App"
      >
        <Download className="w-5 h-5 group-hover:animate-bounce" />
      </button>
    </>
  );
}