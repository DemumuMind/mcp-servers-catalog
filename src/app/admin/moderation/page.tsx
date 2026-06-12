import { getPendingComments, getAllComments, approveComment, rejectComment, bulkApproveComments, bulkRejectComments } from '@/app/actions/moderation'
import { ModerationTable } from '@/components/admin/moderation-table'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import Link from 'next/link'
import { getAdminTranslations } from '@/lib/admin-i18n'

export const dynamic = 'force-dynamic'

export default async function ModerationPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const t = await getAdminTranslations('Admin.moderation')
  const params = await searchParams
  const showAll = params.tab === 'all'

  const comments: Awaited<ReturnType<typeof getAllComments>> = showAll ? await getAllComments() : await getPendingComments()

  async function handleApprove(id: string) {
    'use server'
    await approveComment(id)
  }

  async function handleReject(id: string) {
    'use server'
    await rejectComment(id)
  }

  async function handleBulkApprove(ids: string[]) {
    'use server'
    await bulkApproveComments(ids)
  }

  async function handleBulkReject(ids: string[]) {
    'use server'
    await bulkRejectComments(ids)
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader title={t('title')} description={t('description')} actions={
          <div className="flex gap-2">
          <Link href="/admin/moderation"
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              !showAll ? 'bg-primary text-primary-foreground' : 'border hover:bg-accent'
            }`}
          >
            {t('underReviewTab')}
          </Link>
          <Link href="/admin/moderation?tab=all"
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              showAll ? 'bg-primary text-primary-foreground' : 'border hover:bg-accent'
            }`}
          >
            {t('allCommentsTab')}
          </Link>
        </div>
        }
      />

      <div className="premium-panel p-4">
        <p className="text-muted-foreground">
          {showAll
            ? t('totalComments', { count: comments.length })
            : t('commentsUnderReview', { count: comments.length })}
        </p>
      </div>

      <ModerationTable
        comments={comments}
        approveAction={handleApprove}
        rejectAction={handleReject}
        bulkApproveAction={handleBulkApprove}
        bulkRejectAction={handleBulkReject}
      />
    </div>
  )
}

