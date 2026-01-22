'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Avatar } from './Avatar';
import { LogOut, ChevronDown, User, Settings, Coins, Trophy, Bot, Sparkles, Wallet, Rocket } from 'lucide-react';

export function UserDropdown() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasInfofiAccess, setHasInfofiAccess] = useState(false);
  const [infofiRank, setInfofiRank] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);

  // Stabilize user data to avoid frequent re-renders
  const userInfo = useMemo(() => {
    if (!session?.user) return null;
    return {
      image: session.user.image,
      name: session.user.name,
      email: session.user.email,
      username: (session.user as any).username || (session.user as any).displayName || session.user.name || 'User',
      platformId: (session.user as any).platformId
    };
  }, [session?.user?.image, session?.user?.name, session?.user?.email, (session?.user as any)?.username, (session?.user as any)?.platformId]);

  // Check if user is admin
  useEffect(() => {
    if (userInfo?.platformId === 10000) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [userInfo?.platformId]);

  // Check InfoFi access for logged in users
  useEffect(() => {
    const checkInfofiAccess = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch('/api/user/check-infofi-access');
          if (response.ok) {
            const data = await response.json();
            setHasInfofiAccess(data.hasAccess);
            setInfofiRank(data.userRank);
          }
        } catch (error) {
          console.error('Error checking InfoFi access:', error);
        }
      }
    };

    checkInfofiAccess();
  }, [session?.user?.id]);

  // Close dropdown when clicking outside and update button position
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function updateButtonRect() {
      if (buttonRef.current && isOpen) {
        setButtonRect(buttonRef.current.getBoundingClientRect());
      }
    }

    if (isOpen) {
      updateButtonRect();
      window.addEventListener('scroll', updateButtonRect);
      window.addEventListener('resize', updateButtonRect);
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', updateButtonRect);
      window.removeEventListener('resize', updateButtonRect);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut({
        callbackUrl: '/',
      });
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!userInfo) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && buttonRef.current) {
            setButtonRect(buttonRef.current.getBoundingClientRect());
          }
        }}
        className="flex items-center gap-2 p-2 rounded-lg transition-colors duration-150 hover:bg-gray-50 min-w-0"
      >
        <div className="flex-shrink-0">
          <Avatar
            src={userInfo.image}
            name={userInfo.name}
            size="sm"
          />
        </div>
        <div className="text-left min-w-0 flex-1">
          <div className="text-sm font-medium text-gray-900 truncate">
            {userInfo.name}
          </div>
          <div className="text-xs text-gray-500 truncate">
            @{userInfo.username}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu - Rendered to body using Portal */}
      {isOpen && buttonRect && typeof window !== 'undefined' && 
        createPortal(
          <div 
            ref={dropdownRef}
            className="fixed w-64 bg-white rounded-lg shadow-2xl border border-gray-200 py-2 backdrop-blur-sm"
            style={{
              top: buttonRect.bottom + window.scrollY + 8,
              left: buttonRect.right - 256,
              zIndex: 999999
            }}
          >
          {/* User Information Area */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <Avatar
                  src={userInfo.image}
                  name={userInfo.name}
                  size="md"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {userInfo.name}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {userInfo.username}
                </div>
                <div className="text-xs text-gray-400 truncate">
                  {userInfo.email}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <a
              href="/profile"
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
              onClick={() => setIsOpen(false)}
            >
              <User className="w-4 h-4" />
              Profile
            </a>
            <a
              href="/task"
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
              onClick={() => setIsOpen(false)}
            >
              <Trophy className="w-4 h-4" />
              Tasks
            </a>
            <a
              href="/xogs"
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
              onClick={() => setIsOpen(false)}
            >
              <Coins className="w-4 h-4" />
              $XOGS Records
            </a>
            <a
              href="/solana"
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
              onClick={() => setIsOpen(false)}
            >
              <Wallet className="w-4 h-4" />
              Bind SOL Address
            </a>
{/* Web3项目链接暂时隐藏，等页面完善后再显示
            <a
              href="/web3"
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
              onClick={() => setIsOpen(false)}
            >
              <Rocket className="w-4 h-4" />
              Web3 Projects
            </a>
            */}

            {/* InfoFi Menu Item - Temporarily hidden */}
            {false && hasInfofiAccess && (
              <a
                href="/infofi"
                className="flex items-center gap-3 px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 transition-colors duration-150 bg-gradient-to-r from-purple-50/50 to-blue-50/50 border-l-2 border-purple-400"
                onClick={() => setIsOpen(false)}
              >
                <div className="relative">
                  <Bot className="w-4 h-4" />
                  <Sparkles className="w-2 h-2 absolute -top-1 -right-1 text-purple-500" />
                </div>
                <div>
                  <div className="font-medium">InfoFi Studio</div>
                  <div className="text-xs text-purple-600">
                    Beta Tester • AI Tweet Generator
                  </div>
                </div>
              </a>
            )}
              
              {/* Admin Menu Items */}
              {isAdmin && (
                <>
                <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
                  <div className="text-xs text-blue-600 font-medium flex items-center gap-1">
                    <Settings className="w-3 h-3" />
                    Admin Functions
                  </div>
                </div>
                <a
                  href="/admin/ai-scores"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors duration-150"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  <div>
                    <div className="font-medium">Admin Console</div>
                    <div className="text-xs text-gray-500">AI Score and $XOGS Balance Management</div>
                  </div>
                </a>
                </>
              )}
            
            <button
              onClick={handleSignOut}
              disabled={isLoading}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="klout-spinner w-4 h-4"></div>
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              {isLoading ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>
          </div>,
          document.body
        )
      }
    </div>
  );
} 