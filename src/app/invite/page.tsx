// Removed for build compatibility
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from "@/lib/auth";
import { InviteSystem } from '../../components/InviteSystem'
import { BottomNavigation } from '../../components/BottomNavigation'
import { TwitterFooterLink } from '../../components/TwitterFooterLink'
import { XLogoMinimal } from '../../components/XLogo'
import { UserDropdown } from '../../components/UserDropdown'


export default async function InvitePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pb-32 apple-fade-in">
      {/* Apple-style top navigation */}
      <nav className="apple-nav">
        <div className="flex items-center justify-between">
          <div className="apple-nav-brand">
            <XLogoMinimal className="w-10 h-10" />
            <span>Invite</span>
          </div>

          <div className="flex items-center space-x-3">
            <UserDropdown />
          </div>
        </div>
      </nav>

      <div className="px-6 py-8 max-w-md mx-auto">
        <div className="apple-fade-in">
          <h2 className="apple-heading mb-8">Invite Friends</h2>
          <InviteSystem />
        </div>

        {/* Twitter Footer Link */}
        <TwitterFooterLink />
      </div>

      {/* Apple-style fixed bottom navigation */}
      <BottomNavigation />
    </div>
  )
} 