import { getServerBySlug } from '@/app/actions/servers'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ExternalLink } from 'lucide-react'

export default async function ServerDetailPage({
  params,
}: {
  params: Promise<{ owner: string; repo: string; locale: string }>
}) {
  const { owner, repo } = await params
  const server = await getServerBySlug(owner, repo)

  if (!server) {
    notFound()
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          {server.isOfficial && (
            <Badge className="bg-yellow-500">Официальный 🌟</Badge>
          )}
          {server.isSponsored && <Badge variant="secondary">спонсор</Badge>}
        </div>
        <h1 className="text-3xl font-bold mb-2">{server.name}</h1>
        <p className="text-muted-foreground">{server.description}</p>
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

      <div className="mt-8">
        <a
          href={server.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants())}
        >
          View on GitHub
        </a>
      </div>
    </div>
  )
}
