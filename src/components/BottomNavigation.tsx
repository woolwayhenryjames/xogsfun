'use client';

import { useSession } from 'next-auth/react';
import { Home, UserPlus, Trophy, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function BottomNavigation() {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <div className="apple-bottom-nav apple-glass-strong">
      <nav>
        <Link
          href="/"
          className={`apple-bottom-nav-item ${pathname === '/' ? 'active' : ''}`}
        >
          <Home />
          <span>Home</span>
        </Link>

        <Link
          href={session ? '/invite' : '/auth/signin'}
          className={`apple-bottom-nav-item ${pathname === '/invite' ? 'active' : ''}`}
        >
          <UserPlus />
          <span>Invite</span>
        </Link>

        <Link
          href={session ? '/leaderboard' : '/auth/signin'}
          className={`apple-bottom-nav-item ${pathname === '/leaderboard' ? 'active' : ''}`}
        >
          <Trophy />
          <span>Leaderboard</span>
        </Link>

        <Link
          href={session ? '/profile' : '/auth/signin'}
          className={`apple-bottom-nav-item ${pathname === '/profile' ? 'active' : ''}`}
        >
          <User />
          <span>Profile</span>
        </Link>
      </nav>
    </div>
  );
} 