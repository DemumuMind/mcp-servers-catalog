'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslations, useLocale } from 'next-intl'
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
import { CheckCircle, Loader2, Sparkles, Send, ShieldCheck } from 'lucide-react'
import { createSubmission } from '@/app/actions/submissions'
import { fetchRepoFromGitHub } from '@/app/actions/github'
import { checkServerExists } from '@/app/actions/public'
import { EmptyState, PageHero, PageShell } from '@/components/page-components'

function getSubmitSchema(t: (key: string) => string) {
  return z.object({
    name: z.string().min(1, t('validation.nameRequired')),
    description: z.string().min(1, t('validation.descriptionRequired')),
    url: z.string().url(t('validation.urlInvalid')).min(1, t('validation.urlRequired')),
    category: z.string().min(1, t('validation.categoryRequired')),
    tags: z.string(),
    owner: z.string(),
    email: z.string().email(t('validation.emailInvalid')).min(1, t('validation.emailRequired')),
    premium: z.boolean(),
  })
}

type SubmitFormData = z.infer<ReturnType<typeof getSubmitSchema>>

function getCategories(t: (key: string) => string) {
  return [
    { value: 'search', label: t('categories.search') },
    { value: 'web-scraping', label: t('categories.webScraping') },
    { value: 'communication', label: t('categories.communication') },
    { value: 'productivity', label: t('categories.productivity') },
    { value: 'development', label: t('categories.development') },
    { value: 'database', label: t('categories.database') },
    { value: 'cloud-service', label: t('categories.cloudService') },
    { value: 'file-system', label: t('categories.fileSystem') },
    { value: 'cloud-storage', label: t('categories.cloudStorage') },
    { value: 'version-control', label: t('categories.versionControl') },
    { value: 'browser-automation', label: t('categories.browserAutomation') },
    { value: 'ai-ml', label: t('categories.aiMl') },
    { value: 'other', label: t('categories.other') },
  ]
}

/** Map a repo name like "my-cool-server" to "My Cool Server" */
function cleanRepoName(name: string): string {
  return name
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

/** Try to determine category from GitHub topics or language */
function inferCategory(topics: string[], language: string | null): string {
  const categoryValues = [
    'search', 'web-scraping', 'communication', 'productivity', 'development',
    'database', 'cloud-service', 'file-system', 'cloud-storage', 'version-control',
    'browser-automation', 'ai-ml', 'other',
  ]
  for (const topic of topics) {
    const lower = topic.toLowerCase()
    if (categoryValues.includes(lower)) return lower
  }
  for (const topic of topics) {
    const lower = topic.toLowerCase()
    for (const cv of categoryValues) {
      if (lower.includes(cv)) return cv
    }
  }
  const langMap: Record<string, string> = {
    python: 'ai-ml',
    typescript: 'development',
    javascript: 'development',
    go: 'development',
    rust: 'development',
    java: 'development',
    'c++': 'development',
    'c#': 'development',
  }
  if (language) {
    const mapped = langMap[language.toLowerCase()]
    if (mapped) return mapped
  }
  return 'other'
}

export default function SubmitPage() {
  const t = useTranslations('Submit')
    const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [fetchError, setFetchError] = useState('')
  const [duplicateWarning, setDuplicateWarning] = useState<{ inCatalog: boolean; inSubmissions: boolean; serverUrl?: string } | null>(null)

  const submitSchema = getSubmitSchema(t)
  const categories = getCategories(t)

  const form = useForm<SubmitFormData>({
    resolver: zodResolver(submitSchema),
    defaultValues: {
      premium: false,
      tags: '',
      owner: '',
    },
  })

  const onSubmit = async (data: SubmitFormData) => {
    setIsSubmitting(true)
    try {
      const tagsArray = data.tags
        ? data.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : []
      await createSubmission({
        ...data,
        tags: tagsArray as string[],
      })
      setSubmitted(true)
    } catch (err) {
      console.error('Submission error:', err)
      setFetchError(t('errors.submissionFailed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAutoFill = async () => {
    const url = form.getValues('url')
    if (!url) {
      setFetchError(t('errors.enterGitHubUrl'))
      return
    }

    setIsFetching(true)
    setFetchError('')
    setDuplicateWarning(null)

    try {
      const data = await fetchRepoFromGitHub(url)

      if (data.owner && data.repo) {
        const dupCheck = await checkServerExists(data.owner, data.repo)
        if (dupCheck.exists) {
          setDuplicateWarning(dupCheck)
        }
      }

      form.setValue('name', cleanRepoName(data.name))

      if (data.description) form.setValue('description', data.description)

      const category = inferCategory(data.topics || [], data.language || null)
      form.setValue('category', category)

      const tagsStr = (data.topics || []).slice(0, 10).join(', ')
      form.setValue('tags', tagsStr)

      if (data.owner) form.setValue('owner', data.owner)
    } catch (err: any) {
      setFetchError(err.message || t('errors.githubFetchFailed'))
    } finally {
      setIsFetching(false)
    }
  }

  if (submitted) {
    return (
      <PageShell wide={false}>
        <EmptyState
          icon={CheckCircle}
          title={t('success.title')}
          description={t('success.description')}
          className="py-20"
        />
        <div className="mt-6 flex justify-center">
          <Button
            onClick={() => {
              setSubmitted(false)
              form.reset()
            }}
          >
            {t('success.submitAnother')}
          </Button>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell wide={false} className="space-y-8">
      <PageHero
        eyebrow={t('hero.eyebrow')}
        title={t('hero.title')}
        description={t('hero.description')}
      />

      <form onSubmit={form.handleSubmit(onSubmit)} className="premium-panel space-y-6 p-5 sm:p-8">
        <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="submit-name" className="text-sm font-semibold">{t('labels.serverName')}</label>
          <Input id="submit-name" placeholder="Brave Search MCP" {...form.register('name')} />
          {form.formState.errors.name && (
            <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="submit-description" className="text-sm font-semibold">{t('labels.shortDescription')}</label>
          <Textarea id="submit-description" placeholder={t('placeholders.description')} {...form.register('description')} />
          {form.formState.errors.description && (
            <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
          )}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="submit-url" className="text-sm font-semibold">{t('labels.githubUrl')}</label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input id="submit-url" placeholder="https://github.com/owner/repo" {...form.register('url')} className="flex-1" />
            <Button type="button" variant="outline" onClick={handleAutoFill} disabled={isFetching} className="shrink-0">
              {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {t('autoFill')}
            </Button>
          </div>
          {fetchError && <p className="text-sm text-amber-700 dark:text-amber-300">{fetchError}</p>}
          {duplicateWarning && (
            <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3.5">
              <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                {duplicateWarning.inCatalog
                  ? t('duplicate.inCatalog')
                  : t('duplicate.inSubmissions')}
              </p>
              {duplicateWarning.inCatalog && duplicateWarning.serverUrl && (
                <a
                  href={duplicateWarning.serverUrl}
                  className="mt-1 inline-block text-sm text-amber-700 underline dark:text-amber-300"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('duplicate.goToServer')}
                </a>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                {t('duplicate.stillSubmit')}
              </p>
            </div>
          )}
          {form.formState.errors.url && <p className="text-sm text-destructive">{form.formState.errors.url.message}</p>}
          <p className="text-xs text-muted-foreground">{t('urlHint')}</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-semibold">{t('labels.category')}</label>
          <Select onValueChange={(value: string | null) => value && form.setValue('category', value)} value={form.watch('category') || ''}>
            <SelectTrigger id="category" className="w-full">
              <SelectValue placeholder={t('placeholders.selectCategory')} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.category && <p className="text-sm text-destructive">{form.formState.errors.category.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="submit-tags" className="text-sm font-semibold">{t('labels.tags')}</label>
          <Input id="submit-tags" placeholder="mcp, search, api" {...form.register('tags')} />
          {form.formState.errors.tags && <p className="text-sm text-destructive">{form.formState.errors.tags.message}</p>}
          <p className="text-xs text-muted-foreground">{t('placeholders.tagsHint')}</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="submit-owner" className="text-sm font-semibold">{t('labels.owner')}</label>
          <Input id="submit-owner" placeholder="github-owner" {...form.register('owner')} />
          {form.formState.errors.owner && <p className="text-sm text-destructive">{form.formState.errors.owner.message}</p>}
          <p className="text-xs text-muted-foreground">{t('placeholders.ownerHint')}</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="submit-email" className="text-sm font-semibold">{t('labels.contactEmail')}</label>
          <Input id="submit-email" type="email" placeholder="you@example.com" {...form.register('email')} />
          {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
        </div>
        </div>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-5">
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label id="label-submit-premium" className="flex cursor-pointer items-start gap-3">
              <Checkbox aria-labelledby="label-submit-premium" checked={form.watch('premium')} onCheckedChange={(checked) => form.setValue('premium', checked as boolean)} />
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 font-semibold">
                  <ShieldCheck className="size-4 text-primary" />
                  {t('premium.title')} <span className="text-primary">$39</span>
                </div>
                <ul className="ml-4 list-disc space-y-1 text-sm leading-6 text-muted-foreground">
                  <li>{t('premium.fastReview')}</li>
                  <li>{t('premium.badge')}</li>
                  <li>{t('premium.dofollow')}</li>
                </ul>
              </div>
            </label>
          </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          {isSubmitting ? t('submitting') : t('submit')}
        </Button>
      </form>
    </PageShell>
  )
}
