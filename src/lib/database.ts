import prisma from '@/lib/prisma'

export { prisma }

/**
 * Get the next available platformId
 * @returns Promise<number> Next platformId
 */
export async function getNextPlatformId(): Promise<number> {
  try {
    const sequence = await prisma.platformIdSequence.upsert({
      where: { id: 'singleton' },
      update: {
        currentValue: {
          increment: 1
        }
      },
      create: {
        id: 'singleton',
        currentValue: 10000
      }
    })

    return sequence.currentValue
  } catch (error) {
    console.error('Failed to get platformId:', error)

    // Fallback: query max platformId from user table
    try {
      const maxUser = await prisma.user.findFirst({
        orderBy: { platformId: 'desc' },
        select: { platformId: true }
      })

      return maxUser ? maxUser.platformId + 1 : 10000
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError)
      // Final fallback: use timestamp to ensure uniqueness
      return 10000 + Math.floor(Date.now() / 1000) % 90000
    }
  }
}

/**
 * Check database connection status
 * @returns Promise<boolean> Whether connection is successful
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Database connection check failed:', error)
    return false
  }
} 