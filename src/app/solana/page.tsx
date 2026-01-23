'use client'

import { useState, useEffect } from 'react'
import { getSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { BottomNavigation } from '../../components/BottomNavigation'
import { UserDropdown } from '../../components/UserDropdown'
import { SolanaWalletConnectSimple } from '../../components/SolanaWalletConnectSimple'
import { Wallet, Coins, Info } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SolanaPage() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [savedAddress, setSavedAddress] = useState<string>('')

  useEffect(() => {
    const checkSession = async () => {
      try {
        const currentSession = await getSession()

        // 检查 URL 参数中是否有用户 ID (用于 Phantom 应用内)
        const urlParams = new URLSearchParams(window.location.search)
        const urlUserId = urlParams.get('userId')
        const isPhantomReturn = urlParams.get('phantom_return') === 'true'
        const error = urlParams.get('error')
        const isPhantomBrowser = /Phantom/.test(navigator.userAgent) || urlParams.get('phantom_browser') === 'true'

        console.log('Session check:', {
          currentSession: !!currentSession,
          urlUserId,
          isPhantomReturn,
          error,
          userAgent: navigator.userAgent
        })

        // 处理错误情况
        if (error) {
          console.log('Connection error detected, redirecting to home page')
          window.location.href = '/'
          return
        }

        if (currentSession?.user?.id) {
          // 用户已登录，正常流程
          setSession(currentSession)

          // 保存用户信息到 localStorage，供 Phantom 应用内使用
          localStorage.setItem('userInfo', JSON.stringify({
            id: currentSession.user.id,
            name: currentSession.user.name,
            email: currentSession.user.email
          }))

          await loadSavedAddress(currentSession.user.id)
          setLoading(false)
        } else if (urlUserId) {
          // 在 Phantom 应用内，通过 URL 参数获取用户 ID
          console.log('Using user ID from URL for Phantom app:', urlUserId)

          // 创建临时会话对象
          const tempSession = {
            user: {
              id: urlUserId,
              name: 'Phantom User',
              email: ''
            }
          }
          setSession(tempSession)
          await loadSavedAddress(urlUserId)
          setLoading(false)

          // 如果是从 Phantom 返回，显示提示
          if (isPhantomReturn) {
            console.log('Returned from Phantom, checking connection status...')
            toast('Checking wallet connection status...', { icon: '🔄' })
          }
        } else {
          // 既没有登录也没有 URL 参数，重定向到首页
          console.log('No session or userId found, redirecting to home page')
          window.location.href = '/'
          return
        }
      } catch (error) {
        console.error('Session check failed:', error)
        // 如果认证检查失败，直接重定向到首页
        console.log('Authentication check failed, redirecting to home page')
        window.location.href = '/'
        return
      }
    }

    checkSession()
  }, [])

  const loadSavedAddress = async (userId: string) => {
    try {
      // 检查是否需要通过 URL 参数传递用户 ID
      const currentSession = await getSession()
      const needsUserId = !currentSession?.user?.id

      const url = needsUserId
        ? `/api/user/solana-address-flexible?userId=${userId}`
        : `/api/user/solana-address-flexible`

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        if (data.solanaAddress) {
          setSavedAddress(data.solanaAddress)
        }
      } else {
        console.error('Failed to load saved address:', response.status)
      }
    } catch (error) {
      console.error('Failed to load saved address:', error)
    }
  }

  const handleWalletConnect = async (address: string) => {
    if (!address) {
      toast.error('Please connect wallet first')
      return
    }

    try {
      // 获取当前用户 ID
      const userId = session?.user?.id

      // 检查 URL 参数中的用户 ID (用于 Phantom 应用内)
      const urlParams = new URLSearchParams(window.location.search)
      const urlUserId = urlParams.get('userId')

      const targetUserId = userId || urlUserId

      console.log('Wallet connect attempt:', { address, userId, urlUserId, targetUserId })

      if (!targetUserId) {
        toast.error('User authentication failed')
        return
      }

      const response = await fetch('/api/user/bind-solana-flexible', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          solanaAddress: address,
          userId: targetUserId
        }),
      })

      console.log('Bind response status:', response.status)

      if (response.ok) {
        const result = await response.json()
        console.log('Bind success:', result)
        setSavedAddress(address)
        toast.success(result.message || 'SOL address bound successfully')
      } else {
        const error = await response.json()
        console.error('Bind error:', error)
        toast.error(error.error || 'Binding failed')
      }
    } catch (error) {
      console.error('Failed to bind address:', error)
      toast.error('Binding failed, please try again')
    }
  }

  const handleWalletUnlink = () => {
    // 清除保存的地址状态
    setSavedAddress('')
    console.log('Wallet address unlinked successfully')

    // 可选：刷新页面状态以确保从数据库重新加载
    if (session?.user?.id) {
      loadSavedAddress(session.user.id)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pb-32">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-gray-200/50">
        <div className="max-w-lg mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-all duration-300 group-hover:scale-110">
                <Wallet className="h-5 w-5 text-white group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <div className="group-hover:translate-x-1 transition-transform duration-300">
                <h1 className="text-lg font-semibold text-gray-900">Solana Wallet</h1>
                <p className="text-xs text-gray-500">Connect & Earn</p>
              </div>
            </div>

            <UserDropdown />
          </div>
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-8 space-y-8">
        {/* Hero Section - Simplified */}
        <div className="text-center space-y-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-3xl opacity-20 animate-pulse group-hover:opacity-30 transition-opacity duration-500"></div>
            <div className="relative w-24 h-24 mx-auto bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
              <Coins className="w-12 h-12 text-white group-hover:rotate-12 transition-transform duration-500" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-indigo-800 bg-clip-text text-transparent mb-3 hover:scale-105 transition-transform duration-300 cursor-default">
              Connect Solana Wallet
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              Bind your wallet to receive <span className="font-semibold text-purple-600">$XOGS tokens</span>
            </p>




          </div>
        </div>



        {/* Main Wallet Connection Section */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-gray-500/10 border border-gray-200/50 overflow-hidden hover:shadow-2xl hover:shadow-gray-500/20 transition-all duration-500">
          <div className="p-6">
            <SolanaWalletConnectSimple
              onConnect={handleWalletConnect}
              savedAddress={savedAddress}
              onUnlink={handleWalletUnlink}
            />
          </div>
        </div>

        {/* Important Notices - Moved to Bottom */}
        <div className="space-y-4 mt-8">
          {/* Combined Important Notice */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-red-600 text-sm font-bold">⚠️</span>
              </div>
              <div className="space-y-3">
                <h3 className="font-bold text-red-800 text-sm">IMPORTANT NOTICE</h3>
                <div className="text-red-700 text-sm space-y-1">
                  <p>• <strong>TGE (Token Generation Event) has NOT started yet</strong></p>
                  <p>• <strong>ALL $XOGS tokens currently on the market are FAKE</strong></p>
                  <p>• Official launch will be announced on our verified channels</p>
                  <p>• Only connect your wallet for future token distribution</p>
                </div>

                <div className="border-t border-red-200 pt-3 mt-3">
                  <h4 className="font-bold text-red-800 text-sm mb-2">SYSTEM STATUS</h4>
                  <div className="text-red-700 text-sm space-y-1">
                    <p>• Due to high volume of wallet binding requests, our SOL binding function may experience errors</p>
                    <p>• Please don't worry, we will fix this issue as soon as possible</p>
                    <p>• Our token $XOGS has not yet had its TGE (Token Generation Event)</p>
                    <p>• After TGE, tokens will be distributed to your bound SOL address</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Info className="w-4 h-4 text-blue-600" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-blue-800 text-sm">SECURITY TIPS</h3>
                <div className="text-blue-700 text-sm space-y-1">
                  <p>• Only connect wallets you control</p>
                  <p>• Never share your private keys or seed phrases</p>
                  <p>• Verify the connection request in your wallet</p>
                  <p>• Use official Phantom wallet from phantom.app</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}