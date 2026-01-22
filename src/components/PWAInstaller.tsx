'use client';

import { useEffect, useRef } from 'react';

export default function PWAInstaller() {
  const deferredPromptRef = useRef<any>(null);

  useEffect(() => {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
          });
          
          console.log('[PWA] Service Worker registered successfully:', registration.scope);
          
          // Handle updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content is available; refresh to get it
                  console.log('[PWA] New content available, refreshing...');
                  window.location.reload();
                }
              });
            }
          });
          
        } catch (error) {
          console.error('[PWA] Service Worker registration failed:', error);
        }
      });
    }

    // Handle PWA installation prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      deferredPromptRef.current = e;
      console.log('[PWA] Install prompt ready');
      
      // Dispatch custom event to show UI in your app
      window.dispatchEvent(new CustomEvent('pwa-installable'));
    };

    const handleAppInstalled = () => {
      console.log('[PWA] App was installed');
      deferredPromptRef.current = null;
      // App was installed, dispatch success event
      window.dispatchEvent(new CustomEvent('pwa-installed'));
    };

    const handleInstallClick = () => {
      if (deferredPromptRef.current) {
        deferredPromptRef.current.prompt();
        deferredPromptRef.current.userChoice.then((choiceResult: any) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('[PWA] User accepted the install prompt');
          } else {
            console.log('[PWA] User dismissed the install prompt');
          }
          deferredPromptRef.current = null;
        });
      }
    };

    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('pwa-install-click', handleInstallClick);

    // Cleanup listeners
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('pwa-install-click', handleInstallClick);
    };
  }, []);

  return null; // This component doesn't render anything
}