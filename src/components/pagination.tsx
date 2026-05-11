'use client'

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
  searchParams: Record<string, string | undefined>
}

export function Pagination({ currentPage, totalPages, baseUrl, searchParams }: PaginationProps) {
  const buildUrl = (page: number) => {
    const params = new URLSearchParams()
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && key !== 'page') {
        params.set(key, value)
      }
    })
    if (page > 1) {
      params.set('page', String(page))
    }
    const query = params.toString()
    return `${baseUrl}${query ? `?${query}` : ''}`
  }

  const pages: (number | string)[] = []
  const maxVisible = 5

  if (totalPages <= maxVisible + 2) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage > 3) pages.push('...')
    
    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)
    
    for (let i = start; i <= end; i++) pages.push(i)
    
    if (currentPage < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  return (
    <div className="flex justify-center items-center gap-2">
      {currentPage > 1 && (
        <a
          href={buildUrl(currentPage - 1)}
          className="px-3 py-1 rounded border hover:bg-muted text-sm"
        >
          ← Назад
        </a>
      )}

      {pages.map((page, i) => (
        <span key={i}>
          {page === '...' ? (
            <span className="px-2 text-muted-foreground">...</span>
          ) : (
            <a
              href={buildUrl(page as number)}
              className={`px-3 py-1 rounded border text-sm ${
                currentPage === page
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
            >
              {page}
            </a>
          )}
        </span>
      ))}

      {currentPage < totalPages && (
        <a
          href={buildUrl(currentPage + 1)}
          className="px-3 py-1 rounded border hover:bg-muted text-sm"
        >
          Вперёд →
        </a>
      )}
    </div>
  )
}
