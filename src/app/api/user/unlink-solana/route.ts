import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    let targetUserId: string

    // 尝试从会话获取用户 ID（正常浏览器访问）
    const session = await getServerSession(authOptions)
    if (session?.user?.id) {
      targetUserId = session.user.id
    } else if (userId) {
      // 使用 URL 参数传递的用户 ID（Phantom 应用内访问）
      targetUserId = userId
      
      // 验证用户 ID 是否存在于数据库中
      const userExists = await prisma.user.findUnique({
        where: { id: targetUserId }
      })
      
      if (!userExists) {
        return NextResponse.json(
          { error: 'Invalid user ID' },
          { status: 400 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'User authentication required' },
        { status: 401 }
      )
    }

    // 检查用户是否有绑定的 Solana 地址
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { solanaAddress: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (!user.solanaAddress) {
      return NextResponse.json(
        { error: 'No Solana address bound to this account' },
        { status: 400 }
      )
    }

    // 清除用户的 Solana 地址
    const updatedUser = await prisma.user.update({
      where: {
        id: targetUserId
      },
      data: {
        solanaAddress: null
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Solana address unlinked successfully'
    })

  } catch (error) {
    console.error('Error unlinking Solana address:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}