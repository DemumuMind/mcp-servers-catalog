'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 px-4">
      <h2 className="text-2xl font-bold">Что-то пошло не так</h2>
      <p className="text-muted-foreground text-center max-w-md">
        Произошла ошибка при загрузке страницы. Попробуйте обновить или вернуться на главную.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset}>Попробовать снова</Button>
        <Button variant="outline" onClick={() => window.location.href = '/ru'}>
          На главную
        </Button>
      </div>
    </div>
  )
}
