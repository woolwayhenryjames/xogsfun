'use client';

import { useState, useEffect } from 'react';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Wallet, Check, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface SolanaWalletConnectProps {
  onConnect?: (address: string) => void;
  savedAddress?: string;
  onUnlink?: () => void;
}

export function SolanaWalletConnect({ onConnect, savedAddress, onUnlink }: SolanaWalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isPhantomAvailable, setIsPhantomAvailable] = useState(false);

  useEffect(() => {
    // Check if Phantom wallet is available
    const checkPhantom = () => {
      if (typeof window !== 'undefined' && window.solana?.isPhantom) {
        setIsPhantomAvailable(true);
        console.log('Phantom wallet detected');
      } else {
        // Wait a bit for Phantom to inject
        setTimeout(() => {
          if (window.solana?.isPhantom) {
            setIsPhantomAvailable(true);
            console.log('Phantom wallet detected after delay');
          } else {
            // On mobile, we assume Phantom is available as we can redirect to it
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            if (isMobile) {
              setIsPhantomAvailable(true);
              console.log('Mobile detected, assuming Phantom is available');
            }
          }
        }, 1000);
      }
    };

    // Check for Phantom connection response in multiple formats
    const checkForPhantomResponse = () => {
      const urlParams = new URLSearchParams(window.location.search);
      
      // Check for phantom_return flag
      const isPhantomReturn = urlParams.get('phantom_return') === 'true';
      const browserHint = urlParams.get('browser');
      const safariReturn = urlParams.get('safari_return') === 'true';
      
      // Method 1: Standard Phantom response parameters
      const phantomEncryptionPublicKey = urlParams.get('phantom_encryption_public_key');
      const nonce = urlParams.get('nonce');
      const data = urlParams.get('data');
      
      // Method 2: Direct public key parameter (sometimes Phantom uses this)
      const publicKey = urlParams.get('publicKey') || urlParams.get('public_key');
      
      // Method 3: Check if we have errorCode or errorMessage
      const errorCode = urlParams.get('errorCode');
      const errorMessage = urlParams.get('errorMessage');
      
      // Detect current browser
      const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
      const isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
      const isFirefox = /Firefox/.test(navigator.userAgent);
      const currentBrowser = isSafari ? 'safari' : isChrome ? 'chrome' : isFirefox ? 'firefox' : 'unknown';
      
      // Check if we're in the wrong browser
      const originalBrowser = localStorage.getItem('phantom-original-browser');
      const isWrongBrowser = originalBrowser && originalBrowser !== currentBrowser;
      const isSafariReturn = localStorage.getItem('phantom-safari-return') === 'true';
      
      console.log('Checking Phantom response:', {
        isPhantomReturn,
        browserHint,
        originalBrowser,
        currentBrowser,
        isWrongBrowser,
        isSafariReturn,
        safariReturn,
        hasEncryptedResponse: !!(phantomEncryptionPublicKey && nonce && data),
        hasDirectPublicKey: !!publicKey,
        hasError: !!(errorCode || errorMessage),
        allParams: Object.fromEntries(urlParams.entries())
      });
      
      if (isPhantomReturn) {
        // Special handling for Safari returns
        if ((isSafariReturn && isSafari) || (isPhantomReturn && isSafari && localStorage.getItem('phantom-safari-return') === 'true')) {
          console.log('Safari return detected, checking for connection data...');
          
          // Clear Safari return flag
          localStorage.removeItem('phantom-safari-return');
          localStorage.removeItem('phantom-safari-timestamp');
          
          // If no connection data, show manual connection option
          if (!phantomEncryptionPublicKey && !publicKey && !errorCode) {
            console.log('Safari return without connection data, showing manual option');
            toast((t) => (
              <div className="flex flex-col gap-2">
                <div className="font-medium">Safari Phantom Connection</div>
                <div className="text-sm text-gray-600">Click below to complete connection in Safari</div>
                <button
                  onClick={() => {
                    toast.dismiss(t.id);
                    connectPhantomWallet();
                  }}
                  className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                >
                  Connect in Safari
                </button>
              </div>
            ), { duration: 15000 });
            return;
          }
        }
        
        // If we're in wrong browser, show message and try to redirect
        if (isWrongBrowser) {
          console.warn(`Wrong browser detected. Started in ${originalBrowser}, now in ${currentBrowser}`);
          toast.error(`Please return to your original browser (${originalBrowser}) to complete connection`, {
            duration: 8000,
            icon: '⚠️'
          });
          
          // Clean up the URL but keep the error visible
          cleanupPhantomResponse();
          return;
        }
        
        if (errorCode || errorMessage) {
          console.error('Phantom connection error:', { errorCode, errorMessage });
          
          // Handle specific error codes
          let userMessage = errorMessage || 'Connection failed';
          if (errorCode === '4001') {
            userMessage = 'Connection cancelled by user';
          } else if (errorCode === '4100') {
            userMessage = 'Unauthorized request - please try again';
          } else if (errorMessage && errorMessage.includes('unexpected')) {
            userMessage = 'Phantom connection error - please try manual connection below';
          }
          
          toast.error(userMessage, { duration: 5000 });
          
          // Special handling for Safari users
          const isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
          if (isSafari) {
            setTimeout(() => {
              toast((t) => (
                <div className="flex flex-col gap-2">
                  <div className="font-medium">Safari Connection Issue</div>
                  <div className="text-sm text-gray-600">Phantom may have opened in Chrome. Please return to Safari and try again.</div>
                  <button
                    onClick={() => {
                      toast.dismiss(t.id);
                      connectPhantomWallet();
                    }}
                    className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                  >
                    Try Again in Safari
                  </button>
                </div>
              ), { duration: 15000 });
            }, 1000);
          } else {
            // If there's an unexpected error, show manual connection option
            if (errorMessage && errorMessage.includes('unexpected')) {
              setTimeout(() => {
                toast((t) => (
                  <div className="flex flex-col gap-2">
                    <div className="font-medium">Try Manual Connection</div>
                    <div className="text-sm text-gray-600">Click if you have Phantom installed</div>
                    <button
                      onClick={() => {
                        toast.dismiss(t.id);
                        // Try to connect directly if Phantom is available
                        if (window.solana?.isPhantom) {
                          connectPhantomWallet();
                        } else {
                          toast.error('Phantom not detected in this browser');
                        }
                      }}
                      className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                    >
                      Connect Manually
                    </button>
                  </div>
                ), { duration: 10000 });
              }, 1000);
            }
          }
          
          cleanupPhantomResponse();
          return;
        }
        
        if (phantomEncryptionPublicKey && nonce && data) {
          console.log('Processing encrypted Phantom response');
          handlePhantomResponse(phantomEncryptionPublicKey, nonce, data);
          return;
        }
        
        if (publicKey) {
          console.log('Processing direct public key from Phantom');
          handleDirectPublicKey(publicKey);
          return;
        }
        
        // If phantom_return=true but no connection data, check localStorage
        console.log('Phantom return detected but no connection data, checking for existing session');
        checkPhantomSession();
      }
    };
    
    checkPhantom();
    checkForPhantomResponse();

    // Set up saved address if available
    if (savedAddress) {
      setWalletAddress(savedAddress);
    }
  }, [savedAddress]);

  const cleanupPhantomResponse = () => {
    // Clean up URL parameters while preserving userId
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    
    let cleanUrl = window.location.origin + window.location.pathname;
    if (userId) {
      cleanUrl += `?userId=${userId}`;
    }
    
    window.history.replaceState(null, '', cleanUrl);
    
    // Clean up browser tracking
    localStorage.removeItem('phantom-original-browser');
    localStorage.removeItem('phantom-return-url');
    localStorage.removeItem('phantom-safari-return');
    localStorage.removeItem('phantom-safari-timestamp');
  };

  const handleDirectPublicKey = async (publicKey: string) => {
    try {
      setIsConnecting(true);
      console.log('Processing direct public key from Phantom:', publicKey);
      
      // Set wallet address
      setWalletAddress(publicKey);
      
      // Call the parent's onConnect callback to bind the address
      if (onConnect) {
        await onConnect(publicKey);
      }
      
      toast.success('Wallet connected and address bound successfully!');
      cleanupPhantomResponse();
    } catch (error) {
      console.error('Failed to handle direct public key:', error);
      toast.error('Failed to process wallet connection');
    } finally {
      setIsConnecting(false);
    }
  };
  
  const checkPhantomSession = async () => {
    try {
      setIsConnecting(true);
      console.log('Checking for existing Phantom session...');
      
      // Try to connect to existing Phantom session
      if (window.solana?.isPhantom && window.solana?.isConnected) {
        const publicKey = window.solana.publicKey?.toString();
        if (publicKey) {
          console.log('Found existing Phantom session:', publicKey);
          setWalletAddress(publicKey);
          
          if (onConnect) {
            await onConnect(publicKey);
          }
          
          toast.success('Wallet reconnected successfully!');
          cleanupPhantomResponse();
          return;
        }
      }
      
      // Try to trigger connection if Phantom is available
      if (window.solana?.isPhantom) {
        console.log('Attempting to connect to Phantom...');
        try {
          const response = await window.solana.connect({ onlyIfTrusted: true });
          const publicKey = response.publicKey.toString();
          
          console.log('Connected to Phantom session:', publicKey);
          setWalletAddress(publicKey);
          
          if (onConnect) {
            await onConnect(publicKey);
          }
          
          toast.success('Wallet connected successfully!');
          cleanupPhantomResponse();
        } catch (connectError: any) {
          console.log('Failed to connect with onlyIfTrusted, trying manual connection...');
          
          // If onlyIfTrusted fails, show manual connection option
          toast((t) => (
            <div className="flex flex-col gap-2">
              <div className="font-medium">Phantom wallet detected!</div>
              <div className="text-sm text-gray-600">Click below to complete connection</div>
              <button
                onClick={async () => {
                  toast.dismiss(t.id);
                  try {
                    const response = await window.solana!.connect();
                    const publicKey = response.publicKey.toString();
                    setWalletAddress(publicKey);
                    
                    if (onConnect) {
                      await onConnect(publicKey);
                    }
                    
                    toast.success('Wallet connected successfully!');
                    cleanupPhantomResponse();
                  } catch (error) {
                    console.error('Manual connection failed:', error);
                    toast.error('Connection failed - please try again');
                  }
                }}
                className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
              >
                Connect Wallet
              </button>
            </div>
          ), { duration: 10000 });
        }
      } else {
        console.log('No Phantom session found');
        toast.error('Please connect your wallet in Phantom app');
        cleanupPhantomResponse();
      }
    } catch (error) {
      console.error('Failed to check Phantom session:', error);
      toast.error('Failed to connect wallet - please try again');
      cleanupPhantomResponse();
    } finally {
      setIsConnecting(false);
    }
  };

  const handlePhantomResponse = async (phantomEncryptionPublicKey: string, nonce: string, data: string) => {
    try {
      setIsConnecting(true);
      
      // Decode the response data  
      const decodedData = JSON.parse(atob(data));
      console.log('Phantom response data:', decodedData);
      
      if (decodedData.public_key) {
        const publicKey = decodedData.public_key;
        console.log('Connected to wallet via mobile:', publicKey);
        
        // Set wallet address first
        setWalletAddress(publicKey);
        
        // Call the parent's onConnect callback to bind the address
        if (onConnect) {
          await onConnect(publicKey);
        }
        
        toast.success('Wallet connected and address bound successfully!');
        cleanupPhantomResponse();
      } else {
        throw new Error('No public key in response');
      }
    } catch (error) {
      console.error('Failed to handle Phantom response:', error);
      toast.error('Failed to process wallet connection');
      cleanupPhantomResponse();
    } finally {
      setIsConnecting(false);
    }
  };

  const connectPhantomWallet = async () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Desktop: Check if Phantom is injected
    if (!isMobile && !window.solana?.isPhantom) {
      toast.error('Phantom wallet not found. Please install Phantom wallet.');
      window.open('https://phantom.app/', '_blank');
      return;
    }

    setIsConnecting(true);
    
    try {
      // Desktop: Direct connection if Phantom is available
      if (!isMobile && window.solana?.isPhantom) {
        const response = await window.solana.connect({ onlyIfTrusted: false });
        const publicKey = response.publicKey.toString();
        
        console.log('Connected to wallet:', publicKey);
        setWalletAddress(publicKey);
        
        if (onConnect) {
          await onConnect(publicKey);
        }
        
        toast.success('Wallet connected successfully!');
        return;
      }

      // Mobile: Direct wallet connect via Phantom deep link
      if (isMobile) {
        // Get user ID from various sources
        let userId = '';
        
        // Try to get from localStorage first
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
          try {
            const parsed = JSON.parse(userInfo);
            userId = parsed.id;
          } catch (error) {
            console.log('Failed to parse user info from localStorage');
          }
        }
        
        // If not found, try URL parameters
        if (!userId) {
          const urlParams = new URLSearchParams(window.location.search);
          userId = urlParams.get('userId') || '';
        }
        
        if (!userId) {
          toast.error('User identification required for mobile connection');
          return;
        }
        
        // Store current page info for return
        const currentUrl = window.location.href;
        localStorage.setItem('phantom-return-url', currentUrl);
        localStorage.setItem('phantom-user-id', userId);
        
        // Detect current browser to ensure return to same browser
        const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
        const isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
        const isFirefox = /Firefox/.test(navigator.userAgent);
        
        // Create browser-specific return URL
        const baseUrl = window.location.origin;
        const currentPath = window.location.pathname;
        let redirectUrl = `${baseUrl}${currentPath}?userId=${userId}&phantom_return=true`;
        
        // Add browser hint to help Phantom return to correct browser
        if (isSafari) {
          redirectUrl += '&browser=safari&safari_return=true';
        } else if (isChrome) {
          redirectUrl += '&browser=chrome';
        } else if (isFirefox) {
          redirectUrl += '&browser=firefox';
        }
        
        // Store browser info
        localStorage.setItem('phantom-original-browser', 
          isSafari ? 'safari' : isChrome ? 'chrome' : isFirefox ? 'firefox' : 'unknown'
        );
        
        // For Safari, store additional return info
        if (isSafari) {
          localStorage.setItem('phantom-safari-return', 'true');
          localStorage.setItem('phantom-safari-timestamp', Date.now().toString());
        }
        
        // Try multiple Phantom connection methods
        toast.success('Opening Phantom for wallet connection...', {
          duration: 3000,
          icon: '🚀'
        });
        
        console.log('Phantom connect details:', {
          baseUrl,
          redirectUrl,
          browser: isSafari ? 'Safari' : isChrome ? 'Chrome' : 'Other',
          userAgent: navigator.userAgent
        });
        
                    // Method 1: Try the official Phantom universal link
            const phantomUniversalLink = `https://phantom.app/ul/v1/connect?app_url=${encodeURIComponent(baseUrl)}&redirect_link=${encodeURIComponent(redirectUrl)}&cluster=mainnet-beta`;
            
            // Method 2: Try the direct app scheme (fallback)
            const phantomAppScheme = `phantom://v1/connect?app_url=${encodeURIComponent(baseUrl)}&redirect_link=${encodeURIComponent(redirectUrl)}&cluster=mainnet-beta`;
            
            // Method 3: Try the browse scheme (another fallback)
            const phantomBrowseScheme = `https://phantom.app/ul/browse/${encodeURIComponent(redirectUrl)}?ref=xogs`;
            
            // Method 4: Safari-specific connection method
            const safariPhantomUrl = isSafari ? 
              `https://phantom.app/ul/v1/connect?app_url=${encodeURIComponent(baseUrl)}&redirect_link=${encodeURIComponent(redirectUrl)}&cluster=mainnet-beta&browser=safari&platform=ios` :
              phantomUniversalLink;
        
        console.log('Trying connection methods:', {
          method1: phantomUniversalLink,
          method2: phantomAppScheme,
          method3: phantomBrowseScheme,
          method4: safariPhantomUrl
        });
        
        // Try different approaches based on browser
        try {
          if (isSafari) {
            // For Safari, use a more reliable approach
            console.log('Safari: Using enhanced connection method');
            
            // Try the Safari-specific URL first
            window.location.href = safariPhantomUrl;
            
            // Fallback after 3 seconds if Phantom doesn't open
            setTimeout(() => {
              console.log('Safari: Fallback to app scheme');
              window.location.href = phantomAppScheme;
            }, 3000);
            
            // Additional fallback after 6 seconds
            setTimeout(() => {
              console.log('Safari: Final fallback to browse method');
              window.open(phantomBrowseScheme, '_self');
            }, 6000);
            
          } else {
            // For other browsers, try universal link first
            console.log('Other browser: Trying universal link method');
            window.location.replace(phantomUniversalLink);
          }
        } catch (error) {
          console.error('Failed to open Phantom:', error);
          
          // Final fallback: try browse method
          console.log('Final fallback: trying browse method');
          window.open(phantomBrowseScheme, '_self');
        }
        
        return;
      }

    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      if (error.code === 4001) {
        toast.error('Connection cancelled by user');
      } else {
        toast.error('Failed to connect wallet: ' + error.message);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      // First, call the unlink API to remove address from database
      await unlinkAddressFromDatabase();
      
      // Then disconnect the wallet
      if (window.solana?.isConnected) {
        await window.solana.disconnect();
      }
      
      // Clear local state
      setWalletAddress('');
      
      // Call parent's onUnlink callback to update page state
      if (onUnlink) {
        onUnlink();
      }
      
      toast.success('Wallet disconnected and address unlinked');
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      toast.error('Failed to disconnect wallet');
    }
  };

  const unlinkAddressFromDatabase = async () => {
    try {
      // Get user ID from various sources
      let userId = '';
      
      // Try to get from localStorage first
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        try {
          const parsed = JSON.parse(userInfo);
          userId = parsed.id;
        } catch (error) {
          console.log('Failed to parse user info from localStorage');
        }
      }
      
      // If not found, try URL parameters
      if (!userId) {
        const urlParams = new URLSearchParams(window.location.search);
        userId = urlParams.get('userId') || '';
      }

      const response = await fetch('/api/user/unlink-solana', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId || undefined
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Address unlinked successfully:', result.message);
      } else {
        const error = await response.json();
        console.error('Failed to unlink address:', error.error);
        throw new Error(error.error || 'Failed to unlink address');
      }
    } catch (error) {
      console.error('Failed to unlink address from database:', error);
      throw error;
    }
  };

  // If wallet is already connected (saved address exists)
  if (savedAddress || walletAddress) {
    const displayAddress = savedAddress || walletAddress;
    const shortAddress = `${displayAddress.slice(0, 4)}...${displayAddress.slice(-4)}`;
    
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-3xl p-6 shadow-lg">
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-green-800 mb-2">
              Wallet Connected
            </h3>
            <p className="text-green-600 font-mono text-sm bg-white/50 rounded-lg px-3 py-2">
              {shortAddress}
            </p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => navigator.clipboard.writeText(displayAddress)}
              className="w-full bg-white hover:bg-gray-50 text-green-700 border-2 border-green-200 px-4 py-3 rounded-xl font-medium transition-all duration-300 hover:border-green-300"
            >
              Copy Full Address
            </button>
            
            <button
              onClick={disconnectWallet}
              className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl font-medium transition-all duration-300"
            >
              Disconnect Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Connect Your Wallet
        </h2>
        <p className="text-gray-600">
          Connect with Phantom to get started
        </p>
      </div>

      <div className="space-y-4">
        {/* Phantom Wallet Button - Beautiful design with Phantom branding */}
        <button
          onClick={connectPhantomWallet}
          disabled={isConnecting}
          className="w-full group relative overflow-hidden bg-gradient-to-r from-[#AB9FF2] to-[#9945FF] hover:from-[#9A8EE8] hover:to-[#8A3FEF] text-white px-6 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
        >
          {/* Background gradient animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#9945FF] to-[#AB9FF2] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="relative flex items-center justify-center gap-3">
            {isConnecting ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                {/* Phantom Icon SVG */}
                <svg width="28" height="28" viewBox="0 0 128 128" fill="none" className="flex-shrink-0">
                  <rect width="128" height="128" rx="24" fill="white"/>
                  <path 
                    d="M85.3 46.5c-9.7-9.7-25.4-9.7-35.1 0C40.5 56.2 40.5 71.9 49.2 81.6c9.7 9.7 25.4 9.7 35.1 0 9.7-9.7 9.7-25.4 0-35.1zM76.5 55.3c4.3 4.3 4.3 11.4 0 15.7s-11.4 4.3-15.7 0-4.3-11.4 0-15.7 11.4-4.3 15.7 0z" 
                    fill="#AB9FF2"
                  />
                  <circle cx="66" cy="62" r="3" fill="#9945FF"/>
                  <circle cx="57" cy="71" r="3" fill="#9945FF"/>
                </svg>
                <span className="group-hover:translate-x-1 transition-transform duration-300">
                  Connect with Phantom
                </span>
              </>
            )}
          </div>
        </button>

        {/* Backup Manual Connection Button for troubleshooting */}
        {typeof window !== 'undefined' && window.solana?.isPhantom && (
          <button
            onClick={async () => {
              try {
                setIsConnecting(true);
                const response = await window.solana!.connect();
                const publicKey = response.publicKey.toString();
                setWalletAddress(publicKey);
                
                if (onConnect) {
                  await onConnect(publicKey);
                }
                
                toast.success('Wallet connected successfully!');
              } catch (error) {
                console.error('Manual connection failed:', error);
                toast.error('Manual connection failed');
              } finally {
                setIsConnecting(false);
              }
            }}
            disabled={isConnecting}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-medium transition-all duration-300 border-2 border-gray-300 hover:border-gray-400"
          >
            🔧 Manual Connect (Troubleshoot)
          </button>
        )}

        {!isPhantomAvailable && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-800 mb-1">Phantom Wallet Not Detected</p>
              <p className="text-amber-700 mb-2">
                Please install Phantom wallet to continue.
              </p>
              <a 
                href="https://phantom.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-800 underline font-medium"
              >
                Install Phantom →
              </a>
            </div>
          </div>
        )}

        <div className="text-center text-sm text-gray-500 mt-4">
          {(() => {
            const isMobile = typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const isSafari = typeof window !== 'undefined' && /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
            const isChrome = typeof window !== 'undefined' && /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
            
            if (isMobile) {
              if (isSafari) {
                return (
                  <div className="space-y-2">
                    <p>📱 Safari detected - Click button to open Phantom</p>
                    <p className="text-xs text-amber-600">⚠️ If Phantom opens in Chrome, please return to Safari</p>
                    <p className="text-xs text-blue-600">💡 Tip: Make sure Phantom app is installed</p>
                  </div>
                );
              } else if (isChrome) {
                return <p>📱 Chrome detected - Click button to open Phantom app</p>;
              } else {
                return <p>📱 Mobile detected - Click button to open Phantom app</p>;
              }
            } else {
              return <p>💻 Desktop: Secure • Fast • Trusted by millions</p>;
            }
          })()}
        </div>
      </div>
    </div>
  );
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    solana?: {
      isPhantom: boolean;
      connect: (options?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: PublicKey }>;
      disconnect: () => Promise<void>;
      isConnected: boolean;
      publicKey?: PublicKey;
      signMessage: (message: Uint8Array, encoding?: string) => Promise<{ signature: Uint8Array }>;
      on: (event: string, callback: (data?: any) => void) => void;
      removeListener: (event: string, callback: (data?: any) => void) => void;
    };
  }
}