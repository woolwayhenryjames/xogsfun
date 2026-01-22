import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Technical Whitepaper - XOGS.fun',
  description: 'Comprehensive technical whitepaper detailing XOGS.fun\'s revolutionary AI-powered CryptoTwitter monetization platform and business model',
  openGraph: {
    title: 'Technical Whitepaper - XOGS.fun',
    description: 'Comprehensive technical whitepaper detailing XOGS.fun\'s revolutionary AI-powered CryptoTwitter monetization platform and business model',
    url: '/whitepaper',
    siteName: 'XOGS.fun',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Technical Whitepaper - XOGS.fun',
    description: 'Comprehensive technical whitepaper detailing XOGS.fun\'s revolutionary AI-powered CryptoTwitter monetization platform and business model',
  }
}

export default function WhitepaperPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-purple-200 mb-6">
            <span className="text-purple-600 font-medium">📋 Technical Document</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-6 leading-tight">
            Technical Whitepaper
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Revolutionizing CryptoTwitter Promotion with AI-Powered User Quality Scoring
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Executive Summary */}
          <section className="bg-white/90 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border border-gray-200 hover:shadow-3xl transition-all duration-500">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">📧</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-800">Executive Summary</h2>
            </div>
            <div className="grid md:grid-cols-1 gap-8">
              <div>
                <p className="text-gray-600 leading-relaxed text-lg">
                  XOGS.fun is an AI-driven user scoring and monetization platform designed for CryptoTwitter users.
                  We evaluate promotion effectiveness based on user account quality rather than content quality,
                  effectively preventing content abuse while providing higher returns for high-quality users.
                  The platform operates on a 10%-20% service fee model, offering precise and efficient
                  community promotion services for project owners.
                </p>
              </div>
            </div>
          </section>

          {/* Problem Statement */}
          <section className="bg-white/90 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border border-gray-200 hover:shadow-3xl transition-all duration-500">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-600 rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">⚠️</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-800">Problem Statement</h2>
            </div>
            <div className="grid md:grid-cols-1 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Current Challenges</h3>
                <ul className="text-gray-600 space-y-3 text-lg">
                  <li>• Web3 projects lack precise and efficient community promotion methods</li>
                  <li>• Traditional "shilling" relies on content judgment, leading to AI-generated spam</li>
                  <li>• Information streams polluted by low-quality content and bot accounts</li>
                  <li>• Users cannot earn higher returns by improving their account quality</li>
                  <li>• Project owners struggle to find truly valuable promotion channels</li>
                  <li>• Lack of transparent and fair reward distribution mechanisms</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Solution */}
          <section className="bg-white/90 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border border-gray-200 hover:shadow-3xl transition-all duration-500">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">✨</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-800">Our Solution</h2>
            </div>
            <div className="grid md:grid-cols-1 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Innovation Approach</h3>
                <ul className="text-gray-600 space-y-3 text-lg">
                  <li>• User account quality-based scoring system with advanced AI algorithms</li>
                  <li>• Comprehensive user influence assessment using machine learning</li>
                  <li>• Robust anti-abuse mechanisms and content quality protection</li>
                  <li>• Transparent and fair reward distribution based on actual impact</li>
                  <li>• Precise targeting tools and analytics for project owners</li>
                  <li>• Real-time monitoring and fraud detection systems</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Business Model */}
          <section className="bg-white/90 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border border-gray-200 hover:shadow-3xl transition-all duration-500">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">💰</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-800">Business Model</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Revenue Streams</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Primary Revenue Sources</h4>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• Project promotion campaign service fees (10%-20%)</li>
                      <li>• Premium feature subscriptions for advanced analytics</li>
                      <li>• Enterprise data analytics and insights services</li>
                      <li>• API access fees for third-party integrations</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Cost Structure</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Operational Costs</h4>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• Cloud infrastructure and scalable hosting services</li>
                      <li>• AI model training, maintenance, and continuous improvement</li>
                      <li>• Marketing campaigns and user acquisition costs</li>
                      <li>• Development team and operational overhead</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Technology Stack */}
          <section className="bg-white/90 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border border-gray-200 hover:shadow-3xl transition-all duration-500">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">🛠️</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-800">Technology Stack</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Frontend & Backend</h3>
                <ul className="text-gray-600 space-y-2">
                  <li>• Next.js 14 with React and TypeScript for modern web development</li>
                  <li>• TailwindCSS for responsive and customizable styling</li>
                  <li>• NextAuth.js for secure Twitter OAuth authentication</li>
                  <li>• PostgreSQL database hosted on Neon for scalability</li>
                  <li>• Vercel for seamless deployment and edge computing</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Blockchain & AI</h3>
                <ul className="text-gray-600 space-y-2">
                  <li>• Reown AppKit for Solana blockchain integration</li>
                  <li>• Custom AI scoring algorithms for user quality assessment</li>
                  <li>• Machine learning models for influence prediction</li>
                  <li>• Real-time data processing and analytics pipeline</li>
                  <li>• Advanced security protocols and fraud detection</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Tokenomics */}
          <section className="bg-white/90 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border border-gray-200 hover:shadow-3xl transition-all duration-500">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">🪙</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-800">Tokenomics</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">$XOGS Token Distribution</h3>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium text-gray-700">User Rewards</span>
                      <span className="font-bold text-blue-600">40%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium text-gray-700">Ecosystem Building</span>
                      <span className="font-bold text-green-600">25%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="font-medium text-gray-700">Team Incentives</span>
                      <span className="font-bold text-purple-600">15%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <span className="font-medium text-gray-700">Liquidity Pool</span>
                      <span className="font-bold text-orange-600">10%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700">Reserve Fund</span>
                      <span className="font-bold text-gray-600">10%</span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Token Utility</h3>
                <div className="space-y-4">
                  <ul className="text-gray-600 space-y-3">
                    <li>• <strong>Reward Distribution:</strong> Primary currency for user rewards</li>
                    <li>• <strong>Governance Rights:</strong> Voting power for platform decisions</li>
                    <li>• <strong>Staking Benefits:</strong> Enhanced rewards for token holders</li>
                    <li>• <strong>Premium Access:</strong> Unlock advanced platform features</li>
                    <li>• <strong>Fee Discounts:</strong> Reduced service fees for transactions</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Team */}
          <section className="bg-white/90 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border border-gray-200 hover:shadow-3xl transition-all duration-500">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">👥</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-800">Team</h2>
            </div>
            <div className="grid md:grid-cols-1 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Team Strengths</h3>
                <ul className="text-gray-600 space-y-2">
                  <li>• Rich experience in product operation and promotion</li>
                  <li>• Capable of both product development and promotion</li>
                  <li>• Familiar with cryptocurrency ecosystem</li>
                  <li>• Small team with strong execution capabilities</li>
                  <li>• Fast iteration and response capabilities</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Current Status */}
          <section className="bg-white/90 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border border-gray-200 hover:shadow-3xl transition-all duration-500">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">📈</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-800">Current Status</h2>
            </div>
            <div className="grid md:grid-cols-1 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Platform Milestones</h3>
                <ul className="text-gray-600 space-y-3 text-lg">
                  <li>• <strong>Recent Launch:</strong> Platform successfully launched with core functionality</li>
                  <li>• <strong>User Acquisition:</strong> Rapidly acquired tens of thousands of verified overseas Twitter users</li>
                  <li>• <strong>Organic Growth:</strong> Users actively sharing platform links and driving viral adoption</li>
                  <li>• <strong>Market Testing:</strong> Successful initial marketing campaigns with proven user engagement</li>
                  <li>• <strong>Growth Strategy:</strong> Focusing on organic viral growth and community-driven expansion</li>
                  <li>• <strong>Technical Stability:</strong> Platform handling increasing user loads with reliable performance</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="text-center">
            <div className="bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-orange-600/10 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-white/20">
              <div className="mb-8">
                <div className="inline-flex items-center px-6 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-purple-200 mb-4">
                  <span className="text-purple-600 font-medium">🚀 Join the Revolution</span>
                </div>
                <h3 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-6">
                  Start Your CryptoTwitter Monetization Journey
                </h3>
                <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                  Be a pioneer in the CryptoTwitter promotion revolution with fair AI-driven monetization mechanisms.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <a 
                  href="/"
                  className="group bg-gradient-to-r from-purple-500 to-pink-500 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                >
                  <span className="flex items-center justify-center gap-2">
                    Start Using XOGS
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                </a>
                <a 
                  href="/roadmap"
                  className="group border-2 border-purple-500 text-purple-600 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-purple-50 hover:border-purple-600 transition-all duration-300 hover:shadow-lg"
                >
                  <span className="flex items-center justify-center gap-2">
                    View Roadmap
                    <span className="group-hover:translate-x-1 transition-transform">🗺️</span>
                  </span>
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
} 