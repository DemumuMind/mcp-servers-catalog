'use client'

import { Button } from '@/components/ui/button'
import { Share2, MessageCircle, Globe, Send } from 'lucide-react'

interface SocialShareProps {
  url: string
  title: string
  description: string
}

export function SocialShareButtons({ url, title, description }: SocialShareProps) {
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)
  const encodedDesc = encodeURIComponent(description)

  const shareLinks = [
    {
      name: 'Twitter / X',
      icon: MessageCircle,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      color: 'bg-black hover:bg-gray-800 text-white',
    },
    {
      name: 'Telegram',
      icon: Send,
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      color: 'bg-sky-500 hover:bg-sky-600 text-white',
    },
    {
      name: 'LinkedIn',
      icon: Globe,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: 'bg-blue-700 hover:bg-blue-800 text-white',
    },
  ]

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground flex items-center gap-1 mr-1">
        <Share2 className="h-4 w-4" />
        Поделиться:
      </span>
      {shareLinks.map((link) => (
        <a
          key={link.name}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${link.color}`}
          title={`Поделиться в ${link.name}`}
        >
          <link.icon className="h-3.5 w-3.5" />
          {link.name}
        </a>
      ))}
    </div>
  )
}
