import { backupDatabase, restoreDatabase } from '@/app/actions/backup'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Upload } from 'lucide-react'
import { BackupDownload } from '@/components/admin/backup-download'

export const dynamic = 'force-dynamic'

export default function BackupRestorePage() {
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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Backup / Restore</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Создать Backup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Скачать SQL дамп базы данных.
            </p>
            <BackupDownload backupAction={backupAction} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Восстановить из Backup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-red-600">
              ⚠️ Внимание! Это перезапишет текущие данные. Сначала сделайте backup!
            </p>
            <form action={handleRestore} className="space-y-4">
              <Textarea
                name="sql"
                placeholder="Вставьте SQL дамп здесь..."
                rows={10}
                required
              />
              <Button type="submit" variant="destructive">
                <Upload className="h-4 w-4 mr-2" />
                Восстановить
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
