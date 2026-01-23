// Removed for build compatibility
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from "@/lib/auth";
import { Settings, AlertTriangle } from 'lucide-react'
import { UserDropdown } from '../../../components/UserDropdown'
import AdminAIScoreManager from '../../../components/AdminAIScoreManager'
import { requireAdmin } from '@/lib/admin'

export default async function AdminAIScoresPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  // 验证管理员权限
  const { isAdmin, platformId } = await requireAdmin()

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 apple-fade-in">
        {/* 苹果风格顶部导航 */}
        <nav className="apple-nav">
          <div className="flex items-center justify-between">
            <div className="apple-nav-brand">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <span>Access Denied</span>
            </div>

            <UserDropdown />
          </div>
        </nav>

        <div className="px-6 py-8 max-w-md mx-auto">
          <div className="apple-card text-center">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-red-600 mb-2">Insufficient Permissions</h2>
            <p className="text-gray-600 mb-4">
              You don't have permission to access the admin page. Only users with platform ID 10000 can access this page.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              您的平台ID: {platformId || '未知'}
            </p>
            <a
              href="/"
              className="apple-button inline-block"
            >
              返回首页
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 apple-fade-in">
      {/* 苹果风格顶部导航 */}
      <nav className="apple-nav">
        <div className="flex items-center justify-between">
          <div className="apple-nav-brand">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Settings className="h-5 w-5 text-white" />
            </div>
            <span>Admin</span>
          </div>

          <UserDropdown />
        </div>
      </nav>

      <div className="px-4 py-6 w-full max-w-none">
        <div className="apple-fade-in">
          <h2 className="apple-heading mb-6">AI Score Management</h2>
          <AdminAIScoreManager />
        </div>
      </div>
    </div>
  )
} 