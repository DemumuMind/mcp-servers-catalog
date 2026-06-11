import Image from 'next/image'
import { cn } from '@/lib/utils'
import { BRAND_NAME, BRAND_SUBTITLE, brandMarkSvg } from '@/lib/brand-svg'

type BrandMarkProps = {
  size?: number
  className?: string
}

export function BrandMark({ size = 40, className }: BrandMarkProps) {
  const svgDataUri = `data:image/svg+xml,${encodeURIComponent(brandMarkSvg(size))}`
  return (
    <Image
      src={svgDataUri}
      alt="MCP Servers"
      width={size}
      height={size}
      className={cn('shrink-0 overflow-visible', className)}
    />
  )
}

export function BrandLockup({
  className,
  markSize = 42,
  title = BRAND_NAME,
  subtitle = BRAND_SUBTITLE,
}: {
  className?: string
  markSize?: number
  title?: string
  subtitle?: string
}) {
  return (
    <span className={cn('inline-flex items-center gap-3.5', className)}>
      <BrandMark size={markSize} />
      <span className="flex flex-col leading-none">
        <span className="font-heading text-lg font-semibold tracking-[-0.06em] text-foreground">{title}</span>
        <span className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.26em] text-muted-foreground">{subtitle}</span>
      </span>
    </span>
  )
}
