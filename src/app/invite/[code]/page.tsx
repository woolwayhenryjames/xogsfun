export const runtime = 'edge'
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { InvitePageClient } from './InvitePageClient';
import prisma from '@/lib/prisma';

interface InviterInfo {
  name: string;
  twitterUsername: string;
  image: string;
}

interface PageProps {
  params: {
    code: string;
  };
}

async function getInviterInfo(platformIdStr: string): Promise<InviterInfo | null> {
  try {
    // 将字符串转换为数字
    const platformId = parseInt(platformIdStr, 10);
    
    if (isNaN(platformId)) {
      return null;
    }

    // 查找拥有此 platformId 的用户
    const inviter = await prisma.user.findUnique({
      where: { platformId },
      select: {
        name: true,
        username: true,
        twitterUsername: true,
        image: true,
        profileImageUrl: true,
      },
    });

    if (!inviter) {
      return null;
    }

    // 优先使用 twitterUsername，如果没有则使用 username
    const displayUsername = inviter.twitterUsername || inviter.username || '';
    // 确保用户名格式正确（不重复添加@符号）
    const formattedUsername = displayUsername.startsWith('@') 
      ? displayUsername.slice(1) 
      : displayUsername;

    // 优先使用 profileImageUrl，如果没有则使用 image
    const avatarUrl = inviter.profileImageUrl || inviter.image;

    return {
      name: inviter.name || 'XOGS User',
      twitterUsername: formattedUsername || 'xogsfun',
      image: avatarUrl || '/favicon.svg',
    };
  } catch (error) {
    console.error('Error fetching inviter info:', error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const inviterInfo = await getInviterInfo(params.code);
  
  if (!inviterInfo) {
    return {
      title: 'Invalid Invitation - XOGS',
      description: 'This invitation link may have expired or does not exist.',
    };
  }

  const title = `🎉 ${inviterInfo.name} invites you to join XOGS!`;
  const description = `🤖 ${inviterInfo.name} (@${inviterInfo.twitterUsername}) invites you to join XOGS! → Get your crypto Twitter influence analyzed by AI → Earn $XOGS tokens on Solana → Join 10K+ influencers!`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://x.mdvu.com/invite/${params.code}`,
      siteName: 'XOGS',
      images: [
        {
          url: '/twitter-card-image.png',
          width: 1200,
          height: 630,
          alt: `${inviterInfo.name} invites you to join XOGS - CryptoTwitter AI Scoring`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/twitter-card-image.png'],
      site: '@xogsfun',
      creator: `@${inviterInfo.twitterUsername}`,
    },
  };
}

export default async function InvitePage({ params }: PageProps) {
  const inviterInfo = await getInviterInfo(params.code);
  
  if (!inviterInfo) {
    notFound();
  }

  return <InvitePageClient inviterInfo={inviterInfo} platformId={params.code} />;
} 