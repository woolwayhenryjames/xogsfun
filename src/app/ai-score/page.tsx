import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from "@/lib/auth";
import { BottomNavigation } from '@/components/BottomNavigation'
import { TwitterFooterLink } from '@/components/TwitterFooterLink'
import { Calculator } from 'lucide-react'
import { UserDropdown } from '@/components/UserDropdown'
import AIScoreCalculator from '@/components/AIScoreCalculator'

export default async function AIScorePage() {
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
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Calculator className="h-5 w-5 text-white" />
            </div>
            <span>AI Score</span>
          </div>
          
          <UserDropdown />
        </div>
      </nav>

      <div className="px-6 py-8 max-w-6xl mx-auto">
        <div className="apple-fade-in">
          <AIScoreCalculator />
        </div>
        
        {/* Twitter Footer Link */}
        <TwitterFooterLink />
      </div>

      {/* Apple-style fixed bottom navigation */}
      <BottomNavigation />
    </div>
  )
} 