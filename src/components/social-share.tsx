'use client'

import { Share2, MessageCircle, Globe, Send } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface SocialShareProps {
  url: string
  title: string
  description: string
}

export function SocialShareButtons({ url, title, description }: SocialShareProps) {
  const t = useTranslations('Share')
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)
  const _encodedDesc = encodeURIComponent(description)

  const TWITTER_SHARE = process.env.NEXT_PUBLIC_TWITTER_SHARE_URL || 'https://twitter.com/intent/tweet'
  const TELEGRAM_SHARE = process.env.NEXT_PUBLIC_TELEGRAM_SHARE_URL || 'https://t.me/share/url'
  const LINKEDIN_SHARE = process.env.NEXT_PUBLIC_LINKEDIN_SHARE_URL || 'https://www.linkedin.com/sharing/share-offsite/'

  const shareLinks = [
    {
      name: 'Twitter / X',
      icon: MessageCircle,
      href: `${TWITTER_SHARE}?url=${encodedUrl}&text=${encodedTitle}`,
      color: 'bg-black hover:bg-gray-800 text-white',
    },
    {
      name: 'Telegram',
      icon: Send,
      href: `${TELEGRAM_SHARE}?url=${encodedUrl}&text=${encodedTitle}`,
      color: 'bg-sky-500 hover:bg-sky-600 text-white',
    },
    {
      name: 'LinkedIn',
      icon: Globe,
      href: `${LINKEDIN_SHARE}?url=${encodedUrl}`,
      color: 'bg-blue-700 hover:bg-blue-800 text-white',
    },
  ]

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground flex items-center gap-1 mr-1">
        <Share2 className="h-4 w-4" />
        {t('label')}
      </span>
      {shareLinks.map((link) => (
        <a
          key={link.name}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${link.color}`}
          title={t('shareIn', { name: link.name })}
        >
          <link.icon className="h-3.5 w-3.5" />
          {link.name}
        </a>
      ))}
    </div>
  )
}
