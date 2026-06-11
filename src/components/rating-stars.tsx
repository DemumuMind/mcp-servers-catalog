'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { Star } from 'lucide-react'
import { rateServer } from '@/app/actions/public'

export function RatingStars({
  serverId,
  userId,
  initialRating = 0,
}: {
  serverId: string
  userId: string
  initialRating?: number
}) {
  const t = useTranslations('Rating')
  const [hoverValue, setHoverValue] = useState(0)
  const [userRating, setUserRating] = useState(initialRating)
  const [isPending, startTransition] = useTransition()

  const handleRate = (value: number) => {
    const previous = userRating
    setUserRating(value) // Optimistic
    startTransition(async () => {
      try {
        await rateServer(userId, serverId, value)
      } catch {
        setUserRating(previous) // Revert on error
      }
    })
  }

  return (
    <div className="flex items-center gap-1 ml-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={isPending}
          onClick={() => handleRate(star)}
          onMouseEnter={() => setHoverValue(star)}
          onMouseLeave={() => setHoverValue(0)}
          className="focus:outline-none disabled:opacity-50"
        >
          <Star
            className={`h-5 w-5 transition-colors ${
              star <= (hoverValue || userRating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
      {userRating > 0 && (
        <span className="text-xs text-muted-foreground ml-1">{t('yourRating')}: {userRating}</span>
      )}
    </div>
  )
}
