'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

const registerSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Минимум 6 символов'),
  name: z.string().min(1, 'Введите имя').optional(),
})

export async function registerUser(data: z.infer<typeof registerSchema>) {
  const validated = registerSchema.parse(data)

  const existingUser = await prisma.user.findUnique({
    where: { email: validated.email },
  })

  if (existingUser) {
    throw new Error('Пользователь с таким email уже существует')
  }

  const hashedPassword = await bcrypt.hash(validated.password, 10)

  const user = await prisma.user.create({
    data: {
      email: validated.email,
      password: hashedPassword,
      name: validated.name || null,
      role: 'user',
      provider: 'credentials',
    },
  })

  return { success: true, userId: user.id }
}
