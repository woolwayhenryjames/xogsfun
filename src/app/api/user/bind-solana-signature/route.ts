import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import nacl from 'tweetnacl'

const prisma = new PrismaClient()

// 简单的 Base58 解码函数
const base58Decode = (s: string): Uint8Array => {
  const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
  const decoded = new Array(64).fill(0)
  let decodedLength = 0
  
  for (let i = 0; i < s.length; i++) {
    let carry = alphabet.indexOf(s[i])
    if (carry < 0) throw new Error('Invalid character')
    
    for (let j = 0; j < decodedLength; j++) {
      carry += decoded[j] * 58
      decoded[j] = carry & 0xff
      carry >>= 8
    }
    
    while (carry > 0) {
      decoded[decodedLength++] = carry & 0xff
      carry >>= 8
    }
  }
  
  // Remove leading zeros
  let leadingZeros = 0
  for (let i = 0; i < s.length && s[i] === '1'; i++) {
    leadingZeros++
  }
  
  const result = new Uint8Array(leadingZeros + decodedLength)
  for (let i = 0; i < decodedLength; i++) {
    result[leadingZeros + i] = decoded[decodedLength - 1 - i]
  }
  
  return result
}

// 验证 Solana 地址格式
const isValidSolanaAddress = (address: string): boolean => {
  try {
    const decoded = base58Decode(address)
    return decoded.length === 32
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { solanaAddress, message, signature, userId } = body

    if (!solanaAddress || !message || !signature) {
      return NextResponse.json(
        { error: 'Solana address, message, and signature are required' },
        { status: 400 }
      )
    }

    // 验证 Solana 地址格式
    if (!isValidSolanaAddress(solanaAddress)) {
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
      // 使用传递的用户 ID（Phantom 应用内访问）
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

    // 验证签名
    try {
      const messageBytes = new TextEncoder().encode(message)
      const signatureBytes = new Uint8Array(signature)
      const publicKeyBytes = base58Decode(solanaAddress)

      const isValidSignature = nacl.sign.detached.verify(
        messageBytes,
        signatureBytes,
        publicKeyBytes
      )

      if (!isValidSignature) {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 400 }
        )
      }
    } catch (error) {
      console.error('Signature verification error:', error)
      return NextResponse.json(
        { error: 'Signature verification failed' },
        { status: 400 }
      )
    }

    // 检查消息是否包含正确的用户 ID 和时间戳
    if (!message.includes(targetUserId)) {
      return NextResponse.json(
        { error: 'Message does not match user context' },
        { status: 400 }
      )
    }

    // 检查时间戳是否在合理范围内（10分钟内）
    const timestampMatch = message.match(/Timestamp: (\d+)/)
    if (timestampMatch) {
      const timestamp = parseInt(timestampMatch[1])
      const now = Date.now()
      const timeDiff = Math.abs(now - timestamp)
      
      if (timeDiff > 10 * 60 * 1000) { // 10分钟
        return NextResponse.json(
          { error: 'Message timestamp is too old' },
          { status: 400 }
        )
      }
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
      message: 'Solana address bound successfully with signature verification'
    })

  } catch (error) {
    console.error('Error binding Solana address with signature:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}