'use server'

import { z } from 'zod'
import { db, users } from '@/lib/db'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

const registerSchema = z.object({
  email: z.string().email('INVALID_EMAIL'),
  password: z.string().min(6, 'PASSWORD_MIN_LENGTH'),
  name: z.string().min(1, 'NAME_REQUIRED').optional(),
})

export async function registerUser(data: z.infer<typeof registerSchema>) {
  const validated = registerSchema.parse(data)

  const existingUser = await db.select().from(users).where(eq(users.email, validated.email)).limit(1).then((r: any) => r[0] ?? null)

  if (existingUser) {
    throw new Error('EMAIL_ALREADY_EXISTS')
  }

  const hashedPassword = await bcrypt.hash(validated.password, 10)

  const user = await db.insert(users).values({
    email: validated.email,
    password: hashedPassword,
    name: validated.name || null,
    role: 'user',
    provider: 'credentials',
  }).returning().then((r: any) => r[0])

  return { success: true, userId: user.id }
}
