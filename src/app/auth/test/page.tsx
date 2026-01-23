import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth";
import { TwitterSignInButton } from '../../../components/TwitterSignInButton'
import { BottomNavigation } from '../../../components/BottomNavigation'

export default async function AuthTestPage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pb-32 apple-fade-in">
      <div className="px-6 py-8 max-w-md mx-auto">
        <div className="apple-card apple-scale-in">
          <h1 className="apple-heading mb-6">Authentication Test Page</h1>

          {session ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                <h3 className="apple-subheading text-green-800 mb-2">✅ Login Successful</h3>
                <div className="space-y-2 apple-caption text-green-700">
                  <p><strong>User ID:</strong> {session.user?.id}</p>
                  <p><strong>Name:</strong> {session.user?.name}</p>
                  <p><strong>Twitter Username:</strong> {session.user?.username}</p>
                  <p><strong>Platform ID:</strong> {session.user?.platformId}</p>
                </div>
              </div>

              <div className="apple-card bg-blue-50 border-blue-200">
                <h4 className="apple-body font-semibold text-blue-800 mb-2">Session Information</h4>
                <pre className="apple-caption text-blue-700 overflow-x-auto">
                  {JSON.stringify(session, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
                <h3 className="apple-subheading text-yellow-800 mb-2">⚠️ Not Logged In</h3>
                <p className="apple-body text-yellow-700">Please log in first to test authentication features</p>
              </div>

              <TwitterSignInButton />
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="apple-body font-semibold mb-3">Cookie Configuration Test</h4>
            <div className="space-y-2 apple-caption text-gray-600">
              <p>• Check Application &gt; Cookies in browser developer tools</p>
              <p>• Should see cookies starting with &quot;next-auth&quot;</p>
              <p>• Confirm SameSite and Secure attributes are set correctly</p>
            </div>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
} 