export default function Loading() {
  return (
    <div className="page-shell space-y-8">
      <div className="premium-panel p-8 text-center space-y-4">
        <div className="mx-auto h-12 w-72 animate-pulse rounded-2xl bg-muted" />
        <div className="mx-auto h-6 w-96 max-w-full animate-pulse rounded-2xl bg-muted" />
        <div className="mx-auto h-12 w-full max-w-xl animate-pulse rounded-3xl bg-muted" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="premium-panel space-y-4 p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-2xl bg-muted" />
              <div className="h-5 w-40 animate-pulse rounded-xl bg-muted" />
            </div>
            <div className="h-4 w-full animate-pulse rounded-xl bg-muted" />
            <div className="h-4 w-3/4 animate-pulse rounded-xl bg-muted" />
            <div className="flex gap-2">
              <div className="h-6 w-20 animate-pulse rounded-xl bg-muted" />
              <div className="h-6 w-24 animate-pulse rounded-xl bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
