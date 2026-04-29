import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session || session.user?.role !== 'admin') {
    redirect('/')
  }

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-muted border-r p-4">
        <nav className="space-y-2">
          <Link href="/admin" className="block p-2 rounded hover:bg-accent">
            Dashboard
          </Link>
          <Link href="/admin/servers" className="block p-2 rounded hover:bg-accent">
            Servers
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  )
}
