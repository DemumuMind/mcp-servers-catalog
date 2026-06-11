import { getClients, deleteClients } from '@/app/actions/clients'
import { Button } from '@/components/ui/button'
import { ClientFormDialog } from '@/components/admin/client-form-dialog'
import { BulkClientTable } from '@/components/admin/bulk-client-table'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { getAdminTranslations } from '@/lib/admin-i18n'

export const dynamic = 'force-dynamic'

export default async function AdminClientsPage() {
  const t = await getAdminTranslations('Admin.clients')
  const clients = await getClients()

  async function handleDelete(ids: string[]) {
    'use server'
    await deleteClients(ids)
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={t('title')}
        description={t('description')}
        actions={
          <ClientFormDialog>
            <Button>{t('addClient')}</Button>
          </ClientFormDialog>
        }
      />
      <BulkClientTable clients={clients} deleteAction={handleDelete} />
    </div>
  )
}
