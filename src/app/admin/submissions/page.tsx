import { getSubmissions, approveSubmission, rejectSubmission, deleteSubmissions, bulkApproveSubmissions } from '@/app/actions/submissions'
import { BulkSubmissionsTable } from '@/components/admin/bulk-submissions-table'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { getAdminTranslations } from '@/lib/admin-i18n'

export const dynamic = 'force-dynamic'

export default async function AdminSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>
}) {
  const t = await getAdminTranslations('Admin.submissions')
  const params = await searchParams
  const status = params.status || 'all'
  const search = params.q || ''

  const submissions = await getSubmissions({
    status: status === 'all' ? undefined : status,
    search,
  })

  async function handleApprove(id: string) {
    'use server'
    await approveSubmission(id)
  }

  async function handleReject(id: string) {
    'use server'
    await rejectSubmission(id)
  }

  async function handleDelete(ids: string[]) {
    'use server'
    await deleteSubmissions(ids)
  }

  async function handleBulkApprove(ids: string[]) {
    'use server'
    await bulkApproveSubmissions(ids)
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader title={t('title')} description={t('description')} />
      <BulkSubmissionsTable submissions={submissions} approveAction={handleApprove} bulkApproveAction={handleBulkApprove} rejectAction={handleReject} deleteAction={handleDelete} />
    </div>
  )
}
