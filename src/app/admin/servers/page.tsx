import { getServers, deleteServers, toggleServerFeatured } from '@/app/actions/servers'
import { Button } from '@/components/ui/button'
import { ServerFormDialog } from '@/components/admin/server-form-dialog'
import { BulkServerTable } from '@/components/admin/bulk-server-table'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { getAdminTranslations } from '@/lib/admin-i18n'

export const dynamic = 'force-dynamic'

export default async function AdminServersPage() {
  const t = await getAdminTranslations('Admin.servers')
  const servers = await getServers()

  async function handleDelete(ids: string[]) {
    'use server'
    await deleteServers(ids)
  }

  async function handleToggleFeatured(id: string, featured: boolean) {
    'use server'
    await toggleServerFeatured(id, featured)
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={t('title')}
        description={t('description')}
        actions={
          <ServerFormDialog>
            <Button>{t('addServer')}</Button>
          </ServerFormDialog>
        }
      />

      <BulkServerTable servers={servers} deleteAction={handleDelete} toggleFeaturedAction={handleToggleFeatured} />
    </div>
  )
}
