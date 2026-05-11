import { auth } from '@/lib/auth'
import AdminLoginForm from '@/components/admin-login-form'
import { AdminNav } from '@/components/admin-nav'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user || session.user.role !== 'admin') {
    return (
      <div className="min-h-screen">
        <AdminLoginForm />
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      <AdminNav email={session.user.email ?? ''} />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  )
}
