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

// PUT - 更新合作方
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!await checkAdminPermission(session)) {
      return NextResponse.json(
        { error: 'Access denied. Admin permission required.' },
        { status: 403 }
      );
    }

    const { name, description, displayOrder, isActive } = await request.json();
    const { id } = params;

    if (!name || !description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 }
      );
    }

    const partner = await prisma.partner.update({
      where: { id },
      data: {
        name,
        description,
        displayOrder: Number(displayOrder),
        isActive: Boolean(isActive)
      }
    });

    return NextResponse.json({ 
      success: true, 
      partner,
      message: 'Partner updated successfully' 
    });
  } catch (error) {
    console.error('Error updating partner:', error);
    
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      );
    }

    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'A partner with this name already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update partner' },
      { status: 500 }
    );
  }
}

// DELETE - 删除合作方
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!await checkAdminPermission(session)) {
      return NextResponse.json(
        { error: 'Access denied. Admin permission required.' },
        { status: 403 }
      );
    }

    const { id } = params;

    await prisma.partner.delete({
      where: { id }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Partner deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting partner:', error);
    
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete partner' },
      { status: 500 }
    );
  }
} 