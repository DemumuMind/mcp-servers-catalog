import type { Metadata } from 'next'
import { getServerBySlug } from '@/app/actions/servers'
import { getServerRating, getServerComments, getRelatedServers, isServerBookmarked } from '@/app/actions/public'
import { getServerReviews } from '@/app/actions/reviews'
import { getServerAuthor, claimServer } from "@/app/actions/author-analytics";
import { trackServerView } from '@/app/actions/profile'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button-variants'
import { cn } from '@/lib/utils'
import { ExternalLink, Star, GitFork, GitBranch, RadioTower, FolderTree, UserRoundCheck } from 'lucide-react'
import { auth } from '@/lib/auth'
import { BookmarkButton } from '@/components/bookmark-button'
import { RatingStars } from '@/components/rating-stars'
import { CommentSection } from '@/components/comment-section'
import { ReviewSection, type Review } from '@/components/review-section'
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
import { PageShell } from '@/components/page-components'
import { ServerHealthBadge } from '@/components/server-health-badge'
import { getTranslations } from 'next-intl/server'
import { generateServerJsonLd, generateBreadcrumbJsonLd } from '@/lib/json-ld'

const SITE_URL = process.env.SITE_URL || 'https://mcpservers.org'


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

  const ogImageUrl = `${SITE_URL}/api/og/${owner}/${repo}`
  const canonicalUrl = `${SITE_URL}/en/servers/${owner}/${repo}`

  return {
    title: `${server.name} — MCP Server`,
    description: server.description,
    keywords: [server.category, ...server.tags, 'MCP', 'Model Context Protocol'],
    openGraph: {
      title: `${server.name} — MCP Server`,
      description: server.description,
      type: 'article',
      url: `${SITE_URL}/${locale}/servers/${owner}/${repo}`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: server.name,
        },
      ],
      publishedTime: server.createdAt.toISOString(),
      modifiedTime: server.updatedAt.toISOString(),
      tags: server.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${server.name} — MCP Server`,
      description: server.description,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${SITE_URL}/en/servers/${owner}/${repo}`,
        ru: `${SITE_URL}/ru/servers/${owner}/${repo}`,
      },
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
  const serverUrl = `${SITE_URL}/${locale}/servers/${owner}/${repo}`

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
  const t = await getTranslations({ locale, namespace: 'ServerDetail' })

  // Structured data using JSON-LD helpers
  const serverJsonLd = generateServerJsonLd({
    name: server.name,
    description: server.description,
    owner: server.owner,
    repo: server.repo,
    githubUrl: server.githubUrl,
    stars: server.stars,
    forks: server.forks,
    tags: server.tags as string[] | null,
    category: server.category,
    isRemote: server.isRemote,
    endpoint: server.endpoint,
    createdAt: server.createdAt,
    updatedAt: server.updatedAt,
    ratingAverage: rating.average != null ? Number(rating.average) : null,
    ratingCount: rating.count,
    authorName: author?.name ?? null,
  })

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: `${SITE_URL}/${locale}` },
    { name: 'Servers', url: `${SITE_URL}/${locale}/servers` },
    { name: server.name, url: `${SITE_URL}/${locale}/servers/${owner}/${repo}` },
  ])

  return (
    <PageShell className="space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serverJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {checkoutStatus === 'success' && (
        <div className="rounded-2xl border border-green-500/25 bg-green-500/10 p-4 text-sm font-medium text-green-800 dark:text-green-200">
          {t('checkoutSuccess')} {checkoutTier ? t('checkoutTierActivated', { tier: checkoutTier === 'featured' ? t('tierFeatured') : t('tierSponsored') }) : ''}
        </div>
      )}
      {checkoutStatus === 'cancel' && (
        <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 text-sm font-medium text-amber-800 dark:text-amber-200">
          {t('checkoutCancel')}
        </div>
      )}

      <section className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card/76 p-6 shadow-[var(--shadow-premium)] backdrop-blur-xl lg:p-8">
        <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-primary/14 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              {server.isOfficial && <Badge><UserRoundCheck className="size-3" /> {t('badgeOfficial')}</Badge>}
              {server.isSponsored && <Badge className="bg-amber-500 text-white dark:bg-amber-400 dark:text-amber-950">{t('badgeSponsor')}</Badge>}
              {server.featured && server.featuredUntil && (
                <Badge variant="outline" className="text-primary">
                  {t('featuredUntil')} {new Date(server.featuredUntil).toLocaleDateString(locale === 'en' ? 'en-US' : 'ru-RU')}
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
                    {t('claimAuthor')}
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

            <p className="eyebrow mb-3">{server.owner}/{server.repo}</p>
            <h1 className="font-heading text-4xl font-semibold leading-[1.02] tracking-[-0.06em] sm:text-5xl lg:text-6xl">
              {server.name}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
              {server.description}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {!!server.stars && (
                <span className="inline-flex items-center gap-2 rounded-2xl bg-muted/62 px-3 py-2 font-mono" data-numeric>
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  {server.stars.toLocaleString()} {t('starsLabel')}
                </span>
              )}
              {!!server.forks && (
                <span className="inline-flex items-center gap-2 rounded-2xl bg-muted/62 px-3 py-2 font-mono" data-numeric>
                  <GitFork className="h-4 w-4" />
                  {server.forks.toLocaleString()} {t('forksLabel')}
                </span>
              )}
              {author && (
                <span className="inline-flex items-center gap-2 rounded-2xl bg-muted/62 px-3 py-2">
                  <span className="text-muted-foreground">{t('authorLabel')}</span>
                  <span className="font-semibold text-foreground">{author.name || author.email}</span>
                  {author.isVerifiedAuthor && <Badge className="h-5 bg-green-600 text-white">✓</Badge>}
                </span>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {server.tags.map((tag: any) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t('quickStart')}</span>
              <code className="rounded-xl bg-muted/70 px-3 py-2 font-mono text-xs">
                npx -y @{server.owner}/{server.repo}
              </code>
              <CopyButton
                text={`npx -y @${server.owner}/${server.repo}`}
                label="Copy"
                size="sm"
                variant="outline"
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              {server.isRemote && (
                <>
                  <span className="inline-flex items-center gap-2 rounded-2xl bg-primary/10 px-3 py-2 text-sm">
                    <RadioTower className="size-4 text-primary" />
                    {t('remoteEndpoint')}
                  </span>
                  <ServerHealthBadge serverId={server.id} />
                </>
              )}
              {server.isOfficial && (
                <span className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">
                  <UserRoundCheck className="size-4" />
                  {t('verifiedPublisher')}
                </span>
              )}
            </div>
          </div>

          <aside className="premium-panel h-fit p-5 lg:sticky lg:top-24">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-muted-foreground">{t('communityRating')}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= Math.round(Number(rating.average))
                            ? 'fill-primary text-primary'
                            : 'text-muted-foreground/35'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-mono text-sm text-muted-foreground" data-numeric>
                    {Number(rating.average as string | number).toFixed(1)} ({rating.count})
                  </span>
                </div>
                {userId && <div className="mt-3"><RatingStars serverId={server.id} userId={userId} /></div>}
              </div>

              <div className="grid gap-2 border-t border-border/60 pt-4">
                <a
                  href={server.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonVariants({ size: 'lg' }), 'w-full')}
                >
                  <GitBranch className="size-4" />
                  {t('viewOnGitHub')}
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

              <div className="space-y-3 border-t border-border/60 pt-4 text-sm">
                <div className="flex items-start gap-3">
                  <GitBranch className="mt-0.5 size-4 text-primary" />
                  <a href={server.githubUrl} target="_blank" rel="noopener noreferrer" className="min-w-0 break-all text-primary hover:underline">
                    {server.githubUrl}
                    <ExternalLink className="ml-1 inline size-3.5" />
                  </a>
                </div>
                {server.isRemote && (
                  <div className="flex items-start gap-3">
                    <RadioTower className="mt-0.5 size-4 text-primary" />
                    <code className="min-w-0 break-all rounded-xl bg-muted/70 px-2 py-1 font-mono text-xs">{server.endpoint}</code>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <FolderTree className="size-4 text-primary" />
                  <Badge variant="secondary">{server.category}</Badge>
                  {server.isRemote && <Badge>{server.authType}</Badge>}
                </div>
              </div>

              <div className="border-t border-border/60 pt-4">
                <SocialShareButtons url={serverUrl} title={server.name} description={server.description} />
                <div className="mt-3"><ReportButton targetType="server" targetId={server.id} targetName={server.name} /></div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {server.isRemote && (
        <section className="premium-panel p-5 sm:p-6">
          <HealthHistory serverId={server.id} isRemote={server.isRemote} />
        </section>
      )}

      <section className="premium-panel p-5 sm:p-6">
        <UsageExamples owner={server.owner} repo={server.repo} name={server.name} isRemote={server.isRemote} endpoint={server.endpoint} />
      </section>

      {releases.length > 0 && (
        <section className="premium-panel p-5 sm:p-6">
          <ReleasesChangelog releases={releases} repoUrl={server.githubUrl} />
        </section>
      )}

      {readmeContent && (
        <section className="premium-panel p-5 sm:p-6">
          <ReadmePreview content={readmeContent} repoUrl={server.githubUrl} />
        </section>
      )}

      <section className="premium-panel p-5 sm:p-6">
        <ReviewSection serverId={server.id} userId={userId} initialReviews={reviews as Review[]} />
      </section>

      <section className="premium-panel p-5 sm:p-6">
        <CommentSection serverId={server.id} userId={userId} initialComments={comments} />
      </section>

      {relatedServers.length > 0 && (
        <section>
          <SectionHeader title={t('relatedServers')} href={`/${locale}/all?category=${encodeURIComponent(server.category)}`} locale={locale} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:gap-5">
            {relatedServers.map((s: any) => (
              <ServerCard key={`related-${s.id}`} server={s} locale={locale} />
            ))}
          </div>
        </section>
      )}
    </PageShell>
  )
}

