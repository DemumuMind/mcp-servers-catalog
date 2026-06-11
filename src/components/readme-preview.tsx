'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeHighlight from 'rehype-highlight'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react'

interface ReadmePreviewProps {
  content: string
  repoUrl: string
}

function MarkdownImage({ src, alt, repoUrl }: { src?: string; alt?: string; repoUrl: string }) {
  let resolvedSrc = src?.startsWith('http')
    ? src
    : `${repoUrl}/raw/main/${src?.replace(/^\.\//, '')}`

  // Proxy GitHub images through our endpoint to bypass CORS/hotlink
  if (resolvedSrc?.includes('githubusercontent.com') || resolvedSrc?.includes('camo.githubusercontent.com')) {
    resolvedSrc = `/api/proxy-image?url=${encodeURIComponent(resolvedSrc)}`
  }

  // Badge-like images (shields.io, etc.) — render small & inline
  const isBadge = /shields\.io|badge|badge\.svg/i.test(resolvedSrc ?? '')

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolvedSrc}
      alt={alt || ''}
      className={isBadge ? 'inline-block h-5 align-middle' : 'max-w-full rounded-lg'}
      style={isBadge ? undefined : { height: 'auto' }}
      loading="lazy"
    />
  )
}

export function ReadmePreview({ content, repoUrl }: ReadmePreviewProps) {
  const t = useTranslations('Readme')
  const [expanded, setExpanded] = useState(false)
  const lines = content.split('\n')
  const previewLines = lines.slice(0, 80)
  const isLong = lines.length > 80

  const displayContent = useMemo(() => {
    return expanded ? content : previewLines.join('\n')
  }, [content, expanded, previewLines])

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            {t('readme')}
          </CardTitle>
          <a
            href={`${repoUrl}#readme`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
          >
            {t('openGithub')}
          </a>
        </div>
      </CardHeader>
      <CardContent>
        <div className="markdown-body max-w-none text-sm">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeHighlight]}
            components={{
              a: ({ href, children, ...props }: any) => {
                const isExternal = href?.startsWith('http') && !href?.includes('github.com')
                const resolvedHref = href?.startsWith('http')
                  ? href
                  : `${repoUrl}/blob/main/${href?.replace(/^\.\//, '')}`
                return (
                  <a
                    href={resolvedHref}
                    target={isExternal ? '_blank' : undefined}
                    rel={isExternal ? 'noopener noreferrer' : undefined}
                    className="text-primary hover:underline"
                    {...props}
                  >
                    {children}
                  </a>
                )
              },
              img: ({ src, alt }: any) => (
                <MarkdownImage src={src} alt={alt} repoUrl={repoUrl} />
              ),
              table: ({ children }: any) => (
                <div className="overflow-x-auto my-4">
                  <table className="w-full border-collapse border border-border text-sm">
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children }: any) => (
                <thead className="bg-muted/50">{children}</thead>
              ),
              th: ({ children, ...props }: any) => (
                <th className="border border-border px-3 py-2 text-left font-semibold" {...props}>
                  {children}
                </th>
              ),
              td: ({ children, ...props }: any) => (
                <td className="border border-border px-3 py-2" {...props}>
                  {children}
                </td>
              ),
              tr: ({ children }: any) => (
                <tr className="hover:bg-muted/30 transition-colors">{children}</tr>
              ),
              pre: ({ children }: any) => (
                <pre className="overflow-x-auto rounded-lg bg-muted/70 border border-border/60 p-4 text-sm my-4">
                  {children}
                </pre>
              ),
              code: ({ className, children, ...props }: any) => {
                // Inline code (no language class) vs block code
                const isInline = !className
                if (isInline) {
                  return (
                    <code className="rounded bg-muted/70 px-1.5 py-0.5 text-xs font-mono" {...props}>
                      {children}
                    </code>
                  )
                }
                return (
                  <code className={`${className ?? ''} text-sm font-mono`} {...props}>
                    {children}
                  </code>
                )
              },
              blockquote: ({ children }: any) => (
                <blockquote className="border-l-4 border-primary/30 pl-4 my-4 text-muted-foreground italic">
                  {children}
                </blockquote>
              ),
              hr: () => (
                <hr className="border-border my-6" />
              ),
              h1: ({ children }: any) => (
                <h1 className="text-2xl font-bold mt-6 mb-3 pb-2 border-b border-border">{children}</h1>
              ),
              h2: ({ children }: any) => (
                <h2 className="text-xl font-semibold mt-5 mb-2 pb-1 border-b border-border/50">{children}</h2>
              ),
              h3: ({ children }: any) => (
                <h3 className="text-lg font-semibold mt-4 mb-2">{children}</h3>
              ),
              h4: ({ children }: any) => (
                <h4 className="text-base font-semibold mt-3 mb-1">{children}</h4>
              ),
              ul: ({ children }: any) => (
                <ul className="list-disc pl-6 my-2 space-y-1">{children}</ul>
              ),
              ol: ({ children }: any) => (
                <ol className="list-decimal pl-6 my-2 space-y-1">{children}</ol>
              ),
              li: ({ children }: any) => (
                <li className="leading-relaxed">{children}</li>
              ),
              p: ({ children }: any) => (
                <p className="my-2 leading-relaxed">{children}</p>
              ),
            }}
          >
            {displayContent}
          </ReactMarkdown>
        </div>

        {isLong && (
          <Button
            variant="ghost"
            className="w-full mt-4 gap-2"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                {t('collapse')}
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                {t('showFull', { lineCount: lines.length })}
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
