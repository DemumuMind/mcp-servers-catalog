import type { Metadata } from 'next'
import { getServerBySlug } from '@/app/actions/servers'
import { getServerRating, getServerComments, getRelatedServers, isServerBookmarked } from '@/app/actions/public'
import { getServerReviews } from '@/app/actions/reviews'
import { getServerAuthor } from '@/app/actions/author-analytics'
import { trackServerView } from '@/app/actions/profile'
import { claimServer } from '@/app/actions/author-analytics'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ExternalLink, Star, GitFork } from 'lucide-react'
import { auth } from '@/lib/auth'
import { BookmarkButton } from '@/components/bookmark-button'
import { RatingStars } from '@/components/rating-stars'
import { CommentSection } from '@/components/comment-section'
import { ReviewSection } from '@/components/review-section'
import { ServerCard } from '@/components/server-card'
import { SectionHeader } from '@/components/section-header'
import { OneClickInstall } from '@/components/one-click-install'
import { UsageExamples } from '@/components/usage-examples'
import { HealthHistory } from '@/components/health-history'
import { CopyButton } from '@/components/copy-button'
import { SocialShareButtons } from '@/components/social-share'
import { ReportButton } from '@/components/report-button'
import { fetchServerReadme } from '@/app/actions/readme'
import { ReadmePreview } from '@/components/readme-preview'
import { fetchServerReleases } from '@/app/actions/releases'
import { ReleasesChangelog } from '@/components/releases-changelog'
import { PromoteServer } from '@/components/promote-server'
import { isStripeEnabled } from '@/lib/stripe'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ owner: string; repo: string; locale: string }>
}): Promise<Metadata> {
  const { owner, repo, locale } = await params
  const server = await getServerBySlug(owner, repo)

  if (!server) {
    return { title: 'Server not found' }
  }

  const baseUrl = process.env.SITE_URL || 'https://mcpservers.org'

  return {
    title: `${server.name} — MCP Server`,
    description: server.description,
    openGraph: {
      title: server.name,
      description: server.description,
      type: 'article',
      images: [`${baseUrl}/api/og/${owner}/${repo}`],
    },
    twitter: {
      card: 'summary_large_image',
      title: server.name,
      description: server.description,
      images: [`${baseUrl}/api/og/${owner}/${repo}`],
    },
  }
}

export default async function ServerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ owner: string; repo: string; locale: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { owner, repo, locale } = await params
  const query = await searchParams
  const server = await getServerBySlug(owner, repo)
  const baseUrl = process.env.SITE_URL || 'https://mcpservers.org'
  const serverUrl = `${baseUrl}/${locale}/servers/${owner}/${repo}`

  if (!server) {
    notFound()
  }

  const session = await auth()
  const userId = session?.user?.id
  const userRole = session?.user?.role

  if (userId) {
    trackServerView(userId, server.id)
  }

  const checkoutStatus = query.checkout as string | undefined
  const checkoutTier = query.tier as string | undefined
  const stripeEnabled = isStripeEnabled()

  const rating = await getServerRating(server.id)
  const comments = await getServerComments(server.id)
  const reviews = await getServerReviews(server.id)
  const relatedServers = await getRelatedServers(server.id, server.category, server.tags)
  const author = server.authorId ? await getServerAuthor(server.authorId) : null
  const readmeContent = await fetchServerReadme(owner, repo)
  const releases = await fetchServerReleases(owner, repo)
  const isBookmarked = userId ? await isServerBookmarked(userId, server.id) : false

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: server.name,
    description: server.description,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: rating.count > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: rating.average.toFixed(1),
      ratingCount: rating.count,
    } : undefined,
    codeRepository: server.githubUrl,
    programmingLanguage: 'TypeScript',
    author: author ? {
      '@type': 'Person',
      name: author.name || author.email,
    } : undefined,
    datePublished: server.createdAt.toISOString(),
    dateModified: server.updatedAt.toISOString(),
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {checkoutStatus === 'success' && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm">
          ✅ Оплата прошла успешно!{checkoutTier ? ` Статус «${checkoutTier === 'featured' ? 'Featured' : 'Sponsored'}» активирован на 30 дней.` : ''}
        </div>
      )}
      {checkoutStatus === 'cancel' && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
          ⚠️ Оплата была отменена. Если у вас возникли вопросы, свяжитесь с нами.
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {server.isOfficial && (
            <Badge className="bg-yellow-500">Официальный 🌟</Badge>
          )}
          {server.isSponsored && (
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
              спонсор
            </Badge>
          )}
          {server.featured && server.featuredUntil && (
            <Badge variant="outline" className="text-yellow-600 border-yellow-300">
              Featured до {new Date(server.featuredUntil).toLocaleDateString('ru-RU')}
            </Badge>
          )}
          {userId && <BookmarkButton serverId={server.id} userId={userId} initialBookmarked={isBookmarked} />}
          {userId && !server.authorId && (
            <form
              action={async () => {
                'use server'
                await claimServer(server.id, userId)
              }}
            >
              <Button type="submit" variant="outline" size="sm">
                Я автор
              </Button>
            </form>
          )}
          {stripeEnabled && userId && (userRole === 'admin' || server.authorId === userId) && (
            <PromoteServer
              serverId={server.id}
              featured={server.featured}
              featuredUntil={server.featuredUntil}
              isSponsored={server.isSponsored}
              sponsoredUntil={server.sponsoredUntil}
            />
          )}
        </div>
        <h1 className="text-3xl font-bold mb-2">{server.name}</h1>
        <p className="text-muted-foreground">{server.description}</p>
        
        {(!!server.stars || !!server.forks || !!author) && (
          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            {!!server.stars && (
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                {server.stars.toLocaleString()} stars
              </span>
            )}
            {!!server.forks && (
              <span className="flex items-center gap-1">
                <GitFork className="h-4 w-4" />
                {server.forks.toLocaleString()} forks
              </span>
            )}
            {author && (
              <span className="flex items-center gap-1">
                <span className="text-muted-foreground">Автор:</span>
                <span className="font-medium text-foreground">{author.name || author.email}</span>
                {author.isVerifiedAuthor && (
                  <Badge className="bg-green-500 text-white text-[10px] px-1.5 py-0 h-4">
                    ✓ Подтверждён
                  </Badge>
                )}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-5 w-5 ${
                star <= Math.round(rating.average)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-muted-foreground">
          {rating.average.toFixed(1)} ({rating.count} оценок)
        </span>
        {userId && (
          <RatingStars serverId={server.id} userId={userId} />
        )}
        <ReportButton
          targetType="server"
          targetId={server.id}
          targetName={server.name}
        />
      </div>

      <div className="mb-4">
        <SocialShareButtons
          url={serverUrl}
          title={server.name}
          description={server.description}
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {server.tags.map((tag) => (
          <Badge key={tag} variant="outline">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="font-semibold mb-1">GitHub</h2>
          <a
            href={server.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline flex items-center gap-1"
          >
            {server.githubUrl}
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        {server.isRemote && (
          <>
            <div>
              <h2 className="font-semibold mb-1">Endpoint</h2>
              <code className="bg-muted px-2 py-1 rounded">{server.endpoint}</code>
            </div>
            <div>
              <h2 className="font-semibold mb-1">Auth Type</h2>
              <Badge>{server.authType}</Badge>
            </div>
          </>
        )}

        <div>
          <h2 className="font-semibold mb-1">Category</h2>
          <Badge variant="secondary">{server.category}</Badge>
        </div>
      </div>

      {/* Health History */}
      <div className="mt-6">
        <HealthHistory serverId={server.id} isRemote={server.isRemote} />
      </div>

      <div className="mt-8 flex gap-3">
        <a
          href={server.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants())}
        >
          View on GitHub
        </a>
        <OneClickInstall server={{
          owner: server.owner,
          repo: server.repo,
          name: server.name,
          isRemote: server.isRemote,
          endpoint: server.endpoint,
        }} />
        <CopyButton
          text={`npx -y @${server.owner}/${server.repo}`}
          label="npx"
          size="sm"
          variant="outline"
        />
      </div>

      {/* Usage Examples */}
      <div className="mt-12">
        <UsageExamples
          owner={server.owner}
          repo={server.repo}
          name={server.name}
          isRemote={server.isRemote}
          endpoint={server.endpoint}
        />
      </div>

      {/* Releases Changelog */}
      <div className="mt-12">
        <ReleasesChangelog releases={releases} repoUrl={server.githubUrl} />
      </div>

      {/* README Preview */}
      {readmeContent && (
        <div className="mt-12">
          <ReadmePreview content={readmeContent} repoUrl={server.githubUrl} />
        </div>
      )}

      {/* Reviews */}
      <div className="mt-12">
        <ReviewSection
          serverId={server.id}
          userId={userId}
          initialReviews={reviews as any}
        />
      </div>

      {/* Comments */}
      <div className="mt-12">
        <CommentSection
          serverId={server.id}
          userId={userId}
          initialComments={comments}
        />
      </div>

      {/* Related Servers */}
      {relatedServers.length > 0 && (
        <div className="mt-12">
          <SectionHeader title="Похожие серверы" href={`/${locale}/all?category=${encodeURIComponent(server.category)}`} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relatedServers.map((s) => (
              <ServerCard key={s.id} server={s} locale={locale} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
