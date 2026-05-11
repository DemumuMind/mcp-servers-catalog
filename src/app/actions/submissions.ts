'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { sendSubmissionNotification, sendStatusUpdateNotification } from '@/lib/email'
import { rateLimit } from '@/lib/rate-limit'
import { delCachePattern } from '@/lib/cache'

const submissionSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  url: z.string().url(),
  category: z.string().min(1),
  email: z.string().email(),
  premium: z.boolean().default(false),
})

export async function createSubmission(data: z.infer<typeof submissionSchema>) {
  const validated = submissionSchema.parse(data)

  // Rate limit by email: 5 submissions per hour
  const rateLimitResult = await rateLimit(`submit:${validated.email}`, 5, 60 * 60 * 1000)
  if (!rateLimitResult.success) {
    throw new Error('Слишком много отправок. Попробуйте позже.')
  }

  // Content scanning: validate GitHub URL
  try {
    const parsedUrl = new URL(validated.url)
    const isGitHub = parsedUrl.hostname === 'github.com' || parsedUrl.hostname === 'www.github.com'
    if (!isGitHub) {
      throw new Error('URL должен быть GitHub репозиторием.')
    }
    const pathParts = parsedUrl.pathname.split('/').filter(Boolean)
    if (pathParts.length < 2) {
      throw new Error('Неверный формат GitHub URL. Ожидается: github.com/owner/repo')
    }
    // Optional: check if repo exists via GitHub API (async, non-blocking)
    fetch(`https://api.github.com/repos/${pathParts[0]}/${pathParts[1]}`, {
      headers: process.env.GITHUB_TOKEN ? { Authorization: `token ${process.env.GITHUB_TOKEN}` } : {},
    }).then(async (res) => {
      if (!res.ok) console.warn('GitHub repo not found or not accessible:', validated.url)
    }).catch(() => {})
  } catch (urlError: any) {
    if (urlError.message.includes('URL должен') || urlError.message.includes('Неверный формат')) {
      throw urlError
    }
    throw new Error('Неверный URL. Пожалуйста, укажите корректный GitHub репозиторий.')
  }

  const submission = await prisma.submission.create({
    data: {
      ...validated,
      status: 'pending',
    },
  })

  // Send email notification to admin
  await sendSubmissionNotification(validated)

  return submission
}

export async function getSubmissions(filters?: {
  status?: string
  search?: string
}) {
  const where: any = {}

  if (filters?.status && filters.status !== 'all') {
    where.status = filters.status
  }
  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } },
    ]
  }

  return prisma.submission.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })
}

export async function getSubmissionById(id: string) {
  return prisma.submission.findUnique({
    where: { id },
  })
}

export async function approveSubmission(id: string) {
  const submission = await prisma.submission.update({
    where: { id },
    data: { status: 'approved' },
  })

  // Send status update email
  await sendStatusUpdateNotification({
    name: submission.name,
    email: submission.email,
    status: 'approved',
  })

  // Try to create a server from the submission
  try {
    const url = new URL(submission.url)
    const pathParts = url.pathname.split('/').filter(Boolean)
    const owner = pathParts[0] || 'unknown'
    const repo = pathParts[1] || 'unknown'

    await prisma.server.create({
      data: {
        name: submission.name,
        description: submission.description,
        owner,
        repo,
        fullSlug: `${owner}/${repo}`,
        category: submission.category,
        githubUrl: submission.url,
        tags: ['submitted'],
        featured: submission.premium,
        isOfficial: false,
        isSponsored: submission.premium,
      },
    })
    revalidatePath('/', 'layout')
    delCachePattern('servers:')
  } catch (err) {
    console.error('Failed to create server from submission:', err)
  }

  revalidatePath('/admin/submissions')
  return submission
}

export async function rejectSubmission(id: string) {
  const submission = await prisma.submission.update({
    where: { id },
    data: { status: 'rejected' },
  })

  // Send status update email
  await sendStatusUpdateNotification({
    name: submission.name,
    email: submission.email,
    status: 'rejected',
  })

  revalidatePath('/admin/submissions')
  return submission
}

export async function deleteSubmission(id: string) {
  await prisma.submission.delete({ where: { id } })
  revalidatePath('/admin/submissions')
}

export async function deleteSubmissions(ids: string[]) {
  await prisma.submission.deleteMany({
    where: { id: { in: ids } },
  })
  revalidatePath('/admin/submissions')
}

export async function bulkApproveSubmissions(ids: string[]) {
  const submissions = await prisma.submission.findMany({
    where: { id: { in: ids }, status: 'pending' },
  })

  for (const submission of submissions) {
    await approveSubmission(submission.id)
  }

  revalidatePath('/admin/submissions')
}
