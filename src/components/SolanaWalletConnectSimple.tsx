'use client';

import { useState, useEffect } from 'react';

import { PublicKey } from '@solana/web3.js';
import { Wallet, Check, AlertCircle, Loader2, Copy, Unlink } from 'lucide-react';
import toast from 'react-hot-toast';
import router from 'next/router';

interface SolanaWalletConnectProps {
  onConnect?: (address: string) => void;
  savedAddress?: string;
  onUnlink?: () => void;
}

export function SolanaWalletConnectSimple({ onConnect, savedAddress, onUnlink }: SolanaWalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [hasShownSuccessToast, setHasShownSuccessToast] = useState(false);

  // Detect mobile device
  const isMobile = () => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  // Detect if inside Phantom app
  const isInPhantomApp = () => {
    if (typeof window === 'undefined') return false;
    return /Phantom/i.test(navigator.userAgent);
  };

  // Get Phantom provider
  const getProvider = () => {
    if (typeof window === 'undefined') return null;

    // Check multiple possible Phantom injection methods
    if (window.solana?.isPhantom) {
      return window.solana;
    }

    // Sometimes Phantom might be in window.phantom.solana
    if (window.phantom?.solana?.isPhantom) {
      return window.phantom.solana;
    }

    // Check if there's a solana object but no isPhantom flag yet
    if (window.solana && !window.solana.isPhantom) {
      console.log('Found solana object but not marked as Phantom');
    }

    return null;
  };

  // Mobile deep link connection
  // Enhanced encryption function (for user ID)
  const encryptUserId = (userId: string): string => {
    const key = 'xogs_phantom_key_2024';
    const timestamp = Date.now().toString();

    // Combine user ID and timestamp for enhanced security
    const payload = `${userId}:${timestamp}`;
    let encrypted = '';

    for (let i = 0; i < payload.length; i++) {
      encrypted += String.fromCharCode(payload.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(encrypted);
  };

  // Decryption function
  const decryptUserId = (encryptedUserId: string): string => {
    try {
      const key = 'xogs_phantom_key_2024';
      const encrypted = atob(encryptedUserId);
      let decrypted = '';

      for (let i = 0; i < encrypted.length; i++) {
        decrypted += String.fromCharCode(encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length));
      }

      // Separate user ID and timestamp
      const parts = decrypted.split(':');
      if (parts.length !== 2) {
        console.error('Invalid encrypted format');
        return '';
      }

      const [userId, encryptedTimestamp] = parts;
      const timestampAge = Date.now() - parseInt(encryptedTimestamp);

      // 验证加密时间戳（防止重放攻击）
      if (timestampAge > 3600000) { // 1小时过期
        console.error('Encrypted payload expired');
        return '';
      }

      return userId;
    } catch (e) {
      console.error('Failed to decrypt user ID:', e);
      return '';
    }
  };

  const connectViaMobileDeepLink = () => {
    if (typeof window === 'undefined') return;

    // 获取用户ID
    let userId = '';
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
        userId = parsed.id;
      } catch (e) {
        console.log('Failed to parse user info');
      }
    }

    if (!userId) {
      const urlParams = new URLSearchParams(window.location.search);
      userId = urlParams.get('userId') || '';
    }

    if (!userId) {
      toast.error('User ID not found. Please login first.');
      return;
    }

    // 加密用户ID
    const encryptedUserId = encryptUserId(userId);
    const timestamp = Date.now();

    // 生成链接完整性校验码
    const linkHash = btoa(`${encryptedUserId}:${timestamp}:${userId}`).slice(0, 8);

    // 创建 Phantom 内置浏览器专用绑定链接（无需登录）
    const phantomBrowserUrl = `${window.location.origin}/solana/bind?uid=${encodeURIComponent(encryptedUserId)}&t=${timestamp}&h=${linkHash}`;

    console.log('生成 Phantom 内置浏览器链接:', {
      originalUserId: userId,
      encryptedUserId,
      phantomBrowserUrl
    });

    // 使用 Phantom 的浏览器功能打开链接
    const phantomUrl = `https://phantom.app/ul/browse/${encodeURIComponent(phantomBrowserUrl)}?ref=${encodeURIComponent(window.location.href)}`;

    console.log('打开 Phantom 浏览器:', phantomUrl);

    // 显示用户指引
    toast('Opening in Phantom browser...', {
      icon: '🌐',
      duration: 3000
    });

    // 打开 Phantom 内置浏览器
    window.open(phantomUrl, '_blank');
  };

  // 检查用户登录状态
  const checkUserAuth = () => {
    if (typeof window === 'undefined') return false;

    // 检查 localStorage 中的用户信息
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
        return parsed.id ? true : false;
      } catch (e) {
        console.log('Failed to parse user info');
        return false;
      }
    }

    // 检查 URL 参数中的 userId 或加密的 uid
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    const encryptedUserId = urlParams.get('uid');

    if (userId) return true;

    if (encryptedUserId) {
      const decryptedUserId = decryptUserId(encryptedUserId);
      if (decryptedUserId) {
        console.log('Found encrypted user ID, decrypted successfully');
        return true;
      }
    }

    return false;
  };

  useEffect(() => {
    // 首先检查用户登录状态
    const isAuthenticated = checkUserAuth();

    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to home page');
      window.location.href = '/';
      return;
    }

    setIsCheckingAuth(false);

    // 检查是否在 Phantom 内置浏览器中，如果是，直接尝试连接
    const urlParams = new URLSearchParams(window.location.search);
    // 移动端现在使用专门的绑定页面，不需要在主页面处理

    // Phantom 钱包检测函数，带重试机制
    const detectPhantom = () => {
      console.log('Detecting Phantom wallet...');
      console.log('User Agent:', navigator.userAgent);
      console.log('Is Mobile:', isMobile());
      console.log('Is in Phantom App:', isInPhantomApp());
      console.log('window.solana:', window.solana);
      console.log('window.phantom:', window.phantom);
      console.log('window.solana?.isPhantom:', window.solana?.isPhantom);

      const provider = getProvider();

      if (provider) {
        console.log('✅ Phantom wallet detected successfully!');
        return true;
      }

      console.log('❌ Phantom wallet not detected');
      return false;
    };

    // 等待 DOM 完全加载后再检测
    const waitForDOMAndDetect = () => {
      if (document.readyState === 'complete') {
        performDetection();
      } else {
        window.addEventListener('load', performDetection);
        return () => window.removeEventListener('load', performDetection);
      }
    };

    const performDetection = () => {
      // 立即检测一次
      if (detectPhantom()) {
        setupPhantomListeners();
      } else {
        // 如果立即检测失败，设置重试机制
        console.log('Phantom not detected immediately, setting up retry...');

        let retryCount = 0;
        const maxRetries = isMobile() ? 30 : 15; // 移动端大幅增加重试次数
        const retryInterval = isMobile() ? 1500 : 500; // 移动端增加重试间隔

        const retryDetection = setInterval(() => {
          retryCount++;
          console.log(`Phantom detection retry ${retryCount}/${maxRetries}`);

          if (detectPhantom()) {
            console.log('Phantom detected on retry!');
            clearInterval(retryDetection);
            setupPhantomListeners();
          } else if (retryCount >= maxRetries) {
            console.log('Phantom detection failed after all retries');
            clearInterval(retryDetection);

            // 移动端最后尝试监听 window 对象变化
            if (isMobile()) {
              console.log('Setting up window object listener for mobile...');
              const windowListener = () => {
                if (detectPhantom()) {
                  console.log('Phantom detected via window listener!');
                  setupPhantomListeners();
                  window.removeEventListener('focus', windowListener);
                }
              };
              window.addEventListener('focus', windowListener);

              // 5分钟后清理监听器
              setTimeout(() => {
                window.removeEventListener('focus', windowListener);
              }, 300000);
            }
          }
        }, retryInterval);

        // 清理函数中也要清理这个定时器
        return () => {
          clearInterval(retryDetection);
        };
      }
    };

    return waitForDOMAndDetect();

    function setupPhantomListeners() {
      const provider = getProvider();
      if (!provider) return;

      // 设置事件监听器
      const handleConnect = (publicKey: PublicKey) => {
        console.log('Connected to Phantom:', publicKey.toString());
        setWalletAddress(publicKey.toString());
        setConnectionStatus('connected');

        if (onConnect) {
          onConnect(publicKey.toString());
        }

        // 只在首次连接时显示提示，避免重复
        if (!hasShownSuccessToast) {
          toast.success('🎉 Wallet connected successfully!');
          setHasShownSuccessToast(true);
        }
      };

      const handleDisconnect = () => {
        console.log('Disconnected from Phantom');
        setWalletAddress('');
        setConnectionStatus('idle');
        setHasShownSuccessToast(false); // 重置提示状态

        if (onUnlink) {
          onUnlink();
        }

        toast.success('Wallet disconnected');
      };

      const handleAccountChanged = (publicKey: PublicKey | null) => {
        if (publicKey) {
          console.log('Account changed to:', publicKey.toString());
          const newAddress = publicKey.toString();

          // 只有当地址真的改变时才更新和显示提示
          if (newAddress !== walletAddress) {
            setWalletAddress(newAddress);
            setConnectionStatus('connected');

            if (onConnect) {
              onConnect(newAddress);
            }
            // 账户切换时显示不同的提示
            toast.success('Account switched successfully');
          }
        } else {
          console.log('Account changed, attempting to reconnect');
          connectWallet();
        }
      };

      // 添加事件监听器
      provider.on('connect', handleConnect);
      provider.on('disconnect', handleDisconnect);
      provider.on('accountChanged', handleAccountChanged);

      // 检查是否已经连接
      if (provider.isConnected && provider.publicKey) {
        setWalletAddress(provider.publicKey.toString());
        setConnectionStatus('connected');
      }

      // 尝试自动连接（如果之前已信任）
      const tryEagerConnection = async () => {
        try {
          const response = await provider.connect({ onlyIfTrusted: true });
          console.log('Eager connection successful:', response.publicKey.toString());
          setWalletAddress(response.publicKey.toString());
          setConnectionStatus('connected');

          if (onConnect) {
            onConnect(response.publicKey.toString());
          }
          // 自动连接成功时不显示提示，避免重复
          setHasShownSuccessToast(true); // 标记已显示过提示
        } catch (error: any) {
          console.log('Eager connection failed:', error);
          // 这是正常的，用户需要手动连接
        }
      };

      tryEagerConnection();

      // 返回清理函数
      return () => {
        provider.removeListener('connect', handleConnect);
        provider.removeListener('disconnect', handleDisconnect);
        provider.removeListener('accountChanged', handleAccountChanged);
      };
    }

    // 设置保存的地址
    if (savedAddress) {
      const trimmedAddress = (savedAddress as string).trim();
      if (trimmedAddress) {
        setWalletAddress(trimmedAddress);
        setConnectionStatus('connected');
        setHasShownSuccessToast(true); // 如果有保存的地址，标记已显示过提示
      }
    }

    // 检查返回的连接数据
    const checkReturn = () => {
      if (typeof window === 'undefined') return;

      const urlParams = new URLSearchParams(window.location.search);
      const phantomReturn = urlParams.get('phantom_return');
      const publicKey = urlParams.get('publicKey') || urlParams.get('public_key') || urlParams.get('phantom_encryption_public_key');
      const error = urlParams.get('error') || urlParams.get('errorCode');
      const timestamp = urlParams.get('timestamp');
      const nonce = urlParams.get('nonce');
      const data = urlParams.get('data');

      console.log('检查返回数据:', {
        phantomReturn,
        publicKey,
        error,
        timestamp,
        nonce,
        data,
        isMobile: isMobile(),
        userAgent: navigator.userAgent,
        allUrlParams: Object.fromEntries(urlParams)
      });

      // 移动端调试：显示所有返回参数
      if (isMobile() && (phantomReturn === 'true' || data || nonce)) {
        console.log('=== 移动端连接返回调试信息 ===');
        console.log('所有URL参数:', Object.fromEntries(urlParams));
        urlParams.forEach((value, key) => {
          console.log(`${key}: ${value}`);
        });
        console.log('================================');
      }

      // 处理错误情况
      if (error) {
        console.error('连接错误:', error);
        toast.error(`Connection failed: ${error}`);
        setConnectionStatus('error');

        // 清理 URL 参数
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState(null, '', cleanUrl);
        return;
      }

      // 处理移动端连接返回 - 简化版本
      if (isMobile() && phantomReturn === 'true') {
        console.log('移动端连接返回检测');

        // 尝试从各种可能的参数中获取公钥
        const possibleKeys = [
          publicKey,
          urlParams.get('phantom_encryption_public_key'),
          urlParams.get('public_key'),
          urlParams.get('publicKey'),
          urlParams.get('address'),
          urlParams.get('account'),
          data,
          nonce
        ];

        let walletPublicKey = null;
        for (const key of possibleKeys) {
          if (key && typeof key === 'string' && key.length > 30 && key.length < 50) {
            // 简单验证：Solana 公钥通常是 32-44 字符的 base58 字符串
            if (/^[1-9A-HJ-NP-Za-km-z]+$/.test(key)) {
              walletPublicKey = key;
              break;
            }
          }
        }

        // 如果有 data 参数且还没找到公钥，尝试解析
        if (!walletPublicKey && data) {
          try {
            const decodedData = JSON.parse(decodeURIComponent(data));
            walletPublicKey = decodedData.publicKey || decodedData.public_key || decodedData.address;
          } catch (e) {
            console.log('Failed to parse data parameter:', e);
          }
        }

        if (walletPublicKey) {
          const trimmedPublicKey = walletPublicKey.trim();
          console.log('移动端连接成功，公钥:', trimmedPublicKey);

          setWalletAddress(trimmedPublicKey);
          setConnectionStatus('connected');

          if (onConnect) {
            onConnect(trimmedPublicKey);
          }

          // 移动端连接成功提示
          if (!hasShownSuccessToast) {
            toast.success('🎉 Mobile wallet connected successfully!');
            setHasShownSuccessToast(true);
          }

          // 清理 URL 参数
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState(null, '', cleanUrl);
          return;
        } else {
          console.log('移动端连接返回但未找到有效公钥');
          console.log('所有URL参数:', Object.fromEntries(urlParams));

          // 显示错误提示，但不阻止用户重试
          toast.error('Connection returned but no wallet address found. Please try again.');
          setConnectionStatus('error');
        }
      }

      // 处理桌面端公钥返回
      if (!isMobile() && phantomReturn === 'true' && publicKey) {
        const trimmedPublicKey = (publicKey as string).trim();
        if (trimmedPublicKey) {
          console.log('桌面端连接成功:', trimmedPublicKey);

          // 验证时间戳，确保是最近的连接
          if (timestamp) {
            const timeDiff = Date.now() - parseInt(timestamp);
            if (timeDiff > 300000) { // 5分钟超时
              console.log('连接超时，忽略旧连接');
              toast.error('Connection timeout, please try again');
              setConnectionStatus('error');
              return;
            }
          }

          setWalletAddress(trimmedPublicKey);
          setConnectionStatus('connected');

          if (onConnect) {
            onConnect(trimmedPublicKey);
          }

          // URL 返回的连接成功，只显示一次提示
          if (!hasShownSuccessToast) {
            toast.success('🎉 Wallet connected successfully!');
            setHasShownSuccessToast(true);
          }

          // 清理 URL 参数
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState(null, '', cleanUrl);
          return;
        }
      }

      // 如果没有返回数据，但标记为返回，可能是用户取消
      if (phantomReturn === 'true') {
        console.log('用户可能取消了连接');
        setConnectionStatus('idle');

        // 清理 URL 参数
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState(null, '', cleanUrl);
        return;
      }
    };

    checkReturn();
  }, [onConnect, onUnlink, savedAddress]);

  // 检查绑定状态的函数
  const checkBindingStatus = async () => {
    try {
      // 获取用户ID
      let userId = '';
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        try {
          const parsed = JSON.parse(userInfo);
          userId = parsed.id;
        } catch (e) {
          console.log('Failed to parse user info');
        }
      }

      if (!userId) {
        const urlParams = new URLSearchParams(window.location.search);
        userId = urlParams.get('userId') || '';
      }

      if (!userId) {
        throw new Error('User information not found');
      }

      // 检查用户是否已经绑定了地址
      const response = await fetch(`/api/user/info?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user info');
      }

      const data = await response.json();
      if (data.solanaAddress) {
        // 用户已经绑定了地址
        setWalletAddress(data.solanaAddress);
        setConnectionStatus('connected');
        if (onConnect) {
          onConnect(data.solanaAddress);
        }
        toast.success('🎉 Wallet binding detected! Address loaded successfully.');
        return true;
      } else {
        // 还没有绑定
        setConnectionStatus('idle');
        toast('No wallet binding found. You can try connecting again.', {
          icon: 'ℹ️',
          duration: 4000
        });
        return false;
      }
    } catch (error: any) {
      console.error('Failed to check binding status:', error);
      setConnectionStatus('idle');
      toast.error('Failed to refresh binding status: ' + (error.message || 'Unknown error'));
      return false;
    }
  };

  const connectWallet = async () => {
    const provider = getProvider();
    const mobile = isMobile();
    const inPhantomApp = isInPhantomApp();

    console.log('Connect wallet attempt:', { mobile, inPhantomApp, provider: !!provider });

    // 如果在移动端且没有检测到 provider，使用深度链接
    if (mobile && !provider && !inPhantomApp) {
      console.log('Mobile device without provider detected, using deep link');
      setIsConnecting(true);
      setConnectionStatus('connecting');

      toast('Opening Phantom app for connection...', {
        icon: '📱',
        duration: 3000
      });

      connectViaMobileDeepLink();

      // 设置超时，如果用户没有返回，保持connecting状态但提示用户
      setTimeout(() => {
        if (connectionStatus === 'connecting') {
          toast('If you completed the binding in Phantom, click "Check Binding Status" to refresh.', {
            icon: '💡',
            duration: 6000
          });
        }
      }, 30000); // 30秒后提示

      return;
    }

    if (!provider) {
      if (mobile) {
        toast.error('Please open this page in Phantom app or install Phantom wallet.');
      } else {
        toast.error('Phantom Wallet not detected. Please install Phantom wallet extension.');
      }
      return;
    }

    setIsConnecting(true);
    setConnectionStatus('connecting');

    try {
      // 使用官方推荐的 connect() 方法
      const response = await provider.connect();
      console.log('Connected to Phantom:', response.publicKey.toString());

      setWalletAddress(response.publicKey.toString());
      setConnectionStatus('connected');

      if (onConnect) {
        onConnect(response.publicKey.toString());
      }

      // 手动连接成功提示，只显示一次
      if (!hasShownSuccessToast) {
        toast.success('🎉 Wallet connected successfully!');
        setHasShownSuccessToast(true);
      }
    } catch (error: any) {
      console.error('Connection failed:', error);
      setConnectionStatus('error');

      if (error.code === 4001) {
        toast.error('User rejected the connection');
      } else if (mobile && !inPhantomApp) {
        toast.error('Please try opening this page in Phantom app');
      } else {
        toast.error('Connection failed: ' + (error.message || 'Unknown error'));
      }
    } finally {
      setIsConnecting(false);
    }
  };





  const disconnectWallet = async () => {
    const provider = getProvider();

    setIsConnecting(true);

    try {
      // 调用解绑 API
      await unlinkAddress();

      // 如果有 provider，则断开钱包连接
      if (provider) {
        await provider.disconnect();
      }

      // 清除本地状态
      setWalletAddress('');
      setConnectionStatus('idle');
      setHasShownSuccessToast(false); // 重置提示状态

      if (onUnlink) {
        onUnlink();
      }

      toast.success('Wallet disconnected successfully');
    } catch (error) {
      console.error('Disconnect failed:', error);
      toast.error('Failed to disconnect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const unlinkAddress = async () => {
    // 获取用户 ID
    let userId = '';
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
        userId = parsed.id;
      } catch (e) {
        console.log('Failed to parse user info');
      }
    }

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

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to unlink address');
    }
  };

  // 如果正在检查认证状态，显示加载界面
  if (isCheckingAuth) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // 如果已连接，显示连接状态
  const hasValidSavedAddress = savedAddress && (savedAddress as string).trim();
  const hasValidWalletAddress = walletAddress && walletAddress.trim();

  if (hasValidSavedAddress || hasValidWalletAddress) {
    const displayAddress = hasValidSavedAddress ? (savedAddress as string).trim() : walletAddress.trim();
    const shortAddress = displayAddress ? `${displayAddress.slice(0, 6)}...${displayAddress.slice(-6)}` : '';

    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-3xl p-6 shadow-lg">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Check className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-green-800 mb-3">
              Wallet Connected
            </h3>
            <div className="bg-white/70 rounded-2xl p-4 mb-4">
              <p className="text-green-700 font-mono text-base font-medium break-all">
                {shortAddress}
              </p>
              <p className="text-green-600 text-sm mt-1">
                ✅ Successfully Connected
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                if (displayAddress) {
                  navigator.clipboard.writeText(displayAddress);
                  toast.success('Address copied to clipboard');
                }
              }}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-green-700 border-2 border-green-200 px-4 py-3 rounded-2xl font-medium transition-all duration-300 hover:border-green-300 hover:shadow-md"
            >
              <Copy className="w-4 h-4" />
              Copy Full Address
            </button>

            <button
              onClick={disconnectWallet}
              disabled={isConnecting}
              className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-4 py-3 rounded-2xl font-medium transition-all duration-300 hover:shadow-md"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Disconnecting...
                </>
              ) : (
                <>
                  <Unlink className="w-4 h-4" />
                  Disconnect Wallet
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }





  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Wallet className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            Connect Your Wallet
          </h2>
        </div>
        <p className="text-gray-600">
          Connect with Phantom wallet to get started
        </p>
      </div>

      <div className="space-y-4">
        {/* Phantom 钱包按钮 */}
        <button
          onClick={connectWallet}
          disabled={isConnecting || connectionStatus === 'connecting'}
          className="w-full group relative overflow-hidden bg-gradient-to-r from-[#AB9FF2] to-[#9945FF] hover:from-[#9A8EE8] hover:to-[#8A3FEF] text-white px-6 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
        >
          <div className="relative flex items-center justify-center gap-3">
            {isConnecting || connectionStatus === 'connecting' ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                {/* Phantom 图标 */}
                <svg width="28" height="28" viewBox="0 0 128 128" fill="none" className="flex-shrink-0">
                  <rect width="128" height="128" rx="24" fill="white" />
                  <path
                    d="M85.3 46.5c-9.7-9.7-25.4-9.7-35.1 0C40.5 56.2 40.5 71.9 49.2 81.6c9.7 9.7 25.4 9.7 35.1 0 9.7-9.7 9.7-25.4 0-35.1zM76.5 55.3c4.3 4.3 4.3 11.4 0 15.7s-11.4 4.3-15.7 0-4.3-11.4 0-15.7 11.4-4.3 15.7 0z"
                    fill="#AB9FF2"
                  />
                  <circle cx="66" cy="62" r="3" fill="#9945FF" />
                  <circle cx="57" cy="71" r="3" fill="#9945FF" />
                </svg>
                <span>
                  {isMobile() && !getProvider() && !isInPhantomApp()
                    ? 'Open in Phantom Browser'
                    : 'Connect with Phantom'
                  }
                </span>
              </>
            )}
          </div>
        </button>



        {/* 移动端特殊提示 */}
        {isMobile() && !getProvider() && !isInPhantomApp() && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-xs">📱</span>
              </div>
              <div className="text-sm">
                <p className="font-medium text-blue-800 mb-2">Mobile Connection Guide</p>
                <div className="text-blue-700 space-y-1">
                  <p>• Click "Open in Phantom Browser" to open a secure binding page</p>
                  <p>• The page will open in Phantom's built-in browser</p>
                  <p>• No login required - connect your wallet directly</p>
                  <p>• After binding, return here and click "Check Binding Status"</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 移动端连接状态提示 */}
        {isMobile() && connectionStatus === 'connecting' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors mb-3"
            >
              🔄 Refresh Page
            </button>
            <p className="text-sm text-gray-600">
              If you have successfully bound your SOL address in Phantom wallet, please refresh to check and confirm.
            </p>
          </div>
        )}

        {/* 移动端备用手动输入方案 */}
        {isMobile() && connectionStatus === 'error' && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="text-sm">
              <p className="font-medium text-gray-800 mb-2">Alternative: Manual Address Input</p>
              <p className="text-gray-600 mb-3">If automatic connection doesn't work, you can manually enter your Solana wallet address:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter your Solana wallet address..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const address = (e.target as HTMLInputElement).value.trim();
                      if (address.length > 30 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(address)) {
                        setWalletAddress(address);
                        setConnectionStatus('connected');
                        if (onConnect) {
                          onConnect(address);
                        }
                        toast.success('Wallet address added manually!');
                      } else {
                        toast.error('Please enter a valid Solana wallet address');
                      }
                    }
                  }}
                />
                <button
                  onClick={(e) => {
                    const input = (e.target as HTMLButtonElement).previousElementSibling as HTMLInputElement;
                    const address = input.value.trim();
                    if (address.length > 30 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(address)) {
                      setWalletAddress(address);
                      setConnectionStatus('connected');
                      if (onConnect) {
                        onConnect(address);
                      }
                      toast.success('Wallet address added manually!');
                    } else {
                      toast.error('Please enter a valid Solana wallet address');
                    }
                  }}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 连接失败提示 */}
        {connectionStatus === 'error' && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm flex-1">
              <p className="font-medium text-red-800 mb-1">Connection Failed</p>
              <p className="text-red-700 mb-3">
                {isMobile()
                  ? "The automatic connection didn't work. You can try again or use manual input below."
                  : "Please check your Phantom wallet settings and try again."
                }
              </p>
              <button
                onClick={() => {
                  setConnectionStatus('idle');
                  connectWallet();
                }}
                className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
              >
                Retry Connection
              </button>
            </div>
          </div>
        )}

        {/* 提示信息 */}
        <div className="text-center text-sm text-gray-500 mt-4">
          <p>🔒 Secure • ⚡ Fast • 🛡️ Trusted</p>
        </div>
      </div>
    </div>
  );
}

// 扩展 Window 接口
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
    phantom?: {
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
    };
  }
}