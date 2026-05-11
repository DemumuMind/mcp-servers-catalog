'use client'

import { useState, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import DOMPurify from 'isomorphic-dompurify'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react'

interface ReadmePreviewProps {
  content: string
  repoUrl: string
}

export function ReadmePreview({ content, repoUrl }: ReadmePreviewProps) {
  const [expanded, setExpanded] = useState(false)
  const lines = content.split('\n')
  const previewLines = lines.slice(0, 50)
  const isLong = lines.length > 50

  const displayContent = useMemo(() => {
    const raw = expanded ? content : previewLines.join('\n')
    // Sanitize user-generated README content before rendering
    return DOMPurify.sanitize(raw, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'strike', 'del',
        'a', 'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'hr',
        'table', 'thead', 'tbody', 'tr', 'th', 'td', 'div', 'span',
        'sup', 'sub', 'details', 'summary'
      ],
      ALLOWED_ATTR: [
        'href', 'src', 'alt', 'title', 'class', 'id', 'target',
        'rel', 'width', 'height', 'align', 'colspan', 'rowspan',
        'open'
      ],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
    })
  }, [content, expanded])

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            README
          </CardTitle>
          <a
            href={`${repoUrl}#readme`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
          >
            Открыть на GitHub →
          </a>
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose dark:prose-invert max-w-none prose-sm">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
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
              img: ({ src, alt, ...props }: any) => {
                let resolvedSrc = src?.startsWith('http')
                  ? src
                  : `${repoUrl}/raw/main/${src?.replace(/^\.\//, '')}`
                
                // Proxy GitHub images through our endpoint to bypass CORS/hotlink
                if (resolvedSrc?.includes('githubusercontent.com') || resolvedSrc?.includes('camo.githubusercontent.com')) {
                  resolvedSrc = `/api/proxy-image?url=${encodeURIComponent(resolvedSrc)}`
                }
                
                return (
                  <img
                    src={resolvedSrc}
                    alt={alt || ''}
                    className="max-w-full rounded-lg"
                    loading="lazy"
                    onError={(e) => {
                      // Fallback to proxy on error
                      const target = e.target as HTMLImageElement
                      if (!target.src.includes('/api/proxy-image')) {
                        target.src = `/api/proxy-image?url=${encodeURIComponent(src)}`
                      }
                    }}
                    {...props}
                  />
                )
              },
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
                Свернуть
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Показать полностью ({lines.length} строк)
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
