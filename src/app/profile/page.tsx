import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from "@/lib/auth";
import { UserProfile } from '@/components/UserProfile'
import { BottomNavigation } from '@/components/BottomNavigation'
import { TwitterFooterLink } from '@/components/TwitterFooterLink'
import { TopTwitterBanner } from '@/components/TopTwitterBanner'
import { User, Sparkles } from 'lucide-react'
import { UserDropdown } from '@/components/UserDropdown'

export default async function ProfilePage({ 
  searchParams 
}: { 
  searchParams: { invited?: string } 
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const showInviteSuccess = searchParams.invited === 'true'

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pb-32 apple-fade-in">
      {/* Apple-style top navigation */}
      <nav className="apple-nav">
        <div className="flex items-center justify-between">
          <div className="apple-nav-brand">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
              <User className="h-5 w-5 text-white" />
            </div>
            <span>Profile</span>
          </div>
          
          <UserDropdown />
        </div>
      </nav>

      {/* Top Twitter Banner */}
      <TopTwitterBanner />

      {/* 邀请成功提示 */}
      {showInviteSuccess && (
        <div className="px-6 py-6">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 p-6 apple-scale-in">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-lg mb-4 animate-bounce">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">🎉 Welcome to $XOGS!</h3>
              <p className="text-gray-600 text-sm">
                Congratulations! You've successfully joined through invitation
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="px-6 py-8 max-w-md mx-auto">
        <div className="apple-fade-in">
          <h2 className="apple-heading mb-8">Profile</h2>
          <UserProfile />
        </div>
        
        {/* Twitter Footer Link */}
        <TwitterFooterLink />
      </div>

      {/* Apple-style fixed bottom navigation */}
      <BottomNavigation />
    </div>
  )
} 