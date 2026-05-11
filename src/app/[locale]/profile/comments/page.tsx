import { getUserComments } from '@/app/actions/profile'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { MessageSquare, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from '@/lib/date-utils'

export const dynamic = 'force-dynamic'

export default async function ProfileCommentsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const session = await auth()

  if (!session?.user?.id) {
    redirect(`/${locale}/login`)
  }

  const comments = await getUserComments(session.user.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        <h1 className="text-xl font-bold">Мои комментарии</h1>
        <span className="text-sm text-muted-foreground">({comments.length})</span>
      </div>

      {comments.length === 0 ? (
        <p className="text-muted-foreground text-center py-16">
          Вы пока не оставили ни одного комментария.
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="p-4 rounded-lg border hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <Link
                  href={`/${locale}/servers/${comment.server.owner}/${comment.server.repo}`}
                  className="text-sm font-medium hover:underline flex items-center gap-1"
                >
                  {comment.server.name}
                  <ExternalLink className="h-3 w-3" />
                </Link>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(comment.createdAt)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{comment.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
