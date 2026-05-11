import type { Metadata } from 'next'
import { getTopAuthors } from '@/app/actions/authors'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Star, Server, Bookmark, MessageSquare, Award } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Топ авторов MCP серверов',
  description: 'Рейтинг авторов по количеству серверов, GitHub stars и рейтингу',
}

export const dynamic = 'force-dynamic'

export default async function AuthorsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const authors = await getTopAuthors(50)

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold mb-4">Топ авторов</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Разработчики, создающие лучшие MCP серверы сообщества
        </p>
      </div>

      {authors.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          Пока нет авторов с привязанными серверами
        </p>
      ) : (
        <div className="space-y-4 max-w-3xl mx-auto">
          {authors.map((author, index) => (
            <Card key={author.id} className="relative overflow-hidden">
              {/* Rank badge */}
              {index < 3 && (
                <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-lg text-xs font-bold ${
                  index === 0 ? 'bg-yellow-500 text-white' :
                  index === 1 ? 'bg-gray-400 text-white' :
                  'bg-amber-600 text-white'
                }`}>
                  <Award className="w-4 h-4 inline mr-1" />
                  #{index + 1}
                </div>
              )}
              
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  {/* Avatar placeholder */}
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-lg font-bold text-primary">
                      {(author.name || author.email).charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{author.name || 'Аноним'}</h3>
                      <span className="text-sm text-muted-foreground">{author.email}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                      <div className="flex items-center gap-2">
                        <Server className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{author.servers} серверов</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-medium">{author.totalStars.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Bookmark className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{author.totalBookmarks}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{author.totalComments}</span>
                      </div>
                    </div>

                    {author.totalRatings > 0 && (
                      <div className="mt-3 flex items-center gap-1 text-sm">
                        <span className="text-amber-500">★</span>
                        <span className="font-medium">{author.avgRating.toFixed(1)}</span>
                        <span className="text-muted-foreground">({author.totalRatings} оценок)</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
