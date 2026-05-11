'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { addComment, deleteComment } from '@/app/actions/public'
import { ReportButton } from '@/components/report-button'
import { formatDistanceToNow } from '@/lib/date-utils'

interface Comment {
  id: string
  content: string
  createdAt: Date | string
  user: {
    name: string | null
    image: string | null
  }
  userId: string
}

export function CommentSection({
  serverId,
  userId,
  initialComments,
}: {
  serverId: string
  userId?: string
  initialComments: Comment[]
}) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !userId) return

    setLoading(true)
    setError('')

    try {
      const newComment = await addComment(userId, serverId, content.trim())
      setComments((prev) => [newComment as Comment, ...prev])
      setContent('')
    } catch (err: any) {
      setError(err.message || 'Ошибка при добавлении комментария')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (commentId: string, commentUserId: string) => {
    if (!userId || userId !== commentUserId) return
    await deleteComment(commentId, userId)
    setComments((prev) => prev.filter((c) => c.id !== commentId))
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Комментарии ({comments.length})</h2>

      {userId ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            placeholder="Напишите комментарий..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            required
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" disabled={loading || !content.trim()}>
            {loading ? 'Отправка...' : 'Отправить'}
          </Button>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">
          <a href="/api/auth/signin" className="text-primary hover:underline">
            Войдите
          </a>{' '}
          чтобы оставить комментарий
        </p>
      )}

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3 p-4 rounded-lg border">
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.user.image || undefined} />
              <AvatarFallback>{comment.user.name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{comment.user.name || 'Аноним'}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.createdAt))}
                </span>
              </div>
              <p className="text-sm mt-1">{comment.content}</p>
              <div className="flex items-center gap-3 mt-2">
                <ReportButton
                  targetType="comment"
                  targetId={comment.id}
                  targetName={`Комментарий от ${comment.user.name || 'Аноним'}`}
                />
                {userId === comment.userId && (
                  <button
                    onClick={() => handleDelete(comment.id, comment.userId)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Удалить
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
