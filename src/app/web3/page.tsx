'use client';

import { useEffect, useState } from 'react';
import { Menu, RefreshCw } from 'lucide-react';

interface Web3Project {
  id: string;
  name: string;
  logoUrl: string;
  status: 'pre-tge' | 'post-tge';
}

export default function Web3ProjectsPage() {
  const [activeTab, setActiveTab] = useState<'pre-tge' | 'post-tge'>('pre-tge');
  const [refreshing, setRefreshing] = useState(false);

  // Web3项目数据（使用真实的官方logo资源）
  const [projects] = useState<Web3Project[]>([
    // Pre-TGE Projects (使用官方或可靠的logo资源)
    { id: '1', name: '0G', logoUrl: 'https://raw.githubusercontent.com/0glabs/0g-chain/main/assets/logo.svg', status: 'pre-tge' },
    { id: '2', name: 'Anoma', logoUrl: 'https://anoma.net/assets/anoma-symbol.svg', status: 'pre-tge' },
    { id: '3', name: 'Bless', logoUrl: 'https://avatars.githubusercontent.com/u/150393474', status: 'pre-tge' },
    { id: '4', name: 'Camp Network', logoUrl: 'https://pbs.twimg.com/profile_images/1755595830891163648/QqZ7q3Z8_400x400.jpg', status: 'pre-tge' },
    { id: '5', name: 'Falcon Finance', logoUrl: 'https://pbs.twimg.com/profile_images/1794384736113893376/ZAJLNYrS_400x400.jpg', status: 'pre-tge' },
    { id: '6', name: 'Hana', logoUrl: 'https://pbs.twimg.com/profile_images/1732464844997734400/N8cQJCUm_400x400.jpg', status: 'pre-tge' },
    { id: '7', name: 'Infinex', logoUrl: 'https://infinex.xyz/images/logo.svg', status: 'pre-tge' },
    { id: '8', name: 'Irys', logoUrl: 'https://irys.xyz/favicon-32x32.png', status: 'pre-tge' },
    { id: '9', name: 'Lombard', logoUrl: 'https://lombard.finance/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flombard-logo.c8b5c8a9.png&w=96&q=75', status: 'pre-tge' },
    { id: '10', name: 'MegaETH', logoUrl: 'https://pbs.twimg.com/profile_images/1771973162081304576/z-qTwXaI_400x400.jpg', status: 'pre-tge' },
    { id: '11', name: 'Mira Network', logoUrl: 'https://pbs.twimg.com/profile_images/1788268502648274944/8Q3hvfJ9_400x400.jpg', status: 'pre-tge' },
    { id: '12', name: 'Momentum', logoUrl: 'https://pbs.twimg.com/profile_images/1754527133717737472/qFsGOVmE_400x400.jpg', status: 'pre-tge' },
    { id: '13', name: 'Multipli', logoUrl: 'https://pbs.twimg.com/profile_images/1771618992966168576/gHBaxA4H_400x400.jpg', status: 'pre-tge' },
    { id: '14', name: 'Nillion', logoUrl: 'https://pbs.twimg.com/profile_images/1752432754488143872/_MgLUDR4_400x400.jpg', status: 'pre-tge' },

    // Post-TGE Projects (使用官方或可靠的logo资源)
    { id: '15', name: 'Allora', logoUrl: 'https://pbs.twimg.com/profile_images/1698368970016960512/0TzhUpTd_400x400.jpg', status: 'post-tge' },
    { id: '16', name: 'Billions Network', logoUrl: 'https://pbs.twimg.com/profile_images/1758556092896694272/sD1X0_Vr_400x400.jpg', status: 'post-tge' },
    { id: '17', name: 'Boundless', logoUrl: 'https://pbs.twimg.com/profile_images/1701982628463120384/V0mZTGBj_400x400.jpg', status: 'post-tge' },
    { id: '18', name: 'Cysic', logoUrl: 'https://pbs.twimg.com/profile_images/1720103493265006592/5VTgYSWj_400x400.jpg', status: 'post-tge' },
    { id: '19', name: 'Fogo', logoUrl: 'https://pbs.twimg.com/profile_images/1742555654092836864/3PTIYbQ6_400x400.jpg', status: 'post-tge' },
    { id: '20', name: 'GOAT Network', logoUrl: 'https://pbs.twimg.com/profile_images/1851670636644839424/r76cYqwP_400x400.jpg', status: 'post-tge' },
    { id: '21', name: 'INFINIT', logoUrl: 'https://pbs.twimg.com/profile_images/1768705773325697024/7rEqGo-q_400x400.jpg', status: 'post-tge' },
    { id: '22', name: 'Katana', logoUrl: 'https://pbs.twimg.com/profile_images/1730249773988638720/i2l8j6NJ_400x400.jpg', status: 'post-tge' },
    { id: '23', name: 'Lumiterra', logoUrl: 'https://pbs.twimg.com/profile_images/1777769458830639104/6-Z-UXTI_400x400.jpg', status: 'post-tge' },
    { id: '24', name: 'MemeX', logoUrl: 'https://pbs.twimg.com/profile_images/1841547014068850688/BvPzpQGE_400x400.jpg', status: 'post-tge' },
    { id: '25', name: 'Mitosis', logoUrl: 'https://pbs.twimg.com/profile_images/1762528826503692288/KgH_XJrP_400x400.jpg', status: 'post-tge' },
    { id: '26', name: 'Monad', logoUrl: 'https://pbs.twimg.com/profile_images/1658549962387251200/RHnqLw39_400x400.jpg', status: 'post-tge' },
    { id: '27', name: 'Novastro', logoUrl: 'https://pbs.twimg.com/profile_images/1782466037529698304/ZTKfH8dB_400x400.jpg', status: 'post-tge' },
    { id: '28', name: 'Oasys', logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/22265.png', status: 'post-tge' }
  ]);

  const filteredProjects = projects.filter(p => p.status === activeTab);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await new Promise(resolve => setTimeout(resolve, 800));
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-sm mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Menu className="w-6 h-6 text-gray-400" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded flex items-center justify-center">
                <span className="text-black font-bold text-sm">K</span>
              </div>
              <span className="text-white font-bold text-lg">KAITO</span>
            </div>
          </div>
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">Y</span>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="max-w-sm mx-auto px-4 py-4">
        <div className="flex border-b border-gray-800">
          <button
            onClick={() => setActiveTab('pre-tge')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'pre-tge'
                ? 'border-green-400 text-green-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Pre-TGE
          </button>
          <button
            onClick={() => setActiveTab('post-tge')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'post-tge'
                ? 'border-green-400 text-green-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Post-TGE
          </button>
          <div className="ml-auto text-xs text-gray-500 flex items-center">
            (From A-Z)
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="max-w-sm mx-auto px-4">
        <div className="grid grid-cols-2 gap-4">
          {filteredProjects.map((project) => (
            <div key={project.id} className="flex items-center gap-3 p-3 hover:bg-gray-900 rounded-lg transition-colors">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={project.logoUrl} 
                  alt={project.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm" style={{display: 'none'}}>
                  ?
                </div>
              </div>
              <span className="text-white text-sm font-medium truncate">{project.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Refresh Button */}
      <div className="fixed bottom-8 right-4">
        <button
          onClick={onRefresh}
          className={`w-12 h-12 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center border border-gray-700 transition-colors ${refreshing ? 'opacity-60 cursor-wait' : ''}`}
          disabled={refreshing}
        >
          <RefreshCw className={`w-5 h-5 text-gray-300 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Footer */}
      <div className="max-w-sm mx-auto px-4 py-8 text-center">
        <p className="text-[11px] text-gray-500">Web3 项目精选榜单</p>
        <p className="text-[11px] text-gray-600 mt-1">Only accessible via direct link · /web3</p>
      </div>
    </div>
  );
}