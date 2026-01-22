'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AuthError() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [error, setError] = useState('')

  useEffect(() => {
    const errorParam = searchParams?.get('error')
    
    // 映射常见的NextAuth错误到中文消息
    const errorMessages: Record<string, string> = {
      'Configuration': '配置错误：请检查应用配置',
      'AccessDenied': '访问被拒绝：您没有权限访问此应用',
      'Verification': '验证失败：请重新尝试登录',
      'Default': '登录过程中发生错误，请重试',
      'OAuthSignIn': 'Twitter登录失败：请检查您的网络连接',
      'OAuthCallback': 'Twitter回调失败：请重新授权',
      'OAuthCreateAccount': '创建账户失败：请稍后重试',
      'EmailCreateAccount': '邮箱账户创建失败',
      'Callback': '回调处理失败：请重新登录',
      'OAuthAccountNotLinked': '账户未关联：请使用相同的登录方式',
      'EmailSignIn': '邮箱登录失败',
      'CredentialsSignIn': '凭据登录失败：请检查您的用户名和密码',
      'SessionRequired': '需要登录：请先登录后再访问此页面',
    }

    setError(errorMessages[errorParam || ''] || errorMessages['Default'])
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            登录失败
          </h2>
          
          <p className="mt-2 text-sm text-gray-600">
            {error}
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <div className="flex flex-col space-y-2">
            <Link
              href="/auth/signin"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              重新登录
            </Link>
            
            <Link
              href="/"
              className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              返回首页
            </Link>
            </div>

          <div className="text-center">
            <details className="group">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                技术详情 ▼
              </summary>
              <div className="mt-2 p-3 bg-gray-100 rounded text-xs text-gray-600 text-left">
                <p><strong>Error Code:</strong> {searchParams?.get('error') || 'Unknown'}</p>
                <p><strong>Time:</strong> {new Date().toLocaleString('en-US')}</p>
                <p><strong>Suggestions:</strong></p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Check network connection</li>
                  <li>Clear browser cache and cookies</li>
                  <li>Ensure Twitter account status is normal</li>
                  <li>Contact technical support if the problem persists</li>
                </ul>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  )
} 