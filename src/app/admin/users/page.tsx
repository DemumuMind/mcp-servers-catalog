import { db, users } from '@/lib/db'
import { eq, desc } from 'drizzle-orm'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trash2, CheckCircle, XCircle } from 'lucide-react'
import { verifyAuthor } from '@/app/actions/author-analytics'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const allUsers = await db.select().from(users).orderBy(desc(users.createdAt))

  async function deleteUser(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    if (id) {
      await db.delete(users).where(eq(users.id, id))
      revalidatePath('/admin/users')
    }
  }

  async function toggleVerifiedAuthor(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    const verified = formData.get('verified') === 'true'
    if (id) {
      await verifyAuthor(id, !verified)
      revalidatePath('/admin/users')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Users</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Статус автора</TableHead>
                <TableHead>Создан</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allUsers.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <form action={toggleVerifiedAuthor}>
                      <input type="hidden" name="id" value={user.id} />
                      <input type="hidden" name="verified" value={String(user.isVerifiedAuthor)} />
                      <Button
                        variant={user.isVerifiedAuthor ? 'default' : 'outline'}
                        size="sm"
                        type="submit"
                        className={user.isVerifiedAuthor ? 'bg-green-600 hover:bg-green-700' : ''}
                      >
                        {user.isVerifiedAuthor ? (
                          <><CheckCircle className="h-3.5 w-3.5 mr-1" /> Подтверждён</>
                        ) : (
                          <><XCircle className="h-3.5 w-3.5 mr-1" /> Не подтверждён</>
                        )}
                      </Button>
                    </form>
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                  </TableCell>
                  <TableCell className="text-right">
                    <form action={deleteUser}>
                      <input type="hidden" name="id" value={user.id} />
                      <Button
                        variant="outline"
                        size="icon"
                        type="submit"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
