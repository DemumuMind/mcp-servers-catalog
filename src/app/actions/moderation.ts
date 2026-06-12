'use server'

import { db, comments, users, servers } from '@/lib/db'
import { eq, inArray, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth-guard'
import { logAudit } from './audit-log'

export interface ModerationCommentRow {
  id: string
  content: string
  isModerated: boolean
  createdAt: Date
  updatedAt: Date
  userId: string
  serverId: string
  user: { name: string | null; email: string | null } | null
  server: { name: string | null; owner: string | null; repo: string | null } | null
}

function buildCommentSelect() {
  return {
    id: comments.id,
    content: comments.content,
    isModerated: comments.isModerated,
    createdAt: comments.createdAt,
    updatedAt: comments.updatedAt,
    userId: comments.userId,
    serverId: comments.serverId,
    user: { name: users.name, email: users.email },
    server: { name: servers.name, owner: servers.owner, repo: servers.repo },
  }
}

export async function getPendingComments(): Promise<ModerationCommentRow[]> {
  await requireAdmin()
  return db
    .select(buildCommentSelect())
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .leftJoin(servers, eq(comments.serverId, servers.id))
    .where(eq(comments.isModerated, false))
    .orderBy(desc(comments.createdAt))
}

export async function getAllComments(limit: number = 100): Promise<ModerationCommentRow[]> {
  await requireAdmin()
  return db
    .select(buildCommentSelect())
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .leftJoin(servers, eq(comments.serverId, servers.id))
    .orderBy(desc(comments.createdAt))
    .limit(limit)
}

export async function approveComment(id: string) {
  const userId = await requireAdmin()
  await db
    .update(comments)
    .set({ isModerated: true })
    .where(eq(comments.id, id))
  await logAudit('comment.approve', 'Comment', id, undefined, userId)
  revalidatePath('/admin/moderation')
}

export async function rejectComment(id: string) {
  const userId = await requireAdmin()
  await db.delete(comments).where(eq(comments.id, id))
  await logAudit('comment.reject', 'Comment', id, undefined, userId)
  revalidatePath('/admin/moderation')
}

export async function bulkApproveComments(ids: string[]) {
  const userId = await requireAdmin()
  await db
    .update(comments)
    .set({ isModerated: true })
    .where(inArray(comments.id, ids))
  await logAudit('comment.bulkApprove', 'Comment', undefined, { count: ids.length }, userId)
  revalidatePath('/admin/moderation')
}

export async function bulkRejectComments(ids: string[]) {
  const userId = await requireAdmin()
  await db.delete(comments).where(inArray(comments.id, ids))
  await logAudit('comment.bulkReject', 'Comment', undefined, { count: ids.length }, userId)
  revalidatePath('/admin/moderation')
}
