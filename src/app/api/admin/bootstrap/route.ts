import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { hash } from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = body.email || 'admin@example.com'
    const password = body.password || 'admin123'
    const name = body.name || 'Admin'

    // Delete existing admin(s) and recreate
    await db.delete(users).where(eq(users.role, 'admin'))

    const passwordHash = await hash(password, 10)

    const user = await db.insert(users).values({
      email,
      name,
      password: passwordHash,
      role: 'admin',
    }).returning()

    return NextResponse.json({ id: user[0].id, email: user[0].email, role: user[0].role }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create admin' }, { status: 500 })
  }
}
