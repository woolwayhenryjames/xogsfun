import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Platform IDs of admin users
const ADMIN_PLATFORM_ID = 10000;

// Verify if user is admin
export async function isAdmin(userId?: string): Promise<boolean> {
  try {
    if (!userId) {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return false;
      }
      userId = session.user.id;
    }

    // Get user's platform ID from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { platformId: true }
    });

    return user?.platformId === ADMIN_PLATFORM_ID;
  } catch (error) {
    console.error('Admin verification failed:', error);
    return false;
  }
}

// Verify if current session user is admin
export async function requireAdmin(): Promise<{ isAdmin: boolean; userId?: string; platformId?: number }> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return { isAdmin: false };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { platformId: true }
    });

    const isAdminUser = user?.platformId === ADMIN_PLATFORM_ID;

    return {
      isAdmin: isAdminUser,
      userId: session.user.id,
      platformId: user?.platformId
    };
  } catch (error) {
    console.error('Admin verification failed:', error);
    return { isAdmin: false };
  }
}

// Admin permission middleware (for API routes)
export async function adminMiddleware(): Promise<{ authorized: boolean; error?: string; userId?: string }> {
  const { isAdmin: isAdminUser, userId } = await requireAdmin();
  
  if (!userId) {
    return { 
      authorized: false, 
      error: 'Not logged in' 
    };
  }

  if (!isAdminUser) {
    return { 
      authorized: false, 
      error: 'Insufficient permissions, admin access required' 
    };
  }

  return { 
    authorized: true, 
    userId 
  };
} 