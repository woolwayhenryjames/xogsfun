import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { solanaAddress, userId } = body

    if (!solanaAddress) {
      return NextResponse.json(
        { error: 'Solana address is required' },
        { status: 400 }
      )
    }

    // 验证 Solana 地址格式（基础验证）
    if (solanaAddress.length < 32 || solanaAddress.length > 44) {
      return NextResponse.json(
        { error: 'Invalid Solana address format' },
        { status: 400 }
      )
    }

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

    // 检查地址是否已被其他用户绑定
    const existingUser = await prisma.user.findFirst({
      where: {
        solanaAddress: solanaAddress,
        NOT: {
          id: targetUserId
        }
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'This Solana address is already bound to another account' },
        { status: 400 }
      )
    }

    // 更新用户的 Solana 地址
    const updatedUser = await prisma.user.update({
      where: {
        id: targetUserId
      },
      data: {
        solanaAddress: solanaAddress
      }
    })

    return NextResponse.json({
      success: true,
      solanaAddress: updatedUser.solanaAddress,
      message: 'Solana address bound successfully'
    })

  } catch (error) {
    console.error('Error binding Solana address (flexible):', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}