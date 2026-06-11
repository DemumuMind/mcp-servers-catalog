import { backupDatabase, restoreDatabase } from '@/app/actions/backup'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Upload } from 'lucide-react'
import { BackupDownload } from '@/components/admin/backup-download'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { getAdminTranslations } from '@/lib/admin-i18n'

export const dynamic = 'force-dynamic'

export default async function BackupRestorePage() {
  const t = await getAdminTranslations('Admin.backup')

  async function backupAction() {
    'use server'
    return await backupDatabase()
  }

  async function handleRestore(formData: FormData) {
    'use server'
    const sql = formData.get('sql') as string
    if (sql) {
      await restoreDatabase(sql)
    }
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader title={t('title')} description={t('description')} />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('createBackup')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('downloadDump')}
            </p>
            <BackupDownload backupAction={backupAction} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('restoreFromBackup')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-red-600">
              {t('warning')}
            </p>
            <form action={handleRestore} className="space-y-4">
              <Textarea
                name="sql"
                placeholder={t('pasteSqlPlaceholder')}
                rows={10}
                required
              />
              <Button type="submit" variant="destructive">
                <Upload className="h-4 w-4 mr-2" />
                {t('restore')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

