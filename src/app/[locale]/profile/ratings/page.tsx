import { getUserRatings } from '@/app/actions/profile'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Star, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from '@/lib/date-utils'

export const dynamic = 'force-dynamic'

export default async function ProfileRatingsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const session = await auth()

  if (!session?.user?.id) {
    redirect(`/${locale}/login`)
  }

  const ratings = await getUserRatings(session.user.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Star className="h-5 w-5" />
        <h1 className="text-xl font-bold">Мои оценки</h1>
        <span className="text-sm text-muted-foreground">({ratings.length})</span>
      </div>

      {ratings.length === 0 ? (
        <p className="text-muted-foreground text-center py-16">
          Вы пока не оценили ни один сервер.
        </p>
      ) : (
        <div className="space-y-4">
          {ratings.map((rating) => (
            <div
              key={rating.id}
              className="p-4 rounded-lg border hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <Link
                  href={`/${locale}/servers/${rating.server.owner}/${rating.server.repo}`}
                  className="text-sm font-medium hover:underline flex items-center gap-1"
                >
                  {rating.server.name}
                  <ExternalLink className="h-3 w-3" />
                </Link>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(rating.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= rating.value
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">{rating.value} из 5</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
