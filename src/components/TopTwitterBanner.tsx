'use client';

export function TopTwitterBanner() {
  const handleFollowClick = () => {
    window.open('https://x.com/xogsfun', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="px-6 py-4">
      <div className="max-w-md mx-auto">
        <div className="bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50 rounded-3xl shadow-xl border border-blue-100/50 p-5 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 apple-slide-up backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full overflow-hidden shadow-lg ring-2 ring-blue-200/50">
                  <img 
                    src="https://pbs.twimg.com/profile_images/1942961164679593984/tbvTaPno_normal.jpg"
                    alt="XOGS Official"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center shadow-sm">
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-base font-bold text-gray-900">Stay Connected</p>
                <p className="text-sm text-blue-600 font-semibold">@xogsfun</p>
              </div>
            </div>
            
            <button
              onClick={handleFollowClick}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Follow
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 