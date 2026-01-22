import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Development Roadmap - XOGS.fun',
  description: 'Discover XOGS.fun\'s strategic development roadmap and revolutionary plans for CryptoTwitter monetization',
  openGraph: {
    title: 'Development Roadmap - XOGS.fun',
    description: 'Discover XOGS.fun\'s strategic development roadmap and revolutionary plans for CryptoTwitter monetization',
    url: '/roadmap',
    siteName: 'XOGS.fun',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Development Roadmap - XOGS.fun',
    description: 'Discover XOGS.fun\'s strategic development roadmap and revolutionary plans for CryptoTwitter monetization',
  }
}

export default function RoadmapPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-purple-200 mb-6">
            <span className="text-purple-600 font-medium">🚀 Strategic Vision</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-6 leading-tight">
            Development Roadmap
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Our Journey: Revolutionizing the CryptoTwitter Promotion Ecosystem
          </p>
        </div>

        {/* Roadmap Timeline */}
        <div className="max-w-4xl mx-auto">
          {/* Phase 1 - Current */}
          <div className="mb-16 relative">
            <div className="flex items-center mb-8">
              <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-green-600 rounded-full mr-6 flex items-center justify-center shadow-lg">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h2 className="text-3xl font-bold text-gray-800">Phase 1: Foundation</h2>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">✅ COMPLETED</span>
                </div>
                <p className="text-gray-600">Early 2024</p>
              </div>
            </div>
            <div className="ml-12 space-y-6">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">✓</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Core Platform Launch</h3>
                </div>
                <div className="grid md:grid-cols-1 gap-4">
                  <div>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• Core platform infrastructure completed</li>
                      <li>• Twitter OAuth integration implemented</li>
                      <li>• AI-powered user scoring system deployed</li>
                      <li>• Invitation reward mechanism established</li>
                      <li>• Modern UI/UX design with responsive layout</li>
                      <li>• Database architecture and API endpoints</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Phase 2 - Q2 2024 */}
          <div className="mb-16 relative">
            <div className="flex items-center mb-8">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mr-6 flex items-center justify-center shadow-lg animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h2 className="text-3xl font-bold text-gray-800">Phase 2: Enhanced Growth</h2>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">🚀 IN PROGRESS</span>
                </div>
                <p className="text-gray-600">Mid 2024</p>
              </div>
            </div>
            <div className="ml-12 space-y-6">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-lg">🚀</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Enhanced Features</h3>
                </div>
                <div className="grid md:grid-cols-1 gap-4">
                  <div>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• AI scoring algorithm optimization and machine learning improvements</li>
                      <li>• Multi-chain wallet integration (Solana, Ethereum, Polygon)</li>
                      <li>• Comprehensive project owner dashboard with analytics</li>
                      <li>• Advanced data analytics panel and reporting tools</li>
                      <li>• Mobile app development and cross-platform optimization</li>
                      <li>• Enhanced security features and user verification</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Phase 3 - Q3 2024 */}
          <div className="mb-16 relative">
            <div className="flex items-center mb-8">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full mr-6 flex items-center justify-center shadow-lg">
                <div className="w-2 h-2 bg-white rounded-full opacity-60"></div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h2 className="text-3xl font-bold text-gray-800">Phase 3: Ecosystem Expansion</h2>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-semibold rounded-full">📋 PLANNED</span>
                </div>
                <p className="text-gray-600">Late 2024</p>
              </div>
            </div>
            <div className="ml-12 space-y-6">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-lg">🌟</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Advanced Features</h3>
                </div>
                <div className="grid md:grid-cols-1 gap-4">
                  <div>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• Decentralized governance system with community voting</li>
                      <li>• NFT identity system for verified high-quality users</li>
                      <li>• Cross-platform integration (Discord, Telegram, LinkedIn)</li>
                      <li>• Advanced analytics tools with predictive insights</li>
                      <li>• Open API platform for third-party integrations</li>
                      <li>• Smart contract automation for reward distribution</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Phase 4 - Q4 2024 */}
          <div className="mb-16 relative">
            <div className="flex items-center mb-8">
              <div className="w-6 h-6 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full mr-6 flex items-center justify-center shadow-lg">
                <div className="w-2 h-2 bg-white rounded-full opacity-60"></div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h2 className="text-3xl font-bold text-gray-800">Phase 4: Global Ecosystem</h2>
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-semibold rounded-full">🌍 FUTURE</span>
                </div>
                <p className="text-gray-600">Early 2025</p>
              </div>
            </div>
            <div className="ml-12 space-y-6">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-lg">🌍</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Global Expansion</h3>
                </div>
                <div className="grid md:grid-cols-1 gap-4">
                  <div>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• Global market expansion with localized support</li>
                      <li>• Multi-language platform support (10+ languages)</li>
                      <li>• Enterprise-grade solutions for large organizations</li>
                      <li>• Comprehensive ecosystem with partner integrations</li>
                      <li>• Strategic partnerships with major Web3 projects</li>
                      <li>• Institutional-grade compliance and security features</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Phase 5 - 2025 */}
          <div className="mb-16 relative">
            <div className="flex items-center mb-8">
              <div className="w-6 h-6 bg-gradient-to-r from-pink-400 to-pink-600 rounded-full mr-6 flex items-center justify-center shadow-lg">
                <div className="w-2 h-2 bg-white rounded-full opacity-60"></div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h2 className="text-3xl font-bold text-gray-800">Phase 5: Innovation Frontier</h2>
                  <span className="px-3 py-1 bg-pink-100 text-pink-700 text-sm font-semibold rounded-full">✨ VISION</span>
                </div>
                <p className="text-gray-600">Mid-Late 2025</p>
              </div>
            </div>
            <div className="ml-12 space-y-6">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-pink-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-lg">✨</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Future Vision</h3>
                </div>
                <div className="grid md:grid-cols-1 gap-4">
                  <div>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• AI-driven predictive analytics for market trends</li>
                      <li>• Metaverse integration with virtual promotion spaces</li>
                      <li>• Fully decentralized autonomous organization (DAO)</li>
                      <li>• Advanced cross-chain interoperability solutions</li>
                      <li>• Revolutionary business models with Web3 integration</li>
                      <li>• Next-generation social media monetization tools</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-20">
          <div className="bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-orange-600/10 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-white/20 max-w-3xl mx-auto">
            <div className="mb-8">
              <div className="inline-flex items-center px-6 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-purple-200 mb-4">
                <span className="text-purple-600 font-medium">🎯 Ready to Join?</span>
              </div>
              <h3 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-6">
                Be Part of the Revolution
              </h3>
              <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
                Join us in building the future of CryptoTwitter monetization. Every user is an important part of this revolutionary ecosystem.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a 
                href="/"
                className="group bg-gradient-to-r from-purple-500 to-pink-500 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
              >
                <span className="flex items-center justify-center gap-2">
                  Get Started
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </a>
              <a 
                href="/whitepaper"
                className="group border-2 border-purple-500 text-purple-600 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-purple-50 hover:border-purple-600 transition-all duration-300 hover:shadow-lg"
              >
                <span className="flex items-center justify-center gap-2">
                  Read Whitepaper
                  <span className="group-hover:translate-x-1 transition-transform">📄</span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 