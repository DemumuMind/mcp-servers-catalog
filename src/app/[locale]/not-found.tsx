import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 px-4">
      <h2 className="text-4xl font-bold">404</h2>
      <p className="text-muted-foreground text-center">
        Страница не найдена
      </p>
      <Link href="/ru">
        <Button>Вернуться на главную</Button>
      </Link>
    </div>
  )
}
