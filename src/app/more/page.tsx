import type { Metadata } from 'next'
import { FileText, Map, ExternalLink } from 'lucide-react'

export const metadata: Metadata = {
  title: 'More Resources - XOGS.fun',
  description: 'Discover additional resources, community links, and comprehensive information about the XOGS.fun ecosystem',
  openGraph: {
    title: 'More Resources - XOGS.fun',
    description: 'Discover additional resources, community links, and comprehensive information about the XOGS.fun ecosystem',
    url: '/more',
    siteName: 'XOGS.fun',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'More Resources - XOGS.fun',
    description: 'Discover additional resources, community links, and comprehensive information about the XOGS.fun ecosystem',
  }
}

export default function MorePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-purple-200 mb-6">
            <span className="text-purple-600 font-medium">📚 Resources Hub</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-6 leading-tight">
            More Resources
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover additional resources and community links for the XOGS.fun ecosystem
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Resources Grid */}
          <div className="grid lg:grid-cols-1 gap-8">
            {/* Quick Access Cards */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Roadmap */}
              <div className="group bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-200 hover:shadow-3xl transition-all duration-500 hover:scale-105">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Map className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">Development Roadmap</h3>
                      <p className="text-gray-600">Timeline and Future Plans</p>
                      <p className="text-sm text-gray-500 mt-1">Explore our development timeline and strategic planning</p>
                    </div>
                  </div>
                  <ExternalLink className="w-6 h-6 text-gray-400 group-hover:text-purple-500 transition-colors" />
                </div>
                <div className="mt-6">
                  <a 
                    href="/roadmap"
                    className="inline-flex items-center justify-center w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    <span className="flex items-center gap-2">
                      View Roadmap
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </span>
                  </a>
                </div>
              </div>

              {/* Whitepaper */}
              <div className="group bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-200 hover:shadow-3xl transition-all duration-500 hover:scale-105">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <FileText className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">Technical Whitepaper</h3>
                      <p className="text-gray-600">Comprehensive Documentation</p>
                      <p className="text-sm text-gray-500 mt-1">Detailed technical specifications and business model</p>
                    </div>
                  </div>
                  <ExternalLink className="w-6 h-6 text-gray-400 group-hover:text-green-500 transition-colors" />
                </div>
                <div className="mt-6">
                  <a 
                    href="/whitepaper"
                    className="inline-flex items-center justify-center w-full bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-green-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    <span className="flex items-center gap-2">
                      Read Whitepaper
                      <span className="group-hover:translate-x-1 transition-transform">📄</span>
                    </span>
                  </a>
                </div>
              </div>
            </div>

            {/* Community & Resources */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border border-gray-200">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">🌐</span>
                </div>
                <h3 className="text-3xl font-bold text-gray-800">Community Resources</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-xl font-semibold text-gray-800 mb-4">Official Links</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border hover:shadow-md transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm font-bold">GH</span>
                        </div>
                        <span className="text-gray-700 font-medium">GitHub Repository</span>
                      </div>
                      <a 
                        href="https://github.com/your-username/xogs" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-700 font-bold text-lg transition-colors"
                      >
                        View →
                      </a>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border hover:shadow-md transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm font-bold">🐦</span>
                        </div>
                        <span className="text-gray-700 font-medium">Official Twitter</span>
                      </div>
                      <a 
                        href="https://twitter.com/xogs_fun" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-700 font-bold text-lg transition-colors"
                      >
                        Follow →
                      </a>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl border hover:shadow-md transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm font-bold">💬</span>
                        </div>
                        <span className="text-gray-700 font-medium">Discord Community</span>
                      </div>
                      <a 
                        href="https://discord.gg/xogs" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-700 font-bold text-lg transition-colors"
                      >
                        Join →
                      </a>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-xl font-semibold text-gray-800 mb-4">Contact Us</h4>
                  <div className="space-y-4 text-gray-600">
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border">
                      <p className="text-lg font-medium text-gray-700 mb-2">Have questions or suggestions?</p>
                      <p className="text-purple-600 font-medium">
                        Email: <a href="mailto:hello@xogs.fun" className="hover:text-purple-700 underline">hello@xogs.fun</a>
                      </p>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border">
                      <p className="text-lg font-medium text-gray-700 mb-2">Business Partnership</p>
                      <p className="text-purple-600 font-medium">
                        Twitter: <a href="https://twitter.com/xogs_fun" target="_blank" rel="noopener noreferrer" className="hover:text-purple-700 underline">@xogs_fun</a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Call to Action */}
            <div className="text-center mt-8">
              <div className="bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-orange-600/10 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-white/20">
                <div className="mb-8">
                  <div className="inline-flex items-center px-6 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-purple-200 mb-4">
                    <span className="text-purple-600 font-medium">🎯 Ready to Start?</span>
                  </div>
                  <h3 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-6">
                    Ready to Get Started?
                  </h3>
                  <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                    Join XOGS.fun and experience fair AI-driven CryptoTwitter monetization mechanisms.
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
                    href="https://twitter.com/xogs_fun"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group border-2 border-purple-500 text-purple-600 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-purple-50 hover:border-purple-600 transition-all duration-300 hover:shadow-lg"
                  >
                    <span className="flex items-center justify-center gap-2">
                      Follow Us
                      <span className="group-hover:translate-x-1 transition-transform">🐦</span>
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 