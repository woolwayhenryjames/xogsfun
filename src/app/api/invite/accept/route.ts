export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { inviterPlatformId } = await request.json();

    if (!inviterPlatformId) {
      return NextResponse.json({ error: 'Platform ID is required' }, { status: 400 });
    }

    // 将字符串转换为数字
    const platformId = parseInt(inviterPlatformId, 10);
    
    if (isNaN(platformId)) {
      return NextResponse.json({ error: 'Invalid invitation code format' }, { status: 400 });
    }

    // 查找邀请者
    const inviter = await prisma.user.findUnique({
      where: { platformId },
      select: {
        id: true,
        aiScore: true,
        name: true,
        twitterUsername: true,
      }
    });

    if (!inviter) {
      return NextResponse.json({ error: 'Inviter not found' }, { status: 404 });
    }

    // 获取被邀请者（当前用户）
    const invitee = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        aiScore: true,
        name: true,
        twitterUsername: true,
        createdAt: true,
      }
    });

    if (!invitee) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is trying to invite themselves
    if (inviter.id === invitee.id) {
      return NextResponse.json({ error: 'Cannot invite yourself' }, { status: 400 });
    }

    // 检查用户注册时间，防止直接注册用户后续接受邀请
    const registrationTime = new Date(invitee.createdAt).getTime();
    const currentTime = new Date().getTime();
    const timeDiffMinutes = (currentTime - registrationTime) / (1000 * 60);

    // 如果用户注册超过5分钟，不允许接受邀请
    if (timeDiffMinutes > 5) {
      return NextResponse.json({ 
        error: 'Invitations can only be accepted during initial registration (within 5 minutes of signup). You can still invite others to earn rewards!',
        registrationTooOld: true 
      }, { status: 400 });
    }

    // 检查被邀请者是否已经被任何人邀请过（防止重复邀请）
    const existingInviteForUser = await prisma.invite.findFirst({
      where: {
        inviteeId: invitee.id
      }
    });

    if (existingInviteForUser) {
      return NextResponse.json({ 
        error: 'You have already been invited by someone else. Each user can only accept one invitation.',
        alreadyInvited: true 
      }, { status: 400 });
    }

    // 检查是否已经存在相同的邀请关系（额外的安全检查）
    const existingInvite = await prisma.invite.findFirst({
      where: {
        inviterId: inviter.id,
        inviteeId: invitee.id
      }
    });

    if (existingInvite) {
      return NextResponse.json({ 
        message: 'You have already accepted this invitation! Redirecting to profile...',
        alreadyAccepted: true 
      }, { status: 200 });
    }

    // 计算奖励
    // 邀请者奖励 = 被邀请者AI评分 * 2
    const inviterReward = invitee.aiScore * 2;
    // 被邀请者奖励 = 自己AI评分 * 1
    const inviteeReward = invitee.aiScore * 1;

    // 使用事务创建邀请关系并发放奖励
    await prisma.$transaction(async (tx: any) => {
      // 创建邀请记录（暂时只记录邀请者的奖励）
      await tx.invite.create({
        data: {
          inviterId: inviter.id,
          inviteeId: invitee.id,
          reward: inviterReward, // 邀请者获得的奖励
        }
      });

      // 更新邀请者Xogs余额
      await tx.user.update({
        where: { id: inviter.id },
        data: {
          xogsBalance: {
            increment: inviterReward
          }
        }
      });

      // 更新被邀请者Xogs余额
      await tx.user.update({
        where: { id: invitee.id },
        data: {
          xogsBalance: {
            increment: inviteeReward
          }
        }
      });
    });

    return NextResponse.json({
              message: `Invitation accepted successfully! You received ${inviteeReward} $XOGS tokens, inviter received ${inviterReward} $XOGS tokens`,
      inviterReward: inviterReward,
      inviteeReward: inviteeReward,
      calculation: {
                  inviter: `${invitee.aiScore} (invitee AI score) × 2 = ${inviterReward} $XOGS`,
          invitee: `${invitee.aiScore} (your AI score) × 1 = ${inviteeReward} $XOGS`
      }
    });

  } catch (error) {
    console.error('Error accepting invite:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 