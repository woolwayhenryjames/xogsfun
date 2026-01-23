'use client'

import { useState, useEffect } from 'react'
import { PublicKey } from '@solana/web3.js'
import { Wallet, Check, AlertCircle, Loader2 } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { Avatar } from '../../../components/Avatar'

// 解密函数（与主组件保持一致）
const decryptUserId = (encryptedUserId: string): string => {
  try {
    const key = 'xogs_phantom_key_2024';
    const encrypted = atob(encryptedUserId);
    let decrypted = '';

    for (let i = 0; i < encrypted.length; i++) {
      decrypted += String.fromCharCode(encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }

    // 分离用户ID和时间戳
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

export default function SolanaBindPage() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle')
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [userId, setUserId] = useState<string>('')
  const [isValidating, setIsValidating] = useState(true)
  const [userInfo, setUserInfo] = useState<{ username: string, name: string, image: string } | null>(null)
  const [hasTriedConnection, setHasTriedConnection] = useState(false)

  // 获取 Phantom provider
  const getProvider = () => {
    if (typeof window === 'undefined') return null;

    if (window.solana?.isPhantom) {
      return window.solana;
    }

    if (window.phantom?.solana?.isPhantom) {
      return window.phantom.solana;
    }

    return null;
  };

  useEffect(() => {
    // 验证参数和解密用户ID
    const validateParams = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const encryptedUserId = urlParams.get('uid');
      const timestamp = urlParams.get('t');
      const linkHash = urlParams.get('h');

      if (!encryptedUserId || !timestamp || !linkHash) {
        console.error('Missing required parameters');
        toast.error('Invalid link parameters. Please generate a new link from the main page.');
        setConnectionStatus('error');
        setIsValidating(false);
        return;
      }

      // 验证时间戳（链接有效期1小时）
      const linkAge = Date.now() - parseInt(timestamp);
      if (linkAge > 3600000) { // 1小时 = 3600000ms
        console.error('Link expired');
        toast.error('This link has expired. Please generate a new one.');
        setConnectionStatus('error');
        setIsValidating(false);
        return;
      }

      // 解密用户ID
      const decryptedUserId = decryptUserId(encryptedUserId);
      if (!decryptedUserId) {
        console.error('Failed to decrypt user ID');
        toast.error('Invalid user information. Please generate a new link from the main page.');
        setConnectionStatus('error');
        setIsValidating(false);
        return;
      }

      // 验证链接完整性
      const expectedHash = btoa(`${encryptedUserId}:${timestamp}:${decryptedUserId}`).slice(0, 8);
      if (linkHash !== expectedHash) {
        console.error('Link integrity check failed');
        toast.error('Invalid or tampered link. Please generate a new link from the main page.');
        setConnectionStatus('error');
        setIsValidating(false);
        return;
      }

      setUserId(decryptedUserId);

      // 获取用户信息
      fetchUserInfo(decryptedUserId);

      setIsValidating(false);
    };

    validateParams();
  }, []);

  // 获取用户信息
  const fetchUserInfo = async (userId: string) => {
    try {
      const response = await fetch(`/api/user/info?userId=${userId}`);

      if (response.ok) {
        const data = await response.json();
        setUserInfo({
          username: data.username || 'User',
          name: data.name || data.username || 'User',
          image: data.image || ''
        });
      } else {
        console.error('Failed to fetch user info:', response.status);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const connectWallet = async () => {
    if (!userId) {
      toast.error('User information not available. Please refresh the page or generate a new link.');
      setConnectionStatus('error');
      return;
    }

    const provider = getProvider();
    if (!provider) {
      toast.error('Phantom Wallet not detected. Please make sure you opened this page in Phantom browser.');
      setConnectionStatus('error');
      return;
    }

    setHasTriedConnection(true);
    setIsConnecting(true);
    setConnectionStatus('connecting');

    try {
      console.log('开始连接 Phantom 钱包...');

      // 连接钱包
      const response = await provider.connect();
      const publicKey = response.publicKey.toString();

      console.log('钱包连接成功:', publicKey);
      setWalletAddress(publicKey);

      // 调用绑定API
      console.log('开始绑定地址到用户:', { publicKey, userId });

      const bindResponse = await fetch('/api/user/bind-solana-direct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          solanaAddress: publicKey,
          userId: userId
        }),
      });

      if (bindResponse.ok) {
        const result = await bindResponse.json();
        console.log('地址绑定成功:', result);

        setConnectionStatus('connected');
        toast.success('🎉 Wallet connected and address bound successfully!');

      } else {
        const error = await bindResponse.json();
        throw new Error(error.error || 'Failed to bind address');
      }

    } catch (error: any) {
      console.error('连接或绑定失败:', error);
      setConnectionStatus('error');

      if (error.code === 4001) {
        toast.error('User rejected the connection');
      } else if (hasTriedConnection) {
        if (error.message?.includes('User ID')) {
          toast.error('User authentication failed. Please try generating a new link.');
        } else {
          toast.error('Connection failed: ' + (error.message || 'Unknown error'));
        }
      }
    } finally {
      setIsConnecting(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Validating connection parameters...</p>
        </div>
        <Toaster position="top-center" />
      </div>
    );
  }

  if (connectionStatus === 'connected') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-3xl p-6 shadow-lg text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Check className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-green-800 mb-3">
              Binding Successful!
            </h3>

            {/* 用户信息 */}
            {userInfo && (
              <div className="flex items-center justify-center gap-3 mb-4">
                <Avatar
                  src={userInfo.image}
                  name={userInfo.name}
                  size="sm"
                  className="border-2 border-green-200"
                />
                <div className="text-left">
                  <p className="font-bold text-green-800">{userInfo.name}</p>
                  <p className="text-sm text-green-600">@{userInfo.username}</p>
                </div>
              </div>
            )}

            <div className="bg-white/70 rounded-2xl p-4 mb-4">
              <p className="text-green-700 font-mono text-sm font-medium break-all">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-6)}
              </p>
              <p className="text-green-600 text-sm mt-1">
                ✅ Successfully Bound to {userInfo?.name || 'Your'} Account
              </p>
            </div>
            <div className="text-green-700 text-sm space-y-2">
              <p>Your Solana wallet address has been successfully bound to your account.</p>
              <p className="font-medium">✨ Next steps:</p>
              <p>• Go back to your browser and refresh the page</p>
              <p>• You should see your wallet address is now connected</p>
              <p>• You can close this Phantom browser tab</p>
            </div>
          </div>
        </div>
        <Toaster position="top-center" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-6">
          {/* 用户信息显示 */}
          {userInfo ? (
            <div className="flex items-center justify-center gap-3 mb-4">
              <Avatar
                src={userInfo.image}
                name={userInfo.name}
                size="md"
                className="border-2 border-purple-200"
              />
              <div className="text-left">
                <p className="font-bold text-gray-900">{userInfo.name}</p>
                <p className="text-sm text-gray-600">@{userInfo.username}</p>
              </div>
            </div>
          ) : userId && (
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse border-2 border-gray-300"></div>
              <div className="text-left">
                <div className="w-20 h-4 bg-gray-200 animate-pulse rounded mb-1"></div>
                <div className="w-16 h-3 bg-gray-200 animate-pulse rounded"></div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 mb-3">
            <Wallet className="w-8 h-8 text-purple-600" />
            <h2 className="text-3xl font-bold text-gray-900">
              Bind Wallet
            </h2>
          </div>
          <p className="text-gray-600">
            {userInfo
              ? `Connect your Phantom wallet to ${userInfo.name}'s account`
              : 'Connect your Phantom wallet to bind it to your account'
            }
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl shadow-gray-500/10 border border-gray-200/50 overflow-hidden p-6">
          <div className="space-y-4">
            {/* 连接按钮 */}
            <button
              onClick={connectWallet}
              disabled={isConnecting || connectionStatus === 'connecting'}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-[#AB9FF2] to-[#9945FF] hover:from-[#9A8EE8] hover:to-[#8A3FEF] text-white px-6 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              <div className="relative flex items-center justify-center gap-3">
                {isConnecting || connectionStatus === 'connecting' ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Connecting & Binding...</span>
                  </>
                ) : (
                  <>
                    <svg width="28" height="28" viewBox="0 0 128 128" fill="none" className="flex-shrink-0">
                      <rect width="128" height="128" rx="24" fill="white" />
                      <path
                        d="M85.3 46.5c-9.7-9.7-25.4-9.7-35.1 0C40.5 56.2 40.5 71.9 49.2 81.6c9.7 9.7 25.4 9.7 35.1 0 9.7-9.7 9.7-25.4 0-35.1zM76.5 55.3c4.3 4.3 4.3 11.4 0 15.7s-11.4 4.3-15.7 0-4.3-11.4 0-15.7 11.4-4.3 15.7 0z"
                        fill="#AB9FF2"
                      />
                      <circle cx="66" cy="62" r="3" fill="#9945FF" />
                      <circle cx="57" cy="71" r="3" fill="#9945FF" />
                    </svg>
                    <span>Connect & Bind Wallet</span>
                  </>
                )}
              </div>
            </button>

            {/* 错误提示 */}
            {connectionStatus === 'error' && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm flex-1">
                  <p className="font-medium text-red-800 mb-1">Connection Failed</p>
                  <div className="text-red-700 mb-3 space-y-1">
                    <p>This could be due to:</p>
                    <p>• Invalid or expired link</p>
                    <p>• Page not opened in Phantom browser</p>
                    <p>• Network connection issues</p>
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setConnectionStatus('idle');
                        connectWallet();
                      }}
                      className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 mr-2"
                    >
                      Retry Connection
                    </button>
                    <p className="text-xs text-red-600">
                      If this doesn't work, try refreshing the page or generate a new link.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 说明 */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-xs">ℹ️</span>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-blue-800 mb-1">How it works</p>
                  <div className="text-blue-700 space-y-1">
                    <p>• Click the button above to connect your Phantom wallet</p>
                    <p>• Your wallet address will be automatically bound to your account</p>
                    <p>• No login required - everything is handled securely</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toaster position="top-center" />
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