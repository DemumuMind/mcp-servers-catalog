'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'

const submitSchema = z.object({
  name: z.string().min(1, 'Введите название сервера'),
  description: z.string().min(1, 'Введите описание'),
  url: z.string().url('Введите корректный URL').min(1, 'Введите ссылку'),
  category: z.string().min(1, 'Выберите категорию'),
  email: z.string().email('Введите корректный email').min(1, 'Введите email'),
  premium: z.boolean(),
})

type SubmitFormData = z.infer<typeof submitSchema>

const categories = [
  { value: 'search', label: 'Поиск' },
  { value: 'web-scraping', label: 'Веб-скрейпинг' },
  { value: 'communication', label: 'Коммуникация' },
  { value: 'productivity', label: 'Продуктивность' },
  { value: 'development', label: 'Разработка' },
  { value: 'database', label: 'База данных' },
  { value: 'cloud-service', label: 'Облачный сервис' },
  { value: 'file-system', label: 'Файловая система' },
  { value: 'cloud-storage', label: 'Облачное хранилище' },
  { value: 'version-control', label: 'Контроль версий' },
  { value: 'browser-automation', label: 'Браузерная автоматизация' },
  { value: 'ai-ml', label: 'AI / ML' },
  { value: 'other', label: 'Другое' },
]

export default function SubmitPage() {
  const [submitted, setSubmitted] = useState(false)
  const form = useForm<SubmitFormData>({
    resolver: zodResolver(submitSchema),
    defaultValues: {
      premium: false,
    },
  })

  const onSubmit = async (data: SubmitFormData) => {
    // In a real app, this would send to an API endpoint
    console.log('Submission:', data)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-4">Спасибо за отправку!</h1>
        <p className="text-muted-foreground text-lg">
          Ваш MCP-сервер отправлен на рассмотрение. Мы проверим его и добавим в каталог.
        </p>
        <Button
          className="mt-8"
          onClick={() => {
            setSubmitted(false)
            form.reset()
          }}
        >
          Отправить ещё один
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Отправьте свой MCP-сервер</h1>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Название сервера</label>
          <Input
            placeholder="e.g., Brave Search"
            {...form.register('name')}
          />
          {form.formState.errors.name && (
            <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Краткое описание</label>
          <Textarea
            placeholder="One sentence about your server"
            {...form.register('description')}
          />
          {form.formState.errors.description && (
            <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Ссылка (GitHub или документация)</label>
          <Input
            placeholder="https://github.com/owner/repo"
            {...form.register('url')}
          />
          {form.formState.errors.url && (
            <p className="text-sm text-red-500">{form.formState.errors.url.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Категория</label>
          <Select
            onValueChange={(value: string | null) => {
              if (value) form.setValue('category', value)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Выберите категорию" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.category && (
            <p className="text-sm text-red-500">{form.formState.errors.category.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Контактный email</label>
          <Input
            type="email"
            placeholder="you@example.com"
            {...form.register('email')}
          />
          {form.formState.errors.email && (
            <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
          )}
        </div>

        <p className="text-sm text-muted-foreground py-2">
          Размещение на mcpservers.org бесплатно. Вы можете дополнительно перейти на Premium-отправку ниже.
        </p>

        <Card>
          <CardContent className="pt-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={form.watch('premium')}
                onCheckedChange={(checked) => form.setValue('premium', checked as boolean)}
              />
              <div className="space-y-1">
                <div className="font-medium">
                  Premium-отправка <span className="text-primary">$39</span> разовая плата за проверку
                </div>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>Пропустите ожидание. Более быстрое одобрение.</li>
                  <li>Официальный значок на вашем листинге MCP.</li>
                  <li>Dofollow-ссылка.</li>
                </ul>
              </div>
            </label>
          </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full sm:w-auto">
          Отправить
        </Button>
      </form>
    </div>
  )
}
