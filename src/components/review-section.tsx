'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { submitReview, voteReview, deleteReview } from '@/app/actions/reviews'
import { ReportButton } from '@/components/report-button'
import { formatDistanceToNow } from '@/lib/date-utils'
import { ThumbsUp, ThumbsDown, Trash2 } from 'lucide-react'

export interface Review {
  id: string
  content: string
  helpfulCount: number
  notHelpfulCount: number
  createdAt: Date | string
  userId: string
  user: {
    id: string
    name: string | null
    image: string | null
    isVerifiedAuthor: boolean
  }
  votes: Array<{
    userId: string
    helpful: boolean
  }>
}

interface ReviewSectionProps {
  serverId: string
  userId?: string
  initialReviews: Review[]
}

export function ReviewSection({ serverId, userId, initialReviews }: ReviewSectionProps) {
  const t = useTranslations('Reviews')
  const locale = useLocale()
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !userId) return

    setLoading(true)
    setError('')

    try {
      const result = await submitReview(userId, serverId, content.trim())
      if (result.success && result.reviewId) {
        const optimistic: Review = {
          id: result.reviewId,
          userId,
          content: content.trim(),
          helpfulCount: 0,
          notHelpfulCount: 0,
          createdAt: new Date(),
          votes: [],
          user: { id: userId, name: null, image: null, isVerifiedAuthor: false },
        }
        setReviews((prev) => [optimistic, ...prev])
      }
      setContent('')
    } catch (err: any) {
      setError(err.message || t('addError'))
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (reviewId: string, helpful: boolean) => {
    if (!userId) return
    const result = await voteReview(userId, reviewId, helpful)

    setReviews((prev) =>
      prev.map((r) => {
        if (r.id !== reviewId) return r
        const existingVote = r.votes.find((v) => v.userId === userId)
        let newVotes = [...r.votes]
        let newHelpful = r.helpfulCount
        let newNotHelpful = r.notHelpfulCount

        if ((result as any).action === 'added') {
          newVotes.push({ userId, helpful })
          if (helpful) newHelpful++
          else newNotHelpful++
        } else if ((result as any).action === 'removed' && existingVote) {
          newVotes = newVotes.filter((v) => v.userId !== userId)
          if (existingVote.helpful) newHelpful--
          else newNotHelpful--
        } else if ((result as any).action === 'changed' && existingVote) {
          newVotes = newVotes.map((v) => (v.userId === userId ? { userId, helpful } : v))
          if (helpful) {
            newHelpful++
            newNotHelpful--
          } else {
            newHelpful--
            newNotHelpful++
          }
        }

        return { ...r, votes: newVotes, helpfulCount: newHelpful, notHelpfulCount: newNotHelpful }
      })
    )
  }

  const handleDelete = async (reviewId: string, reviewUserId: string) => {
    if (!userId || userId !== reviewUserId) return
    await deleteReview(reviewId, userId)
    setReviews((prev) => prev.filter((r) => r.id !== reviewId))
  }

  const userVote = (review: Review) => {
    if (!userId) return null
    return review.votes.find((v) => v.userId === userId)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t('title')} ({reviews.length})</h2>

      {userId ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            placeholder={t('placeholder')}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            required
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" disabled={loading || !content.trim()}>
            {loading ? t('submitting') : t('submit')}
          </Button>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">
          <Link href="/api/auth/signin" className="text-primary hover:underline">
            {t('signIn')}
          </Link>{' '}
          {t('toReview')}
        </p>
      )}

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="flex gap-3 p-4 rounded-lg border">
            <Avatar className="h-8 w-8">
              <AvatarImage src={review.user.image || undefined} />
              <AvatarFallback>{review.user.name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{review.user.name || t('anonymous')}</span>
                  {review.user.isVerifiedAuthor && (
                    <Badge className="bg-green-500 text-white text-[10px] px-1 py-0 h-4">
                      {t('verifiedAuthor')}
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(review.createdAt), locale)}
                </span>
              </div>
              <div className="prose dark:prose-invert max-w-none prose-sm mt-2">
                <p className="text-sm whitespace-pre-wrap">{review.content}</p>
              </div>

              <div className="flex items-center gap-3 mt-3">
                <button
                  onClick={() => handleVote(review.id, true)}
                  className={`flex items-center gap-1 text-xs transition-colors ${
                    userVote(review)?.helpful === true
                      ? 'text-green-600 font-medium'
                      : 'text-muted-foreground hover:text-green-600'
                  }`}
                  disabled={!userId}
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                  {t('helpful')} ({review.helpfulCount})
                </button>
                <button
                  onClick={() => handleVote(review.id, false)}
                  className={`flex items-center gap-1 text-xs transition-colors ${
                    userVote(review)?.helpful === false
                      ? 'text-red-600 font-medium'
                      : 'text-muted-foreground hover:text-red-600'
                  }`}
                  disabled={!userId}
                >
                  <ThumbsDown className="h-3.5 w-3.5" />
                  {t('notHelpful')} ({review.notHelpfulCount})
                </button>
                <ReportButton
                  targetType="review"
                  targetId={review.id}
                  targetName={`${t('reviewFrom')} ${review.user.name || t('anonymous')}`}
                />
                {userId === review.userId && (
                  <button
                    onClick={() => handleDelete(review.id, review.userId)}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 ml-auto"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {t('delete')}
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
