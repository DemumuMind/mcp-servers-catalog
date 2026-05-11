import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@example.com' },
      select: { id: true, email: true, role: true, password: true }
    })
    
    return NextResponse.json({
      found: !!user,
      user: user ? { id: user.id, email: user.email, role: user.role, hasPassword: !!user.password } : null,
      prismaInitialized: !!prisma.user,
    })
  } catch (err: any) {
    return NextResponse.json({
      error: err.message,
      stack: err.stack,
    }, { status: 500 })
  }
}
