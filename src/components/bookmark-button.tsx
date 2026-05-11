'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { toggleBookmark } from '@/app/actions/public'

export function BookmarkButton({
  serverId,
  userId,
  initialBookmarked = false,
}: {
  serverId: string
  userId: string
  initialBookmarked?: boolean
}) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked)
  const [isPending, startTransition] = useTransition()

  const handleToggle = () => {
    const next = !bookmarked
    setBookmarked(next) // Optimistic
    startTransition(async () => {
      try {
        const result = await toggleBookmark(userId, serverId)
        if (result.bookmarked !== next) {
          setBookmarked(result.bookmarked) // Revert if mismatch
        }
      } catch {
        setBookmarked(!next) // Revert on error
      }
    })
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      disabled={isPending}
      className="gap-1"
    >
      {bookmarked ? (
        <BookmarkCheck className="h-4 w-4" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
      {bookmarked ? 'В закладках' : 'В закладки'}
    </Button>
  )
}
