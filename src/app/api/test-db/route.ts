import { db, users } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  try {
    const user = await db.select({
      id: users.id,
      email: users.email,
      role: users.role,
      password: users.password,
    }).from(users).where(eq(users.email, 'admin@example.com')).get()
    
    return NextResponse.json({
      found: !!user,
      user: user ? { id: user.id, email: user.email, role: user.role, hasPassword: !!user.password } : null,
      dbInitialized: true,
    })
  } catch (err: any) {
    return NextResponse.json({
      error: err.message,
      stack: err.stack,
    }, { status: 500 })
  }
}
