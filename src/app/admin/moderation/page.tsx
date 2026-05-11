import { getPendingComments, getAllComments, approveComment, rejectComment, bulkApproveComments, bulkRejectComments } from '@/app/actions/moderation'
import { ModerationTable } from '@/components/admin/moderation-table'

export const dynamic = 'force-dynamic'

export default async function ModerationPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const params = await searchParams
  const showAll = params.tab === 'all'

  const comments = showAll ? await getAllComments() : await getPendingComments()

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Модерация комментариев</h1>
        <div className="flex gap-2">
          <a
            href="/admin/moderation"
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              !showAll ? 'bg-primary text-primary-foreground' : 'border hover:bg-accent'
            }`}
          >
            На проверке
          </a>
          <a
            href="/admin/moderation?tab=all"
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              showAll ? 'bg-primary text-primary-foreground' : 'border hover:bg-accent'
            }`}
          >
            Все комментарии
          </a>
        </div>
      </div>

      <div className="bg-card rounded-lg border p-4">
        <p className="text-muted-foreground">
          {showAll
            ? `Всего комментариев: ${comments.length}`
            : `Комментариев на проверке: ${comments.length}`}
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
