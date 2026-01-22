import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { solanaAddress } = body

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

    // 检查地址是否已被其他用户绑定
    const existingUser = await prisma.user.findFirst({
      where: {
        solanaAddress: solanaAddress,
        NOT: {
          id: session.user.id
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
        id: session.user.id
      },
      data: {
        solanaAddress: solanaAddress
      }
    })

    return NextResponse.json({
      success: true,
      solanaAddress: updatedUser.solanaAddress
    })

  } catch (error) {
    console.error('Error binding Solana address:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}