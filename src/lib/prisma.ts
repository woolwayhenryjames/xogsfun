import { PrismaClient } from '@prisma/client'

import { Pool } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'

const prismaClientSingleton = () => {
  if (process.env.NODE_ENV === 'production') {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL })
    // @ts-ignore: Version mismatch between specific neon/prisma versions
    const adapter = new PrismaNeon(pool)
    return new PrismaClient({ adapter })
  }

  return new PrismaClient({
    // 生产环境只记录错误，减少日志开销
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

// 关闭应用时断开数据库连接
if (typeof window === 'undefined') {
  const cleanup = async () => {
    await prisma.$disconnect()
  }

  process.on('beforeExit', cleanup)
  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)
}

export default prisma 