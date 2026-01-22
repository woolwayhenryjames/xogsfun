import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// 检查用户是否有管理权限
async function checkAdminPermission(session: any) {
  if (!session?.user?.id) {
    return false;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { platformId: true }
  });

  return user?.platformId === 10000 || user?.platformId === 10001;
}

// GET - 获取所有合作方
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!await checkAdminPermission(session)) {
      return NextResponse.json(
        { error: 'Access denied. Admin permission required.' },
        { status: 403 }
      );
    }

    const partners = await prisma.partner.findMany({
      orderBy: [
        { displayOrder: 'asc' },
        { name: 'asc' }
      ]
    });

    return NextResponse.json({ partners });
  } catch (error) {
    console.error('Error fetching partners:', error);
    return NextResponse.json(
      { error: 'Failed to fetch partners' },
      { status: 500 }
    );
  }
}

// POST - 创建新合作方
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!await checkAdminPermission(session)) {
      return NextResponse.json(
        { error: 'Access denied. Admin permission required.' },
        { status: 403 }
      );
    }

    const { name, description, displayOrder = 0 } = await request.json();

    if (!name || !description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 }
      );
    }

    const partner = await prisma.partner.create({
      data: {
        name,
        description,
        displayOrder: Number(displayOrder)
      }
    });

    return NextResponse.json({ 
      success: true, 
      partner,
      message: 'Partner created successfully' 
    });
  } catch (error) {
    console.error('Error creating partner:', error);
    
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'A partner with this name already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create partner' },
      { status: 500 }
    );
  }
} 