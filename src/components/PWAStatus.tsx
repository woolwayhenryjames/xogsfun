'use client';

import { useState, useEffect } from 'react';
import { Check, X, AlertCircle, Smartphone, Monitor } from 'lucide-react';

interface PWAStatus {
  serviceWorkerSupported: boolean;
  serviceWorkerRegistered: boolean;
  manifestValid: boolean;
  installable: boolean;
  standalone: boolean;
  httpsSecure: boolean;
}

export default function PWAStatus() {
  const [status, setStatus] = useState<PWAStatus>({
    serviceWorkerSupported: false,
    serviceWorkerRegistered: false,
    manifestValid: false,
    installable: false,
    standalone: false,
    httpsSecure: false
  });
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const checkPWAStatus = async () => {
      const newStatus: PWAStatus = {
        serviceWorkerSupported: 'serviceWorker' in navigator,
        serviceWorkerRegistered: false,
        manifestValid: false,
        installable: false,
        standalone: window.matchMedia && window.matchMedia('(display-mode: standalone)').matches,
        httpsSecure: location.protocol === 'https:' || location.hostname === 'localhost'
      };

      // Check service worker registration
      if (newStatus.serviceWorkerSupported) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          newStatus.serviceWorkerRegistered = !!registration;
        } catch (error) {
          console.error('Service Worker check failed:', error);
        }
      }

      // Check manifest
      try {
        const manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
        if (manifestLink) {
          const response = await fetch(manifestLink.href);
          const manifest = await response.json();
          newStatus.manifestValid = !!(manifest.name && manifest.start_url && manifest.icons);
        }
      } catch (error) {
        console.error('Manifest check failed:', error);
      }

      setStatus(newStatus);
    };

    checkPWAStatus();

    // Listen for installable event
    const handleInstallable = () => {
      setStatus(prev => ({ ...prev, installable: true }));
    };

    window.addEventListener('pwa-installable', handleInstallable);
    return () => window.removeEventListener('pwa-installable', handleInstallable);
  }, []);

  const StatusIcon = ({ condition }: { condition: boolean }) => (
    condition ? 
      <Check className="w-4 h-4 text-green-500" /> : 
      <X className="w-4 h-4 text-red-500" />
  );

  const getOverallStatus = () => {
    const requiredChecks = [
      status.serviceWorkerSupported,
      status.serviceWorkerRegistered,
      status.manifestValid,
      status.httpsSecure
    ];
    const passedChecks = requiredChecks.filter(Boolean).length;
    const totalChecks = requiredChecks.length;
    
    if (passedChecks === totalChecks) return 'excellent';
    if (passedChecks >= totalChecks - 1) return 'good';
    if (passedChecks >= totalChecks / 2) return 'fair';
    return 'poor';
  };

  const overallStatus = getOverallStatus();
  const statusColors = {
    excellent: 'bg-green-500',
    good: 'bg-blue-500',
    fair: 'bg-yellow-500',
    poor: 'bg-red-500'
  };

  // Only show in development or if there are issues
  if (process.env.NODE_ENV === 'production' && overallStatus === 'excellent' && !showDetails) {
    return (
      <button
        onClick={() => setShowDetails(true)}
        className="fixed bottom-4 left-4 z-30 bg-green-500 text-white p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
        title="PWA Status: Excellent"
      >
        <Smartphone className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-30 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${statusColors[overallStatus]}`}></div>
          <h3 className="font-semibold text-sm">PWA Status</h3>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-gray-400 hover:text-gray-600"
        >
          {showDetails ? <X className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
        </button>
      </div>

      {showDetails && (
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span>Service Worker Support</span>
            <StatusIcon condition={status.serviceWorkerSupported} />
          </div>
          <div className="flex items-center justify-between">
            <span>Service Worker Active</span>
            <StatusIcon condition={status.serviceWorkerRegistered} />
          </div>
          <div className="flex items-center justify-between">
            <span>Valid Manifest</span>
            <StatusIcon condition={status.manifestValid} />
          </div>
          <div className="flex items-center justify-between">
            <span>HTTPS Secure</span>
            <StatusIcon condition={status.httpsSecure} />
          </div>
          <div className="flex items-center justify-between">
            <span>Installable</span>
            <StatusIcon condition={status.installable} />
          </div>
          <div className="flex items-center justify-between">
            <span>Running Standalone</span>
            <StatusIcon condition={status.standalone} />
          </div>
          
          <div className="pt-2 border-t border-gray-200 flex items-center gap-2">
            {status.standalone ? (
              <Smartphone className="w-4 h-4 text-green-500" />
            ) : (
              <Monitor className="w-4 h-4 text-blue-500" />
            )}
            <span className="text-xs text-gray-600">
              {status.standalone ? 'App Mode' : 'Browser Mode'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}