import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        platformId: true,
        invitesSent: {
          include: {
            invitee: {
              select: {
                name: true,
                twitterUsername: true,
                profileImageUrl: true,
                image: true,
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        invitesReceived: {
          include: {
            inviter: {
              select: {
                name: true,
                twitterUsername: true,
                profileImageUrl: true,
                image: true,
              }
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 计算邀请者奖励（只计算作为邀请者获得的奖励）
    const totalReward = (user.invitesSent || []).reduce((sum: number, invite: any) => sum + invite.reward, 0);

    // 使用 platformId 作为邀请码
    const inviteCode = user.platformId.toString();
    
    // 随机选择域名
    const domains = [
      'https://x.hmvy.com',
      'https://x.ptvu.com', 
      'https://x.mdvu.com'
    ];
    const randomDomain = domains[Math.floor(Math.random() * domains.length)];
    const inviteLink = `${randomDomain}/invite/${inviteCode}`;

    // 处理头像数据：优先使用Twitter头像，没有则使用NextAuth头像
    const processedInvitesSent = (user.invitesSent || []).map(invite => ({
      ...invite,
      invitee: {
        ...invite.invitee,
        image: invite.invitee.profileImageUrl || invite.invitee.image
      }
    }));

    const processedInvitesReceived = user.invitesReceived ? [{
      ...user.invitesReceived,
      inviter: {
        ...user.invitesReceived.inviter,
        image: user.invitesReceived.inviter.profileImageUrl || user.invitesReceived.inviter.image
      }
    }] : [];

    return NextResponse.json({
      inviteCode,
      inviteLink,
      invitesSent: processedInvitesSent,
      invitesReceived: processedInvitesReceived,
      totalReward,
      inviteCount: (user.invitesSent || []).length,
    });

  } catch (error) {
    console.error('Error fetching invite data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 