import { getServers, deleteServers, toggleServerFeatured } from '@/app/actions/servers'
import { Button } from '@/components/ui/button'
import { ServerFormDialog } from '@/components/admin/server-form-dialog'
import { BulkServerTable } from '@/components/admin/bulk-server-table'

export const dynamic = 'force-dynamic'

export default async function AdminServersPage() {
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Servers</h1>
        <ServerFormDialog>
          <Button>Добавить сервер</Button>
        </ServerFormDialog>
      </div>

      <BulkServerTable
        servers={servers}
        deleteAction={handleDelete}
        toggleFeaturedAction={handleToggleFeatured}
      />
    </div>
  )
}
