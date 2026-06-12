'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db, submissions, servers } from '@/lib/db'
import { eq, and, or, like, desc, inArray } from 'drizzle-orm'
import { sendSubmissionNotification, sendStatusUpdateNotification } from '@/lib/email'
import { rateLimit } from '@/lib/rate-limit'
import { delCachePattern } from '@/lib/cache'
import { requireAdmin } from '@/lib/auth-guard'
import { logAudit } from './audit-log'

const submissionSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  url: z.string().url(),
  category: z.string().min(1),
  tags: z.array(z.string()).default([]),
  owner: z.string().optional(),
  email: z.string().email(),
  premium: z.boolean().default(false),
})

export async function createSubmission(data: z.infer<typeof submissionSchema>) {
  const validated = submissionSchema.parse(data)

  const rateLimitResult = await rateLimit(`submit:${validated.email}`, 5, 60 * 60 * 1000)
  if (!rateLimitResult.success) {
    throw new Error('Too many submissions. Please try again later.')
  }

  try {
    const parsedUrl = new URL(validated.url)
    const isGitHub = parsedUrl.hostname === 'github.com' || parsedUrl.hostname === 'www.github.com'
    if (!isGitHub) {
      throw new Error('URL must be a GitHub repository.')
    }
    const pathParts = parsedUrl.pathname.split('/').filter(Boolean)
    if (pathParts.length < 2) {
      throw new Error('Invalid GitHub URL format. Expected: github.com/owner/repo')
    }
    // Optional: check if repo exists via GitHub API (async, non-blocking)
    fetch(`https://api.github.com/repos/${pathParts[0]}/${pathParts[1]}`, {
      headers: process.env.GITHUB_TOKEN ? { Authorization: `token ${process.env.GITHUB_TOKEN}` } : {},
    }).then(async (res) => {
      if (!res.ok) console.warn('GitHub repo not found or not accessible:', validated.url)
    }).catch(() => {})
  } catch (urlError: any) {
    if (urlError.message.includes('URL must') || urlError.message.includes('Invalid GitHub')) {
      throw urlError
    }
    throw new Error('Invalid URL. Please provide a valid GitHub repository.')
  }

  const submission = await db.insert(submissions).values({
    ...validated,
    status: 'pending',
  }).returning()

  await sendSubmissionNotification(validated)

  return submission[0]
}

export async function getSubmissions(filters?: {
  status?: string
  search?: string
}) {
  const conditions = []

  if (filters?.status && filters.status !== 'all') {
    conditions.push(eq(submissions.status, filters.status))
  }
  if (filters?.search) {
    conditions.push(
      or(
        like(submissions.name, `%${filters.search}%`),
        like(submissions.description, `%${filters.search}%`),
        like(submissions.email, `%${filters.search}%`),
      )
    )
  }

  return db
    .select()
    .from(submissions)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(submissions.createdAt))
}

export async function getSubmissionById(id: string) {
  const result = await db
    .select()
    .from(submissions)
    .where(eq(submissions.id, id))
    .limit(1)
  return result[0] || null
}

export async function approveSubmission(id: string) {
  const userId = await requireAdmin()
  const [submission] = await db
    .update(submissions)
    .set({ status: 'approved' })
    .where(eq(submissions.id, id))
    .returning()

  await sendStatusUpdateNotification({
    name: submission.name,
    email: submission.email,
    status: 'approved',
  })

  try {
    const url = new URL(submission.url)
    const pathParts = url.pathname.split('/').filter(Boolean)
    const owner = submission.owner || pathParts[0] || 'unknown'
    const repo = pathParts[1] || 'unknown'

    await db.insert(servers).values({
      name: submission.name,
      description: submission.description,
      owner,
      repo,
      fullSlug: `${owner}/${repo}`,
      category: submission.category,
      githubUrl: submission.url,
      tags: submission.tags?.length ? submission.tags : ['submitted'],
      featured: submission.premium,
      isOfficial: false,
      isSponsored: submission.premium,
    })
    revalidatePath('/', 'layout')
    delCachePattern('servers:')
  } catch (err) {
    console.error('Failed to create server from submission:', err)
  }

  try { await logAudit('submission.approve', 'Submission', id, { name: submission.name }, userId) } catch { /* audit log failure — non-critical */ }
  revalidatePath('/admin/submissions')
  return submission
}

export async function rejectSubmission(id: string) {
  const userId = await requireAdmin()
  const [submission] = await db
    .update(submissions)
    .set({ status: 'rejected' })
    .where(eq(submissions.id, id))
    .returning()

  // Send status update email
  await sendStatusUpdateNotification({
    name: submission.name,
    email: submission.email,
    status: 'rejected',
  })

  try { await logAudit('submission.reject', 'Submission', id, { name: submission.name }, userId) } catch { /* audit log failure — non-critical */ }
  revalidatePath('/admin/submissions')
  return submission
}

export async function deleteSubmission(id: string) {
  const userId = await requireAdmin()
  await db.delete(submissions).where(eq(submissions.id, id))
  try { await logAudit('submission.delete', 'Submission', id, undefined, userId) } catch { /* audit log failure — non-critical */ }
  revalidatePath('/admin/submissions')
}

export async function deleteSubmissions(ids: string[]) {
  const userId = await requireAdmin()
  await db.delete(submissions).where(inArray(submissions.id, ids))
  try { await logAudit('submission.bulkDelete', 'Submission', undefined, { count: ids.length }, userId) } catch { /* audit log failure — non-critical */ }
  revalidatePath('/admin/submissions')
}

export async function bulkApproveSubmissions(ids: string[]) {
  const userId = await requireAdmin()
  const pendingSubmissions = await db
    .select()
    .from(submissions)
    .where(and(inArray(submissions.id, ids), eq(submissions.status, 'pending')))

  for (const submission of pendingSubmissions) {
    await approveSubmission(submission.id)
  }

  try { await logAudit('submission.bulkApprove', 'Submission', undefined, { count: pendingSubmissions.length }, userId) } catch { /* audit log failure — non-critical */ }
  revalidatePath('/admin/submissions')
}
