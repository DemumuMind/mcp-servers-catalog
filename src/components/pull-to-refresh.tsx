'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export function PullToRefresh() {
  const [pullDistance, setPullDistance] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const threshold = 80

  useEffect(() => {
    setMounted(true)
    setIsMobile(window.innerWidth <= 768)
    
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (window.scrollY === 0) {
      setPullDistance(0)
    }
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (window.scrollY === 0 && e.touches[0].clientY > 0) {
      const distance = Math.min(e.touches[0].clientY / 2, threshold + 20)
      setPullDistance(distance)
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (pullDistance > threshold && !refreshing) {
      setRefreshing(true)
      router.refresh()
      setTimeout(() => {
        setRefreshing(false)
        setPullDistance(0)
      }, 1000)
    } else {
      setPullDistance(0)
    }
  }, [pullDistance, refreshing, router])

  useEffect(() => {
    if (!isMobile) return

    window.addEventListener('touchstart', handleTouchStart)
    window.addEventListener('touchmove', handleTouchMove)
    window.addEventListener('touchend', handleTouchEnd)

    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, isMobile])

  // Don't render on server / before mount to avoid hydration mismatch
  if (!mounted || !isMobile) return null

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center transition-transform duration-200 pointer-events-none"
      style={{
        transform: `translateY(${Math.max(0, pullDistance - 40)}px)`,
        opacity: pullDistance > 20 ? 1 : 0,
      }}
    >
      <div className="bg-background border rounded-full px-4 py-2 shadow-sm flex items-center gap-2">
        {refreshing ? (
          <>
            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Обновление...</span>
          </>
        ) : (
          <>
            <div
              className="h-4 w-4 border-2 border-muted-foreground border-t-primary rounded-full transition-transform"
              style={{ transform: `rotate(${pullDistance * 3}deg)` }}
            />
            <span className="text-sm text-muted-foreground">
              {pullDistance > threshold ? 'Отпустите для обновления' : 'Потяните для обновления'}
            </span>
          </>
        )}
      </div>
    </div>
  )
}
